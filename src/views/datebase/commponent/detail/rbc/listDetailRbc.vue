<template>
  <div class="wbcMenu">
    <ul>
      <li class="onRight" @click="pageGo('/databaseRbc')">RBC</li>
      <li @click="pageGo('/databaseWbc')">WBC</li>
      <li @click="pageGo('/report')">REPORT</li>
<!--      <li>LIS-CBC</li>-->
    </ul>
    <div class="wbcMenuBottom">
      <button @click="moveRbc('up')">
        <font-awesome-icon :icon="['fas', 'circle-up']"/>
      </button>
      <button @click="moveRbc('down')">
        <font-awesome-icon :icon="['fas', 'circle-down']"/>
      </button>
    </div>
  </div>

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
  const result = await getUserIpApi();
  await stateUpdateCommon(selectItems.value, result.data, [...originalDb.value], userModuleDataGet.value.id).then(response => {
    instance?.appContext.config.globalProperties.$socket.emit('state', {
      type: 'SEND_DATA',
      payload: 'refreshDb'
    });
  }).catch(error => {
    console.error('Error:', error.response.data);
  });
}

const pageGo = (path: string) => {
  router.push(path)
}

const moveRbc = async (direction: any) => {
  await stateDeleteCommon(originalDb.value, selectItems.value, userModuleDataGet.value.id);
  await moveFunction(direction, originalDb, selectItems, clickid, updateUpDown);
  const result = await getUserIpApi();
  await stateUpdateCommon(selectItems.value, result.data, [...originalDb.value], userModuleDataGet.value.id).then(response => {
    instance?.appContext.config.globalProperties.$socket.emit('state', {
      type: 'SEND_DATA',
      payload: 'refreshDb'
    });
    initData();
  }).catch(error => {
    console.error('Error:', error.response.data);
  });
}

const updateUpDown = (selectRbc: any, selectItemsNewVal: any) => {
  const keepPage = sessionStorage.getItem('keepPage');
  if(keepPage === 'true' && process.env.PROJECT_TYPE === 'pb'){
    router.push('/databaseWbc')
  }
  // console.log(keepPage);
  rbcInfo.value = selectItemsNewVal.rbcInfoAfter && selectItemsNewVal.rbcInfoAfter.length !== 0
      ? selectItemsNewVal.rbcInfoAfter
      : selectItemsNewVal.rbcInfo;
  initData();
}


</script>
