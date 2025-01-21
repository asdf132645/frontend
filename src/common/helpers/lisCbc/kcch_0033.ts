import { htmlToRtfApi, rtfSendApi } from "@/common/api/service/lisSend/lisSend";

interface CRCArrType {
    crcCode: string | null;
    crcCodeMatching: string | null;
    crcContent: string;
    crcPercentText: string;
    crcTitle: string;
    crcType: string;
    id: number;
    morphologyType: 'RBC' | 'WBC' | 'PLT';
    val?: string;
}

export const kcch_0033LisSend = async (nowCrcData: HTMLDivElement) => {
    try {
        const result = await rtfSendApi(nowCrcData);
        console.log('0033 send result', result);
    } catch (error) {
        console.error(error);
    }
}

export const kcch_0033RTFConvert = async (htmlData: HTMLElement) => {
    try {
        const requestHTMLData = htmlData.innerHTML;
        const result = await htmlToRtfApi(requestHTMLData);
        if (result?.success && result?.data) {
            return result.data;
        }
        return undefined;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

export const changeMorphologyText = () => {
    // LIS CODE를 넘겨야 함
}

export const changeRemark = (crcArr: CRCArrType[], remarkList: any) => {
    const defaultRemark: any = [
        { moType: 'RBC', content: [] },
        { moType: 'WBC', content: [] },
        { moType: 'PLT', content: [] },
    ];

    const remarkContentArr = crcArr
        .map((crcItem) =>
            kcchCbcCommentAutoMatching({
                moType: crcItem?.morphologyType,
                title: crcItem?.crcTitle,
                val: crcItem?.val,
            })
        )
        .filter(Boolean);

    const updatedRemark = defaultRemark.map((remarkItem: any) => {
        const matchedContents = remarkContentArr
            .filter((remarkContentItem: any) => remarkContentItem.moType === remarkItem.moType)
            .map((remarkContentItem: any) => remarkContentItem.value);

        return {
            ...remarkItem,
            content: [...remarkItem.content, ...matchedContents],
        };
    });

    for (const remarkItem of updatedRemark) {
        if (remarkItem.content.length > 0) {
            remarkList.push({
                code: '',
                remarkContent: '',
                remarkAllContent: `${remarkItem.moType}: ${remarkItem.content.join(', ')}`
            })
        }
    }
}

export const kcchCbcCommentAutoMatching = ({ moType, title, val }: { moType: string; title: string; val?: string }) => {
    const MAP_CBC_COMMENTS = [
        { moType: 'RBC', title: 'SIZE', content: 'Microcytic', value: 'Microcytic' },
        { moType: 'RBC', title: 'SIZE', content: 'Macrocytic', value: 'Macrocytic' },
        { moType: 'RBC', title: 'Anisocytosis', content: '유', value: 'anemia with anisocytosis' },
        { moType: 'RBC', title: 'chromicity', content: 'Hypochromic', value: 'hypochromic' },
        { moType: 'RBC', title: 'chromicity', content: 'Hyperchromic', value: 'hyperchromic' },
        { moType: 'RBC', title: '', content: 'Erythrocytosis', value: 'erythrocytosis' },
        { moType: 'WBC', title: '', content: 'Neutrophillia', value: 'Neutrophillia' },
        { moType: 'WBC', title: '', content: 'Neutropenia', value: 'Neutropenia' },
        { moType: 'WBC', title: '', content: 'Lymphocytosis', value: 'Lymphocytosis' },
        { moType: 'WBC', title: '', content: 'Lymphocytopenia', value: 'Lymphocytopenia' },
        { moType: 'WBC', title: '', content: 'Monocytosis', value: 'Monocytosis' },
        { moType: 'WBC', title: '', content: 'Eosinophillia', value: 'Eosinophillia' },
        { moType: 'WBC', title: '', content: 'Basophillia', value: 'Basophillia' },
        { moType: 'WBC', title: 'Number', content: 'slightly decreased', value: 'Slightly decreased' },
        { moType: 'PLT', title: 'Number', content: 'slightly decreased', value: 'Slightly decreased' },
        { moType: 'WBC', title: 'Number', content: 'moderately decreased', value: 'Moderately decreased' },
        { moType: 'PLT', title: 'Number', content: 'moderately decreased', value: 'Moderately decreased' },
        { moType: 'WBC', title: 'Number', content: 'markedly decreased', value: 'Markedly decreased' },
        { moType: 'PLT', title: 'Number', content: 'markedly decreased', value: 'Markedly decreased' },
        { moType: 'WBC', title: 'Number', content: 'slightly increased', value: 'Slightly increased' },
        { moType: 'PLT', title: 'Number', content: 'slightly increased', value: 'Slightly increased' },
        { moType: 'WBC', title: 'Number', content: 'moderately increased', value: 'Moderately increased' },
        { moType: 'PLT', title: 'Number', content: 'moderately increased', value: 'Moderately increased' },
        { moType: 'WBC', title: 'Number', content: 'markedly increased', value: 'Markedly increased' },
        { moType: 'PLT', title: 'Number', content: 'markedly increased', value: 'Markedly increased' },
    ]

    return MAP_CBC_COMMENTS.find((item) => {
        if (item.moType === moType && item.title === title && item.content === val) return item.value;
    })
}