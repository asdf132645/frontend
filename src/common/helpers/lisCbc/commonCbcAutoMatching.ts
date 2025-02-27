import {findAutoCbcApi} from '@/common/api/service/autoCbc/autoCbc';
import {cbcDataGetCommon} from "@/common/helpers/lisCbc/index";
import moment from 'moment';

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
    const {cbcData, cbcSex, cbcAge} = await cbcDataGetCommon(barcodeNo, cbcCodeList);
    const findAutoCbcArr = await findAutoCbcApi();
    // console.log(JSON.stringify(findAutoCbcArr.data));
    // console.log(JSON.stringify(cbcData));
    // console.log(JSON.stringify(crcArr));

    // 새로 업데이트된 crcArr를 반환
    return matchValues(findAutoCbcArr.data, cbcData, crcArr, cbcSex, cbcAge);
}


// 조건을 실행시키는 함수
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



// 어린이일경우 날짜별로 변환 작업 실행
const calculateAgeFromDate = (birthDateStr: string): number | null => {
    const birthDate = moment(birthDateStr, "YYYY.MM.DD", true);
    if (!birthDate.isValid()) return null; // 유효하지 않은 날짜 처리
    return moment().diff(birthDate, 'years'); // 현재 날짜 기준 나이 계산
};

// 자동으로 crcArr의 val 값을 채우는 함수 - 셀렉트 박스 자동 매칭 하는 부분
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

        const {count} = cbcItem;
        const {conditional, sex, age, ageCategory} = itemA;

        // 성별 체크 (all이면 통과)
        if (sex !== "all" && sex !== cbcSex) {
            return;
        }

        // cbcAge 변환작업
        const numericCbcAge: number | null = moment(cbcAge, "YYYY.MM.DD", true).isValid()
            ? calculateAgeFromDate(cbcAge)
            : isNaN(Number(cbcAge)) ? null : Number(cbcAge);

        // 셋팅 나이 변환 작업
        const numericAge: number | null = moment(age, "YYYY.MM.DD", true).isValid()
            ? calculateAgeFromDate(age)
            : isNaN(Number(age)) ? null : Number(age);

        // 나이 비교 (값이 있을 경우)
        if (numericCbcAge !== null && numericAge !== null) {
            if (ageCategory === "adult") {
                // 성인은 age 이상이면 통과
                if (numericCbcAge < numericAge) return;
            } else {
                // 성인이 아니면 (kid 포함) 정확히 일치해야 통과
                if (numericCbcAge !== numericAge) return;
            }
        }

        // ageCategory === "kid" 이면 0~100 나이 체크 (adult는 무시)
        if (ageCategory === "kid" && (numericCbcAge === null || numericCbcAge < 0 || numericCbcAge > 100)) {
            return;
        }

        // 조건 실행 후 crcArr 업데이트
        if (conditional && evaluateCondition(count, conditional)) {
            const crcItem = crcArr.find((itemCrc) => itemCrc.cbcCode === itemA.cbc_code);
            if (crcItem) {
                crcItem.val = itemA.content;
            }
        }
    });

    return crcArr;
};
