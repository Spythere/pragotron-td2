<template>
  <div class="pragotron" ref="pragotron">
    <div class="pragotron_content">
      <div class="filters">
        <div>
          <label>
            <input type="checkbox" v-model="includeNonPassenger" />
            Relacje niepasażerskie
          </label>
          <label>
            <input type="checkbox" v-model="includeArrivals" />
            Relacje kończące bieg
          </label>
        </div>
        <div>
          <label for="checkpoint">
            Posterunek:
            <select id="checkpoint" v-model="selectedCheckpointName">
              <option v-for="cp in selectedStation?.stationCheckpoints" :value="cp">{{ cp }}</option>
            </select>
          </label>
        </div>
      </div>
      <div class="wrapper">
        <div class="top-pane">
          <span class="title">
            <div>{{ selectedCheckpointName.toUpperCase() }}</div>
          </span>
          <div class="headers">
            <span>GODZ.</span>
            <span>POCIĄG</span>
            <span>PRZEZ</span>
            <span>DO STACJI</span>
            <span>OPÓŹNIONY</span>
          </div>
        </div>
        <div class="table">
          <div class="row" v-for="(departure, i) in filledTable" :key="i">
            <div class="row-content">
              <span class="departure-date">
                <transition name="slot-anim" mode="out-in">
                  <span class="slider-slot-digit" :key="departure.tableValues.dateDigits[0]">{{
                    departure.tableValues.dateDigits[0]
                  }}</span>
                </transition>
                <transition name="slot-anim" mode="out-in">
                  <span class="slider-slot-digit" :key="departure.tableValues.dateDigits[1]">
                    {{ departure.tableValues.dateDigits[1] }}</span
                  >
                </transition>
                <span :key="departure.tableValues.dateDigits[1]"> : </span>
                <transition name="slot-anim" mode="out-in">
                  <span class="slider-slot-digit" :key="departure.tableValues.dateDigits[2]">
                    {{ departure.tableValues.dateDigits[2] }}
                  </span>
                </transition>
                <transition name="slot-anim" mode="out-in">
                  <span class="slider-slot-digit" :key="departure.tableValues.dateDigits[3]">
                    {{ departure.tableValues.dateDigits[3] }}
                  </span>
                </transition>
              </span>
              <span class="train-class">
                <transition name="slot-anim" mode="out-in">
                  <div class="slider-slot" :key="departure.trainNumber">{{ departure.trainNumber }}</div>
                </transition>
              </span>
              <span class="route-via">
                <transition name="slot-anim" mode="out-in">
                  <div class="slider-slot" :key="departure.tableValues.routeVia">
                    {{ abbrevStationName(departure.tableValues.routeVia) }}
                  </div>
                </transition>
              </span>
              <span class="route-to">
                <transition name="slot-anim" mode="out-in">
                  <div class="slider-slot" :key="departure.tableValues.routeTo">
                    {{ abbrevStationName(departure.tableValues.routeTo) }}
                  </div>
                </transition>
              </span>
              <span class="delay">
                <transition name="slot-anim" mode="out-in">
                  <div class="slider-slot" :key="departure.delayMinutes">
                    {{ departure.delayMinutes > 0 ? departure.delayMinutes + ' min' : '' }}
                  </div>
                </transition>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import stationAbbrevsJSON from '../data/stationAbbrevs.json';
import routeValues from '../data/routeValues.json';

import { ITimetableStop, ITrainResponse } from '../types/ITrainResponse';
import { ITableRow } from '../types/ITableRow';
import { ISceneryResponse } from '../types/ISceneryReponse';
import ISceneryData from '../types/ISceneryData';

const stationAbbrevs: { [key: string]: string } = stationAbbrevsJSON;

const departureInfoEmptyObj: ITableRow = {
  timetableId: -1,

  routeTo: '',
  routeVia: '',

  trainNumber: '',

  date: new Date(0),
  dateDigits: ['', '', '', ''],

  arrivalTimestamp: 0,
  departureTimestamp: 0,
  checkpointName: '',

  delayMinutes: 0,

  tableValues: {
    routeTo: '',
    routeVia: '',

    currentRowIndexes: [0, 0, 0, 0, 0, 0],

    dateDigits: ['', '', '', ''],
  },
};

