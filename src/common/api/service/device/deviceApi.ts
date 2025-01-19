import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const createDeviceInfoApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.device.getDeviceInfo.create, request, '', false, false);
}

export const getDeviceInfoApi = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.device.getDeviceInfo.get,'', false, false);
}

export const putDeviceInfoApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.device.updateDeviceInfo, request);
}

export const getDeviceIpApi = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.device.getDeviceInfo.ip);
}