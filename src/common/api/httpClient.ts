// useHttpClient.ts
import axios, {AxiosRequestConfig} from 'axios';

import {Endpoint, GenericObject} from '../type/generalTypes';

export interface ApiResponse<T> {
    code: number;
    data?: T;
    success: any;
}

interface HttpResponse<T> {
    data?: ApiResponse<T>;
    success: any;
}


export function useHttpClient() {
    let apiBaseUrl: any = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
    // type 용도 -> ? 쿼리 스트링으로 보낼지 여부
    const httpGet = async <T>(url: Endpoint, parameters?: string, type?: boolean, linuxServeSet = false): Promise<ApiResponse<T>> => {
        return httpGetAct(url.endpoint, parameters, type, linuxServeSet);
    };

    const httpGetAct = async <T>(url: string, parameters?: string, type?: boolean, linuxServeSet = false): Promise<ApiResponse<T>> => {
        const options: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Cache-Control': 'public, max-age=3600' // 응답을 1시간 동안 캐싱하도록 지정
            },
        };

        axios.defaults.withCredentials = true;
        const slush = parameters && parameters !== '' ? (type ? '?' : '/') : '';
        parameters = parameters || '';
        if (linuxServeSet) {
            apiBaseUrl = window.EQUIPMENTPCIP;
        } else {
            apiBaseUrl = window.APP_API_BASE_URL;
        }
        try {
            const response: HttpResponse<T> = await axios.get(`${apiBaseUrl}/${url}${slush}${parameters}`, options);
            return Promise.resolve(response.data || {code: 500, data: undefined, success: false});
        } catch (e) {
            return Promise.reject(e);
        }
    };


    const httpPost = async <T>(url: Endpoint, payload: GenericObject, contentType?: string, formData = false, linuxServeSet = false): Promise<ApiResponse<T>> => {
        return httpPostAct(url.endpoint, payload, contentType, formData, linuxServeSet);
    };

    const httpPostAct = async <T>(url: string, payload: GenericObject, contentType?: string, formData = false, linuxServeSet = false): Promise<ApiResponse<T>> => {

        const options: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
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
        if (contentType === 'application/rtf') {
            options.headers = {
                'Content-Type': 'application/rtf',
            }
        }
        if (formData) {
            options.headers = {
                'Content-Type': 'multipart/form-data',
            }
        }
        if (linuxServeSet) {
            apiBaseUrl = window.EQUIPMENTPCIP;
        } else {
            apiBaseUrl = window.APP_API_BASE_URL;
        }
        axios.defaults.withCredentials = true;

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
                'Content-Type': 'application/json; charset=UTF-8',
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

    const httpDelete = async <T>(url: Endpoint, payload: GenericObject, type?: boolean, linuxServeSet = false): Promise<ApiResponse<T>> => {
        return httpDeleteAct(url.endpoint, payload, type, linuxServeSet);
    };

    const httpDeleteAct = async <T>(url: string, payload: GenericObject, type?: boolean, linuxServeSet = false): Promise<ApiResponse<T>> => {
        const options: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Cache-Control': 'no-cache', // 캐시 무효화
            },
        };

        axios.defaults.withCredentials = true;
        if (linuxServeSet) {
            apiBaseUrl = window.EQUIPMENTPCIP;
        } else {
            apiBaseUrl = window.APP_API_BASE_URL;
        }
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
