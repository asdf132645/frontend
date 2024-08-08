// wbcclassificationModule.ts
import {Commit} from 'vuex';

interface Image {
    fileName: string;
}

export interface WbcInfo {
    barcodeID?: string;
    id: string;
    abbreviation: string;
    title: string;
    fullNm: string;
    count: string | number;
    percent?: string | number;
    images?: Image[];
}

export interface BmInfo {
    barcodeID?: string;
    id: string;
    abbreviation: string;
    fullNm: string;
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

export interface DefaultBasicWbcArrType {
    id: string,
    abbreviation: string,
    fullNm: string,
    key: string,
    orderIdx: number
}


export const basicWbcArr: DefaultBasicWbcArrType[] = [
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

export const basicBmClassList: DefaultBasicWbcArrType[] = [
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

export const defaultWbcClassList = [
    {
        classId: '01', abbreviation: 'NE', fullNm: 'Neutrophil', orderIdx: 1
    }, {
        classId: '71', abbreviation: 'NS', fullNm: 'Neutrophil-Segmented', orderIdx: 2
    }, {
        classId: '72', abbreviation: 'NB', fullNm: 'Neutrophil-Band', orderIdx: 3
    }, {
        classId: '02', abbreviation: 'ME', fullNm: 'Metamyelocyte', orderIdx: 4
    }, {
        classId: '03', abbreviation: 'MY', fullNm: 'Myelocyte', orderIdx: 5
    }, {
        classId: '04', abbreviation: 'PR', fullNm: 'Promyelocyte', orderIdx: 6
    }, {
        classId: '05', abbreviation: 'LY', fullNm: 'Lymphocyte', orderIdx: 7
    }, {
        classId: '61', abbreviation: 'LR', fullNm: 'Reactive lymphocyte', orderIdx: 8
    }, {
        classId: '62', abbreviation: 'LA', fullNm: 'Abnormal lymphocyte', orderIdx: 9
    }, {
        classId: '07', abbreviation: 'MO', fullNm: 'Monocyte', orderIdx: 10
    }, {
        classId: '08', abbreviation: 'EO', fullNm: 'Eosinophil', orderIdx: 11
    }, {
        classId: '09', abbreviation: 'BA', fullNm: 'Basophil', orderIdx: 12
    }, {
        classId: '10', abbreviation: 'BL', fullNm: 'Blast', orderIdx: 13
    }, {
        classId: '11', abbreviation: 'PC', fullNm: 'Plasma cell', orderIdx: 14
    }, {
        classId: '12', abbreviation: 'NR', fullNm: 'nRBC', orderIdx: 15
    }, {
        classId: '13', abbreviation: 'GP', fullNm: 'Giant platelet', orderIdx: 16
    }, {
        classId: '14', abbreviation: 'PA', fullNm: 'Platelet aggregation', orderIdx: 17
    }, {
        classId: '16', abbreviation: 'MA', fullNm: 'Malaria', orderIdx: 18
    }, {
        classId: '15', abbreviation: 'AR', fullNm: 'Artifact', orderIdx: 19
    }, {
        classId: '17', abbreviation: 'SM', fullNm: 'Smudge', orderIdx: 20
    }
]

export const defaultBmClassList = [
    {
        classId: '01', abbreviation: 'NE', fullNm: 'Neutrophil', orderIdx: 1
    }, {
        classId: '71', abbreviation: 'NS', fullNm: 'Neutrophil-Segmented', orderIdx: 2
    }, {
        classId: '72', abbreviation: 'NB', fullNm: 'Neutrophil-Band', orderIdx: 3
    }, {
        classId: '02', abbreviation: 'ME', fullNm: 'Metamyelocyte', orderIdx: 4
    }, {
        classId: '03', abbreviation: 'MY', fullNm: 'Myelocyte', orderIdx: 5
    }, {
        classId: '04', abbreviation: 'PR', fullNm: 'Promyelocyte', orderIdx: 6
    }, {
        classId: '05', abbreviation: 'LY', fullNm: 'Lymphocyte', orderIdx: 7
    }, {
        classId: '06', abbreviation: 'LA', fullNm: 'Abnormal lymphocyte', orderIdx: 8
    }, {
        classId: '07', abbreviation: 'MO', fullNm: 'Monocyte', orderIdx: 9
    }, {
        classId: '08', abbreviation: 'EO', fullNm: 'Eosinophil', orderIdx: 10
    }, {
        classId: '09', abbreviation: 'BA', fullNm: 'Basophil', orderIdx: 11
    }, {
        classId: '10', abbreviation: 'BL', fullNm: 'Blast', orderIdx: 12
    }, {
        classId: '11', abbreviation: 'PC', fullNm: 'Plasma cell', orderIdx: 13
    }, {
        classId: '12', abbreviation: 'ON', fullNm: 'Orthochromic Normoblast', orderIdx: 14
    }, {
        classId: '13', abbreviation: 'PN', fullNm: 'Polychromic Normoblast', orderIdx: 15
    }, {
        classId: '14', abbreviation: 'BN', fullNm: 'Basophilic Normoblast', orderIdx: 16
    }, {
        classId: '15', abbreviation: 'PE', fullNm: 'Proerythroblast', orderIdx: 17
    }, {
        classId: '16', abbreviation: 'HC', fullNm: 'Histiocyte', orderIdx: 18
    }, {
        classId: '17', abbreviation: 'OT', fullNm: 'Others', orderIdx: 19
    }]

export const basicWbcArrClint = [
    {
        id: '01', title: 'NE', name: 'Neutrophil', count: 0, percent: 0, key: '', order: 1
    }, {
        id: '71', title: 'NS', name: 'Neutrophil-Segmented', count: 0, percent: 0, key: '', order: 2
    }, {
        id: '72', title: 'NB', name: 'Neutrophil-Band', count: 0, percent: 0, key: '', order: 3
    }, {
        id: '02', title: 'ME', name: 'Metamyelocyte', count: 0, percent: 0, key: '', order: 4
    }, {
        id: '03', title: 'MY', name: 'Myelocyte', count: 0, percent: 0, key: '', order: 5
    }, {
        id: '04', title: 'PR', name: 'Promyelocyte', count: 0, percent: 0, key: '', order: 6
    }, {
        id: '05', title: 'LY', name: 'Lymphocyte', count: 0, percent: 0, key: '', order: 7
    }, {
        id: '61', title: 'LR', name: 'Reactive lymphocyte', count: 0, percent: 0, key: '', order: 8
    }, {
        id: '62', title: 'LA', name: 'Abnormal lymphocyte', count: 0, percent: 0, key: '', order: 9
    }, {
        id: '07', title: 'MO', name: 'Monocyte', count: 0, percent: 0, key: '', order: 10
    }, {
        id: '08', title: 'EO', name: 'Eosinophil', count: 0, percent: 0, key: '', order: 11
    }, {
        id: '09', title: 'BA', name: 'Basophil', count: 0, percent: 0, key: '', order: 12
    }, {
        id: '10', title: 'BL', name: 'Blast', count: 0, percent: 0, key: '', order: 13
    }, {
        id: '11', title: 'PC', name: 'Plasma cell', count: 0, percent: 0, key: '', order: 14
    }, {
        id: '12', title: 'NR', name: 'nRBC', count: 0, percent: 0, key: '', order: 15
    }, {
        id: '13', title: 'GP', name: 'Giant platelet', count: 0, percent: 0, key: '', order: 16
    }, {
        id: '14', title: 'PA', name: 'Platelet aggregation', count: 0, percent: 0, key: '', order: 17
    }, {
        id: '16', title: 'MA', name: 'Malaria', count: 0, percent: 0, key: '', order: 18
    }, {
        id: '15', title: 'AR', name: 'Artifact', count: 0, percent: 0, key: '', order: 19
    }, {
        id: '17', title: 'SM', name: 'Smudge', count: 0, percent: 0, key: '', order: 20
    }


]

export const basicBmClassListClint = [
{
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