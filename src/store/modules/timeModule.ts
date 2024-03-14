import {Commit} from 'vuex';

export interface TimeState {
    totalSlideTime: string,
    slideTime: string,
}

interface TimeModule {
    namespaced: true;
    state: () => TimeState;
    mutations: {
        setTotalSlideTime: (state: TimeState, value: string) => void;
        setSlideTime: (state: TimeState, value: string) => void;
    };
    actions: {
        setTimeInfo: (context: { commit: Commit }, payload: TimeState) => void;
    };
}

export const timeModule: TimeModule = {
    namespaced: true,
    state: () => ({
        totalSlideTime: '00:00:00',
        slideTime: '00:00:00',
    }),
    mutations: {
        setTotalSlideTime(state: TimeState, value: string): void {
            state.totalSlideTime = value;
        },
        setSlideTime(state: TimeState, value: string): void {
            state.slideTime = value;
        }
    },
    actions: {
        setTimeInfo({commit}: { commit: Commit }, payload: TimeState): void {
            if (payload.hasOwnProperty('totalSlideTime')) {
                commit('setTotalSlideTime', payload.totalSlideTime);
            }
            if (payload.hasOwnProperty('slideTime')) {
                commit('setSlideTime', payload.slideTime);
            }
        },
    },
};
