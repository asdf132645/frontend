<template>
  <div>
    <div class="tab-buttons">
      <button @click="activateTab('cellImageAnalyzed')" :class="{ 'active': activeTab === 'cellImageAnalyzed' }">Cell Image Analyzed</button>
      <button @click="activateTab('rbcDegree')" :class="{ 'active': activeTab === 'rbcDegree' }">RBC Degree</button>
      <button @click='activateTab("deviceControls")' :class="{ 'active': activeTab === 'deviceControls' }">Device controls</button>
      <button @click='activateTab("wbcCustomClass")' :class="{ 'active': activeTab === 'wbcCustomClass' }">WBC Custom Class</button>
      <button @click='activateTab("wbcHotKeys")' :class="{ 'active': activeTab === 'wbcHotKeys' }">WBC Hot Keys</button>
      <button @click='activateTab("bfHotKeys")' :class="{ 'active': activeTab === 'bfHotKeys' }">BF Hot Keys</button>
      <button @click='activateTab("normalRange")' :class="{ 'active': activeTab === 'normalRange' }">Normal Range</button>
      <button @click='activateTab("wbcOrder")' :class="{ 'active': activeTab === 'wbcOrder' }">WBC Order</button>
    </div>

    <div class="tab-content">
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
import WbcOrder from "@/views/setting/analysisDatabase/component/classOrder.vue";
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
    case 'wbcOrder':
      return WbcOrder;
    default:
      return null;
  }
});
</script>
