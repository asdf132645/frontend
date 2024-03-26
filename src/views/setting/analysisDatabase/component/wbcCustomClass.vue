<template>
  <div>
    <ul class="customClass">
      <li v-for="item in wbcCustomItems" :key="item.id">
        <span>ID: {{ item!.customNum }}</span>
        <span><input v-model="item.abbreviation" type="text" maxlength="3" placeholder="abbreviation"/></span>
        <span><input v-model="item.className" type="text" maxlength="25" placeholder="class name"/></span>
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

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const saveHttpType = ref('');
const wbcCustomParm = [
  { customNum: 90, abbreviation: '', className: '' },
  { customNum: 91, abbreviation: '', className: '' },
  { customNum: 92, abbreviation: '', className: '' },
  { customNum: 93, abbreviation: '', className: '' },
  { customNum: 94, abbreviation: '', className: '' }
];

const wbcCustomItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  userId.value = getStoredUser.id;
  await getWbcCustomClasses();
});

const saveWbcCustomClass = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createWbcCustomClassApi({ classArr: wbcCustomItems.value, userId: Number(userId.value) });
    } else {
      const updateResult = await updateWbcCustomClassApi({ classArr: wbcCustomItems.value, userId: Number(userId.value) }, userId.value);

      if (updateResult.data) {
        showSuccessAlert('update successful');
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
    const result = await getWbcCustomClassApi(String(userId.value));
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        console.log(null);
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
