<template>
  <div>
    <h3 class="titleText">Processing Information </h3>
    <ul class='processInfoUl'>
      <li><span class="proSpan">Cassette No</span> <span class="proVal">{{ processInfoItem?.cassetteNo }}</span></li>
      <li><span class="proSpan">Barcode ID</span> <span class="proVal">{{ processInfoItem?.barcodeId }}</span></li>
      <li><span class="proSpan">Patient ID</span> <span class="proVal">{{ processInfoItem?.patientId }}</span></li>
      <li><span class="proSpan">Patient Name</span> <span class="proVal">{{ processInfoItem?.patientName }}</span></li>
      <li>
        <span class="proSpan">{{ projectBm ? 'BM CELL Count ' : 'WBC Count ' }} </span>
        <span class="proVal">{{ processInfoItem?.wbcCount }}</span></li>
      <li>
        <template v-if="visibleBySite(siteCd, [HOSPITAL_SITE_CD_BY_NAME['인천길병원']], 'enable')">
          <span class="proSpan">Order Date</span>
          <span class="proVal">{{ processInfoItem?.analyzedDttm }}</span>
        </template>
        <template v-else>
          <span class="proSpan">Analyzed Date</span>
          <span class="proVal">{{ processInfoItem?.orderDate }}</span>
        </template>
      </li>
      <li>
        <span class="proSpan">Oil Count</span>
        <span class="proVal">{{ prevOilCount }}</span>
      </li>
      <li>
        <span class="proSpan">{{ currentCardName }}</span>
        <span class="proVal">{{ currentCardCount }}</span>
      </li>
    </ul>
  </div>
</template>



<script setup lang="ts">
import {ref, computed, watch, onMounted, getCurrentInstance, defineProps} from "vue";
import {useStore} from "vuex";
import {stringToDateTime} from "@/common/lib/utils/conversionDataUtils";
import process from "process";
import {HOSPITAL_SITE_CD_BY_NAME} from "../../../common/defines/constants/siteCd";
import {visibleBySite} from "@/common/lib/utils/visibleBySite";
const props = defineProps([ 'parsedData']);

// 스토어
const store = useStore();
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const siteCd = computed(() => store.state.commonModule.siteCd);

// processInfoItem 초기화
const processInfoItem = ref<any>({});
const prevOilCount = ref<string | null>(null);
const instance = getCurrentInstance();
const projectBm = ref(false);
const currentCardCount = ref('');
const currentCardName = ref('');

watch([embeddedStatusJobCmd.value], async (newVal) => {
  if (newVal.length > 0) {
    const sysInfo = newVal[0].sysInfo;
    if(sysInfo.oilCount !== prevOilCount.value){
      processInfoItem.value.oilCount = sysInfo.oilCount;
      prevOilCount.value = sysInfo.oilCount;
    }
    currentCardCount.value = sysInfo.currentCardCount;
    currentCardName.value = sysInfo.currentCardName;
  }
})

onMounted(() => {
  prevOilCount.value = embeddedStatusJobCmd.value[0]?.sysInfo.oilCount;
  projectBm.value = window.PROJECT_TYPE === 'bm';
});

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
    const currentSlot = parsedData?.slotInfo;
    if (currentSlot) {
      processInfoItem.value = {
        cassetteNo: parsedData.cassetId ?? '',
        barcodeId: currentSlot.barcodeNo,
        patientId: currentSlot.patientId,
        patientName: currentSlot.patientNm,
        // wbcCount: currentSlot.maxWbcCount,
        orderDate: stringToDateTime(currentSlot.orderDttm),
        analyzedDttm: stringToDateTime(currentSlot.analyzedDttm),
      };
    }
  }
}



// 실행정보를 가지고 온다.

</script>
