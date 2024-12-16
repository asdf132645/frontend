import { Commit } from 'vuex';

// RunningDataState 정의 (변경 없음)
export interface RunningDataState {
    id?: number;
    lock_status?: boolean;
    traySlot?: string;
    slotNo: string;
    barcodeNo: string;
    patientId: string;
    patientNm: string;
    gender: string;
    birthDay: string;
    wbcCount: string;
    slotId: string;
    orderDttm: string;
    testType: string;
    analyzedDttm: string;
    tactTime: string;
    maxWbcCount: string;
    bf_lowPowerPath?: string[];
    cassetId?: string;
    isNormal?: string;
    wbcInfo: object;
    wbcInfoAfter: object[];
    rbcInfo?: object;
    rbcInfoAfter?: object[];
    submitState?: string;
    submitOfDate?: Date;
    submitUserId?: string;
    rbcInfoPosAfter?: string[];
    isNsNbIntegration?: string;
    wbcMemo?: string;
    rbcMemo?: string;
    pcIp?: string;
    cbcPatientNo?: string;
    cbcPatientNm?: string;
    cbcSex?: string;
    cbcAge?: string;
    img_drive_root_path?: string;
    hosName?: string;
    abnormalClassInfo?: object;
}

// RunningDataModule 정의
interface RunningDataModule {
    namespaced: true;
    state: () => RunningDataState;
    mutations: {
        setId(state: RunningDataState, id: number): void;
        setLockStatus(state: RunningDataState, lockStatus: boolean): void;
        setTraySlot(state: RunningDataState, traySlot: string): void;
        setSlotNo(state: RunningDataState, slotNo: string): void;
        setBarcodeNo(state: RunningDataState, barcodeNo: string): void;
        setPatientId(state: RunningDataState, patientId: string): void;
        setPatientNm(state: RunningDataState, patientNm: string): void;
        setGender(state: RunningDataState, gender: string): void;
        setBirthDay(state: RunningDataState, birthDay: string): void;
        setWbcCount(state: RunningDataState, wbcCount: string): void;
        setSlotId(state: RunningDataState, slotId: string): void;
        setOrderDttm(state: RunningDataState, orderDttm: string): void;
        setTestType(state: RunningDataState, testType: string): void;
        setAnalyzedDttm(state: RunningDataState, analyzedDttm: string): void;
        setTactTime(state: RunningDataState, tactTime: string): void;
        setMaxWbcCount(state: RunningDataState, maxWbcCount: string): void;
        setBfLowPowerPath(state: RunningDataState, bfLowPowerPath: string[]): void;
        setCassetId(state: RunningDataState, cassetId: string): void;
        setIsNormal(state: RunningDataState, isNormal: string): void;
        setWbcInfo(state: RunningDataState, wbcInfo: object): void;
        setWbcInfoAfter(state: RunningDataState, wbcInfoAfter: object[]): void;
        setRbcInfo(state: RunningDataState, rbcInfo: object): void;
        setRbcInfoAfter(state: RunningDataState, rbcInfoAfter: object[]): void;
        setSubmitState(state: RunningDataState, submitState: string): void;
        setSubmitOfDate(state: RunningDataState, submitOfDate: Date): void;
        setSubmitUserId(state: RunningDataState, submitUserId: string): void;
        setRbcInfoPosAfter(state: RunningDataState, rbcInfoPosAfter: string[]): void;
        setIsNsNbIntegration(state: RunningDataState, isNsNbIntegration: string): void;
        setWbcMemo(state: RunningDataState, wbcMemo: string): void;
        setRbcMemo(state: RunningDataState, rbcMemo: string): void;
        setPcIp(state: RunningDataState, pcIp: string): void;
        setCbcPatientNo(state: RunningDataState, cbcPatientNo: string): void;
        setCbcPatientNm(state: RunningDataState, cbcPatientNm: string): void;
        setCbcSex(state: RunningDataState, cbcSex: string): void;
        setCbcAge(state: RunningDataState, cbcAge: string): void;
        setImgDriveRootPath(state: RunningDataState, imgDriveRootPath: string): void;
        setHosName(state: RunningDataState, hosName: string): void;
        setAbnormalClassInfo(state: RunningDataState, abnormalClassInfo: object): void;
    };
    actions: {
        updateRunningData({ commit }: { commit: Commit }, payload: any): void;
    };
}

