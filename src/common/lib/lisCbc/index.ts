import {ywmcCbcCheckApi, ywmcLisPostSendApi} from "@/common/api/service/lisSend/lisSend";
import {createCbcFile, getFolders} from "@/common/api/service/fileSys/fileSysApi";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import {readCustomH7Message, readFileEUCKR, readH7File} from "@/common/api/service/fileReader/fileReaderApi";
import axios from "axios";
import {getCbcPathData} from "@/common/lib/commonfunction/inhaCbcLis";

export const ywmcCbcDataLoad = async (barcodeNo: string, cbcCodeList: any) => {
    const req = `smp_no=${barcodeNo}`
    const cbcData: any = (await ywmcCbcCheckApi(req)).data;
    const cbcWorkList: any = [];
    cbcData.forEach(function (data: any) {
        cbcCodeList.forEach(function (cbcCode: any) {
            if (cbcCode?.CBC_CD === data?.exam_cd) {
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
    const readFileTxtRes: any = await readFileEUCKR(`path=${await getCbcPathData()}&filename=${await cbcFileNameExtract(barcodeNo)}`);
    let patientId = '';
    let patientName = '';
    if (readFileTxtRes.data.success) {
        const msg: any = await readH7File(readFileTxtRes.data.data);
        msg?.data?.segments?.forEach((cbcSegment: any) => {
            if (cbcSegment.name.trim() === 'PID') {
                patientId = cbcSegment.fields[1].value[0][0].value[0]
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
        dataText: resultStr,
    };

    await axios.post(`${lisFilePathSetArr}`, body, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return 'Success';
    }).catch(error => {
        return 'Lis Send Fail';
    });
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
    if (filterCbcDataArr.length === 0){
        return ;
    }
    const latestFile = filterCbcDataArr.reduce((latest: any, currentFile: any) => {
        const currentDate: any = parseDateString(currentFile);
        const latestDate: any = parseDateString(latest);
        return currentDate > latestDate ? currentFile : latest;
    });
    return`${latestFile.split('.')[0]}`;
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