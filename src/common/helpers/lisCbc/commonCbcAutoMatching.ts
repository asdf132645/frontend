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

export const autoCbcDataMatchingDefault = async (barcodeNo: string, cbcCodeList: any, crcArr: any) => {
    const {cbcData, cbcSex, cbcAge} = await cbcDataGetCommon(barcodeNo, cbcCodeList);
    const findAutoCbcArr = await findAutoCbcApi();

    return matchValues(findAutoCbcArr.data, cbcData, crcArr, cbcSex, cbcAge);
}

const evaluateCondition = (count: any, condition: any) => {
    const numCount = parseFloat(count);
    const conditionMatch = /([<>]=?)(\s*\d+(\.\d+)?)/.exec(condition);

    if (conditionMatch) {
        const operator = conditionMatch[1];
        const value = parseFloat(conditionMatch[2].trim());
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

const parseAgeRange = (ageStr: string): [number | null, number | null] => {
    if (ageStr.includes("-")) {
        const parts = ageStr.split("-").map(num => parseInt(num.trim(), 10));
        return parts.length === 2 ? [parts[0], parts[1]] : [null, null];
    }
    const age = parseInt(ageStr, 10);
    return isNaN(age) ? [null, null] : [age, age];
};

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

        if (sex !== "all" && sex !== cbcSex) {
            return;
        }

        const numericCbcAge = cbcAge;
        const [minAge, maxAge] = parseAgeRange(age);
        if (cbcAge.includes("-") || cbcAge.includes(".")) {
            if(ageCategory === 'adult'){
                return;
            }
        }else{
            if(cbcAge > age){
                return;
            }
        }



        if (ageCategory === 'adult') {
            if (cbcAge > age) {
                return;
            }
        }

        if (ageCategory === 'kid') {
            if (age.includes("-")) {
                if (numericCbcAge || minAge === null || maxAge === null) return;
                if (Number(cbcAge) < minAge || Number(cbcAge) > maxAge) return;
            }

            // age가 날짜 형식(YYYY.MM.DD)일 경우 날짜 비교
            if (age.includes(".")) {
                const birthDate = moment(age, "YYYY.MM.DD"); // 애 생일
                const currentDate = moment(); // 현재 날짜

                // 아이의 생일이 현재 날짜보다 이후라면 리턴
                if (birthDate.isAfter(currentDate, 'day')) {
                    return; // 현재 날짜보다 이후에 태어난 아이라면 리턴
                }
            }
        }


        if (conditional && evaluateCondition(count, conditional)) {
            const crcItem = crcArr.find((itemCrc) => itemCrc.cbcCode === itemA.cbc_code);
            if (crcItem) {
                crcItem.val = itemA.content;
            }
        }
    });

    return crcArr;
};
