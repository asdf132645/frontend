

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

export const percentWithNoError = (percent: number) => {
    if (isNaN(percent)) {
        return 0;
    }
    return percent;
}

// 인하대
export const inhaPercentChange = (runningInfoData: any, wbcInfo: any) => {
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
    wbcInfo.forEach((wbcItem: any, index: any) => {
        let percent = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(0));
        const percentN2 = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(2));

        // console.log(percentN2);

        // 특정 조건에 따라 퍼센트 조정
        if ((wbcItem.title === 'BL' || ['LA', 'IM', 'MB', 'AM'].includes(wbcItem.title)) &&
            Number(wbcItem.count) > 0 &&
            percentN2 >= 0 &&
            percentN2 <= 1)
        {
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

    return wbcInfo;
}

// 서울성모
export const seoulStMaryPercentChange = (originWbcInfo: any, changingWbcInfo: any) => {
    // Neutrophil 빼고 totalCount 계산
    const totalPercent = originWbcInfo.filter((item: any) => item.name !== "Neutrophil")
        .map((item: any) => Math.round(parseFloat(item.percent)) || 0)
        .reduce((sum: any, percent: any) => sum + Number(percent), 0);

    return changingWbcInfo.map((item: any) => item.name === "Neutrophil"
            ? {...item, percent: 100 - totalPercent}
            : {...item, percent: Math.round(parseFloat(item.percent))}
    );
}

/** 인천성모병원
 * BM에서 정수값은 .0 붙여서 보여주기
 * ex. 8% => 8.0% */
export const incheonStMaryPercentChange = (projectType: string, wbcInfo: any) => {
    if (projectType === 'bm') {
        return wbcInfo.map((item: any) => {
            if (0 < parseFloat(item.percent) && parseFloat(item.percent) < 100 && parseFloat(item.percent) % 1 === 0) {
                return {...item, percent: Number(item.percent).toFixed(1) };
            }
            return item;
        })
    }
    return wbcInfo;
}

export const incheonGilPercentChange = (wbcInfo: any, maxWbcCount: string) => {
    const nonWbcTitles = ['NR', 'GP', 'PA', 'MA', 'AR', 'SM'];

    // 전체 Class
    const addPercentWbcInfo = wbcInfo.map((item: any) => {
        let itemPercent = 0;
        if (Number(item.count) && item.title === 'NR') itemPercent = Math.ceil((Number(item.count) / Number(maxWbcCount)) * 100);
        else if (nonWbcTitles.includes(item.title) && Number(item.count)) itemPercent = Math.round((Number(item.count) / Number(maxWbcCount)) * 100);
        else itemPercent = Number(item.percent) || 0;
        return {
            ...item,
            percent: itemPercent
        };
    })

    // nonWbc 제외 Class
    const wbcInfoPercentArr = addPercentWbcInfo.filter((item: any) => !nonWbcTitles.includes(item.title));

    const adjustedItems = adjustPercentages(wbcInfoPercentArr);

    return wbcInfo.map((item: any) => {
        const adjustedItem = adjustedItems.find(adjusted => adjusted.title === item.title);
        return adjustedItem ? { ...item, percent: adjustedItem.percent } : addPercentWbcInfo.find((wbcItem: any) => item.title === wbcItem.title);
    });
};

const adjustPercentages = (items: any[]) => {
    // Step 1: 초기 반올림
    const rounded = items.map(item => Math.round(item.percent)); // 반올림하여 정수 변환
    const total = rounded.reduce((sum, p) => sum + p, 0); // 합계 계산

    // Step 2: 오차 계산
    const difference = 100 - total; // 남은 오차 계산

    // Step 3: 소수점 크기 기준으로 정렬 및 오차 분배
    if (difference !== 0) {
        const decimalParts = items.map((item, i) => ({
            index: i,
            decimal: item.percent - Math.floor(item.percent) // 소수점 부분 계산
        }));

        // 소수점 부분이 큰 순서로 정렬
        decimalParts.sort((a, b) => b.decimal - a.decimal);

        // Step 4: 오차 분배
        for (let i = 0; i < Math.abs(difference); i++) {
            const adjustIndex = decimalParts[i % decimalParts.length].index; // 인덱스가 범위를 넘지 않도록 조정
            rounded[adjustIndex] += difference > 0 ? 1 : -1; // 오차 조정
        }
    }

    // Step 5: 원래 아이템의 percent 값을 수정
    for (let i = 0; i < items.length; i++) {
        items[i].percent = rounded[i];
    }

    return items;
}