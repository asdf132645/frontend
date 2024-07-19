import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const readJsonFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.jsonReader.get, request, '', false, sessionStorage.getItem('viewerCheck') || 'viewer');
};

export const readDziFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.dziReader.get, request);
}

export const pdfPost = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.pdf.post, request, 'blob');
};

export const readFileTxt = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.fileTxtRead.get, `${request}`, true);
};

export const readH7File = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.H7Read.post, request, 'text/plain', false, sessionStorage.getItem('viewerCheck') || 'viewer');
};

export const readH7Message = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.H7Message.post, request, '', false, sessionStorage.getItem('viewerCheck') || 'viewer');
};

export const createH17 = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.Hl7Create.post, request);
};