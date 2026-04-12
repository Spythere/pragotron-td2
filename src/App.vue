<template>
  <div class="app_content">
    <Navbar :version="version" />

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
import { defineComponent } from 'vue';

import packageInfo from '../package.json';
import { useApiStore } from './stores/apiStore';
import Navbar from './components/Navbar.vue';
import { useMainStore, type AppLocale } from './stores/mainStore';

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
        const settingsObj = JSON.parse(settingsStorage) as Record<string, any>;

        Object.keys(settingsObj).forEach((key) => {
          (this.mainStore.filters as any)[key] = settingsObj[key];
        });
      }
    },

    loadLang() {
      const storageLang = window.localStorage.getItem('language');

      if (storageLang) {
        this.mainStore.changeLocale(storageLang as AppLocale);
        return;
      }

      if (!window.navigator.language) return;

      const naviLanguage = window.navigator.language.toString();

      if (!naviLanguage.startsWith('pl')) {
        this.mainStore.changeLocale('en');
        return;
      }
    }
  },

  created() {
    this.apiStore.fetchSceneriesData();
    this.apiStore.fetchActiveData();

    this.loadLocalSettings();
    this.loadLang();
  },

  mounted() {
    setInterval(() => {
      this.apiStore.fetchActiveData();
    }, 20000);
  }
});
</script>

<style lang="scss">
@use '@/styles/styles';

.app_content {
  text-align: center;

  display: grid;
  grid-template-rows: auto 1fr;

  min-height: 100vh;
}

main {
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
