interface ITableRowValues {
  routeTo: string;
  routeVia: string;

  // routeTo, routeVia, date1, date2, date3, date4
  currentRowIndexes: [number, number, number, number, number, number];

  dateDigits: string[];
}

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
