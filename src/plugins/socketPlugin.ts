import { Plugin } from 'vue';
import { io, Socket } from 'socket.io-client';

// 소켓 인스턴스를 보유할 앱 컨텍스트의 속성을 생성합니다.
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $socket: Socket;
    }
}
const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';

const socketPlugin: Plugin = {
    install: (app) => {
        const socket: Socket = io(`${apiBaseUrl}`, { transports: ['websocket'], withCredentials: true });

        app.config.globalProperties.$socket = socket;
    },
};

export default socketPlugin;
