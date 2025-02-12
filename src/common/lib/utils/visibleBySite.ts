export const visibleBySite = (siteCd: string, allowSiteCd: string[], allow: 'enable' | 'disable') => {
    if (allow === 'disable') {
        return !allowSiteCd.includes(siteCd);
    } else if (allow === 'enable') {
        return allowSiteCd.includes(siteCd);
    }
}