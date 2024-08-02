import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const backUpDate = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.backUp.backUpDate, request);
};

export const restoreBackup = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.restore.restoreData, request);
}