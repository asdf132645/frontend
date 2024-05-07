// // worker.ts
// // 웹 워커의 코드
// self.addEventListener('message', (event) => {
//     const data = event.data;
//
//     // 받은 데이터를 처리합니다.
//     console.log('웹 워커가 받은 데이터:', data);
//
//     // 처리한 결과를 메인 스레드로 보냅니다.
//     self.postMessage(`웹 워커가 처리한 결과: ${data}`);
// });
//
// const socket = new WebSocket('ws://192.168.0.131:3003', );
//
// socket.addEventListener('open', (data) => {
//     console.log(data);
// });
//
//
// socket.addEventListener('message', (event) => {
//     const data = event.data;
//     console.log('웹 워커가 웹 소켓 서버로부터 받은 메시지:', data);
//
//     // 데이터가 JSON 형식인지 확인하고 파싱합니다.
//     try {
//         const parsedData = JSON.parse(data);
//
//         // 이벤트 유형을 확인하고 원하는 처리를 수행합니다.
//         if (parsedData.event === 'chat') {
//             console.log('웹 워커가 받은 chat 메시지:', parsedData.data);
//             // chat 이벤트에 대한 처리 수행
//         } else if (parsedData.event === '0') {
//             console.log('초기 핸드셰이크 메시지 수신:', parsedData);
//         } else {
//             console.log('알려지지 않은 이벤트 수신:', parsedData);
//         }
//     } catch (e) {
//         console.error('데이터 파싱 오류:', e);
//     }
// });
//
// // socket.on('chat', async (data: an) => {
// //     //
// //     console.log(data)
// // })
//
// socket.addEventListener('chat', (event) => {
//     console.log('chackckckckck', event);
// });
//
// // 필요한 경우 추가 이벤트 핸들러를 추가할 수 있습니다.
// socket.addEventListener('close', () => {
//     console.log('웹 워커: 웹 소켓 서버 연결이 끊어졌습니다.');
// });
//
// socket.addEventListener('error', (error) => {
//     console.error('웹 워커: 웹 소켓 서버 오류:', error);
// });
