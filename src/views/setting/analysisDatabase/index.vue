<template>
  <div>
    <div class="settingTabSubButtons">
      <template v-if="viewerCheck !== 'viewer'">
        <button @click="changeTab('cellImageAnalyzed')" :class="{ 'active': activeTab === 'cellImageAnalyzed' }">Analysis</button>
      </template>
      <template v-if="viewerCheck !== 'viewer'">
        <button v-if="projectType === 'pb'" @click="changeTab('rbc')" :class="{ 'active': activeTab === 'rbc' }">RBC
        </button>
        <button @click='changeTab("wbc")' :class="{ 'active': activeTab === 'wbc' }">WBC</button>
      </template>
      <button @click="changeTab('etc')" :class="{ 'active': activeTab === 'etc' }">Etc</button>
    </div>

    <component :is="activeTabComponent"/>
  </div>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      type="setting"
      :message="confirmMessage"
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

  <ToastNotification
      v-if="toastInfo.message"
      :message="toastInfo.message"
      :messageType="toastInfo.messageType"
      :duration="1500"
  />
</template>

<script setup lang="ts">
import {computed, onBeforeMount, onMounted, ref} from 'vue';
import Analysis from "@/views/setting/analysisDatabase/component/analysis.vue";
import Etc from "@/views/setting/analysisDatabase/component/etc.vue";
import Rbc from "@/views/setting/analysisDatabase/component/rbc/index.vue";
import Hotkey from "@/views/setting/analysisDatabase/component/wbc/component/hotKeys.vue";
import Wbc from "@/views/setting/analysisDatabase/component/wbc/index.vue";
import {useStore} from "vuex";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import Confirm from "@/components/commonUi/Confirm.vue";
import {settingUpdate} from "@/common/lib/utils/settingSave";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useToast} from "@/common/lib/utils/toast";

const store = useStore();
const activeTab = ref('');
const projectType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');

const movingTab = ref('');
const siteCd = computed(() => store.state.commonModule.siteCd);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const settingType = computed(() => store.state.commonModule.settingType);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const isSettingChanged = computed(() => beforeSettingFormattedString.value !== afterSettingFormattedString.value);
const { toastInfo, showToast } = useToast();

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

onMounted(() => {
  activeTab.value = viewerCheck.value !== 'viewer' ? 'cellImageAnalyzed' : 'etc';
})

const changeTab = (tabName: string) => {
  if (activeTab.value === tabName) {
    return;
  }

  movingTab.value = tabName;

  if (isSettingChanged.value) {
    showConfirm.value = true;
    confirmMessage.value = MESSAGES.settingNotSaved;
  } else {
    activeTab.value = tabName;
  }
};

const hideAlert = () => {
  showAlert.value = false;
}

const activeTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'cellImageAnalyzed':
      return Analysis;
    case 'etc':
      return Etc;
    case 'rbc':
      return Rbc;
    case 'hotkeys':
      return Hotkey;
    case 'wbc':
      return Wbc;
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
    await settingUpdate(settingType.value, JSON.parse(afterSettingFormattedString.value));
    showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
  } catch (e) {
    showToast(MSG.TOAST.SAVE_FAIL, MESSAGES.TOAST_MSG_ERROR);
  }
}

</script>
