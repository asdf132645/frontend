window.APP_API_BASE_URL='http://192.168.0.131:80/api'; // MultiViewer - 'http://192.168.0.100:80/api',   Main PC Only - 'http://127.0.0.1:3002'
window.MAIN_API_IP = 'http://192.168.0.131:80/api'; // MultiViewer - 'http://192.168.0.100:80/api',   Main PC Only - 'http://127.0.0.1:3002'
window.MAIN_API = 'http://192.168.0.131:80/api'; // MultiViewer - 'http://192.168.0.100:80/api',   Main PC Only - 'http://127.0.0.1:3002'
window.MAIN_WEBSOCKET_IP = 'http://192.168.0.131:3002';  // MultiViewer - 'http://192.168.0.100:3002', Main PC Only - 'http://127.0.0.1:3002'
window.PROJECT_TYPE='pb';  // pb or bm
window.PROJECT_VERSION='02.02.014';
window.WEB_BACKEND_VERSION='0.0.97v';
window.WEB_FRONTEND_VERSION='0.3.11v';
window.MACHINE_VERSION='100a';  // 12a or 100a
window.FORCE_VIEWER = 'main'; // main or viewer or exhibition
window.PORT = '8080';
window.LINUXSERVER = false; // Run Linux Server Bullion
window.EQUIPMENTPCIP = 'http://192.168.0.43:3020'; // Actual EQUIPMENT PC IP - Use when running Linux

// Site 별 기능들 Boolean
window.config = {
    // Function

    // 고대 안암병원 전용 true, 나머지 false
    ENABLE_ARTIFACT_SMUDGE: false,

    // LIS
    // 인하대 전용 true, 나머지 false
    ENABLE_SAVE_AND_LIS_SEND: false,

    // CBC
    // SD 의학연구소 전용 true, 나머지 false
    ENABLE_CBC_LIST: false,
    ENABLE_CBC_PATIENT_LIST: false,
    ENABLE_CBC_ABS_PERCENT_BOTH: false,

    // DRC
    // 원주기독 전용 true, 나머지 false
    ENABLE_SEND_WBC_IMAGES: false,
}