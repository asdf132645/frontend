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
    const {cbcData, cbcSex, cbcAge} = await cbcDataGetCommon(barcodeNo, cbcCodeList);
    const findAutoCbcArr = await findAutoCbcApi();

    return matchValues(findAutoCbcArr.data, cbcData, crcArr, cbcSex, cbcAge, selectItems);
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
    findAutoCbcArr: AItem[], cbcArr: CbcArrItem[], crcArr: CrcArrItem[], cbcSex: string, cbcAge: string, selectItems: any
): CrcArrItem[] => {
    findAutoCbcArr.forEach((itemA) => {
        console.log(crcArr);
        const { conditional, sex, age, ageCategory, matchingType, cbc_code, title, mo_type, content } = itemA;

        if (sex !== "all" && sex !== cbcSex) return;

        const [minAge, maxAge] = parseAgeRange(age);
        if (age.includes("-") && (cbcAge || minAge === null || maxAge === null || Number(cbcAge) < minAge || Number(cbcAge) > maxAge)) return;
        if (ageCategory === 'year' && cbcAge > age) return;

        const birthDate = moment(cbcAge, "YYYY.MM.DD");
        if (!["year", "month", "day"].includes(ageCategory)) return;

        const unit = ageCategory as moment.unitOfTime.DurationConstructor;
        const compareDate = moment().subtract(age, unit);

        if (birthDate.isAfter(compareDate, 'day')) return;

        let count = 0;
        if (matchingType === 'PBIA') {
            console.log(selectItems);
            count = getPBIAItemCount(selectItems, cbc_code);
        } else {
            const cbcItem = cbcArr.find(item => item.classNm === cbc_code.replace("%", ""));
            if (!cbcItem) return;
            count = Number(cbcItem.count);
        }

        if (conditional) {
            conditional.split(",").map(cond => cond.trim()).forEach(cond => {
                if (evaluateCondition(count, cond)) {
                    const crcItem = crcArr.find((item: any) => item.crcTitle === title && item.morphologyType === mo_type);
                    if (crcItem) crcItem.val = content;
                }
            });
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
