import {useHttpClient, ApiResponse} from '@/common/api/httpClient';
import {apiConstants} from '@/common/api/apiConstants';
import {
    CellImgAnalyzedRequest,
    CellImgAnalyzedResponse,
} from '@/common/api/service/setting/dto/cellImgAnalyzedDto'
import {RbcDegreeDto, RbcDegreeRes} from "@/common/api/service/setting/dto/rbcDegree";
import {CreateWbcCustomClassDto, UpdateWbcCustomClassDto} from "@/common/api/service/setting/dto/wbcCustomClassDto";
import {CreateWbcHotKeysDto, UpdateWbcHotKeysDto} from "@/common/api/service/setting/dto/wbcHotKeysDto";
import {CreateBfHotKeysDto, UpdateBfHotKeysDto} from "@/common/api/service/setting/dto/bfHotKeysDto";
import {CreateNormalRange, NormalRangeUpdateDto } from "@/common/api/service/setting/dto/normalRangeDto";
import {
    CreateImagePrintDto, ImagePrintItem,
    ImagePrintResDto,
    UpdateImagePrintsDto
} from "@/common/api/service/setting/dto/imagePrintDto";

const httpClient = useHttpClient();

export const createCellImgApi = async (request: CellImgAnalyzedRequest): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.cellImgAnalyzedPost.cellImgAdd, request);
};

export const getCellImgApi = async (userId: string): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.cellImgAnalyzedPost.cellImgGetPut, userId);
};

export const putCellImgApi = async (request: CellImgAnalyzedRequest, id: string): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.cellImgAnalyzedPost.cellImgGetPut, request, id);
};

export const createRbcDegreeApi = async (request: RbcDegreeDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.rbcDegree.rbcDegreeAdd, request);
};

export const putRbcDegreeApi = async (request: CellImgAnalyzedRequest, id: string): Promise<ApiResponse<RbcDegreeRes | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.rbcDegree.rbcDegree, request, id);
};

export const getRbcDegreeApi = async (userId: string): Promise<ApiResponse<RbcDegreeRes | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.rbcDegree.rbcDegree, userId);
};


export const createWbcCustomClassApi = async (request: CreateWbcCustomClassDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.wbcCustomClass.create, request);
};

export const updateWbcCustomClassApi = async (request: UpdateWbcCustomClassDto, userId: string): Promise<ApiResponse<UpdateWbcCustomClassDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.wbcCustomClass.update, request, userId);
};

export const getWbcCustomClassApi = async (userId: string): Promise<ApiResponse<CreateWbcCustomClassDto | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.wbcCustomClass.get, userId);
};


export const createWbcHotKeysApi = async (request: CreateWbcHotKeysDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.wbcHotKeys.create, request);
};

export const updateWbcHotKeysApi = async (request: UpdateWbcHotKeysDto, userId: string): Promise<ApiResponse<UpdateWbcHotKeysDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.wbcHotKeys.update, request, userId);
};

export const getWbcWbcHotKeysApi = async (userId: string): Promise<ApiResponse<CreateWbcHotKeysDto | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.wbcHotKeys.get, userId);
};


export const createBfHotKeysApi = async (request: CreateBfHotKeysDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.bfHotKeys.create, request);
};

export const updateBfHotKeysApi = async (request: UpdateBfHotKeysDto, userId: string): Promise<ApiResponse<UpdateBfHotKeysDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.bfHotKeys.update, request, userId);
};

export const getBfHotKeysApi = async (userId: string): Promise<ApiResponse<CreateBfHotKeysDto | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.bfHotKeys.get, userId);
};

export const createNormalRangeApi = async (request: CreateNormalRange): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.normalRange.create, request);
};

export const updateBfNormalRangeApi = async (request: NormalRangeUpdateDto, userId: string): Promise<ApiResponse<NormalRangeUpdateDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.normalRange.update, request, userId);
};

export const getNormalRangeApi = async (userId: string): Promise<ApiResponse<CreateNormalRange | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.normalRange.get, userId);
};

export const createImagePrintApi = async (request: CreateImagePrintDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.imagePrint.create, request);
};

export const updateImagePrintApi = async (request: UpdateImagePrintsDto, userId: string): Promise<ApiResponse<UpdateImagePrintsDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.imagePrint.update, request, userId);
};

export const getImagePrintApi = async (userId: string): Promise<ApiResponse<ImagePrintItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.imagePrint.get, userId);
};