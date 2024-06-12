import {reactive, ref} from 'vue';
import {
    getCellImgApi,
    createCellImgApi,
    createOrderClassApi,
    putOrderClassApi,
    getOrderClassApi,
    createNormalRangeApi,
    updateNormalRangeApi,
    getNormalRangeApi,
    createRbcDegreeApi, putRbcDegreeApi, getRbcDegreeApi
} from '@/common/api/service/setting/settingApi';
import {messages} from "@/common/defines/constFile/constantMessageText";
import process from "process";
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";
import {ApiResponse} from "@/common/api/httpClient";
import {defaultRbcDegree, normalRange, rbcClassList} from "@/common/defines/constFile/settings";

const saveHttpType = ref('');
const cellimgId = ref('');
const orderHttpType = ref('');
const normalItems = ref<any>(normalRange);
const rbcClassListArr = reactive<any>({value: []}); // reactive로 변경

const projectType = window.PROJECT_TYPE === 'bm';
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

export const firstCellImgSet = async (userId: string) => {
    let cellImgData;

    // `cellImgGet` 함수를 호출하여 `cellimgId` 및 `cellImgData` 값을 가져옵니다.
    const result = await getCellImgApi();
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



export const firstSaveOrderClass = async (userId: any) => {
    const orderList: any = window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
    for (const index in orderList) {
        orderList[index].userName = userId;
        orderList[index].orderText = index;
    }
    const result = await getOrderClassApi();
    if (result) {
        if (result?.data.length === 0) {
            orderHttpType.value = 'post';
        }else{
            orderHttpType.value = 'put';
        }
    }
    try {
        if (orderHttpType.value === 'post') {
            await createOrderClassApi(orderList);
        }
    } catch (e) {
        console.log(e);
    }
}

export const firstSaveNormalRange = async (userId: any) => {
    try {
        const result = await getNormalRangeApi();
        if (result) {
            if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
                await createNormalRangeApi({normalRangeItems: normalItems.value });
            }
        }

    } catch (e) {
        console.log(e);
    }
};

export const firstCreateRbcDegreeData = async (userId: any) => {
    await combindDegree();
    const rbcDegreeList: any = [];

    rbcClassListArr.value.forEach((category: any) => {
        category.classInfo.forEach((classItem: any) => {
            rbcDegreeList.push({
                category_id: category.categoryId,
                category_nm: category.categoryNm,
                class_id: classItem.classId,
                class_nm: classItem.classNm,
                degree1: classItem.degree1,
                degree2: classItem.degree2,
                degree3: classItem.degree3,
            });
        });
    });

    try {
        const result = await getRbcDegreeApi();
        if(!result.data){
            await createRbcDegreeApi(rbcDegreeList);
        }
    } catch (e) {
        console.error(e);
    }
};

const combindDegree = async () => {
    rbcClassListArr.value = rbcClassList.rbcClassList.map((category: any) => {
        return {
            ...category,
            classInfo: category.classInfo.map((classItem: any) => {
                const defaultDegree = defaultRbcDegree.find(
                    (defaultItem) =>
                        defaultItem.categoryId === category.categoryId &&
                        defaultItem.classId === classItem.classId
                );

                return {
                    ...classItem,
                    degree1: defaultDegree?.degree1 || 0,
                    degree2: defaultDegree?.degree2 || 0,
                    degree3: defaultDegree?.degree3 || 0,
                };
            }),
        };
    });
}