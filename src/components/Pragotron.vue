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
        <div class="row" v-for="i in new Array(8)" :key="i">
          <div class="row-content">
            <span class="destination">
              <div class="station-slider-slot"></div>
            </span>
            <span class="via-station">
              <div class="station-slider-slot"></div>
            </span>
            <span class="train-class">
              <div class="train-slider-slot"></div>
            </span>
            <span class="departure-date">
              <span class="hours-slot"></span>
              <span class="minutes-slot"></span>
              <span class="seconds-slot"></span>
            </span>
            <span class="delay">
              <div class="delay-slider-slot"></div>
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

import stationDataJSON from '@/data/stationList.json';

import { TrainResponse, TrainInfo } from '@/interfaces/TrainAPI';
import { TimetableResponse, TimetableInfo, TimetableStopInfo } from '@/interfaces/TimetableAPI';

export default defineComponent({
  data: () => ({
    currentStationName: '',
    stationDataJSON,
  }),

  setup() {
    const selectedStationName = inject('selectedStationName') as Ref<string>;

    console.log(selectedStationName.value);

    return {
      selectedStationName,
    };
  },

  async mounted() {
    /*
      0: "LCS Żywiec"
      1: "https://td2.info.pl/scenerie/lcs-zywiec/"
      2: "97, 139"
      3: null
      4: "10"
      5: "NIE"
      6: "współczesna"
      7: "SCS"
      8: "" - sbl
      9: "" - blokady
      10: 3
      11: 0
      12: 0
      13: 0
      14: "Węgierska Górka;Żywiec;Łodygowice;Wilkowice Bystra;BB Leszczyny;BB Lipnik, podg."
      15: true
      16: false
      17: false
    */

    const trainsAPIResponse: TrainResponse = await (
      await fetch('https://api.td2.info.pl:9640/?method=getTrainsOnline')
    ).json();

    const reducedList = await trainsAPIResponse.message.reduce(async (acc: Promise<string[]>, train: TrainInfo) => {
      const timetableAPIResponse: TimetableResponse = await (
        await fetch(`https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${train.trainNo}%3Beu`)
      ).json();

      const timetable: TimetableInfo = timetableAPIResponse.message;

      if (!timetable.trainInfo) return acc;
      if (!timetable.stopPoints) return acc;

      const stopInfo: TimetableStopInfo | undefined = timetable.stopPoints.find(
        (sp) => sp.pointNameRAW == this.selectedStationName
      );

      if (!stopInfo) return acc;
      if (!stopInfo.departureLine) return acc;
      if (stopInfo.confirmed == 1) return acc;

      (await acc).push(stopInfo.pointNameRAW + ': ' + timetable.trainInfo.driverName);

      return acc;
    }, Promise.resolve([]));

    console.log(reducedList);
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

    span {
      background: #333;
    }
  }
}
</style>
