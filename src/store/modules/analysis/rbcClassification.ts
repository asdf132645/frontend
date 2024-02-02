// rbcInfoModule.ts
import { Commit } from 'vuex';

interface ClassInfo {
    classId: string;
    classNm: string;
    degree: string;
}

export interface RbcInfo {
    categoryId: string;
    categoryNm: string;
    classInfo: ClassInfo[];
}

 interface RbcInfoState {
    rbcInfo: RbcInfo | null;
}

interface RbcInfoModule {
    namespaced: true,
    state: () => RbcInfoState;
    mutations: {
        setRbcInfo: (state: RbcInfoState, value: RbcInfo) => void;
    };
    actions: {
        setRbcInfo: (context: { commit: Commit }, payload: RbcInfo) => void;
    };
}

export const rbcClassificationModule: RbcInfoModule = {
    namespaced: true,
    state: () => ({
        rbcInfo: null,
    }),
    mutations: {
        setRbcInfo(state: RbcInfoState, value: RbcInfo): void {
            state.rbcInfo = value;
        },
    },
    actions: {
        setRbcInfo({ commit }: { commit: Commit }, payload: RbcInfo): void {
            commit('setRbcInfo', payload);
        },
    },
};
