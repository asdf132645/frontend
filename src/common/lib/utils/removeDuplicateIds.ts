export const removeDuplicatesById = (items: any) => {
    const seenIds = new Set();
    return items.filter((item: any) => {
        if (!seenIds.has(item.id)) {
            seenIds.add(String(item.id));
            return true;
        }
        return false;
    });
};