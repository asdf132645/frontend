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
import {CreateNormalRange, NormalRangeUpdateDto} from "@/common/api/service/setting/dto/normalRangeDto";
import {
    CreateImagePrintDto, ImagePrintItem,
    UpdateImagePrintsDto
} from "@/common/api/service/setting/dto/imagePrintDto";
import {
    CreateCbcCodeRbcDto,
    CreateLisCodeDto,
    CreateLisCodeRbcDto, cbcCodeItem,
    LisCodeRbcItem, LisCodeWbcItem, UpdateCbcCodeRbcDto,
    UpdateLisCodeDto, UpdateLisCodeRbcDto
} from "@/common/api/service/setting/dto/lisCodeDto";
import {CreateFilePathDto, FilePathItem, UpdateFilePathsDto} from "@/common/api/service/setting/dto/filePathSetDto";
import {CreateRunCountDto, runCountItem, UpdateRunCountDto} from "@/common/api/service/setting/dto/runWbcInfoCountDto";
import {CreateMinCountDto, minCountItem, UpdateMinCountDto} from "@/common/api/service/setting/dto/minCountDto";

const httpClient = useHttpClient();

export const createCellImgApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.cellImgAnalyzedPost.cellImgAdd, request);
};

export const getCellImgApi = async (userId: string): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.cellImgAnalyzedPost.cellImgGet, userId);
};

export const putCellImgApi = async (request: any, id: string): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.cellImgAnalyzedPost.cellImgPut, request, id);
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

export const updateWbcCustomClassApi = async (request: UpdateWbcCustomClassDto): Promise<ApiResponse<UpdateWbcCustomClassDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.wbcCustomClass.update, request);
};

export const getWbcCustomClassApi = async (): Promise<ApiResponse<CreateWbcCustomClassDto | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.wbcCustomClass.get);
};


export const createWbcHotKeysApi = async (request: CreateWbcHotKeysDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.wbcHotKeys.create, request);
};

export const updateWbcHotKeysApi = async (request: UpdateWbcHotKeysDto): Promise<ApiResponse<UpdateWbcHotKeysDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.wbcHotKeys.update, request);
};

export const getWbcWbcHotKeysApi = async (): Promise<ApiResponse<CreateWbcHotKeysDto | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.wbcHotKeys.get);
};


export const createBfHotKeysApi = async (request: CreateBfHotKeysDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.bfHotKeys.create, request);
};

export const updateBfHotKeysApi = async (request: UpdateBfHotKeysDto): Promise<ApiResponse<UpdateBfHotKeysDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.bfHotKeys.update, request);
};

export const getBfHotKeysApi = async (): Promise<ApiResponse<CreateBfHotKeysDto | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.bfHotKeys.get);
};

export const createNormalRangeApi = async (request: CreateNormalRange): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.normalRange.create, request);
};

export const updateNormalRangeApi = async (request: NormalRangeUpdateDto): Promise<ApiResponse<NormalRangeUpdateDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.normalRange.update, request);
};

export const getNormalRangeApi = async (): Promise<ApiResponse<CreateNormalRange | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.normalRange.get);
};

export const createImagePrintApi = async (request: CreateImagePrintDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.imagePrint.create, request);
};

export const updateImagePrintApi = async (request: UpdateImagePrintsDto): Promise<ApiResponse<UpdateImagePrintsDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.imagePrint.update, request);
};

export const getImagePrintApi = async (): Promise<ApiResponse<ImagePrintItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.imagePrint.get);
};

export const createLisCodeApi = async (request: CreateLisCodeDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.lisCode.create, request);
};

export const updateLisCodeApi = async (request: UpdateLisCodeDto, userId: string): Promise<ApiResponse<UpdateLisCodeDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.lisCode.update, request, userId);
};

export const getLisCodeApi = async (userId: string): Promise<ApiResponse<LisCodeWbcItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.lisCode.get, userId);
};

//lise code rbc
export const createLisCodeRbcApi = async (request: CreateLisCodeRbcDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.lisCodeRbc.create, request);
};

export const updateLisCodeRbcApi = async (request: UpdateLisCodeRbcDto, userId: string): Promise<ApiResponse<UpdateLisCodeRbcDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.lisCodeRbc.update, request, userId);
};

export const getLisCodeRbcApi = async (userId: string): Promise<ApiResponse<LisCodeRbcItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.lisCodeRbc.get, userId);
};

// cbc code
export const createCbcCodeRbcApi = async (request: CreateCbcCodeRbcDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.cbcCode.create, request);
};

export const updateCbcCodeRbcApi = async (request: UpdateCbcCodeRbcDto): Promise<ApiResponse<UpdateCbcCodeRbcDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.cbcCode.update, request);
};

export const getCbcCodeRbcApi = async (): Promise<ApiResponse<cbcCodeItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.cbcCode.get);
};
// file path set
export const createFilePathSetApi = async (request: CreateFilePathDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.filePathSet.create, request);
};

export const updateFilePathSetApi = async (request: UpdateFilePathsDto): Promise<ApiResponse<UpdateFilePathsDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.filePathSet.update, request);
};

export const getFilePathSetApi = async (): Promise<ApiResponse<FilePathItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.filePathSet.get);
};

// minCount, runInfoWbcCount
export const createRunInfoWbcApi = async (request: CreateRunCountDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.runCount.create, request);
};

export const updateRunInfoApi = async (request: UpdateRunCountDto, userId: string): Promise<ApiResponse<UpdateRunCountDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.runCount.update, request, userId);
};

export const getRunInfoApi = async (userId: string): Promise<ApiResponse<runCountItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.runCount.get, userId);
};
// -----mincount
export const createMinCountApi = async (request: CreateMinCountDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.minCount.create, request);
};

export const updateMinCountApi = async (request: UpdateMinCountDto): Promise<ApiResponse<UpdateMinCountDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.minCount.update, request);
};

export const getMinCountApi = async (): Promise<ApiResponse<minCountItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.minCount.get);
};

// --- 드라이브
export const getDrivesApi = async (): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.folder.get, '');
};

//-- 클래스 정렬
export const createOrderClassApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.classOrder.create, request);
};

export const getOrderClassApi = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.settings.classOrder.get);
};

export const putOrderClassApi = async (request: any, userName: string): Promise<ApiResponse<any>> => {
    return httpClient.httpPut(apiConstants.settings.classOrder.update, request, userName);
};