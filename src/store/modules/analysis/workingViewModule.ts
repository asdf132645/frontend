// workingViewModule.ts
import { Commit } from 'vuex';

interface SlotItem {
    slotNo: number;
    slotState: string;
}

interface SlotInfoArr {
    input: SlotItem[];
    output: SlotItem[];
}

interface WorkingViewState {
    equipmentStatusCode: string;
    wbcCount: string;
    slideTime: string;
    time: string;
    slotInfo: SlotInfoArr;
}

interface WorkingViewModule {
    namespaced: true;
    state: () => WorkingViewState;
    mutations: {
        setEquipmentStatusCode: (state: WorkingViewState, value: string) => void;
        setWbcCount: (state: WorkingViewState, value: string) => void;
        setSlideTime: (state: WorkingViewState, value: string) => void;
        setTime: (state: WorkingViewState, value: string) => void;
        setSlotInfo: (state: WorkingViewState, value: SlotInfoArr) => void;
    };
    actions: {
        setWorkingViewInfo: (context: { commit: Commit }, payload: WorkingViewState) => void;
    };
}

export const workingViewModule: WorkingViewModule = {
    namespaced: true,
    state: () => ({
        equipmentStatusCode: '',
        wbcCount: '',
        slideTime: '',
        time: '',
        slotInfo: {
            input: [],
            output: [],
        },
    }),
    mutations: {
        setEquipmentStatusCode(state: WorkingViewState, value: string): void {
            state.equipmentStatusCode = value;
        },
        setWbcCount(state: WorkingViewState, value: string): void {
            state.wbcCount = value;
        },
        setSlideTime(state: WorkingViewState, value: string): void {
            state.slideTime = value;
        },
        setTime(state: WorkingViewState, value: string): void {
            state.time = value;
        },
        setSlotInfo(state: WorkingViewState, value: SlotInfoArr): void {
            state.slotInfo = value;
        },
    },
    actions: {
        setWorkingViewInfo({ commit }: { commit: Commit }, payload: WorkingViewState): void {
            commit('setEquipmentStatusCode', payload.equipmentStatusCode);
            commit('setWbcCount', payload.wbcCount);
            commit('setSlideTime', payload.slideTime);
            commit('setTime', payload.time);
            commit('setSlotInfo', payload.slotInfo);
        },
    },
};
