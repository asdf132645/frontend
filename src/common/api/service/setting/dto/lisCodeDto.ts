// wbc
export interface CreateLisCodeDto {
    lisCodeItems: LisCodeWbcItem[];
}

export interface LisCodeWbcItem {
    text: string;
    value: string;
    code: string;
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
    classNm: string;
    code: string;
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
    classNm: string;
    isSelected: boolean;
}

export interface UpdateCbcCodeRbcDto {
    cbcCodeItems: cbcCodeItem[];
}
