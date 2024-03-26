<template>
  <!--  {{ filePathSetArr }}-->
  <div class="alignDiv" style="text-align: center">
    <ul>
      <li>
        <p class="mb1">lisHotKey</p>
        <input type="text" :value="filePathSetArr[0] ? filePathSetArr[0].lisHotKey : ''"
               @input="updateHotKey($event, 0)">
      </li>
      <li>
        <p class="mb1">lisFilePath</p>
        <input type="text" :value="filePathSetArr[0] ? filePathSetArr[0].lisFilePath : ''"
               @input="updateFilePath($event, 0)">
      </li>
      <li>
        <p class="mb1">cbcFilePath</p>
        <input type="text" :value="filePathSetArr[0] ? filePathSetArr[0].cbcFilePath : ''"
               @input="updateCbcFilePath($event, 0)">
      </li>
    </ul>
  </div>
  <div class="mt1">
    <button class="saveBtn" type="button" @click="saveFilePathSet()">Save</button>
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
import {ref, onMounted} from 'vue';
import {lisHotKeyAndLisFilePathAndUrl} from "@/common/defines/constFile/settings";
import {ApiResponse} from "@/common/api/httpClient";
import {
  createFilePathSetApi,
  createImagePrintApi, getFilePathSetApi,
  getImagePrintApi, updateFilePathSetApi,
  updateImagePrintApi
} from "@/common/api/service/setting/settingApi";
import {ImagePrintItem} from "@/common/api/service/setting/dto/imagePrintDto";
import Alert from "@/components/commonUi/Alert.vue";
import {FilePathItem} from "@/common/api/service/setting/dto/filePathSetDto";

const filePathSetArr = ref<FilePathItem[]>([]);
const selectedItems = ref<string[]>([]);

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

const saveFilePathSet = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createFilePathSetApi({filePathSetItems: filePathSetArr.value, userId: Number(userId.value)});
    } else {
      const updateResult = await updateFilePathSetApi({
        filePathSetItems: filePathSetArr.value,
        userId: Number(userId.value)
      }, userId.value);

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
    const result = await getFilePathSetApi(String(userId.value));

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        filePathSetArr.value = lisHotKeyAndLisFilePathAndUrl;
      } else {
        saveHttpType.value = 'put';
        filePathSetArr.value = data;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const updateHotKey = (event: any, index: number) => {
  filePathSetArr.value[index].lisHotKey = event.target.value;
};

const updateFilePath = (event: any, index: number) => {
  filePathSetArr.value[index].lisFilePath = event.target.value;
};

const updateCbcFilePath = (event: any, index: number) => {
  filePathSetArr.value[index].cbcFilePath = event.target.value;
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

