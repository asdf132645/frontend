import { HospitalSiteCodesType } from "@/common/defines/constants/siteCd";

export const setCrcTitles = (siteCd: HospitalSiteCodesType, title: string) => {
    return title.slice(0, 1).toUpperCase() + title.slice(1).toLowerCase();
}