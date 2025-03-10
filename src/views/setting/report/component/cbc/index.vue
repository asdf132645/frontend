<template>

  <div class="setting-activeBtn-container flex-center">
    <Button @click="handleSettingMenu('filePath')" :isActive="activeTab === 'filePath'">File Path</Button>
    <Button @click="handleSettingMenu('code')" :isActive="activeTab === 'code'">Code</Button>
  </div>

  <FilePathSet v-if="activeTab === 'filePath'" type="cbc" />

  <CbcCode v-if="activeTab === 'code'" />

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
import { ref, onMounted, computed, watch } from 'vue';
import {settingName} from "@/common/defines/constants/settings";
import Alert from "@/components/commonUi/Alert.vue";
import { CbcCodeItem } from "@/common/api/service/setting/dto/lisCodeDto";
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import { useStore } from "vuex";
import FilePathSet from "@/views/setting/report/component/filePathSet.vue";
import CbcCode from "@/views/setting/report/component/cbc/component/code.vue";
import Button from "@/components/commonUi/Button.vue";
import {CbcActiveSettingType} from "@/common/type/settings";
import {settingUpdate} from "@/common/lib/utils/settingSave";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useToast} from "@/common/lib/utils/toast";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";
import {useRouter} from "vue-router";

const store = useStore();
const router = useRouter();
const cbcCodeArr = ref<CbcCodeItem[]>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const activeTab = ref('filePath');
const movingTab = ref('');
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const isSettingChanged = computed(() => beforeSettingFormattedString.value !== afterSettingFormattedString.value);
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const { toastInfo, showToast } = useToast();

onMounted(async () => {
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.cbcCode });
});

watch(() => cbcCodeArr.value, async (cbcCodeArrAfterSetting) => {
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(cbcCodeArrAfterSetting) });
  if (settingType.value !== settingName.cbcCode) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.cbcCode });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.settingNotSaved;
}

const hideAlert = () => {
  showAlert.value = false;
};

const closeConfirm = () => {
  showConfirm.value = false;
}

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  showConfirm.value = false;
  activeTab.value = movingTab.value;
  await router.push(enteringRouterPath.value);
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

const handleSettingMenu = (type: keyof CbcActiveSettingType) => {
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

