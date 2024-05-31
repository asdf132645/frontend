
export interface CreateBfHotKeysDto {
    bfHotKeysItems: BfHotKeysItems[];
}

export interface BfHotKeysItems {
    title: string;
    name: string;
    count: number;
    percent: number;
    key: string;
    order: number;
}

export interface UpdateBfHotKeysDto {
    bfHotKeysItems: BfHotKeysItems[];
}
