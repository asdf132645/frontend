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