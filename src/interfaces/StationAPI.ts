export interface StationInfo {
    dispatcherId: number;
    dispatcherName: string;
    dispatcherIsSupporter: boolean;
    stationName: string;
    stationHash: string;
    region: string;
    maxUsers: number;
    currentUsers: number;
    spawn: number;
    lastSeen: any;
    dispatcherExp: number;
    nameFromHeader: string;
    spawnString: string;
    networkConnectionString: string;
    isOnline: number;
    dispatcherRate: number;
}

export interface StationResponse {
    success: boolean;
    respCode: number;
    message: StationInfo[];
}