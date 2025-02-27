import {ApiResponse, useHttpClient} from '@/common/api/httpClient';
import {apiConstants} from '@/common/api/apiConstants';
const httpClient = useHttpClient();

export const autoCbcCreateApi = async (request: any): Promise<ApiResponse<any>> => {
    return httpClient.httpPost(apiConstants.report.autoCbcCreate, request);
}

export const findAutoCbcApi = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.report.findAutoCbc, ``, true, false)
}

export const autoCbcPutApi = async (request: any): Promise<ApiResponse<any>> => {
    return httpClient.httpPut(apiConstants.report.autoCbcPut, request, '',true);
}

export const autoCbcDelApi = async (request: any): Promise<ApiResponse<any>> => {
    return httpClient.httpDelete(apiConstants.report.autoCbcDel, request, false, window.LINUX_SERVER_SET);
}

export const autoCbcUpdateAllApi = async (request: any): Promise<ApiResponse<any>> => {
    return httpClient.httpPost(apiConstants.report.autoCbcUpdateAll, request, '',false);
}