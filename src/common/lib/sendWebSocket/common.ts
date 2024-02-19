import {tcpReq} from '@/common/tcpRequest/tcpReq';
import {getCurrentInstance} from 'vue';

const instance = getCurrentInstance();

export const sendSettingInfoWebSocket = (isOilReset: string, oilCount: string) => {
    const settings = tcpReq.embedStatus.settings;

    Object.assign(settings, {
        oilCount,
        isOilReset,
        uiVersion: 'uimd-pb-comm_v3',
        isNsNbIntegration: 'N', // 셋팅 페이지 개발 후 수정
    });

    instance?.appContext.config.globalProperties.$socket.emit('message', { type: 'SEND_DATA', payload: settings });
}

export const sendOilPrimeWebSocket = () => {
    instance?.appContext.config.globalProperties.$socket.emit('message', { type: 'SEND_DATA', payload: tcpReq.embedStatus.oilPrime });
}