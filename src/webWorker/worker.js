// 웹 워커 스크립트 파일

let socket;

// 웹 워커가 메시지를 받으면 실행되는 이벤트 리스너
self.onmessage = function (event) {
    const command = event.data.command;

    // 'initSocket' 명령을 통해 웹소켓을 초기화하고 이벤트 리스너 설정
    if (command === 'initSocket') {
        const socketUrl = event.data.socketUrl; // 웹소켓 URL
        socket = new WebSocket(socketUrl);

        // 'chat' 이벤트 수신 시 처리
        socket.addEventListener('message', (event) => {
            self.postMessage(event.data);
        });
    }
};
