import { defineStore } from 'pinia';
import ISceneryData from '../types/ISceneryData';
import { useApiStore } from './apiStore';

export enum Region {
  PL1 = 'eu',
  PL2 = 'cae',
  CZE = 'usw',
  DE = 'us ',
  ENG = 'ru'
}

export const regionNames = {
  [Region.PL1]: 'PL1',
  [Region.PL2]: 'PL2',
  [Region.CZE]: 'CZE',
  [Region.DE]: 'DE',
  [Region.ENG]: 'ENG'
};

export const useMainStore = defineStore('main', {
  state() {
    return {
      region: Region.PL1,
      optionsOpen: false,
      filters: {
        nonPassenger: true,
        terminating: true,
        timetableMode: 'departures' as 'departures' | 'arrivals',
        soundsEnabled: false
      },
      selectedStationName: '',
      selectedCheckpointName: ''
    };
  },

  getters: {
    selectedStation(state): ISceneryData | undefined {
      const apiStore = useApiStore();
      const station = apiStore.stationData?.find(({ name }) => name == state.selectedStationName);

      if (!station) return undefined;

      return {
        stationName: station.name,
        stationCheckpoints:
          station.checkpoints && station.checkpoints.length > 0
            ? station.checkpoints.split(';')
            : [station.name],
        nameAbbreviation: ''
      };
    }
  }
});
