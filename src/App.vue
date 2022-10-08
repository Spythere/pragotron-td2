<template>
  <div class="scenery-selector" v-if="!selectedStation">
    <select name="scenery" id="select-scenery" v-model="selectedStation">
      <option :value="null" disabled>Wybierz scenerię</option>
      <option v-for="s in onlineStations" :value="s">{{ s.stationName }}</option>
    </select>
  </div>

  <PragotronVue v-else />
</template>

<script lang="ts">
import { provide, Ref, ref } from 'vue';
import { defineComponent } from '@vue/runtime-core';
import PragotronVue from './components/Pragotron.vue';
import IStationData from './types/IStationData';
import { ISceneryResponse } from './types/ISceneryReponse';
import { IOnlineStationsResponse } from './types/IOnlineStationsResponse';

export default defineComponent({
  components: {
    PragotronVue,
  },

  setup() {
    const mockStation: IStationData = {
      stationName: 'Czermin',
      nameAbbreviation: '',
      stationCheckpoints: [],
    };

    const selectedStation = ref(mockStation) as Ref<null | IStationData>;

    provide('selectedStation', selectedStation);

    return {
      selectedStation,
    };
  },

  data: () => ({
    onlineStations: [] as IStationData[],
  }),

  async mounted() {
    const stationDataArray: ISceneryResponse[] = await (
      await fetch('https://spythere.github.io/api/stationData.json')
    ).json();

    const stationDataJSON = stationDataArray.map((stationData) => ({
      stationName: stationData.name,
      stationCheckpoints: stationData.checkpoints?.split(';') || [],
      nameAbbreviation: '',
    }));

    const stationsAPIResponse: IOnlineStationsResponse = await (
      await fetch('https://api.td2.info.pl:9640/?method=getStationsOnline')
    ).json();

    this.onlineStations = stationsAPIResponse.message
      .reduce((acc, station) => {
        if (station.region != 'eu') return acc;
        if (!station.isOnline) return acc;

        const savedStationData = stationDataJSON.find((data) => data.stationName == station.stationName);

        if (savedStationData) acc.push(savedStationData);
        else
          acc.push({
            stationName: station.stationName,
            nameAbbreviation: '',
            stationCheckpoints: [],
          });

        return acc;
      }, [] as IStationData[])
      .sort((s1, s2) => (s1.stationName > s2.stationName ? 1 : -1));
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

