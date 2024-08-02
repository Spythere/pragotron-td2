export namespace API {
  export namespace ActiveData {
    export interface Response {
      activeSceneries: ActiveScenery[];
      trains: ActiveTrain[];
    }

    export interface ActiveScenery {
      dispatcherId: number;
      dispatcherName: string;
      dispatcherIsSupporter: boolean;
      stationName: string;
      stationHash: string;
      region: string;
      maxUsers: number;
      currentUsers: number;
      spawn: number;
      lastSeen: number;
      dispatcherExp: number;
      nameFromHeader: string;
      spawnString: string | null;
      networkConnectionString: string;
      isOnline: number;
      dispatcherRate: number;
      dispatcherStatus: number;
    }

    export interface ActiveTrain {
      trainNo: number;

      mass: number;
      length: number;
      speed: number;
      stockString: string;

      signal: string;
      distance: number;
      connectedTrack: string;

      driverName: string;
      driverId: number;
      driverIsSupporter: boolean;
      driverLevel?: number;

      currentStationName: string;
      currentStationHash?: string;

      online: number;
      lastSeen: number;

      region: string;
      isTimeout: boolean;

      timetable?: Timetable;
    }

    export interface TimetableStop {
      stopName: string;
      stopNameRAW: string;
      stopType: string;
      stopDistance: number;
      pointId: string;

      mainStop: boolean;

      arrivalLine: string | null;
      arrivalTimestamp: number;
      arrivalRealTimestamp: number;
      arrivalDelay: number;

      departureLine: string | null;
      departureTimestamp: number;
      departureRealTimestamp: number;
      departureDelay: number;

      comments?: any;

      beginsHere: boolean;
      terminatesHere: boolean;
      confirmed: number;
      stopped: number;
      stopTime: number | null;
    }

    export interface Timetable {
      timetableId: number;
      category: string;
      route: string;

      stopList: TimetableStop[];

      TWR: boolean;
      SKR: boolean;
      sceneries: string[];
    }
  }

  export namespace Sceneries {
    export type Response = Scenery[];

    export interface Scenery {
      createdAt: string;
      updatedAt?: string;
      id: number;
      name: string;
      SUP: boolean;
      authors: string;
      availability: string;
      backupJSON: any;
      checkpoints?: string;
      controlType: string;
      lines?: string;
      project?: string;
      reqLevel: number;
      routes?: string;
      routesInfo: RoutesInfo[];
      signalType: string;
      supportersOnly?: boolean;
      url?: string;
      projectUrl?: string;
      hash?: string;
      abbr: string;
      hidden: boolean;
    }

    export interface RoutesInfo {
      routeName: string;
      isElectric: boolean;
      isInternal: boolean;
      isRouteSBL: boolean;
      routeSpeed: number;
      routeLength: number;
      routeTracks: number;
    }
  }
}
