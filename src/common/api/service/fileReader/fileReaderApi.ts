import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const readJsonFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.jsonReader.get, request);
};

export const pdfPost = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.pdf.post, request, 'blob');
};

export const detailRunningApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.settings.runningInfo.detail, `${request}`, false);
};