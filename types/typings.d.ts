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
        MACHINE_VERSION: '12a' | '100a';
        MAIN_API_IP: string;
        VIEWER_CHECK: string;
        FORCE_VIEWER: 'viewer' | 'main' | 'exhibition';
        MAIN_WEBSOCKET_IP?: string;
        EQUIPMENTPCIP? : string;
        LINUX_SERVER_SET? : boolean;
        config: {
            ENABLE_ARTIFACT_SMUDGE: boolean,
            ENABLE_SAVE_AND_LIS_SEND: boolean,
            ENABLE_CBC_LIST: boolean,
            ENABLE_CBC_PATIENT_LIST: boolean,
            ENABLE_CBC_ABS_PERCENT_BOTH: boolean,
            ENABLE_SEND_WBC_IMAGES: boolean,
        }
    }
}

export {};