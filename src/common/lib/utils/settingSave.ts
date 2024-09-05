import { settingName } from "@/common/defines/constFile/settings";
import {
    putCellImgApi,
    putOrderClassApi,
    putRbcDegreeApi,
    updateBfHotKeysApi,
    updateCbcCodeRbcApi,
    updateFilePathSetApi,
    updateImagePrintApi,
    updateLisCodeRbcApi,
    updateLisCodeWbcApi, updateMinCountApi,
    updateNormalRangeApi,
    updateRunInfoApi,
    updateWbcCustomClassApi,
    updateWbcHotKeysApi
} from "@/common/api/service/setting/settingApi";
import store from "@/store/index";

export const settingUpdate = async (settingType: string, settingUpdatingData: any) => {
    if (!settingType || !settingUpdatingData) return;

    switch (settingType) {
        case settingName.cellImageAnalyzed:
            const cellImageObj = settingUpdatingData;
            const cellImageId = cellImageObj.id;
            if (cellImageObj?.id) {
                delete cellImageObj.id;
            }
            try {
                const result = await putCellImgApi(cellImageObj, cellImageId);
                if (result) {
                    const data: any = result?.data;
                    await store.dispatch('commonModule/setCommonInfo', { isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N' });
                    await store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
                        isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N'
                    });
                    // 공통으로 사용되는 부분 세션스토리지 저장 새로고침시에도 가지고 있어야하는부분
                    sessionStorage.setItem('isNsNbIntegration', data.isNsNbIntegration ? 'Y' : 'N');
                    sessionStorage.setItem('wbcPositionMargin', data?.diffWbcPositionMargin);
                    sessionStorage.setItem('rbcPositionMargin', data?.diffRbcPositionMargin);
                    sessionStorage.setItem('pltPositionMargin', data?.diffPltPositionMargin);
                    sessionStorage.setItem('edgeShotType', String(data?.edgeShotType));
                    sessionStorage.setItem('iaRootPath', data?.iaRootPath);
                    sessionStorage.setItem('keepPage', String(data?.keepPage));
                    const keepPageType = window.PROJECT_TYPE === 'pb' ? 'keepPage': 'bmKeepPage';
                    sessionStorage.setItem(keepPageType, String(data?.keepPage));
                    await store.dispatch('commonModule/setCommonInfo', {resetAnalyzing: true});
                }
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.rbcDegree:
            try {
                const rbcDegreeList: any = [];
                settingUpdatingData.forEach((category: any) => {
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
                await putRbcDegreeApi(rbcDegreeList);
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.wbcRunningCount:
            try {
                await updateRunInfoApi({ wbcRunCountItems: settingUpdatingData });
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.wbcCustomClass:
            try {
                await updateWbcCustomClassApi({ classArr: settingUpdatingData });
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.wbcHotKeys:
            try {
                await updateWbcHotKeysApi({ wbcHotKeysItems: settingUpdatingData });
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.bfHotKeys:
            try {
                await updateBfHotKeysApi({ bfHotKeysItems: settingUpdatingData });
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.normalRange:
            try {
                await updateNormalRangeApi({ normalRangeItems: settingUpdatingData });
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.classOrder:
            for (const index in settingUpdatingData) {
                settingUpdatingData[index].orderIdx = index;
            }
            try {
                await putOrderClassApi(settingUpdatingData);
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.imagePrint:
            try {
                await updateImagePrintApi({ imagePrintItems: settingUpdatingData });
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.lisCode:
            await updateLisCodeWbcApi({ lisCodeItems: settingUpdatingData.lisCodeWbcArr });
            await updateLisCodeRbcApi({ lisCodeItems: settingUpdatingData.lisCodeRbcArr });
            await updateMinCountApi({ minCountItems: settingUpdatingData.minCountArr });
            break;

        case settingName.cbcCode:
            try {
                await updateCbcCodeRbcApi({ cbcCodeItems: settingUpdatingData });
            } catch (e) {
                console.log(e);
            }
            break;

        case settingName.filePathSet:
            try {
                await updateFilePathSetApi({ filePathSetItems: settingUpdatingData });
            } catch (e) {
                console.log(e);
            }
            break;

        default:
            break;
    }
    await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
    await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
}