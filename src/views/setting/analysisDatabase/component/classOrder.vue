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
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {basicWbcArr} from "@/store/modules/analysis/wbcclassification";
import {createOrderClassApi, getCellImgApi} from "@/common/api/service/setting/settingApi";

const wbcInfoChangeVal = ref<any>([]);

const dragIndex = ref(-1);
const dragOffsetY = ref(0);
const saveHttpType = ref('');

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');

onMounted(() => {
  wbcInfoChangeVal.value = basicWbcArr;
  userId.value = getStoredUser.id;

})

const saveOrderClassSave = async () => {
  let orderList: any = wbcInfoChangeVal;
  for (const index in orderList.value) {
    orderList.value[index].userName = userId.value;
  }
  try {
    const result = await createOrderClassApi(orderList.value);
    alert('ㅇㅇ')
  } catch (e) {

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
    // updateOriginalDb();
  }
};
</script>
