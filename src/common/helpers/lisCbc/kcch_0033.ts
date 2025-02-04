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
        await fileSysClean(fileSysCleanParams);
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

export const changeRemark = (crcArr: CRCArrType[], remarkList: any) => {
    const defaultRemark: any = [
        { moType: 'RBC', content: [] },
        { moType: 'WBC', content: [] },
        { moType: 'PLT', content: [] },
    ];

    const remarkContentArr = crcArr
        .map((crcItem) =>
            kcchCbcCommentAutoMatching({
                moType: crcItem?.morphologyType,
                title: crcItem?.crcTitle,
                val: crcItem?.val,
            })
        )
        .filter(Boolean);

    const updatedRemark = defaultRemark.map((remarkItem: any) => {
        const matchedContents = remarkContentArr
            .filter((remarkContentItem: any) => remarkContentItem.moType === remarkItem.moType)
            .map((remarkContentItem: any) => remarkContentItem.value);

        return {
            ...remarkItem,
            content: matchedContents,
        };
    });

    if (remarkList[0] && remarkList[0]?.remarkAllContent) {
        remarkList[0].remarkAllContent = '';
    }

    for (const remarkItem of updatedRemark) {
        if (remarkItem.content.length > 0) {
            if (remarkList[0]) {
                if (remarkList[0]?.remarkAllContent === '') {
                    remarkList[0].remarkAllContent = remarkList[0]?.remarkAllContent + `${remarkItem.moType}: ${remarkItem.content.join(', ')}`
                } else {
                    remarkList[0].remarkAllContent = remarkList[0]?.remarkAllContent + `\n\n${remarkItem.moType}: ${remarkItem.content.join(', ')}`
                }
            }
        }
    }
}

export const kcchCbcCommentAutoMatching = ({ moType, title, val }: { moType: string; title: string; val?: string }) => {
    const MAP_CBC_COMMENTS = [
        { moType: 'RBC', title: 'Size', content: 'Microcytic', value: 'Microcytic' },
        { moType: 'RBC', title: 'Size', content: 'Macrocytic', value: 'Macrocytic' },
        { moType: 'RBC', title: 'Anisocytosis', content: '유', value: 'anemia with anisocytosis' },
        { moType: 'RBC', title: 'chromicity', content: 'Hypochromic', value: 'hypochromic' },
        { moType: 'RBC', title: 'chromicity', content: 'Hyperchromic', value: 'hyperchromic' },
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
        if (item.moType === moType && item.title === title && item.content === val) return item.value;
    })
}