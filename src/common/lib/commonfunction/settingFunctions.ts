import { ref } from 'vue';
import { getDrivesApi, getCellImgApi, createCellImgApi, putCellImgApi } from '@/common/api/service/setting/settingApi';
import {useStore} from "vuex";

// 전역적으로 사용할 수 있도록 하기 위해 ref로 상태를 관리
const saveHttpType = ref('');
const cellimgId = ref('');

// Vuex 스토어
const store = useStore();

// 기본값을 정의하기 위한 상수
const defaultCellImgData = {
    testTypeCd: '01',
    pbAnalysisType: '100',
    wbcPositionMargin: '0',
    rbcPositionMargin: '0',
    pltPositionMargin: '0',
    pbAnalysisType2: '100',
    stitchCount: '1',
    bfAnalysisType: '100',
    pbiaRootPath: process.env.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc',
    isNsNbIntegration: false,
    isAlarm: false,
    alarmCount: '5',
    keepPage: false,
    backupPath: '',
    backupStartDate: new Date(),
    backupEndDate: new Date(),
    userId: '', // 사용자 ID 기본값
};

// `cellImgSet` 함수
// `cellImgSet` 함수
// `cellImgSet` 함수
export const cellImgSet = async (userId: string) => {
    let cellImgData;

    // `cellImgGet` 함수를 호출하여 `cellimgId` 및 `cellImgData` 값을 가져옵니다.
    const result = await getCellImgApi(userId);
    if (result && result.data) {
        cellimgId.value = String(userId);
        cellImgData = result.data; // `cellImgGet`에서 가져온 데이터를 `cellImgData`에 할당합니다.
    }

    // `cellImgData`가 없을 경우 기본값을 사용합니다.
    if (!cellImgData) {
        cellImgData = defaultCellImgData;
        saveHttpType.value = 'post';
    }else{
        saveHttpType.value = 'put';
    }


    // `cellImgSet` 데이터를 만듭니다.
    // `cellImgData`가 `defaultCellImgData`인지 `CellImgAnalyzedResponse`인지 확인하고 적절하게 접근합니다.
    const cellImgSet = {
        analysisType: 'testTypeCd' in cellImgData ? cellImgData.testTypeCd : defaultCellImgData.testTypeCd,
        cellAnalyzingCount: 'pbAnalysisType' in cellImgData ? cellImgData.pbAnalysisType : defaultCellImgData.pbAnalysisType,
        wbcPositionMargin: 'wbcPositionMargin' in cellImgData ? cellImgData.wbcPositionMargin : defaultCellImgData.wbcPositionMargin,
        rbcPositionMargin: 'rbcPositionMargin' in cellImgData ? cellImgData.rbcPositionMargin : defaultCellImgData.rbcPositionMargin,
        pltPositionMargin: 'pltPositionMargin' in cellImgData ? cellImgData.pltPositionMargin : defaultCellImgData.pltPositionMargin,
        pbAnalysisType2: 'pbAnalysisType2' in cellImgData ? cellImgData.pbAnalysisType2 : defaultCellImgData.pbAnalysisType2,
        stitchCount: 'stitchCount' in cellImgData ? cellImgData.stitchCount : defaultCellImgData.stitchCount,
        bfAnalysisType: 'bfAnalysisType' in cellImgData ? cellImgData.bfAnalysisType : defaultCellImgData.bfAnalysisType,
        pbiaRootPath: 'pbiaRootPath' in cellImgData ? cellImgData.pbiaRootPath : defaultCellImgData.pbiaRootPath,
        isNsNbIntegration: 'isNsNbIntegration' in cellImgData ? cellImgData.isNsNbIntegration : defaultCellImgData.isNsNbIntegration,
        isAlarm: 'isAlarm' in cellImgData ? cellImgData.isAlarm : defaultCellImgData.isAlarm,
        alarmCount: 'alarmCount' in cellImgData ? cellImgData.alarmCount : defaultCellImgData.alarmCount,
        keepPage: 'keepPage' in cellImgData ? cellImgData.keepPage : defaultCellImgData.keepPage,
        backupPath: 'backupPath' in cellImgData ? cellImgData.backupPath : defaultCellImgData.backupPath,
        backupStartDate: 'backupStartDate' in cellImgData ? cellImgData.backupStartDate.toISOString().split('T')[0] : defaultCellImgData.backupStartDate.toISOString().split('T')[0],
        backupEndDate: 'backupEndDate' in cellImgData ? cellImgData.backupEndDate.toISOString().split('T')[0] : defaultCellImgData.backupEndDate.toISOString().split('T')[0],
        userId: userId,
    };

    // API 호출을 통한 데이터를 저장하거나 업데이트합니다.
    try {
        let result;
        if (saveHttpType.value === 'post') {
            result = await createCellImgApi(cellImgSet);
        } else {
            result = await putCellImgApi(cellImgSet, userId);
        }

        if (result) {
            const data = result?.data;
            // 세션 스토리지 업데이트
            sessionStorage.setItem('isNsNbIntegration', data?.isNsNbIntegration ? 'Y' : 'N');
            sessionStorage.setItem('wbcPositionMargin', String(data?.wbcPositionMargin));
            sessionStorage.setItem('rbcPositionMargin', String(data?.rbcPositionMargin));
            sessionStorage.setItem('pltPositionMargin', String(data?.pltPositionMargin));
            sessionStorage.setItem('pbiaRootPath', String(data?.pbiaRootPath));
            sessionStorage.setItem('keepPage', String(data?.keepPage));
        }
    } catch (e) {
        console.log(e);
    }
};

