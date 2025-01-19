import {ApiResponse, useHttpClient} from "@/common/api/httpClient";
import {apiConstants} from "@/common/api/apiConstants";
const httpClient = useHttpClient();

export const readJsonFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.jsonReader.get, request, '', false, window.LINUX_SERVER_SET );
};

export const readDziFile = async (request: any): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpPost(apiConstants.dziReader.get, request);
}


export const readFileTxt = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.fileTxtRead.get, `${request}`, window.LINUX_SERVER_SET );
};

export const readFileEUCKR = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.fileTxtRead.readFileEUCKR, `${request}`, window.LINUX_SERVER_SET );
};

export const readH7File = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.H7Read.post, request, 'text/plain', false, window.LINUX_SERVER_SET );
};

export const readH7Message = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.H7Message.post, request, '', false, window.LINUX_SERVER_SET );
};

export const readNoFlagHl7Message = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.H7Message.noFlagHl7, request, '', false, window.LINUX_SERVER_SET );
}

export const readCustomH7Message = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.H7MessageCustom.post, request, '', false, window.LINUX_SERVER_SET );
};

export const createH17 = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.Hl7Create.post, request, '', false, window.LINUX_SERVER_SET );
};