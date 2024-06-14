// Request Interface
export interface CellImgAnalyzedRequest {
    analysisType: string;
    cellAnalyzingCount: string;
    wbcPositionMargin: string;
    rbcPositionMargin: string;
    pltPositionMargin: string;
    pbsAnalysisType: string;
    stitchCount: string;
    bfAnalysisType: string;
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
    cellAnalyzingCount: string;
    wbcPositionMargin: string;
    rbcPositionMargin: string;
    pltPositionMargin: string;
    pbsAnalysisType: string;
    stitchCount: string;
    bfAnalysisType: string;
    iaRootPath: string;
    isNsNbIntegration: boolean;
    isAlarm: boolean;
    alarmCount: string;
    keepPage: boolean;
    backupPath: string;
    backupStartDate: Date;
    backupEndDate: Date;
}