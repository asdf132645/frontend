<template>
  <div class="orderListTableContainer">
    <h3 class="titleText"><span class="greenColor">O</span>rder <span class="greenColor">L</span>ist</h3>
    <table class="orderListTable">
      <thead>
      <tr>
        <th>Barcode ID</th>
        <th>Patient Name</th>
        <th>Order Date</th>
        <th>State</th>
      </tr>
      </thead>
      <tbody v-if="dspOrderList.length > 0">
      <tr v-for="(slot, index) in dspOrderList" :key="index">
        <td>{{ slot?.barcodeId }}</td>
        <td>{{ slot?.patientName }}</td>
        <!--    0019는 길병원(검사 끝나는 시간으로 해달라는 길병원 요구)    -->
        <td>{{
            slot?.analyzedDttm ? formatDateString(slot?.analyzedDttm) : formatDateString(slot?.orderDate)
          }}
        </td>
        <!--        {{ slot?.state }}-->
        <td>{{ getCommonCode('14', slot?.state) }}</td>
      </tr>
      </tbody>
      <tbody v-else>
      <tr>
        <td colspan="4">Data is empty.</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, nextTick, ref, watch} from "vue";
import {getCommonCode, stringToDateTime} from "@/common/lib/utils/conversionDataUtils";
import {useStore} from "vuex";
import {formatDateString} from "@/common/lib/utils/dateUtils";

// 스토어
const store = useStore();
const props = defineProps(['parsedData', 'startStatus', 'pb100aCassette']);
const siteCd = computed(() => store.state.commonModule.siteCd);

// end 스토어
const dspOrderList = ref<any>([]);

watch(
    () => props.parsedData,
    (newVal) => {
      console.log('orderList parser',newVal)
      runningInfoGet(newVal);
    },
    {deep: true}
);

watch(
    () => props.pb100aCassette,
    (newVal) => {
      if (newVal === 'reset') {
        dspOrderList.value = [];
        console.log('pb100aCassette 초기화', dspOrderList.value)
      }
    },
    {deep: true}
);


watch(
    () => props.startStatus,
    (newVal) => {
      if (newVal === true) {
        dspOrderList.value = [];
      }
    },
    {deep: true}
);
const runningInfoGet = async (data: any) => {
  const parsedData = data
  if (parsedData.jobCmd === 'RUNNING_INFO') {
    const currentSlot = parsedData?.slotInfo
    if (currentSlot) {
      const barcodeNo = currentSlot.barcodeNo;
      const existingItemIndex = dspOrderList.value.findIndex((item: any) => item.barcodeId === barcodeNo);
      if (existingItemIndex === -1 && barcodeNo !== '') {
        dspOrderList.value.push({
          barcodeId: barcodeNo,
          patientName: currentSlot.patientNm,
          orderDate: stringToDateTime(currentSlot.orderDttm),
          analyzedDttm: stringToDateTime(currentSlot.analyzedDttm),
          state: currentSlot.stateCd,
        });
      }else{
        dspOrderList.value[existingItemIndex] = {
          barcodeId: barcodeNo,
          patientName: currentSlot.patientNm,
          orderDate: stringToDateTime(currentSlot.orderDttm),
          analyzedDttm: stringToDateTime(currentSlot.analyzedDttm),
          state: currentSlot.stateCd,
        }
      }
    }
  }
}


</script>