<template>
  <div>
    <div class="setting-activeBtn-container flex-center mb20">
      <Button @click="handleSettingMenu('drCSet')" :isActive="activeTab === 'drCSet'">DRC Set</Button>
      <Button @click="handleSettingMenu('autoMatching')" :isActive="activeTab === 'autoMatching'">
        DRC AutoMatching
      </Button>
    </div>
    <div :class="{'tab-content crc':activeTab === 'drCSet','tab-content arl':activeTab === 'autoMatching'}">
      <DrcSet v-if="activeTab === 'drCSet'"/>
      <AutoCbc v-if="activeTab === 'autoMatching'"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "@/components/commonUi/Button.vue";
import {ref} from "vue";
import DrcSet from "@/views/setting/report/component/drcSet.vue";
import AutoCbc from "@/views/setting/report/component/autoCbc.vue";

const activeTab = ref('drCSet');
const handleSettingMenu = (type: string) => {
  activeTab.value = type;
}
</script>