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
                                resultObj.isNormal = 'N';
                                resultObj.class.push(`${wbcItem.title} : [${wbcItem.count}]Count`);
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

export function parseXMLToJSON(xml: any): any {
    let obj: any = {};

    if (xml.nodeType === 1) { // element
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                const attribute = xml.attributes.item(j);
                if (attribute) {
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        }
    } else if (xml.nodeType === 3) { // text
        obj = xml.nodeValue;
    }

    // 자식 노드들을 반복하면서 JSON으로 변환
    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;

            if (typeof obj[nodeName] === "undefined") {
                obj[nodeName] = parseXMLToJSON(item);
            } else {
                if (typeof obj[nodeName].push === "undefined") {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(parseXMLToJSON(item));
            }
        }
    }

    return obj;
}

