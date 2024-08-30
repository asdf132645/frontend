<template>
  <div>
    <div class="settingTabSubButtons">
      <button @click="activateTab('cellImageAnalyzed')" :class="{ 'active': activeTab === 'cellImageAnalyzed' }">Cell Image Analyzed</button>
      <template v-if="viewerCheck !== 'viewer'">
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
      </template>
    </div>

    <div class="tab-content">
      <component :is="activeTabComponent" />
    </div>
  </div>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :message="confirmMessage"
      :confirmText="messages.SAVE"
      :closeText="messages.LEAVE"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />

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
import {useStore} from "vuex";
import Alert from "@/components/commonUi/Alert.vue";
import {messages} from "@/common/defines/constFile/constantMessageText";
import Confirm from "@/components/commonUi/Confirm.vue";
import {settingUpdate} from "@/common/lib/utils/settingSave";

const store = useStore();
const activeTab = ref('cellImageAnalyzed');
const projectType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');

const movingTab = ref('');
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const settingType = computed(() => store.state.commonModule.settingType);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);

onMounted(async () => {
  projectType.value = window.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
})

const activateTab = (tabName: string) => {
  if (activeTab.value === tabName) return;
  movingTab.value = tabName;
  if (beforeSettingFormattedString.value !== afterSettingFormattedString.value) {
    showConfirm.value = true;
    confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
  } else {
    activeTab.value = movingTab.value;
  }
};

const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
}

const showErrorAlert = async (message: string) => {
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

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  activeTab.value = movingTab.value;
  showConfirm.value = false;
}

const handleOkConfirm = async () => {
  showConfirm.value = false;
  try {
    console.log(settingType.value);
    await settingUpdate(settingType.value, JSON.parse(afterSettingFormattedString.value));
    await showSuccessAlert(messages.settingSaveSuccess);
  } catch (e) {
    await showErrorAlert(messages.settingSaveFailure);
  }
}

</script>
