export interface ITimetableStop {
  stopName: string;
  stopNameRAW: string;
  stopType: string;
  stopDistance: number;
  pointId: string;
  comments?: string;
  mainStop: boolean;
  arrivalLine: string | null;
  arrivalTimestamp: number;
  arrivalRealTimestamp: number;
  arrivalDelay: number;
  departureLine: string | null;
  departureTimestamp: number;
  departureRealTimestamp: number;
  departureDelay: number;
  beginsHere: boolean;
  terminatesHere: boolean;
  confirmed: number;
  stopped: number;
  stopTime?: number;
}

export interface ITrainTimetable {
  SKR: number;
  TWR: number;
  category: string;
  stopList: ITimetableStop[];
  route: string;
  timetableId: number;
  sceneries: string[];
}

export interface ITrainResponse {
  trainNo: number;
  mass: number;
  speed: number;
  length: number;
  distance: number;
  stockString: string;
  driverName: string;
  driverId: number;
  driverIsSupporter: boolean;
  currentStationHash: string;
  currentStationName: string;
  signal: string;
  connectedTrack: string;
  online: number;
  lastSeen: any;
  region: string;
  isTimeout: boolean;
  timetable: ITrainTimetable;
}
