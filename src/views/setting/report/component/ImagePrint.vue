<template>
  <div class="settingImagePrint">
    <button type="button" @click="toggleAllChecks">{{ allChecked ? 'Uncheck All' : 'Check All' }}</button>
    <label v-for="item in imagePrintAndWbcArr" :key="item.id">
      <div>{{ item.fullNm }}</div>
      <div><input type="checkbox" :value="item.classId" v-model="selectedItems" /></div>
    </label>
  </div>
  <div class="mt1">
    <button class="saveBtn" type="button" @click="saveImagePrint()">Save</button>
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
import {ref, onMounted, computed} from 'vue';
import {imagePrintAndBm, imagePrintAndWbc} from "@/common/defines/constFile/settings";
import { ApiResponse } from "@/common/api/httpClient";
import {
  createImagePrintApi,
  getImagePrintApi,
  updateImagePrintApi
} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import process from "process";
import {messages} from '@/common/defines/constFile/constantMessageText';

const imagePrintAndWbcArr = ref<any[]>([]);
const selectedItems = ref<string[]>([]);

const saveHttpType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

const allChecked = ref(false);

onMounted(async () => {
  await getImagePrintData();
});

const saveImagePrint = async () => {
  try {
    let result: ApiResponse<void>;

    imagePrintAndWbcArr.value.forEach((item) => {
      item.checked = selectedItems.value.includes(item.classId);
    });

    if (saveHttpType.value === 'post') {
      result = await createImagePrintApi({ imagePrintItems: imagePrintAndWbcArr.value });
    } else {
      const updateResult = await updateImagePrintApi({ imagePrintItems: imagePrintAndWbcArr.value });

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
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
    const result = await getImagePrintApi();

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        saveHttpType.value = 'post';
        imagePrintAndWbcArr.value = window.PROJECT_TYPE ==='bm'? imagePrintAndBm : imagePrintAndWbc;
      } else {
        saveHttpType.value = 'put';
        imagePrintAndWbcArr.value = data;
        selectedItems.value = data.filter((item) => item.checked).map((item) => item.classId);
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

const toggleAllChecks = () => {
  allChecked.value = !allChecked.value;
  if (allChecked.value) {
    selectedItems.value = imagePrintAndWbcArr.value.map(item => item.classId);
  } else {
    selectedItems.value = [];
  }
};
</script>
