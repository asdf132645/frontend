import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";

export const stateDeleteCommon = async (originalDb: any, selectItems: any, id: any) => {
    try {
        const updatedRuningInfo = {
            pcIp: '',
            state: false,
        };

        const localDbData = [...originalDb];

        const indexToUpdate = localDbData.findIndex(item => item.id === selectItems.id);
        if (indexToUpdate !== -1) {
            localDbData[indexToUpdate] = {...localDbData[indexToUpdate], ...updatedRuningInfo};
        }

        const response = await updateRunningApi({
            userId: Number(id),
            runingInfoDtoItems: [localDbData[indexToUpdate]]
        })
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export const stateUpdateCommon = async (itemVal: any, pcIp: any, dbdata: any, id: any) => {
    try {
        const updatedRuningInfo = {
            id: itemVal.id,
            pcIp: pcIp,
            state: true,
        };

        const localDbData = dbdata;
        for (const idx in localDbData) {
            localDbData[idx].pcIp = '';
            localDbData[idx].state = false;
        }

        const indexToUpdate = localDbData.findIndex((item: any) => item.id === itemVal.id);

        if (indexToUpdate !== -1) {
            localDbData[indexToUpdate] = {...localDbData[indexToUpdate], ...updatedRuningInfo};
        }

        const response = await updateRunningApi({
            userId: Number(id),
            runingInfoDtoItems: [localDbData[indexToUpdate]]
        })
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export const moveFunction = async (direction: any, originalDb: any, selectItems: any, clickid: any, updateUpDown: any) => {
    const currentDbIndex = originalDb.value.findIndex((item: any) => item.id === selectItems.value.id);
    const nextDbIndex = direction === 'up' ? currentDbIndex - 1 : currentDbIndex + 1;
    if (nextDbIndex >= 0 && nextDbIndex < originalDb.value.length) {
        selectItems.value = originalDb.value[nextDbIndex];
        sessionStorage.setItem('selectItems', JSON.stringify(originalDb.value[nextDbIndex]));
        sessionStorage.setItem('selectItemWbc', JSON.stringify(originalDb.value[nextDbIndex].wbcInfo.wbcInfo));
        sessionStorage.setItem('dbBaseTrClickId', String(Number(clickid.value) + (direction === 'up' ? -1 : 1)));
        clickid.value = String(Number(clickid.value) + (direction === 'up' ? -1 : 1));
        await updateUpDown(originalDb.value[nextDbIndex].wbcInfo.wbcInfo[0], originalDb.value[nextDbIndex]);
    }
}
