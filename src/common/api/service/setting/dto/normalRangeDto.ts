

export interface CreateNormalRange {
    normalRangeItems: NormalRangeItems[];
}

export interface NormalRangeItems {
    title: string;
    name: string;
    count: number;
    percent: number;
    key: string;
    order: number;
}

export interface NormalRangeUpdateDto {
    normalRangeItems: NormalRangeItems[];
}
