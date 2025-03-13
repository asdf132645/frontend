<template>
  <div>
    <div class="settingTabSubButtons">
      <button @click="selectTab('ImagePrint')" :class="{ 'active': activeTab === 'ImagePrint' }">Image Print</button>
      <div v-if="!projectBm">
        <button @click="selectTab('LisCode')" :class="{ 'active': activeTab === 'LisCode' }">
          IA
          <font-awesome-icon :icon="['fas', 'arrow-right']" size="sm" />
          LIS(HIS)
        </button>
        <button @click="selectTab('CbcCode')" :class="{ 'active': activeTab === 'CbcCode' }">
          CBC
          <font-awesome-icon :icon="['fas', 'arrow-right']" size="sm" />
          IA
        </button>
        <button v-if="getStoredUser.userType.includes('admin')" @click="selectTab('CRC')" :class="{ 'active': activeTab === 'CRC' }">Report DRC</button>
        <button v-if="getStoredUser.userType.includes('admin')" @click="selectTab('ARL')" :class="{ 'active': activeTab === 'ARL' }">Auto DRC Link</button>
      </div>
    </div>

    <div :class="{'tab-content crc':activeTab === 'CRC','tab-content arl':activeTab === 'ARL'}">
      <component :is="selectedTabComponent"/>
    </div>
  </div>


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
import ImagePrint from "@/views/setting/report/component/ImagePrint.vue";
import LisCode from "@/views/setting/report/component/lis/index.vue";
import CbcCode from "@/views/setting/report/component/cbc/index.vue";
import CRC from "@/views/setting/report/component/crc.vue";
import ARL from '@/views/setting/report/component/autoCbc.vue';
import { computed, ref, onBeforeMount } from "vue";
import { useStore } from "vuex";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import {settingUpdate} from "@/common/lib/utils/settingSave";
import Alert from "@/components/commonUi/Alert.vue";
import Button from "@/components/commonUi/Button.vue";
import {useToast} from "@/common/lib/utils/toast";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";
import {useRouter} from "vue-router";

const store = useStore();
const router = useRouter();
const projectBm = ref(false);
let activeTab = ref('ImagePrint');
const movingTab = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const settingType = computed(() => store.state.commonModule.settingType);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const storedUser = computed(() => store.state.userModule);
const getStoredUser = storedUser.value;
const { toastInfo, showToast } = useToast();

onBeforeMount(() => {
  projectBm.value = window.PROJECT_TYPE === 'bm';
})

const selectTab = (tabName: string) => {
  if (activeTab.value === tabName) return;
  movingTab.value = tabName;
  if (beforeSettingFormattedString.value !== afterSettingFormattedString.value) {
    showConfirm.value = true;
    confirmMessage.value = MESSAGES.settingNotSaved;
  } else {
    activeTab.value = movingTab.value;
  }
};

const selectedTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'ImagePrint':
      return ImagePrint;
    case 'LisCode':
      return LisCode;
    case 'CbcCode':
      return CbcCode;
    case 'CRC':
      return CRC;
    case 'ARL':
      return ARL;
    default:
      return null;
  }
});

const hideAlert = () => {
  showAlert.value = false;
}

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  activeTab.value = movingTab.value;
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
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

</script>