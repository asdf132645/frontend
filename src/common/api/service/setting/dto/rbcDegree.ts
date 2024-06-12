// src/rbcDegree/dto/rbcDegree.dto.ts
export interface RbcDegreeDto {
    categories: CategoryDto[];
}

export interface CategoryDto {
    category_id: string;
    category_nm: string;
    class_id: string;
    class_nm: string;
    degree: string;
}

export interface UpdateRbcDegreeDto {
    degree: string;
}

export interface ClassItem {
    id: number;
    category_id: string;
    category_nm: string;
    class_id: string;
    class_nm: string;
    degree: string;
    degreeId: number;
}

export interface RbcDegreeRes {
    categories: Category[];
    id?: number;
}

export interface Category {
    category_id: string;
    category_nm: string;
    classInfo: ClassItem[];
}
