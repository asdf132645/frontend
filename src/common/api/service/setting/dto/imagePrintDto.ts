// ImagePrintItems와 관련된 타입들
export interface CreateImagePrintDto {
    imagePrintItems: ImagePrintItem[];
    userId: number;
}

export interface ImagePrintResDto {
    imagePrintItems: ImagePrintItem[];
}

export interface ImagePrintItem {
    text: string;
    value: string;
    code: string;
    checked: boolean;
}

export interface UpdateImagePrintsDto {
    imagePrintItems: ImagePrintItem[];
    userId: number;
}
