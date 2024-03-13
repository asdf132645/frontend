// wbcclassificationModule.ts
import { Commit } from 'vuex';

interface Image {
    fileName: string;
}

export interface WbcInfo {
    barcodeID?: string;
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


export const basicWbcArr = [
    {
        "id": "01",
        "title": "NE",
        "name": "Neutrophil",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "02",
        "title": "LY",
        "name": "Lymphocyte",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "03",
        "title": "MO",
        "name": "Monocyte",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "04",
        "title": "EO",
        "name": "Eosinophil",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "05",
        "title": "BA",
        "name": "Basophil",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "06",
        "title": "BL",
        "name": "Blast",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "07",
        "title": "PC",
        "name": "Plasma cell",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "08",
        "title": "NR",
        "name": "NRBC",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "09",
        "title": "AR",
        "name": "Artifact(Smudge)",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "10",
        "title": "MC",
        "name": "Malignant cell",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "11",
        "title": "MT",
        "name": "Mesothelial cell",
        "count": "0",
        "percent": "0"
    },
    {
        "id": "12",
        "title": "SM",
        "name": "Smudge",
        "count": "0",
        "percent": "0"
    }
]
