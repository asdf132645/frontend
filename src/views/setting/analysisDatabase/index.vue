<template>
  <div>
    <div>
      <button @click="activateTab('cellImageAnalyzed')">Cell Image Analyzed</button>
      <button @click="activateTab('rbcDegree')">RBC Degree</button>
      <button @click='activateTab("deviceControls")'>Device controls</button>
    </div>

    <div>
      <component :is="activeTabComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import CellImageAnalyzed from "@/views/setting/analysisDatabase/component/cellImageAnalyzed.vue";
import RbcDegree from "@/views/setting/analysisDatabase/component/rbcDegree.vue";
import DeviceControls from '@/views/setting/analysisDatabase/component/deviceControls.vue'
const activeTab = ref('cellImageAnalyzed');

const activateTab = (tabName: string) => {
  activeTab.value = tabName;
};

const activeTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'cellImageAnalyzed':
      return CellImageAnalyzed;
    case 'rbcDegree':
      return RbcDegree;
    case 'deviceControls':
      return DeviceControls;
    default:
      return null;
  }
});
</script>
