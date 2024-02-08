// embeddedStatusModule.ts
// sysInfo - 시스템 정보 확인
import {Commit} from 'vuex';

// 시스템 정보 타입
export interface SystemInfo {
    eqStatCd: string;
    iCasStat: string;
    oCasStat: string;
    jobCmd: string;
    siteCd: string;
    // 다른 sysInfo 속성들을 필요에 따라 추가해주세요.
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
            siteCd: '',
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
            commit('setEmbeddedStatusJobCmd', payload.embeddedStatusJobCmd);
            commit('setUserStop', payload.userStop);
            commit('setIsRecoveryRun', payload.isRecoveryRun);
            commit('setIsPause', payload.isPause);
            commit('setSysInfo', payload.sysInfo);
            commit('setIsInit', payload.isInit);
        },
    },
};
