export interface TimetableTrainInfo {
    timetableId: number;
    trainNo: number;
    trainCategoryCode: string;
    driverId: number;
    driverName: string;
    route: string;
    twr: number;
    skr: number;
    sceneries: string[];
}

export interface TimetableStopInfo {
    arrivalLine?: string;
    arrivalTime?: Date;
    arrivalDelay: number;
    arrivalRealTime?: Date;
    pointDistance: number;
    pointName: string;
    pointNameRAW: string;
    entryId: number;
    pointId: string;
    comments?: any;
    confirmed: number;
    isStopped: number;
    pointStopTime?: number;
    pointStopType: string;
    departureLine?: string;
    departureTime?: Date;
    departureDelay: number;
    departureRealTime?: Date;
}

export interface TimetableInfo {
    trainInfo?: TimetableTrainInfo;
    stopPoints?: TimetableStopInfo[];
}

export interface TimetableResponse {
    success: boolean;
    respCode: number;
    message: TimetableInfo;
}