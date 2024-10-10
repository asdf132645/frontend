interface hospitalSideCdState {
    siteCd: string;
    hospitalNm: string;
}

export const hospitalSiteCdByName = {
    '0000': '0000',
    '서울성모병원': '0002',
    '스타고': '0003',
    '이원의료재단': '0004',
    '고대안암병원': '0006',
    '삼광의료재단': '0007',
    '인하대병원': '0011',
    '인천길병원': '0019',
    '인천성모병원': '0021',
    '건국대학교병원': '0026',
    '고대구로병원': '0034',
    '국립암센터': '0035',
} as const

export const hospitalSiteCd: hospitalSideCdState[] = [
    { siteCd: '', hospitalNm: '0000' },
    { siteCd: '0000', hospitalNm: '0000' },
    { siteCd: '0002', hospitalNm: '서울성모병원' },
    { siteCd: '0003', hospitalNm: '스타고' },
    { siteCd: '0004', hospitalNm: '이원의료재단' },
    { siteCd: '0006', hospitalNm: '고대안암병원' },
    { siteCd: '0007', hospitalNm: '삼광의료재단' },
    { siteCd: '0011', hospitalNm: '인하대병원' },
    { siteCd: '0019', hospitalNm: '인천길병원' },
    { siteCd: '0021', hospitalNm: '인천성모병원' },
    { siteCd: '0026', hospitalNm: '건국대학교병원' },
    { siteCd: '0034', hospitalNm: '고대구로병원' },
    { siteCd: '0035', hospitalNm: '국립암센터' },
]