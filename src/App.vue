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
import { onMounted, ref } from 'vue';
import { io, Socket } from 'socket.io-client';

import AppHeader from "@/components/layout/AppHeader.vue";

const socket: Socket = io('http://localhost:3002', { transports: ['websocket'], withCredentials: true });

const messageToSend = ref("");

const startSys = () => {
  if (messageToSend.value.trim() !== "") {
    socket.emit('message', { type: 'SEND_DATA', payload: { message: messageToSend.value } });
  } else {
    console.warn('Message is empty. Please enter a message.');
  }
};

onMounted(() => {
  socket.connect();
  startSys();
});

socket.on('chat', (data) => {
  console.log(data)
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
