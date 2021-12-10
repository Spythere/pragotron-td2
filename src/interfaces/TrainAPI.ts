export interface TrainInfo {
    trainNo: number;
    driverId: number;
    driverName: string;
    driverIsSupporter: boolean;
    station: any;
    dataSignal: string;
    dataSceneryConnection: string;
    dataDistance: number;
    dataCon: string;
    dataSpeed: number;
    dataMass: number;
    dataLength: number;
    region: string;
    isOnline: number;
    lastSeen: any;
}

export interface TrainResponse {
    success: boolean;
    respCode: number;
    message: TrainInfo[];
}
