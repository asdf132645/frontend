<template>
  <div>
    <ul class="normalItems">
      <li v-for="item in normalItems" :key="item.id">
        <div>
          {{ item.abbreviation }} - {{ item.fullNm }}
        </div>
        <div class="mt1">
          <span>
            <input v-model="item.min"
                   type="text"
                   maxlength="25"
                   placeholder="class name"
                   @input="filterNumbersOnly($event, item, 'min')"
            />
          </span>
          <span>
            <input
                @input="filterNumbersOnly($event, item, 'max')"
                v-model="item.max" type="text" maxlength="25" placeholder="class name"
            />
          </span>
          <span>{{ item.unit }}</span>
        </div>
      </li>
    </ul>
    <button @click="saveNormalRange" class="saveBtn" type="button">Save</button>
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
  updateNormalRangeApi,
  getNormalRangeApi,
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {normalRange} from "@/common/defines/constFile/settings";
import {messages} from '@/common/defines/constFile/constantMessageText';

const saveHttpType = ref('');

const normalItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  await getNormalRange();
});

const saveNormalRange = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createNormalRangeApi({normalRangeItems: normalItems.value});
    } else {
      const updateResult = await updateNormalRangeApi({normalRangeItems: normalItems.value});

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
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
const filterNumbersOnly = (event: Event, item: any, field: 'min' | 'max') => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^0-9]/g, '');
  item[field] = filteredValue.trim();
};
const getNormalRange = async () => {
  try {
    const result = await getNormalRangeApi();
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        saveHttpType.value = 'post';
        normalItems.value = normalRange;
      } else {
        saveHttpType.value = 'put';
        normalItems.value = result.data;
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
