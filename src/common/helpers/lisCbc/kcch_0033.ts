import { readFileTxt, readH7File } from "@/common/api/service/fileReader/fileReaderApi";
import { fileSysClean, fileSysCopy } from "@/common/api/service/fileSys/fileSysApi";

interface CRCArrType {
    crcCode: string | null;
    crcCodeMatching: string | null;
    crcContent: string;
    crcPercentText: string;
    crcTitle: string;
    crcType: string;
    id: number;
    morphologyType: 'RBC' | 'WBC' | 'PLT';
    val?: string;
}

interface Kcch0033LISSendType {
    barcodeNo: string;
    rtfData: any;
}

interface Kcch0033GetCBCDataType {
    iaRootPath: string;
    cbcFilePathSetArr: string;
    barcodeNo: string;
    slotId: string;
    cbcCodeList: any;
}

export const kcch_0033LisSend = async ({ barcodeNo, rtfData }: Kcch0033LISSendType) => {
    const formData = new FormData();
    formData.append('rtfContent', rtfData);
    formData.append('barcodeNo', barcodeNo);
    try {
        const result = await fetch(`${window.MAIN_API_IP}/oracle/rtf-send`, {
            method: 'POST',
            body: formData,
        });
        console.log('result', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

export const kcch_0033RTFConvert = async (htmlData: HTMLElement) => {
    const requestHTMLData = htmlData.innerHTML;
    const formData = new FormData();

    formData.append('htmlContent', requestHTMLData);

    try {
        const result = await fetch(`${window.MAIN_API_IP}/rtf/convert`, {
            method: 'POST',
            body: formData,
        });
        const rtfContent = await result.json();
        if (rtfContent?.success) {
            return rtfContent?.data;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export const kcch_0033GetCBCData = async ({ iaRootPath, cbcFilePathSetArr, barcodeNo, slotId, cbcCodeList }: Kcch0033GetCBCDataType) => {
    const resultCBCCode: any = [];
    let fileListName = '';
    let filePath = '';
    let cbcPatientNo = '';
    let cbcPatientNm = '';
    let cbcSex = '';
    let cbcAge = '';
    let hosName = '';
    fileListName = barcodeNo;
    filePath = cbcFilePathSetArr;
    const readFileTxtRes: any = await readFileTxt(`path=${filePath}&filename=${fileListName}`);

    if (readFileTxtRes.data.success) {
        const fileParams = {
            source: `${cbcFilePathSetArr}\\${barcodeNo}.hl7`,
            destination: `${iaRootPath}\\${slotId}`,
        };
        const fileSysCleanParams = {
            directoryPath: `${cbcFilePathSetArr}`,
            keyword: barcodeNo
        }
        await fileSysCopy(fileParams);
        // await fileSysClean(fileSysCleanParams);
        const msg: any = await readH7File(readFileTxtRes.data.data);

        msg?.data?.segments?.forEach((cbcSegment: any) => {
            const segmentName = cbcSegment.name.trim();

            if (segmentName === 'OBX') {
                cbcCodeList.forEach((cbcCode: any) => {
                    const classCd = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0];
                    const count = cbcSegment?.fields?.[4]?.value?.[0]?.[0]?.value?.[0] || "0";
                    const unit = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0].match(/%/g)?.[0] || "";

                    // 클래스 코드가 일치하는 경우
                    if (cbcCode.classCd === classCd) {
                        // 중복 확인: 이미 동일한 classNm이 있는지 확인
                        const isDuplicate = resultCBCCode.some(
                            (item: any) => item.classNm === cbcCode.fullNm
                        );

                        // 중복이 아닐 경우에만 추가
                        if (!isDuplicate) {
                            const obj = {
                                code: classCd,
                                classNm: cbcCode.fullNm,
                                count: count,
                                unit
                            };
                            resultCBCCode.push(obj);
                        }
                    }
                });
            }
            else if (cbcSegment.name.trim() === 'PID') {
                cbcPatientNo = cbcSegment.fields[1].value[0][0].value[0]
                cbcPatientNm = cbcSegment.fields[4].value[0][0].value[0]
                cbcSex = cbcSegment.fields[6].value[0][0].value[0]
                cbcAge = cbcSegment.fields[7].value[0][0].value[0];
                hosName = cbcSegment?.fields[10]?.value[0][0]?.value[0];
            }
        });

        return { resultCBCCode, cbcPatientNo, cbcPatientNm, cbcSex, cbcAge, hosName }
    } else {
        console.error(readFileTxtRes.data.message);
    }
}

export const changeRemark = (crcArr: any, createdSummary: any, remarkList: any) => {
    const defaultCBCRemark: Record<string, any[]> = { RBC: [], WBC: [], PLT: [] };

    // 중복 제거: RBC, WBC, PLT 처리 루프 통합
    for (const key of Object.keys(defaultCBCRemark)) {
        for (const item of createdSummary[key] || []) {
            if (!defaultCBCRemark[key].some(cbcItem => cbcItem.title === item.title && cbcItem.content === item.content)) {
                defaultCBCRemark[key].push({ title: item.title, content: item.content });
            }
        }
    }

    // remarkContentArr 생성 및 필터링
    const remarkContentArr = crcArr
        .map((crcItem: any) => kcchCbcCommentAutoMatching({
            moType: crcItem?.morphologyType,
            title: crcItem?.crcTitle,
            val: crcItem?.val,
        }))
        .filter(Boolean);

    // remarkContentArr의 항목을 defaultCBCRemark에 업데이트
    for (const remarkItem of remarkContentArr) {
        const category = defaultCBCRemark[remarkItem.moType] || [];

        const existingItem = category.find(categoryItem => categoryItem.title === remarkItem.title);

        if (existingItem) {
            existingItem.content = remarkItem.value;
        } else {
            category.push({ title: remarkItem.title, content: remarkItem.value });
        }
    }

    if (remarkList[0] && remarkList[0]?.remarkAllContent) {
        remarkList[0].remarkAllContent = '';
    }

    // remarkAllContent 문자열 생성 최적화
    for (const [key, value] of Object.entries(defaultCBCRemark)) {
        if (Array.isArray(value)) {
            const contentValue = value.map(item => item.content).filter(Boolean);
            if (contentValue.length > 0 && remarkList[0]) {
                remarkList[0].remarkAllContent += (remarkList[0].remarkAllContent ? `\n` : '') + `${key}: ${contentValue.join(', ')}`;
            }
        }
    }
}

export const kcchCbcCommentAutoMatching = ({ moType, title, val }: { moType: string; title: string; val?: string }) => {
    // content: 매칭에 사용하는 값, value: 종합결과 코드 Summary of findings에 보여줄 값
    const MAP_CBC_COMMENTS = [
        { moType: 'RBC', title: 'Size', content: 'Microcytic', value: 'Microcytic' },
        { moType: 'RBC', title: 'Size', content: 'Macrocytic', value: 'Macrocytic' },
        { moType: 'RBC', title: 'Size', content: 'Normocytic', value: '' },
        { moType: 'RBC', title: 'Anisocytosis', content: '유', value: 'anemia with anisocytosis' },
        { moType: 'RBC', title: 'Anisocytosis', content: '무', value: '' },
        { moType: 'RBC', title: 'Polychromasia', content: '+', value: '' },
        { moType: 'RBC', title: 'Polychromasia', content: '-', value: '' },
        { moType: 'RBC', title: 'Inclusion', content: '+', value: '' },
        { moType: 'RBC', title: 'Inclusion', content: '-', value: '' },
        { moType: 'RBC', title: 'RBC shape (2)', content: 'None', value: '' },
        { moType: 'RBC', title: 'RBC shape (2)', content: 'target cells', value: '' },
        { moType: 'RBC', title: 'RBC shape (2)', content: 'stomatocytes', value: '' },
        { moType: 'RBC', title: 'RBC shape (2)', content: 'burr cells', value: '' },
        { moType: 'RBC', title: 'RBC shape (2)', content: 'acanthocytes', value: '' },
        { moType: 'RBC', title: 'chromicity', content: 'Hypochromic', value: 'hypochromic' },
        { moType: 'RBC', title: 'chromicity', content: 'Hyperchromic', value: 'hyperchromic' },
        { moType: 'RBC', title: 'chromicity', content: 'Normochromic', value: '' },
        { moType: 'RBC', title: 'Poikilocytosis', content: '+', value: '' },
        { moType: 'RBC', title: 'Poikilocytosis', content: '-', value: '' },
        { moType: 'RBC', title: 'Rouleaux formation', content: '+', value: '' },
        { moType: 'RBC', title: 'Rouleaux formation', content: '-', value: '' },
        { moType: 'RBC', title: 'RBC shape (1)', content: 'None', value: '' },
        { moType: 'RBC', title: 'RBC shape (1)', content: 'tear drop cells', value: '' },
        { moType: 'RBC', title: 'RBC shape (1)', content: 'spherocytes', value: '' },
        { moType: 'RBC', title: 'RBC shape (1)', content: 'schistocytes', value: '' },
        { moType: 'RBC', title: 'RBC shape (1)', content: 'elliptocytes', value: '' },
        { moType: 'WBC', title: 'Number', content: 'normal', value: '' },
        { moType: 'WBC', title: 'Toxic granulation', content: '+', value: '' },
        { moType: 'WBC', title: 'Toxic granulation', content: '-', value: '' },
        { moType: 'WBC', title: 'Hypogranulation', content: '+', value: '' },
        { moType: 'WBC', title: 'Hypogranulation', content: '-', value: '' },
        { moType: 'WBC', title: 'Vacuolation', content: '+', value: '' },
        { moType: 'WBC', title: 'Vacuolation', content: '-', value: '' },
        { moType: 'WBC', title: 'Segmentation', content: 'none', value: '' },
        { moType: 'WBC', title: 'Segmentation', content: 'adequate', value: '' },
        { moType: 'WBC', title: 'Segmentation', content: 'hyposegmented', value: '' },
        { moType: 'WBC', title: 'Segmentation', content: 'hypersegmented', value: '' },
        { moType: 'WBC', title: 'Atypical lymphocytes', content: '+', value: '' },
        { moType: 'WBC', title: 'Atypical lymphocytes', content: '-', value: '' },
        { moType: 'WBC', title: 'Abnormal lymphocyte', content: '+', value: '' },
        { moType: 'WBC', title: 'Abnormal lymphocyte', content: '-', value: '' },
        { moType: 'WBC', title: 'blasts', content: 'None', value: '' },
        { moType: 'WBC', title: 'blasts', content: 'blasts', value: '' },
        { moType: 'PLT', title: 'Number', content: 'normal', value: '' },
        { moType: 'PLT', title: 'Giant platelet', content: '+', value: '' },
        { moType: 'PLT', title: 'Giant platelet', content: '-', value: '' },
        { moType: 'PLT', title: 'Other findings', content: 'None', value: '' },
        { moType: 'PLT', title: 'Other findings', content: 'hypogranular platelet', value: '' },
        { moType: 'PLT', title: 'Other findings', content: 'platelet clumping', value: '' },
        { moType: 'RBC', title: '', content: 'Erythrocytosis', value: 'erythrocytosis' },
        { moType: 'WBC', title: '', content: 'Neutrophillia', value: 'Neutrophillia' },
        { moType: 'WBC', title: '', content: 'Neutropenia', value: 'Neutropenia' },
        { moType: 'WBC', title: '', content: 'Lymphocytosis', value: 'Lymphocytosis' },
        { moType: 'WBC', title: '', content: 'Lymphocytopenia', value: 'Lymphocytopenia' },
        { moType: 'WBC', title: '', content: 'Monocytosis', value: 'Monocytosis' },
        { moType: 'WBC', title: '', content: 'Eosinophillia', value: 'Eosinophillia' },
        { moType: 'WBC', title: '', content: 'Basophillia', value: 'Basophillia' },
        { moType: 'WBC', title: 'Number', content: 'slightly decreased', value: 'Slightly decreased' },
        { moType: 'PLT', title: 'Number', content: 'slightly decreased', value: 'Slightly decreased' },
        { moType: 'WBC', title: 'Number', content: 'moderately decreased', value: 'Moderately decreased' },
        { moType: 'PLT', title: 'Number', content: 'moderately decreased', value: 'Moderately decreased' },
        { moType: 'WBC', title: 'Number', content: 'markedly decreased', value: 'Markedly decreased' },
        { moType: 'PLT', title: 'Number', content: 'markedly decreased', value: 'Markedly decreased' },
        { moType: 'WBC', title: 'Number', content: 'slightly increased', value: 'Slightly increased' },
        { moType: 'PLT', title: 'Number', content: 'slightly increased', value: 'Slightly increased' },
        { moType: 'WBC', title: 'Number', content: 'moderately increased', value: 'Moderately increased' },
        { moType: 'PLT', title: 'Number', content: 'moderately increased', value: 'Moderately increased' },
        { moType: 'WBC', title: 'Number', content: 'markedly increased', value: 'Markedly increased' },
        { moType: 'PLT', title: 'Number', content: 'markedly increased', value: 'Markedly increased' },
    ]

    return MAP_CBC_COMMENTS.find((item) => {
        if (item.moType === moType && item.title === title && item.content === val) return {
            title: item.title,
            content: item.value
        };
    })
}