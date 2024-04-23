<template>
  <div class="wbcClassScroll">
    <div
        v-for="(item, idx) in wbcInfoChangeVal"
        :key="item.id"
        class="wbcClassDbDiv"
        draggable="true"
        @dragstart="startDrag(idx, $event)"
        @dragover.prevent
        @drop="drop(idx, $event)"
    >
      <ul class="nth1Child" v-if="idx === 0">
        <li>Class</li>
      </ul>
      <ul class="nth1Child">
        <li>{{ item?.name }}</li>
      </ul>
    </div>
  </div>
  <button @click="saveOrderClassSave" class="saveBtn" type="button">Save</button>
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

import {onMounted, ref} from "vue";
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";
import {
  createOrderClassApi,
  getOrderClassApi, putOrderClassApi,
} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import process from "process";
import {messages} from '@/common/defines/constFile/constantMessageText';

const wbcInfoChangeVal = ref<any>([]);

const dragIndex = ref(-1);
const dragOffsetY = ref(0);
const saveHttpType = ref('');

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  wbcInfoChangeVal.value = process.env.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  userId.value = getStoredUser.id;
  await getOrderClass();
})

const getOrderClass = async () => {
  //getOrderClassApi
  try {
    const result = await getOrderClassApi(String(userId.value));
    if (result) {
      if (result?.data.length === 0) {
        saveHttpType.value = 'post';
      }else{
        saveHttpType.value = 'put';
        wbcInfoChangeVal.value = result.data.sort((a: any, b: any) => Number(a.orderText) - Number(b.orderText));
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const saveOrderClassSave = async () => {
  let orderList: any = wbcInfoChangeVal.value;
  for (const index in orderList) {
    orderList[index].userName = userId.value;
    orderList[index].orderText = index;
  }
  try {
    let result = {};
    if (saveHttpType.value === 'post') {
      result = await createOrderClassApi(orderList);
    }else {
      result = await putOrderClassApi(orderList, userId.value);
    }
    if (result) {
      const text = saveHttpType.value === 'post' ? 'save successful' : messages.UPDATE_SUCCESSFULLY
      showSuccessAlert(text);
    }
  } catch (e) {
    console.log(e);
  }
}

const startDrag = (index: any, event: any) => {
  dragIndex.value = index;
  dragOffsetY.value = event.clientY - event.target.getBoundingClientRect().top;
};

const drop = (index: any, event: any) => {
  event.preventDefault();
  if (dragIndex.value !== -1) {
    const movedItem = wbcInfoChangeVal.value.splice(dragIndex.value, 1)[0];
    wbcInfoChangeVal.value.splice(index, 0, movedItem);
    dragIndex.value = -1;
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
