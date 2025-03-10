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

    <ConfirmThreeBtn
        v-if="showConfirm"
        :is-visible="showConfirm"
        :message="confirmMessage"
        :confirmFirstText="MESSAGES.SAVE"
        :confirmSecondText="MESSAGES.LEAVE"
        :closeText="MESSAGES.CANCEL"
        @hide="closeConfirm"
        @okConfirm="handleOkConfirm"
        @okConfirm2="hideConfirm"
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
import {useToast} from "@/common/lib/utils/toast";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";

const store = useStore();
const tabs = ['Login/Account', 'Analysis/Database', 'Report', 'Add-Ons', 'Version'] as const;
const viewerTabs = ['Login/Account', 'Analysis/Database', 'Version'] as const;
const currentTab = ref<typeof tabs[number]>(tabs[0]);
const movingTab = ref<typeof tabs[number]>(tabs[0]);
const showConfirm = ref(false);
const confirmMessage = ref('');

const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const settingType = computed(() => store.state.commonModule.settingType);
const isSettingChanged = computed(() => beforeSettingFormattedString.value !== afterSettingFormattedString.value);
const availableTabs = computed(() => (viewerCheck.value === 'viewer' ? viewerTabs : tabs));
const { toastInfo, showToast } = useToast();

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
    confirmMessage.value = MESSAGES.settingNotSaved;
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

const closeConfirm = () => {
  showConfirm.value = false;
}

const handleOkConfirm = async () => {
  showConfirm.value = false;

  try {
    await settingUpdate(settingType.value, JSON.parse(afterSettingFormattedString.value));
    showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
  } catch (e) {
    showToast(MSG.TOAST.SAVE_FAIL, MESSAGES.TOAST_MSG_ERROR);
  }
};

</script>