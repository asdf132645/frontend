// src/dto/wbcCustomClass.dto.ts

export interface CreateWbcCustomClassDto {
    id?: number;
    classArr: classArr[];
}

export interface classArr {
    abbreviation?: string;
    fullNm?: string;
    customNum: string;
}

export interface UpdateWbcCustomClassDto {
    classArr: classArr[];
}

export interface CustomClassDto {
    id: number;
    abbreviation: string;
    fullNm: string;
    customNum: number;
}