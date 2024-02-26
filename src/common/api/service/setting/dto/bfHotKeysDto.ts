
export interface CreateBfHotKeysDto {
    bfHotKeysItems: BfHotKeysItems[];
    userId: number;
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
    userId: number;
}
