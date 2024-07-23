import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const getBrowserExit = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.browser.exit);
}
