// window 객체의 타입 확장
declare global {
    interface Window {
        APP_API_BASE_URL: string;
        PROJECT_TYPE: 'pb' | 'bm';
        MAIN_API: string;
        PROJECT_VERSION: string;
        AI_VERSION: string;
        WEB_BACKEND_VERSION: string;
        WEB_FRONTEND_VERSION: string;
        PB_VERSION: '12a' | '100a';
        MAIN_API_IP: string;
        VIEWER_CHECK: string;
        FORCE_VIEWER: 'viewer' | 'main';
        MAIN_WEBSOCKET_IP: string;
    }
}

export {};