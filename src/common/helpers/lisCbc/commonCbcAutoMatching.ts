import {findAutoCbcApi} from '@/common/api/service/autoCbc/autoCbc';
import {cbcDataGetCommon} from "@/common/helpers/lisCbc/index";
import moment from "moment";

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
    matchingType: string;
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
    cbcCode: string;
}

export const autoCbcDataMatchingDefault = async (barcodeNo: string, cbcCodeList: any, crcArr: any, selectItems: any) => {
    const {cbcData, cbcSex, cbcAge, cbcYear} = await cbcDataGetCommon(barcodeNo, cbcCodeList);
    const findAutoCbcArr = await findAutoCbcApi();

    return matchValues(findAutoCbcArr.data, cbcData, crcArr, cbcSex, cbcAge, selectItems, cbcYear);
}

const evaluateCondition = (count: any, condition: string) => {
    const numCount = parseFloat(count);

    // 조건이 비어있거나 유효하지 않으면 false 반환
    if (!condition || typeof condition !== "string") return false;

    const conditionMatch = /([<>]=?|===?)(\s*-?\d+(\.\d+)?)/.exec(condition);

    if (conditionMatch) {
        const operator = conditionMatch[1];
        const value = parseFloat(conditionMatch[2].trim());

        if (isNaN(numCount) || isNaN(value)) return false;

        switch (operator) {
            case ">":
                return numCount > value;
            case "<":
                return numCount < value;
            case ">=":
                return numCount >= value;
            case "<=":
                return numCount <= value;
            case "===":
            case "==":
                return numCount === value;
            default:
                return false;
        }
    }
    return false;
};


const matchValues = (
    findAutoCbcArr: AItem[], cbcArr: CbcArrItem[], crcArr: CrcArrItem[], cbcSex: string, cbcAge: string, selectItems: any, cbcYear: string
): CrcArrItem[] => {
    // day, month 인 경우 -> 환자 생일을 추출한 부분을 사용 과거거나 미래일 경우 리턴
    // year - 사용 시 min, max 로 변경해서 환자나이가 셋팅 나이보다 많거나 작을경우 리턴
    // PBIA에서 나온 데이터 인지 CBC 비교 대상인지 추출해서 비교한 후 PBIA 는 미리 만들어둔 wbc, rbc 를 합친 배열을 사용해서 카운터를 추출
    // cbc 는 셋팅페이지에 cbc 배열을 가지고 와서 카운터를 추출 함
    //  카운터를 추출 후 컨디셔너에 있는 조건과 카운터를 비교함
    findAutoCbcArr.forEach((itemA) => {
        const {conditional, sex, age, ageCategory, matchingType, cbc_code, title, mo_type, content} = itemA;
        
        if (sex !== "all" && sex !== cbcSex) return;
        if (!["year", "month", "day"].includes(ageCategory)) return;

        const [minAge, maxAge] = parseAgeRange(age);
        if (minAge === null || maxAge === null || Number(cbcAge) < minAge || Number(cbcAge) > maxAge) return;
        if (ageCategory === "day" || ageCategory === "month") {
            // cbcYear (YYMMDD)에서 연, 월, 일 추출
            const birthYear = `20${cbcYear.substring(0, 2)}`;  // "21" -> "2021"
            const birthMonth = cbcYear.substring(2, 4); // "05" -> "05"
            const birthDay = cbcYear.substring(4, 6);   // "12" -> "12"

            const birthDate = moment(`${birthYear}-${birthMonth}-${birthDay}`, "YYYY-MM-DD");

            // 현재 날짜에서 age (일/개월) 만큼 빼고, 더한 날짜 계산
            const pastDate = moment().subtract(Number(age), ageCategory as moment.unitOfTime.DurationConstructor);
            const futureDate = moment().add(Number(age), ageCategory as moment.unitOfTime.DurationConstructor);

            // 생일이 과거 범위를 벗어나거나 미래 범위를 벗어나면 리턴
            if (birthDate.isBefore(pastDate, "day") || birthDate.isAfter(futureDate, "day")) return;
        }



        let count = 0;
        if (matchingType === 'PBIA') {
            count = getPBIAItemCount(selectItems, cbc_code);
        } else {
            const cbcItem = cbcArr.find(item => item.classNm === cbc_code.replace("%", ""));
            if (!cbcItem) return;
            count = Number(cbcItem.count);
        }
        if (conditional) {
            const conditions = conditional.split(",").map(cond => cond.trim());

            // conditional에 조건이 2개 이상일 경우 모든 조건이 통과되야함
            const allConditionsMet = conditions.every(cond => evaluateCondition(count, cond));

            if (allConditionsMet) {
                const crcItem = crcArr.find((item: any) => item.crcTitle === title && item.morphologyType === mo_type);
                if (crcItem) crcItem.val = content.trim();
            }
        }
    });
    return crcArr;
};

const getPBIAItemCount = (selectItems: any, cbc_code: string): number => {
    let count = 0;
    selectItems.rbcInfoAfter.forEach((rbcItem: any) => {
        rbcItem.classInfo.forEach((classItem: any) => {
            if (classItem.classNm === cbc_code) count = classItem.degree;
        });
    });
    selectItems.wbcInfoAfter.forEach((wbcItem: any) => {
        if (wbcItem.name === cbc_code) count = wbcItem.count;
    });
    return count;
};

const parseAgeRange = (ageStr: string): [number | null, number | null] => {
    if (ageStr.includes("-")) {
        const parts = ageStr.split("-").map(num => parseInt(num.trim(), 10));
        return parts.length === 2 ? [parts[0], parts[1]] : [null, null];
    }
    const age = parseInt(ageStr, 10);
    return isNaN(age) ? [null, null] : [age, age];
};