export default defineComponent({
  props: {
    stationName: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    currentStationName: '',
    sceneriesInfo: [] as ISceneryData[],

    includeNonPassenger: true,
    includeArrivals: true,

    apiTrainData: [] as ITrainResponse[],

    isAnimationRunning: true,
    intervalIndex: 0,

    lastRefreshTime: 0,

    departureTable: new Array(7).fill(0).map(() => ({ ...departureInfoEmptyObj })) as ITableRow[],
    departureRoutes: [''],
    dateDigits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ''],

    currentRouteIndex: 0,
    currentDateDigitIndex: 0,

    stationAbbrevs: stationAbbrevs as { [key: string]: string },
    selectedCheckpointName: '',
  }),

  async created() {
    await this.fetchSceneryInfo();
    this.selectDefaultCheckpoint();

    window.addEventListener('resize', (e) => {
      const elRef = this.$refs['pragotron'] as HTMLElement;
      if (!elRef) return;

      const scale = Math.min(window.innerWidth / elRef.clientWidth, window.innerHeight / elRef.clientHeight);
      if (scale > 1) return;

      elRef.style.transform = `scale(${scale})`;
    });
  },

  activated() {
    this.selectDefaultCheckpoint();
    this.shuffleRoutes();
    this.fetchDepartureList();

    this.intervalIndex = setInterval(() => {
      this.fetchDepartureList();
    }, 30000);

    this.isAnimationRunning = true;
    requestAnimationFrame(this.update);
  },

  deactivated() {
    this.isAnimationRunning = false;

    clearInterval(this.intervalIndex);
  },

  computed: {
    selectedStation() {
      return this.sceneriesInfo.find(({ stationName }) => stationName == this.stationName.replace(/_/g, ' '));
    },

    filledTable() {
      const filteredData = this.apiTrainData
        .reduce((list, train, i) => {
          if (!train.timetable) return list;

          const timetable = train.timetable;

          const stopInfo: ITimetableStop | undefined = timetable.stopList.find(
            (sp) => sp.stopNameRAW.toLowerCase() == this.selectedCheckpointName.toLowerCase()
          );

          if (!stopInfo || stopInfo.confirmed) return list;

          const stopInfoIndex = timetable.stopList.indexOf(stopInfo);
          const { departureTimestamp, departureDelay, arrivalTimestamp, departureLine } = stopInfo;

          const routeVia =
            timetable.stopList.find((stop, i) => {
              return (
                i > stopInfoIndex &&
                // i < timetable.stopList.length - 1,
                stop.stopName.includes('strong') &&
                stop.stopTime &&
                stop.stopTime > 0
              );
            })?.stopNameRAW || '';

          const date = departureLine ? new Date(departureTimestamp) : new Date(arrivalTimestamp);

          // [HH, MM, SS] - nienawidzę dat w JavaScripcie
          const dateArray = date.toLocaleString('pl-PL').split(', ')[1].split(':') || ['', '', '', ''];

          // [H,H,M,M] - ZABIJCIE MNIE BŁAGAM
          const dateDigits = [...dateArray[0].split(''), ...dateArray[1].split('')];

          const routeTo = timetable.route.split('|')[1];

          list.push({
            trainNumber: `${timetable.category} ${train.trainNo}`,
            timetableId: timetable.timetableId,
            routeTo: routeTo,
            routeVia: routeVia,
            date,
            dateDigits,
            delayMinutes: departureDelay,
            checkpointName: this.selectedCheckpointName.toLowerCase(),

            arrivalTimestamp,
            departureTimestamp,

            tableValues: {
              routeTo: '',
              routeVia: '',
              dateDigits: ['', '', '', ''],
              currentRowIndexes: [0, 0, 0, 0, 0, 0],
            },
          });

          if (!this.departureRoutes.includes(routeVia)) this.departureRoutes.push(routeVia);
          if (!this.departureRoutes.includes(routeTo)) this.departureRoutes.push(routeTo);

          return list;
        }, [] as ITableRow[])
        .filter(
          (dep) =>
            (this.includeNonPassenger || !/^[T|L|Z|P]/g.test(dep.trainNumber)) &&
            (this.includeArrivals || dep.departureTimestamp)
        )
        .sort((dep1, dep2) => (dep1.date?.getTime() || 0) - (dep2.date?.getTime() || 0));

      for (let i = 0; i < this.departureTable.length; i++) {
        if (i <= filteredData.length - 1) {
          const updateInfo = filteredData[i];
          const existingInfo = this.departureTable[i];

          this.departureTable[i] = { ...updateInfo };
          this.departureTable[i].tableValues.routeTo = existingInfo.routeTo;
          this.departureTable[i].tableValues.routeVia = existingInfo.routeVia;
          // this.departureTable[i].dateDigits = [...existingInfo.tableValues.dateDigits];
          this.departureTable[i].tableValues.dateDigits = [...existingInfo.tableValues.dateDigits];
          this.departureTable[i].tableValues.currentRowIndexes = [...existingInfo.tableValues.currentRowIndexes];
        } else {
          this.departureTable[i] = {
            ...this.departureTable[i],
            timetableId: -1,

            routeTo: '',
            routeVia: '',

            trainNumber: '',

            date: new Date(0),
            dateDigits: ['', '', '', ''],

            arrivalTimestamp: 0,
            departureTimestamp: 0,
            checkpointName: '',

            delayMinutes: 0,
          };
        }
      }

      return this.departureTable;
    },
  },

  methods: {
    async fetchSceneryInfo() {
      const sceneryInfoRes: ISceneryResponse[] = await (
        await fetch(`${import.meta.env.VITE_STACJOWNIK_API_URL}/api/getSceneries`)
      ).json();

      this.sceneriesInfo = sceneryInfoRes.map((stationData) => ({
        stationName: stationData.name,
        stationCheckpoints:
          stationData.checkpoints?.length > 0 ? stationData.checkpoints.split(';') : [stationData.name],
        nameAbbreviation: '',
      }));
    },

    selectDefaultCheckpoint() {
      this.selectedCheckpointName = this.selectedStation?.stationCheckpoints[0] || this.stationName;
    },

    abbrevStationName(name: string) {
      return (stationAbbrevs[name] || name).toUpperCase();
    },

    update(time: number) {
      if (!this.isAnimationRunning) return;

      if (time >= this.lastRefreshTime + 160) {
        this.updateTableRows();

        this.currentRouteIndex = (this.currentRouteIndex + 1) % this.departureRoutes.length;
        // this.currentDateDigitIndex = (this.currentDateDigitIndex + 1) % this.dateDigits.length;
        this.lastRefreshTime = time;
      }

      requestAnimationFrame(this.update);
    },

    // d = 0 -> time = time
    // d = time -> time2 = time2-time
    updateTableRows() {
      this.departureTable.forEach((dep, i) => {
        if (dep.tableValues.routeTo.toLowerCase() != dep.routeTo.toLowerCase()) {
          dep.tableValues.routeTo = this.departureRoutes[dep.tableValues.currentRowIndexes[0]];

          dep.tableValues.currentRowIndexes[0] =
            (dep.tableValues.currentRowIndexes[0] + 1) % this.departureRoutes.length;
        }

        if (dep.tableValues.routeVia.toLowerCase() != dep.routeVia.toLowerCase()) {
          dep.tableValues.routeVia = this.departureRoutes[dep.tableValues.currentRowIndexes[1]];

          dep.tableValues.currentRowIndexes[1] =
            (dep.tableValues.currentRowIndexes[1] + 1) % this.departureRoutes.length;
        }

        dep.tableValues.dateDigits.forEach((digit, j) => {
          if (dep.dateDigits[j] != digit) {
            dep.tableValues.dateDigits[j] = this.dateDigits[dep.tableValues.currentRowIndexes[j + 2]];
            dep.tableValues.currentRowIndexes[j + 2] =
              (dep.tableValues.currentRowIndexes[j + 2] + 1) % this.dateDigits.length;
          }
        });
      });
    },

    shuffleRoutes() {
      for (let i = 0; i < 25; i++) {
        const randIndex = Math.floor(Math.random() * routeValues.length);
        const randRoute = routeValues[randIndex];

        // this.departureRoutes.push(randRoute);
      }

      this.departureRoutes.sort(() => Math.random() - 0.5);
    },

    async fetchDepartureList() {
      const trainsAPIResponse: ITrainResponse[] = await (
        await fetch(`${import.meta.env.VITE_STACJOWNIK_API_URL}/api/getActiveTrainList`)
      ).json();

      if (!trainsAPIResponse) return;

      this.apiTrainData = trainsAPIResponse;
    },
  },
});
</script>

