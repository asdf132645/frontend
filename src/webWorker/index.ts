// 웹 워커 코드
declare function importScripts(...urls: string[]): void;
import SockJS from 'sockjs-client';

importScripts('https://cdn.jsdelivr.net/npm/sockjs-client@1.5.2/dist/sockjs.min.js');

// SockJS 인스턴스 생성
const sockjs = new SockJS('http://192.168.0.131:3002');

// 연결 이벤트 처리
sockjs.onopen = function () {
    console.log('웹 워커: SockJS 서버에 연결되었습니다.');
};

// 메시지 수신 이벤트 처리
sockjs.onmessage = function (event: any) {
    console.log('웹 워커가 SockJS 서버로부터 받은 메시지:', event.data);
    // 받은 메시지를 원하는 대로 처리한 후 메인 스레드로 전달
    self.postMessage(event.data);
};

// 연결 종료 이벤트 처리
sockjs.onclose = function () {
    console.log('웹 워커: SockJS 서버 연결이 끊어졌습니다.');
};

// 오류 이벤트 처리
sockjs.onerror = function (error: any) {
    console.error('웹 워커: SockJS 서버 오류:', error);
};
