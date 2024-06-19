<template>
  <div class="alignDiv">
    <label v-for="item in cbcCodeArr" :key="item.cd">
      <p class="mb1">{{ item.fullNm }}</p>
      <input type="text" v-model="item.classCd" />
    </label>
  </div>
  <div class="mt1">
    <button class="saveBtn" type="button" @click="saveCbcCode()">Save</button>
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
import { defaultCbcList } from "@/common/defines/constFile/settings";
import { ApiResponse } from "@/common/api/httpClient";
import { createCbcCodeRbcApi, getCbcCodeRbcApi, updateCbcCodeRbcApi } from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {cbcCodeItem} from "@/common/api/service/setting/dto/lisCodeDto";
import {messages} from '@/common/defines/constFile/constantMessageText';

const cbcCodeArr = ref<cbcCodeItem[]>([]);
const saveHttpType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  await getImagePrintData();
});

const saveCbcCode = async () => {
  try {
    let result: ApiResponse<void>;

    console.log(cbcCodeArr.value);
    if (saveHttpType.value === 'post') {
      result = await createCbcCodeRbcApi({ cbcCodeItems: cbcCodeArr.value });
    } else {
      const updateResult = await updateCbcCodeRbcApi({ cbcCodeItems: cbcCodeArr.value });

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
    const result = await getCbcCodeRbcApi();

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        cbcCodeArr.value = defaultCbcList;
      } else {
        saveHttpType.value = 'put';
        cbcCodeArr.value = data;
      }
    }
  }
  catch (e) {
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

