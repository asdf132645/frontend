<template>
  <div class="contentLeft" v-show="props.isClass">
    <Execute/>
    <ProcessInfo :parsedData="parsedDataChild"/>
    <orderList :parsedData="parsedDataChild"/>
  </div>
  <div class="contentRight" v-show="props.isClass">
    <workingView class="contentRightChild"/>
    <rbcclassification @rbcUpdate="rbcUpdate" :parsedData="parsedDataChild" v-if="!bmIsBoolen" class="contentRightChild"/>
    <wbcclassification @classInfoUpdate="classInfoUpdate" :parsedData="parsedDataChild" :bmIsBoolen="bmIsBoolen" class="contentRightChild"/>
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
import {defineEmits, defineProps, onMounted, ref, watch} from "vue";
const emits = defineEmits();
const parsedDataChild = ref<any>({});

const bmIsBoolen = ref(false);
const props = defineProps(['parsedData','isClass']);

onMounted(async () => {
  if (process.env.PROJECT_TYPE === 'bm') {
    bmIsBoolen.value = true;
  }
});

watch(
    () => props.parsedData, // 감시할 데이터
    (newVal, oldVal) => {
      // 데이터 변경 시 실행할 코드
      parsedDataChild.value = newVal;
    },
    { deep: true }
);

const rbcUpdate = (data: any) => {
  emits('rbcAppUpdate', data);
}

const classInfoUpdate = (data: any) => {
  console.log('중간',data)
  emits('classAppUpdate', data);
}

</script>

<style lang="css" scoped src="@/assets/css/layout.css">
</style>
