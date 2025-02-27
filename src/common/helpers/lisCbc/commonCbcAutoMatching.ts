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
    // console.log(JSON.stringify(findAutoCbcArr.data));
    // console.log(JSON.stringify(cbcData));
    // console.log(JSON.stringify(crcArr));

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


const calculateAgeFromDate = (birthDateStr: string): number | null => {
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return null; // 유효하지 않은 날짜 처리

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // 생일이 지나지 않았다면 한 살 빼기
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
};
// 자동으로 crcArr의 val 값을 채우는 함수
const matchValues = (
    findAutoCbcArr: AItem[],
    cbcArr: CbcArrItem[],
    crcArr: CrcArrItem[],
    cbcSex: string,
    cbcAge: string
): CrcArrItem[] => {
    findAutoCbcArr.forEach((itemA) => {
        const cbcItem = cbcArr.find((itemCbc) => itemCbc.classNm === itemA.cbc_code.replace("%", ""));
        if (!cbcItem) return;

        const { count } = cbcItem;
        const { conditional, sex, age, ageCategory } = itemA;

        // ✅ 성별 체크 (all이면 통과)
        if (sex !== "all" && sex !== cbcSex) {
            return;
        }

        // ✅ cbcAge 처리
        let numericCbcAge: number | null;
        if (/^\d{4}\.\d{2}\.\d{2}$/.test(cbcAge)) {
            numericCbcAge = calculateAgeFromDate(cbcAge); // 날짜면 변환
        } else {
            numericCbcAge = isNaN(Number(cbcAge)) ? null : Number(cbcAge); // 숫자는 그대로 사용
        }

        // ✅ age 처리
        let numericAge: number | null;
        if (/^\d{4}\.\d{2}\.\d{2}$/.test(age)) {
            numericAge = calculateAgeFromDate(age); // 날짜면 변환
        } else {
            numericAge = isNaN(Number(age)) ? null : Number(age); // 숫자는 그대로 사용
        }

        // ✅ 나이 비교 (값이 있을 경우)
        if (numericAge !== null && numericCbcAge !== null) {
            if (numericCbcAge !== numericAge) return;
        }

        // ✅ ageCategory === "kid" 이면 0~100 나이 체크 (adult는 무시)
        if (ageCategory === "kid") {
            if (numericCbcAge === null || numericCbcAge < 0 || numericCbcAge > 100) return;
        }

        // ✅ 조건 평가 후 crcArr 업데이트
        if (conditional && evaluateCondition(count, conditional)) {
            const crcItem = crcArr.find((itemCrc) => itemCrc.cbcCode === itemA.cbc_code);
            if (crcItem) {
                crcItem.val = itemA.content;
            }
        }
    });

    return crcArr;
};
