// src/dto/wbcCustomClass.dto.ts

export interface CreateWbcCustomClassDto {
    id?: number;
    classArr: classArr[];
    userId?: number;
}

export interface classArr {
    abbreviation?: string;
    className?: string;
}

export interface UpdateWbcCustomClassDto {
    classArr: classArr[];
    userId?: number;
}
