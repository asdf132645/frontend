// useHttpClient.ts
import axios, {AxiosRequestConfig} from 'axios';

import {Endpoint, GenericObject} from '../type/generalTypes';

export interface ApiResponse<T> {
    code: number;
    data?: T;
    success: boolean;
}

interface HttpResponse<T> {
    data?: ApiResponse<T>;
    success: boolean;
}


export function useHttpClient() {
    let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
    // type 용도 -> ? 쿼리 스트링으로 보낼지 여부
    const httpGet = async <T>(url: Endpoint, parameters?: string, type?: boolean, callImg?: string): Promise<ApiResponse<T>> => {
        return httpGetAct(url.endpoint, parameters, type);
    };

    const httpGetAct = async <T>(url: string, parameters?: string, type?: boolean, callImg?: string): Promise<ApiResponse<T>> => {
        const options: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600' // 응답을 1시간 동안 캐싱하도록 지정
            },
        };

        axios.defaults.withCredentials = true;
        const slush = parameters ? (type ? '?' : '/') : '';
        parameters = parameters || '';
        if (callImg === 'viewer') {
            apiBaseUrl = window.MAIN_API_IP;
        }
        try {
            const response: HttpResponse<T> = await axios.get(`${apiBaseUrl}/${url}${slush}${parameters}`, options);
            return Promise.resolve(response.data || {code: 500, data: undefined, success: false});
        } catch (e) {
            return Promise.reject(e);
        }
    };


    const httpPost = async <T>(url: Endpoint, payload: GenericObject, contentType?: string, formData = false, callImg?: string): Promise<ApiResponse<T>> => {
        return httpPostAct(url.endpoint, payload, contentType, formData, callImg);
    };

    const httpPostAct = async <T>(url: string, payload: GenericObject, contentType?: string, formData = false, callImg?: string): Promise<ApiResponse<T>> => {

        const options: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (contentType === 'blob') {
            options.responseType = 'blob';
        }
        if (contentType === 'text/plain') {
            options.headers = {
                'Content-Type': 'text/plain',
            }
        }
        if (formData) {
            options.headers = {
                'Content-Type': 'multipart/form-data',
            }
        }

        axios.defaults.withCredentials = true;
        if (callImg === 'viewer') {
            apiBaseUrl = window.MAIN_API_IP;
        }
        try {
            const response: HttpResponse<T> = await axios.post(`${apiBaseUrl}/${url}`, payload, options);
            return Promise.resolve(response.data || {code: 500, data: undefined, success: false});
        } catch (e) {
            return Promise.reject(e);
        }
    };

    const httpPut = async <T>(url: Endpoint, payload: GenericObject, parameters?: string, type?: boolean): Promise<ApiResponse<T>> => {
        return httpPutAct(url.endpoint, payload, parameters, type);
    };

    const httpPutAct = async <T>(url: string, payload: GenericObject, parameters?: string, type?: boolean): Promise<ApiResponse<T>> => {
        const options: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache', // 캐시 무효화
            },
        };

        axios.defaults.withCredentials = true;
        const slush = parameters ? (type ? '?' : '/') : '';
        parameters = parameters || '';

        try {
            const response: HttpResponse<T> = await axios.put(`${apiBaseUrl}/${url}${slush}${parameters}`, payload, options);
            return Promise.resolve(response.data || {code: 500, data: undefined, success: false});
        } catch (e) {
            return Promise.reject(e);
        }
    };

    const httpDelete = async <T>(url: Endpoint, payload: GenericObject, type?: boolean): Promise<ApiResponse<T>> => {
        return httpDeleteAct(url.endpoint, payload, type);
    };

    const httpDeleteAct = async <T>(url: string, payload: GenericObject, type?: boolean): Promise<ApiResponse<T>> => {
        const options: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache', // 캐시 무효화
            },
        };

        axios.defaults.withCredentials = true;
        const slush = type ? '?' : '/';
        try {
            const response: HttpResponse<T> = await axios.delete(`${apiBaseUrl}/${url}${slush}`, {
                ...options,
                data: payload
            });
            return Promise.resolve(response.data || {code: 500, data: undefined, success: false});
        } catch (e) {
            return Promise.reject(e);
        }
    };


    return {
        httpGet,
        httpGetAct,
        httpPost,
        httpPostAct,
        httpPut,
        httpPutAct,
        httpDelete,
        httpDeleteAct,
    };

}
