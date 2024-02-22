import {getDateTimeStr} from "@/common/lib/utils/dateUtils";

export const tcpReq = {
    embedStatus: {
        start: {
            jobCmd: "START",
            reqUserId: '',
            testType: "",
            wbcCount: "",
            reqDttm: ""
        },
        startAction: {
            jobCmd: 'START',
            reqUserId: '',
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
            reqUserId: '',
            reqDttm: getDateTimeStr(),
        },
        restart: {
            jobCmd: 'RESTART',
            reqUserId: '',
            reqDttm: getDateTimeStr(),
            bfSelectFiles: []
        },
        stop: {
            jobCmd: 'STOP',
            reqUserId: '',
            reqDttm: getDateTimeStr(),
            isEmergency: 'N',
            isUserStop: 'Y'
        },
        end: {
            jobCmd: "END",
            reqUserId: '',
            testType: "",
            wbcCount: "",
            reqDttm: ""
        },
        runningInfo: {
            jobCmd: "RUNNING_INFO",
            reqUserId: '',
        },
        sysInfo: {
            jobCmd: 'SYSINFO',
            reqUserId: '',
            reqDttm: getDateTimeStr(),
        },
        pause: {
            jobCmd: 'PAUSE',
            reqUserId: '',
            reqDttm: getDateTimeStr(),
        },
        runIngComp: {
            jobCmd: 'RUNNING_COMP',
            reqUserId: '',
            reqDttm: getDateTimeStr(),
        },
        recovery: {
            jobCmd: 'RECOVERY',
            reqUserId: '',
            reqDttm: getDateTimeStr(),
        },
        settings: {
            jobCmd: 'SETTINGS',
            reqUserId: '',
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
            reqUserId: '',
            reqDttm: getDateTimeStr(),
        },
        gripperOpen: {
            jobCmd: 'GRIPPER_OPEN',
            reqUserId: '',
            reqDttm: getDateTimeStr(),
        },
        cameraReset: {
            jobCmd: 'CAMERA_RESET',
            reqUserId: '',
            reqDttm: getDateTimeStr(),
        }
    },
};



