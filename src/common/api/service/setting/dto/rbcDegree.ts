// src/rbcDegree/dto/rbcDegree.dto.ts
export interface RbcDegreeDto {
    categories: CategoryDto[];
}

export interface CategoryDto {
    categoryId: string;
    categoryNm: string;
    classId: string;
    classNm: string;
    degree: string;
}

export interface UpdateRbcDegreeDto {
    degree: string;
}

export interface ClassItem {
    id: number;
    categoryId: string;
    categoryNm: string;
    classId: string;
    classNm: string;
    degree: string;
    degreeId: number;
}

export interface RbcDegreeRes {
    categories: Category[];
    id?: number;
}

export interface Category {
    categoryId: string;
    categoryNm: string;
    classInfo: ClassItem[];
}
