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
        id: '01', abbreviation: 'NE', fullNm: 'Neutrophil', key: '', orderIdx: 1
    }, {
        id: '71', abbreviation: 'NS', fullNm: 'Neutrophil-Segmented', key: '', orderIdx: 2
    }, {
        id: '72', abbreviation: 'NB', fullNm: 'Neutrophil-Band', key: '', orderIdx: 3
    }, {
        id: '02', abbreviation: 'ME', fullNm: 'Metamyelocyte', key: '', orderIdx: 4
    }, {
        id: '03', abbreviation: 'MY', fullNm: 'Myelocyte', key: '', orderIdx: 5
    }, {
        id: '04', abbreviation: 'PR', fullNm: 'Promyelocyte', key: '', orderIdx: 6
    }, {
        id: '05', abbreviation: 'LY', fullNm: 'Lymphocyte', key: '', orderIdx: 7
    }, {
        id: '61', abbreviation: 'LR', fullNm: 'Reactive lymphocyte', key: '', orderIdx: 8
    }, {
        id: '62', abbreviation: 'LA', fullNm: 'Abnormal lymphocyte', key: '', orderIdx: 9
    }, {
        id: '07', abbreviation: 'MO', fullNm: 'Monocyte', key: '', orderIdx: 10
    }, {
        id: '08', abbreviation: 'EO', fullNm: 'Eosinophil', key: '', orderIdx: 11
    }, {
        id: '09', abbreviation: 'BA', fullNm: 'Basophil', key: '', orderIdx: 12
    }, {
        id: '10', abbreviation: 'BL', fullNm: 'Blast', key: '', orderIdx: 13
    }, {
        id: '11', abbreviation: 'PC', fullNm: 'Plasma cell', key: '', orderIdx: 14
    }, {
        id: '12', abbreviation: 'NR', fullNm: 'nRBC', key: '', orderIdx: 15
    }, {
        id: '13', abbreviation: 'GP', fullNm: 'Giant platelet', key: '', orderIdx: 16
    }, {
        id: '14', abbreviation: 'PA', fullNm: 'Platelet aggregation', key: '', orderIdx: 17
    }, {
        id: '16', abbreviation: 'MA', fullNm: 'Malaria', key: '', orderIdx: 18
    }, {
        id: '15', abbreviation: 'AR', fullNm: 'Artifact', key: '', orderIdx: 19
    }, {
        id: '17', abbreviation: 'SM', fullNm: 'Smudge', key: '', orderIdx: 20
    }


]

export const basicBmClassList = [{
    id: '01', abbreviation: 'NE', fullNm: 'Neutrophil', key: '', orderIdx: 1
}, {
    id: '71', abbreviation: 'NS', fullNm: 'Neutrophil-Segmented', key: '', orderIdx: 2
}, {
    id: '72', abbreviation: 'NB', fullNm: 'Neutrophil-Band', key: '', orderIdx: 3
}, {
    id: '02', abbreviation: 'ME', fullNm: 'Metamyelocyte', key: '', orderIdx: 4
}, {
    id: '03', abbreviation: 'MY', fullNm: 'Myelocyte', key: '', orderIdx: 5
}, {
    id: '04', abbreviation: 'PR', fullNm: 'Promyelocyte', key: '', orderIdx: 6
}, {
    id: '05', abbreviation: 'LY', fullNm: 'Lymphocyte', key: '', orderIdx: 7
}, {
    id: '06', abbreviation: 'LA', fullNm: 'Abnormal lymphocyte', key: '', orderIdx: 8
}, {
    id: '07', abbreviation: 'MO', fullNm: 'Monocyte', key: '', orderIdx: 9
}, {
    id: '08', abbreviation: 'EO', fullNm: 'Eosinophil', key: '', orderIdx: 10
}, {
    id: '09', abbreviation: 'BA', fullNm: 'Basophil', key: '', orderIdx: 11
}, {
    id: '10', abbreviation: 'BL', fullNm: 'Blast', key: '', orderIdx: 12
}, {
    id: '11', abbreviation: 'PC', fullNm: 'Plasma cell', key: '', orderIdx: 13
}, {
    id: '12', abbreviation: 'ON', fullNm: 'Orthochromic Normoblast', key: '', orderIdx: 14
}, {
    id: '13', abbreviation: 'PN', fullNm: 'Polychromic Normoblast', key: '', orderIdx: 15
}, {
    id: '14', abbreviation: 'BN', fullNm: 'Basophilic Normoblast', key: '', orderIdx: 16
}, {
    id: '15', abbreviation: 'PE', fullNm: 'Proerythroblast', key: '', orderIdx: 17
}, {
    id: '16', abbreviation: 'HC', fullNm: 'Histiocyte', key: '', orderIdx: 18
}, {
    id: '17', abbreviation: 'OT', fullNm: 'Others', key: '', orderIdx: 19
}]