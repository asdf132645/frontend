export interface CreateImagePrintDto {
    imagePrintItems: ImagePrintItem[];
    userId: number;
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
