import {useHttpClient, ApiResponse} from '@/common/api/httpClient';
import {apiConstants} from '@/common/api/apiConstants';
import { CellImgAnalyzedResponse } from '@/common/api/service/setting/dto/cellImgAnalyzedDto'
import { RbcDegreeRequest, RbcDegreeResponse } from "@/common/api/service/setting/dto/rbcDegree";
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
    CreateLisCodeRbcDto, CbcCodeItem,
    LisCodeRbcItem, LisCodeWbcItem, UpdateCbcCodeRbcDto,
    UpdateLisCodeDto, UpdateLisCodeRbcDto
} from "@/common/api/service/setting/dto/lisCodeDto";
import {CreateFilePathDto, FilePathItem, UpdateFilePathsDto} from "@/common/api/service/setting/dto/filePathSetDto";
import {CreateRunCountDto, runCountItem, UpdateRunCountDto} from "@/common/api/service/setting/dto/runWbcInfoCountDto";
import {CreateMinCountDto, minCountItem, UpdateMinCountDto} from "@/common/api/service/setting/dto/minCountDto";
import {ClassOrderRequest, ClassOrderResponse} from "@/common/api/service/setting/dto/classOrder";

const httpClient = useHttpClient();

export const createCellImgApi = async (request: any): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpPost(apiConstants.settings.cellImgAnalyzedPost.cellImgAdd, request);
};

export const getCellImgApi = async (): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.cellImgAnalyzedPost.cellImgGet);
};

export const getCellImgByIdApi = async (request: string): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.cellImgAnalyzedPost.cellImgGetById, request);
};

export const getCellImgAllApi = async (): Promise<ApiResponse<CellImgAnalyzedResponse[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.cellImgAnalyzedPost.cellImgGetAll);
}

export const putCellImgApi = async (request: any, id: string): Promise<ApiResponse<CellImgAnalyzedResponse | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.cellImgAnalyzedPost.cellImgPut, request, id);
};

export const deleteCellImgApi = async (request: { id: string }): Promise<ApiResponse<boolean | undefined>> => {
    return httpClient.httpDelete(apiConstants.settings.cellImgAnalyzedPost.cellImgDelete, request);
}

export const createRbcDegreeApi = async (request: RbcDegreeRequest[]): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.rbcDegree.rbcDegreeAdd, request);
};

export const putRbcDegreeApi = async (request: RbcDegreeRequest[]): Promise<ApiResponse<RbcDegreeResponse | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.rbcDegree.rbcDegree, request);
};

export const getRbcDegreeApi = async (): Promise<ApiResponse<RbcDegreeResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.rbcDegree.rbcDegree);
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

export const getWbcHotKeysApi = async (): Promise<ApiResponse<CreateWbcHotKeysDto | undefined>> => {
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

// lisCbc code wbc
export const createLisCodeWbcApi = async (request: CreateLisCodeDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.lisCode.create, request);
};

export const updateLisCodeWbcApi = async (request: UpdateLisCodeDto): Promise<ApiResponse<UpdateLisCodeDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.lisCode.update, request);
};

export const getLisCodeWbcApi = async (): Promise<ApiResponse<LisCodeWbcItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.lisCode.get);
};

//lise code rbc
export const createLisCodeRbcApi = async (request: CreateLisCodeRbcDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.lisCodeRbc.create, request);
};

export const updateLisCodeRbcApi = async (request: UpdateLisCodeRbcDto): Promise<ApiResponse<UpdateLisCodeRbcDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.lisCodeRbc.update, request);
};

export const getLisCodeRbcApi = async (): Promise<ApiResponse<LisCodeRbcItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.lisCodeRbc.get);
};

// cbc code
export const createCbcCodeRbcApi = async (request: CreateCbcCodeRbcDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.cbcCode.create, request);
};

export const updateCbcCodeRbcApi = async (request: UpdateCbcCodeRbcDto): Promise<ApiResponse<UpdateCbcCodeRbcDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.cbcCode.update, request);
};

export const getCbcCodeRbcApi = async (): Promise<ApiResponse<CbcCodeItem[] | undefined>> => {
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

// runInfoWbcCount
export const createRunInfoWbcApi = async (request: CreateRunCountDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.runCount.create, request);
};

export const updateRunInfoApi = async (request: UpdateRunCountDto): Promise<ApiResponse<UpdateRunCountDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.runCount.update, request);
};

export const getRunInfoApi = async (): Promise<ApiResponse<runCountItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.runCount.get);
};
// minCount
export const createMinCountApi = async (request: CreateMinCountDto): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.minCount.create, request);
};

export const updateMinCountApi = async (request: UpdateMinCountDto): Promise<ApiResponse<UpdateMinCountDto | undefined>> => {
    return httpClient.httpPut(apiConstants.settings.minCount.update, request);
};

