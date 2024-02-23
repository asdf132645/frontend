<template>
  <div>
    <div>
      <button @click="activateTab('cellImageAnalyzed')">Cell Image Analyzed</button>
      <button @click="activateTab('rbcDegree')">RBC Degree</button>
      <button @click='activateTab("deviceControls")'>Device controls</button>
      <button @click='activateTab("wbcCustomClass")'>WBC Custom Class</button>
      <button @click='activateTab("wbcHotKeys")'>WBC Hot Keys</button>
      <button @click='activateTab("bfHotKeys")'>BF Hot Keys</button>
      <button @click='activateTab("normalRange")'>Normal Range</button>
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
import WbcCustomClass from '@/views/setting/analysisDatabase/component/wbcCustomClass.vue'
import WbcHotKey from "@/views/setting/analysisDatabase/component/wbcHotKeys.vue";
import BfHotKey from '@/views/setting/analysisDatabase/component/bfHotKeys.vue';
import NormalRange from "@/views/setting/analysisDatabase/component/normalRange.vue";
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
    case 'wbcCustomClass':
      return WbcCustomClass;
    case 'wbcHotKeys':
      return WbcHotKey;
    case 'bfHotKeys':
      return BfHotKey;
    case 'normalRange':
      return NormalRange;
    default:
      return null;
  }
});
</script>
