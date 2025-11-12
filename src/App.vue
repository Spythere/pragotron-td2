<template>
  <div class="app_content">
    <Navbar :version="version" />

    <main>
      <!-- <button @click="testAudio">test audio</button> -->
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="$route.path"></component>
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import packageInfo from '../package.json';
import { useApiStore } from './stores/apiStore';
import Navbar from './components/Navbar.vue';
import { useMainStore } from './stores/mainStore';

export default defineComponent({
  components: { Navbar },

  data: () => ({
    version: packageInfo.version,
    apiStore: useApiStore(),
    mainStore: useMainStore()
  }),

  methods: {
    loadLocalSettings() {
      const settingsStorage = window.localStorage.getItem('settings');

      if (settingsStorage != null) {
        const settingsObj = JSON.parse(settingsStorage) as
          | {
              filters?: Record<string, any>;
              language?: string;
            }
          | Record<string, any>;

        if ('filters' in settingsObj) {
          const filters = (settingsObj.filters || {}) as Record<string, any>;
          Object.keys(filters).forEach((key) => {
            if (key in this.mainStore.filters) {
              (this.mainStore.filters as any)[key] = filters[key];
            }
          });

          if (settingsObj.language) {
            this.mainStore.language = settingsObj.language as typeof this.mainStore.language;
          }
        } else {
          const legacySettings = settingsObj as Record<string, any>;
          Object.keys(legacySettings).forEach((key) => {
            if (key in this.mainStore.filters) {
              (this.mainStore.filters as any)[key] = legacySettings[key];
            }
          });
        }
      }
    }
  },

  created() {
    this.apiStore.fetchSceneriesData();
    this.apiStore.fetchActiveData();

    this.loadLocalSettings();
  },

  mounted() {
    setInterval(() => {
      this.apiStore.fetchActiveData();
    }, 20000);
  }
});
</script>

<style lang="scss">
@import './styles.scss';

.app_content {
  text-align: center;

  display: grid;
  grid-template-rows: auto 1fr;

  min-height: 100vh;
  overflow-x: hidden;
}

main {
  padding: 1em;
  overflow-x: hidden;
}

a {
  text-decoration: none;
  color: white;

  a:hover {
    color: gold;
  }
}
</style>
