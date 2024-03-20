<template>
  <div class="wbcMenu">
    <ul>
      <li @click="pageGo('/databaseRbc')">RBC</li>
      <li @click="pageGo('/databaseWbc')">WBC</li>
      <li @click="pageGo('/report')">REPORT</li>
      <li>LIS-CBC</li>
    </ul>
    <div class="wbcMenuBottom">
      <button @click="moveWbc('up')"><font-awesome-icon :icon="['fas', 'circle-up']" /></button>
      <button @click="moveWbc('down')"><font-awesome-icon :icon="['fas', 'circle-down']" /></button>
    </div>
  </div>
  <div>
    <div style="display:flex">
      <div style="flex:1">
        <RbcClass :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb" />
      </div>
      <div style="flex:4">
        <RbcImageList :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {onMounted, ref} from 'vue';
  import RbcClass from "./rbcClass.vue";
  import RbcImageList from "./rbcImageList/rbcImageList.vue";
  import {RbcInfo} from "@/store/modules/analysis/rbcClassification";
  import router from '@/router';

  const selectItemRbc = sessionStorage.getItem("selectItemRbc");
  const originalDbData = sessionStorage.getItem("originalDbData");
  const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
  const selectItemsData = sessionStorage.getItem("selectItems");
  const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
  const pbiaRootPath = sessionStorage.getItem("pbiaRootPath");
  const clickid = ref(sessionStorage.getItem("dbBaseTrClickId"));
  
  const rbcInfo = ref(null);

  const wbcGo = () => {
    router.push('/databaseWbc')
  }

  const reportGo = () => {
    router.push('/report')
  }

  const updateUpDown = async (selectRbc: any, selectItemsNewVal: any) => {
    rbcInfo.value = selectItemsNewVal.rbcInfo
  };

  const moveRbc = async (direction: string) => {
    const currentDbIndex = originalDb.value.findIndex((item: any) => item.id === selectItems.value.id);
    const nextDbIndex = direction === 'up' ? currentDbIndex - 1  : currentDbIndex + 1;

    if (nextDbIndex >= 0 && nextDbIndex < originalDb.value.length) {
      selectItems.value = originalDb.value[nextDbIndex];
      sessionStorage.setItem('selectItems', JSON.stringify(originalDb.value[nextDbIndex]));
      sessionStorage.setItem('selectItemRbc', JSON.stringify(originalDb.value[nextDbIndex].rbcInfo));
      sessionStorage.setItem('dbBaseTrClickId', String(Number(clickid.value) + (direction === 'up' ? -1 : 1)));
      clickid.value = String(Number(clickid.value) + (direction === 'up' ? -1 : 1));
      //updateUpDown?
      await updateUpDown(originalDb.value[nextDbIndex].rbcInfo, originalDb.value[nextDbIndex]);
    }
  }

  onMounted(() => {
    initData();
  })

  const initData = () => {
    rbcInfo.value = selectItemRbc ? JSON.parse(selectItemRbc) : null;
  }
</script>
