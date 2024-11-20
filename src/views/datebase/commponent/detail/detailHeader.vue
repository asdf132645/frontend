<template>
  <div class="topClintInfo">
    <ul>
      <li>{{ testType }}</li>
      <li v-show="barcodeNo">{{ barcodeNo }}</li>
      <li v-show="analyzedDttm">{{ getDateTimeYYYYMMDDHHmmss(analyzedDttm) }}</li>
      <li v-show="cbcPatientNo">{{ cbcPatientNo }}</li>
      <li v-show="patientName">{{ patientName }}</li>
      <li v-show="cbcPatientName">{{ cbcPatientName}}</li>
      <li v-show="cbcSex">{{ cbcSex }}</li>
      <li v-show="cbcAge">{{ cbcAge }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { getDateTimeYYYYMMDDHHmmss } from "@/common/lib/utils/dateUtils";

const props = defineProps(['testType', 'barcodeNo', 'cbcPatientNo', 'patientName', 'hospitalName', 'cbcPatientName', 'cbcSex', 'cbcAge', 'analyzedDttm']);


</script>