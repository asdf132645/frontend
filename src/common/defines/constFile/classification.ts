//True Positives (TP): 대각선 요소들의 합 -> TP = confusionMatrix[trueType][trueType]
//True Negatives (TN): 대각선을 제외한 모든 요소의 합  -> Total 에서 TP, FP, FN을 빼면 나오는 수
//False Positives (FP): 각 열의 합에서 TP를 뺀 값들의 합 -> FP = confusionMatrix[CellType][predictedType] - TP


// True Positives (TP), True Negatives (TN), False Positives (FP), False Negatives (FN) 계산

export interface MetricsVal {
    NES: number;
    NEB: number;
    ME: number;
    MY: number;
    PR: number;
    LY: number;
    LR: number;
    LA: number;
    MO: number;
    EO: number;
    BA: number;
    BL: number;
    PC: number;
    NR: number;
    GP: number;
    PA: number;
    AR: number;
    Total: number;
    Recall: number;
    Precision: number;
    F1Score: number;
    TruePositives: number;
    TrueNegatives: number;
    FalsePositives: number;
    FalseNegatives: number;
    Accuracy: number;
}

export type CellTypeVal =
    "NES"
    | "NEB"
    | "ME"
    | "MY"
    | "PR"
    | "LY"
    | "LR"
    | "LA"
    | "MO"
    | "EO"
    | "BA"
    | "BL"
    | "PC"
    | "NR"
    | "GP"
    | "PA"
    | "AR";
export const confusionMatrixVal: Record<CellTypeVal, Record<CellTypeVal, number>> = {
    NES: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    NEB: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    ME: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    MY: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    PR: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    LY: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    LR: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    LA: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    MO: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    EO: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    BA: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    BL: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    PC: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    NR: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    GP: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    PA: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
    AR: {
        NES: 0,
        NEB: 0,
        ME: 0,
        MY: 0,
        PR: 0,
        LY: 0,
        LR: 0,
        LA: 0,
        MO: 0,
        EO: 0,
        BA: 0,
        BL: 0,
        PC: 0,
        NR: 0,
        GP: 0,
        PA: 0,
        AR: 0
    },
};


export type CellType = CellTypeVal;

export const calculateRecall = (truePositives: number, totalPositives: number): number => {
    return totalPositives === 0 ? 0 : truePositives / totalPositives;
};

export const calculatePrecision = (truePositives: number, falsePositives: number): number => {
    return (truePositives + falsePositives) === 0 ? 0 : truePositives / (truePositives + falsePositives);
};

export const calculateF1Score = (recall: number, precision: number): number => {
    return (recall + precision) === 0 ? 0 : 2 * (recall * precision) / (recall + precision);
};

export const calculateAccuracy = (truePositives: number, trueNegatives: number, total: number): number => {
    return total === 0 ? 0 : (truePositives + trueNegatives) / total;
};
