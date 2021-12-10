<template>
  <div class="scenery-selector" v-if="selectedStationName.length == 0">
    <select name="scenery" id="select-scenery" v-model="selectedStationName">
      <option value="" disabled>Wybierz scenerię</option>
      <option v-for="name in onlineStationNames" :key="name">{{ name }}</option>
    </select>
  </div>

  <PragotronVue v-else />
</template>

<script lang="ts">
import { provide, ref } from 'vue';
import { defineComponent } from '@vue/runtime-core';
import PragotronVue from './components/Pragotron.vue';

import { StationResponse, StationInfo } from '@/interfaces/StationAPI';

export default defineComponent({
  components: {
    PragotronVue,
  },

  setup() {
    const selectedStationName = ref('');

    provide('selectedStationName', selectedStationName);

    return {
      selectedStationName,
    };
  },

  data: () => ({
    onlineStationNames: [] as string[],
  }),

  async mounted() {
    const stationsAPIResponse: StationResponse = await (
      await fetch('https://api.td2.info.pl:9640/?method=getStationsOnline')
    ).json();

    this.onlineStationNames = stationsAPIResponse.message
      .reduce((acc, station) => {
        if (station.region != 'eu') return acc;
        if (!station.isOnline) return acc;

        acc.push(station.stationName);

        return acc;
      }, [] as string[])
      .sort((s1, s2) => (s1 > s2 ? 1 : -1));
  },
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Monda:wght@400;700&display=swap');

body,
html {
  background: #333;
  min-height: 100vh;

  padding: 0;
  margin: 0;

  font-family: 'Monda', sans-serif;
}

input,
button,
select,
option {
  font-family: 'Monda', sans-serif;
  font-size: 1em;
}

#app {
  text-align: center;

  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100vh;
}

.scenery-selector {
  font-size: 1.3em;
  color: white;

  select {
    margin-top: 1em;

    width: 14em;
  }
}
</style>
