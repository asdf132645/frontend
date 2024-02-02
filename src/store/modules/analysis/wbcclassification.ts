// wbcclassificationModule.ts
import { Commit } from 'vuex';

interface Image {
    fileName: string;
}

export interface WbcInfo {
    id: string;
    title: string;
    name: string;
    count: string | number;
    percent?:string | number;
    images?: Image[];
}

interface WbcClassificationState {
    wbcInfo: WbcInfo | null;
}

interface WbcClassificationModule {
    namespaced: true;
    state: () => WbcClassificationState;
    mutations: {
        setWbcInfo: (state: WbcClassificationState, value: WbcInfo) => void;
    };
    actions: {
        setWbcInfo: (context: { commit: Commit }, payload: WbcInfo) => void;
    };
}

export const wbcClassificationModule: WbcClassificationModule = {
    namespaced: true,
    state: () => ({
        wbcInfo: null,
    }),
    mutations: {
        setWbcInfo(state: WbcClassificationState, value: WbcInfo): void {
            state.wbcInfo = value;
        },
    },
    actions: {
        setWbcInfo({ commit }: { commit: Commit }, payload: WbcInfo): void {
            commit('setWbcInfo', payload);
        },
    },
};
