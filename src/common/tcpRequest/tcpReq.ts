import {getCurrentDateTime} from "@/common/lib/utils/dateUtils";

export const tcpReq = {
    embedStatus: { // execute.vue 에서주로 사용 테스트페이지에서 사용하는 객체
        start: {
            "jobCmd": "START",
            "reqUserId": "",
            "testType": "",
            "wbcCount": "",
            "reqDttm": ""
        },
        startAction: {
            jobCmd: 'START',
            reqUserId: '',
            testType: '',
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
            reqUserId: 'this.currentUser.userId',
            reqDttm: getCurrentDateTime(),
        },
        restart: {
            jobCmd: 'RESTART',
            reqUserId: 'this.currentUser.userId',
            reqDttm: getCurrentDateTime(),
            bfSelectFiles: []
        },
        stop: {
            jobCmd: 'STOP',
            reqUserId: 'self.currentUser.userId',
            reqDttm: getCurrentDateTime(),
            isEmergency: 'N',
            isUserStop: 'Y'
        },
        end: {
            "jobCmd": "END",
            "reqUserId": "",
            "testType": "",
            "wbcCount": "",
            "reqDttm": ""
        },
    },
};