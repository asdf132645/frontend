import { HOSPITAL_SITE_CD_BY_NAME, HospitalSiteCodesType } from "@/common/defines/constants/siteCd";

export const getCrcContentMaxLength = (siteCd: HospitalSiteCodesType, type: 'remark' | 'comment' | 'recommendation') => {
    switch (siteCd) {
        case HOSPITAL_SITE_CD_BY_NAME['원주기독병원']:
            if (type === 'remark') return 60;
            if (type === 'comment') return 1000;
            if (type === 'recommendation') return 1000;
            return 1000;
        default:
            return 1000;
    }
}

export const setCrcTitles = (siteCd: HospitalSiteCodesType, title: string) => {
    return title.slice(0, 1).toUpperCase() + title.slice(1).toLowerCase();
}