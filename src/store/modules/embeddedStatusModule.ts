// embeddedStatusModule.ts
import { Commit } from 'vuex';

interface EmbeddedStatusState {
    embeddedStatusJobCmd: string;
    userStop: boolean;
    isRecoveryRun: boolean;
    sysInfo: object;
}

interface EmbeddedStatusModule {
    state: () => EmbeddedStatusState;
    mutations: {
        setEmbeddedStatusJobCmd: (state: EmbeddedStatusState, value: string) => void;
        setUserStop: (state: EmbeddedStatusState, value: boolean) => void;
        setIsRecoveryRun: (state: EmbeddedStatusState, value: boolean) => void;
        setSysInfo: (state: EmbeddedStatusState, value: object) => void;
    };
    actions: {
        setEmbeddedStatusInfo: (context: { commit: Commit }, payload: EmbeddedStatusState) => void;
    };
}

export const embeddedStatusModule: EmbeddedStatusModule = {
    state: () => ({
        embeddedStatusJobCmd: '',
        userStop: false,
        isRecoveryRun: false,
        sysInfo: {},
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
        setSysInfo(state: EmbeddedStatusState, value: object): void {
            state.sysInfo = value;
        },
    },
    actions: {
        setEmbeddedStatusInfo({ commit }: { commit: Commit }, payload: EmbeddedStatusState): void {
            commit('setEmbeddedStatusJobCmd', payload.embeddedStatusJobCmd);
            commit('setUserStop', payload.userStop);
            commit('setIsRecoveryRun', payload.isRecoveryRun);
            commit('setSysInfo', payload.sysInfo);
        },
    },
};
