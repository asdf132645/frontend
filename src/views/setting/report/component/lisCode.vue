<template>
  <div>
    <p class="mb2"> [ WBC ] </p>
    <label v-for="item in lisCodeWbcArr" :key="item.value">
      <input type="text" v-model="item.code" />
      {{ item.text }}
    </label>
  </div>
  <div>
    <p class="mb2"> [ RBC ] </p>
    <label v-for="item in lisCodeRbcArr" :key="item.classNm">
      <input type="text" v-model="item.code" />
      {{ item.categoryNm }} - {{ item.classNm }}
    </label>
  </div>
  <div class="mt1">
    <button type="button" @click="saveLisCode()">Save</button>
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
import { lisCodeWbcOption , lisCodeRbcOption} from "@/common/defines/constFile/settings";
import { ApiResponse } from "@/common/api/httpClient";
import {
  createLisCodeApi, createLisCodeRbcApi,
  getLisCodeApi, getLisCodeRbcApi,
  updateLisCodeApi, updateLisCodeRbcApi
} from "@/common/api/service/setting/settingApi";
import {LisCodeRbcItem, LisCodeWbcItem} from "@/common/api/service/setting/dto/lisCodeDto";
import Alert from "@/components/commonUi/Alert.vue";

const lisCodeWbcArr = ref<LisCodeWbcItem[]>([]);
const lisCodeRbcArr = ref<LisCodeRbcItem[]>([]);

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const saveHttpType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  userId.value = getStoredUser.id;
  await getImagePrintData();
});

const saveLisCode = async () => {
  try {
    let result: ApiResponse<void>;
    let rbcResult: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createLisCodeApi({ lisCodeItems: lisCodeWbcArr.value, userId: Number(userId.value) });
      rbcResult = await createLisCodeRbcApi({ lisCodeItems: lisCodeRbcArr.value, userId: Number(userId.value) });
    } else {
      const updateResult = await updateLisCodeApi({ lisCodeItems: lisCodeWbcArr.value, userId: Number(userId.value) }, userId.value);
      const updateRbcResult = await updateLisCodeRbcApi({ lisCodeItems: lisCodeRbcArr.value, userId: Number(userId.value) }, userId.value);

      if (updateResult.data && updateRbcResult.data) {
        showSuccessAlert('update successful');
        await getImagePrintData();
      } else {
        showErrorAlert('update failed');
      }
      return;
    }

    if (result && rbcResult) {
      showSuccessAlert('save successful');
      saveHttpType.value = 'put';
      await getImagePrintData();
    }
  } catch (e) {
    console.error(e);
  }
};


const getImagePrintData = async () => {
  try {
    const wbcResult = await getLisCodeApi(String(userId.value));
    const rbcResult = await getLisCodeRbcApi(String(userId.value));

    if (wbcResult && wbcResult.data && rbcResult && rbcResult.data) {
      const wbcData = wbcResult.data;
      const rbcData = rbcResult.data;

      if (!wbcData || (wbcData instanceof Array && wbcData.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        lisCodeWbcArr.value = lisCodeWbcOption;
      } else {
        saveHttpType.value = 'put';
        lisCodeWbcArr.value = wbcData;
      }

      if (!rbcData || (rbcData instanceof Array && rbcData.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        lisCodeRbcArr.value = lisCodeRbcOption;
      } else {
        saveHttpType.value = 'put';
        lisCodeRbcArr.value = rbcData;
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

