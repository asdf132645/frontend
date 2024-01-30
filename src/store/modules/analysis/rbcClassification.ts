// rbcClassification.ts
import { Commit } from 'vuex';

interface RBCClassificationState {
    category: string;
    class: string;
    degree: number;
}

interface RBCClassificationModule {
    state: () => RBCClassificationState;
    mutations: {
        setCategory: (state: RBCClassificationState, value: string) => void;
        setClass: (state: RBCClassificationState, value: string) => void;
        setDegree: (state: RBCClassificationState, value: number) => void;
    };
    actions: {
        setRBCClassification: (context: { commit: Commit }, payload: RBCClassificationState) => void;
    };
}

export const rbcClassificationModule: RBCClassificationModule = {
    state: () => ({
        category: '',
        class: '',
        degree: 0,
    }),
    mutations: {
        setCategory(state: RBCClassificationState, value: string): void {
            state.category = value;
        },
        setClass(state: RBCClassificationState, value: string): void {
            state.class = value;
        },
        setDegree(state: RBCClassificationState, value: number): void {
            state.degree = value;
        },
    },
    actions: {
        setRBCClassification({ commit }: { commit: Commit }, payload: RBCClassificationState): void {
            commit('setCategory', payload.category);
            commit('setClass', payload.class);
            commit('setDegree', payload.degree);
        },
    },
};
