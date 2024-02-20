<!-- App.vue -->
<template>
  <div>
    <AppHeader/>
    <main class='content'>
      <router-view/>
    </main>
  </div>
</template>

<script setup lang="ts">
// App.vue 에 역할은 모든 페이지에서 던지는 웹소켓 응답 값을 처리 하는 곳입니다.
// startSys는 장비를 실행 시키는 tcp 응답 메세시입니다. runInfoGetTcpData 장비실행 여부에 대한 메서드입니다.

import {onMounted, getCurrentInstance, ref, computed, watch} from 'vue';
import {useStore} from "vuex";
import {sysInfoStore, runningInfoStore, wbcInfoStore, rbcInfoStore} from '@/common/lib/storeSetData/common';
import AppHeader from "@/components/layout/AppHeader.vue";
import {RunningInfo, SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {tcpReq} from '@/common/tcpRequest/tcpReq';
import {messages} from '@/common/defines/constFile/constant';


const store = useStore();
const commonDataGet = computed(() => store.state.commonModule);
const userModuleDataGet = computed(() => store.state.userModule);
const isStartEmbeddedCalled = ref(false);
let isRequestInProgress = false;
const instance = getCurrentInstance();
const runningSlotId = ref('');
const userId = ref('');

// 실제 배포시 사용해야함
// document.addEventListener('click', function (event: any) {
//   const storedUser = sessionStorage.getItem('user');
//   if((storedUser) && route.fullPath !== '/user/login'){
//     document.documentElement.requestFullscreen();
//   }
// });

watch([commonDataGet.value], async (newVals: any) => {
  const newValsObj = JSON.parse(JSON.stringify(newVals))
  isStartEmbeddedCalled.value = newValsObj[0].startEmbedded;
})

watch([userModuleDataGet.value], async (newVals: any) => {
  const newValsObj = JSON.parse(JSON.stringify(newVals))
  if (newValsObj[0].userId && newValsObj[0].userId !== '') {
    userId.value = newValsObj[0].userId;
  }
})

onMounted(async () => {
  if (userId.value && userId.value !== '') { // 로그인 체크
    // 소켓 연결
    const socket = instance?.appContext.config.globalProperties.$socket;
    if (socket && !socket.connected) {
      socket.connect();
    }
    await startSysPostWebSocket();
    await runInfoPostWebSocket();
  }
});

// 모든 tcp 통신으로 받은 응답값을 스토어에 저장하는 부분
// 무조건 응답을 받는곳은 app.vue에서 정의
// store에 저장하는 부분은 C:\workspace\frontend\src\common\lib\storeSetData\common.ts 여기에 무조건 정의하세요
// 변수명에 WebSocket 을 뒤에 붙이는 이유는 웹 백엔드로 소켓으로 전달을 나타내기 위함

instance?.appContext.config.globalProperties.$socket.on('chat', async (data) => {

  const parsedData = JSON.parse(data);
  const parseDataWarp = JSON.parse(parsedData.bufferData); // 2번 json 으로 감싸는 이유는 잘못된 문자열이 들어와서 한번더 맵핑시키는 것임
  // 시스템정보 스토어에 담기
  switch (parseDataWarp.jobCmd) {
    case 'SYSINFO':
      await sysInfoStore(parseDataWarp);
      break;
    case 'INIT':
      startSysPostWebSocket();
      break;
    case 'START':
      runInfoPostWebSocket();
      await store.dispatch('commonModule/setCommonInfo', {isRunningState: true});// 실행중이라는 여부를 보낸다
      await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'}); // 첫 슬라이드가 시작되었음을 알려준다.
      await store.dispatch('commonModule/setCommonInfo', {startEmbedded: 'start',}); // 임베디드 상태가 죽음을 알려준다.
      break;
    case 'RUNNING_INFO':
      await runningInfoStore(parseDataWarp);
      await wbcInfoStore(parseDataWarp);
      await rbcInfoStore(parseDataWarp);
      await runningInfoCheckStore(parseDataWarp);
      break;
    case 'STOP':
      await store.dispatch('commonModule/setCommonInfo', {isRunningState: false});
      isStartEmbeddedCalled.value = false;
      break;
    case 'RUNNING_COMP':// 완료가 된 상태이므로 각 페이지에 완료가 되었다는 정보를 저장한다.
      await store.dispatch('commonModule/setCommonInfo', {embeddedNumber: String(data?.iCasStat)});
      await store.dispatch('commonModule/setCommonInfo', {startEmbedded: false,}); // 임베디드 상태가 죽음을 알려준다.
      await store.dispatch('commonModule/setCommonInfo', {isRunningState: false}); // 시스템이 돌아가는 상태를 알려준다.
      await store.dispatch('commonModule/setCommonInfo', {isAlarm: true}); // 알람을 킨다.
      await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'stop'});
      break;
    case 'PAUSE':
      await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {isPause: true});
      break;
    case 'RESTART':
      await runningInfoStore(parseDataWarp);
      await wbcInfoStore(parseDataWarp);
      await rbcInfoStore(parseDataWarp);
      await runningInfoCheckStore(parseDataWarp);
      break;
    case 'RECOVERY':
      await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {userStop: false});
      break;
    case 'ERROR_CLEAR':
      alert(messages.IDS_MSG_FAILED);
      break;
  }

});
const startSysPostWebSocket = async () => {
  isRequestInProgress = true;
  tcpReq.embedStatus.sysInfo.reqUserId = userId.value;
  sendMessage(tcpReq.embedStatus.sysInfo);
  isRequestInProgress = false;  // 요청 완료 후 플래그 업데이트
};

