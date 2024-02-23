<template>
  <div>
    <ul>
      <li v-for="item in normalItems" :key="item.id">
        <span>{{ item.title }}</span>
        <span>{{ item.name }}</span>
        <span><input v-model="item.min" type="text" maxlength="25" placeholder="class name"/></span>
        <span><input v-model="item.max" type="text" maxlength="25" placeholder="class name"/></span>
        <span>{{ item.unit }}</span>
      </li>
    </ul>
    <button @click="saveNormalRange">Save</button>
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
  createNormalRangeApi,
  updateBfNormalRangeApi,
  getNormalRangeApi,
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {normalRange} from "@/common/defines/constFile/settings";

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const saveHttpType = ref('');

const normalItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  userId.value = getStoredUser.id;
  await getNormalRange();
});

const saveNormalRange = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createNormalRangeApi({normalRangeItems: normalItems.value , userId: Number(userId.value)});
    } else {
      const updateResult = await updateBfNormalRangeApi({normalRangeItems: normalItems.value , userId: Number(userId.value)}, userId.value);

      if (updateResult.data) {
        showSuccessAlert('update successful');
        await getNormalRange();
      } else {
        showErrorAlert('update failed');
      }
      return;
    }
    if (result) {
      showSuccessAlert('save successful');
      saveHttpType.value = 'put';
      await getNormalRange();
    }
  } catch (e) {
    console.log(e);
  }
};

const getNormalRange = async () => {
  try {
    const result = await getNormalRangeApi(String(userId.value));
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        console.log(null);
        saveHttpType.value = 'post';
        normalItems.value = normalRange;
      } else {
        saveHttpType.value = 'put';
        const data = result.data;
        normalItems.value = data;
        console.log(data);
      }
      console.log(result);
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
