export interface CreateMinCountDto {
    minCountItems: minCountItem[];
    userId: number;
}

export interface minCountItem {
    minGpCount: number;
    minPaCount: number;
}

export interface UpdateMinCountDto {
    minCountItems: minCountItem[];
    userId: number;
}