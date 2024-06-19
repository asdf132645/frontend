export interface CreateRunCountDto {
    wbcRunCountItems: runCountItem[];
}

export interface runCountItem {
    id?: string;
    min: number;
    max: number;
    wbcConditionCount: number;
}

export interface UpdateRunCountDto {
    wbcRunCountItems: runCountItem[];
}