<template>
  <div class="filters-dropdown">
    <div class="wrapper">
      <div class="checkboxes">
        <label>
          <input type="checkbox" v-model="mainStore.filters.nonPassenger" />
          {{ $t('options.checkbox-non-passenger') }}
        </label>

        <label>
          <input type="checkbox" v-model="mainStore.filters.terminating" />
          {{ $t('options.checkbox-terminating') }}
        </label>

        <label>
          <input type="checkbox" v-model="mainStore.filters.soundsEnabled" />
          {{ $t('options.checkbox-sounds') }}
        </label>
      </div>

      <hr />

      <div class="selectors">
        <label for="station" v-if="apiStore.activeData">
          {{ $t('options.station-name') }}
          <select id="station" v-model="mainStore.selectedStationName" @change="selectStation">
            <option
              v-for="scenery in sceneriesOnline"
              :value="scenery.stationName"
              :key="scenery.stationName"
            >
              {{ scenery.stationName }}
            </option>
          </select>
        </label>

        <label for="checkpoint">
          {{ $t('options.checkpoint-name') }}
          <select id="checkpoint" v-model="mainStore.selectedCheckpointName">
            <option
              v-for="checkpointName in mainStore.selectedStation?.stationCheckpoints"
              :value="checkpointName"
              :key="checkpointName"
            >
              {{ checkpointName }}
            </option>
          </select>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useMainStore } from '../stores/mainStore';
import { useApiStore } from '../stores/apiStore';

const mainStore = useMainStore();
const apiStore = useApiStore();

const emits = defineEmits(['stationChanged']);

function selectStation() {
  emits('stationChanged');
}

const sceneriesOnline = computed(() => {
  if (!apiStore.activeData) return [];

  return apiStore.activeData.activeSceneries
    .filter((station) => {
      return station.region == mainStore.region && station.isOnline;
    }, [])
    .sort((s1, s2) => s1.stationName.localeCompare(s2.stationName));
});
</script>

<style lang="scss" scoped>
.filters-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: auto;
}

.wrapper {
  background-color: rgba(0, 0, 0, 0.95);
  padding: 0.5em;
  border-radius: 0.5em 0 0.5em 0.5em;
}

.checkboxes label,
.selectors label {
  display: block;
  text-align: left;
  padding: 0.25em;
}
</style>
