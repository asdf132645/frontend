import {WbcInfo} from "@/store/modules/analysis/wbcclassification";

export const commonUpdateCounts = async (currentSlot: any, dspWbcClassList: any, siteCd: any) => {
    const arrType = currentSlot.wbcInfo;
    const wbcList = arrType;
    let totalVal = "";

    totalVal = calculateWbcPercentages(dspWbcClassList, wbcList,siteCd).toFixed(0);
    await updatePercentages(totalVal, dspWbcClassList);


};


const calculateWbcPercentages = (
    classList: WbcInfo[],
    wbcList: WbcInfo[],
    siteCd: any
) => {
    const includesStr = siteCd === '0006' ? ["AR", "NR", "GP", "PA", "MC", "MA"]:["AR", "NR", "GP", "PA", "MC", "MA", "SM"]
    const total = classList
        .filter(
            (category) =>
                !includesStr.includes(category.title)
        )
        .reduce((acc, category) => {
            const matchingWbcItem = wbcList.find(
                (wbcItem) => category.id === wbcItem.id
            );

            if (matchingWbcItem) {
                category.count = matchingWbcItem.count;
                return acc + Number(matchingWbcItem.count);
            }

            return acc;
        }, 0);

    return total;
};


const updatePercentages = async (totalVal: any,dspWbcClassList: any) => {
    const percent = dspWbcClassList.map((classList: any) => {
        return classList.map((category: any) => {
            return {
                ...category,
                percent: totalVal && totalVal !== '0' ? ((Number(category.count) / Number(totalVal)) * 100).toFixed(0) : '0'
            };
        });
    });
    return percent;
};
