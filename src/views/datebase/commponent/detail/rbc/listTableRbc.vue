<template>
  <div class="wbcMenu">
    <ul>
      <li @click="pageGo('/databaseRbc')">RBC</li>
      <li @click="pageGo('/databaseWbc')">WBC</li>
      <li @click="pageGo('/report')">REPORT</li>
      <li>LIS-CBC</li>
    </ul>
    <div class="wbcMenuBottom">
      <button @click="moveWbc('up')">
        <font-awesome-icon :icon="['fas', 'circle-up']"/>
      </button>
      <button @click="moveWbc('down')">
        <font-awesome-icon :icon="['fas', 'circle-down']"/>
      </button>
    </div>
  </div>

  <div class="wbcCotent">
    <div class="databaseWbcRight">
      <RbcClass :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='listTable' />
    </div>
    
    <div class="databaseWbcLeft">
      <RbcImageList :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb"/>
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

onMounted(()=>{
  initData();
})

const pageGo = (path: string) => {
  router.push(path)
}

const initData = () => {
  console.log(selectItemRbc)
  rbcInfo.value = selectItemRbc ? JSON.parse(selectItemRbc) : null;
}
</script>

<style lang="css" scoped>
@import "@/assets/css/rbc/rbcImageList.css";
</style>