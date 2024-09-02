import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const fileSysPost = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.filesystem.post, request, '');
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
