export interface CreateMinCountDto {
    minCountItems: minCountItem[];
}

export interface minCountItem {
    minGpCount: number;
    minPaCount: number;
}

export interface UpdateMinCountDto {
    minCountItems: minCountItem[];
}