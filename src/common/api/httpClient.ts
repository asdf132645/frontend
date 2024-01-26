// useHttpClient.ts
import axios, { AxiosRequestConfig } from 'axios';
import { Endpoint, GenericObject } from '../type/generalTypes';

export interface ApiResponse<T> {
    code: number;
    data: T;
    success: boolean;
}

interface HttpResponse<T> {
    data: ApiResponse<T>;
    success: boolean;
}

export function useHttpClient() {

    const httpGet = async <T>(url: Endpoint, parameters: string): Promise<ApiResponse<T>> => {
        return httpGetAct(url.endpoint, parameters);
    };

    const httpGetAct = async <T>(url: string, parameters: string): Promise<ApiResponse<T>> => {
        const options: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        axios.defaults.withCredentials = true;

        try {
            const response: HttpResponse<T> = await axios.get(`http://localhost:3002/${url}/${parameters}`, options);
            return Promise.resolve(response.data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    const httpPost = async <T>(url: Endpoint, payload: GenericObject): Promise<ApiResponse<T>> => {
        return httpPostAct(url.endpoint, payload);
    };

    const httpPostAct = async <T>(url: string, payload: GenericObject): Promise<ApiResponse<T>> => {
        const options: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        axios.defaults.withCredentials = true;

        try {
            const response: HttpResponse<T> = await axios.post(`http://localhost:3002/${url}`, payload, options);
            return Promise.resolve(response.data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    return {
        httpGet,
        httpGetAct,
        httpPost,
        httpPostAct,
    };
}
