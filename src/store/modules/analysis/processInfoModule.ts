// processInfoModule.ts
import { Commit } from 'vuex';

interface ProcessInfoState {
    cassetteNo: string;
    barcodeId: string;
    patientId: string;
    patientName: string;
    wbcCount: number;
    orderDate: string;
    oilCount: number;
}

interface ProcessInfoModule {
    namespaced: true;
    state: () => ProcessInfoState;
    mutations: {
        setCassetteNo: (state: ProcessInfoState, value: string) => void;
        setBarcodeId: (state: ProcessInfoState, value: string) => void;
        setPatientId: (state: ProcessInfoState, value: string) => void;
        setPatientName: (state: ProcessInfoState, value: string) => void;
        setWbcCount: (state: ProcessInfoState, value: number) => void;
        setOrderDate: (state: ProcessInfoState, value: string) => void;
        setOilCount: (state: ProcessInfoState, value: number) => void;
    };
    actions: {
        setProcessInfo: (context: { commit: Commit }, payload: ProcessInfoState) => void;
        setSingleProcessInfo: (context: { commit: Commit }, payload: { key: keyof ProcessInfoState; value: string | number }) => void;
    };
}

export const processInfoModule: ProcessInfoModule = {
    namespaced: true,
    state: () => ({
        cassetteNo: '',
        barcodeId: '',
        patientId: '',
        patientName: '',
        wbcCount: 0,
        orderDate: '',
        oilCount: 0,
    }),
    mutations: {
        setCassetteNo(state: ProcessInfoState, value: string): void {
            state.cassetteNo = value;
        },
        setBarcodeId(state: ProcessInfoState, value: string): void {
            state.barcodeId = value;
        },
        setPatientId(state: ProcessInfoState, value: string): void {
            state.patientId = value;
        },
        setPatientName(state: ProcessInfoState, value: string): void {
            state.patientName = value;
        },
        setWbcCount(state: ProcessInfoState, value: number): void {
            state.wbcCount = value;
        },
        setOrderDate(state: ProcessInfoState, value: string): void {
            state.orderDate = value;
        },
        setOilCount(state: ProcessInfoState, value: number): void {
            state.oilCount = value;
        },
    },
    actions: {
        setProcessInfo({ commit }: { commit: Commit }, payload: ProcessInfoState): void {
            commit('setCassetteNo', payload.cassetteNo);
            commit('setBarcodeId', payload.barcodeId);
            commit('setPatientId', payload.patientId);
            commit('setPatientName', payload.patientName);
            commit('setWbcCount', payload.wbcCount);
            commit('setOrderDate', payload.orderDate);
            commit('setOilCount', payload.oilCount);
        },
        setSingleProcessInfo({ commit }: { commit: Commit }, payload: { key: keyof ProcessInfoState; value: string | number }): void {
            if (payload && payload.key && payload.value !== undefined) {
                commit(`set${payload.key.charAt(0).toUpperCase() + payload.key.slice(1)}`, payload.value);
            }
        },

    },
};
