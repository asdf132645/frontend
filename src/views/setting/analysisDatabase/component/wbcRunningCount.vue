<template>
  <div class="alignDiv">
    <p class="mb2"> [ Running Count ] </p>
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
          <select v-model="wbcRunning.wbcCount" class="form-select form-select-sm">
            <option v-for="option in AnalysisList2" :key="option.value" :value="option.value">{{ option.text }}</option>
          </select>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <div class="mt1">
    <button class="saveBtn" type="button" @click="saveWbcRunningCount()">Save</button>
  </div>

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
import {onMounted, ref} from "vue";
import Alert from "@/components/commonUi/Alert.vue";
import {messages} from '@/common/defines/constFile/constantMessageText';
import {AnalysisList2, minRunCount, wbcRunningCount} from "@/common/defines/constFile/settings";
import {runCountItem} from "@/common/api/service/setting/dto/runWbcInfoCountDto";
import {
  createMinCountApi,
  createRunInfoWbcApi,
  getMinCountApi,
  getRunInfoApi, updateMinCountApi, updateRunInfoApi
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";


const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const saveHttpType = ref('');
const wbcRunInfoCountArr = ref<runCountItem[]>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  userId.value = getStoredUser.id;
  await getWbcRunningCountData();
});

const getWbcRunningCountData = async () => {
  try {
    const runCountResult = await getRunInfoApi(String(userId.value));

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
    }
  } catch (e) {
    console.error(e);
  }
};

const saveWbcRunningCount = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createRunInfoWbcApi({ wbcRunCountItems: wbcRunInfoCountArr.value, userId: Number(userId.value) });
    } else {
      const updateResult = await updateRunInfoApi({ wbcRunCountItems: wbcRunInfoCountArr.value, userId: Number(userId.value) }, userId.value);

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getWbcRunningCountData();
      } else {
        showErrorAlert('update failed');
      }
      return;
    }

    if (result) {
      showSuccessAlert('save successful');
      saveHttpType.value = 'put';
      await getWbcRunningCountData();
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

</script>