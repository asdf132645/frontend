<template>
  <div>
<!--        {{ bfHotKeysItems }}-->
    <ul class="wbcHotKeysItems">
      <li v-for="item in bfHotKeysItems" :key="item.id">
        <span>{{ item?.abbreviation }}</span>
        <span>{{ item?.fullNm }}</span>
        <span>
          <input
              v-model="item.key"
              type="text"
              maxlength="1"
              placeholder="hot key"
              @input="filterEnglishAndNumbers($event, item, 'key')"
          />
        </span>
      </li>
    </ul>
    <button @click="saveBfCustomClass" class="saveBtn" type="button">Save</button>
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
  createBfHotKeysApi, updateBfHotKeysApi, getBfHotKeysApi,
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {bfHotKeys} from "@/common/defines/constFile/settings";
import {messages} from '@/common/defines/constFile/constantMessageText';

const saveHttpType = ref('');
const bfHotKeysItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  await getBfHotKeyClasses();
});

const filterEnglishAndNumbers = (event: Event, item: any, field: 'key' | 'fullNm') => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^a-zA-Z0-9]/g, '');
  item[field] = filteredValue.trim();
};

const saveBfCustomClass = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createBfHotKeysApi({bfHotKeysItems: bfHotKeysItems.value });
    } else {
      const updateResult = await updateBfHotKeysApi({bfHotKeysItems: bfHotKeysItems.value });

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getBfHotKeyClasses();
      } else {
        showErrorAlert('update failed');
      }
      return;
    }
    if (result) {
      showSuccessAlert('save successful');
      saveHttpType.value = 'put';
      await getBfHotKeyClasses();
    }
  } catch (e) {
    console.log(e);
  }
};

const getBfHotKeyClasses = async () => {
  try {
    const result = await getBfHotKeysApi();
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        saveHttpType.value = 'post';
        bfHotKeysItems.value = bfHotKeys;
      } else {
        saveHttpType.value = 'put';
        bfHotKeysItems.value = result.data;
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
