import { commonCodeList } from '@/common/defines/constFile/commonCodeList';
interface CommonCode {
    grpCd: string;
    cd: string;
}

export const getCommonCode = (grpCd: string, cd: string): CommonCode | undefined => {
    return commonCodeList.find((code) => code.grpCd === grpCd && code.cd === cd);
};


