<!-- App.vue -->
<template>
  <div id="app">
    <AppHeader />
    <main class='content'>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
//App.vue 에 역할은 모든 페이지에서 던지는 웹소켓 응답 값을 처리 하는 곳입니다.
// startSys는 장비를 실행 시키는 tcp 응답 메세시입니다. runInfoGetTcpData 장비실행 여부에 대한 메서드입니다.

import {onMounted, getCurrentInstance, ref, createSlots, computed} from 'vue';
import {useStore} from "vuex";
// 스토어
const store = useStore();
import { tcpReq } from '@/common/tcpRequest/tcpReq';
const instance = getCurrentInstance();
import { sysInfo, runningInfo } from '@/common/lib/storeSetData/common';
import AppHeader from "@/components/layout/AppHeader.vue";
// 스토어
const startSys = () => {
  instance?.appContext.config.globalProperties.$socket.emit('message', { type: 'SEND_DATA', payload: tcpReq.embedStatus.sysInfo });
};
const runInfoGetTcpData = () => {
  instance?.appContext.config.globalProperties.$socket.emit('message', { type: 'SEND_DATA', payload: tcpReq.embedStatus.runningInfo });
};
onMounted(() => {
  const socket = instance?.appContext.config.globalProperties.$socket;
  if (socket && !socket.connected) {
    socket.connect();
  }
  startSys();
  runInfoGetTcpData();
});



// 모든 tcp 통신으로 받은 응답값을 스토어에 저장하는 부분
// 무조건 응답을 받는곳은 app.vue에서 정의
// store에 저장하는 부분은 C:\workspace\frontend\src\common\lib\storeSetData\common.ts 여기에 무조건 정의하세요

instance?.appContext.config.globalProperties.$socket.on('chat', async (data) => {
  const parsedData = JSON.parse(data);
  const parseDataWarp = JSON.parse(parsedData.bufferData); // 2번 json 으로 감싸는 이유는 잘못된 문자열이 들어와서 한번더 맵핑시키는 것임
  // 시스템정보 스토어에 담기
  switch (parseDataWarp.jobCmd) {
    case 'SYSINFO':
      await sysInfo(parseDataWarp);
      break;
    case 'INIT':
      startSys();
      break;
    case 'START': 
      runInfoGetTcpData();
      break;
    case 'RUNNING_INFO'://예외적으로 start를 응답으로 받으면 장비가 실행된 상태이기에 장비상태를 가지고온다. 예외적으로 담기만 하는 부분 러닝 인포는 담기만 함
      await runningInfo(parseDataWarp);
      break;
  }
  console.log(parseDataWarp)

});


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
