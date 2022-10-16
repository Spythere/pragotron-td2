<template>
  <div class="app_content">
    <nav class="navbar">
      <router-link to="/">
        Pragotron TD2 <span class="text--accent">v{{ VERSION }}</span> <sup>by Spythere</sup>
      </router-link>
      <!-- <button v-else class="back-btn btn--text" @click="selectedStation = null">&lt; powrót</button> -->
    </nav>

    <main>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="$route.path"></component>
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import PragotronVue from './views/PragotronView.vue';
import IStationData from './types/ISceneryData';

import packageInfo from '../package.json';

export default defineComponent({
  components: {
    PragotronVue,
  },

  data: () => ({
    onlineStations: [] as IStationData[],
    dataLoaded: false,

    VERSION: packageInfo.version,
  }),

  async mounted() {
    this.dataLoaded = true;
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
  flex: 0 1 40px;
  font-size: 1.35em;

  padding: 0.25em;

  display: flex;
  align-items: center;

  background-color: $accentBg;

  sup {
    font-size: 0.8em;
    color: $dimmedText;
  }

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

a {
  text-decoration: none;
  color: white;
}
</style>

