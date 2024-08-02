import { defineStore } from 'pinia';
import { API } from '../typings/api';
import http from '../http';

export enum DataStatus {
  LOADING = 0,
  LOADED = 1,
  ERROR = 2
}

export const useApiStore = defineStore('api', {
  state() {
    return {
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
        const response = (await http.get<API.ActiveData.Response | undefined>('api/getActiveData'))
          .data;

        this.dataStatuses.activeData = DataStatus.LOADED;
        this.activeData = response;
      } catch (error) {
        this.dataStatuses.activeData = DataStatus.ERROR;

        console.error('Wystąpił błąd podczas pobierania danych:', error);
      }
    },

    async fetchSceneriesData() {
      try {
        const response = (await http.get<API.Sceneries.Response | undefined>('api/getSceneries'))
          .data;

        this.dataStatuses.stationData = DataStatus.LOADED;
        this.stationData = response;
      } catch (error) {
        this.dataStatuses.stationData = DataStatus.ERROR;

        console.error('Wystąpił błąd podczas pobierania danych:', error);
      }
    }
  }
});
