import {ywmcCbcCheckApi, ywmcLisPostSendApi} from "@/common/api/service/lisSend/lisSend";
import {createCbcFile} from "@/common/api/service/fileSys/fileSysApi";

export const ywmcCbcDataLoad = async (barcodeNo: string, cbcCodeList: any) => {
    const req = `smp_no=${barcodeNo}`;
    const cbcData: any = (await ywmcCbcCheckApi(req)).data;
    const cbcWorkList: any = [];

    // 최신 날짜 찾기
    const latestDate = cbcData.data.reduce((latest: string, item: any) => {
        return item.exam_ymd_unit > latest ? item.exam_ymd_unit : latest;
    }, cbcData.data[0].exam_ymd_unit);

    // 최신 날짜에 해당하는 데이터만 필터링
    const latestCbcData = cbcData.data.filter((item: any) => item.exam_ymd_unit === latestDate);

    latestCbcData.forEach(function (data: any) {
        cbcCodeList.forEach(function (cbcCode: any) {
            if (cbcCode?.classCd === data?.exam_cd.trim()) {
                const obj = {
                    classNm: cbcCode.classCd,
                    count: data?.text_rslt + data?.numeric_rslt,
                    unit: data?.unit,
                    textVal: data?.text_rslt,
                    numVal: data?.numeric_rslt,
                    spc: data?.spc,
                    day: data?.exam_ymd_unit,
                    slip: data?.slip,
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
    return { data: cbcWorkList, cbcDataVal: cbcData };
}





export const lisSendYwmc = async (data: any) => {
    const res = await ywmcLisPostSendApi(data);
    if (res) {
        return 'Update successful';
    } else {
        return 'Lis Send Fail';
    }
}