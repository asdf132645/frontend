<template>

  <ClassInfoMenu @refreshClass="refreshClass"/>
  <div :class="'reportSection' + (cbcLayer ? ' cbcLayer' : '')">
    <LisCbc v-if="cbcLayer" :selectItems="selectItems"/>
    <div class="reportDiv">
      <div class="wbcDiv">
        <WbcClass :wbcInfo="wbcInfo" :selectItems="selectItems" type='report'/>
      </div>
      <div class="rbcDiv" v-if="!projectBm">
        <RbcClass :rbcInfo="rbcInfo" :selectItems="selectItems" type='report'/>
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
              <td>{{ formatDateString(selectItems?.orderDttm) }}</td>
            </tr>
            <tr>
              <th>Signed by ID</th>
              <td>{{ selectItems?.submitUserId }}</td>
            </tr>
            <tr>
              <th>Signed date</th>
              <td>{{ selectItems?.submitOfDate }}</td>
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
              <tr v-for="(item) in wbcArr" :key="item.id" class="wbcClassDbDiv">
                <template v-if="shouldRenderCategory(item.title)">
                  <td>{{ item?.name }}</td>
                  <td>{{ item?.count }}</td>
                  <td> {{ item?.percent || '-' }}</td>
                </template>
              </tr>
              <tr>
                <td>total</td>
                <td>{{ selectItems?.wbcInfo?.totalCount || 0 }}</td>
                <td>100.00</td>
              </tr>
              </tbody>
            </table>

            <h3 v-if="!selectItems?.wbcInfo?.nonRbcClassList" class="reportH3 mb1 pl0">non-WBC</h3>
            <table class="tableClass" v-if="!projectBm">
              <colgroup>
                <col width="40%">
                <col width="20%">
                <col width="20%">
              </colgroup>
              <tbody>
              <template v-for="(nWbcItem, outerIndex) in selectItems?.wbcInfo?.nonRbcClassList" :key="outerIndex">
                <tr v-show="siteCd !== '0006' && nWbcItem?.title !== 'SM'">
                  <td>{{ getCategoryName(nWbcItem) }}</td>
                  <td>
                    {{ nWbcItem?.count }}
                    <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'"> /{{
                        selectItems?.wbcInfo?.maxWbcCount
                      }} WBC</span>
                  </td>
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
                    <li>{{ category?.categoryNm }}</li>
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


import WbcClass from "@/views/datebase/commponent/detail/classInfo/commonRightInfo/classInfo.vue";
import {computed, getCurrentInstance, onMounted, onUnmounted, ref} from "vue";
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {basicBmClassList, basicWbcArr, WbcInfo} from "@/store/modules/analysis/wbcclassification";
import Print from "@/views/datebase/commponent/detail/report/print.vue";
import router from "@/router";
import RbcClass from "@/views/datebase/commponent/detail/rbc/rbcClass.vue";
import {getUserIpApi} from "@/common/api/service/user/userApi";
import {useStore} from "vuex";
import process from "process";
import {formatDateString} from "@/common/lib/utils/dateUtils";
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import {getOrderClassApi} from "@/common/api/service/setting/settingApi";
import LisCbc from "@/views/datebase/commponent/detail/lisCbc.vue";

const getCategoryName = (category: WbcInfo) => category?.name;
const store = useStore();

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItemsSessionStorageData = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const wbcInfo = ref<any>(null);
const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const printOnOff = ref(false);
const printContent = ref(null);
const rbcInfo = ref([]);
const selectItemRbc = sessionStorage.getItem("selectItemRbc");
const userModuleDataGet = computed(() => store.state.userModule);
const siteCd = computed(() => store.state.commonModule.siteCd);
const clonedWbcInfo = computed(() => store.state.commonModule.clonedWbcInfo);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const instance = getCurrentInstance();
const projectBm = ref(false);
const wbcArr = ref<any>([]);
const orderClass = ref<any>([]);

onMounted(async () => {
  await getOrderClass();
  await initData();
  projectBm.value = window.PROJECT_TYPE === 'bm';
});

const shouldRenderCategory = (title: string) => {
  // 제외할 클래스들 정의
  const targetArray = getStringArrayBySiteCd(siteCd.value, selectItemsSessionStorageData.value?.testType);
  return !targetArray.includes(title);
};

const getStringArrayBySiteCd = (siteCd: string, testType: string): string[] => {
  if (!siteCd && siteCd === '') {
    siteCd = '0000';
    testType = '01';
  }
  const arraysBySiteCd: any = { // 0006 -> 고대
    '0006': {
      includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
      includesStr2: ["NR", "AR", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
    },
  };

  // 지정된 siteCd에 대한 배열을 가져오거나, 기본 배열을 반환
  const arraysForSiteCd = arraysBySiteCd[siteCd] || {
    includesStr: ["AR", "NR", "GP", "PA", "MC", "SM", "MA", 'NE', 'GP', 'PA', 'OT'],
    includesStr2: ["NR", "AR", "MC", "MA", 'NE', "SM", 'GP', 'PA', 'OT'],
  };

  // testType에 따라 제외할 부분 정의
  return (testType === '01' || testType === '04') ? arraysForSiteCd.includesStr : arraysForSiteCd.includesStr2;
};

const refreshClass = async (data: any) => {
  selectItems.value = data;
  await initData(data);
}
const printClose = () => {
  printOnOff.value = false;
}
const wbcClassTileChange = (): string => {
  if (!projectBm.value) {
    return 'WBC Classification';
  } else {
    return 'BM Classification';
  }
}
const printStart = () => {
  printOnOff.value = true;
}

const pageGo = (path: string) => {
  router.push(path)
}

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        orderClass.value = [];
      } else {
        orderClass.value = result.data.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
      }
    }
  } catch (e) {
    console.log(e)
  }
}

async function initData(data?: any) {
  if (selectItems.value.wbcInfoAfter && selectItems.value.wbcInfoAfter.length !== 0) {
    let wbcArrs = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
    const sortedWbcInfo = sortWbcInfo(clonedWbcInfo.value, wbcArrs);
    wbcInfo.value = sortedWbcInfo;
    wbcArr.value = sortedWbcInfo;
  } else {
    let wbcArrs = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
    const sortedWbcInfo = sortWbcInfo(selectItems.value.wbcInfo.wbcInfo[0], wbcArrs);
    wbcInfo.value = sortedWbcInfo;
    wbcArr.value = sortedWbcInfo;
  }
  rbcInfo.value = selectItems.value.rbcInfoAfter.length !== 0 && selectItems.value.rbcInfoAfter ? selectItems.value.rbcInfoAfter : selectItems.value.rbcInfo.rbcInfo;
}

const sortWbcInfo = (wbcInfo: any, basicWbcArr: any) => {
  let newSortArr = JSON.parse(JSON.stringify(wbcInfo));

  newSortArr.sort((a: any, b: any) => {
    const nameA = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (a.title || a.abbreviation));
    const nameB = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (b.title || b.abbreviation));

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });

  return newSortArr;
};


</script>
