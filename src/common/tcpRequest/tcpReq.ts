import {getCurrentDateTime} from "@/common/lib/utils/dateUtils";

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
            reqDttm: getCurrentDateTime(),
        },
        init:{
            jobCmd: 'INIT',
            reqUserId: 'admin',
            reqDttm: getCurrentDateTime(),
        },
        restart: {
            jobCmd: 'RESTART',
            reqUserId: 'admin',
            reqDttm: getCurrentDateTime(),
            bfSelectFiles: []
        },
        stop: {
            jobCmd: 'STOP',
            reqUserId: 'admin',
            reqDttm: getCurrentDateTime(),
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
            reqDttm: getCurrentDateTime(),
        },
    },
};