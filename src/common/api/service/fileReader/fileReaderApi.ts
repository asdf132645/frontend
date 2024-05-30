import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const readJsonFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.jsonReader.get, request);
};

export const pdfPost = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.pdf.post, request, 'blob');
};

export const readFileTxt = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.fileTxtRead.get, `${request}`, true);
};

export const readH7File = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.H7Read.post, request, 'text/plain');
};