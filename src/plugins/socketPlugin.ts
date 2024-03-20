import { Plugin } from 'vue';
import { io, Socket } from 'socket.io-client';

// 소켓 인스턴스를 보유할 앱 컨텍스트의 속성을 생성합니다.
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $socket: Socket;
    }
}
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';

// 플러그인을 정의합니다.
const socketPlugin: Plugin = {
    install: (app) => {
        // 소켓 인스턴스를 생성하고 구성합니다.
        const socket: Socket = io(`${apiBaseUrl}`, { transports: ['websocket'], withCredentials: true });

        // 소켓 인스턴스를 앱 컨텍스트에 추가합니다.
        app.config.globalProperties.$socket = socket;
    },
};

export default socketPlugin;
