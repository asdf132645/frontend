// rbcInfoModule.ts
import { Commit } from 'vuex';

interface ClassInfo {
    classId: string;
    classNm: string;
    degree: string;
}
export interface BasicRbcInfo {
    categoryId: string;
    categoryNm: string;
    classInfo: {
        classId: string;
        classNm: string;
        degree: string;
    }[];
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

export const basicRbcArr = [
    {
        "categoryId": "01",
        "categoryNm": "Size",
        "classInfo": [
            {
                "classId": "01",
                "classNm": "Normal",
                "degree": "0"
            },
            {
                "classId": "02",
                "classNm": "Macrocyte",
                "degree": "0"
            },
            {
                "classId": "03",
                "classNm": "Microcyte",
                "degree": "0"
            },
            {
                "classId": "04",
                "classNm": "Anisocytosis",
                "degree": "0"
            }
        ]
    },
    {
        "categoryId": "02",
        "categoryNm": "Chromia",
        "classInfo": [
            {
                "classId": "01",
                "classNm": "Normal",
                "degree": "0"
            },
            {
                "classId": "02",
                "classNm": "Hyperchromic",
                "degree": "0"
            },
            {
                "classId": "03",
                "classNm": "Hypochromic",
                "degree": "0"
            },
            {
                "classId": "04",
                "classNm": "Polychromia",
                "degree": "0"
            }
        ]
    },
    {
        "categoryId": "03",
        "categoryNm": "Shape",
        "classInfo": [
            {
                "classId": "01",
                "classNm": "Normal",
                "degree": "0"
            },
            {
                "classId": "02",
                "classNm": "Poikilocytosis",
                "degree": "0"
            },
            {
                "classId": "03",
                "classNm": "Target Cell",
                "degree": "0"
            },
            {
                "classId": "04",
                "classNm": "Burr Cell",
                "degree": "0"
            },
            {
                "classId": "05",
                "classNm": "Acanthocyte",
                "degree": "0"
            },
            {
                "classId": "06",
                "classNm": "Ovalocyte",
                "degree": "0"
            },
            {
                "classId": "07",
                "classNm": "Schistocyte",
                "degree": "0"
            },
            {
                "classId": "08",
                "classNm": "Sickle Cell",
                "degree": "0"
            },
            {
                "classId": "09",
                "classNm": "Stomatocyte",
                "degree": "0"
            },
            {
                "classId": "10",
                "classNm": "Tear Drop Cell",
                "degree": "0"
            },
            {
                "classId": "11",
                "classNm": "Spherocyte",
                "degree": "0"
            }
        ]
    },
    {
        "categoryId": "05",
        "categoryNm": "Inclusion Body",
        "classInfo": [
            {
                "classId": "01",
                "classNm": "Howell-Jolly Body",
                "degree": "0"
            },
            {
                "classId": "02",
                "classNm": "Basophilic Stippling",
                "degree": "0"
            }
        ]
    }
];