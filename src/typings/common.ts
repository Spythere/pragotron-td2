export default interface ISceneryData {
  stationName: string;
  nameAbbreviation: string;
  stationCheckpoints: string[];
}

/* Table Rows */
export interface ITableRow {
  trainNumber: string;
  timetableId: number;

  routeTo: string;
  routeVia: string;

  checkpointName: string;

  arrivalTimestamp: number;
  departureTimestamp: number;

  delayMinutes: number;
  date?: Date;
  dateDigits: string[];

  tableValues: ITableRowValues;
}

export enum RowIndex {
  HourLeading = 0,
  HourSecondary = 1,
  MinuteLeading = 2,
  MinuteSecondary = 3,
  TrainNumber = 4,
  RouteVia = 5,
  RouteTo = 6
}

interface ITableRowValues {
  routeTo: string;
  routeVia: string;
  dateDigits: string[];
  trainNumber: string;
  // routeTo, routeVia, date1, date2, date3, date4, trainNumber
  currentRowIndexes: [number, number, number, number, number, number, number];
}
