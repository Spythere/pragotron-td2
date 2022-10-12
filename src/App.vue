<template>
  <div class="app_content">
    <nav class="navbar">
      <div v-if="!selectedStation">Pragotron TD2</div>
      <button v-else class="back-btn btn--text" @click="selectedStation = null">&lt; powrót</button>
    </nav>

    <main>
      <div class="scenery-selector" v-if="!selectedStation">
        <h1>Scenerie online</h1>

        <ul class="scenery-list">
          <li v-for="(station, i) in onlineStations">
            <span v-if="i > 0">&bull;</span>
            <button class="btn--text" @click="handleClick(station)">
              {{ station.stationName }}
            </button>
          </li>
        </ul>
      </div>

      <PragotronVue v-else />
    </main>
  </div>
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

    const selectedStation = ref(null) as Ref<null | IStationData>;

    provide('selectedStation', selectedStation);

    return {
      selectedStation,
    };
  },

  data: () => ({
    onlineStations: [] as IStationData[],
    dataLoaded: false,
  }),

  async mounted() {
    const stationDataArray: ISceneryResponse[] = await (
      await fetch(`${import.meta.env.VITE_STACJOWNIK_API_URL}/api/getSceneries`)
    ).json();

    const stationDataJSON = stationDataArray.map((stationData) => ({
      stationName: stationData.name,
      stationCheckpoints: stationData.checkpoints?.length > 0 ? stationData.checkpoints.split(';') : [stationData.name],
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

    this.dataLoaded = true;
  },

  methods: {
    handleClick(station: IStationData) {
      this.selectedStation = station;
    },
  },
});
</script>

<style lang="scss">
@import './styles.scss';

.app_content {
  text-align: center;

  display: flex;
  flex-direction: column;

  min-height: 100vh;
}

nav {
  flex: 0 1 auto;
  font-size: 1.35em;

  padding: 0.25em;

  display: flex;
  align-items: center;

  background-color: $accentBg;

  button {
    padding: 0;
  }
}

main {
  flex: 1 1 auto;

  display: flex;
  justify-content: center;
  align-items: center;
}

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

