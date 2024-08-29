<template>
  <div class="settingWrapDiv">
    <ul class="settingTabBtn">
      <template v-if="viewerCheck === 'viewer'">
        <li v-for="tab in viewerTabs" :key="tab" :class="{ activeTab: currentTab === tab }" @click="changeTab(tab)">{{ tab }}</li>
      </template>
      <template v-else>
        <li v-for="tab in tabs" :key="tab" :class="{ activeTab: currentTab === tab }" @click="changeTab(tab)">{{ tab }}</li>
      </template>
    </ul>
    <component class="settingWrap" :is="currentTabComponent" />
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
import {ref, computed} from 'vue';
import AnalysisDatabase from "@/views/setting/analysisDatabase/index.vue";
import LoginAccount from "@/views/setting/lognAccount/index.vue";
import Report from "@/views/setting/report/index.vue";
import QualityCheck from "@/views/setting/qualityCheck/index.vue";
import Version from "@/views/setting/version/index.vue";
import {useStore} from "vuex";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {settingUpdate} from "@/common/lib/utils/settingSave";
import {messages} from "@/common/defines/constFile/constantMessageText";

const store = useStore();
const tabs = ['Login/Account', 'Analysis/Database', 'Report', 'Quality Check', 'Version'] as const;
const viewerTabs = ['Login/Account', 'Analysis/Database', 'Version'] as const;
const currentTab = ref<typeof tabs[number]>(tabs[0]);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const settingType = computed(() => store.state.commonModule.settingType);
const showConfirm = ref(false);
const confirmMessage = ref('');
const movingTab = ref<typeof tabs[number]>(tabs[0]);

const changeTab = (tab: typeof tabs[number]) => {
  if (currentTab.value === tab) return;

  movingTab.value = tab;
  if (beforeSettingFormattedString.value !== afterSettingFormattedString.value) {
    showConfirm.value = true;
    confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
  } else {
    currentTab.value = movingTab.value;
    sessionStorage.setItem('selectedTab', movingTab.value);
  }
};

const components = { 'Login/Account': LoginAccount, 'Analysis/Database': AnalysisDatabase, 'Report': Report, 'Quality Check': QualityCheck, 'Version': Version };
const viewerComponents: any = { 'Login/Account': LoginAccount, 'Version': Version, 'Analysis/Database': AnalysisDatabase };

const storedTab = sessionStorage.getItem('selectedTab');
if (storedTab && tabs.includes(storedTab as typeof tabs[number])) {
  currentTab.value = storedTab as typeof tabs[number];
}

const currentTabComponent = computed(() => {
  if (viewerCheck.value === 'viewer') {
    return viewerComponents[currentTab.value];
  }
  return components[currentTab.value];
});

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
}

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
}

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  currentTab.value = movingTab.value;
  showConfirm.value = false;
}

const handleOkConfirm = async () => {
  showConfirm.value = false;
  try {
    console.log('seeting');
    await settingUpdate(settingType.value, JSON.parse(afterSettingFormattedString.value));
    await showSuccessAlert(messages.settingSaveSuccess);
  } catch (e) {
    await showErrorAlert(messages.settingSaveFailure);
  }
}

</script>
