<template>
  <ClassInfoMenu @refreshClass="refreshClass"/>

  <div class="wbcContent" v-if="isLoading">
    <DetailHeader
        :testType="getTestTypeText(selectItems?.testType)"
        :barcodeNo="selectItems?.barcodeNo"
        :cbcPatientNo="selectItems?.cbcPatientNo"
        :patientName="selectItems?.patientName"
        :hospitalName="selectItems?.hosName"
        :cbcPatientName="selectItems?.cbcPatientNm"
        :cbcSex="selectItems?.cbcSex"
        :cbcAge="selectItems?.cbcAge"
        :analyzedDttm="selectItems?.analyzedDttm"
    />
    <LisCbc v-if="cbcLayer" :selectItems="selectItems"/>
    <div :class="'plt databaseWbcLeft' + (cbcLayer ? ' cbcLayer' : '')">
      <PltImageList @notCanvasClick="notCanvasClick" @unChecked="unChecked" :isBefore="isBefore" :classInfoArr="classInfoArr" :selectItems="selectItems" type='listTable' :rbcInfo="rbcInfo"/>
    </div>
  </div>

  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStore } from "vuex";
import { getTestTypeText } from '@/common/lib/utils/conversionDataUtils';
import ClassInfoMenu from '@/views/datebase/commponent/detail/classInfoMenu.vue';
import LisCbc from '@/views/datebase/commponent/detail/lisCbc.vue';
import DetailHeader from '@/views/datebase/commponent/detail/detailHeader.vue';
import { MESSAGES } from '@/common/defines/constants/constantMessageText';
import ToastNotification from '@/components/commonUi/ToastNotification.vue';
import PltImageList from "@/views/datebase/commponent/detail/plt/pltImageList/pltImageList.vue";

const selectItems = ref<any>({});
const store = useStore();
const rbcInfo = ref(null);
const classInfoArr = ref<any>([]);
const allCheckClear = ref<boolean>(false);
const isBefore = ref(false);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const isLoading = ref(false);
const notCanvasClickVal = ref(false);
const slideData = computed(() => store.state.slideDataModule);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);

onMounted(async () => {
  isLoading.value = false;
  await getDetailRunningInfo();
  await initData();
});

const initData = async () => {
  rbcInfo.value = selectItems.value;
}

const getDetailRunningInfo = async () => {
  try {
    selectItems.value = slideData.value;
  } catch (e) {
    console.error(e);
    selectItems.value = null;
  }
  isLoading.value = true;
}

const refreshClass = async (data: any) => {
  rbcInfo.value = data;
  selectItems.value = data;
  allCheckClear.value = !allCheckClear.value;
  await store.dispatch('commonModule/setCommonInfo', { rbcImagePageNumber: 0 });
}


const unChecked = () => {
  allCheckClear.value = !allCheckClear.value;
}

const notCanvasClick = (val: any) => {
  notCanvasClickVal.value = val;
}

const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};



</script>
