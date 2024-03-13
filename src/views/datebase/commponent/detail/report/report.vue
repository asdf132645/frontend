<template>
  <div>
    <ul>
      <li>RBC</li>
      <li>WBC</li>
      <li>REPORT</li>
      <li>LIS-CBC</li>
    </ul>
    <div class="reportDiv">
      <div class="wbcDiv">
        <WbcClass :wbcInfo="wbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='report'/>
      </div>
      <div class="reportDetail">
        <h3 class="reportH3">Analysis Report from UIMD PB system</h3>
        <div class="reportTitle">
          <span>Hospital</span> <span>DM Serial Nbr : {{ selectItems?.slotId }}</span>
          <font-awesome-icon :icon="['fas', 'print']"/>
        </div>
        <table>
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
        <div>
          <div>WBC classification result</div>
<!--          {{ selectItems?.wbcInfo?.wbcInfo[0] }}-->
          <div v-for="(item, idx) in selectItems?.wbcInfo?.wbcInfo[0]" :key="item.id" class="wbcClassDbDiv">
            <div v-if="idx === 0">
              <p>Class</p>
              <p>Count</p>
              <p>%</p>
            </div>
            <div class="circle">
              <p>{{ item?.name }}</p>
              <p>{{ item?.count }}</p>
              <p> {{ item?.percent }} </p>
            </div>
          </div>
          <template v-for="(nWbcItem, outerIndex) in selectItems?.wbcInfo?.nonRbcClassList" :key="outerIndex">
            <div class="categories" v-if="nWbcItem?.count !== '0'">
              <ul class="categoryNm">
                <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
                <li>{{ getCategoryName(nWbcItem) }}</li>
              </ul>
              <ul class="classNm">
                <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
                <li>
                  {{ nWbcItem?.count }}
                  <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'"> /{{ selectItems?.wbcInfo?.maxWbcCount }} WBC</span>
                </li>
              </ul>
              <ul class="degree">
                <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
                <li>-</li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


import WbcClass from "@/views/datebase/commponent/detail/wbc/databaseWbcRight/wbcClass.vue";
import {onMounted, ref} from "vue";
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {WbcInfo} from "@/store/modules/analysis/wbcclassification";
const getCategoryName = (category: WbcInfo) => category?.name;

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const wbcInfo = ref<any>(null);
const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);

onMounted(() => {
  initData();
});

async function initData() {
  wbcInfo.value = selectItemWbc ? JSON.parse(selectItemWbc) : null;
  if (selectItems.value.wbcInfoAfter && selectItems.value.wbcInfoAfter.length !== 0) {
    wbcInfo.value = selectItems.value.wbcInfoAfter;
  } else {
    wbcInfo.value = selectItems.value.wbcInfo.wbcInfo[0]
  }
}
</script>
