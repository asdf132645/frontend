<template>
  <div class="wbcClassScroll">
    <h1 class="classTitle">Class</h1>
    <div
        v-for="(item, idx) in wbcInfoChangeVal"
        :key="item.id"
        class="wbcClassDbDiv"
        draggable="true"
        @dragstart="startDrag(idx, $event)"
        @dragover.prevent
        @drop="drop(idx, $event)"
    >

      <ul class="nth1ChildOrder">
        <li>{{ item?.fullNm }}</li>
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
import {defaultBmClassList, defaultWbcClassList} from "@/store/modules/analysis/wbcclassification";
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

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  wbcInfoChangeVal.value = window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
  await getOrderClass();
})

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        saveHttpType.value = 'post';
      }else{
        saveHttpType.value = 'put';
        wbcInfoChangeVal.value = result.data.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const saveOrderClassSave = async () => {
  let orderList: any = wbcInfoChangeVal.value;
  for (const index in orderList) {
    orderList[index].orderIdx = index;
  }
  try {
    let result = {};
    if (saveHttpType.value === 'post') {
      result = await createOrderClassApi(orderList);
    }else {
      result = await putOrderClassApi(orderList);
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
