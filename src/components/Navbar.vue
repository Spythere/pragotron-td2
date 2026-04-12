<template>
  <nav class="navbar">
    <div class="navbar-body">
      <router-link class="brand-link" to="/">
        Pragotron TD2 <span class="text--accent">v{{ version }}</span> <sup>by Spythere</sup>
      </router-link>

      <div class="lang-switcher">
        <button @click="switchLanguage">
          <img src="/icon-globe.svg" alt="globe icon" />
          {{ store.locale.toUpperCase() == 'PL' ? 'POL' : 'ENG' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../stores/mainStore';

export default defineComponent({
  props: {
    version: String
  },
  data() {
    return {
      store: useMainStore()
    };
  },
  methods: {
    switchLanguage() {
      this.store.changeLocale(this.store.locale == 'pl' ? 'en' : 'pl');
    }
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/theme';

nav.navbar {
  background-color: theme.$accentBg;
  padding: 0 0.5em;

  sup {
    font-size: 0.8em;
    color: theme.$dimmedText;
  }
}

.navbar-body {
  padding: 0.25em;

  display: flex;
  justify-content: space-between;
  align-items: center;

  position: relative;

  margin: 0 auto;
  max-width: 1500px;

  font-weight: bold;
}

.brand-link {
  font-size: 1.25em;
}

.lang-switcher button {
  display: flex;
  align-items: center;
  gap: 0.5em;

  padding: 0.25em 0.5em;
  border-radius: 0.5em;
  color: white;

  font-size: 1em;

  img {
    width: 1.25em;
  }
}

@media only screen and (max-width: 1400px) {
  nav.navbar {
    font-size: calc(0.5em + 0.5vw);
  }
}
</style>