export const getMinCountApi = async (): Promise<ApiResponse<minCountItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.minCount.get);
};

export const getLisCodeApi = async (): Promise<ApiResponse<LisCodeWbcItem[] | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.lisCode.get);
};

// --- 드라이브
export const getDrivesApi = async (): Promise<ApiResponse<any | undefined>> => {
    return httpClient.httpGet(apiConstants.settings.folder.get);
};

//-- 클래스 정렬
export const createOrderClassApi = async (request: ClassOrderRequest[]): Promise<ApiResponse<ClassOrderResponse>> => {
    return httpClient.httpPost(apiConstants.settings.classOrder.create, request);
};

export const getOrderClassApi = async (): Promise<ApiResponse<ClassOrderResponse[]>> => {
    return httpClient.httpGet(apiConstants.settings.classOrder.get);
};

export const putOrderClassApi = async (request: ClassOrderRequest): Promise<ApiResponse<ClassOrderResponse[]>> => {
    return httpClient.httpPut(apiConstants.settings.classOrder.update, request);
};

// remaining Count
export const remainingCount = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.settings.remainingCount.get);
};

export const qualityCheck = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.settings.qualityCheck.get);
};

export const createCrcApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.settings.crc.crcSettingCreate, request);
};

export const updateCrcApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.settings.crc.crcPut, request);
};

export const crcGet = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.settings.crc.crcGet);
};

export const deleteCrcApi = async (req: any): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.settings.crc.crcDel, req, true);
};

export const createCrcRemarkApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.report.crcRemarkCreate, request);
};
export const crcRemarkGet = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.report.crcRemarkFindAll);
};

export const crcSearchGet = async (request: { code?: string; remarkAllContent?: string }): Promise<ApiResponse<any>> => {
    const queryString = Object.entries(request)
        .filter(([key, value]) => value !== undefined)  // undefined 값은 제외
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');


    return httpClient.httpGet(apiConstants.report.crcSearch, `${queryString}`, true);
};

export const updateCrcRemarkApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.report.crcRemarkUpdate, request);
};

export const deleteCrcRemarkApi = async (req: any): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.report.crcRemarkRemove, req, true);
};


export const createCrcDataApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.report.crcDataCreate, request);
};
export const crcDataGet = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.report.crcDataFindAll);
};

export const updateCrcDataApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.report.crcDataUpdate, request);
};

export const deleteCrcDataApi = async (req: any): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.report.crcDataRemove, req, true);
};


export const createCrcOptionApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.report.crcOptionCreate, request);
};
export const crcOptionGet = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.report.crcOptionGet);
};

export const updateCrcOptionApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.report.crcOptionUpdate, request);
};

export const createCrcRecoApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.report.crcRecoCreate, request);
};

export const crcRecoGet = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.report.crcRecoFindAll);
};

export const crcRecoSearchGet = async (request: { code?: string; remarkAllContent?: string }): Promise<ApiResponse<any>> => {
    const queryString = Object.entries(request)
        .filter(([key, value]) => value !== undefined)  // undefined 값은 제외
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');


    return httpClient.httpGet(apiConstants.report.crcRecoSearch, `${queryString}`, true);
};

export const updateCrcRecoApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.report.crcRecoUpdate, request);
};

export const deleteCrcRecoApi = async (req: any): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.report.crcRecoRemove, req, true);
};

export const createCrcCommentApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.report.crcCommentCreate, request);
}

export const crcCommentGet = async (): Promise<ApiResponse<any>> => {
    return httpClient.httpGet(apiConstants.report.crcCommentFindAll);
};

export const crcCommentSearchGet = async (request: { code?: string; remarkAllContent?: string }): Promise<ApiResponse<any>> => {
    const queryString = Object.entries(request)
        .filter(([key, value]) => value !== undefined)  // undefined 값은 제외
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

    return httpClient.httpGet(apiConstants.report.crcCommentSearch, `${queryString}`, true);
};

export const updateCrcCommentApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.report.crcCommentUpdate, request);
};

export const deleteCrcCommentApi = async (req: any): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.report.crcCommentRemove, req, true);
};

export const saveDataCreateApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.report.saveDataCreate, request);
};

export const  saveDataSlotIdGetApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpGet(apiConstants.report.saveDataSlotIdGet, `${request}`, false);
};

export const saveDataPutDataApi = async (request: any): Promise<ApiResponse<void>> => {
    return httpClient.httpPut(apiConstants.report.saveDataPutData, request);
};

export const saveDataDeleteApi = async (req: any): Promise<ApiResponse<void>> => {
    return httpClient.httpDelete(apiConstants.report.saveDataDelete, req, true);
};