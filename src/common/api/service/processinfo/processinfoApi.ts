
import { useHttpClient, ApiResponse } from '@/common/api/httpClient';
import { apiConstants } from '@/common/api/apiConstants';

// Create an instance of the http client
const httpClient = useHttpClient();

export const getProcessInfo = async (): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.processInfo.list, '');
};
