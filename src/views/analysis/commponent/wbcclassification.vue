<template>
    <div class="mt2">
      <h3 class="titleText"> <span class="greenColor">WBC</span> <span class="greenColor">C</span>lassification </h3>
      <ul v-if="wbcInfoArray.length">
        <li v-for="wbcInfoItem in wbcInfoArray" :key="wbcInfoItem.id">
            <p>{{ wbcInfoItem.class }}</p>
            <p>{{ wbcInfoItem.count }}</p>
            <p>{{ wbcInfoItem.percent }}</p>
        </li>
      </ul>
       <p v-else>No data available</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { getAllWbc } from '@/common/api/service/wbcclassification/wbcclassificationApi';
  import {onMounted, ref} from "vue";
  import { WBClassificationRes } from '@/common/api/service/wbcclassification/dto/wbcclassificationDto'
  const wbcInfoArray = ref<WBClassificationRes[]>([]);
  
  
  onMounted(() => {
    fetchWbcInfo();
    // console.log(wbcInfoArray)
  });
  
  const fetchWbcInfo = async (): Promise<void> => {
    try {
      const response = await getAllWbc();
      // console.log('WBClassificationRes Info:', response.data);
      if(response.success){
        wbcInfoArray.value = response.data as unknown as WBClassificationRes[];
        
      }
    } catch (error) {
      console.error('Error fetching WBClassificationRes Info:', error);
      // Handle errors
    }
  };
  </script>
  