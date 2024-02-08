<template>
  <div class="contentLeft">
    <Execute/>
    <ProcessInfo/>
    <orderList/>
  </div>
  <div class="contentRight">
    <workingView class="contentRightChild"/>
    <rbcclassification class="contentRightChild"/>
    <wbcclassification class="contentRightChild"/>
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
import wbcclassification from './commponent/wbcclassification.vue';
import rbcclassification from './commponent/rbcclassification.vue';
import FoundingCells from "@/views/analysis/commponent/foundingCells.vue";
</script>
