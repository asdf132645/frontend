<template>
  <div class="contentLeft" v-show="props.isClass">
    <Execute @initDataChangeText="initDataChangeText"/>
    <ProcessInfo :parsedData="props.parsedData" :pb100aCassette="pb100aCassette"/>
    <orderList :parsedData="props.parsedData" :startStatus="props.startStatus" :pb100aCassette="pb100aCassette"/>
  </div>
  <div class="contentRight" v-show="props.isClass">
    <workingView :initValData="initValData" :parsedData="props.parsedData" class="contentRightChild" v-if="pbVersion !== '100a'"/>
    <WorkingView100A :initValData="initValData" :parsedData="props.parsedData" :pb100aCassette="pb100aCassette" class="contentRightChild" v-else/>
    <rbcclassification @rbcUpdate="rbcUpdate" :parsedData="props.parsedData" v-if="!bmIsBoolen" class="contentRightChild"/>
    <wbcclassification @classInfoUpdate="classInfoUpdate" :parsedData="props.parsedData" :bmIsBoolen="bmIsBoolen" class="contentRightChild"/>
    <div class="contentBottom">
      <FoundingCells :parsedData="props.parsedData"/>
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
import {defineEmits, defineProps, onMounted, ref, onBeforeMount} from "vue";
import WorkingView100A from "@/views/analysis/commponent/workingView100A.vue";
import router from "@/router";
const emits = defineEmits();

const bmIsBoolen = ref(false);
const props = defineProps(['parsedData','isClass', 'startStatus', 'pb100aCassette']);
const pbVersion = ref<any>('');
const initValData = ref(false);
const viewerCheckSessionStorageData = sessionStorage.getItem('viewerCheck');

onBeforeMount(async () => {
  if (viewerCheckSessionStorageData === 'viewer') {
    router.push('/database')
  }

  if (window.PROJECT_TYPE === 'bm') {
    bmIsBoolen.value = true;
  }else {
    bmIsBoolen.value = false;
    pbVersion.value = window.PB_VERSION;
  }
});

const rbcUpdate = (data: any) => {
  emits('rbcAppUpdate', data);
}

const classInfoUpdate = (data: any) => {
  emits('classAppUpdateLast', data);
}

const initDataChangeText = (val: any) => {
  initValData.value = val;
}

</script>

<style lang="css" scoped src="@/assets/css/layout.css">
</style>
