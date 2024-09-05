import {reactive, ref} from 'vue';
import {
    getCellImgApi,
    createCellImgApi,
    createOrderClassApi,
    getOrderClassApi,
    createNormalRangeApi,
    getNormalRangeApi,
    createRbcDegreeApi,
    getRbcDegreeApi,
    getCbcCodeRbcApi,
    createCbcCodeRbcApi,
    createLisCodeWbcApi,
    createLisCodeRbcApi,
    getLisCodeWbcApi, getLisCodeRbcApi
} from '@/common/api/service/setting/settingApi';
import { defaultBmClassList, defaultWbcClassList } from "@/store/modules/analysis/wbcclassification";
import { defaultCbcList, defaultRbcDegree, lisCodeRbcOption, lisCodeWbcOption, normalRange, rbcClassList } from "@/common/defines/constFile/settings";

const rbcClassListArr = reactive<any>({value: []}); // reactive로 변경

const projectType = window.PROJECT_TYPE === 'bm';
const defaultCellImgData = {
    testTypeCd: projectType ? '02' : '01',
    diffCellAnalyzingCount: projectType ? '500':'100',
    diffWbcPositionMargin: '0',
    diffRbcPositionMargin: '0',
    diffPltPositionMargin: '0',
    pbsCellAnalyzingCount: '100',
    stitchCount: '1',
    edgeShotType: '0',
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


/**
 * API 요청 시 분류할 Constant
 * sendingForm: Create 요청 시 사용할 key 값
 * defaultItem: Create 요청 시 보내는 body
 * getRequest: get 요청 함수
 * createRequest: create 요청 함수
 * */
const settingsConstant = ref<any>({
    'lisCodeWbc': {
        'sendingForm': 'lisCodeItems',
        'defaultItem': lisCodeWbcOption,
        'getRequest': getLisCodeWbcApi,
        'createRequest': createLisCodeWbcApi,
    },
    'lisCodeRbc': {
        'sendingForm': 'lisCodeItems',
        'defaultItem': lisCodeRbcOption,
        'getRequest': getLisCodeRbcApi,
        'createRequest': createLisCodeRbcApi,
    },
    'cbcCode': {
        'sendingForm': 'cbcCodeItems',
        'defaultItem': defaultCbcList,
        'getRequest': getCbcCodeRbcApi,
        'createRequest': createCbcCodeRbcApi,
    },
    'cellImage': {
        'getRequest': getCellImgApi,
        'createRequest': createCellImgApi,
    },
    'normalRange': {
        'sendingForm': 'normalRangeItems',
        'defaultItem': normalRange,
        'getRequest': getNormalRangeApi,
        'createRequest': createNormalRangeApi,
    },
    'orderClass': {
        'getRequest': getOrderClassApi,
        'createRequest': createOrderClassApi,
    },
    'rbcDegree': {
        'getRequest': getRbcDegreeApi,
        'createRequest': createRbcDegreeApi,
    },
})

/** 로그인 시 Setting 값 설정 함수 */
export const initializeAllSettings = async () => {
    await firstGetSettings('cellImage');
    await firstGetSettings('orderClass');
    await firstGetSettings('rbcDegree');
    await firstGetSettings('lisCodeWbc')
    await firstGetSettings('lisCodeRbc')
    await firstGetSettings('cbcCode')
    await firstGetSettings('normalRange')
}

const firstGetSettings = async (initializeType: string) => {
    const getRequest = settingsConstant.value[initializeType].getRequest;
    try {
        const { data } = await getRequest() || {};

        if (!data || data.length === 0) {
            const sendingFormStr = settingsConstant.value[initializeType]?.sendingForm;
            const defaultItem = settingsConstant.value[initializeType].defaultItem;
            const createRequest = settingsConstant.value[initializeType].createRequest;

            const anotherDefaultValue = await defaultComputedValueForCreateRequest(initializeType)

            if (sendingFormStr) {
                await createRequest({ [sendingFormStr]: anotherDefaultValue || defaultItem });
            } else {
                await createRequest(anotherDefaultValue || defaultItem);
            }

            afterResponse(initializeType);
        }
    } catch (e) {
        console.log(`${initializeType} Error - ${e}`);
    }
}

/** Create 요청시 보낼 defaultValue 중 계산되어야 하는 값들을 반환하는 함수 */
const defaultComputedValueForCreateRequest = async (initializeType: string) => {
    switch (initializeType) {
        case 'cellImage':
            const cellImgSet = {
                analysisType: defaultCellImgData.testTypeCd,
                diffCellAnalyzingCount: defaultCellImgData.diffCellAnalyzingCount,
                diffWbcPositionMargin: defaultCellImgData.diffWbcPositionMargin,
                diffRbcPositionMargin: defaultCellImgData.diffRbcPositionMargin,
                diffPltPositionMargin: defaultCellImgData.diffPltPositionMargin,
                pbsCellAnalyzingCount: defaultCellImgData.pbsCellAnalyzingCount,
                stitchCount: defaultCellImgData.stitchCount,
                edgeShotType: defaultCellImgData.edgeShotType,
                bfCellAnalyzingCount: defaultCellImgData.bfCellAnalyzingCount,
                iaRootPath: defaultCellImgData.iaRootPath,
                isNsNbIntegration: defaultCellImgData.isNsNbIntegration ? 'Y' : 'N',
                isAlarm: defaultCellImgData.isAlarm,
                alarmCount: defaultCellImgData.alarmCount,
                keepPage: defaultCellImgData.keepPage,
                backupPath: defaultCellImgData.backupPath,
                backupStartDate: defaultCellImgData.backupStartDate.toISOString().split('T')[0],
                backupEndDate: defaultCellImgData.backupEndDate.toISOString().split('T')[0],
                autoBackUpMonth: 'Not selected',
                autoBackUpStartDate: null,
            };
            return cellImgSet;

        case 'orderClass':
            const orderList: any = window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
            for (const index in orderList) {
                orderList[index].orderIdx = index;
            }
            return orderList;

        case 'rbcDegree':
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
            return rbcDegreeList;

        default:
            return null;
    }
}

/** Response를 받은 후 할 작업 정리 함수 */
const afterResponse = (initializeType: string) => {
    switch (initializeType) {
        case 'cellImage':
            sessionStorage.setItem('isNsNbIntegration', defaultCellImgData.isNsNbIntegration ? 'Y' : 'N');
            sessionStorage.setItem('wbcPositionMargin', String(defaultCellImgData?.diffWbcPositionMargin));
            sessionStorage.setItem('rbcPositionMargin', String(defaultCellImgData?.diffRbcPositionMargin));
            sessionStorage.setItem('pltPositionMargin', String(defaultCellImgData?.diffPltPositionMargin));
            sessionStorage.setItem('edgeShotType', String(defaultCellImgData?.edgeShotType));
            sessionStorage.setItem('iaRootPath', String(defaultCellImgData?.iaRootPath));
            sessionStorage.setItem('keepPage', String(defaultCellImgData?.keepPage));
            break;
        default:
            break;
    }
}

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