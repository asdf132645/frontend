import {apiConstants} from "@/common/api/apiConstants";
import {useHttpClient, ApiResponse} from '@/common/api/httpClient';
import {RuningInfo} from "@/common/api/service/runningInfo/dto/runningInfoDto";
const httpClient = useHttpClient();

export const createRunningApi = async (request: { userId: number; runingInfoDtoItems: RuningInfo }): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.runningInfo.create, request);
};

export const updateRunningApi = async (request: RuningInfo, userId: string): Promise<ApiResponse<RuningInfo | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.runningInfo.update, request, userId);
};

export const getRunningApi = async (userId: string): Promise<ApiResponse<RuningInfo | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.get, userId);
};