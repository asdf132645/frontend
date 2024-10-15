<template>
  <div class="crcPopUpDiv crcAdd">
    <div>
      <div class="crcWrap">
        <ul>
          <li>
            <p>crcTitle</p>
            <span><input type="text" placeholder="crcTitle" v-model="crcTitle"></span>
          </li>
          <li>
            <p>crcType</p>
            <span>
              <select v-model="crcType">
                <option value="select">select</option>
                <option value="text">text</option>
                <option value="percent">percent</option>
              </select>
            </span>
          </li>
          <li>
            <p>crcContent</p>
            <span><input type="text" placeholder="crcContent" v-model="crcContent"></span>
          </li>
          <li v-if="crcType === 'percent'">
            <p>crcPercentText</p>
            <span><input type="text" placeholder="crcPercentText" v-model="crcPercentText"></span>
          </li>
          <li>
            <p>morphologyType</p>
            <span>
              <select v-model="morphologyType">
                <option value="RBC">RBC</option>
                <option value="WBC">WBC</option>
                <option value="PLT">PLT</option>
              </select>
            </span>
          </li>
        </ul>
        <button @click="addCrcArr">Add</button>
      </div>


      <crc-compontent
          :items="crcArr"
          @updateCrc="onUpdateCrc"
          @deleteCrc="onDeleteCrc"
          moType="RBC"
          pageName="set"
      ></crc-compontent>

      <div class="moDivBox mt2">
        <div>
          <crc-compontent
              :items="crcArr"
              @updateCrc="onUpdateCrc"
              @deleteCrc="onDeleteCrc"
              moType="WBC"
              pageName="set"
          ></crc-compontent>
        </div>

        <div>
          <crc-compontent
              :items="crcArr"
              @updateCrc="onUpdateCrc"
              @deleteCrc="onDeleteCrc"
              moType="PLT"
              pageName="set"
          ></crc-compontent>
        </div>
      </div>
    </div>
  </div>
  <div class="mt1">
    <button class="saveBtn" type="button" @click="saveCrcData">Save</button>
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

import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import Alert from "@/components/commonUi/Alert.vue";

import {onMounted, ref} from "vue";
import {
  crcDataGet,
  createCrcDataApi,
  deleteCrcDataApi,
  updateCrcDataApi
} from "@/common/api/service/setting/settingApi";

const crcTitle = ref('');
const crcType = ref('');
const crcPercentText = ref('');
const crcContent = ref('');
const crcArr = ref<any>([]);
const morphologyType = ref('');
const crcData = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  crcData.value = await crcDataGet();
  crcArr.value = crcData.value.data;
});
const hideAlert = () => {
  showAlert.value = false;
};
const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
  window.scrollTo({top: 0, behavior: 'smooth'});
};
const addCrcArr = () => {
  if (crcTitle.value === '' || crcType.value === '') {
    return;
  }
  crcArr.value.push({
    crcTitle: crcTitle.value,
    crcType: crcType.value,
    crcPercentText: crcPercentText.value,
    morphologyType: morphologyType.value,
    crcContent: crcContent.value,
  });
};

// 업데이트 이벤트 처리 함수
const onUpdateCrc = async ({index, updatedItem}: { index: number, updatedItem: any }) => {
  crcArr.value[index] = updatedItem;
  await updateCrcDataApi(crcArr.value); // 서버로 업데이트 요청
};

// 삭제 이벤트 처리 함수
const onDeleteCrc = async ({index, id}: { index: number, id: any }) => {
  const findId = crcArr.value.findIndex((item: any) => item.id === id);
  crcArr.value.splice(findId, 1); // 배열에서 제거
  await deleteCrcDataApi({id}); // 서버에 삭제 요청
};

// 데이터 저장 함수
const saveCrcData = async () => {
  await createCrcDataApi(crcArr.value);
  await showSuccessAlert('Success');
};
</script>