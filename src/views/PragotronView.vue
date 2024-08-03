<template>
  <div class="pragotron">
    <div class="pragotron_content">
      <div class="wrapper" ref="pragotron">
        <div class="top-pane">
          <span class="title">
            <div>{{ mainStore.selectedCheckpointName.toUpperCase() }}</div>
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
          <div class="row" v-for="(departure, i) in departureTable" :key="i">
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
                  <div class="slider-slot" :key="departure.trainNumber">
                    {{ departure.trainNumber }}
                  </div>
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

    <audio loop ref="audio">
      <source src="/pragotron.ogg" type="audio/ogg" />
      <source src="/pragotron.flac" type="audio/mpeg" />
      <source src="/pragotron.mp3" type="audio/mpeg" />
    </audio>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { ITableRow } from '../types/ITableRow';
import { useMainStore } from '../stores/mainStore';
import { useApiStore } from '../stores/apiStore';

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

    dateDigits: ['', '', '', '']
  }
};

export default defineComponent({
  props: {
    stationName: {
      type: String,
      required: true
    },

    region: {
      type: String,
      default: 'pl1'
    }
  },

  data: () => ({
    mainStore: useMainStore(),
    apiStore: useApiStore(),

    includeNonPassenger: true,
    includeArrivals: true,

    isAnimationRunning: true,
    lastRefreshTime: 0,

    animatingStatus: 'init' as 'init' | 'running' | 'complete',

    departureTable: new Array(7).fill(0).map(() => ({ ...departureInfoEmptyObj })) as ITableRow[],
    departureRoutes: [''],
    dateDigits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ''],

    currentRouteIndex: 0,
    currentDateDigitIndex: 0,

    currentRowAnimating: 0
  }),

  async created() {
    // this.selectDefaultCheckpoint();

    window.addEventListener('resize', () => {
      this.resizeTable();
    });
  },

  activated() {
    this.mainStore.selectedStationName = this.stationName;

    this.resizeTable();

    this.selectDefaultCheckpoint();
    this.shuffleRoutes();

    this.isAnimationRunning = true;
    requestAnimationFrame(this.update);
  },

  deactivated() {
    this.isAnimationRunning = false;
    this.animatingStatus = 'init';
  },

  watch: {
    filledTable: {
      deep: true,
      handler(value) {
        for (let i = 0; i < this.departureTable.length; i++) {
          if (i <= value.length - 1) {
            const updateInfo = value[i];
            const existingInfo = this.departureTable[i];

            this.departureTable[i] = { ...updateInfo };
            this.departureTable[i].tableValues.routeTo = existingInfo.routeTo;
            this.departureTable[i].tableValues.routeVia = existingInfo.routeVia;
            // this.departureTable[i].dateDigits = [...existingInfo.tableValues.dateDigits];
            this.departureTable[i].tableValues.dateDigits = [
              ...existingInfo.tableValues.dateDigits
            ];
            this.departureTable[i].tableValues.currentRowIndexes = [
              ...existingInfo.tableValues.currentRowIndexes
            ];
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

              delayMinutes: 0
            };
          }
        }
      }
    },

    animatingStatus(val: typeof this.animatingStatus) {
      if (val == 'running' && this.mainStore.filters.soundsEnabled)
        (this.$refs['audio'] as HTMLAudioElement).play().catch((err) => {
          console.error('Dźwięk nie mógł zostać odtworzony:', err);
        });
      else {
        (this.$refs['audio'] as HTMLAudioElement).currentTime = 0;
        (this.$refs['audio'] as HTMLAudioElement).pause();
      }
    },

    'apiStore.activeData'(_val, prevVal) {
      if (prevVal == undefined) {
        this.selectDefaultCheckpoint();
      }
    }
  },

  computed: {
    filledTable() {
      const filteredData = this.apiStore.activeData?.trains
        .reduce((list, train) => {
          if (!train.timetable) return list;

          const timetable = train.timetable;

          const stopInfo = timetable.stopList.find(
            (sp) =>
              sp.stopNameRAW.toLowerCase() == this.mainStore.selectedCheckpointName.toLowerCase()
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
          const dateArray = date.toLocaleString('pl-PL').split(', ')[1].split(':') || [
            '',
            '',
            '',
            ''
          ];

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
            checkpointName: this.mainStore.selectedCheckpointName.toLowerCase(),

            arrivalTimestamp,
            departureTimestamp,

            tableValues: {
              routeTo: '',
              routeVia: '',
              dateDigits: ['', '', '', ''],
              currentRowIndexes: [0, 0, 0, 0, 0, 0]
            }
          });

          if (!this.departureRoutes.includes(routeVia)) this.departureRoutes.push(routeVia);
          if (!this.departureRoutes.includes(routeTo)) this.departureRoutes.push(routeTo);

          return list;
        }, [] as ITableRow[])
        .filter(
          (dep) =>
            (this.mainStore.filters.nonPassenger || !/^[T|L|Z|P]/g.test(dep.trainNumber)) &&
            (this.mainStore.filters.terminating || dep.departureTimestamp)
        )
        .sort((dep1, dep2) => (dep1.date?.getTime() || 0) - (dep2.date?.getTime() || 0));

      return filteredData;
    }
  },

  methods: {
    resizeTable() {
      const elRef = this.$refs['pragotron'] as HTMLElement;
      if (!elRef) return;

      const scale = Math.min(
        window.innerWidth / elRef.clientWidth,
        window.innerHeight / elRef.clientHeight,
        1
      );

      elRef.style.transform = `scale(${scale})`;
    },

    selectDefaultCheckpoint() {
      this.mainStore.selectedCheckpointName =
        this.mainStore.selectedStation?.stationCheckpoints[0] || this.stationName;
    },

    abbrevStationName(name: string) {
      return name.toUpperCase();
    },

    update(time: number) {
      if (!this.isAnimationRunning) return;

      if (time >= this.lastRefreshTime + 160) {
        this.updateTableRows();

        this.currentRouteIndex = (this.currentRouteIndex + 1) % this.departureRoutes.length;
        this.lastRefreshTime = time;
      }

      requestAnimationFrame(this.update);
    },

    updateTableRows() {
      let isCurrentTickAnimating = false;

      for (let i = 0; i < this.departureTable.length; i++) {
        const dep = this.departureTable[i];

        if (dep.tableValues.routeTo.toLowerCase() != dep.routeTo.toLowerCase()) {
          dep.tableValues.routeTo = this.departureRoutes[dep.tableValues.currentRowIndexes[0]];

          dep.tableValues.currentRowIndexes[0] =
            (dep.tableValues.currentRowIndexes[0] + 1) % this.departureRoutes.length;

          isCurrentTickAnimating = true;
        }

        if (dep.tableValues.routeVia.toLowerCase() != dep.routeVia.toLowerCase()) {
          dep.tableValues.routeVia = this.departureRoutes[dep.tableValues.currentRowIndexes[1]];

          dep.tableValues.currentRowIndexes[1] =
            (dep.tableValues.currentRowIndexes[1] + 1) % this.departureRoutes.length;

          isCurrentTickAnimating = true;
        }

        dep.tableValues.dateDigits.forEach((digit, j) => {
          if (dep.dateDigits[j] != digit) {
            dep.tableValues.dateDigits[j] =
              this.dateDigits[dep.tableValues.currentRowIndexes[j + 2]];
            dep.tableValues.currentRowIndexes[j + 2] =
              (dep.tableValues.currentRowIndexes[j + 2] + 1) % this.dateDigits.length;

            isCurrentTickAnimating = true;
          }
        });
      }

      this.animatingStatus = isCurrentTickAnimating ? 'running' : 'complete';
    },

    shuffleRoutes() {
      this.departureRoutes.sort(() => Math.random() - 0.5);
    }
  }
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

.pragotron_content {
  display: flex;
  justify-content: center;
  padding: 1em;
}

.wrapper {
  display: flex;
  flex-direction: column;
  min-width: 1400px;
  min-height: 700px;
  padding: 2em;

  transform-origin: top;
}

.top-pane > .headers,
.row-content {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 2fr 1fr;
  gap: 0 10px;
  padding: 0 10px;
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
    height: 100%;

    align-items: center;
    color: white;
    font-size: 1.3em;

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
