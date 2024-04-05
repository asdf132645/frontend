<template>
  <div class="wbcMenu">
    <ul>
      <li class="onRight" @click="pageGo('/databaseRbc')">RBC</li>
      <li @click="pageGo('/databaseWbc')">WBC</li>
      <li @click="pageGo('/report')">REPORT</li>
      <li>LIS-CBC</li>
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
    <div class="databaseWbcRight">
      <RbcClass :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='listTable' />
    </div>
    
    <div class="databaseWbcLeft">
      <RbcImageList :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='listTable'/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import RbcClass from "./rbcClass.vue";
import RbcImageList from "./rbcImageList/rbcImageList.vue";
import router from '@/router';
import {useStore} from "vuex";

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

onMounted(() => {
  initData();
});

const initData = () => {
  rbcInfo.value = selectItemRbc ? JSON.parse(selectItemRbc) : null;
}

const pageGo = (path: string) => {
  router.push(path)
}

const moveRbc = (direction: any) => {
  const currentDbIndex = originalDb.value.findIndex((item: any) => item.id === selectItems.value.id);
  const nextDbIndex = direction === 'up' ? currentDbIndex - 1 : currentDbIndex + 1;
  
  if (nextDbIndex >= 0 && nextDbIndex < originalDb.value.length) {
    selectItems.value = originalDb.value[nextDbIndex];
    sessionStorage.setItem('selectItems', JSON.stringify(originalDb.value[nextDbIndex]));
    sessionStorage.setItem('selectItemRbc', JSON.stringify(originalDb.value[nextDbIndex].rbcInfo));
    sessionStorage.setItem('dbBaseTrClickId', String(Number(clickid.value) + (direction === 'up' ? -1 : 1)));
    clickid.value = String(Number(clickid.value) + (direction === 'up' ? -1 : 1));
    updateUpDown(originalDb.value[nextDbIndex].rbcInfo, originalDb.value[nextDbIndex]);
  }
}

const updateUpDown = (selectRbc: any, selectItemsNewVal: any) => {
  rbcInfo.value = selectItemsNewVal.rbcInfoAfter && selectItemsNewVal.rbcInfoAfter.length !== 0
      ? selectItemsNewVal.rbcInfoAfter
      : selectItemsNewVal.rbcInfo;
  initData();
}


</script>
