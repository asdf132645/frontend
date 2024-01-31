<template>
  <div class="mt2">
    <h3 class="titleText"> <span class="greenColor">P</span>rocessing <span class="greenColor">I</span>nformation </h3>
    <ul>
      <p>Cassette No: {{ processInfoItem?.cassetteNo }}</p>
      <p>Barcode ID: {{ processInfoItem?.barcodeId }}</p>
      <p>Patient ID: {{ processInfoItem?.patientId }}</p>
      <p>patient Name: {{ processInfoItem?.patientName }}</p>
      <p>WBC Count: {{ processInfoItem?.wbcCount }}</p>
      <p>Order Date: {{ processInfoItem?.orderDate }}</p>
      <p>Oil Count: {{ processInfoItem?.oilCount }}</p>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, getCurrentInstance, computed, watch} from "vue";
import {useStore} from "vuex";
// 스토어
const store = useStore();
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const {isPause, isRunningState, userStop, isRecoveryRun, isInit} = embeddedStatusJobCmd.value ?? {};

const processInfoModule = computed(() => store.state.processInfoModule);
const {cassetteNo, barcodeId, patientId, patientName, wbcCount, orderDate, oilCount} = processInfoModule.value ?? {};

// 스토어 end

import { ProcessInfo } from '@/common/api/service/processinfo/dto/processinfoDto'
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
watch([embeddedStatusJobCmd, processInfoModule], () => {
  processInfoItem.value = {
    cassetteNo,
    barcodeId,
    patientId,
    patientName,
    wbcCount,
    orderDate,
    oilCount,
  };
});

</script>
