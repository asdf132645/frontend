// runningInfoModule.ts
import {Commit, Dispatch} from 'vuex';
export interface ChangeSlideState {
    changeSlide: string;
}

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
    iCasStat: string;
    oCasStat: string;
    cassetId: string;
    isRunningState: boolean;
    slotInfo: SlotInfo[];
}

interface RunningInfoState {
    runningInfo: RunningInfo | null;
    changeSlideState: ChangeSlideState | null;
}

interface RunningInfoModule {
    namespaced: true;
    state: () => RunningInfoState;
    mutations: {
        setRunningInfo: (state: RunningInfoState, value: RunningInfo) => void;
        setChangeSlide: (state: RunningInfoState, value: string) => void;
    };
    actions: {
        setRunningInfo: (context: { commit: Commit }, payload: RunningInfo) => void;
        updateRunningInfo: (context: { commit: Commit }, payload: { key: keyof RunningInfo; value: string | number }) => void;
        setChangeSlide: (context: { commit: Commit }, value: string) => void;
    };
}

export const runningInfoModule: RunningInfoModule = {
    namespaced: true,
    state: () => ({
        runningInfo: null,
        changeSlideState: null,
    }),
    mutations: {
        setRunningInfo(state: RunningInfoState, value: RunningInfo): void {
            // setRunningInfo에서 호출된 경우에만 값을 덮어쓰기
            if (value) {
                state.runningInfo = value;
            }
        },
        setChangeSlide(state: RunningInfoState, value: string): void {
            if (state.changeSlideState) {
                state.changeSlideState.changeSlide = value;
            } else {
                state.changeSlideState = { changeSlide: value };
            }
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
        setChangeSlide({ commit }: { commit: Commit }, value: string): void {
            commit('setChangeSlide', value);
        },
    },
};
