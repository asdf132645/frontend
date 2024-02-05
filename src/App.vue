<!-- App.vue -->
<template>
  <div id="app">
    <AppHeader/>
    <main class='content'>
      <router-view/>
    </main>
  </div>
</template>

<script setup lang="ts">
// App.vue 에 역할은 모든 페이지에서 던지는 웹소켓 응답 값을 처리 하는 곳입니다.
// startSys는 장비를 실행 시키는 tcp 응답 메세시입니다. runInfoGetTcpData 장비실행 여부에 대한 메서드입니다.

import {onMounted, getCurrentInstance, ref, createSlots, computed, watch} from 'vue';
import {useStore} from "vuex";
// 스토어
const store = useStore();
const commonDataGet = computed(() => store.state.commonModule);

const isStartEmbeddedCalled = ref(false);
let isRequestInProgress = false;

watch([commonDataGet.value], async (newVals: any) => {
  const newValsObj = JSON.parse(JSON.stringify(newVals))

  if (newValsObj[0].startEmbedded && !isStartEmbeddedCalled.value) { // 수정된 부분
    isStartEmbeddedCalled.value = true; // 추가된 부분
    // 호출할 메서드 추가
  }

})

import {tcpReq} from '@/common/tcpRequest/tcpReq';
const instance = getCurrentInstance();
import {sysInfoStore, runningInfoStore} from '@/common/lib/storeSetData/common';
import AppHeader from "@/components/layout/AppHeader.vue";
import {RunningInfo, SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";

const runningSlotId = ref('');
onMounted(() => {
  const socket = instance?.appContext.config.globalProperties.$socket;
  if (socket && !socket.connected) {
    socket.connect();
  }
  startSysPostWebSocket();
  runInfoPostWebSocket();
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
      // 시작 버튼이 눌리면 연속적으로 실행정보, 장비정보를 요청한다.
      await store.dispatch('commonModule/setCommonInfo', {
        isRunningState: true,
      });
      break;
    case 'RUNNING_INFO':
      await runningInfoStore(parseDataWarp);
      await runningInfoCheckStore(parseDataWarp);
      break;
    case 'STOP':
      // 시작 버튼이 눌리면 연속적으로 실행정보, 장비정보를 요청한다.
      await store.dispatch('commonModule/setCommonInfo', {
        isRunningState: false,
      });
      break;
  }
  console.log(parseDataWarp)

});
const startSysPostWebSocket = async () => {
  if (!isRequestInProgress) {
    isRequestInProgress = true;
    await instance?.appContext.config.globalProperties.$socket.emit('message', {
      type: 'SEND_DATA',
      payload: tcpReq.embedStatus.sysInfo
    });
    isRequestInProgress = false;  // 요청 완료 후 플래그 업데이트
  }
};

const runInfoPostWebSocket = async () => {
  if (!isRequestInProgress) {
    isRequestInProgress = true;
    await instance?.appContext.config.globalProperties.$socket.emit('message', {
      type: 'SEND_DATA',
      payload: tcpReq.embedStatus.runningInfo
    });
    isRequestInProgress = false;  // 요청 완료 후 플래그 업데이트
  }
};

const runningInfoCheckStore = async (data: RunningInfo | undefined) => {
  // 스캔중일때는 pass
  if (String(data?.iCasStat) !== '999999999999') {
    const currentSlot = data?.slotInfo.find(
        (item: SlotInfo) => item.stateCd === "03"
    );
    //슬라이드 변경시 데이터 저장
    if (currentSlot?.isLowPowerScan === 'Y' && currentSlot?.testType === '03') {
      // running info 종료
      instance?.appContext.config.globalProperties.$socket.emit('message', {
        type: 'SEND_DATA',
        payload: tcpReq.embedStatus.pause
      });
    } else {
      if (currentSlot?.slotId !== runningSlotId.value) {
        // 실행중인 슬롯ID 변경
        await store.dispatch('runningInfoModule/updateRunningInfo', {key: 'changeSlide', value: currentSlot?.slotId});
        runningSlotId.value = String(currentSlot?.slotId);
      }
    }
  }

}

setInterval(async () => {
  await startSysPostWebSocket();
  // await runInfoPostWebSocket();
}, 4000);

setInterval(async () => {
  // await startSysPostWebSocket();
  await runInfoPostWebSocket();
}, 5000);



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
