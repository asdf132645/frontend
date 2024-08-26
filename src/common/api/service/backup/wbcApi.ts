import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const backUpDate = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.backUp.backUpDate, request);
};

export const backupPossibleApi = async (request: any): Promise<ApiResponse<string>> => {
    return httpClient.httpPost(apiConstants.backUp.checkIsPossibleToBackup, request);
}

export const restoreBackup = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.restore.restoreData, request);
}

export const checkDuplicatedData = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.restore.checkDuplicated, request);
}