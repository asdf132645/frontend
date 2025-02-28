<template>
  <div class="settingWrapDiv">
    <ul class="settingTabBtn">
      <li
          v-for="tab in availableTabs"
          :key="tab"
          :class="{ activeTab: currentTab === tab }"
          @click="changeTab(tab)"
      >
        {{ tab }}
      </li>
    </ul>
    <component class="settingWrap" :is="currentTabComponent"/>

    <Confirm
        v-if="showConfirm"
        :is-visible="showConfirm"
        type="setting"
        :message="MESSAGES.settingNotSaved"
        @hide="hideConfirm"
        @okConfirm="handleOkConfirm"
    />

    <ToastNotification
        v-if="toastInfo.message"
        :message="toastInfo.message"
        :messageType="toastInfo.messageType"
        :duration="1500"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import AnalysisDatabase from "@/views/setting/analysisDatabase/index.vue";
import LoginAccount from "@/views/setting/lognAccount/index.vue";
import Report from "@/views/setting/report/index.vue";
import QualityCheck from "@/views/setting/qualityCheck/index.vue";
import Version from "@/views/setting/version/index.vue";
import {useStore} from "vuex";
import Confirm from "@/components/commonUi/Confirm.vue";
import {settingUpdate} from "@/common/lib/utils/settingSave";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";

const store = useStore();
const tabs = ['Login/Account', 'Analysis/Database', 'Report', 'Add-Ons', 'Version'] as const;
const viewerTabs = ['Login/Account', 'Analysis/Database', 'Version'] as const;
const currentTab = ref<typeof tabs[number]>(tabs[0]);
const movingTab = ref<typeof tabs[number]>(tabs[0]);
const showConfirm = ref(false);
const toastInfo = ref({message: '', messageType: ''});

const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const settingType = computed(() => store.state.commonModule.settingType);
const isSettingChanged = computed(() => beforeSettingFormattedString.value !== afterSettingFormattedString.value);
const availableTabs = computed(() => (viewerCheck.value === 'viewer' ? viewerTabs : tabs));

const components = {
  'Login/Account': LoginAccount,
  'Analysis/Database': AnalysisDatabase,
  'Report': Report,
  'Add-Ons': QualityCheck,
  'Version': Version,
};
const viewerComponents = {
  'Login/Account': LoginAccount,
  'Analysis/Database': AnalysisDatabase,
  'Version': Version,
};

const currentTabComponent = computed(() =>
    viewerCheck.value === 'viewer' ? viewerComponents[currentTab.value] : components[currentTab.value]
);

const changeTab = (tab: typeof tabs[number]) => {
  if (currentTab.value === tab) {
    return;
  }

  movingTab.value = tab;

  if (isSettingChanged.value) {
    showConfirm.value = true;
  } else {
    currentTab.value = tab;
  }
};

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  showConfirm.value = false;
  currentTab.value = movingTab.value;
};

const handleOkConfirm = async () => {
  showConfirm.value = false;

  try {
    await settingUpdate(settingType.value, JSON.parse(afterSettingFormattedString.value));
    showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
  } catch (e) {
    showToast(MSG.TOAST.SAVE_FAIL, MESSAGES.TOAST_MSG_ERROR);
  }
};

const showToast = (message: string, type: string) => {
  toastInfo.value = {message, messageType: type};
  setTimeout(() => (toastInfo.value.message = ''), 1500);
};

</script>