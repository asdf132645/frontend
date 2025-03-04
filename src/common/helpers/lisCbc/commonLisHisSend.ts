import {getLisPathData, getLisWbcRbcData} from "@/common/helpers/lisCbc/inhaCbcLis";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import {createCrcCommonHL7MessageApi, readH7Message} from "@/common/api/service/fileReader/fileReaderApi";
import {createCbcFile} from "@/common/api/service/fileSys/fileSysApi";
import axios from "axios";

export const commonLisHisSend = async (barcodeNo: string, nowCrcData: any, patientNm: string, slideData: any, deviceSerialNm: string) => {
    const {lisCodeWbcArr, lisCodeRbcArr} = await getLisWbcRbcData();

    const {lisFilePathSetArr: lisFilePathSetArrVar} = await getLisPathData();
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
        selectedItem: { /* selectedItem 데이터 */},
        wbcInfo: slideData?.wbcInfoAfter,
        rbcInfo: slideData?.rbcInfoAfter,
        result: lisCodeWbcArr,
        rbcFfiltering: lisCodeRbcArr,
        customData: nowCrcData,
        pidData: {patientId: slideData?.barcodeNo, patientName: slideData.cbcPatientNm || 'No Name'},
    };
    const res = await createCrcCommonHL7MessageApi(data);
    if (lisFilePathSetArrVar.includes("http")) { // http 경우일 경우
        if (!res) return false;
        const body = {
            barcodeNo: barcodeNo,
            userId: slideData?.submitUserId,
            deviceBarcode: deviceSerialNm,
            resultMsg: res.data
        };

        const axiosSend = await axios.post(`${lisFilePathSetArrVar}`, body, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return axiosSend?.data.code === 200;
    } else { // 공유폴더일 경우
        if (!res) return false;

        const filePath = `${lisFilePathSetArrVar}\\${barcodeNo}.txt`;
        const parmsLisCopy = {filePath, data: res.data};

        // LIS 파일 생성
        const {data} = await createCbcFile(parmsLisCopy);
        return data.success;

    }

}