<template>
  <div>
    <div class="tab-buttons">
      <button @click="selectTab('ImagePrint')" :class="{ 'active': selectedTab === 'ImagePrint' }">Image Print</button>
      <button @click="selectTab('LisCode')" :class="{ 'active': selectedTab === 'LisCode' }">Lis Code</button>
      <button @click="selectTab('CbcCode')" :class="{ 'active': selectedTab === 'CbcCode' }">Cbc Code</button>
    </div>

    <div class="tab-content">
      <component :is="selectedTabComponent"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import ImagePrint from "@/views/setting/report/component/ImagePrint.vue";
import LisCode from "@/views/setting/report/component/lisCode.vue";
import CbcCode from "@/views/setting/report/component/cbcCode.vue";
import {computed, ref} from "vue";

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
      return CbcCode;
    default:
      return null;
  }
});

</script>