<style lang="scss" scoped>
/* ****** ANIMATION ****** */

.slot-anim {
  &-enter-active,
  &-leave-active {
    transition: all 80ms;
  }

  &-enter-from,
  &-leave-to {
    transform: rotateX(90deg) perspective(300px);
  }
}

.digit-slot-anim {
  &-enter-active,
  &-leave-active {
    transition: all 150ms ease-out;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}

/* ************** */

.pragotron {
  padding: 1em;
}

.filters {
  display: flex;
  justify-content: space-between;
  padding: 0.25em 0;
  gap: 0.5em;
}

.wrapper {
  width: 1200px;
  height: 650px;

  display: flex;
  flex-direction: column;
}

.top-pane {
  background-color: white;
  color: black;
  height: 180px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .title {
    padding: 0;

    font-size: 3.5em;
  }

  .headers {
    display: grid;
    grid-template-columns: 1fr 1fr 2fr 2fr 1fr;
    gap: 0 10px;
    padding: 0 10px;

    text-align: center;

    font-size: 1.35em;
  }
}

.table {
  background: white;
  flex-grow: 1;

  display: grid;
  grid-template-rows: repeat(7, 1fr);
  gap: 5px 0;
}

.row {
  &-content {
    display: grid;
    grid-template-columns: 1fr 1fr 2fr 2fr 1fr;
    gap: 0 10px;
    padding: 0 10px;

    height: 100%;

    align-items: center;
    color: white;
    font-size: 1.2em;

    background: #1a1a1a;

    span {
      display: flex;
      justify-content: center;
    }
  }
}

.departure-date {
  background: black;

  span {
    background: black;
    height: 2em;
    line-height: 2em;
    flex-grow: 2;
    width: 100%;
  }
}

.slider-slot {
  background: #010101;
  width: 100%;
  height: 2em;
  line-height: 2em;

  will-change: contents;
}
</style>
