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
    stateCd: string;
    tactTime: string;
    maxWbcCount: string;
    lowPowerPath: any[];
    runningPath: any[];
    wbcInfo: WbcInfo[];
    rbcInfo: RbcInfo[];
    userId: number;
    cassetId: string;
    isNormal: string;
    submitState?:string;
    submitOfDate?: Date;
    submitUserId?:string;
    isNsNbIntegration?: string;
    img_drive_root_path?: string;
}


interface RunningInfoRes {
    data: any[];
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


export { RuningInfo, WbcInfo, RbcInfo, ClassInfo, RunningInfoRes, RuningInfoApiRequest };
