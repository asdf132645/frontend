// embeddedStatusModule.ts
// sysInfo - 시스템 정보 확인
import {Commit} from 'vuex';

// 시스템 정보 타입
export interface SystemInfo {
    eqStatCd: string;
    iCasStat: string;
    oCasStat: string;
    jobCmd: string;
    isDoorOpen: string;
    oilCount: string;
    storageSize: string;
    currentCardCount: string;
    currentCardName: string;
}

export interface EmbeddedStatusState {
    embeddedStatusJobCmd: string;
    userStop: boolean;
    isRecoveryRun: boolean;
    isPause: boolean,
    sysInfo: SystemInfo,
    isInit: string;
}

interface EmbeddedStatusModule {
    namespaced: true; // 네임스페이스 추가
    state: () => EmbeddedStatusState;
    mutations: {
        setEmbeddedStatusJobCmd: (state: EmbeddedStatusState, value: string) => void;
        setUserStop: (state: EmbeddedStatusState, value: boolean) => void;
        setIsRecoveryRun: (state: EmbeddedStatusState, value: boolean) => void;
        setIsPause: (state: EmbeddedStatusState, value: boolean) => void;
        setSysInfo: (state: EmbeddedStatusState, value: SystemInfo) => void;
        setIsInit: (state: EmbeddedStatusState, value: string) => void;
    };
    actions: {
        setEmbeddedStatusInfo: (context: { commit: Commit }, payload: EmbeddedStatusState) => void;
    };
}

export const embeddedStatusModule: EmbeddedStatusModule = {
    namespaced: true,
    state: () => ({
        embeddedStatusJobCmd: '',
        userStop: false,
        isRecoveryRun: false,
        isPause: false,
        sysInfo: {
            eqStatCd: '',
            iCasStat: '',
            oCasStat: '',
            jobCmd: '',
            isDoorOpen: '',
            oilCount: '',
            storageSize: '',
            currentCardCount: '',
            currentCardName: '',
        },
        isInit: '',
    }),
    mutations: {
        setEmbeddedStatusJobCmd(state: EmbeddedStatusState, value: string): void {
            state.embeddedStatusJobCmd = value;
        },
        setUserStop(state: EmbeddedStatusState, value: boolean): void {
            state.userStop = value;
        },
        setIsRecoveryRun(state: EmbeddedStatusState, value: boolean): void {
            state.isRecoveryRun = value;
        },
        setIsPause(state: EmbeddedStatusState, value: boolean): void {
            state.isPause = value;
        },
        setSysInfo(state: EmbeddedStatusState, value: SystemInfo): void {
            state.sysInfo = value;
        },
        setIsInit(state: EmbeddedStatusState, value: string): void {
            state.isInit = value;
        },
    },
    actions: {
        setEmbeddedStatusInfo({commit}: { commit: Commit }, payload: EmbeddedStatusState): void {
            Object.keys(payload).forEach(key => {
                if (key === 'embeddedStatusJobCmd') {
                    commit('setEmbeddedStatusJobCmd', payload[key]);
                } else if (key === 'userStop') {
                    commit('setUserStop', payload[key]);
                } else if (key === 'isRecoveryRun') {
                    commit('setIsRecoveryRun', payload[key]);
                } else if (key === 'isPause') {
                    commit('setIsPause', payload[key]);
                } else if (key === 'sysInfo') {
                    commit('setSysInfo', payload[key]);
                } else if (key === 'isInit') {
                    commit('setIsInit', payload[key]);
                }
            });
        },
    },
};
