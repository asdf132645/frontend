import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {getUserIpApi} from "@/common/api/service/user/userApi";
import {ref} from "vue";

export const stateDeleteCommon = async (originalDb: any, selectItemsId: any, id: any) => {
    console.log(originalDb)
    try {
        const copiedObj = JSON.parse(JSON.stringify(originalDb));

        const result = await getUserIpApi();
        const updatedRuningInfo = {
            pcIp: '',
            state: false,
        };
        const localDbData = [...originalDb];
        console.log(localDbData)
        const indexToUpdate = localDbData.findIndex(item => item.pcIp === result.data && item.state);
        if (indexToUpdate !== -1) {
            localDbData[indexToUpdate] = {...localDbData[indexToUpdate], ...updatedRuningInfo};
            delete localDbData[indexToUpdate].wbcInfoAfter;
        }


        const selectItemsData = sessionStorage.getItem("selectItems");
        const selectItems = selectItemsData ? JSON.parse(selectItemsData) : null;

        const response = await updateRunningApi({
            userId: Number(id),
            runingInfoDtoItems: [localDbData[indexToUpdate]]
        })


        selectItems.pcIp = '';
        selectItems.state = false;
        copiedObj[indexToUpdate] = selectItems;
        console.log(selectItems)
        sessionStorage.setItem('selectItems', JSON.stringify(selectItems));
        sessionStorage.setItem('originalDbData', JSON.stringify(copiedObj));
        return response;
    } catch (error) {
        console.error('Error:', error);
    }

}

export const stateUpdateCommon = async (itemVal: any, pcIp: any, dbdata: any, id: any) => {
    const copiedObj = JSON.parse(JSON.stringify(dbdata));

    try {
        const updatedRuningInfo = {
            id: itemVal.id,
            pcIp: pcIp,
            state: true,
        };
        const itemValObj = JSON.parse(JSON.stringify(itemVal));
        const localDbData = dbdata;
        for (const idx in localDbData) {
            localDbData[idx].pcIp = '';
            localDbData[idx].state = false;
        }

        const indexToUpdate = localDbData.findIndex((item: any) => item.id === itemVal.id);

        if (indexToUpdate !== -1) {
            localDbData[indexToUpdate] = {...localDbData[indexToUpdate], ...updatedRuningInfo};
            delete localDbData[indexToUpdate].wbcInfoAfter;
        }

        for (const idx in copiedObj) {
            copiedObj[idx].pcIp = '';
            copiedObj[idx].state = false;
        }
        itemValObj.id = itemVal.id
        itemValObj.pcIp = pcIp;
        itemValObj.state = true;
        copiedObj[indexToUpdate] = itemValObj;
        sessionStorage.setItem('selectItems', JSON.stringify(itemValObj));
        sessionStorage.setItem('originalDbData', JSON.stringify(copiedObj));
        console.log(copiedObj)
        const response = await updateRunningApi({
            userId: Number(id),
            runingInfoDtoItems: [itemValObj]
        })
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}