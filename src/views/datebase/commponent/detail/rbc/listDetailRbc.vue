<template>
  <ClassInfoMenu @refreshClass="refreshClass"/>

  <div class="wbcContent" v-if="isLoading">

    <div class="topClintInfo">
      <ul>
        <li>{{ getTestTypeText(selectItems?.testType) }}</li>
        <li>{{ selectItems?.barcodeNo }}</li>
        <li>{{ selectItems?.patientId || 'patientId No Data' }}</li>
        <li>{{ selectItems?.cbcPatientNo }}</li>
        <li>{{ selectItems?.patientName }}</li>
        <li> {{ selectItems?.cbcPatientNm }} {{ selectItems?.cbcSex }} {{ selectItems?.cbcAge }}</li>
        <li>{{ selectItems?.analyzedDttm }}</li>
      </ul>
    </div>
    <LisCbc v-if="cbcLayer" :selectItems="selectItems"/>
    <div :class="'databaseWbcRight shadowBox' + (cbcLayer ? ' cbcLayer' : '') ">
      <RbcClass :allUnCheck="allUnCheck" @isBeforeUpdate="isBeforeUpdate" @classInfoArrUpdate="classInfoArrUpdate"
                @classInfoArrUpdateRe="classInfoArrUpdateRe" :selectItems="selectItems" type='listTable'
                :allCheckClear="allCheckClear" :rbcInfo="rbcInfo"
                :notCanvasClickVal="notCanvasClickVal"
                :currentRbcPageNumber="currentRbcPageNumber"
      />
    </div>

    <div :class="'databaseWbcLeft' + (cbcLayer ? ' cbcLayer' : '')">
      <RbcImageList @notCanvasClick="notCanvasClick" @unChecked="unChecked" :isBefore="isBefore" @changeCurrentRbcImagePageNumber="changeCurrentRbcImagePageNumber"
                    :classInfoArr="classInfoArr" :selectItems="selectItems" type='listTable' :rbcInfo="rbcInfo"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import RbcClass from "./rbcClass.vue";
import RbcImageList from "./rbcImageList/rbcImageList.vue";
import {useStore} from "vuex";
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import LisCbc from "@/views/datebase/commponent/detail/lisCbc.vue";
import {detailRunningApi} from '@/common/api/service/runningInfo/runningInfoApi';

const selectItems = ref<any>({});
const store = useStore();
const rbcInfo = ref(null);
const classInfoArr = ref<any>([]);
const allCheckClear = ref<boolean>(false);
const isBefore = ref(false);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const isLoading = ref(false);
const allUnCheck = ref(false);
const notCanvasClickVal = ref(false);
const currentRbcPageNumber = ref(0);

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
    const result = await detailRunningApi(String(selectedSampleId.value));
    selectItems.value = result.data;
  } catch (e) {
    console.log(e);
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
  currentRbcPageNumber.value = 0;
}

const classInfoArrUpdate = (data: any) => {
  classInfoArr.value = data;
}

const classInfoArrUpdateRe = async (data: any) => {
  const result: any = await detailRunningApi(String(selectedSampleId.value));
  selectItems.value = result.data;
  rbcInfo.value = result.data;
  let newData: any = [];
  newData = data;
  await store.dispatch('commonModule/setCommonInfo', {classInfoArr: newData});
}

const unChecked = () => {
  allCheckClear.value = !allCheckClear.value;
}

const notCanvasClick = (val: any) => {
  notCanvasClickVal.value = val;
}

const changeCurrentRbcImagePageNumber = (pageNumber: number) => {
  currentRbcPageNumber.value = pageNumber;
}

</script>
