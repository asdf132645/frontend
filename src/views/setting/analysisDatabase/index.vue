<template>
  <div>
    <div class="settingTabSubButtons">
      <button @click="activateTab('cellImageAnalyzed')" :class="{ 'active': activeTab === 'cellImageAnalyzed' }">Cell Image Analyzed</button>
      <button v-if="projectType === 'pb'" @click="activateTab('rbcDegree')" :class="{ 'active': activeTab === 'rbcDegree' }">RBC Degree</button>
      <button @click='activateTab("deviceControls")' :class="{ 'active': activeTab === 'deviceControls' }">Device Controls</button>
      <button @click='activateTab("wbcRunningCount")' :class="{ 'active': activeTab === 'wbcRunningCount' }">WBC Running Count</button>
      <button @click='activateTab("wbcCustomClass")' :class="{ 'active': activeTab === 'wbcCustomClass' }">
        {{ projectType === 'pb' ? 'WBC' : 'BM' }} Custom Class
      </button>
      <button @click='activateTab("wbcHotKeys")' :class="{ 'active': activeTab === 'wbcHotKeys' }">
        {{ projectType === 'pb' ? 'WBC' : 'BM' }} Hot Keys
      </button>
      <button v-if="projectType === 'pb'" @click='activateTab("bfHotKeys")' :class="{ 'active': activeTab === 'bfHotKeys' }">BF Hot Keys</button>
      <button @click='activateTab("normalRange")' :class="{ 'active': activeTab === 'normalRange' }">Normal Range</button>
      <button @click='activateTab("wbcOrder")' :class="{ 'active': activeTab === 'wbcOrder' }">
        {{ projectType === 'pb' ? 'WBC' : 'BM' }} Order
      </button>
    </div>

    <div class="tab-content">
      <component :is="activeTabComponent" />
    </div>
  </div>

  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import CellImageAnalyzed from "@/views/setting/analysisDatabase/component/cellImageAnalyzed.vue";
import RbcDegree from "@/views/setting/analysisDatabase/component/rbcDegree.vue";
import DeviceControls from '@/views/setting/analysisDatabase/component/deviceControls.vue'
import WbcCustomClass from '@/views/setting/analysisDatabase/component/customClass.vue'
import WbcHotKey from "@/views/setting/analysisDatabase/component/wbcHotKeys.vue";
import BfHotKey from '@/views/setting/analysisDatabase/component/bfHotKeys.vue';
import NormalRange from "@/views/setting/analysisDatabase/component/normalRange.vue";
import WbcOrder from "@/views/setting/analysisDatabase/component/classOrder.vue";
import WbcRunningCount from "@/views/setting/analysisDatabase/component/wbcRunningCount.vue";
import process from "process";
import {useStore} from "vuex";
import {before} from "lodash";
import Alert from "@/components/commonUi/Alert.vue";

const store = useStore();
const activeTab = ref('cellImageAnalyzed');
const projectType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);

const activateTab = (tabName: string) => {
  if (beforeSettingFormattedString.value !== afterSettingFormattedString.value) {
    showErrorAlert('Setting Not Saved');
    return;
  }
  activeTab.value = tabName;
};

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
}

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
    case 'wbcRunningCount':
      return WbcRunningCount;
    default:
      return null;
  }
});
onMounted(async () => {
  projectType.value = window.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
})

</script>
