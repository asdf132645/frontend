export interface CreateRunCountDto {
    wbcRunCountItems: runCountItem[];
}

export interface runCountItem {
    id?: string;
    min: number;
    max: number;
    wbcTargetCount: number;
}

export interface UpdateRunCountDto {
    wbcRunCountItems: runCountItem[];
}