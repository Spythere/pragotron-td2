interface IDepartureTableValues {
    routeTo: string;
    routeVia: string;
}

export interface IDeparture {
    trainNumber: string;
    timetableId: number;

    routeTo: string;
    routeVia: string;

    arrivalTimestamp: number;
    departureTimestamp: number;

    delayMinutes: number,
    departureDate?: Date,
    departureDigits: string[],

    tableValues: IDepartureTableValues;
}