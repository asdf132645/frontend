

export const calculateWbcPercentages = (
    classList: any[],
    siteCd: any
) => {
    const includesStr = siteCd === '0006' ? ["AR", "NR", "GP", "PA", "MC", "MA", "SM"]:["AR", "NR", "GP", "PA", "MC", "MA"];
    const total = classList
        .filter(
            (category) =>
                !includesStr.includes(category.title)
        )
        .reduce((acc, category) => {
            const matchingWbcItem = classList.find(
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


// 인하대
export const inhaPercentChange = (runningInfoData: any, wbcInfo: any) => {
    if (runningInfoData.testType !== '04') {
        const excludedTitles = ['NR', 'AR', 'GP', 'PA', 'MC', 'MA'];

        // wbcTotal 계산
        let wbcTotal = 0;
        wbcInfo.forEach((wbcItem: any) => {
            if (Number(wbcItem.count) > 0 && !excludedTitles.includes(wbcItem.title)) {
                wbcTotal += Number(wbcItem.count);
            }
        });
        // console.log('wbcTotal : ' + wbcTotal);

        let maxItem: any = null;
        let percentTotal = 0;

        // 퍼센트 계산 및 maxItem 결정
        wbcInfo.forEach((wbcItem: any, index: number) => {
            let percent = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(0));
            const percentN2 = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(2));

            // console.log(percentN2);

            // 특정 조건에 따라 퍼센트 조정
            if ((wbcItem.title === 'BL' || ['LA', 'IM', 'MB', 'AM'].includes(wbcItem.title)) &&
                Number(wbcItem.count) > 0 &&
                percentN2 >= 0 &&
                percentN2 <= 1) {
                percent = 1;
            }

            wbcItem.percent = percent;
            // console.log(wbcItem.title + ':' + wbcItem.percent);

            // 제외할 타이틀이 아닌 경우 percentTotal 및 maxItem 갱신
            if (!excludedTitles.includes(wbcItem.title)) {
                percentTotal += Number(wbcItem.percent);
                if (maxItem === null || Number(maxItem.count) < Number(wbcItem.count)) {
                    maxItem = wbcItem;
                }
            }

            // console.log('maxItem : ' + (maxItem ? maxItem.title : 'null'));
            // console.log(percentTotal);

            // 마지막 항목일 때 백분율 오차 보정
            if (maxItem !== null && (index + 1) === wbcInfo.length) {
                // console.log(Number(maxItem.percent));
                // console.log(100 - percentTotal);
                maxItem.percent = Number(maxItem.percent) + (100 - percentTotal);
                // console.log(maxItem.percent);
            }
        });

        console.log('Inha wbcInfo', wbcInfo);
        return wbcInfo;
    }
}

// 서울성모
export const seoulStMaryPercentChange = (originWbcInfo: any, changingWbcInfo: any) => {
    const totalPercent = originWbcInfo.filter((item: any) => item.name !== "Neutrophil")
        .map((item: any) => Math.round(parseFloat(item.percent)))
        .reduce((sum: any, percent: any) => sum + percent, 0);

    return changingWbcInfo.map((item: any) => item.name === "Neutrophil"
            ? {...item, percent: 100 - totalPercent}
            : {...item, percent: Math.round(parseFloat(item.percent))}
    );
}