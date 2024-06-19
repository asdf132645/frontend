// src/dto/wbcCustomClass.dto.ts

export interface CreateWbcCustomClassDto {
    id?: number;
    classArr: classArr[];
}

export interface classArr {
    abbreviation?: string;
    fullNm?: string;
}

export interface UpdateWbcCustomClassDto {
    classArr: classArr[];
}
