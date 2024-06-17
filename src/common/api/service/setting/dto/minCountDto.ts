export interface CreateMinCountDto {
    minCountItems: minCountItem[];
}

export interface minCountItem {
    minGPCount: number;
    minPACount: number;
}

export interface UpdateMinCountDto {
    minCountItems: minCountItem[];
}