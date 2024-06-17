

export interface CreateNormalRange {
    normalRangeItems: NormalRangeItems[];
}

export interface NormalRangeItems {
    abbreviation: string;
    fullNm: string;
    min: number;
    max: number;
    uint: string;
}

export interface NormalRangeUpdateDto {
    normalRangeItems: NormalRangeItems[];
}
