import { settingName } from "@/common/defines/constFile/settings";
import { putCellImgApi } from "@/common/api/service/setting/settingApi";
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
                    sessionStorage.setItem('iaRootPath', data?.iaRootPath);
                    sessionStorage.setItem('keepPage', String(data?.keepPage));
                    await store.dispatch('commonModule/setCommonInfo', {resetAnalyzing: true});
                }
            } catch (e) {
                console.log(e);
            } finally {
                await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
                await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
            }
            break;
        case settingName.rbcDegree:
            break;
        case settingName.wbcRunningCount:
            break;
        case settingName.wbcCustomClass:
            break;
        case settingName.wbcHotKeys:
            break;
        case settingName.bfHotKeys:
            break;
        case settingName.normalRange:
            break;
        case settingName.classOrder:
            break;
        case settingName.imagePrint:
            break;
        case settingName.lisCode:
            break;
        case settingName.cbcCode:
            break;
        case settingName.filePathSet:
            break;
        default:
            break;
    }
}