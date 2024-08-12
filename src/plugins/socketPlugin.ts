import { Plugin } from 'vue';
import { io, Socket } from 'socket.io-client';

// 소켓 인스턴스를 보유할 앱 컨텍스트의 속성을 생성합니다.
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $socket: Socket;
    }
}

const apiBaseUrl = window.MAIN_WEBSOCKET_IP || 'http://192.168.0.131:3002';

const socketPlugin: Plugin = {
    install: (app) => {
        const socket: Socket = io(`${apiBaseUrl}`, {
            transports: ['websocket'],
            withCredentials: true,
            reconnection: true,           // 자동 재연결 활성화
            reconnectionAttempts: 15,      // 재연결 시도 횟수
            reconnectionDelay: 2000,      // 재연결 시도 간격 (2초)
            timeout: 15000,               // 서버 응답 대기 시간
        });

        // 연결 상태에 따른 이벤트 핸들러 추가
        socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        // 주기적으로 서버와의 연결 상태를 확인하는 ping-pong 구현
        socket.on('pong', (latency) => {
            console.log(`Pong received with latency: ${latency}ms`);
        });

        setInterval(() => {
            if (socket.connected) {
                socket.emit('ping');  // 서버에 ping 메시지를 전송
            }
        }, 10000); // 10초 간격으로 ping 메시지 전송

        // 전역 속성에 소켓 인스턴스 등록
        app.config.globalProperties.$socket = socket;

        // Vue 컴포넌트가 해제될 때 소켓 연결을 정리합니다.
        const originalUnmount = app.unmount.bind(app);

        app.unmount = () => {
            socket.disconnect(); // 소켓 연결 해제
            originalUnmount(); // 기존 unmount 호출
        };
    },
};

export default socketPlugin;
