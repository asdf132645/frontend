import store from '@/store/index';
import {SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
// 다른 페이지에서 호출 시 명확하게 알 수 있게 변수 생성 시 뒤에 store 를 붙여주세요.
export const sysInfoStore = async (data: any): Promise<any> => {
    if (data?.resultCd === '00000') {
        const embeddedInfoData = {
            embeddedStatusJobCmd: '',
            userStop: data.isRecovery === 'Y',
            isRecoveryRun: data.isRecovery === 'N' && false,
            isPause: data.jobCmd === 'PAUSE',
            sysInfo: data,
            isInit: data ? data.isInit : undefined,
        };

        const deviceInfoData = {
            siteCd: data.siteCd,
            deviceSerialNm: data.deviceBarcode
        }

        await store.dispatch('commonModule/setCommonInfo', deviceInfoData);
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', embeddedInfoData);
        return null;
    }else {
        await store.dispatch('commonModule/setCommonInfo', {'appAlertOpen': true});
        return data?.resultMsg;
    }
};

export const runningInfoStore = async (data: any) => {
    // await store.dispatch('wbcClassificationModule/setWbcInfo', data.slotInfo);
    await store.dispatch('runningInfoModule/setRunningInfo', data);
}

// export const wbcInfoStore = async (data: any) => {
//     await store.dispatch('wbcClassificationModule/setWbcInfo', data.slotInfo);
// }

// export const rbcInfoStore = async (data: any) => {
//     await store.dispatch('rbcClassificationModule/setRbcInfo', data.slotInfo);
// }