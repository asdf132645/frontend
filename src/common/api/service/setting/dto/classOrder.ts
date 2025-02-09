export interface ClassOrderResponse {
    id: number;
    classId: string;
    abbreviation: string;
    fullNm: string;
    orderIdx: string;
}

export interface ClassOrderRequest {
    classId?: string;
    abbreviation?: string;
    fullNm?: string;
    orderIdx?: string;
}