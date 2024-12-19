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
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps, watch, defineEmits } from 'vue';
import { getDateTimeYYYYMMDDHHmmss } from "@/common/lib/utils/dateUtils";

const props = defineProps(['testType', 'barcodeNo', 'cbcPatientNo', 'patientName', 'hospitalName', 'cbcPatientName', 'cbcSex', 'cbcAge', 'analyzedDttm', 'slideData']);
const emits = defineEmits()

watch(() => props.slideData, (newSlideData) => {
  if (!newSlideData.cbcPatientNm || newSlideData.cbcPatientNm === '' || newSlideData.cbcPatientNm !== newSlideData.patientNm) {
    emits('updateSlideDataByCBCData', newSlideData);
  }
})

</script>