<template>
  <div class="app_content">
    <Navbar :version="version" />

    <main>
      <button @click="testAudio">test audio</button>
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

export default defineComponent({
  components: { Navbar },

  data: () => ({
    version: packageInfo.version,
    apiStore: useApiStore()
  }),

  async mounted() {
    this.apiStore.fetchSceneriesData();

    this.apiStore.fetchActiveData();

    setInterval(() => {
      this.apiStore.fetchActiveData();
    }, 30000);
  },

  methods: {
    testAudio() {
      const audio = new Audio('../public/pragotron.mp3');
      audio.play();
      audio.loop = true;
    }
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
