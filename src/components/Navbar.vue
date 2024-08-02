<template>
  <nav class="navbar">
    <div class="navbar-body">
      <router-link class="brand" to="/">
        Pragotron TD2 <span class="text--accent">v{{ version }}</span> <sup>by Spythere</sup>
      </router-link>

      <div class="options">
        <Dropdown />
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../stores/mainStore';
import Dropdown from './Dropdown.vue';

export default defineComponent({
  components: { Dropdown },
  props: {
    version: String
  },
  data() {
    return {
      store: useMainStore()
    };
  }
});
</script>

<style lang="scss" scoped>
@import '../styles.scss';

nav.navbar {
  background-color: $accentBg;
  padding: 0 0.5em;

  sup {
    font-size: 0.8em;
    color: $dimmedText;
  }
}

.navbar-body {
  padding: 0.25em;

  display: flex;
  justify-content: space-between;
  align-items: center;

  position: relative;

  margin: 0 auto;
  max-width: 1400px;
}

.brand {
  font-size: 1.25em;
}
</style>
