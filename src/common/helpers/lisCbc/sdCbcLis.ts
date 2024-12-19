import {getCbcPathData} from "@/common/helpers/lisCbc/inhaCbcLis";
import {readCustomH7Message, readFileEUCKR, readH7File} from "@/common/api/service/fileReader/fileReaderApi";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import axios from "axios";
import {cbcFileNameExtract} from "@/common/helpers/lisCbc/index";

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
    if (res?.data.code === 200) {
        return 'Success';
    } else {
        return 'Lis Send Fail';
    }
}


export const sdWorklistsAPI = async (date: any) => {
    const body = {
        apiKey: 'M0ZGODgyREY4NzUxMkY4RTM0MERDRkMyRkQ1MDM3OEU=',
        interfaceId: '01',
        workDate: date,
    };

    const res = await axios.post(`http://121.169.55.132:8081/api/interface/worklists`, body, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (res?.data.code === 200) {
        return {data: res?.data, code: res?.data.code};
    } else {
        return {data: null, code: res?.data.code};
    }
}

export const sdPatientNameGetAPI = async (reqNoList: string[], workDateStart: string, workDateEnd: string) => {
    const body = {
        apiKey: 'M0ZGODgyREY4NzUxMkY4RTM0MERDRkMyRkQ1MDM3OEU=',
        interfaceId: '01',
        reqNoList: reqNoList ?? [],
        workDateStart: workDateStart,
        workDateEnd: workDateEnd,
    }

    const res = await axios.post(`http://121.169.55.132:8081/api/interface/patnames`, body, {
        headers: { 'Content-Type': 'application/json' }
    })
    if (res?.data.code === 200) return { data: res?.data, code: res?.data.code };
    return { data: null, code: res?.data.code };
}