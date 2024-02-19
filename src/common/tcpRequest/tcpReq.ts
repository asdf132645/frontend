import {getDateTimeStr, getStoredUser, reqUserId} from "@/common/lib/utils/dateUtils";
import {ref, watch, watchEffect} from 'vue';

console.log(reqUserId())
export const tcpReq = {
    embedStatus: {
        start: {
            jobCmd: "START",
            reqUserId: reqUserId() || '',
            testType: "",
            wbcCount: "",
            reqDttm: ""
        },
        startAction: {
            jobCmd: 'START',
            reqUserId: reqUserId() || '',
            testType: '01',
            wbcCount: '',
            stitchCount: '',
            runningMode: 'this.settings.runningMode',
            positionMargin: 'this.settings.positionMargin',
            wbcPositionMargin: 'this.settings.wbcPositionMargin',
            pltPositionMargin: 'this.settings.pltPositionMargin',
            reqDttm: getDateTimeStr(),
        },
        init: {
            jobCmd: 'INIT',
            reqUserId: reqUserId() || '',
            reqDttm: getDateTimeStr(),
        },
        restart: {
            jobCmd: 'RESTART',
            reqUserId: reqUserId() || '',
            reqDttm: getDateTimeStr(),
            bfSelectFiles: []
        },
        stop: {
            jobCmd: 'STOP',
            reqUserId: reqUserId() || '',
            reqDttm: getDateTimeStr(),
            isEmergency: 'N',
            isUserStop: 'Y'
        },
        end: {
            jobCmd: "END",
            reqUserId: reqUserId() || '',
            testType: "",
            wbcCount: "",
            reqDttm: ""
        },
        runningInfo: {
            jobCmd: "RUNNING_INFO",
            reqUserId: reqUserId() || '',
        },
        sysInfo: {
            jobCmd: 'SYSINFO',
            reqUserId: reqUserId() || '',
            reqDttm: getDateTimeStr(),
        },
        pause: {
            jobCmd: 'PAUSE',
            reqUserId: reqUserId() || '',
            reqDttm: getDateTimeStr(),
        },
        runIngComp: {
            jobCmd: 'RUNNING_COMP',
            reqUserId: reqUserId() || '',
            reqDttm: getDateTimeStr(),
        },
        recovery: {
            jobCmd: 'RECOVERY',
            reqUserId: reqUserId() || '',
            reqDttm: getDateTimeStr(),
        },
        settings: {
            jobCmd: 'SETTINGS',
            reqUserId: reqUserId() || '',
            reqDttm: getDateTimeStr(),
            pbiaRootDir: 'D:/IA_Proc',
            oilCount: '',
            isOilReset: '',
            deviceType: '01',
            uiVersion: '',
            isNsNbIntegration: '',
        },
        oilPrime: {
            jobCmd: 'OIL_PRIME',
            reqUserId: reqUserId() || '',
            reqDttm: getDateTimeStr(),
        }
    },
};
const storedUser = ref(reqUserId());

watch(() => {
    return getStoredUser();
}, (newUser) => {
    storedUser.value = newUser;
    console.log(newUser);
    // 추가적인 동작을 여기에 추가
}, { deep: true });








