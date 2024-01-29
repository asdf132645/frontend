<template>
    <div class="mt2">
      <h3 class="titleText"> <span class="greenColor">RBC</span> <span class="greenColor">C</span>lassification </h3>
      <ul>
        <li v-for="rbcInfoItem in rbcInfoArray" :key="rbcInfoItem?.id">
          <p>{{ rbcInfoItem?.category }}</p>
          <p>{{ rbcInfoItem?.class }}</p>
          <p>{{ rbcInfoItem?.degree }}</p>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup lang="ts">
  import { getAllRbc } from '@/common/api/service/rbcclassification/rbcclassificationApi';
  import {onMounted, ref} from "vue";
  import { RBCClassificationRes } from '@/common/api/service/rbcclassification/dto/rbcclassificationDto'
  const rbcInfoArray = ref<RBCClassificationRes[]>([]);
  
  
  onMounted(() => {
    fetchRbcInfo();
  });
  
  const fetchRbcInfo = async (): Promise<void> => {
    try {
      const response = await getAllRbc();
      console.log('RBCClassificationRes Info:', response.data);
      if(response.success){
        rbcInfoArray.value = response.data as unknown as RBCClassificationRes[];
      }
    } catch (error) {
      console.error('Error fetching RBCClassificationRes Info:', error);
      // Handle errors
    }
  };
  </script>
  