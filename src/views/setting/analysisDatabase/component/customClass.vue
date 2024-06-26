<template>
  <div>
    <ul class="customClass customSettingContainer">
      <li v-for="item in wbcCustomItems" :key="item.id">
        <span>ID: {{ item!.customNum }}</span>
        <span><input v-model="item.abbreviation" type="text" maxlength="3" placeholder="abbreviation"/></span>
        <span><input v-model="item.fullNm" type="text" maxlength="25" placeholder="class name"/></span>
      </li>
    </ul>
    <button class="saveBtn" type="button" @click="saveWbcCustomClass">Save</button>
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
import {
  createWbcCustomClassApi,
  updateWbcCustomClassApi,
  getWbcCustomClassApi,
} from "@/common/api/service/setting/settingApi";
import { ApiResponse } from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {messages} from '@/common/defines/constFile/constantMessageText';

const saveHttpType = ref('');
const wbcCustomParm = [
  { customNum: 90, abbreviation: '', fullNm: '' },
  { customNum: 91, abbreviation: '', fullNm: '' },
  { customNum: 92, abbreviation: '', fullNm: '' },
  { customNum: 93, abbreviation: '', fullNm: '' },
  { customNum: 94, abbreviation: '', fullNm: '' }
];

const wbcCustomItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  await getWbcCustomClasses();
});

const saveWbcCustomClass = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createWbcCustomClassApi({ classArr: wbcCustomItems.value });
    } else {
      const updateResult = await updateWbcCustomClassApi({ classArr: wbcCustomItems.value });

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getWbcCustomClasses();
      } else {
        showErrorAlert('update failed');
      }
      return;
    }
    if (result) {
      showSuccessAlert('save successful');
      saveHttpType.value = 'put';
      await getWbcCustomClasses();
    }
  } catch (e) {
    console.log(e);
  }
};

const getWbcCustomClasses = async () => {
  try {
    const result = await getWbcCustomClassApi();
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        saveHttpType.value = 'post';
        wbcCustomItems.value = wbcCustomParm;
      } else {
        saveHttpType.value = 'put';
        const data = result.data;
        wbcCustomItems.value = data;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

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
