<template>
  <ClassInfoMenu @refreshClass="refreshClass"/>

  <div class="wbcContent" v-if="isLoading">
    <DetailHeader
        :testType="getTestTypeText(selectItems?.testType)"
        :barcodeNo="selectItems?.barcodeNo"
        :cbcPatientNo="selectItems?.cbcPatientNo"
        :patientName="patientName"
        :hospitalName="selectItems?.hosName"
        :cbcPatientName="selectItems?.cbcPatientNm"
        :cbcSex="selectItems?.cbcSex"
        :cbcAge="selectItems?.cbcAge"
        :analyzedDttm="selectItems?.analyzedDttm"
        :slideData="selectItems"
    />
    <LisCbc v-if="cbcLayer" :selectItems="selectItems"/>
    <div :class="'databaseWbcRight shadowBox pos-relative' + (cbcLayer ? ' cbcLayer' : '')">
      <template v-if="siteCd === '9090'">
        <RbcClassNew :allUnCheck="allUnCheck" @isBeforeUpdate="isBeforeUpdate" @classInfoArrUpdate="classInfoArrUpdate"
                  @classInfoArrUpdateRe="classInfoArrUpdateRe" type='listTable'
                  :allCheckClear="allCheckClear" :rbcInfo="rbcInfo"
                  :notCanvasClickVal="notCanvasClickVal"
                  @submitStateChanged="submitStateChanged"
        />
      </template>
      <template v-else>
        <RbcClass :allUnCheck="allUnCheck" @isBeforeUpdate="isBeforeUpdate" @classInfoArrUpdate="classInfoArrUpdate"
                  @classInfoArrUpdateRe="classInfoArrUpdateRe" type='listTable'
                  :allCheckClear="allCheckClear" :rbcInfo="rbcInfo"
                  :notCanvasClickVal="notCanvasClickVal"
                  @submitStateChanged="submitStateChanged"
        />
      </template>

    </div>

    <div :class="'databaseWbcLeft' + (cbcLayer ? ' cbcLayer' : '')">
      <RbcImageList @notCanvasClick="notCanvasClick" @unChecked="unChecked" :isBefore="isBefore" :classInfoArr="classInfoArr" :selectItems="selectItems" type='listTable' :rbcInfo="rbcInfo"/>
    </div>
  </div>

  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
      position='top'
  />
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import RbcClass from "./rbcClass.vue";
import RbcImageList from "./rbcImageList/rbcImageList.vue";
import {useStore} from "vuex";
import { getTestTypeText } from "@/common/lib/utils/conversionDataUtils";
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import LisCbc from "@/views/datebase/commponent/detail/lisCbc.vue";
import DetailHeader from "@/views/datebase/commponent/detail/detailHeader.vue";
import {useGetRunningInfoByIdQuery} from "@/gql/useQueries";
import {MESSAGES, MSG_GENERAL} from "@/common/defines/constants/constantMessageText";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import RbcClassNew from "@/views/datebase/commponent/detail/rbc/rbcClassNew.vue";

const selectItems = ref<any>({});
const store = useStore();
const rbcInfo = ref(null);
const classInfoArr = ref<any>([]);
const allCheckClear = ref<boolean>(false);
const isBefore = ref(false);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const siteCd = computed(() => store.state.commonModule.siteCd);
const isLoading = ref(false);
const allUnCheck = ref(false);
const notCanvasClickVal = ref(false);
const slideData = computed(() => store.state.slideDataModule);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);
const patientName = ref('');

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
    patientName.value = slideData.value?.patientNm;
  } catch (e) {
    console.error(e);
    selectItems.value = null;
  }
  isLoading.value = true;
}

const isBeforeUpdate = (val: boolean) => {
  isBefore.value = val;
}

const refreshClass = async (data: any) => {
  rbcInfo.value = data;
  selectItems.value = data;
  allCheckClear.value = !allCheckClear.value;
  await store.dispatch('commonModule/setCommonInfo', { rbcImagePageNumber: 0 });
}

const classInfoArrUpdate = (data: any) => {
  classInfoArr.value = data;
}

const classInfoArrUpdateRe = async (data: any) => {
  const { result, loading, error } = useGetRunningInfoByIdQuery(
      { id: Number(selectItems.value?.id) },
      { fetchPolicy: 'no-cache' }
  );

  watch(result, (newValue) => {
    if (newValue) {
      // newValue가 존재하면 해당 데이터를 처리
      store.dispatch('slideDataModule/updateSlideData', newValue?.getRunningInfoByIdGQL);
      const result = newValue?.getRunningInfoByIdGQL;

      store.dispatch('commonModule/setCommonInfo', { testType: selectItems.value.testType });

      selectItems.value = result;
      rbcInfo.value = result;
      let newData: any = [];
      newData = data;
      store.dispatch('commonModule/setCommonInfo', {classInfoArr: newData});
    } else {
      console.log('No result');
    }
  });



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

const submitStateChanged = (changedSubmitState: string) => {
  if (changedSubmitState) {
    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    showToast(MSG_GENERAL.SUCCESS);
  }
}

</script>
