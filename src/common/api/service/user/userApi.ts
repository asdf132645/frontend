import { useHttpClient, ApiResponse } from '@/common/api/httpClient';
import { apiConstants } from '@/common/api/apiConstants';
import { CreateUser, loginUser, UserResponse  } from '@/common/api/service/user/dto/userDto'

// Create an instance of the http client
const httpClient = useHttpClient();

export const createUser = async (request: CreateUser): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.user.register, request);
};

export const login = async (request: loginUser): Promise<ApiResponse<UserResponse | undefined>> => {
    return httpClient.httpPost(apiConstants.user.login, request);
};

export const getAllUsersApi = async (userId: string): Promise<ApiResponse<UserResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.user.getUsers, userId);
}

export const getUserApi = async (userId: string): Promise<ApiResponse<UserResponse | undefined>> => {
    return httpClient.httpGet(apiConstants.user.userCheck, userId);
}