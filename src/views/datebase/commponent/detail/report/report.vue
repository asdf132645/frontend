<template>
  <div class="wbcMenu">
    <ul>
      <li>RBC</li>
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
  <div class="reportSection">
    <div class="reportDiv">
      <div class="wbcDiv">
        <WbcClass :wbcInfo="wbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='report'/>
      </div>
      <div class="reportDetail">
        <div class="reportTitle">
          <span>[Hospital]</span> <span>DM Serial Nbr : {{ selectItems?.slotId }}</span>
          <font-awesome-icon :icon="['fas', 'print']" @click="printStart" class="printStart"/>
        </div>
        <h3 class="reportH3">Analysis Report from UIMD PB system</h3>
        <table class="reportTable">
          <tbody>
          <tr>
            <th>Slot ID</th>
            <td>{{ selectItems?.slotId }}</td>
          </tr>
          <tr>
            <th>Ordered date</th>
            <td>{{ selectItems?.orderDttm }}</td>
          </tr>
          <tr>
            <th>Signed by ID</th>
            <td>{{ selectItems?.signedUserId }}</td>
          </tr>
          <tr>
            <th>Signed date</th>
            <td>{{ selectItems?.signedOfDate }}</td>
          </tr>
          <tr>
            <th>Patient ID</th>
            <td>{{ selectItems?.patientId }}</td>
          </tr>
          <tr>
            <th>Ordered Classification</th>
            <td>{{ getTestTypeText(selectItems?.testType) }}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>{{ selectItems?.patientName }}</td>
          </tr>
          <tr>
            <th>Birth</th>
            <td>{{ selectItems?.birthDay }}</td>
          </tr>
          <tr>
            <th>Gender</th>
            <td>{{ selectItems?.gender === '01' ? 'Male' : 'Female' }}</td>
          </tr>
          </tbody>
        </table>
        <div class="reportDivBottom">
         <div class="wbcLeft">
           <h3 class="reportH3 mb1 pl0">WBC classification result</h3>
           <table class="tableClass">
             <colgroup>
               <col width="40%">
               <col width="20%">
               <col width="20%">
             </colgroup>
             <thead>
             <tr>
               <th>Class</th>
               <th>Count</th>
               <th>%</th>
             </tr>
             </thead>
             <tbody>
             <tr v-for="(item) in selectItems?.wbcInfoAfter" :key="item.id" class="wbcClassDbDiv">
               <td>{{ item?.name }}</td>
               <td>{{ item?.count }}</td>
               <td> {{ item?.percent || '-' }}</td>
             </tr>
             </tbody>
           </table>
           <table class="tableClass">
             <colgroup>
               <col width="37%">
               <col width="20%">
               <col width="20%">
               <col width="20%">
             </colgroup>
             <tbody>
             <template v-for="(nWbcItem, outerIndex) in selectItems?.wbcInfo?.nonRbcClassList" :key="outerIndex">
               <tr>
                 <td>{{ getCategoryName(nWbcItem) }}</td>
                 <td>
                   {{ nWbcItem?.count }}
                   <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'"> /{{ selectItems?.wbcInfo?.maxWbcCount }} WBC</span>
                 </td>
                 <td v-if="outerIndex === 0"></td>
                 <td>-</td>
               </tr>
             </template>
             </tbody>
           </table>
         </div>
        </div>
      </div>
    </div>
  </div>
  <Print v-if="printOnOff" :selectItems="selectItems" ref="printContent" :printOnOff="printOnOff"
         :selectItemWbc="selectItemWbc" @printClose="printClose"/>
</template>

<script setup lang="ts">


import WbcClass from "@/views/datebase/commponent/detail/wbc/databaseWbcRight/wbcClass.vue";
import {onMounted, ref} from "vue";
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {WbcInfo} from "@/store/modules/analysis/wbcclassification";
import Print from "@/views/datebase/commponent/detail/report/print.vue";
import router from "@/router";

const getCategoryName = (category: WbcInfo) => category?.name;

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const wbcInfo = ref<any>(null);
const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const printOnOff = ref(false);
const printContent = ref(null);
const clickid = ref(sessionStorage.getItem('dbBaseTrClickId'));

onMounted(() => {
  initData();
});

const printClose = () => {
  printOnOff.value = false;
}

const printStart = () => {
  printOnOff.value = true;
}
const pageGo = (path: string) => {
  router.push(path)
}

async function initData() {
  wbcInfo.value = selectItemWbc ? JSON.parse(selectItemWbc) : null;
  if (selectItems.value.wbcInfoAfter && selectItems.value.wbcInfoAfter.length !== 0) {
    wbcInfo.value = selectItems.value.wbcInfoAfter;
  } else {
    wbcInfo.value = selectItems.value.wbcInfo.wbcInfo[0]
  }
}

const moveWbc = async (direction: any) => {
  const currentDbIndex = originalDb.value.findIndex((item: any) => item.id === selectItems.value.id);
  const nextDbIndex = direction === 'up' ? currentDbIndex - 1 : currentDbIndex + 1;

  if (nextDbIndex >= 0 && nextDbIndex < originalDb.value.length) {
    selectItems.value = originalDb.value[nextDbIndex];
    sessionStorage.setItem('selectItems', JSON.stringify(originalDb.value[nextDbIndex]));
    sessionStorage.setItem('selectItemWbc', JSON.stringify(originalDb.value[nextDbIndex].wbcInfo.wbcInfo));
    sessionStorage.setItem('dbBaseTrClickId', String(Number(clickid.value) + (direction === 'up' ? -1 : 1)));
    clickid.value = String(Number(clickid.value) + (direction === 'up' ? -1 : 1));
    await updateUpDown(originalDb.value[nextDbIndex].wbcInfo.wbcInfo[0], originalDb.value[nextDbIndex]);
  }
}

const updateUpDown = async (selectWbc: any, selectItemsNewVal: any) => {
  wbcInfo.value = selectItemsNewVal.wbcInfoAfter && selectItemsNewVal.wbcInfoAfter.length !== 0
      ? selectItemsNewVal.wbcInfoAfter
      : selectItemsNewVal.wbcInfo.wbcInfo[0];

};

</script>
