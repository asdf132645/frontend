import { findAutoCbcApi } from '@/common/api/service/autoCbc/autoCbc';
import { cbcDataGetCommon } from "@/common/helpers/lisCbc/index";

interface AItem {
    id: number;
    cbc_code: string;
    conditional: string;
    mo_type: string;
    title: string;
    content: string;
    sex: string;
    age: string;
    ageCategory: string;
    orderIdx: string;
}

interface CbcArrItem {
    classNm: string;
    count: string;
    unit: string;
}

interface CrcArrItem {
    crcCode: string;
    val: string;
    crcCodeMatching: string | null;
    cbcCode: string;  // 추가된 cbcCode 속성
}

export const autoCbcDataMatchingDefault = async (barcodeNo: string, cbcCodeList: any, crcArr: any) => {
    const { cbcData, cbcSex, cbcAge } = await cbcDataGetCommon(barcodeNo, cbcCodeList);
    const findAutoCbcArr = await findAutoCbcApi();

    console.log(JSON.stringify(findAutoCbcArr.data));
    console.log(JSON.stringify(cbcData));
    console.log(JSON.stringify(crcArr));

    // 새로 업데이트된 crcArr를 반환
    return matchValues(findAutoCbcArr.data, cbcData, crcArr);
}


// 조건을 평가하는 함수
// 조건을 평가하는 함수
const evaluateCondition = (count: any, condition: any) => {
    const numCount = parseFloat(count);
    // 공백을 포함한 조건 처리 (ex. "> 99" 또는 ">99")
    const conditionMatch = /([<>]=?)(\s*\d+(\.\d+)?)/.exec(condition);

    if (conditionMatch) {
        const operator = conditionMatch[1];
        const value = parseFloat(conditionMatch[2].trim());  // 공백 제거 후 숫자로 변환
        switch (operator) {
            case ">":
                return numCount > value;
            case "<":
                return numCount < value;
            case ">=":
                return numCount >= value;
            case "<=":
                return numCount <= value;
            default:
                return false;
        }
    }
    return false;
};


// 자동으로 crcArr의 val 값을 채우는 함수
const matchValues = (findAutoCbcArr: any, cbcArr: any, crcArr: any) => {
    // crcArr를 복사하여 업데이트할 배열을 만들기
    const updatedCrcArr = [...crcArr];

    updatedCrcArr.forEach((crcItem: any) => {
        // crcArr의 cbcCode와 일치하는 cbc_code를 가진 AItem을 찾기
        findAutoCbcArr.forEach((itemA: any) => {
            // cbc_code가 일치하는 cbcArr 항목을 찾기
            const cbcItem = cbcArr.find((itemCbc: any) => itemCbc.classNm === itemA.cbc_code.replace('%', ''));

            if (cbcItem && crcItem.cbcCode && crcItem.cbcCode === itemA.cbc_code) {
                const { count } = cbcItem;
                const { conditional } = itemA;

                // 조건을 만족하면 val에 content 값을 넣기
                if (conditional && evaluateCondition(count, conditional)) {
                    crcItem.val = itemA.content; // 조건이 맞으면 val에 content를 넣음
                }
            }
        });
    });

    return updatedCrcArr;
};
