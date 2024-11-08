export const isMasterId = (userId: string) => 'UIMD' === userId.toUpperCase() || 'uimd' === userId.toLowerCase();

export const isObjectEmpty = <T extends object | undefined | null>(object: T) => {
    if (object === null || object === undefined) return true;
    return Object.keys(object).length === 0;
}