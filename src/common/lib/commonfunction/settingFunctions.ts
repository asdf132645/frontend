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
    diffCellAnalyzingCount: projectType ? '500':'100',
    wbcPositionMargin: '0',
    rbcPositionMargin: '0',
    pltPositionMargin: '0',
    pbsCellAnalyzingCount: '100',
    stitchCount: '1',
    bfCellAnalyzingCount: '100',
    iaRootPath: projectType ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc',
    isNsNbIntegration: false,
    isAlarm: false,
    alarmCount: '5',
    keepPage: false,
    backupPath: '',
    backupStartDate: new Date(),
    backupEndDate: new Date(),
    userId: '', // 사용자 ID 기본값
};

export const firstCellImgSet = async () => {
    let cellImgData;

    const result = await getCellImgApi();
    if (result && result.data) {
        cellImgData = result.data;
    }

    if (!cellImgData) {
        saveHttpType.value = 'post';
    } else {
        saveHttpType.value = 'put';
    }

    const cellImgSet = {
        analysisType: defaultCellImgData.testTypeCd,
        diffCellAnalyzingCount: defaultCellImgData.diffCellAnalyzingCount,
        wbcPositionMargin: defaultCellImgData.wbcPositionMargin,
        rbcPositionMargin: defaultCellImgData.rbcPositionMargin,
        pltPositionMargin: defaultCellImgData.pltPositionMargin,
        pbsCellAnalyzingCount: defaultCellImgData.pbsCellAnalyzingCount,
        stitchCount: defaultCellImgData.stitchCount,
        bfCellAnalyzingCount: defaultCellImgData.bfCellAnalyzingCount,
        iaRootPath: defaultCellImgData.iaRootPath,
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
                sessionStorage.setItem('iaRootPath', String(defaultCellImgData?.iaRootPath));
                sessionStorage.setItem('keepPage', String(defaultCellImgData?.keepPage));
            }
        } catch (e) {
            console.log(e);
        }
    }

};



export const firstSaveOrderClass = async () => {
    const orderList: any = window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
    for (const index in orderList) {
        orderList[index].orderIdx = index;
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

export const firstSaveNormalRange = async () => {
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

export const firstCreateRbcDegreeData = async () => {
    await combindDegree();
    const rbcDegreeList: any = [];

    rbcClassListArr.value.forEach((category: any) => {
        category.classInfo.forEach((classItem: any) => {
            rbcDegreeList.push({
                categoryId: category.categoryId,
                categoryNm: category.categoryNm,
                classId: classItem.classId,
                classNm: classItem.classNm,
                degree1: classItem.degree1,
                degree2: classItem.degree2,
                degree3: classItem.degree3,
            });
        });
    });

    try {
        const result: any = await getRbcDegreeApi();
        if((result.data && result.data.length === 0) || !result.data){
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