import { defineStore } from 'pinia';
import type { API } from '../typings/api';

export enum DataStatus {
  LOADING = 0,
  LOADED = 1,
  ERROR = 2
}

export const useApiStore = defineStore('api', {
  state() {
    return {
      baseURL: 'https://stacjownik.spythere.eu',

      activeData: undefined as API.ActiveData.Response | undefined,
      stationData: undefined as API.Sceneries.Response | undefined,

      dataStatuses: {
        activeData: DataStatus.LOADING,
        stationData: DataStatus.LOADING
      }
    };
  },

  actions: {
    async fetchActiveData() {
      try {
        const response = await fetch(`${this.baseURL}/api/getActiveData`);
        const responseData: API.ActiveData.Response = await response.json();

        this.dataStatuses.activeData = DataStatus.LOADED;
        this.activeData = responseData;
      } catch (error) {
        this.dataStatuses.activeData = DataStatus.ERROR;

        console.error('Wystąpił błąd podczas pobierania danych:', error);
      }
    },

    async fetchSceneriesData() {
      try {
        const response = await fetch(`${this.baseURL}/api/getSceneries`);
        const responseData: API.Sceneries.Response = await response.json();

        this.dataStatuses.stationData = DataStatus.LOADED;
        this.stationData = responseData;
      } catch (error) {
        this.dataStatuses.stationData = DataStatus.ERROR;

        console.error('Wystąpił błąd podczas pobierania danych:', error);
      }
    }
  }
});
