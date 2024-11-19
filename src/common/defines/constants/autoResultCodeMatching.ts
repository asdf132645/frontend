export const sdCbcAutoMatiching = (data: any, sex: any, age: any) => {
    const MCV = parseFloat(data.find((item: any) => item.classNm === 'MCV')?.count);
    const MCHC = parseFloat(data.find((item: any) => item.classNm === 'MCHC')?.count);
    const Hb = parseFloat(data.find((item: any) => item.classNm === 'HGB')?.count);
    const WBC = parseFloat(data.find((item: any) => item.classNm === 'WBC')?.count);
    const PLT = parseFloat(data.find((item: any) => item.classNm === 'PLT')?.count);
    const EOSINO = parseFloat(data.find((item: any) => item.classNm === 'EO')?.count);
    const NEUTRO = parseFloat(data.find((item: any) => item.classNm === 'NEUT')?.count);
    const LYMPHO = parseFloat(data.find((item: any) => item.classNm === 'LYMPH')?.count);
    const MONO = parseFloat(data.find((item: any) => item.classNm === 'MONO')?.count);
    const RBC = parseFloat(data.find((item: any) => item.classNm === 'RBC')?.count);

    // Normocytic normochromic anemia
    if ((sex === 'F' && Hb <= 10.9) || (sex === 'M' && Hb <= 12.4)) {
        if(EOSINO >= 0.51){
            return {code: "NNA, Eosinophilia"};
        }
        if (WBC >= 10.1) {
            if (PLT <= 451) {
                return {code: "NNA, WBC(H), PLT(H)"};
            } else {
                return {code: "NNA, WBC(H)"};
            }
        } else if (WBC <= 3.9) {
            return {code: "NNA, WBC(L)"};
        } else if (PLT >= 451) {
            return {code: "NNA, PLT(H)"};
        } else if (PLT <= 149) {
            return {code: "NNA, PLT(L)"};
        } else {
            return {code: "Normocytic normochromic anemia"};
        }
    }

    // Iron deficiency anemia
    if ((sex === 'F' && Hb <= 10.9) || (sex === 'M' && Hb <= 12.4)) {
        if (MCV <= 79.9 && MCHC <= 32.4) {
            if(PLT <= 149 && WBC <= 3.9){
                return {code: 'IDA, WBC(L), PLT(H)'};
            }
            if (WBC >= 10.1) {
                return {code: "IDA, WBC(H)"};
            } else if (WBC <= 3.9) {
                return {code: "IDA, WBC(L)"};
            } else if (PLT >= 451) {
                return {code: "IDA, PLT(H)"};
            } else if (PLT <= 149) {
                return {code: "IDA, PLT(L)"};
            }
            else {
                return {code: "Iron deficiency anemia"};
            }
        }
    }

    // Iron depleted state
    if (MCV <= 79.9 && MCHC <= 32.4) {
        return {code: "Iron depleted state"};
    }

    // Macrocytic anemia
    if (MCV >= 105.1) {
        if (WBC > 10.1) {
            return {code: "M.A, WBC(H)"};
        } else if (PLT < 149) {
            return {code: "M.A, PLT(L)"};
        } else {
            return {code: "Macrocytic anemia"};
        }
    }

    // RBC(H), Hb(H)
    if ((sex === 'F' && RBC >= 5.21) || (sex === 'M' && RBC >= 5.81)) {
        if ((sex === 'F' && Hb >= 16.1) || (sex === 'M' && Hb >= 16.6)) {
            return {code: "RBC(H),Hb(H)"};
        }
    }

    // Neutrophilia
    if (WBC > 10.1 && NEUTRO > 8.51) {
        return {code: "Neutrophilia"};
    }

    // Lymphocytosis
    if ((Number(age) > 12 && LYMPHO > 4.01) || (Number(age) <= 12 && LYMPHO > 9.01)) {
        return {code: "Lymphocytosis"};
    }

    // Lymphocytopenia
    if (LYMPHO < 1.49) {
        return {code: "Lymphocytopenia"};
    }

    // Eosinophilia
    if (EOSINO > 0.51) {
        return {code: "Eosinophilia"};
    }

    // Monocytosis
    if (MONO > 1.1) {
        return {code: "Monocytosis"};
    }

    // Pancytopenia
    if ((sex === 'F' && Hb <= 10.9) || (sex === 'M' && Hb <= 12.4)) {
        if (WBC < 3.9 && PLT < 149) {
            return {code: "Pancytopenia, mild"};
        }
    }

    // Chronic inflammation
    if (WBC > 10.1) {
        return {code: "Chronic inflammation"};
    }

    // WBC(L)
    if (WBC < 3.9) {
        return {code: "WBC(L)"};
    }

    // WBC(L), PLT(L)
    if (WBC < 3.9 && PLT < 149) {
        return {code: "WBC(L), PLT(L)"};
    }

    // PLT(L)
    if (PLT < 149) {
        return {code: "PLT(L)"};
    }

    // PLT(H), mild
    if (PLT > 451) {
        return {code: "PLT(H), mild"};
    }

    // If no conditions matched
    return {code: "No matching condition"};
};
