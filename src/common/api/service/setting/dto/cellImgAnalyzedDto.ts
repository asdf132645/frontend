// Request Interface
export interface CellImgAnalyzedRequest {
    analysisType: string;
    diffCellAnalyzingCount: string;
    wbcPositionMargin: string;
    rbcPositionMargin: string;
    pltPositionMargin: string;
    pbsCellAnalyzingCount: string;
    stitchCount: string;
    bfCellAnalyzingCount: string;
    iaRootPath: string;
    isNsNbIntegration: boolean;
    isAlarm: boolean;
    alarmCount: string;
    keepPage: boolean;
    backupPath: string;
    backupStartDate: string;
    backupEndDate: string;
}

// Response Interface
export interface CellImgAnalyzedResponse {
    id: number;
    analysisType: string;
    diffCellAnalyzingCount: string;
    wbcPositionMargin: string;
    rbcPositionMargin: string;
    pltPositionMargin: string;
    pbsCellAnalyzingCount: string;
    stitchCount: string;
    bfCellAnalyzingCount: string;
    iaRootPath: string;
    isNsNbIntegration: boolean;
    isAlarm: boolean;
    alarmCount: string;
    keepPage: boolean;
    backupPath: string;
    backupStartDate: Date;
    backupEndDate: Date;
}