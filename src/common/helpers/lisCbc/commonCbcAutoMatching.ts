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
    return matchValues(findAutoCbcArr.data, cbcData, crcArr, cbcSex, cbcAge);
}


// 조건을 평가하는 함수
const evaluateCondition = (count: any, condition: any) => {
    const numCount = parseFloat(count);
    // 공백을 포함한 조건 처리 안 하면 에러
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
const matchValues = (findAutoCbcArr: any, cbcArr: any, crcArr: any, cbcSex: string, cbcAge: any) => {
    findAutoCbcArr.forEach((itemA: any) => {
        // cbc_code와 매칭되는 cbcArr 아이템 찾기
        const cbcItem = cbcArr.find((itemCbc: any) => itemCbc.classNm === itemA.cbc_code.replace('%', ''));

        if (cbcItem) {
            const { count } = cbcItem;
            const { conditional, sex, age, ageCategory } = itemA;

            // 성별 필터링
            if (sex && sex !== "all" && sex !== cbcSex) {
                return; // 성별이 다르면 검사 패스
            }

            // 나이 필터링
            if (age) {
                const numericAge = parseFloat(age); // 숫자로 변환 가능하면 변환

                if (!isNaN(numericAge)) {
                    // 나이가 특정 숫자인 경우 비교
                    if (cbcAge !== numericAge) {
                        return; // 나이가 다르면 검사 패스
                    }
                } else if (age.includes('.')) {
                    // YYYY.MM.DD 형식의 나이 비교
                    if (age !== cbcAge.toString()) {
                        return;
                    }
                }
            }

            // ageCategory가 "kid"인 경우 추가 체크 (날짜 형식이 있는지)
            if (ageCategory === "kid") {
                if (age && age.includes('.')) {
                    // age가 YYYY.MM.DD 형식인데, cbcAge도 해당 형식이어야 함
                    if (age !== cbcAge.toString()) {
                        return; // 조건 불일치 시 패스
                    }
                }
            }

            // 조건 평가
            if (conditional && evaluateCondition(count, conditional)) {
                // crcArr에서 cbcCode 기반으로 매칭
                const crcItem = crcArr.find((itemCrc: any) => itemCrc.cbcCode === itemA.cbc_code);

                if (crcItem) {
                    crcItem.val = itemA.content; // content 값 반영
                }
            }
        }
    });

    return crcArr; // 업데이트된 crcArr 반환
};
