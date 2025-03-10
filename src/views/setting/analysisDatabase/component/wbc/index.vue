<template>
  <div class="setting-container">
    <div class="setting-activeBtn-container">
      <Button @click="handleSettingMenu('runningCount')" :isActive="activeTab === 'runningCount'">Custom WBC Running Count</Button>
      <Button @click="handleSettingMenu('customClass')" :isActive="activeTab === 'customClass'">Custom Class</Button>
      <Button @click="handleSettingMenu('normalRange')" :isActive="activeTab === 'normalRange'">Normal Range</Button>
      <Button @click="handleSettingMenu('classOrder')" :isActive="activeTab === 'classOrder'">Class Order</Button>
      <Button @click="handleSettingMenu('hotkey')" :isActive="activeTab === 'hotkey'">Hot keys</Button>
    </div>
  </div>

  <component :is="activeTabComponent"/>

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

  <!-- 모달 창 -->
  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />

  <ToastNotification
      v-if="toastInfo.message"
      :message="toastInfo.message"
      :messageType="toastInfo.messageType"
      :duration="1500"
  />
</template>

<script setup lang="ts">
import {computed, onBeforeMount, ref, watch} from "vue";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import Button from "@/components/commonUi/Button.vue";
import {WbcActiveSettingType} from "@/common/type/settings";
import ClassOrder from "@/views/setting/analysisDatabase/component/wbc/component/classOrder.vue";
import CustomClass from "@/views/setting/analysisDatabase/component/wbc/component/customClass.vue";
import NormalRange from "@/views/setting/analysisDatabase/component/wbc/component/normalRange.vue";
import RunningCount from "@/views/setting/analysisDatabase/component/wbc/component/runningCount.vue";
import HotKeys from "@/views/setting/analysisDatabase/component/wbc/component/hotKeys.vue";
import {settingUpdate} from "@/common/lib/utils/settingSave";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useToast} from "@/common/lib/utils/toast";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";

const store = useStore();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const isSettingChanged = computed(() => beforeSettingFormattedString.value !== afterSettingFormattedString.value);
const settingType = computed(() => store.state.commonModule.settingType);
const projectType = ref('');
const activeTab = ref('runningCount');
const movingTab = ref('');
const { toastInfo, showToast } = useToast();

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const activeTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'runningCount':
      return RunningCount;
    case 'customClass':
      return CustomClass;
    case 'normalRange':
      return NormalRange;
    case 'classOrder':
      return ClassOrder;
    case 'hotkey':
      return HotKeys;
    default:
      return null;
  }
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.settingNotSaved;
}

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  showConfirm.value = false;
  activeTab.value = movingTab.value;
}

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
}

const handleSettingMenu = (type: keyof WbcActiveSettingType) => {
  if (activeTab.value === type) {
    return;
  }

  movingTab.value = type;

  if (isSettingChanged.value) {
    showConfirm.value = true;
    confirmMessage.value = MESSAGES.settingNotSaved;
    return;
  }

  activeTab.value = type;
}

</script>