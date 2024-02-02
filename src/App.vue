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
import {onMounted, getCurrentInstance, ref, createSlots, computed} from 'vue';
import {useStore} from "vuex";
// 스토어
const store = useStore();
import { tcpReq } from '@/common/tcpRequest/tcpReq';
const instance = getCurrentInstance();
import { sysInfo, runningInfo } from '@/common/lib/storeSetData/common';
import AppHeader from "@/components/layout/AppHeader.vue";
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
    case 'RUNNING_INFO':
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
