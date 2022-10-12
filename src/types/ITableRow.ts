interface ITableRowValues {
    routeTo: string;
    routeVia: string;

    currentRouteToIndex: number;
    currentRouteViaIndex: number;

    dateDigits: string[],
}

export interface ITableRow {
    trainNumber: string;
    timetableId: number;

    routeTo: string;
    routeVia: string;

    checkpointName: string;

    arrivalTimestamp: number;
    departureTimestamp: number;

    delayMinutes: number,
    date?: Date,
    dateDigits: string[],

    tableValues: ITableRowValues;
}