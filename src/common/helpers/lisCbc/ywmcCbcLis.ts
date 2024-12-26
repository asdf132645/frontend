import {ywmcCbcCheckApi, ywmcLisPostSendApi} from "@/common/api/service/lisSend/lisSend";
import {createCbcFile} from "@/common/api/service/fileSys/fileSysApi";
import axios from "axios";

export const ywmcCbcDataLoad = async (barcodeNo: string, cbcCodeList: any) => {
    const url = ` http://128.9.1.11/spo/CpSVL?target_command=ihes.spo.cp.cmd.RetrieveUimdURLCMD&smp_no=${barcodeNo}`;
    // const url = ` http://128.9.2.30/spo/CpSVL?target_command=ihes.spo.cp.cmd.RetrieveUimdURLCMD&smp_no=000032237250`;
    const cbcData:any = await axios.get(url);
    // const cbcData: any = (await ywmcCbcCheckApi(req)).data;
    const cbcWorkList: any = [];
    console.log(cbcData);
    // 최신 날짜 찾기
    const latestDate = cbcData.reduce((latest: string, item: any) => {
        return item.exam_ymd_unit > latest ? item.exam_ymd_unit : latest;
    }, cbcData.exam_ymd_unit);

    // 최신 날짜에 해당하는 데이터만 필터링
    const latestCbcData = cbcData.filter((item: any) => item.exam_ymd_unit === latestDate);
    const slip = cbcData.find((el: any) => {return el.slip.trim() === 'H3'}) === undefined ? 'H1' : 'H3';
    latestCbcData.forEach(function (data: any) {
        cbcCodeList.forEach(function (cbcCode: any) {
            if (cbcCode?.classCd === data?.exam_cd.trim()) {
                const obj = {
                    classNm: cbcCode.fullNm,
                    count: data?.text_rslt + data?.numeric_rslt,
                    unit: data?.unit,
                    textVal: data?.text_rslt,
                    numVal: data?.numeric_rslt,
                    spc: data?.spc,
                    day: data?.exam_ymd_unit,
                };
                cbcWorkList.push(obj);
            }
        });
    });

    const parms = {
        filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${barcodeNo}.txt`,
        data: cbcWorkList,
    };
    await createCbcFile(parms);
    return { data: cbcWorkList, cbcDataVal: cbcData , slip: slip};
}





export const lisSendYwmc = async (data: any) => {
    const res = await ywmcLisPostSendApi(data);
    if (res) {
        return 'Update successful';
    } else {
        return 'Lis Send Fail';
    }
}