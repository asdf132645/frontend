interface KcchCbcAutoMatchingProp {
    data: {
        code: string;
        count: number;
    };
    sex?: 'M' | 'F';
    age?: number;
}

export interface KcchCbcAutoMatchingReturn {
    moType: string;
    title: string;
    content: string;
}

export const sdCbcAutoMatching = (data: any, sex: any, age: any) => {
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
    const returnArr = [];

    // Normocytic normochromic anemia
    if ((sex === 'F' && Hb <= 10.9) || (sex === 'M' && Hb <= 12.4)) {
        if (EOSINO >= 0.51) {
            returnArr.push({code: "NNA, Eosinophilia"});
        }
        if (WBC >= 10.1) {
            if (PLT <= 451) {
                returnArr.push({code: "NNA, WBC(H), PLT(H)"});
            } else {
                returnArr.push({code: "NNA, WBC(H)"});
            }
        } else if (WBC <= 3.9) {
            returnArr.push({code: "NNA, WBC(L)"});
        } else if (PLT >= 451) {
            returnArr.push({code: "NNA, PLT(H)"});
        } else if (PLT <= 149) {
            returnArr.push({code: "NNA, PLT(L)"});
        } else {
            returnArr.push({code: "Normocytic normochromic anemia"});
        }
    }else {
        // WBC(L)
        if (WBC < 3.9) {
            returnArr.push({code: "WBC(L)"});
        }

        // WBC(L), PLT(L)
        if (WBC < 3.9 && PLT < 149) {
            returnArr.push({code: "WBC(L), PLT(L)"});
        }

        // PLT(L)
        if (PLT < 149) {
            returnArr.push({code: "PLT(L)"});
        }

        // PLT(H), mild
        if (PLT > 451) {
            returnArr.push({code: "PLT(H), mild"});
        }
        if (WBC >= 10.1) {
            if (PLT <= 451) {
                returnArr.push({code: "WBC(H), PLT(H)"});
            } else {
                returnArr.push({code: "WBC(H)"});
            }
        }
    }

    // Iron deficiency anemia
    if ((sex === 'F' && Hb <= 10.9) || (sex === 'M' && Hb <= 12.4)) {
        if (MCV <= 79.9 && MCHC <= 32.4) {
            if (PLT <= 149 && WBC <= 3.9) {
                returnArr.push({code: 'IDA, WBC(L), PLT(H)'});
            }
            if (WBC >= 10.1) {
                returnArr.push({code: "IDA, WBC(H)"});
            } else if (WBC <= 3.9) {
                returnArr.push({code: "IDA, WBC(L)"});
            } else if (PLT >= 451) {
                returnArr.push({code: "IDA, PLT(H)"});
            } else if (PLT <= 149) {
                returnArr.push({code: "IDA, PLT(L)"});
            } else {
                returnArr.push({code: "Iron deficiency anemia"});
            }
        }
    }

    // Iron depleted state
    if (MCV <= 79.9 && MCHC <= 32.4) {
        returnArr.push({code: "Iron depleted state"});
    }

    // Macrocytic anemia
    if (MCV >= 105.1) {
        if (WBC > 10.1) {
            returnArr.push({code: "M.A, WBC(H)"});
        } else if (PLT < 149) {
            returnArr.push({code: "M.A, PLT(L)"});
        } else {
            returnArr.push({code: "Macrocytic anemia"});
        }
    }

    // RBC(H), Hb(H)
    if ((sex === 'F' && RBC >= 5.21) || (sex === 'M' && RBC >= 5.81)) {
        if ((sex === 'F' && Hb >= 16.1) || (sex === 'M' && Hb >= 16.6)) {
            returnArr.push({code: "RBC(H),Hb(H)"});
        }
    }

    // Neutrophilia
    if (WBC > 10.1 && NEUTRO > 8.51) {
        returnArr.push({code: "Neutrophilia"});
    }

    // Lymphocytosis
    if ((Number(age) > 12 && LYMPHO > 4.01) || (Number(age) <= 12 && LYMPHO > 9.01)) {
        returnArr.push({code: "Lymphocytosis"});
    }

    // Lymphocytopenia
    if (LYMPHO < 1.49) {
        returnArr.push({code: "Lymphocytopenia"});
    }

    // Eosinophilia
    if (EOSINO > 0.51) {
        returnArr.push({code: "Eosinophilia"});
    }

    // Monocytosis
    if (MONO > 1.1) {
        returnArr.push({code: "Monocytosis"});
    }

    // Pancytopenia
    if ((sex === 'F' && Hb <= 10.9) || (sex === 'M' && Hb <= 12.4)) {
        if (WBC < 3.9 && PLT < 149) {
            returnArr.push({code: "Pancytopenia, mild"});
        }
    }

    // Chronic inflammation
    if (WBC > 10.1) {
        returnArr.push({code: "Chronic inflammation"});
    }

    return returnArr;
};

