export interface CreateImagePrintDto {
    imagePrintItems: ImagePrintItem[];
}

export interface ImagePrintItem {
    fullNm: string;
    classId: string;
    checked: boolean;
}

export interface UpdateImagePrintsDto {
    imagePrintItems: ImagePrintItem[];
}
