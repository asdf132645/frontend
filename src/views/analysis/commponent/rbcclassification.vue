<template>
    <div class="mt2">
      <h3 class="titleText"> <span class="greenColor">P</span>rocessing <span class="greenColor">I</span>nformation </h3>
      <ul>
        <li v-for="processInfoItem in processInfoArray" :key="processInfoItem.id">
          <p>Cassette No: {{ processInfoItem?.cassetteNo }}</p>
          <p>Barcode ID: {{ processInfoItem?.barcodeId }}</p>
          <p>Patient ID: {{ processInfoItem?.patientId }}</p>
          <p>patient Name: {{ processInfoItem?.patientName }}</p>
          <p>WBC Count: {{ processInfoItem?.wbcCount }}</p>
          <p>Order Date: {{ processInfoItem?.orderDate }}</p>
          <p>Oil Count: {{ processInfoItem?.oilCount }}</p>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup lang="ts">
  import {  } from '@/common/api/service/rbcclassification';
  import {onMounted, ref} from "vue";
  import { ProcessInfo } from '@/common/api/service/processinfo/dto/processinfoDto'
  const processInfoArray = ref<ProcessInfo[]>([]);
  
  
  onMounted(() => {
    fetchProcessInfo();
  });
  
  const fetchProcessInfo = async (): Promise<void> => {
    try {
      const response = await getProcessInfo();
      console.log('Process Info:', response.data);
      if(response.success){
        processInfoArray.value = response.data as unknown as ProcessInfo[];
      }
    } catch (error) {
      console.error('Error fetching Process Info:', error);
      // Handle errors
    }
  };
  </script>
  