<template>
  <div>
    <PragotronVue />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import PragotronVue from './components/Pragotron.vue';

export default defineComponent({
  components: {
    PragotronVue,
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

#app {
  text-align: center;

  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100vh;
}
</style>
