

export const calculateWbcPercentages = (
    classList: any[],
    siteCd: any
) => {
    const includesStr = siteCd === '0006' ? ["AR", "NR", "GP", "PA", "MC", "MA", "SM"]:["AR", "NR", "GP", "PA", "MC", "MA"];
    const total = classList
        .filter(
            (category) =>
                !includesStr.includes(category.title)
        )
        .reduce((acc, category) => {
            const matchingWbcItem = classList.find(
                (wbcItem) => category.id === wbcItem.id
            );

            if (matchingWbcItem) {
                category.count = matchingWbcItem.count;
                return acc + Number(matchingWbcItem.count);
            }

            return acc;
        }, 0);

    return total;
};