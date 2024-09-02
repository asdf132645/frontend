import { Plugin } from 'vue';
import { io, Socket } from 'socket.io-client';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $socket: Socket;
        $socketError: boolean;
    }
}

const apiBaseUrl = window.MAIN_WEBSOCKET_IP || 'http://192.168.0.131:3002';

const socketPlugin: Plugin = {
    install: (app) => {
        const socket: Socket = io(`${apiBaseUrl}`, {
            transports: ['websocket'],
            withCredentials: true,
            reconnection: true,            // 자동 재연결 활성화
            reconnectionAttempts: 15,      // 재연결 시도 횟수
            reconnectionDelay: 3000,       // 재연결 시도 간격 (3초)
            timeout: 30000,                // 서버 응답 대기 시간 (30초)
        });

        // 다음 ping 전송을 위한 타이머를 저장할 변수
        let pingTimeout: NodeJS.Timeout | null = null;

        // 연결이 성공했을 때 실행되는 핸들러
        socket.on('connect', () => {
            console.log('WebSocket connected');
            app.config.globalProperties.$socketError = false;
            sendPing();
            if (pingTimeout) {
                clearTimeout(pingTimeout);
                pingTimeout = null;
            }
        });

        // 연결이 끊어졌을 때 실행되는 핸들러
        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            app.config.globalProperties.$socketError = true;
            console.log('연결이 끊어졌습니다. 재연결을 시도합니다.');
            sendPing();
            if (pingTimeout) {
                clearTimeout(pingTimeout);
                pingTimeout = null;
            }
        });

        // 연결 오류가 발생했을 때 실행되는 핸들러
        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            app.config.globalProperties.$socketError = true;
            sendPing();
            if (pingTimeout) {
                clearTimeout(pingTimeout);
                pingTimeout = null;
            }
            console.log('서버와의 연결에 문제가 발생했습니다. 재연결을 시도합니다.');
        });

        socket.on('pong', (latency) => {
            console.log(`Pong received with latency: ${latency}ms`);
        });

        function sendPing() {
            if (socket.connected) {
                socket.emit('ping');  // 서버에 ping 메시지를 전송
                console.log('Ping sent to server');
            }

            // 다음 ping 전송 예약
            pingTimeout = setTimeout(sendPing, 10000); // 10초 후에 다시 ping 전송
        }

        // 전역 속성에 소켓 인스턴스 등록
        app.config.globalProperties.$socket = socket;
        app.config.globalProperties.$socketError = false; // 연결 상태 확인용 추가 속성

        // Vue 컴포넌트가 해제될 때 소켓 연결을 정리
        const originalUnmount = app.unmount.bind(app);

        app.unmount = () => {
            socket.disconnect(); // 소켓 연결 해제
            if (pingTimeout) {
                clearTimeout(pingTimeout); // 컴포넌트가 해제될 때 pingTimeout 제거
            }
            originalUnmount(); // 기존 unmount 호출
        };
    },
};

export default socketPlugin;
