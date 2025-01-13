import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const fileSysPost = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.post, request, '');
};

export const fileSysCopy = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.copy, request, '');
};

export const fileSysClean = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.cleanup, request, '');
};

export const fileSysExistsFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.existsFile, request, '');
};
export const  fileSearchApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.fileSearch, `${request}`, true);
};
export const deleteRunningApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.filesystem.delete, request, false);
};

export const  createDirectory = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.createDirectory, `${request}`, true);
};

export const  fileReadJpg = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.readGetJpg, `${request}`, true);
};

export const createFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.fileCreate, request, '');
};

export const createCbcFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.cbcSaveData, request, '');
};

export const getFolders = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.settings.folders.get, `${request}`, true);
};

export const errLogsReadApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.errLogsRead, `${request}`, true);
};

    export const readAllErrorLogsApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.readAllErrorLogs, request, true);
}