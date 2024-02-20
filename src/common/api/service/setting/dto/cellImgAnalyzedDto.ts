// Request Interface
export interface CellImgAnalyzedRequest {
    analysisType: string;
    cellAnalyzingCount: string;
    wbcPositionMargin: string;
    rbcPositionMargin: string;
    pltPositionMargin: string;
    pbAnalysisType2: string;
    stitchCount: string;
    bfAnalysisType: string;
    pbiaRootPath: string;
    isNsNbIntegration: boolean;
    isAlarm: boolean;
    alarmCount: string;
    keepPage: boolean;
    backupPath: string;
    backupStartDate: string;
    backupEndDate: string;
    userId: string;
}

// Response Interface
export interface CellImgAnalyzedResponse {
    id: number;
    analysisType: string;
    cellAnalyzingCount: string;
    wbcPositionMargin: string;
    rbcPositionMargin: string;
    pltPositionMargin: string;
    pbAnalysisType2: string;
    stitchCount: string;
    bfAnalysisType: string;
    pbiaRootPath: string;
    isNsNbIntegration: boolean;
    isAlarm: boolean;
    alarmCount: string;
    keepPage: boolean;
    backupPath: string;
    backupStartDate: Date;
    backupEndDate: Date;
    userId: string;
}