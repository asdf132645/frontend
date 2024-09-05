import {apiConstants} from "@/common/api/apiConstants";
import {useHttpClient, ApiResponse} from '@/common/api/httpClient';
import { RuningInfoApiRequest } from "@/common/api/service/runningInfo/dto/runningInfoDto";
const httpClient = useHttpClient();

export const createRunningApi = async (request: { userId: number; runingInfoDtoItems: any }): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.runningInfo.create, request);
};

export const updateRunningApi = async (request: { userId: number; runingInfoDtoItems: any, dayQuery: any }): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.settings.runningInfo.update, request, '',true);
};

export const jsonCreatePost = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.jsonReader.jsonCreate, request, '', true);
};

export const getRunningApi = async (req: RuningInfoApiRequest): Promise<ApiResponse<any | undefined>> => {
    const queryString = Object.entries(req)
        .filter(([key, value]) => value !== undefined)  // undefined 값은 제외
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

    return httpClient.httpGet(apiConstants.settings.runningInfo.get,`${queryString}`, true);
};

export const deleteRunningApi = async (req: any): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.settings.runningInfo.delete, req, true);
};

export const detailRunningApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.detail, `${request}`, false);
};

export const classInfoDetailApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.classInfoDetail, `${request}`, false);
};

export const classInfoDetailSelectQueryApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.classInfoDetailSelectQuery, `${request}`, false);
};

export const classInfoMenuDetailSelectQueryApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.classInfoMenuDetailSelectQuery, `${request}`, false);
};

export const pageUpDownRunnIngApi = async (req: any): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.pageUpDown, `${req}`, true)
}

export const updatePcIpStateApi = async (req: any): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.updatePcIpState, `${req}`, true);
}

export const clearPcIpState = async (req: any): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.clearPcIpState, `${req}`, true)
}

export const removePageAllDataApi = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.removePageAllData, ``, true)
}