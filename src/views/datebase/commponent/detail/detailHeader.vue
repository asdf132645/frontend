<template>
  <div class="topClintInfo">
    <ul>
      <li>{{ testType }}</li>
      <li v-if="barcodeNo">{{ barcodeNo }}</li>
      <li v-if="analyzedDttm">{{ getDateTimeYYYYMMDDHHmmss(analyzedDttm) }}</li>
      <li v-if="cbcPatientNo">{{ cbcPatientNo }}</li>
      <template v-if="cbcPatientName || patientName">
        <li v-if="cbcPatientName">{{ cbcPatientName }}</li>
        <li v-else-if="patientName">{{ patientName }}</li>
      </template>
      <li v-if="cbcSex">{{ cbcSex }}</li>
      <li v-if="cbcAge">{{ cbcAge }}</li>
      <li v-if="hospitalName">{{ hospitalName }}</li>
      <li v-if="slideStatus" class="slideStatus"
          @mouseenter="tooltipVisibleFunc('slideStatus', true)"
          @mouseleave="tooltipVisibleFunc('slideStatus', false)"
      >
        Slide Condition : {{ slideStatus }}
        <Tooltip :isVisible="tooltipVisible.slideStatus" className="mb08" position="bottom" type=""
                 :message="`${slideStatusDesc}`"/>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {defineProps, watch, defineEmits, ref, onMounted, computed, onBeforeMount, reactive} from 'vue';
import {getDateTimeYYYYMMDDHHmmss} from "@/common/lib/utils/dateUtils";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {useStore} from "vuex";
import Tooltip from "@/components/commonUi/Tooltip.vue";

const props = defineProps(['testType', 'barcodeNo', 'cbcPatientNo', 'patientName', 'hospitalName', 'cbcPatientName', 'cbcSex', 'cbcAge', 'analyzedDttm', 'slideData']);
const emits = defineEmits();
const store = useStore();
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const slideData = computed(() => store.state.slideDataModule);
const projectBm = ref(false);
const tooltipVisible = reactive({
  slideStatus: false,
})
const slideStatus = ref('');
const slideStatusDesc = ref('');
watch(() => props.slideData, (newSlideData) => {
  if (!newSlideData.cbcPatientNm || newSlideData.cbcPatientNm === '' || newSlideData.cbcPatientNm !== newSlideData.patientNm) {
    emits('updateSlideDataByCBCData', newSlideData);
  }
})
onBeforeMount(() => {
  projectBm.value = window.PROJECT_TYPE === 'bm';
})
onMounted(async () => {
  const path = pbiaRootDir.value;
  const folderPath = !projectBm.value ? '01_WBC_Classification' : '04_BM_Classification';
  const url_new = `${path}/${slideData.value.slotId}/${folderPath}/Slide_Condition.json`;
  const response_new = await readJsonFile({fullPath: url_new});
  slideStatus.value = response_new?.data?.condition;
  slideStatusDesc.value = response_new?.data?.description;
})
const tooltipVisibleFunc = (type: 'slideStatus', visible: boolean) => {
  tooltipVisible[type] = visible;
}

</script>