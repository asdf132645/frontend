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
        id: '01', abbreviation: 'NE', fullNm: 'Neutrophil', keyText: '', orderIdx: 1
    }, {
        id: '71', abbreviation: 'NS', fullNm: 'Neutrophil-Segmented', keyText: '', orderIdx: 2
    }, {
        id: '72', abbreviation: 'NB', fullNm: 'Neutrophil-Band', keyText: '', orderIdx: 3
    }, {
        id: '02', abbreviation: 'ME', fullNm: 'Metamyelocyte', keyText: '', orderIdx: 4
    }, {
        id: '03', abbreviation: 'MY', fullNm: 'Myelocyte', keyText: '', orderIdx: 5
    }, {
        id: '04', abbreviation: 'PR', fullNm: 'Promyelocyte', keyText: '', orderIdx: 6
    }, {
        id: '05', abbreviation: 'LY', fullNm: 'Lymphocyte', keyText: '', orderIdx: 7
    }, {
        id: '61', abbreviation: 'LR', fullNm: 'Reactive lymphocyte', keyText: '', orderIdx: 8
    }, {
        id: '62', abbreviation: 'LA', fullNm: 'Abnormal lymphocyte', keyText: '', orderIdx: 9
    }, {
        id: '07', abbreviation: 'MO', fullNm: 'Monocyte', keyText: '', orderIdx: 10
    }, {
        id: '08', abbreviation: 'EO', fullNm: 'Eosinophil', keyText: '', orderIdx: 11
    }, {
        id: '09', abbreviation: 'BA', fullNm: 'Basophil', keyText: '', orderIdx: 12
    }, {
        id: '10', abbreviation: 'BL', fullNm: 'Blast', keyText: '', orderIdx: 13
    }, {
        id: '11', abbreviation: 'PC', fullNm: 'Plasma cell', keyText: '', orderIdx: 14
    }, {
        id: '12', abbreviation: 'NR', fullNm: 'nRBC', keyText: '', orderIdx: 15
    }, {
        id: '13', abbreviation: 'GP', fullNm: 'Giant platelet', keyText: '', orderIdx: 16
    }, {
        id: '14', abbreviation: 'PA', fullNm: 'Platelet aggregation', keyText: '', orderIdx: 17
    }, {
        id: '16', abbreviation: 'MA', fullNm: 'Malaria', keyText: '', orderIdx: 18
    }, {
        id: '15', abbreviation: 'AR', fullNm: 'Artifact', keyText: '', orderIdx: 19
    }, {
        id: '17', abbreviation: 'SM', fullNm: 'Smudge', keyText: '', orderIdx: 20
    }


]

export const basicBmClassList = [{
    id: '01', abbreviation: 'NE', fullNm: 'Neutrophil', orderIdx: 1
}, {
    id: '71', abbreviation: 'NS', fullNm: 'Neutrophil-Segmented', keyText: '', orderIdx: 2
}, {
    id: '72', abbreviation: 'NB', fullNm: 'Neutrophil-Band', keyText: '', orderIdx: 3
}, {
    id: '02', abbreviation: 'ME', fullNm: 'Metamyelocyte', orderIdx: 4
}, {
    id: '03', abbreviation: 'MY', fullNm: 'Myelocyte', orderIdx: 5
}, {
    id: '04', abbreviation: 'PR', fullNm: 'Promyelocyte', orderIdx: 6
}, {
    id: '05', abbreviation: 'LY', fullNm: 'Lymphocyte', orderIdx: 7
}, {
    id: '06', abbreviation: 'LA', fullNm: 'Abnormal lymphocyte', orderIdx: 8
}, {
    id: '07', abbreviation: 'MO', fullNm: 'Monocyte', orderIdx: 9
}, {
    id: '08', abbreviation: 'EO', fullNm: 'Eosinophil', orderIdx: 10
}, {
    id: '09', abbreviation: 'BA', fullNm: 'Basophil', orderIdx: 11
}, {
    id: '10', abbreviation: 'BL', fullNm: 'Blast', orderIdx: 12
}, {
    id: '11', abbreviation: 'PC', fullNm: 'Plasma cell', orderIdx: 13
}, {
    id: '12', abbreviation: 'ON', fullNm: 'Orthochromic Normoblast', orderIdx: 14
}, {
    id: '13', abbreviation: 'PN', fullNm: 'Polychromic Normoblast', orderIdx: 15
}, {
    id: '14', abbreviation: 'BN', fullNm: 'Basophilic Normoblast', orderIdx: 16
}, {
    id: '15', abbreviation: 'PE', fullNm: 'Proerythroblast', orderIdx: 17
}, {
    id: '16', abbreviation: 'HC', fullNm: 'Histiocyte', orderIdx: 18
}, {
    id: '17', abbreviation: 'OT', fullNm: 'Others', orderIdx: 19
}]