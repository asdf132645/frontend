// commonModule.ts
import {Commit} from 'vuex';

export interface CommonState {
    startEmbedded: boolean;
    eqStatCd: number;
    isRunningState: boolean;
    totalCount: string;
    embeddedNumber: string;
    isAlarm: boolean;
    bfSelectFiles: any[];
    slideProceeding: string;
    totalSlideTime: string;
    pbiaRootPath: string;
    runningSlotId: string;
    isRequestInProgress: boolean;
    startInfoBoolen: boolean;
    runningInfoBoolen: boolean;
    runningInfoStop: boolean;
    reqArr: any[];
    resFlag: boolean;
    firstLoading: boolean;
    slotIndex: number;
    viewerCheck: string;
    runningArr: any[];
    classArr: any[];
    rbcArr: any[];
    processInfo: any[];
    orderList: any[];
    loginSetData: string;
    siteCd: string;
    deviceBarcode: string;
}

interface CommonModule {
    namespaced: true;
    state: () => CommonState;
    mutations: {
        setStartEmbedded: (state: CommonState, value: boolean) => void;
        setEqStatCd: (state: CommonState, value: number) => void;
        setIsRunningState: (state: CommonState, value: boolean) => void;
        setTotalCount: (state: CommonState, value: string) => void;
        setEmbeddedNumber: (state: CommonState, value: string) => void;
        setIsAlarm: (state: CommonState, value: boolean) => void;
        setBfSelectFiles: (state: CommonState, value: []) => void;
        setSlideProceeding: (state: CommonState, value: string) => void;
        setTotalSlideTime: (state: CommonState, value: string) => void;
        setPbiaRootPath: (state: CommonState, value: string) => void;
        setRunningSlotId: (state: CommonState, value: string) => void;
        setIsRequestInProgress: (state: CommonState, value: boolean) => void;
        setStartInfoBoolen: (state: CommonState, value: boolean) => void;
        setRunningInfoBoolen: (state: CommonState, value: boolean) => void;
        setRunningInfoStop: (state: CommonState, value: boolean) => void;
        setReqArr: (state: CommonState, value: string[]) => void;
        shiftReqArr: (state: CommonState) => void;
        setReqArrPaste: (state: CommonState, value: any[]) => void;
        setResFlag: (state: CommonState, value: boolean) => void;
        setFirstLoading: (state: CommonState, value: boolean) => void;
        setSlotIndex: (state: CommonState, value: number) => void;
        setViewerCheck: (state: CommonState, value: string) => void;
        setRunningArr: (state: CommonState, value: any[]) => void;
        setClassArr: (state: CommonState, value: any[]) => void;
        setRbcArr: (state: CommonState, value: any[]) => void;
        setProcessInfo: (state: CommonState, value: any[]) => void;
        setOrderList: (state: CommonState, value: any[]) => void;
        setLoginSetData: (state: CommonState, value: string) => void;
        setSiteCd: (state: CommonState, value: string) => void;
        setDeviceBarcode: (state: CommonState, value: string) => void;
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
        totalCount: '',
        embeddedNumber: '',
        isAlarm: false,
        bfSelectFiles: [],
        slideProceeding: '',
        totalSlideTime: '00:00:00',
        pbiaRootPath: '',
        runningSlotId: '',
        isRequestInProgress: false,
        startInfoBoolen: false,
        runningInfoBoolen: false,
        runningInfoStop: false,
        reqArr: [],
        resFlag: true,
        firstLoading: false,
        slotIndex: 0,
        viewerCheck: '',
        runningArr: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        classArr: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        rbcArr: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        processInfo: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        orderList: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        loginSetData: '',
        siteCd: '',
        deviceBarcode: '',
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
        setTotalCount(state: CommonState, value: string): void {
            state.totalCount = value;
        },
        setEmbeddedNumber(state: CommonState, value: string): void {
            state.embeddedNumber = value;
        },
        setIsAlarm(state: CommonState, value: boolean): void {
            state.isAlarm = value;
        },
        setBfSelectFiles(state: CommonState, value: any[]): void {
            state.bfSelectFiles = value;
        },
        setSlideProceeding(state: CommonState, value: string): void {
            state.slideProceeding = value;
        },
        setTotalSlideTime(state: CommonState, value: string): void {
            state.totalSlideTime = value;
        },
        setPbiaRootPath(state: CommonState, value: string): void {
            state.pbiaRootPath = value;
        },
        setRunningSlotId(state: CommonState, value: string): void {
            state.runningSlotId = value;
        },
        setIsRequestInProgress(state: CommonState, value: boolean): void {
            state.isRequestInProgress = value;
        },
        setStartInfoBoolen(state: CommonState, value: boolean): void {
            state.startInfoBoolen = value;
        },
        setRunningInfoBoolen(state: CommonState, value: boolean): void {
            state.runningInfoBoolen = value;
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
        setResFlag(state: CommonState, value: boolean): void {
            state.resFlag = value;
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
        setRunningArr(state: CommonState, value: any[]): void {
            state.runningArr = value;
        },
        setClassArr(state: CommonState, value: any[]): void {
            state.classArr = value;
        },
        setRbcArr(state: CommonState, value: any[]): void {
            state.rbcArr = value;
        },
        setProcessInfo(state: CommonState, value: any[]): void {
            state.processInfo = value;
        },
        setOrderList(state: CommonState, value: any[]): void {
            state.orderList = value;
        },
        setLoginSetData(state: CommonState, value: string): void {
            state.loginSetData = value;
        },
        setDeviceBarcode(state: CommonState, value: string): void {
            state.deviceBarcode = value;
        },
        setSiteCd(state: CommonState, value: string): void {
            state.siteCd = value;
        },
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

            if (payload.hasOwnProperty('totalCount')) {
                commit('setTotalCount', payload.totalCount);
            }
            if (payload.hasOwnProperty('embeddedNumber')) {
                commit('setEmbeddedNumber', payload.embeddedNumber);
            }
            if (payload.hasOwnProperty('isAlarm')) {
                commit('setIsAlarm', payload.isAlarm);
            }
            if (payload.hasOwnProperty('bfSelectFiles')) {
                commit('setBfSelectFiles', payload.bfSelectFiles);
            }
            if (payload.hasOwnProperty('slideProceeding')) {
                commit('setSlideProceeding', payload.slideProceeding);
            }
            if (payload.hasOwnProperty('totalSlideTime')) {
                commit('setTotalSlideTime', payload.totalSlideTime);
            }
            if (payload.hasOwnProperty('pbiaRootPath')) {
                commit('setPbiaRootPath', payload.pbiaRootPath);
            }
            if (payload.hasOwnProperty('runningSlotId')) {
                commit('setRunningSlotId', payload.runningSlotId);
            }
            if (payload.hasOwnProperty('isRequestInProgress')) {
                commit('setIsRequestInProgress', payload.isRequestInProgress);
            }
            if (payload.hasOwnProperty('startInfoBoolen')) {
                commit('setStartInfoBoolen', payload.startInfoBoolen);
            }
            if (payload.hasOwnProperty('runningInfoBoolen')) {
                commit('setRunningInfoBoolen', payload.runningInfoBoolen);
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
            if (payload.hasOwnProperty('resFlag')) {
                commit('setResFlag', payload.resFlag);
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
            if (payload.hasOwnProperty('runningArr')) {
                commit('setRunningArr', payload.runningArr);
            }
            if (payload.hasOwnProperty('classArr')) {
                commit('setClassArr', payload.classArr);
            }
            if (payload.hasOwnProperty('rbcArr')) {
                commit('setRbcArr', payload.rbcArr);
            }
            if (payload.hasOwnProperty('processInfo')) {
                commit('setProcessInfo', payload.processInfo);
            }
            if (payload.hasOwnProperty('orderList')) {
                commit('setOrderList', payload.orderList);
            }
            if (payload.hasOwnProperty('loginSetData')) {
                commit('setLoginSetData', payload.loginSetData);
            }
            if (payload.hasOwnProperty('siteCd')) {
                commit('setSiteCd', payload.siteCd);
            }
            if (payload.hasOwnProperty('deviceBarcode')) {
                commit('setDeviceBarcode', payload.deviceBarcode);
            }
        },
    },
};
