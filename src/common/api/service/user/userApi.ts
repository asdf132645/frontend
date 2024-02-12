
import { useHttpClient, ApiResponse } from '@/common/api/httpClient';
import { apiConstants } from '@/common/api/apiConstants';
import { CreateUser,loginUser  } from '@/common/api/service/user/dto/userDto'

// Create an instance of the http client
const httpClient = useHttpClient();

export const createUser = async (request: CreateUser): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.user.register, request);
};

export const login = async (request: loginUser): Promise<ApiResponse<void>> => {
    return httpClient.httpPost(apiConstants.user.login, request);
};