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
    <div class="databaseWbcRight">
      <RbcClass :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='listTable'/>
    </div>

    <div class="databaseWbcLeft">
      <RbcImageList :rbcInfo="rbcInfo" :selectItems="selectItems" type='listTable'/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import RbcClass from "./rbcClass.vue";
import RbcImageList from "./rbcImageList/rbcImageList.vue";
import {useStore} from "vuex";
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";

import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";

const selectItemRbc = sessionStorage.getItem("selectItemRbc");
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const store = useStore();
const rbcInfo = ref(null);


onMounted(() => {
  initData();
});

const initData = async () => {
  rbcInfo.value = selectItemRbc ? JSON.parse(selectItemRbc) : null;
}

const refreshClass = async (data: any) => {
  rbcInfo.value = data.rbcInfo;
  selectItems.value = data;
}


</script>
