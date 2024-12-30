// commonModule.ts
import {Commit} from 'vuex';

export interface CommonState {
    startEmbedded: boolean;
    eqStatCd: number;
    isRunningState: boolean;
    isCompleteAlarm: boolean;
    isErrorAlarm: boolean;
    totalSlideTime: string;
    iaRootPath: string;
    runningSlotId: string;
    runningInfoStop: boolean;
    reqArr: any[];
    firstLoading: boolean;
    slotIndex: number;
    viewerCheck: string;
    loginSetData: string;
    siteCd: string;
    deviceSerialNm: string;
    moveImgIsBool: boolean;
    classInfoSort: any[];
    cbcLayer: boolean;
    inhaTestCode: string;
    rbcReData: boolean;
    rbcReDataClass: boolean;
    resetRbcArr: boolean;
    selectedSampleId: string;
    classInfoArr: any[];
    rbcReDataCheck: boolean;
    dataBasePageReset: boolean;
    resetAnalyzing: boolean;
    testType: string;
    isNsNbIntegration: string;
    analysisType: string;
    beforeSettingFormattedString: string;
    afterSettingFormattedString: string;
    settingChangedChecker: boolean;
    dbListDataFirstNum: number;
    dbListDataLastNum: number;
    isTcpConnected: boolean;
    initValData: boolean;
    enteringRouterPath: string;
    settingType: string;
    isRewindingBelt: boolean;
    rbcImagePageNumber: number;
    showLISUploadAfterCheckingAll: boolean;
    slideDataReset: string;
}

interface CommonModule {
    namespaced: true;
    state: () => CommonState;
    mutations: {
        setStartEmbedded: (state: CommonState, value: boolean) => void;
        setEqStatCd: (state: CommonState, value: number) => void;
        setIsRunningState: (state: CommonState, value: boolean) => void;
        setIsCompleteAlarm: (state: CommonState, value: boolean) => void;
        setIsErrorAlarm: (state: CommonState, value: boolean) => void;
        setTotalSlideTime: (state: CommonState, value: string) => void;
        setIaRootPath: (state: CommonState, value: string) => void;
        setRunningSlotId: (state: CommonState, value: string) => void;
        setRunningInfoStop: (state: CommonState, value: boolean) => void;
        setReqArr: (state: CommonState, value: string[]) => void;
        shiftReqArr: (state: CommonState) => void;
        setReqArrPaste: (state: CommonState, value: any[]) => void;
        setFirstLoading: (state: CommonState, value: boolean) => void;
        setSlotIndex: (state: CommonState, value: number) => void;
        setViewerCheck: (state: CommonState, value: string) => void;
        setLoginSetData: (state: CommonState, value: string) => void;
        setSiteCd: (state: CommonState, value: string) => void;
        setDeviceSerialNm: (state: CommonState, value: string) => void;
        setMoveImgIsBool: (state: CommonState, value: boolean) => void;
        setClassInfoSort: (state: CommonState, value: any[]) => void;
        setCbcLayer: (state: CommonState, value: boolean) => void;
        setInhaTestCode: (state: CommonState, value: string) => void;
        setRbcReData: (state: CommonState, value: boolean) => void;
        setRbcReDataClass: (state: CommonState, value: boolean) => void;
        setResetRbcArr: (state: CommonState, value: boolean) => void;
        setSelectedSampleId: (state: CommonState, value: string) => void;
        setClassInfoArr: (state: CommonState, value: any[]) => void;
        setRbcReDataCheck: (state: CommonState, value: boolean) => void;
        setDataBasePageReset: (state: CommonState, value: boolean) => void;
        setResetAnalyzing: (state: CommonState, value: boolean) => void;
        setTestType: (state: CommonState, value: string) => void;
        setIsNsNbIntegration: (state: CommonState, value: string) => void;
        setAnalysisType: (state: CommonState, value: string) => void;
        setBeforeSettingFormattedString: (state: CommonState, value: string) => void;
        setAfterSettingFormattedString: (state: CommonState, value: string) => void;
        setSettingChangedChecker: (state: CommonState, value: boolean) => void;
        setDbListDataFirstNum: (state: CommonState, value: number) => void;
        setDbListDataLastNum: (state: CommonState, value: number) => void;
        setIsTcpConnected: (state: CommonState, value: boolean) => void;
        setInitValData: (state: CommonState, value: boolean) => void;
        setEnteringRouterPath: (state: CommonState, value: string) => void;
        setSettingType: (state: CommonState, value: string) => void;
        setIsRewindingBelt: (state: CommonState, value: boolean) => void;
        setRbcImagePageNumber: (state: CommonState, value: number) => void;
        setShowLISUploadAfterCheckingAll: (state: CommonState, value: boolean) => void;
        setSlideDataReset: (state: CommonState, value: string) => void;
    };
    actions: {
        setCommonInfo: (context: { commit: Commit }, payload: CommonState) => void;
    };
}