export const kcchCbcAutoMatching = ({ data, sex, age }: KcchCbcAutoMatchingProp): KcchCbcAutoMatchingReturn[] => {
    const { count, code } = data;

    const CBC_CRITERIA = {
        'LH105': (count: number) => {
            if (count < 80) return [{ moType: 'RBC', title: 'size', content: 'Microcytic' }];
            if (count > 99) return [{ moType: 'RBC', title: 'size', content: 'Macrocytic' }];
            return [];
        },

        'LH107': (count: number) => {
            if (count < 33) return [{ moType: 'RBC', title: 'chromicity', content: 'Hypochromia' }];
            if (count > 37) return [{ moType: 'RBC', title: 'chromicity', content: 'Hyperchromia' }];
            return [];
        },

        'LH108': (count: number) => {
            if (count > 14.5) return [{ moType: 'RBC', title: 'Anisocytosis', content: '유' }];
            return [];
        },

        'LH101': (count: number) => {
            if (count >= 20000) return [{ moType: 'WBC', title: 'Number', content: 'markedly increased' }];
            if (count >= 15000) return [{ moType: 'WBC', title: 'Number', content: 'moderately increased' }];
            if (count > 10000) return [{ moType: 'WBC', title: 'Number', content: 'slightly increased' }];
            if (count >= 3000 && count < 4000) return [{ moType: 'WBC', title: 'Number', content: 'slightly decreased' }];
            if (count >= 1500) return [{ moType: 'WBC', title: 'Number', content: 'moderately decreased' }];
            if (count < 1500) return [{ moType: 'WBC', title: 'Number', content: 'markedly decreased' }];
            return [];
        },

        'LH05102': (count: number) => {
            if (count > 7500) return [{ moType: 'WBC', title: '', content: 'Neutrophillia' }];
            if (count < 1500) return [{ moType: 'WBC', title: '', content: 'Neutropenia' }];
            return [];
        },

        'LH05104': (count: number) => {
            if (count > 4500) return [{ moType: 'WBC', title: '', content: 'Lymphocytosis' }];
            if (count < 1000) return [{ moType: 'WBC', title: '', content: 'Lymphocytopenia' }];
            return [];
        },

        'LH05106': (count: number) => {
            if (count > 1000) return [{ moType: 'WBC', title: '', content: 'Monocytosis' }];
            return [];
        },

        'LH05108': (count: number) => {
            if (count > 500) return [{ moType: 'WBC', title: '', content: 'Eosinophillia' }];
            return [];
        },

        'LH05110': (count: number) => {
            if (count > 200) return [{ moType: 'WBC', title: '', content: 'Basophillia' }];
            return [];
        },

        'LH109': (count: number) => {
            if (count >= 500) return [{ moType: 'PLT', title: 'Number', content: 'markedly increased' }];
            if (count >= 450) return [{ moType: 'PLT', title: 'Number', content: 'moderately increased' }];
            if (count > 400) return [{ moType: 'PLT', title: 'Number', content: 'slightly increased' }];
            if (count >= 100 && count < 130) return [{ moType: 'PLT', title: 'Number', content: 'slightly decreased' }];
            if (count >= 50) return [{ moType: 'PLT', title: 'Number', content: 'moderately decreased' }];
            if (count < 50) return [{ moType: 'PLT', title: 'Number', content: 'markedly decreased' }];
            return [];
        },

        'LH103': (count: number, sex?: 'M' | 'F', age?: number) => {
            const results: KcchCbcAutoMatchingReturn[] = [];

            if (sex === 'M') {
                if (count < 13) results.push({ moType: 'RBC', title: '', content: 'Anemia' });
                if (count > 16.5) results.push({ moType: 'RBC', title: '', content: 'Erythrocytosis' });
                if (count >= 16.5) results.push({ moType: 'RBC', title: 'hb', content: 'Erythrocytosis' });
            }
            if (sex === 'F') {
                if (count < 12) results.push({ moType: 'RBC', title: '', content: 'Anemia' });
                if (count > 16) results.push({ moType: 'RBC', title: '', content: 'Erythrocytosis' });
                if (count >= 16) results.push({ moType: 'RBC', title: 'hb', content: 'Erythrocytosis' });
            }

            if (age) {
                if (1 <= age && age <= 2 && count < 11) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                if (3 <= age && age <= 5 && count < 11.2) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                if (6 <= age && age <= 11 && count < 11.8) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });

                if (sex === 'M') {
                    if (12 <= age && age <= 15 && count < 12.6) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                    if (13 <= age && age <= 19 && count < 13.6) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                    if (20 <= age && age <= 49 && count < 13.7) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                    if (50 <= age && age <= 69 && count < 12.4) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                    if (70 <= age && count < 13.3) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                }
                if (sex === 'F') {
                    if (12 <= age && age <= 15 && count < 11.9) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                    if (16 <= age && age <= 69 && count < 12) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                    if (70 <= age && count < 11.8) results.push({ moType: 'RBC', title: 'hb', content: 'Anemia' });
                }
            }

            return results;
        }
    };

    const criteriaFn = CBC_CRITERIA[code as keyof typeof CBC_CRITERIA];
    return criteriaFn(count, sex, age);
};

