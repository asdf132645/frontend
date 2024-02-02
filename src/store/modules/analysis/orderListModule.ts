// slotInfoModule.ts
import { Commit } from 'vuex';

interface SlotInfo {
    barcodeNo: string;
    patientNm: string;
    orderDttm: string;
    stateCd: string;
}

interface OrderListState {
    slotInfo: SlotInfo[];
}

interface SlotInfoModule {
    namespaced: true; // 네임스페이스 추가
    state: () => OrderListState;
    mutations: {
        setSlotInfo: (state: OrderListState, value: SlotInfo[]) => void;
    };
    actions: {
        setSlotInfo: (context: { commit: Commit }, value: SlotInfo[]) => void;
    };
}

export const orderListModule: SlotInfoModule = {
    namespaced: true,
    state: () => ({
        slotInfo: [],
    }),
    mutations: {
        setSlotInfo(state: OrderListState, value: SlotInfo[]): void {
            state.slotInfo = value;
        },
    },
    actions: {
        setSlotInfo({ commit }: { commit: Commit }, value: SlotInfo[]): void {
            commit('setSlotInfo', value);
        },
    },
};
