
export interface CreateBfHotKeysDto {
    bfHotKeysItems: BfHotKeysItems[];
}

export interface BfHotKeysItems {
    abbreviation: string;
    fullNm: string;
    key: string;
    order: number;
}

export interface UpdateBfHotKeysDto {
    bfHotKeysItems: BfHotKeysItems[];
}
