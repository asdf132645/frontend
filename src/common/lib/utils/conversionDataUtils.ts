import { commonCodeList } from '@/common/defines/constFile/commonCodeList';
import {testType} from "@/common/defines/constFile/dataBase";
interface CommonCode {
    grpCd: string;
    cd: string;
    cdNm: string; // Add cdNm property to the CommonCode interface
}


export const getCommonCode = (grpCd: string, cd: string): string | undefined => {
    const foundCode = commonCodeList.find((code) => code.grpCd === grpCd && code.cd === cd);

    return foundCode?.cdNm;
};

export function stringToDateTime(str: string): string {
    if (!str) {
        return '';
    }

    const [year, month, day, hour, minute, second] = [
        str.substring(0, 4),
        str.substring(4, 6),
        str.substring(6, 8),
        str.substring(8, 10),
        str.substring(10, 12),
        str.substring(12, 14)
    ];

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export const getTestTypeText = (value: string) => {
    const matchingOption = testType.find(option => option.value === value);
    return matchingOption ? matchingOption.text : '';
};

export const getBarcodeImageUrl = (imageName: string, pbiaRootPath: string, slotId: string, barcodeDirName: string): string => {
    const baseUrl = process.env.APP_API_BASE_URL;
    return `${baseUrl}/images?folder=${pbiaRootPath + "/" + slotId + "/" + barcodeDirName + "/"}&imageName=${imageName}`;
}
