import { ApiResponse, useHttpClient } from "@/common/api/httpClient";
import { apiConstants } from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const executeExcelCreate = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.excel.execute, request);
}