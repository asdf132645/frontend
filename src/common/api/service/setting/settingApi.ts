import {useHttpClient, ApiResponse} from '@/common/api/httpClient';
import {apiConstants} from '@/common/api/apiConstants';
import {
    CellImgAnalyzedRequest,
    CellImgAnalyzedResponse,
} from '@/common/api/service/setting/dto/cellImgAnalyzedDto'
import {RbcDegreeDto, RbcDegreeRes} from "@/common/api/service/setting/dto/rbcDegree";

const httpClient = useHttpClient();

export const createCellImg = async (request: CellImgAnalyzedRequest): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.cellImgAnalyzedPost.cellImgAdd, request);
};

export const getCellImg = async (userId: string): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.cellImgAnalyzedPost.cellImgGetPut, userId);
};

export const putCellImg = async (request: CellImgAnalyzedRequest, id: string): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.cellImgAnalyzedPost.cellImgGetPut, request, id);
};

export const createRbcDegree = async (request: RbcDegreeDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.rbcDegree.rbcDegreeAdd, request);
};

export const putRbcDegree = async (request: CellImgAnalyzedRequest, id: string): Promise<ApiResponse<RbcDegreeRes | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.rbcDegree.rbcDegree, request, id);
};

export const getRbcDegree = async (userId: string): Promise<ApiResponse<RbcDegreeRes | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.rbcDegree.rbcDegree, userId);
};