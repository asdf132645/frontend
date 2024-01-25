<!-- App.vue -->
<template>
  <div id="app">
    <AppHeader />
    <main class='content'>
<!--      <router-view />-->
      <HomeView/>
    </main>
    <div>{{ messageFromWebSocket }}</div>
    <input v-model="messageToSend" placeholder="Type a message" />
    <button @click="sendMessage">Send Message</button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { io, Socket } from 'socket.io-client';

import AppHeader from "@/components/layout/AppHeader.vue";
import HomeView from "@/views/HomeView.vue";

const socket: Socket = io('http://localhost:3002', { transports: ['websocket'], withCredentials: true });

const messageFromWebSocket = ref("");
const messageToSend = ref("");

const sendMessage = () => {
  socket.emit('message', { type: 'SEND_DATA', payload: { message: messageToSend.value } });
};
onMounted(() => {
  // Connect to WebSocket server when the component is mounted
  socket.connect();
});
socket.on('chat', (data) => {
  messageFromWebSocket.value = data.message;
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
  display: flex;
  justify-content: space-between;
  width: 100%;
}
</style>