export const runningModule: RunningDataModule = {
    namespaced: true,
    state: () => ({
        id: undefined,
        lock_status: undefined,
        traySlot: undefined,
        slotNo: '',
        barcodeNo: '',
        patientId: '',
        patientNm: '',
        gender: '',
        birthDay: '',
        wbcCount: '',
        slotId: '',
        orderDttm: '',
        testType: '',
        analyzedDttm: '',
        tactTime: '',
        maxWbcCount: '',
        bf_lowPowerPath: [],
        cassetId: '',
        isNormal: '',
        wbcInfo: {},
        wbcInfoAfter: [],
        rbcInfo: {},
        rbcInfoAfter: [],
        submitState: '',
        submitOfDate: undefined,
        submitUserId: '',
        rbcInfoPosAfter: [],
        isNsNbIntegration: '',
        wbcMemo: '',
        rbcMemo: '',
        pcIp: '',
        cbcPatientNo: '',
        cbcPatientNm: '',
        cbcSex: '',
        cbcAge: '',
        img_drive_root_path: '',
        hosName: '',
        abnormalClassInfo: {},
    }),
    mutations: {
        setId(state, id) {
            state.id = id;
        },
        setLockStatus(state, lockStatus) {
            state.lock_status = lockStatus;
        },
        setTraySlot(state, traySlot) {
            state.traySlot = traySlot;
        },
        setSlotNo(state, slotNo) {
            state.slotNo = slotNo;
        },
        setBarcodeNo(state, barcodeNo) {
            state.barcodeNo = barcodeNo;
        },
        setPatientId(state, patientId) {
            state.patientId = patientId;
        },
        setPatientNm(state, patientNm) {
            state.patientNm = patientNm;
        },
        setGender(state, gender) {
            state.gender = gender;
        },
        setBirthDay(state, birthDay) {
            state.birthDay = birthDay;
        },
        setWbcCount(state, wbcCount) {
            state.wbcCount = wbcCount;
        },
        setSlotId(state, slotId) {
            state.slotId = slotId;
        },
        setOrderDttm(state, orderDttm) {
            state.orderDttm = orderDttm;
        },
        setTestType(state, testType) {
            state.testType = testType;
        },
        setAnalyzedDttm(state, analyzedDttm) {
            state.analyzedDttm = analyzedDttm;
        },
        setTactTime(state, tactTime) {
            state.tactTime = tactTime;
        },
        setMaxWbcCount(state, maxWbcCount) {
            state.maxWbcCount = maxWbcCount;
        },
        setBfLowPowerPath(state, bfLowPowerPath) {
            state.bf_lowPowerPath = bfLowPowerPath;
        },
        setCassetId(state, cassetId) {
            state.cassetId = cassetId;
        },
        setIsNormal(state, isNormal) {
            state.isNormal = isNormal;
        },
        setWbcInfo(state, wbcInfo) {
            state.wbcInfo = wbcInfo;
        },
        setWbcInfoAfter(state, wbcInfoAfter) {
            state.wbcInfoAfter = wbcInfoAfter;
        },
        setRbcInfo(state, rbcInfo) {
            state.rbcInfo = rbcInfo;
        },
        setRbcInfoAfter(state, rbcInfoAfter) {
            state.rbcInfoAfter = rbcInfoAfter;
        },
        setSubmitState(state, submitState) {
            state.submitState = submitState;
        },
        setSubmitOfDate(state, submitOfDate) {
            state.submitOfDate = submitOfDate;
        },
        setSubmitUserId(state, submitUserId) {
            state.submitUserId = submitUserId;
        },
        setRbcInfoPosAfter(state, rbcInfoPosAfter) {
            state.rbcInfoPosAfter = rbcInfoPosAfter;
        },
        setIsNsNbIntegration(state, isNsNbIntegration) {
            state.isNsNbIntegration = isNsNbIntegration;
        },
        setWbcMemo(state, wbcMemo) {
            state.wbcMemo = wbcMemo;
        },
        setRbcMemo(state, rbcMemo) {
            state.rbcMemo = rbcMemo;
        },
        setPcIp(state, pcIp) {
            state.pcIp = pcIp;
        },
        setCbcPatientNo(state, cbcPatientNo) {
            state.cbcPatientNo = cbcPatientNo;
        },
        setCbcPatientNm(state, cbcPatientNm) {
            state.cbcPatientNm = cbcPatientNm;
        },
        setCbcSex(state, cbcSex) {
            state.cbcSex = cbcSex;
        },
        setCbcAge(state, cbcAge) {
            state.cbcAge = cbcAge;
        },
        setImgDriveRootPath(state, imgDriveRootPath) {
            state.img_drive_root_path = imgDriveRootPath;
        },
        setHosName(state, hosName) {
            state.hosName = hosName;
        },
        setAbnormalClassInfo(state, abnormalClassInfo) {
            state.abnormalClassInfo = abnormalClassInfo;
        },
    },
    actions: {
        updateRunningData({ commit }, payload) {
            // 각 필드별로 mutation을 호출하여 상태 업데이트
            commit('setId', payload.id);
            commit('setLockStatus', payload.lock_status);
            commit('setTraySlot', payload.traySlot);
            commit('setSlotNo', payload.slotNo);
            commit('setBarcodeNo', payload.barcodeNo);
            commit('setPatientId', payload.patientId);
            commit('setPatientNm', payload.patientNm);
            commit('setGender', payload.gender);
            commit('setBirthDay', payload.birthDay);
            commit('setWbcCount', payload.wbcCount);
            commit('setSlotId', payload.slotId);
            commit('setOrderDttm', payload.orderDttm);
            commit('setTestType', payload.testType);
            commit('setAnalyzedDttm', payload.analyzedDttm);
            commit('setTactTime', payload.tactTime);
            commit('setMaxWbcCount', payload.maxWbcCount);
            commit('setBfLowPowerPath', payload.bf_lowPowerPath);
            commit('setCassetId', payload.cassetId);
            commit('setIsNormal', payload.isNormal);
            commit('setWbcInfo', payload.wbcInfo);
            commit('setWbcInfoAfter', payload.wbcInfoAfter);
            commit('setRbcInfo', payload.rbcInfo);
            commit('setRbcInfoAfter', payload.rbcInfoAfter);
            commit('setSubmitState', payload.submitState);
            commit('setSubmitOfDate', payload.submitOfDate);
            commit('setSubmitUserId', payload.submitUserId);
            commit('setRbcInfoPosAfter', payload.rbcInfoPosAfter);
            commit('setIsNsNbIntegration', payload.isNsNbIntegration);
            commit('setWbcMemo', payload.wbcMemo);
            commit('setRbcMemo', payload.rbcMemo);
            commit('setPcIp', payload.pcIp);
            commit('setCbcPatientNo', payload.cbcPatientNo);
            commit('setCbcPatientNm', payload.cbcPatientNm);
            commit('setCbcSex', payload.cbcSex);
            commit('setCbcAge', payload.cbcAge);
            commit('setImgDriveRootPath', payload.img_drive_root_path);
            commit('setHosName', payload.hosName);
            commit('setAbnormalClassInfo', payload.abnormalClassInfo);
        },
    },
};

export default runningModule;