const runInfoPostWebSocket = async () => {
  if (!isRequestInProgress) {
    isRequestInProgress = true;
    tcpReq.embedStatus.runningInfo.reqUserId = userId.value;
    sendMessage(tcpReq.embedStatus.runningInfo);
    isRequestInProgress = false;  // 요청 완료 후 플래그 업데이트
  }
};

const runningInfoCheckStore = async (data: RunningInfo | undefined) => {
  if (String(data?.iCasStat) !== '999999999999') { // 스캔중일때는 pass + 완료상태일때도
    const currentSlot = data?.slotInfo.find(
        (item: SlotInfo) => item.stateCd === "03"
    );
    //슬라이드 변경시 데이터 저장
    await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: false})
    if (currentSlot?.isLowPowerScan === 'Y' && currentSlot?.testType === '03') {// running info 종료
      tcpReq.embedStatus.pause.reqUserId = userId.value;
      sendMessage(tcpReq.embedStatus.pause);
    } else {
      if (currentSlot?.slotId !== runningSlotId.value) { // 슬라이드 체인지 시
        await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'});
        await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: true});
        runningSlotId.value = String(currentSlot?.slotId);
      }
    }
    const regex = /[1,2,9]/g;
    const dataICasStat = String(data?.iCasStat);
    // 주문 내역 및 처리 결과 저장 -start
    // iCasStat (0 - 없음, 1 - 있음, 2 - 진행중, 3 - 완료, 4 - 에러, 9 - 스캔)
    if ((dataICasStat.search(regex) < 0) || data?.oCasStat === '111111111111') {
      tcpReq.embedStatus.runIngComp.reqUserId = userId.value;
      sendMessage(tcpReq.embedStatus.runIngComp);
    }
  }
}

const sendMessage = (payload: object) => {
  instance?.appContext.config.globalProperties.$socket.emit('message', {
    type: 'SEND_DATA',
    payload: payload
  });
}


setInterval(async () => {
  if (userId.value && userId.value !== '') {
    if (isStartEmbeddedCalled.value) {
      await runInfoPostWebSocket();
    }
    await startSysPostWebSocket();
  }
}, 500);


</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
}
</style>
