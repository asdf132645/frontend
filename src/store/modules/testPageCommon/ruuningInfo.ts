// runningInfoModule.ts
import {Commit, Dispatch} from 'vuex';

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

export interface SlotInfo {
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

export interface RunningInfo {
    changeSlide: string;
    resultCode: string;
    resultMsg: string;
    errorLevel: { level: string; message: string };
    jobCmd: string;
    processingCode: string;
    iCasStat: number;
    oCasStat: number;
    cassetId: string;
    isRunningState: boolean;
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
        updateRunningInfo: (context: { commit: Commit }, payload: { key: keyof RunningInfo; value: string | number }) => void;

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
        updateRunningInfo({ commit }: { commit: Commit }, payload: { key: keyof RunningInfo; value: string | number }): void {
            if (payload && payload.key && payload.value !== undefined) {
                commit(`set${payload.key.charAt(0).toUpperCase() + payload.key.slice(1)}`, payload.value);
            }
        },

    },
};
