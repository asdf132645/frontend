export interface CreateImagePrintDto {
    imagePrintItems: ImagePrintItem[];
}

export interface ImagePrintItem {
    classNm: string;
    value: string;
    checked: boolean;
}

export interface UpdateImagePrintsDto {
    imagePrintItems: ImagePrintItem[];
}
