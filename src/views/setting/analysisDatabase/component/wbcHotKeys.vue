<template>
  <div>
    <ul class="wbcHotKeysItems">
      <li v-for="item in wbcHotKeysItems" :key="item.id">
        <span>{{ item.title }}</span>
        <span>{{ item.name }}</span>
        <span><input v-model="item.key" type="text" maxlength="25" placeholder="class name"/></span>
      </li>
    </ul>
    <button @click="saveWbcCustomClass" class="saveBtn" type="button">Save</button>
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
import {
  createWbcHotKeysApi, updateWbcHotKeysApi, getWbcWbcHotKeysApi,
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {bmHotKeys, wbcHotKeys} from "@/common/defines/constFile/settings";
import process from "process";
import {messages} from '@/common/defines/constFile/constantMessageText';

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const saveHttpType = ref('');

const wbcHotKeysItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const projectType = ref('pb');

onMounted(async () => {
  userId.value = getStoredUser.id;
  projectType.value = process.env.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
  await getWbcHotKeyClasses();
});

const saveWbcCustomClass = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createWbcHotKeysApi({wbcHotKeysItems: wbcHotKeysItems.value , userId: Number(userId.value)});
    } else {
      const updateResult = await updateWbcHotKeysApi({wbcHotKeysItems: wbcHotKeysItems.value , userId: Number(userId.value)}, userId.value);

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getWbcHotKeyClasses();
      } else {
        showErrorAlert('update failed');
      }
      return;
    }
    if (result) {
      showSuccessAlert('save successful');
      saveHttpType.value = 'put';
      await getWbcHotKeyClasses();
    }
  } catch (e) {
    console.log(e);
  }
};

const getWbcHotKeyClasses = async () => {
  try {
    const result = await getWbcWbcHotKeysApi(String(userId.value));
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        wbcHotKeysItems.value = projectType.value ==='bm' ? bmHotKeys : wbcHotKeys;
        // bmHotKeys
      } else {
        saveHttpType.value = 'put';
        const data = result.data;
        wbcHotKeysItems.value = data;
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
