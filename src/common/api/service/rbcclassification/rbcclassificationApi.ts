
import { useHttpClient, ApiResponse } from '@/common/api/httpClient';
import { apiConstants } from '@/common/api/apiConstants';

const httpClient = useHttpClient();

export const getAllRbc = async (): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.rbcclassification.list, '');
};
