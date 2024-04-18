<template>
  <div class="wbcMenu">
    <ul>
      <li v-if="projectBm === false" @click="pageGo('/databaseRbc')">RBC</li>
      <li v-else @click="pageGo('/databaseWhole')">WHOLE</li>
      <li v-if="projectBm === false" @click="pageGo('/databaseWbc')">WBC</li>
      <li v-else @click="pageGo('/databaseBm')">BMCELL</li>
      <li class="onRight" @click="pageGo('/report')">REPORT</li>
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
      <div class="rbcDiv" v-if="!projectBm">
        <RbcClass :rbcInfo="rbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='report' />
      </div>
      <div class="reportDetail">
        <div class="reportTitle">
          <span>[Hospital]</span> <span>DM Serial Nbr : {{ selectItems?.slotId }}</span>
          <font-awesome-icon :icon="['fas', 'print']" @click="printStart" class="printStart"/>
        </div>
        <div class="reportDivTop">
          <h3 class="reportH3" v-if="!projectBm">Analysis Report from UIMD PB system</h3>
          <h3 class="reportH3" v-if="projectBm">Analysis Report from UIMD BM system</h3>
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
        </div>
        <div class="reportDivBottom">
         <div class="wbcLeft">
           <h3 class="reportH3 mb1 pl0">{{ wbcClassTileChange() }} result</h3>
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
          <div class="rbcRight" v-if="!projectBm">
            <h3 class="reportH3 mb1 pl0">RBC classification result</h3>
            <template v-for="(classList, outerIndex) in [rbcInfo]" :key="outerIndex">
              <template v-for="(category, innerIndex) in classList" :key="innerIndex">
                <div class="categories">
                  <ul class="categoryNm">
                    <li v-if="innerIndex === 0" class="mb1 liTitle">Category</li>
                    <li>{{ category.categoryNm }}</li>
                  </ul>
                  <ul class="classNm">
                    <li v-if="innerIndex === 0" class="mb1 liTitle">Class</li>
                    <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                      <li>{{ classInfo?.classNm }}</li>
                    </template>
                  </ul>
                  <ul class="degree">
                    <li v-if="innerIndex === 0" class="mb1 liTitle">Degree</li>
                    <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                      <li v-if="classInfo.classId !== '01' || category.categoryId === '05'">
                        {{ classInfo?.degree }}
                      </li>
                    </template>
                  </ul>
                </div>
              </template>
            </template>
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
import {computed, getCurrentInstance, onMounted, onUnmounted, ref} from "vue";
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {WbcInfo} from "@/store/modules/analysis/wbcclassification";
import Print from "@/views/datebase/commponent/detail/report/print.vue";
import router from "@/router";
import RbcClass from "@/views/datebase/commponent/detail/rbc/rbcClass.vue";
import {moveFunction, stateDeleteCommon, stateUpdateCommon} from "@/common/lib/commonfunction";
import {getUserIpApi} from "@/common/api/service/user/userApi";
import {useStore} from "vuex";
import process from "process";

const getCategoryName = (category: WbcInfo) => category?.name;
const store = useStore();

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const wbcInfo = ref<any>(null);
const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const printOnOff = ref(false);
const printContent = ref(null);
const clickid = ref(sessionStorage.getItem('dbBaseTrClickId'));
const rbcInfo = ref([]);
const selectItemRbc = sessionStorage.getItem("selectItemRbc");
const userModuleDataGet = computed(() => store.state.userModule);
const instance = getCurrentInstance();
const projectBm = ref(false);


onMounted(() => {
  initData();
  projectBm.value = process.env.PROJECT_TYPE === 'bm';
});

onUnmounted(async () => {
  await stateDeleteCommon(originalDb.value, selectItems.value, userModuleDataGet.value.id)
      .then(response => {
        instance?.appContext.config.globalProperties.$socket.emit('state', {
          type: 'SEND_DATA',
          payload: 'refreshDb'
        });
      }).catch(error => {
        console.error('Error:', error.response.data);
      });
})

const printClose = () => {
  printOnOff.value = false;
}
const wbcClassTileChange = (): string => {
  if (!projectBm.value){
    return 'WBC Classification';
  }else{
    return 'BM Classification';
  }
}
const printStart = () => {
  printOnOff.value = true;
}
const pageGo = (path: string) => {
  router.push(path)
}

async function initData() {
  wbcInfo.value = [];
  wbcInfo.value = selectItemWbc ? JSON.parse(selectItemWbc) : null;
  if (selectItems.value.wbcInfoAfter && selectItems.value.wbcInfoAfter.length !== 0) {
    wbcInfo.value = selectItems.value.wbcInfoAfter;
  } else {
    wbcInfo.value = selectItems.value.wbcInfo.wbcInfo[0]
  }
  rbcInfo.value = selectItemRbc ? JSON.parse(selectItemRbc) : null;
  const result = await getUserIpApi();
  await stateUpdateCommon(selectItems.value, result.data, [...originalDb.value], userModuleDataGet.value.id).then(response => {
    instance?.appContext.config.globalProperties.$socket.emit('state', {
      type: 'SEND_DATA',
      payload: 'refreshDb'
    });
  }).catch(error => {
    console.error('Error:', error.response.data);
  });
}

const moveWbc = async (direction: any) => {
  await stateDeleteCommon(originalDb.value, selectItems.value, userModuleDataGet.value.id);
  await moveFunction(direction, originalDb, selectItems, clickid, updateUpDown);
  const result = await getUserIpApi();
  await stateUpdateCommon(selectItems.value, result.data, [...originalDb.value], userModuleDataGet.value.id).then(response => {
    initData();
    instance?.appContext.config.globalProperties.$socket.emit('state', {
      type: 'SEND_DATA',
      payload: 'refreshDb'
    });
  }).catch(error => {
    console.error('Error:', error.response.data);
  });
}

const updateUpDown = async (selectWbc: any, selectItemsNewVal: any) => {
  const keepPage = sessionStorage.getItem('keepPage');
  if(keepPage === 'true' && process.env.PROJECT_TYPE === 'pb'){
    router.push('/databaseWbc')
  }
  wbcInfo.value = selectItemsNewVal.wbcInfoAfter && selectItemsNewVal.wbcInfoAfter.length !== 0
      ? selectItemsNewVal.wbcInfoAfter
      : selectItemsNewVal.wbcInfo.wbcInfo[0];
  initData();
};

</script>
