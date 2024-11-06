import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const getBrowserExit = async (request: any): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.browser.exit, `${request}`, true);
}

export const nodeExit = async (request: any): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.browser.nodeExit, `${request}`, true);
}
