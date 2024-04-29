import {apiConstants} from "@/common/api/apiConstants";
import {useHttpClient, ApiResponse} from '@/common/api/httpClient';
import {RuningInfo, RuningInfoApiRequest, RunningInfoRes} from "@/common/api/service/runningInfo/dto/runningInfoDto";
const httpClient = useHttpClient();

export const createRunningApi = async (request: { userId: number; runingInfoDtoItems: RuningInfo }): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.runningInfo.create, request);
};

export const updateRunningApi = async (request: { userId: number; runingInfoDtoItems: any }): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.settings.runningInfo.update, request, '',true);
};

export const getRunningApi = async (req: RuningInfoApiRequest): Promise<ApiResponse<RunningInfoRes | undefined>> => {
    const queryString = Object.entries(req)
        .filter(([key, value]) => value !== undefined)  // undefined 값은 제외
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

    return httpClient.httpGet(apiConstants.settings.runningInfo.get,`${queryString}`, true);
};

export const deleteRunningApi = async (ids: string[]): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.settings.runningInfo.delete, ids, false);
};


export const detailRunningApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.detail, `${request}`, false);
};

