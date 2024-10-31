import {ywmcCbcCheckApi, ywmcLisPostSendApi} from "@/common/api/service/lisSend/lisSend";
import {createCbcFile, getFolders} from "@/common/api/service/fileSys/fileSysApi";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import {readCustomH7Message, readFileEUCKR, readH7File} from "@/common/api/service/fileReader/fileReaderApi";
import axios from "axios";
import {getCbcPathData} from "@/common/lib/commonfunction/inhaCbcLis";

interface CBCDataItem {
    classNm: string;
    count: string;  // count는 숫자로 변환 필요
    unit: string;
}

interface WBCInfoAfter {
    id: string;
    name: string;
    count: string;  // count는 숫자로 변환 필요
    title: string;
    images: string[];
    percent: string; // percent도 숫자로 변환 필요
}

const cbcData: CBCDataItem[] = [
    {classNm: "WBC", count: "10.45", unit: ""},
    {classNm: "RBC", count: "4.5", unit: ""},
    {classNm: "Hb", count: "13.0", unit: ""},
    {classNm: "Hct", count: "38.0", unit: ""},
    {classNm: "MCV", count: "90.0", unit: ""},
    {classNm: "MCHC", count: "34.0", unit: ""},
    {classNm: "RDW", count: "12.0", unit: ""},
    {classNm: "PLT", count: "300", unit: ""},
];

const wbcInfoAfter: WBCInfoAfter[] = [
    {id: "01", name: "Neutrophil", count: "450", title: "NE", images: [], percent: "15.4"},
    {id: "02", name: "Metamyelocyte", count: "225", title: "ME", images: [], percent: "7.7"},
    {id: "03", name: "Myelocyte", count: "225", title: "MY", images: [], percent: "7.7"},
    {id: "04", name: "Promyelocyte", count: "225", title: "PR", images: [], percent: "7.7"},
    {id: "05", name: "Lymphocyte", count: "225", title: "LY", images: [], percent: "7.7"},
    {id: "07", name: "Monocyte", count: "225", title: "MO", images: [], percent: "7.7"},
    {id: "08", name: "Eosinophil", count: "225", title: "EO", images: [], percent: "7.7"},
    {id: "09", name: "Basophil", count: "225", title: "BA", images: [], percent: "7.7"},
];

