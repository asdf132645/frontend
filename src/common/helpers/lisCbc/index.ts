import {getFolders} from "@/common/api/service/fileSys/fileSysApi";
import {readFileEUCKR, readH7File} from "@/common/api/service/fileReader/fileReaderApi";
import {getCbcPathData} from "@/common/helpers/lisCbc/inhaCbcLis";
import {sdCbcAutoMatiching} from "@/common/defines/constants/autoResultCodeMatching";

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

    if (!rawDate.includes('-')) {
        rawDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
    }

    return new Date(rawDate);
}

export function isAutoCBCMatching(cbcData: CBCDataItem[], cbcSex: string, cbcAge: string): any {
    console.log(JSON.stringify(cbcData))

    const res = sdCbcAutoMatiching(cbcData, cbcSex, cbcAge);
    console.log(res)
    return res
}

export function isAdultNormalCBC(cbcData: CBCDataItem[], wbcInfoAfter: WBCInfoAfter[], rbcInfoAfter: any, cbcSex: string, cbcAge: string): any {
    // console.log(cbcData)
    const newRbcArr = [];
    for (const result of rbcInfoAfter) {
        newRbcArr.push(...result.classInfo);
    }

    const results: object[] = [];
    const rbcNormalRanges: { [key: string]: [number, number] } = {
        'Spherocyte': [0, 5.0],
        'Ovalocyte': [0, 5.0],
        'TearDropCell': [0, 5.0],
        'Acanthocyte': [0, 5.0],
        'Target Cell': [0, 5.0],
        'Schistocyte': [0, 1],
        'Howell-Jolly Body': [0, 2],
    };

    for (const item of newRbcArr) {
        const value = parseFloat(item.percent);
        const normalRange = rbcNormalRanges[item.classNm];

        if (normalRange && (value < normalRange[0] || value > normalRange[1])) {
            results.push({
                classNm: item.classNm,
                value: value,
                normalRangeFirst: normalRange[0],
                normalRangeLast: normalRange[1]
            })
        }
    }

    // CBC 데이터 검사
    const cbcNormalRanges: { [key: string]: [number, number] } = {
        'WBC': [4.0, 10.0],
        'RBC': [3.7, 5.2], // Female
        'HGB': [11.0, 16.0], // Female
        'HCT': [32.0, 44.0], // Female
        'MCV': [80.0, 105.0],
        'MCHC': [32.5, 36.0],
        'RDWCV': [0, 15.0], // Female
        'PLT': [150, 450], // Female
        'RET': [0, 5],
    };

    if (cbcSex === 'M') {
        cbcNormalRanges['RBC'] = [4.0, 5.8];
        cbcNormalRanges['HGB'] = [12.5, 16.5];
        cbcNormalRanges['HCT'] = [40.0, 52.0];
    }
    for (const item of cbcData) {
        const value = parseFloat(item.count);
        const normalRange = cbcNormalRanges[item.classNm];

        if (normalRange && (value < normalRange[0] || value > normalRange[1])) {
            // results.push(`${item.classNm} 값이 비정상입니다: ${value} (정상 범위: ${normalRange[0]} - ${normalRange[1]})`);
            results.push({
                classNm: item.classNm,
                value: value,
                normalRangeFirst: normalRange[0],
                normalRangeLast: normalRange[1]
            })
        }
    }


    // WBC 정보 검사
    const wbcNormalRanges: { [key: string]: [number, number] } = {
        'NB': [0, 6],
        'LR': [0, 10],
    };

    for (const info of wbcInfoAfter) {
        const percent = parseFloat(info.percent);
        const normalRange = wbcNormalRanges[info.title] || [0, 10]; // 기본값 설정

        if (percent < normalRange[0] || percent > normalRange[1]) {
            // results.push(`${info.title} 값이 비정상입니다: ${percent} (정상 범위: ${normalRange[0]} - ${normalRange[1]})`);
            results.push({
                classNm: info.title,
                value: percent,
                normalRangeFirst: normalRange[0],
                normalRangeLast: normalRange[1]
            });
        }
    }


    return results;
}

export const cbcDataGet = async (barcodeNo: string, cbcCodeList: any) => {
    const fileNm = await cbcFileNameExtract(barcodeNo);
    const path = await getCbcPathData();
    const readFileTxtRes: any = await readFileEUCKR(`path=${path}&filename=${fileNm}`);
    const cbcData: any = [];
    let cbcSex = ''
    let cbcAge = '';
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
            } else if (cbcSegment.name.trim() === 'PID') {
                cbcSex = cbcSegment?.fields[6].value[0][0].value[0]
                cbcAge = cbcSegment?.fields[7].value[0][0].value[0];
            }
        })
    }
    return {cbcData: cbcData, cbcSex: cbcSex, cbcAge: cbcAge};
}