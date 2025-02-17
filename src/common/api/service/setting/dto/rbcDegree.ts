// src/rbcDegree/dto/rbcDegree.dto.ts

export interface RbcDegreeResponse {
    categoryId: string;
    categoryNm: string;
    classId: string;
    classNm: string;
    degree1: string;
    degree2: string;
    degree3: string;
}

export interface RbcDegreeClassList {
    categoryId: string;
    categoryNm: string;
    classInfo: RbcDegreeClassInfo[];
}

export interface RbcDegreeClassInfo {
    classId: string;
    classNm: string;
    degree1: string;
    degree2: string;
    degree3: string;
}

export interface RbcDegreeRequest {
    categoryId: string;
    categoryNm: string;
    classId: string;
    classNm: string;
    degree1: string;
    degree2: string;
    degree3: string;
}