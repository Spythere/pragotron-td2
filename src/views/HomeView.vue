<template>
  <div class="home-view">
    <div>
      <h1 style="margin: 0">Wybierz region i scenerię, aby otworzyć widok pragotronu</h1>

      <div class="region-selector g-selector">
        <label v-for="region in regions" :key="region">
          <input
            type="radio"
            name="region"
            @change="changeRegion(region)"
            :checked="mainStore.region == region"
          />
          <span>{{ regionNames[region] }}</span>
        </label>
      </div>
    </div>

    <div class="scenery-selector">
      <!-- <p style="margin: 0.5em; color: #ccc">Widoczne są jedynie scenerie aktywne na serwerze PL1</p> -->

      <transition name="list-anim" tag="div" mode="out-in">
        <h3 v-if="apiStore.dataStatuses.activeData == DataStatus.LOADING">
          Ładowanie listy aktywnych scenerii...
        </h3>

        <h3 v-else-if="sceneriesOnline.length == 0">Brak aktywnych scenerii</h3>

        <ul v-else class="scenery-list" :key="mainStore.region">
          <li v-for="station in sceneriesOnline" :key="station.stationName">
            <button @click="handleClick(station.stationName)">
              {{ station.stationName }}
            </button>
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DataStatus, useApiStore } from '../stores/apiStore';
import { Region, useMainStore, regionNames } from '../stores/mainStore';

export default defineComponent({
  data() {
    return {
      apiStore: useApiStore(),
      mainStore: useMainStore(),
      regions: [Region.PL1, Region.PL2, Region.CZE, Region.DE, Region.ENG],
      DataStatus: DataStatus,
      regionNames
    };
  },

  computed: {
    sceneriesOnline() {
      return (
        this.apiStore.activeData?.activeSceneries
          .filter((station) => {
            return station.region == this.mainStore.region && station.isOnline;
          }, [])
          .sort((s1, s2) => s1.stationName.localeCompare(s2.stationName)) || []
      );
    }
  },

  methods: {
    handleClick(stationName: string) {
      this.$router.push({
        path: '/board',
        query: {
          name: stationName,
          region: this.mainStore.region
        }
      });
    },

    changeRegion(region: Region) {
      this.mainStore.region = region;
    }
  }
});
</script>

<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 3em;
}

.region-selector {
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(5, 1fr);
  max-width: 500px;
  gap: 0.5em;

  margin: 1em auto;
}

.scenery-selector > div {
  position: relative;
}

ul.scenery-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5em;

  font-size: 1.3em;
  max-width: 1000px;
}

// List animation
.list-anim-enter-active,
.list-anim-leave-active {
  transition: all 90ms ease;
}

.list-anim-enter-from,
.list-anim-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
