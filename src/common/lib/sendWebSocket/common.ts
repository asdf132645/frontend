import {tcpReq} from '@/common/tcpRequest/tcpReq';
import {getCurrentInstance} from 'vue';
import {useStore} from "vuex";

const instance = getCurrentInstance();
const store = useStore();

// appHeader page
export const sendSettingInfoWebSocket = (isOilReset: string, oilCount: string, userId: string, isNsNbIntegration: string) => {
    const settings = tcpReq().embedStatus.settings;
    settings.reqUserId = userId;

    Object.assign(settings, {
        oilCount,
        isOilReset,
        // uiVersion: 'uimd-pb-comm_v3',
        isNsNbIntegration: isNsNbIntegration,
    });
    sendMessage(settings);
}

export const sendOilPrimeWebSocket = (userId: string) => {
    tcpReq().embedStatus.oilPrime.reqUserId = userId;
    sendMessage(tcpReq().embedStatus.oilPrime);
}


// 셋팅 page -> 디바이스 컨트롤 page
export const onGripperOpenWebSocket = (userId: string) => {
    tcpReq().embedStatus.gripperOpen.reqUserId = userId;
    sendMessage(tcpReq().embedStatus.gripperOpen);
}

export const onCameraResetWebSocket = (userId: string) => {
    tcpReq().embedStatus.cameraReset.reqUserId = userId;
    sendMessage(tcpReq().embedStatus.cameraReset);
}


const sendMessage = (payload: object) => {
    instance?.appContext.config.globalProperties.$socket.emit('message', {
        type: 'SEND_DATA',
        payload: payload
    });
    // store.dispatch('commonModule/setCommonInfo', {resFlag: false});
}

