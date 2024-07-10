// wbc
export interface CreateLisCodeDto {
    lisCodeItems: LisCodeWbcItem[];
}

export interface LisCodeWbcItem {
    id: number | string;
    fullNm: string;
    classId: string;
    key: string;
}

export interface UpdateLisCodeDto {
    lisCodeItems: LisCodeWbcItem[];
}

// rbc
export interface CreateLisCodeRbcDto {
    lisCodeItems: LisCodeRbcItem[];
}


export interface LisCodeRbcItem {
    categoryId: string;
    categoryNm: string;
    classId: string;
    fullNm: string;
    key: string;
}

export interface UpdateLisCodeRbcDto {
    lisCodeItems: LisCodeRbcItem[];
}

//cbc

export interface CreateCbcCodeRbcDto {
    cbcCodeItems: cbcCodeItem[];
}


export interface cbcCodeItem {
    cd: string;
    classCd: string;
    fullNm: string;
    isSelected: boolean;
}

export interface UpdateCbcCodeRbcDto {
    cbcCodeItems: cbcCodeItem[];
}
