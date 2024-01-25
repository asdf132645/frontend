export interface ProcessInfo {
    ID?: number;
    CASSETTE_NO: string;
    BARCODE_ID: string;
    PATIENT_ID: string;
    PATIENT_NAME: string;
    WBC_COUNT: number;
    ORDER_DATE: Date;
    OIL_COUNT: number;
    CREATED_AT?: Date;
}
