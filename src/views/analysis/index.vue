<template>
  <div class="contentLeft">
    <Execute/>
    <ProcessInfo/>
    <orderList/>
  </div>
  <div class="contentRight">
    <workingView class="contentRightChild"/>
    <rbcclassification v-if="!bmIsBoolen" class="contentRightChild"/>
    <wbcclassification :bmIsBoolen="bmIsBoolen" class="contentRightChild"/>
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
import {onMounted, ref} from "vue";
import Bmclass from "@/views/analysis/commponent/bmclass.vue";
const bmIsBoolen = ref(false);

onMounted(async () => {
  if(process.env.PROJECT_TYPE === 'bm'){
    bmIsBoolen.value = true;
  }
});
</script>

<style lang="css" scoped src="@/assets/css/layout.css">
</style>
