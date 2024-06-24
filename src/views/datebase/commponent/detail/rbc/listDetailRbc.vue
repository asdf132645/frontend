<template>
  <ClassInfoMenu @refreshClass="refreshClass"/>

  <div class="wbcContent">

    <div class="topClintInfo">
      <ul>
        <li>{{ getTestTypeText(selectItems?.testType) }} Smear</li>
        <li>{{ selectItems?.barcodeNo }}</li>
        <li>{{ selectItems?.patientId || 'patientId No Data' }}</li>
        <li>{{ selectItems?.cbcPatientNo }}</li>
        <li>{{ selectItems?.patientName }}</li>
        <li> {{ selectItems?.cbcPatientNm }} {{ selectItems?.cbcSex }} {{ selectItems?.cbcAge }}</li>
        <li>{{ selectItems?.analyzedDttm }}</li>
      </ul>
    </div>
    <LisCbc v-if="cbcLayer" :selectItems="selectItems"/>
    <div :class="'databaseWbcRight' + (cbcLayer ? ' cbcLayer' : '')">
      <RbcClass @isBeforeUpdate="isBeforeUpdate" @classInfoArrUpdate="classInfoArrUpdate" :selectItems="selectItems" type='listTable' :allCheckClear="allCheckClear"/>
    </div>

    <div :class="'databaseWbcLeft' + (cbcLayer ? ' cbcLayer' : '')">
      <RbcImageList  @unChecked="unChecked" :isBefore="isBefore" :classInfoArr="classInfoArr" :selectItems="selectItems" type='listTable'/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeMount, ref} from 'vue';
import RbcClass from "./rbcClass.vue";
import RbcImageList from "./rbcImageList/rbcImageList.vue";
import {useStore} from "vuex";
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import LisCbc from "@/views/datebase/commponent/detail/lisCbc.vue";
import {detailRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
const selectItems = ref<any>(null);
const store = useStore();
const classInfoArr = ref<any>([]);
const allCheckClear = ref<boolean>(false);
const isBefore = ref(false);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const isLoading = ref(true);

onBeforeMount(async () => {
  await getDetailRunningInfo();
})

const getDetailRunningInfo = async () => {
  try {
    const result = await detailRunningApi(String(selectedSampleId.value));
    selectItems.value = result.data;
  } catch (e) {
    console.log(e);
    selectItems.value = null;
  }
  isLoading.value = false;
}

const isBeforeUpdate = (val: boolean) => {
  isBefore.value = val;
}

const refreshClass = async (data: any) => {
  selectItems.value = data;
  allCheckClear.value = !allCheckClear.value;
}

const classInfoArrUpdate = (data: any) => {
  classInfoArr.value = data;
}

const unChecked = () => {
  allCheckClear.value = !allCheckClear.value;
}

</script>
