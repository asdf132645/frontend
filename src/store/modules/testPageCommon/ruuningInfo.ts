// runningInfoModule.ts
import { Commit } from 'vuex';

interface ClassInfo {
    classId: string;
    classNm: string;
    degree: string;
}

interface Image {
    fileName: string;
}

interface WbcInfo {
    id: string;
    title: string;
    name: string;
    count: string;
    images: Image[];
}

interface RbcInfo {
    categoryId: string;
    categoryNm: string;
    classInfo: ClassInfo[];
}

interface SlotInfo {
    slotNo: string;
    barcodeNo: string;
    patientId: string;
    patientNm: string;
    gender: string;
    birthDay: string;
    runningPath: string[];
    wbcCount: string;
    slotId: string;
    orderDttm: string;
    testType: string;
    analyzedDttm: string;
    malariaCount: string;
    pltCount: string;
    maxWbcCount: string;
    maxRbcCount: string;
    stateCd: string;
    isLowPowerScan: string;
    tactTime: string;
    lowPowerPath: string[];
    isNsNbIntegration: string;
    seqNo: string;
    path: string;
    isHighPowerScan: string;
    wbcInfo: WbcInfo[];
    rbcInfo: RbcInfo[];
}

interface RunningInfo {
    resultCode: string;
    resultMsg: string;
    errorLevel: { level: string; message: string };
    jobCmd: string;
    processingCode: string;
    iCasStat: number;
    oCasStat: number;
    cassetId: string;
    slotInfo: SlotInfo[];
}

interface RunningInfoState {
    runningInfo: RunningInfo | null;
}

interface RunningInfoModule {
    namespaced: true;
    state: () => RunningInfoState;
    mutations: {
        setRunningInfo: (state: RunningInfoState, value: RunningInfo) => void;
    };
    actions: {
        setRunningInfo: (context: { commit: Commit }, payload: RunningInfo) => void;
    };
}

export const runningInfoModule: RunningInfoModule = {
    namespaced: true,
    state: () => ({
        runningInfo: null,
    }),
    mutations: {
        setRunningInfo(state: RunningInfoState, value: RunningInfo): void {
            state.runningInfo = value;
        },
    },
    actions: {
        setRunningInfo({ commit }: { commit: Commit }, payload: RunningInfo): void {
            commit('setRunningInfo', payload);
        },
    },
};
