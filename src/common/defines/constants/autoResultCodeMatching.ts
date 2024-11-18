export const SD_CBC_AUTO_MATCHING = [
    {
        code: "Iron depleted state",
        description: "MCV ≤ 79.9, MCHC ≤ 32.4",
        condition: (data: any, sex: string, age: string) => data.MCV <= 79.9 && data.MCHC <= 32.4,
    },
    {
        code: "Normocytic normochromic anemia",
        description: "HGB가 낮음",
        condition: (data: any, sex: string, age: string) =>
            (sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4),
    },
    {
        code: "NNA, WBC(H)",
        description: "WBC ≥ 10.1",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.WBC >= 10.1,
    },
    {
        code: "NNA, PLT(H)",
        description: "PLT ≥ 451",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.PLT >= 451,
    },
    {
        code: "NNA, WBC(L)",
        description: "WBC ≤ 3.9",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.WBC <= 3.9,
    },
    {
        code: "NNA, PLT(L)",
        description: "PLT ≤ 149",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.PLT <= 149,
    },
    {
        code: "NNA, Eosinophilia",
        description: "EOSINO ≥ 0.51",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.EOSINO >= 0.51,
    },
    {
        code: "Hemolytic anemia",
        description: "MCV ≤ 79.9, MCHC ≤ 32.4",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.MCV <= 79.9 &&
            data.MCHC <= 32.4,
    },
    {
        code: "IDA, PLT(H)",
        description: "PLT ≥ 451",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.PLT >= 451,
    },
    {
        code: "IDA, WBC(H)",
        description: "WBC ≥ 10.1",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.WBC >= 10.1,
    },
    {
        code: "IDA, WBC(L)",
        description: "WBC ≤ 3.9",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.WBC <= 3.9,
    },
    {
        code: "IDA, WBC(L), PLT(L)",
        description: "WBC ≤ 3.9, PLT ≤ 149",
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB <= 10.9) || (sex === "M" && data.HGB <= 12.4)) &&
            data.WBC <= 3.9 &&
            data.PLT <= 149,
    },
    {
        code: "Macrocytic anemia",
        description: "MCV ≥ 105",
        condition: (data: any, sex: string, age: string) => data.MCV >= 105,
    },
    {
        code: "RBC(H), HGB(H)",
        description: "여성 RBC ≥ 5.21, HGB ≥ 16.1 / 남성 RBC ≥ 5.81, HGB ≥ 16.6",
        condition: (data: any, sex: string, age: string) =>
            (sex === "F" && data.RBC >= 5.21 && data.HGB >= 16.1) ||
            (sex === "M" && data.RBC >= 5.81 && data.HGB >= 16.6),
    },
    {
        code: "Neutrophilia",
        description: "WBC ≥ 10.1, NEUTRO ≥ 8.51",
        condition: (data: any, sex: string, age: string) => data.WBC >= 10.1 && data.NEUT >= 8.51,
    },
    {
        code: "Lymphocytosis",
        description: "성인 LYMPH ≥ 4.01, 소아 LYMPH ≥ 9.01",
        condition: (data: any, sex: string, age: string) =>
            (parseInt(age) >= 18 && data.LYMPH >= 4.01) ||
            (parseInt(age) < 18 && data.LYMPH >= 9.01),
    },
    {
        code: "LYMPHocytopenia",
        description: "LYMPH ≤ 1.49",
        condition: (data: any, sex: string, age: string) => data.LYMPH <= 1.49,
    },
    {
        code: "Eosinophilia",
        description: "EOSINO ≥ 0.51",
        condition: (data: any, sex: string, age: string) => data.EOSINO >= 0.51,
    },
    {
        code: "PLT(L)",
        description: '',
        condition: (data: any, sex: string, age: string) => data.PLT !== undefined && data.PLT <= 149,
    },
    {
        code: "PLT(H), mild",
        description: '',
        condition: (data: any, sex: string, age: string) => data.PLT !== undefined && data.PLT >= 451,
    },
    {
        code: "Pancytopenia, mild",
        description: '',
        condition: (data: any, sex: string, age: string) =>
            ((sex === "F" && data.HGB !== undefined && data.HGB <= 10.9) ||
                (sex === "M" && data.HGB !== undefined && data.HGB <= 12.4)) &&
            data.WBC !== undefined &&
            data.WBC <= 3.9 &&
            data.PLT !== undefined &&
            data.PLT <= 149,
    },
    {
        code: "WBC(H), PLT(H)",
        description: '',
        condition: (data: any, sex: string, age: string) =>
            data.WBC !== undefined &&
            data.WBC >= 10.1 &&
            data.PLT !== undefined &&
            data.PLT >= 451,
    },
    {
        code: "WBC(H)",
        description: '',
        condition: (data: any, sex: string, age: string) => data.WBC !== undefined && data.WBC >= 10.1,
    },
    {
        code: "M.A, WBC(H)",
        description: '',
        condition: (data: any, sex: string, age: string) =>
            data.MCV !== undefined && data.MCV >= 105.1 && data.WBC !== undefined && data.WBC >= 10.1,
    },
    {
        code: "M.A, PLT(L)",
        description: '',
        condition: (data: any, sex: string, age: string) =>
            data.MCV !== undefined && data.MCV >= 105.1 && data.PLT !== undefined && data.PLT >= 451,
    },
    {
        code: "Monocytosis",
        description: '',
        condition: (data: any, sex: string, age: string) => data.MONO !== undefined && data.MONO >= 1.1,
    },
];
