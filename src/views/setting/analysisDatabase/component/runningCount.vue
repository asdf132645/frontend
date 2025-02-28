<template>
  <div class="setting-container">
    <table class="setting-table">
      <colgroup>
        <col width="35%"/>
        <col width="35%"/>
        <col width="30%"/>
      </colgroup>
      <thead>
      <tr>
        <th>Min</th>
        <th>Max</th>
        <th>Count</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(wbcRunning) in wbcRunInfoCountArr" :key="wbcRunning.id">
        <td class="setting-runningCount-wrapper"><input type="number" v-model="wbcRunning.min"
                                                        class="form-control form-control-sm"></td>
        <td class="setting-runningCount-wrapper"><input type="number" v-model="wbcRunning.max"
                                                        class="form-control form-control-sm"></td>
        <td>
          <select v-model="wbcRunning.wbcTargetCount" class="form-select form-select-sm">
            <option v-for="option in AnalysisList2" :key="option.value" :value="+option.value">{{
                option.text
              }}
            </option>
          </select>
        </td>
      </tr>
      </tbody>
    </table>

    <Button @click="saveWbcRunningCount()" class="setting-saveBtn mt10">
      Save
    </Button>
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
import {computed, onBeforeMount, onMounted, ref, watch} from "vue";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import {AnalysisList2, settingName, wbcRunningCount} from "@/common/defines/constants/settings";
import {runCountItem} from "@/common/api/service/setting/dto/runWbcInfoCountDto";
import {createRunInfoWbcApi, getRunInfoApi, updateRunInfoApi} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import Button from "@/components/commonUi/Button.vue";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";


const store = useStore();
const router = useRouter();
const saveHttpType = ref('');
const wbcRunInfoCountArr = ref<runCountItem[]>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);
const projectType = ref('');
const toastInfo = ref({
  message: '',
  messageType: MESSAGES.TOAST_MSG_SUCCESS,
})

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

onMounted(async () => {
  await getWbcRunningCountData();
  await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.runningCount});
});

watch(() => wbcRunInfoCountArr.value, async (wbcRunInfoCountArrAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(wbcRunInfoCountArrAfterSettingObj)});
  if (settingType.value !== settingName.runningCount) {
    await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.runningCount});
  }
}, {deep: true});

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.settingNotSaved;
}

const getWbcRunningCountData = async () => {
  try {
    const runCountResult = await getRunInfoApi();

    if (runCountResult && runCountResult.data) {
      const runInfoData = runCountResult.data;

      if (!runInfoData || (runInfoData instanceof Array && runInfoData.length === 0)) {
        saveHttpType.value = 'post';
        wbcRunInfoCountArr.value = wbcRunningCount;
      } else {
        saveHttpType.value = 'put';
        wbcRunInfoCountArr.value = runInfoData;
      }

      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: JSON.stringify(wbcRunInfoCountArr.value)});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(wbcRunInfoCountArr.value)});
    }
  } catch (e) {
    console.error(e);
  }
};

const saveWbcRunningCount = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createRunInfoWbcApi({wbcRunCountItems: wbcRunInfoCountArr.value});
    } else {
      const updateResult = await updateRunInfoApi({wbcRunCountItems: wbcRunInfoCountArr.value});

      if (updateResult.data) {
        toastInfo.value.messageType = MESSAGES.TOAST_MSG_SUCCESS;
        showToast(MSG.TOAST.UPDATE_SUCCESS);
        await getWbcRunningCountData();
      } else {
        toastInfo.value.messageType = MESSAGES.TOAST_MSG_ERROR;
        showToast(MSG.TOAST.UPDATE_FAIL);
      }
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
      return;
    }

    if (result) {
      toastInfo.value.messageType = MESSAGES.TOAST_MSG_SUCCESS;
      showToast(MSG.TOAST.SAVE_SUCCESS);
      saveHttpType.value = 'put';
      await getWbcRunningCountData();
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
    }
  } catch (e) {
    console.error(e);
  }
};

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  await saveWbcRunningCount();
  showConfirm.value = false;
}

const showToast = (message: string) => {
  toastInfo.value.message = message;
  setTimeout(() => {
    toastInfo.value.message = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};

</script>