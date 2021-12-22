<template>
  <div class="pragotron">
    <div class="wrapper">
      <div class="top-pane">
        <span class="title">
          <div>{{ selectedStation.stationName.toUpperCase() }}</div>
        </span>

        <div class="headers">
          <span>DO STACJI</span>
          <span>PRZEZ</span>
          <span>POCIĄG</span>
          <span>PLAN. ODJ.</span>
          <span>OPÓŹN.</span>
        </div>
      </div>

      <div class="table">
        <div class="row" v-for="(departure, i) in departureList" :key="i">
          <div class="row-content">
            <span class="route-to">
              <transition name="slot-anim" mode="out-in">
                <div class="slider-slot" :key="departure.tableValues.routeTo">
                  {{ abbrevStationName(departure.tableValues.routeTo) }}
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

            <span class="train-class">
              <transition name="slot-anim" mode="out-in">
                <div class="slider-slot" :key="departure.trainNumber">{{ departure.trainNumber }}</div>
              </transition>
            </span>

            <span class="departure-date">
              <transition name="slot-anim" mode="out-in">
                <span class="slider-slot-digit" :key="departure.departureDigits[0]">{{
                  departure.departureDigits[0]
                }}</span>
              </transition>

              <transition name="slot-anim" mode="out-in">
                <span class="slider-slot-digit" :key="departure.departureDigits[1]">
                  {{ departure.departureDigits[1] }}</span
                >
              </transition>

              <span :key="departure.departureDigits[1]"> : </span>

              <transition name="slot-anim" mode="out-in">
                <span class="slider-slot-digit" :key="departure.departureDigits[2]">
                  {{ departure.departureDigits[2] }}
                </span>
              </transition>

              <transition name="slot-anim" mode="out-in">
                <span class="slider-slot-digit" :key="departure.departureDigits[3]">
                  {{ departure.departureDigits[3] }}
                </span>
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

import stationAbbrevsJSON from '@/data/stationAbbrevs.json';
import routeValues from '@/data/routeValues.json';

import { TrainResponse, TrainInfo } from '@/interfaces/TrainAPI';
import { TimetableResponse, TimetableInfo, TimetableStopInfo } from '@/interfaces/TimetableAPI';
import StationData from '@/interfaces/StationData';

const stationAbbrevs: { [key: string]: string } = stationAbbrevsJSON;

interface DepartureInfo {
  timetableId: number;

  routeTo: string;
  routeVia: string;

  trainNumber: string;

  departureDate: Date;
  departureDigits: string[];

  delayMinutes: number;

  tableValues: {
    routeTo: string;
    routeVia: string;
  };
}

const departureInfoEmptyObj: DepartureInfo = {
  timetableId: -1,

  routeTo: '',
  routeVia: '',

  trainNumber: '',

  departureDate: new Date(0),
  departureDigits: [],

  delayMinutes: 0,

  tableValues: reactive({
    routeTo: '',
    routeVia: '',
  }),
};

