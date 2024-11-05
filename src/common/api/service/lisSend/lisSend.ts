import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const ywmcLisPostSendApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.lisSend.ywmcLisPostSend, request);
}

export const ywmcCbcCheckApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.lisSend.ywmcCbcCheck, `${request}`, true);
};

export const ywmcLisCrcSendApi = async (req: any ): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.lisSend.ywmcLisCrcSend, req);
};