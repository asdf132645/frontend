// runing-info.interface.ts

interface WbcInfo {
    categoryId: string;
    categoryNm: string;
    classInfo: ClassInfo[];
}

interface RbcInfo {
    title: string;
    name: string;
    count: string;
    images: any[];
}

interface ClassInfo {
    classId: string;
    classNm: string;
    degree: string;
}

interface ProcessInfo {
    cassetteNo: number;
    barcodeId: string;
    patientId: string;
    patientName: string;
    wbcCount: string;
    orderDate: string;
    analyzedDttm: string;
}

interface Order {
    id: string;
    barcodeId: string;
    patientName: string;
    orderDate: string;
    analyzedDttm: string;
    state: string;
}

interface RuningInfo {
    id?: number;
    state?: boolean;
    slotNo?: string;
    traySlot?:string;
    barcodeNo: string;
    patientId: string;
    patientNm: string;
    gender: string;
    birthDay: string;
    wbcCount: string;
    slotId: string;
    orderDttm: Date;
    testType: string;
    analyzedDttm: Date;
    // pltCount: string;
    malariaCount: string;
    maxRbcCount: string;
    stateCd: string;
    tactTime: string;
    maxWbcCount: string;
    lowPowerPath: any[];
    runningPath: any[];
    wbcInfo: WbcInfo[];
    rbcInfo: RbcInfo[];
    bminfo: any[];
    userId: number;
    cassetId: string;
    isNormal: string;
    processInfo: ProcessInfo;
    orderList: Order[];
    submitState?:string;
    submitOfDate?: Date;
    signedUserId?:string;
    classificationResult?: any[];
    isNsNbIntegration?: string;
}

interface RunningInfoRes {
    data: RuningInfo[];
    total: number;
    page: number;
}

interface RuningInfoApiRequest {
    page: number;
    pageSize: number;
    startDay: string;
    endDay: string;
    barcodeNo?: string | undefined;
    patientId?: string | undefined;
    patientNm?: string | undefined;
    title?: string[] | [];
    nrCount?: number;
}


export { RuningInfo, WbcInfo, RbcInfo, ClassInfo, ProcessInfo, Order, RunningInfoRes, RuningInfoApiRequest };
