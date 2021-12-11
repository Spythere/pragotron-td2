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
          <div class="row-content" v-if="!departure"></div>
          <div class="row-content" v-else>
            <span class="destination">
              <div class="station-slider-slot">{{ departure.routeTo.toUpperCase() }}</div>
            </span>
            <span class="via-station">
              <div class="station-slider-slot">{{ departure.routeVia.toUpperCase() }}</div>
            </span>
            <span class="train-class">
              <div class="train-slider-slot">{{ departure.trainType }} {{ departure.trainNo }}</div>
            </span>
            <span class="departure-date">
              <span class="hours-slot"></span>
              <span class="minutes-slot"></span>
              <span class="seconds-slot"></span>
            </span>
            <span class="delay">
              <div class="delay-slider-slot" v-if="departure.delayMinutes > 0">{{ departure.delayMinutes }} min</div>
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

import { TrainResponse, TrainInfo } from '@/interfaces/TrainAPI';
import { TimetableResponse, TimetableInfo, TimetableStopInfo } from '@/interfaces/TimetableAPI';
import StationData from '@/interfaces/StationData';

interface DepartureInfo {
  timetableId: number;

  routeTo: string;
  routeVia: string;

  trainNo: number;
  trainType: string;
  departureDate: Date;
  delayMinutes: number;
}

export default defineComponent({
  data: () => ({
    currentStationName: '',
    departureList: new Array(8).fill(null) as (DepartureInfo | null)[],
  }),

  setup() {
    const selectedStation = inject('selectedStation') as Ref<StationData>;

    console.log(selectedStation.value.stationName);

    return {
      selectedStation,
    };
  },

  async mounted() {
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

        (await acc).push({
          timetableId,
          routeTo: route.split('|')[1],
          routeVia,
          trainNo,
          trainType: trainCategoryCode,
          departureDate: departureTime,
          delayMinutes: departureDelay,
        });

        return acc;
      }, Promise.resolve([]))
    ).sort((d1, d2) => (d1.departureDate > d2.departureDate ? 1 : -1));

    const sortedList = new Array(8).fill(0).map((v, i) => (i > departureList.length ? null : departureList[i]));

    this.departureList = sortedList;
  },
});
</script>

<style lang="scss" scoped>
.pragotron {
  width: 1200px;
  height: 600px;

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

    background: #333;
  }
}
</style>
