<template>
  <div class="pragotron">
    <div class="wrapper">
      <div class="top-pane">
        <span class="title">ODJAZDY</span>

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
                <div class="slider-slot" :key="departure.routeTo">
                  {{ departure.routeTo.toUpperCase() }}
                </div>
              </transition>
            </span>

            <span class="route-via">
              <transition name="slot-anim" mode="out-in">
                <div class="slider-slot" :key="departure.routeVia">{{ departure.routeVia.toUpperCase() }}</div>
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

import { defineComponent, inject, Ref } from 'vue';

import stationAbbrevs from '@/data/stationAbbrevs.json';
import routeValues from '@/data/routeValues.json';

import { TrainResponse, TrainInfo } from '@/interfaces/TrainAPI';
import { TimetableResponse, TimetableInfo, TimetableStopInfo } from '@/interfaces/TimetableAPI';
import StationData from '@/interfaces/StationData';

interface DepartureInfo {
  timetableId: number;

  routeTo: string;
  routeVia: string;

  trainNumber: string;

  departureDate: Date;
  departureDigits: string[];

  delayMinutes: number;

  currentRouteTo: string;
  currentRouteVia?: string;
}

export default defineComponent({
  data: () => ({
    currentStationName: '',

    seekingTable: [],

    departureList: [] as DepartureInfo[],

    stationAbbrevs: stationAbbrevs as { [key: string]: string },
  }),

  setup() {
    const selectedStation = inject('selectedStation') as Ref<StationData>;

    console.log(selectedStation.value.stationName);

    return {
      selectedStation,
    };
  },

  methods: {
    addSeekedValue(desiredValue: string, sourceCollection: string[], startIndex: number = 0) {
      let currentIndex = startIndex - 1;
      let collection = [...sourceCollection];

      if (!collection.includes(desiredValue)) collection.push(desiredValue);

      let tempSwap, randIndex;
      for (let i = 1; i < collection.length; i++) {
        randIndex = Math.floor(Math.random() * collection.length);

        if (randIndex == 0) randIndex++;

        tempSwap = collection[i];

        collection[i] = collection[randIndex];
        collection[randIndex] = tempSwap;
      }

      console.log('Desired value:', desiredValue);

      const intv = setInterval(() => {
        const currentValue = collection[++currentIndex];

        if (currentIndex > collection.length - 1) {
          console.log('Value not found!');

          clearInterval(intv);
          return;
        }

        if (currentValue == desiredValue) {
          console.log('Value found:', currentValue);

          clearInterval(intv);
          return;
        }

        console.log('Seeking value...', currentValue, currentIndex);
      }, 100);
    },
    fillTable(responseArray: DepartureInfo[] = []) {
      if (this.departureList.length == 0)
        this.departureList = new Array(7).fill({
          timetableId: -1,

          routeTo: '',
          routeVia: '',

          trainNumber: '',

          departureDate: new Date(0),
          departureDigits: [],

          delayMinutes: 0,
          currentRouteTo: '',
        });

      for (let i = 0; i < this.departureList.length; i++) {
        if (i > responseArray.length - 1)
          this.departureList[i] = {
            timetableId: -1,

            routeTo: '',
            routeVia: '',

            trainNumber: '',

            departureDate: new Date(0),
            departureDigits: [],

            delayMinutes: 0,
            currentRouteTo: '',
          };
        else this.departureList[i] = { ...responseArray[i] };
      }
    },
  },

  async mounted() {
    this.fillTable();

    this.addSeekedValue('Test', routeValues, 0);

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
        const routeToAbbrev = this.stationAbbrevs[routeTo] || null;

        (await acc).push({
          timetableId,
          routeTo: routeToAbbrev || routeTo,
          routeVia,
          trainNumber: `${trainCategoryCode} ${trainNo}`,
          departureDate: new Date(departureTime),
          departureDigits,
          delayMinutes: departureDelay,
          currentRouteTo: routeValues[0],
        });

        return acc;
      }, Promise.resolve([]))
    ).sort((d1, d2) => (d1.departureDate > d2.departureDate ? 1 : -1));

    this.fillTable(departureList);

    // const sortedList: DepartureInfo[] = new Array(8)
    //   .fill({
    //     timetableId: -1,

    //     routeTo: '',
    //     routeVia: '',

    //     trainNumber: '',

    //     departureDate: new Date(0),
    //     departureDigits: [],

    //     delayMinutes: 0,
    //     currentRouteTo: '',
    //   })
    //   .map((v, i) => (i > departureList.length - 1 ? v : departureList[i]));

    // setInterval(() => {
    //   sortedList.forEach(d => {
    //     if(d.currentRouteTo == d.routeTo)
    //       return;

    //   })
    // }, 500);
  },
});
</script>

<style lang="scss" scoped>
/* ****** ANIMATION ****** */

.slot-anim {
  &-enter-active,
  &-leave-active {
    transition: all 80ms ease-in;
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
  height: 130px;

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
  width: 80%;
  height: 2em;
  line-height: 2em;
}
</style>
