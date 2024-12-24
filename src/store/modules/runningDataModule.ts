import { Commit } from 'vuex';
export const initialState: SlideDataState = {
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
};

// RunningDataState 정의 (변경 없음)
export interface SlideDataState {
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
interface SlideDataModule {
    namespaced: true;
    state: () => SlideDataState;
    mutations: {
        setId(state: SlideDataState, id: number): void;
        setLockStatus(state: SlideDataState, lockStatus: boolean): void;
        setTraySlot(state: SlideDataState, traySlot: string): void;
        setSlotNo(state: SlideDataState, slotNo: string): void;
        setBarcodeNo(state: SlideDataState, barcodeNo: string): void;
        setPatientId(state: SlideDataState, patientId: string): void;
        setPatientNm(state: SlideDataState, patientNm: string): void;
        setGender(state: SlideDataState, gender: string): void;
        setBirthDay(state: SlideDataState, birthDay: string): void;
        setWbcCount(state: SlideDataState, wbcCount: string): void;
        setSlotId(state: SlideDataState, slotId: string): void;
        setOrderDttm(state: SlideDataState, orderDttm: string): void;
        setTestType(state: SlideDataState, testType: string): void;
        setAnalyzedDttm(state: SlideDataState, analyzedDttm: string): void;
        setTactTime(state: SlideDataState, tactTime: string): void;
        setMaxWbcCount(state: SlideDataState, maxWbcCount: string): void;
        setBfLowPowerPath(state: SlideDataState, bfLowPowerPath: string[]): void;
        setCassetId(state: SlideDataState, cassetId: string): void;
        setIsNormal(state: SlideDataState, isNormal: string): void;
        setWbcInfo(state: SlideDataState, wbcInfo: object): void;
        setWbcInfoAfter(state: SlideDataState, wbcInfoAfter: object[]): void;
        setRbcInfo(state: SlideDataState, rbcInfo: object): void;
        setRbcInfoAfter(state: SlideDataState, rbcInfoAfter: object[]): void;
        setSubmitState(state: SlideDataState, submitState: string): void;
        setSubmitOfDate(state: SlideDataState, submitOfDate: Date): void;
        setSubmitUserId(state: SlideDataState, submitUserId: string): void;
        setRbcInfoPosAfter(state: SlideDataState, rbcInfoPosAfter: string[]): void;
        setIsNsNbIntegration(state: SlideDataState, isNsNbIntegration: string): void;
        setWbcMemo(state: SlideDataState, wbcMemo: string): void;
        setRbcMemo(state: SlideDataState, rbcMemo: string): void;
        setPcIp(state: SlideDataState, pcIp: string): void;
        setCbcPatientNo(state: SlideDataState, cbcPatientNo: string): void;
        setCbcPatientNm(state: SlideDataState, cbcPatientNm: string): void;
        setCbcSex(state: SlideDataState, cbcSex: string): void;
        setCbcAge(state: SlideDataState, cbcAge: string): void;
        setImgDriveRootPath(state: SlideDataState, imgDriveRootPath: string): void;
        setHosName(state: SlideDataState, hosName: string): void;
        setAbnormalClassInfo(state: SlideDataState, abnormalClassInfo: object): void;
        resetState(state: SlideDataState): void; // 전체 초기화 메서드
    };
    actions: {
        updateSlideData({ commit }: { commit: Commit }, payload: any): void;
        resetSlideData({ commit }: { commit: Commit }): void; // 상태 초기화 액션 추가
    };
}

export const slideDataModule: SlideDataModule = {
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
        resetState(state) {
            Object.assign(state, { ...initialState });
        },

    },
    actions: {
        updateSlideData({ commit }, payload) {
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
        resetSlideData({ commit }) {
            commit('resetState');
        },

    },
};

export default slideDataModule;
