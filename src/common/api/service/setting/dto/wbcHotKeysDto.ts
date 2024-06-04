export interface WbcHotKey {
    id: string;
    title: string;
    name: string;
    count: number;
    percent: number;
    key: string;
    order: number;
}

export interface CreateWbcHotKeysDto {
    wbcHotKeysItems:wbcHotKeysItems[];
}

export interface wbcHotKeysItems {
    title: string;
    name: string;
    count: number;
    percent: number;
    key: string;
    order: number;
}

export interface UpdateWbcHotKeysDto {
    wbcHotKeysItems:wbcHotKeysItems[];
}
