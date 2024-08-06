import {getDateTimeStr} from "@/common/lib/utils/dateUtils";

export const tcpReq:any = () => {
    const reqDttm = getDateTimeStr(); // 현재 날짜와 시간을 가져오는 함수

    return {
        embedStatus: {
            start: {
                jobCmd: "START",
                reqUserId: '',
                testType: "",
                wbcCount: "",
                reqDttm: reqDttm
            },
            startAction: {
                jobCmd: 'START',
                reqUserId: '',
                testType: '01',
                wbcCount: '',
                stitchCount: '',
                runningMode: '00',
                positionMargin:  '0',
                wbcPositionMargin: '0',
                pltPositionMargin: '0',
                reqDttm: reqDttm,
            },
            init: {
                jobCmd: 'INIT',
                reqUserId: '',
                reqDttm: reqDttm,
            },
            restart: {
                jobCmd: 'RESTART',
                reqUserId: '',
                reqDttm: reqDttm,
                bfSelectFiles: []
            },
            stop: {
                jobCmd: 'STOP',
                reqUserId: '',
                reqDttm: reqDttm,
                isEmergency: 'N',
                isUserStop: 'Y'
            },
            end: {
                jobCmd: "END",
                reqUserId: '',
                testType: "",
                wbcCount: "",
                reqDttm: reqDttm
            },
            runningInfo: {
                jobCmd: "RUNNING_INFO",
                reqUserId: '',
                reqDttm: reqDttm
            },
            sysInfo: {
                jobCmd: 'SYSINFO',
                reqUserId: '',
                reqDttm: reqDttm,
            },
            pause: {
                jobCmd: 'PAUSE',
                reqUserId: '',
                reqDttm: reqDttm,
            },
            runIngComp: {
                jobCmd: 'RUNNING_COMP',
                reqUserId: '',
                reqDttm: reqDttm,
            },
            recovery: {
                jobCmd: 'RECOVERY',
                reqUserId: '',
                reqDttm: reqDttm,
            },
            settings: {
                jobCmd: 'SETTINGS',
                reqUserId: '',
                reqDttm: reqDttm,
                pbiaRootDir: 'D:/IA_Proc',
                oilCount: '',
                isOilReset: '',
                deviceType: '01',
                // uiVersion: 'web',
                isNsNbIntegration: '',
            },
            oilPrime: {
                jobCmd: 'OIL_PRIME',
                reqUserId: '',
                reqDttm: reqDttm,
            },
            gripperOpen: {
                jobCmd: 'GRIPPER_OPEN',
                reqUserId: '',
                reqDttm: reqDttm,
            },
            cameraReset: {
                jobCmd: 'CAMERA_RESET',
                reqUserId: '',
                reqDttm: reqDttm,
            },
            exit: {
                jobCmd: 'clientExit',
                reqUserId: '',
                reqDttm: reqDttm,
            },
            searchCardCount: {
                jobCmd: 'SEARCH_CARD_COUNT',
                reqUserId: '',
                reqDttm: reqDttm,
                testType: '',
            },
        },
    };
};
