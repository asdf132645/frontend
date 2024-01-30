// wbcclassification.ts
import { Commit } from 'vuex';

interface WBCClassificationState {
    class: string;
    count: number;
    percent: number;
}

interface WBCClassificationModule {
    state: () => WBCClassificationState;
    mutations: {
        setClass: (state: WBCClassificationState, value: string) => void;
        setCount: (state: WBCClassificationState, value: number) => void;
        setPercent: (state: WBCClassificationState, value: number) => void;
    };
    actions: {
        setWBCClassification: (context: { commit: Commit }, payload: WBCClassificationState) => void;
    };
}

export const classificationModule: WBCClassificationModule = {
    state: () => ({
        class: '',
        count: 0,
        percent: 0,
    }),
    mutations: {
        setClass(state: WBCClassificationState, value: string): void {
            state.class = value;
        },
        setCount(state: WBCClassificationState, value: number): void {
            state.count = value;
        },
        setPercent(state: WBCClassificationState, value: number): void {
            state.percent = value;
        },
    },
    actions: {
        setWBCClassification({ commit }: { commit: Commit }, payload: WBCClassificationState): void {
            commit('setClass', payload.class);
            commit('setCount', payload.count);
            commit('setPercent', payload.percent);
        },
    },
};
