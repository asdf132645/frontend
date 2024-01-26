export interface ProcessInfo {
    id?: number;
    cassetteNo: string;
    barcodeId: string;
    patientId: string;
    patientName: string;
    wbcCount: number;
    orderDate: Date;
    oilCount: number;
    createdAt?: Date;
}
