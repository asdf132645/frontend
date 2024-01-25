
import { useHttpClient, ApiResponse } from '@/common/api/httpClient';
import { ProcessInfo } from '@/common/api/service/processinfo/dto/processinfoDto';
import { apiConstants } from '@/common/api/apiConstants';

// Create an instance of the http client
const httpClient = useHttpClient();

export const getProcessInfo = async (): Promise<ApiResponse<void>> => {
    // Use the httpGet function directly from the httpClient instance
    return httpClient.httpGet(apiConstants.processInfo.list, '');
};
