// Request Interface
export interface CellImgAnalyzedRequest {
    analysisType: string;
    diffCellAnalyzingCount: string;
    diffWbcPositionMargin: string;
    diffRbcPositionMargin: string;
    diffPltPositionMargin: string;
    pbsCellAnalyzingCount: string;
    stitchCount: string;
    edgeShotType: boolean;
    bfCellAnalyzingCount: string;
    iaRootPath: string;
    isNsNbIntegration: boolean;
    isAlarm: boolean;
    alarmCount: string;
    keepPage: boolean;
    backupPath: string;
    backupStartDate: string;
    backupEndDate: string;
    autoBackUpMonth: string;
    autoBackUpStartDate: Date;
}

// Response Interface
export interface CellImgAnalyzedResponse {
    id: number;
    analysisType: string;
    diffCellAnalyzingCount: string;
    diffWbcPositionMargin: string;
    diffRbcPositionMargin: string;
    diffPltPositionMargin: string;
    pbsCellAnalyzingCount: string;
    stitchCount: string;
    edgeShotType: boolean;
    bfCellAnalyzingCount: string;
    iaRootPath: string;
    isNsNbIntegration: boolean;
    isAlarm: boolean;
    alarmCount: string;
    keepPage: boolean;
    backupPath: string;
    backupStartDate: Date;
    backupEndDate: Date;
    autoBackUpMonth: string;
    autoBackUpStartDate: Date;
}