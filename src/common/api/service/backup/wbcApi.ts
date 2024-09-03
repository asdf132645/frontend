import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const backUpDateApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.download.backUpDate, request);
};

export const downloadPossibleApi = async (request: any): Promise<ApiResponse<any>> => {
    return httpClient.httpPost(apiConstants.download.checkIsPossibleToBackup, request);
}

export const openDriveApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.download.openDrive, request);
}

export const uploadBackupApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.upload.restoreData, request);
}

export const uploadPossibleApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.upload.checkDuplicated, request);
}

export const checkDownloadDataMovedApi = async (): Promise<ApiResponse<number>> => {
    return httpClient.httpGet(apiConstants.download.checkDataMoved);
}

export const checkUploadDataMovedApi = async (): Promise<ApiResponse<number>> => {
    return httpClient.httpGet(apiConstants.upload.checkDataMoved);
}

export const checkPossibleUploadFileApi = async (request: any): Promise<ApiResponse<any>> => {
    return httpClient.httpPost(apiConstants.upload.checkPossibleUploadFile, request);
}