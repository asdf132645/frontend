<template>
  <div>
    <button @click="fetchProcessInfo">zmfflflfl</button>
    dklasjdklasjdklasjdkljaskldjkalsdjklasdjklasjdklasjdlkajsdkljasdklasdljk
  </div>
</template>

<script setup lang="ts">
import { getProcessInfo } from '@/common/api/service/processinfo/processinfoApi'; // Adjust the path accordingly

const fetchProcessInfo = async () => {
  try {
    const response = await getProcessInfo();
    console.log('Process Info:', response.data);
    // Handle the response data as needed
  } catch (error) {
    console.error('Error fetching Process Info:', error);
    // Handle errors
  }
};
</script>
