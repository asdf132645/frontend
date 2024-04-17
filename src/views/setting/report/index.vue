<template>
  <div>
    <div class="tab-buttons">
      <button @click="selectTab('ImagePrint')" :class="{ 'active': selectedTab === 'ImagePrint' }">Image Print</button>
      <div v-if="!projectBm">
        <button @click="selectTab('LisCode')" :class="{ 'active': selectedTab === 'LisCode' }">Lis Code</button>
        <button @click="selectTab('CbcCode')" :class="{ 'active': selectedTab === 'CbcCode' }">CBC Code</button>
        <button @click="selectTab('filePathSet')" :class="{ 'active': selectedTab === 'filePathSet' }">File Path Set & LisHotKey</button>
      </div>
      <button @click="selectTab('countSet')" :class="{ 'active': selectedTab === 'countSet' }">Count Set</button>
    </div>

    <div class="tab-content">
      <component :is="selectedTabComponent"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import ImagePrint from "@/views/setting/report/component/ImagePrint.vue";
import LisCode from "@/views/setting/report/component/lisCode.vue";
import cbcCode from "@/views/setting/report/component/cbcCode.vue";
import FilePathSet from '@/views/setting/report/component/filePathSet.vue';
import CountSet from '@/views/setting/report/component/countSet.vue';
import  * as process from "process";

import {computed, ref, onMounted} from "vue";

const projectBm = ref(false);

let selectedTab = ref('ImagePrint');

const selectTab = (tabName: string) => {
  selectedTab.value = tabName;
};

const selectedTabComponent = computed(() => {
  switch (selectedTab.value) {
    case 'ImagePrint':
      return ImagePrint;
    case 'LisCode':
      return LisCode;
    case 'CbcCode':
      return cbcCode;
    case 'filePathSet':
      return FilePathSet;
    case 'countSet':
      return CountSet;
    default:
      return null;
  }
});

onMounted(() => {
  projectBm.value = process.env.PROJECT_TYPE === 'bm' ? true : false;
})

</script>