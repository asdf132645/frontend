import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";

const httpClient = useHttpClient();

export const fileSysPost = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.post, request, '', false, window.LINUX_SERVER_SET );
};

export const fileSysCopy = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.copy, request, '', false, window.LINUX_SERVER_SET );
};

export const fileSysClean = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.cleanup, request, '', false, window.LINUX_SERVER_SET );
};

export const fileSysExistsFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.existsFile, request, '', false, window.LINUX_SERVER_SET );
};
export const fileSearchApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.fileSearch, `${request}`, true, window.LINUX_SERVER_SET );
};
export const deleteRunningApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.filesystem.delete, request, false, window.LINUX_SERVER_SET );
};

export const createDirectory = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.createDirectory, `${request}`, true, window.LINUX_SERVER_SET );
};

export const fileReadJpg = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.readGetJpg, `${request}`, true, window.LINUX_SERVER_SET );
};

export const createFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.fileCreate, request, '', false, window.LINUX_SERVER_SET );
};

export const createCbcFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.cbcSaveData, request, '', false, window.LINUX_SERVER_SET );
};

export const getFolders = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.settings.folders.get, `${request}`, true, window.LINUX_SERVER_SET );
};

export const errLogsReadApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.errLogsRead, `${request}`, true, window.LINUX_SERVER_SET );
};

export const readAllErrorLogsApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.filesystem.readAllErrorLogs, request, true, window.LINUX_SERVER_SET );
}