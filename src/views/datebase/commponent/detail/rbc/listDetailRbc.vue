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
        <li> {{ selectItems?.cbcPatientNm }} {{ selectItems?.cbcSex }}  {{ selectItems?.cbcAge }}</li>
        <li>{{ selectItems?.analyzedDttm }}</li>
      </ul>
    </div>
    <div class="databaseWbcRight">
      <RbcClass :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='listTable' />
    </div>
    
    <div class="databaseWbcLeft">
      <RbcImageList :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='listTable'/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, getCurrentInstance, onMounted, onUnmounted, ref} from 'vue';
import RbcClass from "./rbcClass.vue";
import RbcImageList from "./rbcImageList/rbcImageList.vue";
import router from '@/router';
import {useStore} from "vuex";
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {moveFunction, stateDeleteCommon, stateUpdateCommon} from "@/common/lib/commonfunction";
import {getUserIpApi} from "@/common/api/service/user/userApi";
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";

const selectItemRbc = sessionStorage.getItem("selectItemRbc");
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const store = useStore();
const commonDataGet = computed(() => store.state.commonModule);
const pbiaRootPath = commonDataGet.value.pbiaRootPath;
const clickid = ref(sessionStorage.getItem("dbBaseTrClickId"));
const rbcInfo = ref(null);
const userModuleDataGet = computed(() => store.state.userModule);
const instance = getCurrentInstance();


onMounted(() => {
  initData();
});

onUnmounted(async () => {
  await stateDeleteCommon(originalDb.value, selectItems.value, userModuleDataGet.value.id)
      .then(response => {
        instance?.appContext.config.globalProperties.$socket.emit('state', {
          type: 'SEND_DATA',
          payload: 'refreshDb'
        });
      }).catch(error => {
        console.error('Error:', error.response.data);
      });
})


const initData =  async () => {
  rbcInfo.value = selectItemRbc ? JSON.parse(selectItemRbc) : null;
}


const refreshClass = async (data: any) => {
  rbcInfo.value = data.rbcInfo;
}


</script>
