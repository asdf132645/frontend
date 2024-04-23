import {ref} from 'vue';
import {getCellImgApi, createCellImgApi} from '@/common/api/service/setting/settingApi';

const saveHttpType = ref('');
const cellimgId = ref('');

const projectType = process.env.PROJECT_TYPE === 'bm';
const defaultCellImgData = {
    testTypeCd: projectType ? '02' : '01',
    pbAnalysisType: projectType ? '500':'100',
    wbcPositionMargin: '0',
    rbcPositionMargin: '0',
    pltPositionMargin: '0',
    pbAnalysisType2: '100',
    stitchCount: '1',
    bfAnalysisType: '100',
    pbiaRootPath: projectType ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc',
    isNsNbIntegration: false,
    isAlarm: false,
    alarmCount: '5',
    keepPage: false,
    backupPath: '',
    backupStartDate: new Date(),
    backupEndDate: new Date(),
    userId: '', // 사용자 ID 기본값
};

export const cellImgSet = async (userId: string) => {
    let cellImgData;

    // `cellImgGet` 함수를 호출하여 `cellimgId` 및 `cellImgData` 값을 가져옵니다.
    const result = await getCellImgApi(userId);
    if (result && result.data) {
        cellimgId.value = String(userId);
        cellImgData = result.data;
    }

    if (!cellImgData) {
        saveHttpType.value = 'post';
    } else {
        saveHttpType.value = 'put';
    }

    const cellImgSet = {
        analysisType: defaultCellImgData.testTypeCd,
        cellAnalyzingCount: defaultCellImgData.pbAnalysisType,
        wbcPositionMargin: defaultCellImgData.wbcPositionMargin,
        rbcPositionMargin: defaultCellImgData.rbcPositionMargin,
        pltPositionMargin: defaultCellImgData.pltPositionMargin,
        pbAnalysisType2: defaultCellImgData.pbAnalysisType2,
        stitchCount: defaultCellImgData.stitchCount,
        bfAnalysisType: defaultCellImgData.bfAnalysisType,
        pbiaRootPath: defaultCellImgData.pbiaRootPath,
        isNsNbIntegration: defaultCellImgData.isNsNbIntegration,
        isAlarm: defaultCellImgData.isAlarm,
        alarmCount: defaultCellImgData.alarmCount,
        keepPage: defaultCellImgData.keepPage,
        backupPath: defaultCellImgData.backupPath,
        backupStartDate: defaultCellImgData.backupStartDate.toISOString().split('T')[0],
        backupEndDate: defaultCellImgData.backupEndDate.toISOString().split('T')[0],
        userId: userId,
    };
    if (saveHttpType.value === 'post') {
        try {
            const result = await createCellImgApi(cellImgSet);
            if (result) {
                sessionStorage.setItem('isNsNbIntegration', defaultCellImgData?.isNsNbIntegration ? 'Y' : 'N');
                sessionStorage.setItem('wbcPositionMargin', String(defaultCellImgData?.wbcPositionMargin));
                sessionStorage.setItem('rbcPositionMargin', String(defaultCellImgData?.rbcPositionMargin));
                sessionStorage.setItem('pltPositionMargin', String(defaultCellImgData?.pltPositionMargin));
                sessionStorage.setItem('pbiaRootPath', String(defaultCellImgData?.pbiaRootPath));
                sessionStorage.setItem('keepPage', String(defaultCellImgData?.keepPage));
            }
        } catch (e) {
            console.log(e);
        }
    }

};

