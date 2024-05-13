<template>
  <div class="contentLeft">
    <Execute/>
    <ProcessInfo :parsedData="props.parsedData"/>
    <orderList :parsedData="props.parsedData"/>
  </div>
  <div class="contentRight">
    <workingView class="contentRightChild"/>
    <rbcclassification @rbcUpdate="rbcUpdate" :parsedData="props.parsedData" v-if="!bmIsBoolen" class="contentRightChild"/>
    <wbcclassification @classInfoUpdate="classInfoUpdate" :parsedData="props.parsedData" :bmIsBoolen="bmIsBoolen" class="contentRightChild"/>
    <div class="contentBottom">
      <FoundingCells/>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProcessInfo from '@/views/analysis/commponent/processInfo.vue';
import Execute from '@/views/analysis/commponent/execute.vue';
import workingView from '@/views/analysis/commponent/workingView.vue';
import orderList from './commponent/orderList.vue';
import wbcclassification from './commponent/classInfoification.vue';
import rbcclassification from './commponent/rbcclassification.vue';
import FoundingCells from "@/views/analysis/commponent/foundingCells.vue";
import {defineEmits, defineProps, onMounted, ref} from "vue";
const emits = defineEmits();

const bmIsBoolen = ref(false);
const props = defineProps(['parsedData']);

onMounted(async () => {
  if (process.env.PROJECT_TYPE === 'bm') {
    bmIsBoolen.value = true;
  }
});

const rbcUpdate = (data: any) => {
  emits('rbcAppUpdate', data);
}

const classInfoUpdate = (data: any) => {
  emits('classAppUpdate', data);
}

</script>

<style lang="css" scoped src="@/assets/css/layout.css">
</style>