export default defineComponent({
  data: () => ({
    currentStationName: '',

    // seekingTable: [] as { collection: string[]; currentIndex: number }[][],

    lastRefreshTime: 0,

    departureList: new Array(7).fill(0).map(() => ({ ...departureInfoEmptyObj })) as DepartureInfo[],
    departureRoutes: [''],

    currentRouteIndex: 0,

    stationAbbrevs: stationAbbrevs as { [key: string]: string },
  }),

  setup() {
    const selectedStation = inject('selectedStation') as Ref<StationData>;

    return {
      selectedStation,
    };
  },

  methods: {
    abbrevStationName(name: string) {
      return (name in stationAbbrevs ? stationAbbrevs[name] : name).toUpperCase();
    },

    // d = 0 -> time = time
    // d = time -> time2 = time2-time
    updateTableRows(time: number) {
      if (time >= this.lastRefreshTime + 125) {
        this.departureList.forEach((dep, i) => {
          if (dep.tableValues.routeTo.toLowerCase() != dep.routeTo.toLowerCase()) {
            dep.tableValues.routeTo = this.departureRoutes[(this.currentRouteIndex + i) % this.departureRoutes.length];
          }

          if (dep.tableValues.routeVia.toLowerCase() != dep.routeVia.toLowerCase()) {
            dep.tableValues.routeVia = this.departureRoutes[(this.currentRouteIndex + i + 1) % this.departureRoutes.length];
          }
        });

        this.currentRouteIndex = (this.currentRouteIndex + 1) % this.departureRoutes.length;
        this.lastRefreshTime = time;
      }

      requestAnimationFrame(this.updateTableRows);
    },

    fillTable(departureUpdateList: DepartureInfo[] = []) {
      for (let i = 0; i < 7; i++) {
        if (i <= departureUpdateList.length - 1) {
          const updateInfo = departureUpdateList[i];
          const existingInfo = this.departureList[i];

          // if (updateInfo.delayMinutes != existingInfo.delayMinutes) {
          //   this.departureList[i].delayMinutes = updateInfo.delayMinutes;
          //   continue;
          // }

          // // Podmień jeśli
          // if (updateInfo.timetableId != existingInfo.timetableId) {
          //   this.departureList[i] = updateInfo;
          // }
          
          this.departureList[i] = updateInfo;
          this.departureList[i].tableValues.routeTo = existingInfo.routeTo;
          this.departureList[i].tableValues.routeVia = existingInfo.routeVia;
          
        } else {
          this.departureList[i] = departureInfoEmptyObj;
        }
      }

      console.log(this.departureList);
    },
    shuffleRoutes() {
      for (let i = 0; i < 25; i++) {
        const randIndex = Math.floor(Math.random() * routeValues.length);
        const randRoute = routeValues[randIndex];

        this.departureRoutes.push(randRoute);
      }

      this.departureRoutes.sort(() => Math.random() - 0.5);
    },

    async fetchDepartureList() {
      const trainsAPIResponse: TrainResponse = await (
        await fetch('https://api.td2.info.pl:9640/?method=getTrainsOnline')
      ).json();

      const departureList = (
        await trainsAPIResponse.message.reduce(async (acc: Promise<DepartureInfo[]>, train: TrainInfo) => {
          const timetableAPIResponse: TimetableResponse = await (
            await fetch(`https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${train.trainNo}%3Beu`)
          ).json();

          const timetable: TimetableInfo = timetableAPIResponse.message;

          if (!timetable.trainInfo) return acc;
          if (!timetable.stopPoints) return acc;

          const stopInfo: TimetableStopInfo | undefined = timetable.stopPoints.find(
            (sp) => sp.pointNameRAW.toLowerCase() == this.selectedStation.stationName.toLowerCase()
          );

          if (!stopInfo) return acc;
          if (!stopInfo.departureLine || !stopInfo.departureTime) return acc;
          if (stopInfo.confirmed == 1) return acc;

          const stopInfoIndex = timetable.stopPoints.indexOf(stopInfo);
          const { timetableId, trainNo, route, trainCategoryCode } = timetable.trainInfo;
          const { departureTime, departureDelay } = stopInfo;

          const routeVia =
            timetable.stopPoints.find((stop, i) => {
              if (
                i > stopInfoIndex &&
                i != (timetable.stopPoints || []).length - 1 &&
                stop.pointName.includes('strong') &&
                stop.pointStopTime &&
                stop.pointStopTime > 0
              )
                return true;

              return false;
            })?.pointNameRAW || '';

          const departureDate = new Date(departureTime);

          // [HH, MM, SS] - nienawidzę dat w JavaScripcie
          const dateArray = departureDate.toLocaleString('pl-PL').split(', ')[1].split(':');

          // [H,H,M,M] - ZABIJCIE MNIE BŁAGAM
          const departureDigits = [...dateArray[0].split(''), ...dateArray[1].split('')];

          const routeTo = route.split('|')[1];

          (await acc).push({
            timetableId,
            routeTo: routeTo,
            routeVia,
            trainNumber: `${trainCategoryCode} ${trainNo}`,
            departureDate: new Date(departureTime),
            departureDigits,
            delayMinutes: departureDelay,

            tableValues: reactive({
              routeTo: '',
              routeVia: '',
            }),
          });

          if (!this.departureRoutes.includes(routeVia)) this.departureRoutes.push(routeVia);
          if (!this.departureRoutes.includes(routeTo)) this.departureRoutes.push(routeTo);

          return acc;
        }, Promise.resolve([]))
      ).sort((d1, d2) => (d1.departureDate > d2.departureDate ? 1 : -1));

      this.fillTable(departureList);
    },
  },

  async mounted() {
    this.fillTable();
    this.fetchDepartureList();
    this.shuffleRoutes();

    setInterval(() => {
      this.fetchDepartureList();
      this.shuffleRoutes();

      console.log('Loading data');
    }, 10000);

    requestAnimationFrame(this.updateTableRows);
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

.pragotron {
  width: 1200px;
  height: 650px;

  background: black;
}

.wrapper {
  height: 100%;

  display: flex;
  flex-direction: column;
}

.top-pane {
  background: white;
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
    grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
    gap: 0 10px;

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
    grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
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
  display: flex;
  background: black;

  .dot {
    flex-grow: 1;
  }

  span {
    background: black;
    height: 2em;
    line-height: 2em;
    flex-grow: 2;
  }
}

.slider-slot {
  background: #010101;
  width: 85%;
  height: 2em;
  line-height: 2em;
}
</style>
