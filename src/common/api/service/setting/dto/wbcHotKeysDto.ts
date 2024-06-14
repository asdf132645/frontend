export interface WbcHotKey {
    id: string;
    abbreviation: string;
    fullNm: string;
    key: string;
    orderIdx: number;
}

export interface CreateWbcHotKeysDto {
    wbcHotKeysItems:wbcHotKeysItems[];
}

export interface wbcHotKeysItems {
    abbreviation: string;
    fullNm: string;
    key: string;
    orderIdx: number;
}

export interface UpdateWbcHotKeysDto {
    wbcHotKeysItems:wbcHotKeysItems[];
}
