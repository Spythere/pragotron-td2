<template>
  <div class="pragotron">
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
            <option v-for="cp in selectedStation.stationCheckpoints" :value="cp">{{ cp }}</option>
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
</template>

<script lang="ts">
/* eslint-disable */

import { defineComponent, inject, reactive, Ref } from 'vue';

import stationAbbrevsJSON from '../data/stationAbbrevs.json';
import routeValues from '../data/routeValues.json';

import StationData from '../types/IStationData';
import { ITimetableStop, ITrainResponse } from '../types/ITrainResponse';
import { ITableRow } from '../types/ITableRow';

const stationAbbrevs: { [key: string]: string } = stationAbbrevsJSON;

const departureInfoEmptyObj: ITableRow = {
  timetableId: -1,

  routeTo: '',
  routeVia: '',

  trainNumber: '',

  date: new Date(0),
  dateDigits: [' ', ' ', ' ', ' '],

  arrivalTimestamp: 0,
  departureTimestamp: 0,
  checkpointName: '',

  delayMinutes: 0,

  tableValues: {
    routeTo: '',
    routeVia: '',

    currentRouteToIndex: 0,
    currentRouteViaIndex: 0,

    dateDigits: [' ', ' ', ' ', ' '],
  },
};

export default defineComponent({
  data: () => ({
    currentStationName: '',

    includeNonPassenger: true,
    includeArrivals: true,

    apiTrainData: [] as ITrainResponse[],

    lastRefreshTime: 0,
    updatedDepartureList: [] as ITableRow[],

    departureList: new Array(7).fill(0).map(() => ({ ...departureInfoEmptyObj })) as ITableRow[],
    departureRoutes: [''],
    dateDigits: [' ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],

    currentRouteIndex: 0,
    currentDateDigitIndex: 0,

    stationAbbrevs: stationAbbrevs as { [key: string]: string },
    selectedCheckpointName: '',
  }),

  setup() {
    const selectedStation = inject('selectedStation') as Ref<StationData>;

    return {
      selectedStation,
    };
  },

  async mounted() {
    this.selectDefaultCheckpoint();

    this.shuffleRoutes();
    await this.fetchDepartureList();

    setInterval(() => {
      this.fetchDepartureList();
    }, 10000);

    requestAnimationFrame(this.update);
  },

  computed: {
    filledTable() {
      const filteredData = this.apiTrainData
        .reduce((list, train) => {
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
              dateDigits: [' ', ' ', ' ', ' '],
              currentRouteToIndex: 0,
              currentRouteViaIndex: 0
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

      for (let i = 0; i < this.departureList.length; i++) {
        if (i <= filteredData.length - 1) {
          const updateInfo = filteredData[i];
          const existingInfo = this.departureList[i];

          this.departureList[i] = { ...updateInfo };
          this.departureList[i].tableValues.routeTo = existingInfo.routeTo;
          this.departureList[i].tableValues.routeVia = existingInfo.routeVia;
          this.departureList[i].tableValues.dateDigits = [...existingInfo.tableValues.dateDigits];
        } else {
          this.departureList[i] = departureInfoEmptyObj;
        }
      }

      return this.departureList;
    },
  },

  methods: {
    selectDefaultCheckpoint() {
      this.selectedCheckpointName = this.selectedStation.stationCheckpoints[0] || this.selectedStation.stationName;
    },

    abbrevStationName(name: string) {
      return (name in stationAbbrevs ? stationAbbrevs[name] : name).toUpperCase();
    },

    update(time: number) {
      if (time >= this.lastRefreshTime + 125) {
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
      
      this.departureList.forEach((dep, i) => {
        if (dep.tableValues.routeTo.toLowerCase() != dep.routeTo.toLowerCase()) {
          dep.tableValues.routeTo = this.departureRoutes[(dep.tableValues.currentRouteToIndex) % this.departureRoutes.length];
        }

        if (dep.tableValues.routeVia.toLowerCase() != dep.routeVia.toLowerCase()) {
          dep.tableValues.routeVia =
            this.departureRoutes[(dep.tableValues.currentRouteViaIndex) % this.departureRoutes.length];
        }

        dep.tableValues.currentRouteToIndex = (dep.tableValues.currentRouteToIndex + 1) % this.departureRoutes.length;
        dep.tableValues.currentRouteViaIndex = (dep.tableValues.currentRouteViaIndex + 1) % this.departureRoutes.length;
        

        dep.tableValues.dateDigits.forEach((digit, j) => {
          if (dep.dateDigits[j] != digit)
            dep.tableValues.dateDigits[j] =
              this.dateDigits[(Number(digit) + 1) % this.dateDigits.length];
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

    // refreshTable(apiData: ITrainResponse[]) {
    //   const updatedDepartureList = apiData.reduce((list, train) => {
    //     if (!train.timetable) return list;

    //     const timetable = train.timetable;

    //     const stopInfo: ITimetableStop | undefined = timetable.stopList.find(
    //       (sp) => sp.stopNameRAW.toLowerCase() == this.selectedCheckpointName.toLowerCase()
    //     );

    //     if (!stopInfo || stopInfo.confirmed) return list;

    //     const stopInfoIndex = timetable.stopList.indexOf(stopInfo);
    //     const { departureTimestamp, departureDelay, arrivalTimestamp, departureLine } = stopInfo;

    //     const routeVia =
    //       timetable.stopList.find((stop, i) => {
    //         return (
    //           i > stopInfoIndex &&
    //           // i < timetable.stopList.length - 1,
    //           stop.stopName.includes('strong') &&
    //           stop.stopTime &&
    //           stop.stopTime > 0
    //         );
    //       })?.stopNameRAW || '';

    //     const date = departureLine ? new Date(departureTimestamp) : new Date(arrivalTimestamp);

    //     // [HH, MM, SS] - nienawidzę dat w JavaScripcie
    //     const dateArray = date.toLocaleString('pl-PL').split(', ')[1].split(':') || [' ', ' ', ' ', ' '];

    //     // [H,H,M,M] - ZABIJCIE MNIE BŁAGAM
    //     const dateDigits = [...dateArray[0].split(''), ...dateArray[1].split('')];

    //     const routeTo = timetable.route.split('|')[1];

    //     list.push({
    //       trainNumber: `${timetable.category} ${train.trainNo}`,
    //       timetableId: timetable.timetableId,
    //       routeTo: routeTo,
    //       routeVia: routeVia,
    //       date,
    //       dateDigits,
    //       delayMinutes: departureDelay,
    //       checkpointName: this.selectedCheckpointName.toLowerCase(),

    //       arrivalTimestamp,
    //       departureTimestamp,

    //       tableValues: {
    //         routeTo: '',
    //         routeVia: '',
    //       },
    //     });

    //     if (!this.departureRoutes.includes(routeVia)) this.departureRoutes.push(routeVia);
    //     if (!this.departureRoutes.includes(routeTo)) this.departureRoutes.push(routeTo);

    //     return list;
    //   }, [] as ITableRow[]);

    //   this.updatedDepartureList = updatedDepartureList;
    // },

    async fetchDepartureList() {
      const trainsAPIResponse: ITrainResponse[] = await (
        await fetch(`${import.meta.env.VITE_STACJOWNIK_API_URL}/api/getActiveTrainList`)
      ).json();

      if (!trainsAPIResponse) return;

      this.apiTrainData = trainsAPIResponse;
      // this.refreshTable(trainsAPIResponse);
    },
  },
});
</script>

<style lang="scss" scoped>
/* ****** ANIMATION ****** */

.slot-anim {
  &-enter-active,
  &-leave-active {
    transition: all 50ms ease-in-out;
  }

  &-enter-from,
  &-leave-to {
    transform: rotateX(90deg) perspective(200px);
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
}
</style>
