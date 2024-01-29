
import { useHttpClient, ApiResponse } from '@/common/api/httpClient';
import { apiConstants } from '@/common/api/apiConstants';

const httpClient = useHttpClient();

export const getAllWbc = async (): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.wbcclassification.list, '');
};
