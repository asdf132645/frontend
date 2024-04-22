<template>
  <div class="alignDiv" style="text-align: center">
    <p class="mb2"> [ Min count ] </p>
    <ul>
      <li v-if="minCountArr.length > 0">
        <p class="mb1 mt1">Giant Platelet</p>
        <input type="text" v-model="minCountArr[0].minGpCount" class="form-control form-control-sm">
      </li>
      <li v-if="minCountArr.length > 0">
        <p class="mb1 mt1">Platelet Aggregation</p>
        <input type="text" v-model="minCountArr[0].minPaCount" class="form-control form-control-sm">
      </li>
    </ul>
    <p class="mb2 mt4"> [ Running count ] </p>
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
    <button class="saveBtn" type="button" @click="saveLisCode()">Save</button>
  </div>
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
import { ref, onMounted } from 'vue';
import { wbcRunningCount , minRunCount, AnalysisList2} from "@/common/defines/constFile/settings";
import { ApiResponse } from "@/common/api/httpClient";
import {
  createMinCountApi, createRunInfoWbcApi,
  getMinCountApi, getRunInfoApi,
  updateMinCountApi, updateRunInfoApi
} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {minCountItem} from "@/common/api/service/setting/dto/minCountDto";
import {runCountItem} from "@/common/api/service/setting/dto/runWbcInfoCountDto";
import {messages} from '@/common/defines/constFile/constantMessageText';

const minCountArr = ref<minCountItem[]>([]);
const wbcRunInfoCountArr = ref<runCountItem[]>([]);

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const saveHttpType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  userId.value = getStoredUser.id;
  await getCountData();
});

const saveLisCode = async () => {
  try {
    let result: ApiResponse<void>;
    let rbcResult: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createRunInfoWbcApi({ wbcRunCountItems: wbcRunInfoCountArr.value, userId: Number(userId.value) });
      rbcResult = await createMinCountApi({ minCountItems: minCountArr.value, userId: Number(userId.value) });
    } else {
      const updateResult = await updateRunInfoApi({ wbcRunCountItems: wbcRunInfoCountArr.value, userId: Number(userId.value) }, userId.value);
      const updateRbcResult = await updateMinCountApi({ minCountItems: minCountArr.value, userId: Number(userId.value) }, userId.value);

      if (updateResult.data && updateRbcResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getCountData();
      } else {
        showErrorAlert('update failed');
      }
      return;
    }

    if (result && rbcResult) {
      showSuccessAlert('save successful');
      saveHttpType.value = 'put';
      await getCountData();
    }
  } catch (e) {
    console.error(e);
  }
};


const getCountData = async () => {
  try {
    const runCountResult = await getRunInfoApi(String(userId.value));
    const minCountResult = await getMinCountApi(String(userId.value));

    if (runCountResult && runCountResult.data && minCountResult && minCountResult.data) {
      const runInfoData = runCountResult.data;
      const minCountData = minCountResult.data;

      if (!runInfoData || (runInfoData instanceof Array && runInfoData.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        wbcRunInfoCountArr.value = wbcRunningCount;
      } else {
        saveHttpType.value = 'put';
        wbcRunInfoCountArr.value = runInfoData;
      }

      if (!minCountData || (minCountData instanceof Array && minCountData.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        minCountArr.value = minRunCount;
      } else {
        saveHttpType.value = 'put';
        minCountArr.value = minCountData;
      }
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

