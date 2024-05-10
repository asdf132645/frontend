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
      <tbody v-if="runningArr.length > 0">
      <tr v-for="(slot, index) in runningArr" :key="index">
        <td>{{ slot?.slotInfo?.barcodeNo }}</td>
        <td>{{ slot?.slotInfo?.patientNm }}</td>
        <!--    0019는 길병원(검사 끝나는 시간으로 해달라는 길병원 요구)    -->
        <td>{{
            slot?.slotInfo?.analyzedDttm ? formatDateString(slot?.slotInfo?.analyzedDttm) : formatDateString(slot?.slotInfo?.orderDttm)
          }}
        </td>
        <td>{{ getCommonCode('14', slot?.slotInfo?.stateCd) }}</td>
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
import {computed, defineProps, getCurrentInstance, nextTick, onMounted, ref, watch} from "vue";
import {getCommonCode, stringToDateTime} from "@/common/lib/utils/conversionDataUtils";
import {useStore} from "vuex";
import {SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {formatDateString} from "@/common/lib/utils/dateUtils";
import EventBus from "@/eventBus/eventBus";

// 스토어
const store = useStore();
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const runningArr = computed(() => store.state.commonModule.runningArr);
const props = defineProps(['parsedData']);

// end 스토어
const dspOrderList = ref<any>([]);
const siteCd = ref('');
watch(
    () => props.parsedData,
    (newVal, oldVal) => {
      runningInfoGet(newVal);
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