export const ywmcCbcDataLoad = async (barcodeNo: string, cbcCodeList: any) => {
    const req = `smp_no=${barcodeNo}`
    const cbcData: any = (await ywmcCbcCheckApi(req)).data;
    const cbcWorkList: any = [];
    cbcData.forEach(function (data: any) {
        cbcCodeList.forEach(function (cbcCode: any) {
            if (cbcCode?.classCd === data?.exam_cd) {
                const obj = {
                    classNm: cbcCode.cd,
                    count: data?.rslt_stus,
                    unit: data?.unit,
                }
                cbcWorkList.push(obj)
            }
        });
    });
    const parms = {
        filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${barcodeNo}.txt`,
        data: cbcWorkList,
    };
    await createCbcFile(parms);
    return {data: cbcWorkList, cbcDataVal: cbcData};
}

export const lisSendSD = async (barcodeNo: string, nowCrcData: any, lisFilePathSetArr: string) => {
    const fileNm = await cbcFileNameExtract(barcodeNo);
    const path = await getCbcPathData();
    const readFileTxtRes: any = await readFileEUCKR(`path=${path}&filename=${fileNm}`);
    let patientId = '';
    let patientName = '';
    if (readFileTxtRes.data.success) {
        const msg: any = await readH7File(readFileTxtRes.data.data);
        msg?.data?.segments?.forEach((cbcSegment: any) => {
            if (cbcSegment.name.trim() === 'PID') {
                patientId = cbcSegment.fields[2].value[0][0].value[0]
                patientName = cbcSegment.fields[4].value[0][0].value[0]
            }
        })
    }
    const data = {
        sendingApp: 'PBIA',
        sendingFacility: 'PBIA',
        receivingApp: 'LIS',
        receivingFacility: 'LIS',
        dateTime: getDateTimeStr(),
        security: '',
        messageType: ['ADT', 'R02'],
        messageControlId: barcodeNo,
        processingId: 'P',
        hl7VersionId: '2.5',
        customData: nowCrcData,
        pidData: {patientId: patientId, patientName: patientName},
    };
    const res = await readCustomH7Message(data);
    if (res) {
        return await lisHttpSendSD(res, barcodeNo, lisFilePathSetArr);
    }
}

const lisHttpSendSD = async (resultStr: any, barcodeNo: string, lisFilePathSetArr: string) => {
    const body = {
        apiKey: 'M0ZGODgyREY4NzUxMkY4RTM0MERDRkMyRkQ1MDM3OEU=',
        interfaceId: '01',
        dataText: resultStr.data,
    };

    const res = await axios.post(`${lisFilePathSetArr}`, body, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        if(res?.data.code === 200){
            return 'Success';
        }else{
            return 'Lis Send Fail';
        }
}

export const lisSendYwmc = async (data: any) => {
    const res = await ywmcLisPostSendApi(data);
    if (res) {
        return 'Success';
    } else {
        return 'Lis Send Fail';
    }
}

export const cbcFileNameExtract = async (barcodeNo: string) => {
    const cbcFilePathSetArr = await getCbcPathData();

    const foldersPath = `folderPath=${cbcFilePathSetArr}`;
    const cbcDataArr = await getFolders(foldersPath);
    let filterCbcDataArr: any = [];
    if (Array.isArray(cbcDataArr)) {
        filterCbcDataArr = cbcDataArr.filter((item) => {
            return item.split('_')[0] === barcodeNo
        });
    }
    if (filterCbcDataArr.length === 0) {
        return;
    }
    const latestFile = filterCbcDataArr.reduce((latest: any, currentFile: any) => {
        const currentDate: any = parseDateString(currentFile);
        const latestDate: any = parseDateString(latest);
        return currentDate > latestDate ? currentFile : latest;
    });
    return `${latestFile.split('.')[0]}`;
}

export const parseDateString = (dateString: any) => {
    // 날짜 문자열에서 날짜 부분 추출 (예: 20241024)
    // 파일명에서 언더바 뒤에 오는 날짜 추출 (YYYY-MM-DD 또는 YYYYMMDD 형식)
    const dateMatch = dateString.match(/_(\d{4}-\d{2}-\d{2}|\d{8})/);
    if (!dateMatch) return null;

    let rawDate = dateMatch[1];  // 매칭된 날짜 문자열

    // YYYYMMDD 형식을 YYYY-MM-DD로 변환
    if (!rawDate.includes('-')) {
        rawDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
    }

    // 변환된 날짜를 Date 객체로 반환
    return new Date(rawDate);
}


export function isAdultNormalCBC(cbcData: CBCDataItem[], wbcInfoAfter: WBCInfoAfter[]): any {
    const results: string[] = [];

    // CBC 데이터 검사
    for (const item of cbcData) {
        const value = parseFloat(item.count);
        let normalRange: [number, number] | undefined;

        switch (item.classNm) {
            case 'WBC':
                normalRange = [4.0, 10.0];
                break;
            case 'RBC':
                normalRange = [3.7, 5.2];
                break;
            case 'Hb':
                normalRange = [11.0, 16.0];
                break;
            case 'Hct':
                normalRange = [32.0, 44.0];
                break;
            case 'MCV':
                normalRange = [80.0, 105.0];
                break;
            case 'MCHC':
                normalRange = [32.5, 36.0];
                break;
            case 'RDW':
                normalRange = [11.0, 15.0];
                break;
            case 'PLT':
                normalRange = [150, 450];
                break;
            default:
                continue;
        }

        if (normalRange && (value < normalRange[0] || value > normalRange[1])) {
            results.push(`${item.classNm} 값이 비정상입니다: ${value} (정상 범위: ${normalRange[0]} - ${normalRange[1]})`);
        }
    }

    // WBC 정보 검사
    for (const info of wbcInfoAfter) {
        const percent = parseFloat(info.percent);

        // 각 세포의 정상 범위를 정의
        let normalRange: [number, number] = [0, 10]; // 기본값 설정
        switch (info.name) {
            case 'Neutrophil':
                normalRange = [1.5, 8.5];
                break;
            case 'Lymphocyte':
                normalRange = [1.0, 4.5];
                break;
            case 'Monocyte':
                normalRange = [0, 1];
                break;
            case 'Eosinophil':
                normalRange = [0, 0.5];
                break;
            case 'Basophil':
                normalRange = [0, 0.2];
                break;
            default:
                continue;
        }

        if (percent < normalRange[0] || percent > normalRange[1]) {
            results.push(`${info.name}의 퍼센트가 비정상입니다: ${percent}% (정상 범위: ${normalRange[0]}% - ${normalRange[1]}%)`);
        }
    }

    return results;
}

export const cbcDataGet = async (barcodeNo: string, cbcCodeList: any) => {
    const fileNm = await cbcFileNameExtract(barcodeNo);
    const path = await getCbcPathData();
    const readFileTxtRes: any = await readFileEUCKR(`path=${path}&filename=${fileNm}`);
    const cbcData: any = [];
    if (readFileTxtRes.data.success) {
        const msg: any = await readH7File(readFileTxtRes.data.data);
        msg?.data?.segments?.forEach((cbcSegment: any) => {
            const classCd = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0];
            const count = cbcSegment?.fields?.[4]?.value?.[0]?.[0]?.value?.[0] || "0";
            const unit = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0].match(/%/g)?.[0] || "";
            const sanitizedClassCd = classCd ? classCd.replace(/[^\w\s]/gi, '') : '';

            if (cbcSegment.name.trim() === 'OBX') {
                const obj = {
                    classNm: sanitizedClassCd,
                    count: count,
                    unit: unit
                }
                cbcData.push(obj)
            }
        })
    }
    return cbcData;
}