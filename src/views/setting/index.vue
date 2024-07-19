<template>
  <div class="settingWrapDiv">
    <ul class="settingTabBtn">
      <template v-if="viewerCheck === 'viewer'">
        <li v-for="tab in viewerTabs" :key="tab" :class="{ activeTab: currentTab === tab }" @click="changeTab(tab)">{{ tab }}</li>
      </template>
      <template v-else>
        <li v-for="tab in tabs" :key="tab" :class="{ activeTab: currentTab === tab }" @click="changeTab(tab)">{{ tab }}</li>
      </template>
    </ul>
    <component class="settingWrap" :is="currentTabComponent" />
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import AnalysisDatabase from "@/views/setting/analysisDatabase/index.vue";
import LoginAccount from "@/views/setting/lognAccount/index.vue";
import Report from "@/views/setting/report/index.vue";
import QualityCheck from "@/views/setting/qualityCheck/index.vue";
import Version from "@/views/setting/version/index.vue";
import {useStore} from "vuex";

const store = useStore();
const tabs = ['Login/Account', 'Analysis/Database', 'Report', 'Quality Check', 'Version'] as const;
const viewerTabs = ['Login/Account', 'Version'] as const;
const currentTab = ref<typeof tabs[number]>(tabs[0]);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);

const changeTab = (tab: typeof tabs[number]) => {
  currentTab.value = tab;
  sessionStorage.setItem('selectedTab', tab);
};

const components = { 'Login/Account': LoginAccount, 'Analysis/Database': AnalysisDatabase, 'Report': Report, 'Quality Check': QualityCheck, 'Version': Version };
const viewerComponents: any = { 'Login/Account': LoginAccount, 'Version': Version };

const storedTab = sessionStorage.getItem('selectedTab');
if (storedTab && tabs.includes(storedTab as typeof tabs[number])) {
  currentTab.value = storedTab as typeof tabs[number];
}


const currentTabComponent = computed(() => {
  if (viewerCheck.value === 'viewer') {
    return viewerComponents[currentTab.value];
  }
  return components[currentTab.value];
}
);
</script>
