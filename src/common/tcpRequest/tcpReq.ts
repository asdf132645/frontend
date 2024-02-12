import {getDateTimeStr} from "@/common/lib/utils/dateUtils";

export const tcpReq = {
    embedStatus: {
        start: {
            jobCmd: "START",
            reqUserId: "admin",
            testType: "",
            wbcCount: "",
            reqDttm: ""
        },
        startAction: {
            jobCmd: 'START',
            reqUserId: 'admin',
            testType: '01',
            wbcCount: '',
            stitchCount: '',
            runningMode: 'this.settings.runningMode',
            positionMargin: 'this.settings.positionMargin',
            wbcPositionMargin: 'this.settings.wbcPositionMargin',
            pltPositionMargin: 'this.settings.pltPositionMargin',
            reqDttm: getDateTimeStr(),
        },
        init:{
            jobCmd: 'INIT',
            reqUserId: 'admin',
            reqDttm: getDateTimeStr(),
        },
        restart: {
            jobCmd: 'RESTART',
            reqUserId: 'admin',
            reqDttm: getDateTimeStr(),
            bfSelectFiles: []
        },
        stop: {
            jobCmd: 'STOP',
            reqUserId: 'admin',
            reqDttm: getDateTimeStr(),
            isEmergency: 'N',
            isUserStop: 'Y'
        },
        end: {
            jobCmd: "END",
            reqUserId: "admin",
            testType: "",
            wbcCount: "",
            reqDttm: ""
        },
        runningInfo: {
            jobCmd: "RUNNING_INFO",
            reqUserId: "admin"
        },
        sysInfo:{
            jobCmd: 'SYSINFO',
            reqUserId: 'admin',
            reqDttm: getDateTimeStr(),
        },
        pause : {
            jobCmd: 'PAUSE',
            reqUserId: 'admin',
            reqDttm: getDateTimeStr(),
        },
        runIngComp: {
            jobCmd: 'RUNNING_COMP',
            reqUserId: 'admin',
            reqDttm: getDateTimeStr(),
        },
        recovery: {
            jobCmd: 'RECOVERY',
            reqUserId: 'admin',
            reqDttm: getDateTimeStr(),
        }

    },
};