<template>
  <div class="alignDiv">
    <table class="defaultTable" style="margin: auto;">
      <thead>
      <tr>
        <th>WBC min</th>
        <th>WBC max</th>
        <th>count</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(wbcRunning) in wbcRunInfoCountArr" :key="wbcRunning.id">
        <td><input type="number" v-model="wbcRunning.min" class="form-control form-control-sm"></td>
        <td><input type="number" v-model="wbcRunning.max" class="form-control form-control-sm"></td>
        <td>
          <select v-model="wbcRunning.wbcTargetCount" class="form-select form-select-sm">
            <option v-for="option in AnalysisList2" :key="option.value" :value="+option.value">{{ option.text }}</option>
          </select>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <div class="mt1">
    <button class="saveBtn" type="button" @click="saveWbcRunningCount()">Save</button>
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

  <!-- 모달 창 -->
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
import {computed, onMounted, ref, watch} from "vue";
import Alert from "@/components/commonUi/Alert.vue";
import {messages} from '@/common/defines/constFile/constantMessageText';
import {AnalysisList2, settingName, wbcRunningCount} from "@/common/defines/constFile/settings";
import {runCountItem} from "@/common/api/service/setting/dto/runWbcInfoCountDto";
import { createRunInfoWbcApi, getRunInfoApi, updateRunInfoApi } from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

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

onMounted(async () => {
  await getWbcRunningCountData();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.wbcRunningCount });
});

watch(() => wbcRunInfoCountArr.value, async (wbcRunInfoCountArrAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(wbcRunInfoCountArrAfterSettingObj) });
  if (settingType.value !== settingName.wbcRunningCount) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.wbcRunningCount });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
}

const getWbcRunningCountData = async () => {
  try {
    const runCountResult = await getRunInfoApi();

    if (runCountResult && runCountResult.data) {
      const runInfoData = runCountResult.data;

      if (!runInfoData || (runInfoData instanceof Array && runInfoData.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        wbcRunInfoCountArr.value = wbcRunningCount;
      } else {
        saveHttpType.value = 'put';
        wbcRunInfoCountArr.value = runInfoData;
      }

      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(wbcRunInfoCountArr.value) });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(wbcRunInfoCountArr.value) });
    }
  } catch (e) {
    console.error(e);
  }
};

const saveWbcRunningCount = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createRunInfoWbcApi({ wbcRunCountItems: wbcRunInfoCountArr.value });
    } else {
      const updateResult = await updateRunInfoApi({ wbcRunCountItems: wbcRunInfoCountArr.value });

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getWbcRunningCountData();
      } else {
        showErrorAlert(messages.settingUpdateFailure);
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }

    if (result) {
      showSuccessAlert(messages.settingSaveSuccess);
      saveHttpType.value = 'put';
      await getWbcRunningCountData();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
    }
  } catch (e) {
    console.error(e);
  }
};

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  await saveWbcRunningCount();
  showConfirm.value = false;
}

</script>