// commonModule.ts
import {Commit} from 'vuex';

export interface CommonState {
    startEmbedded: boolean;
    eqStatCd: number;
    isRunningState: boolean;
    totalCount: string;
    embeddedNumber: string;
    isAlarm: boolean;
    bfSelectFiles: [],
    slideProceeding: string,
    totalSlideTime: string,
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
        setBfSelectFiles(state: CommonState, value: []): void {
            state.bfSelectFiles = value;
        },
        setSlideProceeding(state: CommonState, value: string): void {
            state.slideProceeding = value;
        },
        setTotalSlideTime(state: CommonState, value: string): void {
            state.totalSlideTime = value;
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
        },
    },
};
