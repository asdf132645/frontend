export interface CreateRunCountDto {
    wbcRunCountItems: runCountItem[];
}

export interface runCountItem {
    num?: number
    id?: string;
    min: number;
    max: number;
    wbcCount: number;
}

export interface UpdateRunCountDto {
    wbcRunCountItems: runCountItem[];
}