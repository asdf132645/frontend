export const testType = [
    {value: '01', text: 'WBC Diff'},
    {value: '04', text: 'PBS'},
    {value: '02', text: 'Body fluid default'},
    {value: '03', text: 'Body fluid select'}
];

export const bmTestType = [
    {value: '02', text: 'BM smear'},
    {value: '03', text: 'Touch print'},
    {value: '04', text: 'BM biopsy'},
    {value: '05', text: 'Clot section'}
];

export const RBC_CODE_CLASS_ID = {
    SIZE: {
        CATEGORY_ID: '01',
        NORMAL: '01',
        MACROCYTE: '02',
        MICROCTYE: '03',
        ANISOCYTOSIS: '04',
    },
    CHROMIA: {
        CATEGORY_ID: '02',
        NORMAL: '01',
        HYPERCHROMIC: '02',
        HYPOCHROMIC: '03',
        POLYCHROMIA: '04',
    },
    SHAPE: {
        CATEGORY_ID: '03',
        NORMAL: '01',
        POLIKILOCYTOSIS: '02',
        TARGET_CELL: '03',
        BURR_CELL: '04',
        ACANTHOCYTE: '05',
        OVALOCYTE: '06',
        SCHISTOCYTE: '07',
        SICKLE_CELL: '08',
        STOMATOCYTE: '09',
        TEAR_DROP_CELL: '10',
        SPHEROCYTE: '11'
    },
    INCLUSION_BODY: {
        CATEGORY_ID: '05',
        HOWELL_JOLLY_BODY: '01',
        BASOPHILIC_STIPPLING: '02',
        MALARIA: '03',
    },
    OTHERS: {
        CATEGORY_ID: '04',
        PLATELET: '01',
    }
}

export const SHOWING_RBC_SHAPE_CLASS_IDS = [
    RBC_CODE_CLASS_ID.SHAPE.NORMAL,
    RBC_CODE_CLASS_ID.SHAPE.POLIKILOCYTOSIS,
    RBC_CODE_CLASS_ID.SHAPE.TARGET_CELL,
    RBC_CODE_CLASS_ID.SHAPE.BURR_CELL,
    RBC_CODE_CLASS_ID.SHAPE.ACANTHOCYTE,
    RBC_CODE_CLASS_ID.SHAPE.OVALOCYTE,
    RBC_CODE_CLASS_ID.SHAPE.SCHISTOCYTE,
    RBC_CODE_CLASS_ID.SHAPE.SICKLE_CELL,
    RBC_CODE_CLASS_ID.SHAPE.STOMATOCYTE,
    RBC_CODE_CLASS_ID.SHAPE.TEAR_DROP_CELL,
    RBC_CODE_CLASS_ID.SHAPE.SPHEROCYTE,
]

export const lisCodeRbcOption = [
    { categoryId: '01', categoryNm: 'Size', classId: '01', fullNm: 'Normal', key: 'SIZENO' },
    { categoryId: '01', categoryNm: 'Size', classId: '02', fullNm: 'Macrocyte', key: 'SIZEMA' },
    { categoryId: '01', categoryNm: 'Size', classId: '03', fullNm: 'Microcyte', key: 'SIZEMI' },
    { categoryId: '01', categoryNm: 'Size', classId: '04', fullNm: 'Anisocytosis', key: 'SIZEAN' },
    { categoryId: '02', categoryNm: 'Chromia', classId: '01', fullNm: 'Normal', key: 'CHRONO' },
    { categoryId: '02', categoryNm: 'Chromia', classId: '02', fullNm: 'Hyperchromic', key: 'CHRHPE' },
    { categoryId: '02', categoryNm: 'Chromia', classId: '03', fullNm: 'Hypochromic', key: 'CHRHPO' },
    { categoryId: '02', categoryNm: 'Chromia', classId: '04', fullNm: 'Polychromia', key: 'CHRPOL' },
    { categoryId: '03', categoryNm: 'Shape', classId: '01', fullNm: 'Normal', key: 'SHAPNO' },
    { categoryId: '03', categoryNm: 'Shape', classId: '02', fullNm: 'Poikilocytosis', key: 'SHAPPO' },
    { categoryId: '03', categoryNm: 'Shape', classId: '03', fullNm: 'Target Cell', key: 'SHAPTA' },
    { categoryId: '03', categoryNm: 'Shape', classId: '04', fullNm: 'Burr Cell', key: 'SHAPBU' },
    { categoryId: '03', categoryNm: 'Shape', classId: '05', fullNm: 'Acanthocyte', key: 'SHAPAC' },
    { categoryId: '03', categoryNm: 'Shape', classId: '06', fullNm: 'Ovalocyte', key: 'SHAPOV' },
    { categoryId: '03', categoryNm: 'Shape', classId: '07', fullNm: 'Schistocyte', key: 'SHAPSC' },
    { categoryId: '03', categoryNm: 'Shape', classId: '08', fullNm: 'Sickle Cell', key: 'SHAPSI' },
    { categoryId: '03', categoryNm: 'Shape', classId: '09', fullNm: 'Stomatocyte', key: 'SHAPST' },
    { categoryId: '03', categoryNm: 'Shape', classId: '10', fullNm: 'Tear Drop Cell', key: 'SHAPTE' },
    { categoryId: '03', categoryNm: 'Shape', classId: '11', fullNm: 'Spherocyte', key: 'SHAPSP' },
    { categoryId: '05', categoryNm: 'Inclusion Body', classId: '01', fullNm: 'Howell-Jolly Body', key: 'SHAPHO' },
    { categoryId: '05', categoryNm: 'Inclusion Body', classId: '02', fullNm: 'Basophilic Stippling', key: 'SHAPBA' }
]