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

import { defineComponent } from 'vue';

export default defineComponent({
  data: () => ({}),
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
