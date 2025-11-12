<template>
  <div class="dropdown" v-click-outside="() => (store.optionsOpen = false)">
    <button class="btn--image" @click="store.optionsOpen = !store.optionsOpen">
      <img src="/options.svg" :alt="t.dropdown.alt" />
    </button>

    <transition name="dropdown-anim">
      <div class="dropdown-body" v-if="store.optionsOpen">
        <h3>{{ t.dropdown.title }}</h3>
        <hr />

        <div
          style="
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5em;
            margin: 0.5em 0;
          "
        >
          <label>
            <input type="checkbox" v-model="store.filters.nonPassenger" />
            {{ t.dropdown.filters.nonPassenger }}
          </label>

          <label>
            <input type="checkbox" v-model="store.filters.terminating" />
            {{ t.dropdown.filters.terminating }}
          </label>

          <label>
            <input type="checkbox" v-model="store.filters.soundsEnabled" />
            {{ t.dropdown.filters.soundsEnabled }}
          </label>
        </div>

        <div style="margin: 0.5em 0">
          <label for="language">
            {{ t.dropdown.language.label }}:
            <select id="language" v-model="store.language">
              <option value="pl">{{ t.dropdown.language.options.pl }}</option>
              <option value="de">{{ t.dropdown.language.options.de }}</option>
            </select>
          </label>
        </div>

        <div v-if="isPragotronOpen" style="margin: 0.5em 0">
          <label for="checkpoint">
            {{ t.dropdown.checkpointLabel }}
            <select id="checkpoint" v-model="store.selectedCheckpointName">
              <option v-for="cp in store.selectedStation?.stationCheckpoints" :value="cp" :key="cp">
                {{ cp }}
              </option>
            </select>
          </label>
        </div>

        <div tabindex="0" @focus="() => (store.optionsOpen = false)"></div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../stores/mainStore';
import { translations } from '../i18n';

export default defineComponent({
  data: () => ({
    store: useMainStore()
  }),

  computed: {
    t() {
      return translations[this.store.language];
    },
    isPragotronOpen() {
      return this.$route.path == '/board';
    }
  },

  watch: {
    'store.filters': {
      deep: true,
      handler(filters: typeof this.store.filters) {
        this.saveSettings(filters, this.store.language);
      }
    },

    'store.language'(language: typeof this.store.language) {
      this.saveSettings(this.store.filters, language);
    }
  },

  methods: {
    saveSettings(filters: typeof this.store.filters, language: typeof this.store.language) {
      window.localStorage.setItem('settings', JSON.stringify({ filters, language }));
    }
  }
});
</script>

<style lang="scss" scoped>
img {
  max-width: 2em;
}

h3 {
  font-size: 1.2em;
  margin: 0;
}

.dropdown-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
}

.dropdown-body {
  position: absolute;
  top: 100%;
  right: 0;
  padding: 0.25em;
  transform: translateY(0.5em);

  width: 500px;
  max-width: calc(100% - 0.5em);
  z-index: 105;

  background-color: #000000e1;
}

.dropdown-anim {
  &-enter-active,
  &-leave-active {
    transition: all 90ms ease-out;
  }

  &-enter-from,
  &-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }
}
</style>
