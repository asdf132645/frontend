<template>
  <div class="mt2">
    <h3 class="titleText"><span class="greenColor">P</span>rocessing <span class="greenColor">I</span>nformation </h3>
    <ul>
      <li>Cassette No: {{ processInfoItem?.cassetteNo }}</li>
      <li>Barcode ID: {{ processInfoItem?.barcodeId }}</li>
      <li>Patient ID: {{ processInfoItem?.patientId }}</li>
      <li>patient Name: {{ processInfoItem?.patientName }}</li>
      <li>WBC Count: {{ processInfoItem?.wbcCount }}</li>
      <li>Order Date: {{ processInfoItem?.orderDate }}</li>
      <li>Oil Count: {{ processInfoItem?.oilCount }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import {useStore} from "vuex";
// 스토어
const store = useStore();

const processInfoModule = computed(() => store.state.processInfoModule);
const {cassetteNo, barcodeId, patientId, patientName, wbcCount, orderDate, oilCount} = processInfoModule.value ?? {};

// 스토어 end

import {ProcessInfo} from '@/common/api/service/processinfo/dto/processinfoDto'
// processInfoItem 초기화
const processInfoItem = ref<ProcessInfo>({
  cassetteNo: cassetteNo ?? "",
  barcodeId: barcodeId ?? "",
  patientId: patientId ?? "",
  patientName: patientName ?? "",
  wbcCount: wbcCount ?? "",
  orderDate: orderDate ?? "",
  oilCount: oilCount ?? "",
});


// 스토어 변경 감시
watch([processInfoModule.value], (newVal: ProcessInfo[]) => {
  console.log(newVal)
  if (newVal.length > 0) {
    const firstItem = newVal[0]; // Assuming you want the first item in the array
    console.log(firstItem)
    processInfoItem.value = {
      cassetteNo: firstItem.cassetteNo,
      barcodeId: firstItem.barcodeId,
      patientId: firstItem.patientId,
      patientName: firstItem.patientName,
      wbcCount: firstItem.wbcCount,
      orderDate: firstItem.orderDate,
      oilCount: firstItem.oilCount,
    };
  }
});


</script>
