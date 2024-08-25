import { useHttpClient, ApiResponse } from '@/common/api/httpClient';
import { apiConstants } from '@/common/api/apiConstants';
import { CreateUser, loginUser, UserResponse } from '@/common/api/service/user/dto/userDto'

// Create an instance of the http client
const httpClient = useHttpClient();

export const createUser = async (request: CreateUser): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.user.register, request);
};

export const login = async (request: loginUser): Promise<ApiResponse<UserResponse | undefined>> => {
    return httpClient.httpPost(apiConstants.user.login, request);
};

export const logoutApi = async (request: Pick<loginUser, 'userId'>): Promise<ApiResponse<UserResponse | string | undefined>> => {
    return httpClient.httpPost(apiConstants.user.logout, request);
}

export const getAllUsersApi = async (userId: string): Promise<ApiResponse<UserResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.user.getUsers, userId);
}

export const getUserApi = async (userId: string): Promise<ApiResponse<UserResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.user.userCheck, userId);
}

export const putUserDataApi = async (request: any, userId: string): Promise<ApiResponse<any>> => {
    return httpClient.httpPut(apiConstants.user.userDataPut, request, userId);
};

export const deleteUserApi = async (userId: any): Promise<ApiResponse<UserResponse | undefined>> => {
    return httpClient.httpDelete(apiConstants.user.deleteUser, userId, true);
}

// export const getUserIpApi = async (): Promise<ApiResponse<any>> => {
//     return httpClient.httpGet(apiConstants.user.userIp, '');
// }