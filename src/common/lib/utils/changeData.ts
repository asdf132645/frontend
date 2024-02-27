export const checkPbNormalCell = (wbcInfo: any, norMalRange: any) => {
    // const norMalRange = this.$store.getters.getWbcNormalRange;
    let totalCount = 0;
    let neutrophilCount = 0;
    const resultObj: any = {
        'isNormal': 'Y',
        'class': []
    };

    if (wbcInfo) {
        wbcInfo.forEach((wbcItem: any) => {
            if (['NR', 'AR', 'GP', 'PA', 'MC', 'MA'].indexOf(wbcItem.title) === -1) {
                totalCount += Number(wbcItem.count);
            }

            if (['NE', 'NS', 'NB'].includes(wbcItem.title)) {
                neutrophilCount += Number(wbcItem.count);
            }
        });

        wbcInfo.forEach((wbcItem: any) => {
            norMalRange.forEach((range: any) => {
                // neutrophils
                if (range.classId === '01') {
                    let percent = 0;

                    if (['01', '71'].includes(wbcItem.id)) {
                        percent = (neutrophilCount / totalCount) * 100;

                        console.log(`${neutrophilCount}:${totalCount}:${percent}`);
                        if (percent < range.min || percent > range.max) {
                            console.log(`SET [NE] Abnormal : ${wbcItem.title}`);
                            resultObj.isNormal = 'N';
                            resultObj.class.push(`[NE] : [${percent.toFixed(2)}]%`);
                        } else {
                            console.log(`SET [NE] NORMAL : ${wbcItem.title}`);
                        }
                    }
                } else {
                    if (wbcItem.id === range.classId) {
                        if (range.unit === 'Count') {
                            if (Number(wbcItem.count) < range.min || Number(wbcItem.count) > range.max) {
                                // console.log(`SET Abnormal : ${wbcItem.title}`);
                                resultObj.isNormal = 'N';
                                resultObj.class.push(`${wbcItem.title} : [${wbcItem.count}]Count`);
                            } else {
                                // console.log(`SET NORMAL : ${wbcItem.title}`);
                            }
                        } else {
                            let percent = 0;

                            percent = (Number(wbcItem.count) / totalCount) * 100;

                            if (percent < range.min || percent > range.max) {
                                console.log(`SET Abnormal : ${wbcItem.title}`);
                                resultObj.isNormal = 'N';
                                resultObj.class.push(`${wbcItem.title} : [${percent.toFixed(2)}]%`);
                            } else {
                                console.log(`SET NORMAL : ${wbcItem.title}`);
                            }
                        }
                    }
                }
            });
        });
    }

    return resultObj;
};
