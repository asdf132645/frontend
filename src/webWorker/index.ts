
// 웹 워커에서 실행할 함수
import {tcpReq} from "@/common/tcpRequest/tcpReq";

async function runningInfoCheckStore(data: any, slotIndex: any) {
    const regex = /[1,2,9]/g;
    const result: any = {
        running: false,
        savedData: null,
        updatedState: null,
        slideProceeding: null,
        iCasStatArrTwoLastIndexOf: '',
        iCasStatArrThreeLastIndexOf: '',
        slotId: '',
        lastCompleteIndex: '',
        changeSavedData: null,
        changeData: false,
        slideProceedingBool: false,
        slideBooleanTrue: false
    };
    result.updatedState = '';
    if (String(data?.iCasStat) !== '999999999999') {
        const dataICasStat = String(data?.iCasStat);
        const currentSlot = data?.slotInfo;
        const str: any = data?.iCasStat;
        const iCasStatArr: any = [...str];
        const lastCompleteIndex = iCasStatArr.lastIndexOf("3") === -1 ? 0 : iCasStatArr.lastIndexOf("3") + 1;

        if (iCasStatArr.lastIndexOf("2") === 0) {
            result.slideBooleanTrue = true;
            result.running = true;
        }else{
            result.slideBooleanTrue = false;
        }

        if (iCasStatArr.lastIndexOf("2") !== -1) {
            result.changeData = true;
            result.savedData = data;
            result.iCasStatArrTwoLastIndexOf = iCasStatArr.lastIndexOf("2");
        }else{
            result.changeData = false;
        }

        if (data?.iCasStat.indexOf("2") !== -1) {
            result.slideProceedingBool = true;
            result.slideProceeding = data?.iCasStat.indexOf("2");
        }else{
            result.slideProceedingBool = false;
        }

        if ((dataICasStat.search(regex) < 0) || data?.oCasStat === '111111111111') {
            result.updatedState = 'runningInfoStop';
            result.savedData = data;
            return result;
        }

        if (currentSlot?.isLowPowerScan === 'Y' && currentSlot?.testType === '03') {
            result.updatedState = 'pause';
            return result;
        } else {
            if(lastCompleteIndex !== slotIndex){
                result.updatedState = 'changeSlideSave';
                result.changeSavedData = data;
                result.iCasStatArrTwoLastIndexOf = iCasStatArr.lastIndexOf("2");
                result.iCasStatArrThreeLastIndexOf = iCasStatArr.lastIndexOf("3");
                result.slotId = currentSlot?.slotId;
                result.lastCompleteIndex = lastCompleteIndex;
                return result;
            }
        }
    }

    return result;
}

// 웹 워커에서 받은 데이터를 처리하고 메인 스레드로 결과를 보냄
self.onmessage = async function(event: any) {
    const data = event.data.parseDataWarp;
    const slotIndex = event.data.slotIndex;
    const result = await runningInfoCheckStore(data, slotIndex);
    self.postMessage(result);
};