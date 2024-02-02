import store from '@/store/index';
export const sysInfo = async (data: any) => {
    const embeddedInfoData = {
        embeddedStatusJobCmd: '',
        userStop: data.isRecovery === 'Y',
        isRecoveryRun: data.isRecovery === 'N' && false,
        isPause: data.jobCmd === 'PAUSE',
        sysInfo: data,
        isInit: data ? data.isInit : undefined,
    };

    await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', embeddedInfoData);
    await store.dispatch('processInfoModule/setSingleProcessInfo', { key: 'oilCount', value: data.oilCount });

};

export const runningInfo = async (data: any) => {
    console.log('setRunningInfo',data);
    await store.dispatch('runningInfoModule/setRunningInfo',data);
    await store.dispatch('processInfoModule/setSingleProcessInfo', { key: 'cassetteNo', value: data.cassetNo });
    await store.dispatch('processInfoModule/setSingleProcessInfo', { key: 'barcodeId', value: data.barcodeNo });
    await store.dispatch('processInfoModule/setSingleProcessInfo', { key: 'patientId', value: data.patientId });
    await store.dispatch('processInfoModule/setSingleProcessInfo', { key: 'patientName', value: data.patientNm });
    await store.dispatch('processInfoModule/setSingleProcessInfo', { key: 'wbcCount', value: data.maxWbcCount });
    await store.dispatch('processInfoModule/setSingleProcessInfo', { key: 'orderDate', value: data.orderDttm });
}