<template>
  <div class="mt2">
    <h3 class="titleText"><span class="greenColor">W</span>orking <span class="greenColor">V</span>iew </h3>
    <div>
      <p>IDLE</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted,getCurrentInstance} from "vue";
import {tcpReq} from "@/common/tcpRequest/tcpReq";
const instance = getCurrentInstance();

onMounted(() => {
  instance?.appContext.config.globalProperties.$socket.emit('message', {
    type: 'SEND_DATA',
    payload: tcpReq.embedStatus.end
  });
});
</script>
  