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
import { onMounted, getCurrentInstance } from 'vue';
import { tcpReq } from '@/common/tcpRequest/tcpReq';
const instance = getCurrentInstance();

import AppHeader from "@/components/layout/AppHeader.vue";
const startSys = () => {
  instance?.appContext.config.globalProperties.$socket.emit('message', { type: 'SEND_DATA', payload: tcpReq.embedStatus.start });

};

onMounted(() => {
  //최초 실행
  instance?.appContext.config.globalProperties.$socket.connect();
  startSys();
});

instance?.appContext.config.globalProperties.$socket.on('chat', (data) => {
  console.log(data);
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
