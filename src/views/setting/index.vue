<template>
  <div>
    <ul>
      <li @click="changeTab('login')">Login / Account</li>
      <li @click="changeTab('analysis')">Analysis / Database</li>
      <li @click="changeTab('report')">Report</li>
      <li @click="changeTab('quality')">Quality Check</li>
    </ul>
    <component :is="currentTabComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AnalysisDatabase from "@/views/setting/commponent/analysisDatabase.vue";
import LognAccount from "@/views/setting/commponent/lognAccount.vue";
import Report from "@/views/setting/commponent/report.vue";
import QualityCheck from "@/views/setting/commponent/qualityCheck.vue";

type TabComponents = {
  login: typeof LognAccount;
  analysis: typeof AnalysisDatabase;
  report: typeof Report;
  quality: typeof QualityCheck;
};

const currentTab = ref<'login' | 'analysis' | 'report' | 'quality'>('login');

const changeTab = (tab: 'login' | 'analysis' | 'report' | 'quality') => {
  currentTab.value = tab;
  sessionStorage.setItem('selectedTab', tab);
};

const components: TabComponents = {
  login: LognAccount,
  analysis: AnalysisDatabase,
  report: Report,
  quality: QualityCheck,
};

const storedTab = sessionStorage.getItem('selectedTab');
if (storedTab && ['login', 'analysis', 'report', 'quality'].includes(storedTab)) {
  currentTab.value = storedTab as 'login' | 'analysis' | 'report' | 'quality';
}

const currentTabComponent = computed(() => components[currentTab.value]);
</script>
