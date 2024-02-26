<template>
  <div>
    <label v-for="item in cbcCodeArr" :key="item.cd">
      <input type="text" v-model="item.testCd" />
      {{ item.testNm }}
    </label>
  </div>
  <div class="mt1">
    <button type="button" @click="saveCbcCode()">Save</button>
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
import { cbcList } from "@/common/defines/constFile/settings";
import { ApiResponse } from "@/common/api/httpClient";
import {
  createCbcCodeRbcApi,
  getCbcCodeRbcApi,
  updateCbcCodeRbcApi,
} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {cbcCodeItem} from "@/common/api/service/setting/dto/lisCodeDto";

const cbcCodeArr = ref<cbcCodeItem[]>([]);
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

const saveCbcCode = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createCbcCodeRbcApi({ cbcCodeItems: cbcCodeArr.value, userId: Number(userId.value) });
    } else {
      const updateResult = await updateCbcCodeRbcApi({ cbcCodeItems: cbcCodeArr.value, userId: Number(userId.value) }, userId.value);

      if (updateResult.data) {
        showSuccessAlert('update successful');
        await getImagePrintData();
      } else {
        showErrorAlert('update failed');
      }
      return;
    }

    if (result) {
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
    const result = await getCbcCodeRbcApi(String(userId.value));

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        cbcCodeArr.value = cbcList;
      } else {
        saveHttpType.value = 'put';
        cbcCodeArr.value = data;
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

