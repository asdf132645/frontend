// dataBaseSetDataModule.ts
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
    // pltCount: string;
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

export interface DataBaseSetData {
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

interface DataBaseSetDataState {
    dataBaseSetData: DataBaseSetData | null;
}

interface DataBaseSetDataModule {
    namespaced: true;
    state: () => DataBaseSetDataState;
    mutations: {
        setDataBaseSetData: (state: DataBaseSetDataState, value: DataBaseSetData) => void;
    };
    actions: {
        setDataBaseSetData: (context: { commit: Commit }, payload: DataBaseSetData) => void;
    };
}

export const dataBaseSetDataModule: DataBaseSetDataModule = {
    namespaced: true,
    state: () => ({
        dataBaseSetData: null,
    }),
    mutations: {
        setDataBaseSetData(state: DataBaseSetDataState, value: DataBaseSetData): void {
            // setDataBaseSetData에서 호출된 경우에만 값을 덮어쓰기
            if (value) {
                state.dataBaseSetData = {
                    ...state.dataBaseSetData, // 기존 데이터 유지
                    changeSlide: value.changeSlide ?? state.dataBaseSetData?.changeSlide,
                    resultCode: value.resultCode ?? state.dataBaseSetData?.resultCode,
                    resultMsg: value.resultMsg ?? state.dataBaseSetData?.resultMsg,
                    errorLevel: value.errorLevel ?? state.dataBaseSetData?.errorLevel,
                    jobCmd: value.jobCmd ?? state.dataBaseSetData?.jobCmd,
                    processingCode: value.processingCode ?? state.dataBaseSetData?.processingCode,
                    iCasStat: value.iCasStat ?? state.dataBaseSetData?.iCasStat,
                    oCasStat: value.oCasStat ?? state.dataBaseSetData?.oCasStat,
                    cassetId: value.cassetId ?? state.dataBaseSetData?.cassetId,
                    isRunningState: value.isRunningState ?? state.dataBaseSetData?.isRunningState,
                    slotInfo: value.slotInfo
                        ? value.slotInfo.map((slot) => {
                            const existingSlot = state.dataBaseSetData?.slotInfo?.find(
                                (existing) => existing?.slotId === slot?.slotId
                            );
                            return existingSlot ? { ...existingSlot, ...slot } : slot!;
                        })
                        : state.dataBaseSetData?.slotInfo ?? [],
                };
            }
        },
    },
    actions: {
        setDataBaseSetData({ commit }: { commit: Commit }, payload: DataBaseSetData): void {
            commit('setDataBaseSetData', payload);
        },
    },
};
