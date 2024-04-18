<template>
  <div>
    <label v-for="item in imagePrintAndWbcArr" :key="item.value">
      <input type="checkbox" :value="item.value" v-model="selectedItems" />
      {{ item.text }}
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
import { ImagePrintItem } from "@/common/api/service/setting/dto/imagePrintDto";
import Alert from "@/components/commonUi/Alert.vue";
import {useStore} from "vuex";
import process from "process";


const imagePrintAndWbcArr = ref<any[]>([]);
const selectedItems = ref<string[]>([]);

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const saveHttpType = ref('');
const store = useStore();

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const userModuleDataGet = computed(() => store.state.userModule);

onMounted(async () => {
  userId.value = getStoredUser.id || userModuleDataGet.value.userId;
  await getImagePrintData();
});

const saveImagePrint = async () => {
  try {
    let result: ApiResponse<void>;

    imagePrintAndWbcArr.value.forEach((item) => {
      item.checked = selectedItems.value.includes(item.value);
    });

    if (saveHttpType.value === 'post') {
      result = await createImagePrintApi({ imagePrintItems: imagePrintAndWbcArr.value, userId: Number(userId.value) });
    } else {
      const updateResult = await updateImagePrintApi({ imagePrintItems: imagePrintAndWbcArr.value, userId: Number(userId.value) }, userId.value);

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
    const result = await getImagePrintApi(String(userId.value));

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        imagePrintAndWbcArr.value = process.env.PROJECT_TYPE ==='bm'? imagePrintAndBm : imagePrintAndWbc;
      } else {
        saveHttpType.value = 'put';
        imagePrintAndWbcArr.value = data;
        selectedItems.value = data.filter((item) => item.checked).map((item) => item.value);
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