export const commonModule: CommonModule = {
    namespaced: true,
    state: () => ({
        startEmbedded: false,
        eqStatCd: 0,
        isRunningState: false,
        isCompleteAlarm: false,
        isErrorAlarm: false,
        totalSlideTime: '00:00:00',
        iaRootPath: '',
        runningSlotId: '',
        runningInfoStop: false,
        reqArr: [],
        firstLoading: false,
        slotIndex: 0,
        viewerCheck: '',
        loginSetData: '',
        siteCd: '',
        deviceSerialNm: '',
        moveImgIsBool: false,
        classInfoSort: [],
        cbcLayer: false,
        inhaTestCode: '',
        rbcReData: false,
        rbcReDataClass: false,
        resetRbcArr: false,
        selectedSampleId: '',
        classInfoArr:[],
        rbcReDataCheck: false,
        dataBasePageReset: false,
        resetAnalyzing: false,
        testType: '',
        isNsNbIntegration: 'N',
        analysisType: '',
        beforeSettingFormattedString: '',
        afterSettingFormattedString: '',
        settingChangedChecker: false,
        dbListDataFirstNum: 0,
        dbListDataLastNum: 0,
        isTcpConnected: false,
        initValData: false,
        enteringRouterPath: '',
        settingType: '',
        isRewindingBelt: false,
        rbcImagePageNumber: 0,
        showLISUploadAfterCheckingAll: false,
        slideDataReset: '',
    }),
    mutations: {
        setStartEmbedded(state: CommonState, value: boolean): void {
            state.startEmbedded = value;
        },
        setEqStatCd(state: CommonState, value: number): void {
            state.eqStatCd = value;
        },
        setIsRunningState(state: CommonState, value: boolean): void {
            state.isRunningState = value;
        },
        setIsCompleteAlarm(state: CommonState, value: boolean): void {
            state.isCompleteAlarm = value;
        },
        setIsErrorAlarm(state: CommonState, value: boolean): void {
            state.isErrorAlarm = value;
        },
        setTotalSlideTime(state: CommonState, value: string): void {
            state.totalSlideTime = value;
        },
        setIaRootPath(state: CommonState, value: string): void {
            state.iaRootPath = value;
        },
        setRunningSlotId(state: CommonState, value: string): void {
            state.runningSlotId = value;
        },
        setRunningInfoStop(state: CommonState, value: boolean): void {
            state.runningInfoStop = value;
        },
        setReqArr(state: CommonState, value: any[]): void {
            if (!state.reqArr) {
                state.reqArr = []; // 배열이 없으면 빈 배열로 초기화
            }
            state.reqArr.push(value);
        },
        shiftReqArr(state: CommonState): void {
            state.reqArr.shift();
        },
        setReqArrPaste(state: CommonState, value: any[]): void {
            state.reqArr = value;
        },
        setFirstLoading(state: CommonState, value: boolean): void {
            state.firstLoading = value;
        },
        setSlotIndex(state: CommonState, value: number): void {
            state.slotIndex = value;
        },
        setViewerCheck(state: CommonState, value: string): void {
            state.viewerCheck = value;
        },
        setLoginSetData(state: CommonState, value: string): void {
            state.loginSetData = value;
        },
        setDeviceSerialNm(state: CommonState, value: string): void {
            state.deviceSerialNm = value;
        },
        setSiteCd(state: CommonState, value: string): void {
            state.siteCd = value;
        },
        setMoveImgIsBool(state: CommonState, value: boolean): void {
            state.moveImgIsBool = value;
        },
        setClassInfoSort(state: CommonState, value: any[]): void {
            state.classInfoSort = value;
        },
        setSelectedSampleId(state: CommonState, value: string): void {
            state.selectedSampleId = value;
        },
        setCbcLayer(state: CommonState, value: boolean): void {
            state.cbcLayer = value;
        },
        setInhaTestCode(state: CommonState, value: string): void {
            state.inhaTestCode = value;
        },
        setRbcReData(state: CommonState, value: boolean): void {
            state.rbcReData = value;
        },
        setRbcReDataClass(state: CommonState, value: boolean): void {
            state.rbcReDataClass = value;
        },
        setResetRbcArr(state: CommonState, value: boolean): void {
            state.resetRbcArr = value;
        },
        setClassInfoArr(state: CommonState, value: any[]): void {
            state.classInfoArr = value;
        },
        setRbcReDataCheck(state: CommonState, value: boolean): void {
            state.rbcReDataCheck = value;
        },
        setDataBasePageReset(state: CommonState, value: boolean): void {
            state.dataBasePageReset = value;
        },
        setResetAnalyzing(state: CommonState, value: boolean): void {
            state.resetAnalyzing = value;
        },
        setTestType(state: CommonState, value: string): void {
            state.testType = value;
        },
        setIsNsNbIntegration(state: CommonState, value: string): void {
            state.isNsNbIntegration = value;
        },
        setAnalysisType(state: CommonState, value: string): void {
            state.analysisType = value;
        },
        setBeforeSettingFormattedString(state: CommonState, value: string): void {
            state.beforeSettingFormattedString = value;
        },
        setAfterSettingFormattedString(state: CommonState, value: string): void {
            state.afterSettingFormattedString = value;
        },
        setSettingChangedChecker(state: CommonState, value: boolean): void {
            state.settingChangedChecker = value;
        },
        setDbListDataFirstNum(state: CommonState, value: number): void {
            state.dbListDataFirstNum = value;
        },
        setDbListDataLastNum(state: CommonState, value: number): void {
            state.dbListDataLastNum = value;
        },
        setIsTcpConnected(state: CommonState, value: boolean): void {
            state.isTcpConnected = value;
        },
        setInitValData(state: CommonState, value: boolean): void {
            state.initValData = value;
        },
        setEnteringRouterPath(state: CommonState, value: string): void {
            state.enteringRouterPath = value;
        },
        setSettingType(state: CommonState, value: string): void {
            state.settingType = value;
        },
        setIsRewindingBelt(state: CommonState, value: boolean): void {
            state.isRewindingBelt = value;
        },
        setRbcImagePageNumber(state: CommonState, value: number): void {
            state.rbcImagePageNumber = value;
        },
        setShowLISUploadAfterCheckingAll(state: CommonState, value: boolean): void {
            state.showLISUploadAfterCheckingAll = value;
        },
        setSlideDataReset(state: CommonState, value: string): void{
            state.slideDataReset = value;
        }
    },
    actions: {
        setCommonInfo({commit}: { commit: Commit }, payload: CommonState): void {
            if (payload.hasOwnProperty('startEmbedded')) {
                commit('setStartEmbedded', payload.startEmbedded);
            }

            if (payload.hasOwnProperty('eqStatCd')) {
                commit('setEqStatCd', payload.eqStatCd);
            }

            if (payload.hasOwnProperty('isRunningState')) {
                commit('setIsRunningState', payload.isRunningState);
            }
            if (payload.hasOwnProperty('isCompleteAlarm')) {
                commit('setIsCompleteAlarm', payload.isCompleteAlarm);
            }
            if (payload.hasOwnProperty('isErrorAlarm')) {
                commit('setIsErrorAlarm', payload.isErrorAlarm);
            }
            if (payload.hasOwnProperty('totalSlideTime')) {
                commit('setTotalSlideTime', payload.totalSlideTime);
            }
            if (payload.hasOwnProperty('iaRootPath')) {
                commit('setIaRootPath', payload.iaRootPath);
            }
            if (payload.hasOwnProperty('runningSlotId')) {
                commit('setRunningSlotId', payload.runningSlotId);
            }
            if (payload.hasOwnProperty('runningInfoStop')) {
                commit('setRunningInfoStop', payload.runningInfoStop);
            }
            if (payload.hasOwnProperty('reqArr')) {
                commit('setReqArr', payload.reqArr);
            }
            if (payload.hasOwnProperty('shiftReqArr')) {
                commit('shiftReqArr');
            }
            if (payload.hasOwnProperty('reqArrPaste')) {
                commit('setReqArrPaste', payload.reqArr);
            }
            if (payload.hasOwnProperty('firstLoading')) {
                commit('setFirstLoading', payload.firstLoading);
            }
            if (payload.hasOwnProperty('slotIndex')) {
                commit('setSlotIndex', payload.slotIndex);
            }
            if (payload.hasOwnProperty('viewerCheck')) {
                commit('setViewerCheck', payload.viewerCheck);
            }
            if (payload.hasOwnProperty('loginSetData')) {
                commit('setLoginSetData', payload.loginSetData);
            }
            if (payload.hasOwnProperty('siteCd')) {
                commit('setSiteCd', payload.siteCd);
            }
            if (payload.hasOwnProperty('deviceSerialNm')) {
                commit('setDeviceSerialNm', payload.deviceSerialNm);
            }
            if (payload.hasOwnProperty('moveImgIsBool')) {
                commit('setMoveImgIsBool', payload.moveImgIsBool)
            }
            if (payload.hasOwnProperty('classInfoSort')) {
                commit('setClassInfoSort', payload.classInfoSort)
            }
            if (payload.hasOwnProperty('selectedSampleId')) {
                commit('setSelectedSampleId', payload.selectedSampleId)
            }
            if (payload.hasOwnProperty('cbcLayer')) {
                commit('setCbcLayer', payload.cbcLayer)
            }
            // setInhaTestCode
            if (payload.hasOwnProperty('inhaTestCode')) {
                commit('setInhaTestCode', payload.inhaTestCode)
            }
            if (payload.hasOwnProperty('rbcReData')) {
                commit('setRbcReData', payload.rbcReData)
            }
            if(payload.hasOwnProperty('rbcReDataClass')){
                commit('setRbcReDataClass', payload.rbcReDataClass)
            }
            if(payload.hasOwnProperty('resetRbcArr')) {
                commit('setResetRbcArr', payload.resetRbcArr)
            }
            if(payload.hasOwnProperty('classInfoArr')) {
                commit('setClassInfoArr', payload.classInfoArr)
            }
            if (payload.hasOwnProperty('rbcReDataCheck')){
                commit('setRbcReDataCheck', payload.rbcReDataCheck)
            }
            if (payload.hasOwnProperty('dataBasePageReset')){
                commit('setDataBasePageReset', payload.dataBasePageReset);
            }
            if (payload.hasOwnProperty('resetAnalyzing')){
                commit('setResetAnalyzing', payload.resetAnalyzing);
            }
            if (payload.hasOwnProperty('testType')){
                commit('setTestType', payload.testType);
            }
            if (payload.hasOwnProperty('isNsNbIntegration')) {
                commit('setIsNsNbIntegration', payload.isNsNbIntegration);
            }
            if (payload.hasOwnProperty('analysisType')) {
                commit('setAnalysisType', payload.analysisType);
            }
            if (payload.hasOwnProperty('beforeSettingFormattedString')) {
                commit('setBeforeSettingFormattedString', payload.beforeSettingFormattedString);
            }
            if (payload.hasOwnProperty('afterSettingFormattedString')) {
                commit('setAfterSettingFormattedString', payload.afterSettingFormattedString);
            }
            if (payload.hasOwnProperty('settingChangedChecker')) {
                commit('setSettingChangedChecker', payload.settingChangedChecker);
            }
            if (payload.hasOwnProperty('dbListDataFirstNum')) {
                commit('setDbListDataFirstNum', payload.dbListDataFirstNum);
            }
            if (payload.hasOwnProperty('dbListDataLastNum')) {
                commit('setDbListDataLastNum', payload.dbListDataLastNum);
            }
            if (payload.hasOwnProperty('isTcpConnected')) {
                commit('setIsTcpConnected', payload.isTcpConnected);
            }
            if (payload.hasOwnProperty('initValData')) {
                commit('setInitValData', payload.initValData);
            }
            if (payload.hasOwnProperty('enteringRouterPath')) {
                commit('setEnteringRouterPath', payload.enteringRouterPath);
            }
            if (payload.hasOwnProperty('settingType')) {
                commit('setSettingType', payload.settingType);
            }
            if (payload.hasOwnProperty('isRewindingBelt')) {
                commit('setIsRewindingBelt', payload.isRewindingBelt);
            }
            if (payload.hasOwnProperty('rbcImagePageNumber')) {
                commit('setRbcImagePageNumber', payload.rbcImagePageNumber);
            }
            if (payload.hasOwnProperty('showLISUploadAfterCheckingAll')) {
                commit('setShowLISUploadAfterCheckingAll', payload.showLISUploadAfterCheckingAll);
            }
            if(payload.hasOwnProperty('slideDataReset')){
                commit('setSlideDataReset', payload.slideDataReset);
            }
        },
    },
};
