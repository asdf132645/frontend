import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {getUserIpApi} from "@/common/api/service/user/userApi";

export const stateDeleteCommon = async (originalDb: any, selectItems: any, id: any) => {
    try {
        const result = await getUserIpApi();
        const updatedRuningInfo = {
            pcIp: '',
            state: false,
        };

        const localDbData = [...originalDb];
        const indexToUpdate = localDbData.findIndex(item => item.pcIp === result.data && item.state);
        if (indexToUpdate !== -1) {
            localDbData[indexToUpdate] = {...localDbData[indexToUpdate], ...updatedRuningInfo};
        }
        const response = await updateRunningApi({
            userId: Number(id),
            runingInfoDtoItems: [localDbData[indexToUpdate]]
        })
        sessionStorage.setItem('selectItems', JSON.stringify(localDbData[indexToUpdate]));
        sessionStorage.setItem('originalDbData', JSON.stringify(localDbData));
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
        sessionStorage.setItem('selectItems', JSON.stringify(localDbData[indexToUpdate]));
        sessionStorage.setItem('originalDbData', JSON.stringify(localDbData));
        const response = await updateRunningApi({
            userId: Number(id),
            runingInfoDtoItems: [localDbData[indexToUpdate]]
        })
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}