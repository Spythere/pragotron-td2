<template>
  <div class="home-view">
    <div class="scenery-selector">
      <h1 style="margin: 0">Wybierz scenerię, aby otworzyć widok pragotronu</h1>
      <p style="margin: 0.5em; color: #ccc">Widoczne są jedynie scenerie aktywne na serwerze PL1</p>

      <ul class="scenery-list" v-if="dataLoaded && onlineStations.length > 0">
        <li v-for="(stationName, i) in onlineStations">
          <span v-if="i > 0">&bull;</span>
          <button class="btn--text" @click="handleClick(stationName)">
            {{ stationName }}
          </button>
        </li>
      </ul>

      <h3 v-else-if="onlineStations.length == 0">Brak aktywnych scenerii</h3>
      <h3 v-else>Ładowanie listy aktywnych scenerii...</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IOnlineStationsResponse } from '../types/IOnlineStationsResponse';

export default defineComponent({
  data() {
    return {
      onlineStations: [] as string[],
      dataLoaded: false,
    };
  },

  async mounted() {
    const stationsAPIResponse: IOnlineStationsResponse = await (
      await fetch('https://api.td2.info.pl/?method=getStationsOnline')
    ).json();

    this.dataLoaded = true;

    this.onlineStations = stationsAPIResponse.message
      .reduce((acc, station) => {
        if (station.region != 'eu') return acc;
        if (!station.isOnline) return acc;

        acc.push(station.stationName);

        return acc;
      }, [] as string[])
      .sort((s1, s2) => (s1 > s2 ? 1 : -1));
  },

  methods: {
    handleClick(stationName: string) {
      this.$router.push(`/board?name=${stationName}`);
      // this.selectedStation = station;
    },
  },
});
</script>

<style ;ang="scss" scoped>
ul.scenery-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  padding: 1em;
  margin: 0 auto;

  font-size: 1.3em;
  max-width: 1000px;
}
</style>

