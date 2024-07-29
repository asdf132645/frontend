<template>
  <div>
    <ul class="wbcHotKeysItems">
      <li v-for="item in wbcHotKeysItems" :key="item.id">
        <span>{{ item.abbreviation }}</span>
        <span>{{ item.fullNm }}</span>
        <span>
          <input
              v-model="item.key"
              type="text"
              maxlength="25"
              placeholder="hot key"
              @input="filterEnglishAndNumbers($event, item, 'key')"
          />
        </span>
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
import {createWbcHotKeysApi, updateWbcHotKeysApi, getWbcHotKeysApi} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {bmHotKeys, wbcHotKeys} from "@/common/defines/constFile/settings";
import process from "process";
import {messages} from '@/common/defines/constFile/constantMessageText';

const saveHttpType = ref('');
const wbcHotKeysItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const projectType = ref('pb');

onMounted(async () => {
  projectType.value = window.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
  await getWbcHotKeyClasses();
});
const filterEnglishAndNumbers = (event: Event, item: any, field: 'key' | 'fullNm') => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^a-zA-Z0-9]/g, '');
  item[field] = filteredValue.trim();
};
const saveWbcCustomClass = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createWbcHotKeysApi({wbcHotKeysItems: wbcHotKeysItems.value});
    } else {
      const updateResult = await updateWbcHotKeysApi({wbcHotKeysItems: wbcHotKeysItems.value});

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
    const result = await getWbcHotKeysApi();
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        saveHttpType.value = 'post';
        wbcHotKeysItems.value = projectType.value === 'bm' ? bmHotKeys : wbcHotKeys;
        // bmHotKeys
      } else {
        saveHttpType.value = 'put';
        wbcHotKeysItems.value = result.data;
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
