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
import {computed, defineProps , nextTick , ref, watch} from "vue";
import {getCommonCode, stringToDateTime} from "@/common/lib/utils/conversionDataUtils";
import {useStore} from "vuex";
import {formatDateString} from "@/common/lib/utils/dateUtils";

// 스토어
const store = useStore();
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const props = defineProps(['parsedData', 'startStatus','pb100aCassette']);

// end 스토어
const dspOrderList = ref<any>([]);
const siteCd = ref('');
watch(
    () => props.parsedData,
    (newVal) => {
      console.log(newVal)
      runningInfoGet(newVal);
    },
    { deep: true }
);

watch(
    () => props.pb100aCassette,
    (newVal) => {
      if(newVal === 'reset'){
        console.log('pb100aCassette')
        dspOrderList.value = [];
      }
    },
    { deep: true }
);


watch(
    () => props.startStatus,
    (newVal) => {
      if(newVal === true){
        dspOrderList.value = [];
        console.log(dspOrderList.value)
      }
    },
    { deep: true }
);
const runningInfoGet = async (data: any) => {
  const parsedData = data
  if(parsedData.jobCmd === 'RUNNING_INFO'){
    const currentSlot = parsedData?.slotInfo
    if (currentSlot) {
      const barcodeNo = currentSlot.barcodeNo;
      const existingItemIndex = dspOrderList.value.findIndex((item: any) => item.barcodeId === barcodeNo);
      if (existingItemIndex === -1 && barcodeNo !== '') {
        if(dspOrderList.value.length > 1){
          dspOrderList.value[dspOrderList.value.length - 1].state = '3';
        }
        dspOrderList.value.push({
          barcodeId: barcodeNo,
          patientName: currentSlot.patientNm,
          orderDate: stringToDateTime(currentSlot.orderDttm),
          analyzedDttm: stringToDateTime(currentSlot.analyzedDttm),
          state: currentSlot.stateCd,
        });
      }
    }
  }
}

watch([embeddedStatusJobCmd.value], async (newVals) => {
  // console.log('감시시작')
  const [newEmbeddedStatusJobCmd] = newVals;

  await nextTick();
  const {
    siteCd: siteCdCode,
  } = newEmbeddedStatusJobCmd || {};
  siteCd.value = siteCdCode;

});

</script>