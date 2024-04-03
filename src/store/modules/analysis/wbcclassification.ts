// wbcclassificationModule.ts
import {Commit} from 'vuex';

interface Image {
    fileName: string;
}

export interface WbcInfo {
    barcodeID?: string;
    id: string;
    title: string;
    name: string;
    count: string | number;
    percent?: string | number;
    images?: Image[];
}

export interface BmInfo {
    barcodeID?: string;
    id: string;
    title: string;
    name: string;
    count: string | number;
    percent?: string | number;
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
        setWbcInfo({commit}: { commit: Commit }, payload: WbcInfo): void {
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

export const basicBmClassList = [{
    id: '01', title: 'NE', name: 'Neutrophil', count: 0, percent: 0, order: 1
}, {
    id: '71', title: 'NS', name: 'Neutrophil-Segmented', count: 0, percent: 0, key: '', order: 2
}, {
    id: '72', title: 'NB', name: 'Neutrophil-Band', count: 0, percent: 0, key: '', order: 3
}, {
    id: '02', title: 'ME', name: 'Metamyelocyte', count: 0, percent: 0, order: 4
}, {
    id: '03', title: 'MY', name: 'Myelocyte', count: 0, percent: 0, order: 5
}, {
    id: '04', title: 'PR', name: 'Promyelocyte', count: 0, percent: 0, order: 6
}, {
    id: '05', title: 'LY', name: 'Lymphocyte', count: 0, percent: 0, order: 7
}, {
    id: '06', title: 'LA', name: 'Abnormal lymphocyte', count: 0, percent: 0, order: 8
}, {
    id: '07', title: 'MO', name: 'Monocyte', count: 0, percent: 0, order: 9
}, {
    id: '08', title: 'EO', name: 'Eosinophil', count: 0, percent: 0, order: 10
}, {
    id: '09', title: 'BA', name: 'Basophil', count: 0, percent: 0, order: 11
}, {
    id: '10', title: 'BL', name: 'Blast', count: 0, percent: 0, order: 12
}, {
    id: '11', title: 'PC', name: 'Plasma cell', count: 0, percent: 0, order: 13
}, {
    id: '12', title: 'ON', name: 'Orthochromic Normoblast', count: 0, percent: 0, order: 14
}, {
    id: '13', title: 'PN', name: 'Polychromic Normoblast', count: 0, percent: 0, order: 15
}, {
    id: '14', title: 'BN', name: 'Basophilic Normoblast', count: 0, percent: 0, order: 16
}, {
    id: '15', title: 'PE', name: 'Proerythroblast', count: 0, percent: 0, order: 17
}, {
    id: '16', title: 'HC', name: 'Histiocyte', count: 0, percent: 0, order: 18
}, {
    id: '17', title: 'OT', name: 'Others', count: 0, percent: 0, order: 19
}]