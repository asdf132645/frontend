<template>

  <ClassInfoMenu @refreshClass="refreshClass"/>
  <div :class="'reportSection' + (cbcLayer ? ' cbcLayer' : '')">
    <LisCbc v-if="cbcLayer" :selectItems="selectItems"/>
    <div class="reportDiv">
      <div class="wbcDiv shadowBox">
        <WbcClass v-if="!isLoading" :wbcInfo="wbcInfo" :selectItems="selectItems" type='report'
                  @classOrderChanged="classOrderChanged" @submitStateChanged="submitStateChanged"
                  :isCommitChanged="isCommitChanged"/>
      </div>
      <div class="rbcDiv shadowBox" v-if="!projectBm && selectItems.testType === '04'">
        <RbcClass v-if="!isLoading" :rbcInfo="rbcInfo" :selectItems="selectItems" type='report'
                  @submitStateChanged="submitStateChanged" :isCommitChanged="isCommitChanged"/>
      </div>
      <div class="reportDetail shadowBox">
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
              <td>{{
                  projectBm ? getBmTestTypeText(selectItems?.testType) : getTestTypeText(selectItems?.testType)
                }}
              </td>
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
              <td>{{ selectItems?.gender === '' ? '' : selectItems?.gender === '01' ? 'Male' : 'Female' }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div :class="['reportDivBottom', selectItems.testType !== '04' && 'reportDiff']">
          <div :class="['wbcLeft', projectBm && 'wbcLeftBm']">
            <h3 class="reportH3 mb1 pl0">{{ wbcClassTileChange() }} result</h3>
            <table class="tableClass mt22">
              <colgroup>
                <col width="40%">
                <col width="20%">
                <col width="20%">
              </colgroup>
              <thead>
              <tr class="reportWbcclassificationSmallTitle">
                <th>Class</th>
                <th>Count</th>
                <th>Percent</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item) in wbcInfo" :key="item.id" class="wbcClassDbDiv">
                <template v-if="shouldRenderCategory(item.title)">
                  <td>{{ item?.name }}</td>
                  <td>{{ item?.count }}</td>
                  <td> {{ Number(item?.percent) || '0' }}</td>
                </template>
              </tr>
              <tr>
                <td>Total</td>
                <td>{{ selectItems?.wbcInfo?.totalCount || 0 }}</td>
                <td>100.00</td>
              </tr>
              </tbody>
            </table>

            <h3 v-if="!selectItems?.wbcInfo?.nonRbcClassList && !projectBm" class="reportH3 mb1 pl0">non-WBC</h3>
            <table class="tableClass" v-if="!projectBm">
              <colgroup>
                <col width="40%">
                <col width="20%">
                <col width="20%">
              </colgroup>
              <tbody>
              <template v-for="(nWbcItem, outerIndex) in nonWbcClassList" :key="outerIndex">
                <tr v-show="siteCd !== '0006' && nWbcItem?.title !== 'SM'">
                  <td>{{ getCategoryName(nWbcItem) }}</td>
                  <td>
                    {{ Number(nWbcItem?.count) || 0 }}
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
          <div class="rbcRight" v-if="!projectBm && selectItems.testType === '04'">
            <h3 class="reportH3 pl0">RBC classification result</h3>
            <template v-for="(classList, outerIndex) in [rbcInfoAfterData]" :key="outerIndex">
              <template v-for="(category, innerIndex) in classList" :key="innerIndex">
                <div class="categories">
                  <ul class="printRbcCategory">
                    {{ type }}
                    <li v-if="innerIndex === 0" class="mb1 liTitle" style="cursor: default;">Category</li>
                    <li style="cursor: default;">{{ category?.categoryNm }}</li>
                  </ul>
                  <ul class="printRbcClass">
                    <li v-if="innerIndex === 0" class="mb1 liTitle" style="cursor: default;">Class</li>
                    <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                      <li style="cursor: default;">{{ classInfo?.classNm }}</li>
                      <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '03'"
                          style="cursor: default;"
                      >
                        Others
                      </li>
                      <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryNm === 'Inclusion Body'"
                          style="cursor: default;"
                      >
                        Malaria
                      </li>
                    </template>
                  </ul>
                  <ul class="printRbcDegree">
                    <li v-if="innerIndex === 0" class="mb1 liTitle" style="cursor: default;">Degree</li>
                    <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                      <li style="cursor: default;">
                        {{ Number(classInfo?.degree) || 0 }}
                      </li>

                      <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '03'"
                          style="cursor: default;"
                      >
                        -
                      </li>
                      <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryNm === 'Inclusion Body'">
                        -
                      </li>
                    </template>

                    <li class="printTotalText" v-show="category.categoryNm !== 'Shape'"
                        style="cursor: default;"
                    >Total</li>
                  </ul>
                  <ul class="printRbcCount">
                    <li v-if="innerIndex === 0" class="mb1 liTitle" style="cursor: default;">Count</li>
                    <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                      <li style="cursor: default;">
                        {{ Number(classInfo?.originalDegree) || 0 }}
                      </li>

                      <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '03'"
                          style="cursor: default;"
                      >
                        {{ Number(shapeOthersCount) || 0 }}
                      </li>

                      <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryNm === 'Inclusion Body'"
                          style="cursor: default;"
                      >
                        {{ Number(malariaCount) || 0 }}
                      </li>
                    </template>

                    <li v-show="category?.categoryNm === 'Size' || category?.categoryNm === 'Chromia'" style="cursor: default;">
                      {{ Number(sizeChromiaTotal) || 0 }}
                    </li>
                    <li v-show="category?.categoryNm === 'Inclusion Body'" style="cursor: default;">{{ Number(shapeBodyTotal) || 0 }}</li>
                  </ul>
                  <ul class="printRbcPercent">
                    <li v-if="innerIndex === 0" class="mb1 liTitle" style="cursor: default;">Percent</li>
                    <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                      <li style="cursor: default;">
                        {{ percentageChange(Number(classInfo?.originalDegree)) || 0 }}
                      </li>

                      <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '03'"
                          style="cursor: default;"
                      >
                        {{ percentageChange(shapeOthersCount) || 0 }}
                      </li>

                      <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryNm === 'Inclusion Body'"
                          style="cursor: default;"
                      >
                        {{ percentageChange(malariaCount) || 0 }}
                      </li>
                    </template>

                    <li v-show="category.categoryNm !== 'Shape'" style="cursor: default;">100%</li>
                  </ul>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div ref="printContent">
    <Print v-if="printOnOff" @printClose="printClose"/>
<!--    <Print v-if="printOnOff" :printOnOff="printOnOff" :selectItemWbc="selectItems.wbcInfo.wbcInfo[0]"-->
<!--           @printClose="printClose"/>-->
  </div>
</template>

<script setup lang="ts">


import WbcClass from "@/views/datebase/commponent/detail/classInfo/commonRightInfo/classInfo.vue";
import {computed, getCurrentInstance, onBeforeMount, onMounted, onUnmounted, ref, watch} from "vue";
import {getBmTestTypeText, getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {defaultBmClassList, defaultWbcClassList, WbcInfo} from "@/store/modules/analysis/wbcclassification";
import Print from "@/views/datebase/commponent/detail/report/print.vue";
import router from "@/router";
import RbcClass from "@/views/datebase/commponent/detail/rbc/rbcClass.vue";
import {useStore} from "vuex";
import {formatDateString} from "@/common/lib/utils/dateUtils";
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import {getOrderClassApi, getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import LisCbc from "@/views/datebase/commponent/detail/lisCbc.vue";
import {detailRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {hospitalSiteCd} from "@/common/siteCd/siteCd";
import {inhaPercentChange, seoulStMaryPercentChange} from "@/common/lib/commonfunction/classFicationPercent";

const getCategoryName = (category: WbcInfo) => category?.name;
const store = useStore();

const selectItems = ref<any>([]);
const wbcInfo = ref<any>(null);
const printOnOff = ref(false);
const rbcInfo = ref<any>([]);
const siteCd = computed(() => store.state.commonModule.siteCd);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId)
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const rbcInfoAfterData = computed(() => store.state.commonModule.rbcInfoAfterData);
const classInfoSort = computed(() => store.state.commonModule.classInfoSort);
const instance = getCurrentInstance();
const projectBm = ref(false);
const orderClass = ref<any>([]);
const isLoading = ref(true);
const nonWbcTitleArr = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM'];
const nonWbcClassList = ref<any[]>([]);
const printContent = ref<HTMLElement | null>(null);

const rbcInfoPathAfter = ref<any>([]);
const rbcTotalVal = ref(0);
const sizeChromiaTotal = ref(0);
const chromiaTotalTwo = ref(0);
const shapeBodyTotal = ref(0);
const shapeOthersCount = ref(0);
const malariaCount = ref(0);
const maxRbcCount = ref(0);
const pltCount = ref(0);
const rbcDegreeStandard = ref<any>([]);
const isCommitChanged = ref(false);

onBeforeMount(() => {
  projectBm.value = window.PROJECT_TYPE === 'bm';
})

const handleClickOutside = (event: MouseEvent) => {
  if (printContent.value && !printContent.value.contains(event.target as Node) && printOnOff.value) {
    printClose();
  }
};


onMounted(async () => {
  await getDetailRunningInfo();
  isLoading.value = false;
  await getOrderClass();
  await initData();

  if (!projectBm.value) {
    await rbcTotalAndReCount();
    await getRbcDegreeData();
    await reDegree();
    await calcShapeOthersCount();
  }
  document.addEventListener('click', handleClickOutside);

});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const getDetailRunningInfo = async () => {
  try {
    const result = await detailRunningApi(String(selectedSampleId.value));
    selectItems.value = result.data;
    rbcInfo.value = result.data;

  } catch (e) {
    console.log(e);
  }
}

const percentChangeBySiteCd = () => {
  const isSeoulStMaryHospitalSiteCd = hospitalSiteCd.find((item) => item.hospitalNm === '서울성모병원')?.siteCd === siteCd.value;
  const isInhaHospitalSiteCd = hospitalSiteCd.find((item) => item.hospitalNm === '인하대병원')?.siteCd === siteCd.value;
  if (isSeoulStMaryHospitalSiteCd) {
    console.log(12);
    wbcInfo.value =  seoulStMaryPercentChange(selectItems.value?.wbcInfoAfter, wbcInfo.value);
  } else if (isInhaHospitalSiteCd) {
    wbcInfo.value = inhaPercentChange(selectItems.value, wbcInfo.value);
  }
  console.log('wbcInfo', wbcInfo.value);
}

const calcShapeOthersCount = async () => {
  const shapeOthers: any = await getShapeOthers();
  shapeOthersCount.value = shapeOthers?.artifact + shapeOthers?.doubleNormal;
}

const getShapeOthers = async () => {
  const path = selectItems.value?.img_drive_root_path !== '' && selectItems.value?.img_drive_root_path ? selectItems.value?.img_drive_root_path : iaRootPath.value;
  const url_Old = `${path}/${selectItems.value?.slotId}/03_RBC_Classification/${selectItems.value?.slotId}.json`;
  const response_old = await readJsonFile({fullPath: url_Old});
  const rbcInfoPathAfter = response_old.data[0].rbcClassList;
  const otherCount = {artifact: 0, doubleNormal: 0};
  if (!rbcInfoPathAfter) {
    return;
  }
  rbcInfoPathAfter.forEach((item: any) => {
    if (item.categoryId === '03') {
      for (const classItem of item.classInfo) {
        if (classItem.classNm === 'Artifact') {
          otherCount.artifact += 1
        } else if (classItem.classNm === 'DoubleNormal') {
          otherCount.doubleNormal += 1
        }
      }
    }
  })

  return otherCount;
}

const rbcTotalAndReCount = async () => {
  const path = selectItems.value?.img_drive_root_path !== '' && selectItems.value?.img_drive_root_path ? selectItems.value?.img_drive_root_path : iaRootPath.value;
  const url_new = `${path}/${selectItems.value?.slotId}/03_RBC_Classification/${selectItems.value?.slotId}_new.json`;
  const response_new = await readJsonFile({fullPath: url_new});
  const url_Old = `${path}/${selectItems.value?.slotId}/03_RBC_Classification/${selectItems.value?.slotId}.json`;
  const response_old = await readJsonFile({fullPath: url_Old});
  if (response_new.data !== 'not file') { // 비포 , 애프터에 따른 json 파일 불러오는 부분
    const newJsonData = response_new?.data;
    for (const rbcItem of response_old.data[0].rbcClassList) {
      for (const newRbcData of newJsonData) {
        // 기존 부분 삭제 // 여기서 index 찾아서 새로 생성된 json 부분을 추가해야함
        const foundElementIndex = rbcItem.classInfo.findIndex((el: any) =>
            Number(el.index) === Number(newRbcData.index)
        );
        if (foundElementIndex !== -1) {
          rbcItem.classInfo.splice(foundElementIndex, 1);
        }
        if (rbcItem.categoryId === newRbcData.categoryId) {
          let newRbcDataObj = {
            classNm: newRbcData.classNm,
            classId: newRbcData.classId,
            posX: String(newRbcData.posX),
            posY: String(newRbcData.posY),
            width: newRbcData.width,
            height: newRbcData.height,
            index: newRbcData.index,
          }
          rbcItem.classInfo.push(newRbcDataObj);
        }
      }
    }
    rbcInfoPathAfter.value = response_old.data[0].rbcClassList;
  } else {
    rbcInfoPathAfter.value = response_old?.data[0].rbcClassList;
  }
  if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
    // console.error('rbcInfoPathAfter.value is not iterable');
    return;
  }
  let total = 0;
  let chromiaTotalval = 0;
  let shapeBodyTotalVal = 0;
  let shapeBodyTotalVal2 = 0;
  rbcInfoPathAfter.value.forEach(el => {
    const lastIndex = el.classInfo.length > 0
        ? (el.classInfo[el.classInfo.length - 1].index || '').replace(/[^\d]/g, '')
        : '';

    switch (el.categoryId) {
      case '01':
        total = lastIndex;
        break;
      case '02':
        chromiaTotalval = lastIndex;
        break;
      case '03':
        shapeBodyTotalVal = lastIndex;
        break;
      case '05':
        shapeBodyTotalVal2 = lastIndex;
        break;
      default:
        // Handle unexpected categoryId if needed
        break;
    }
  });

  rbcTotalVal.value = Number(total) + 1;
  sizeChromiaTotal.value = Number(total) + 1;
  chromiaTotalTwo.value = chromiaTotalval;
  shapeBodyTotal.value = Number(shapeBodyTotalVal) + Number(shapeBodyTotalVal2) + 2;


  // selectItems의 originalDegree 초기화
  rbcInfoAfterData.value.forEach(category => {
    category.classInfo.forEach(item => {
      item.originalDegree = 0;
    });
  });

  // rbcInfoPathAfter에서 아이템들 classId와 categoryId를 비교하여 originalDegree 증가시키기
  rbcInfoPathAfter.value.forEach(pathCategory => {
    const category = rbcInfoAfterData.value.find(cat => cat.categoryId === pathCategory.categoryId);
    if (category) {
      pathCategory.classInfo.forEach(pathClass => {
        const classInfo = category.classInfo.find(item => item.classId === pathClass.classId);
        if (classInfo) {
          classInfo.originalDegree++;
        }
      });
    }
  });

  await countReAdd();
}

const countReAdd = async () => {
  let totalPLT = 0;
  let malariaTotal = 0;
  for (const el of rbcInfoPathAfter.value) {
    if (el.categoryId === '01') {
      const lastElement = el.classInfo[el.classInfo.length - 1].index; // 마지막 요소 가져오기
      maxRbcCount.value = Number(lastElement.replace('S', '')) + 1;
    }
    if (el.categoryId === '04') {
      for (const xel of el.classInfo) {
        if (xel.classNm === 'Platelet') {
          totalPLT += 1;
        }
      }
    } else if (el.categoryId === '05') {
      for (const xel of el.classInfo) {
        if (xel.classNm === 'Malaria') {
          malariaTotal += 1;
        }
      }
    }
  }
  pltCount.value = Math.floor((totalPLT / parseFloat(maxRbcCount.value)) * 1000);
  malariaCount.value = malariaTotal
};

const percentageChange = (count: any): any => {
  const percentage = ((Number(count) / Number(rbcTotalVal.value)) * 100).toFixed(1);
  return (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage
}

// WbC Classification 쪽에서 Order Class 바꿀 시 Print 영역에도 바로 적용시키기 위한 코드
const classOrderChanged = async () => {
  await getOrderClass();
  await initData();

}

const shouldRenderCategory = (title: string) => {
  // 제외할 클래스들 정의
  const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
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
    includesStr: ["AR", "NR", "GP", "PA", "MC", "SM", "MA", 'GP', 'PA', 'OT'],
    includesStr2: ["NR", "AR", "MC", "MA", "SM", 'GP', 'PA', 'OT'],
  };

  // testType에 따라 제외할 부분 정의
  return (testType === '01' || testType === '04') ? arraysForSiteCd.includesStr : arraysForSiteCd.includesStr2;
};

const refreshClass = async (data: any) => {
  await getDetailRunningInfo();
  await getOrderClass();
  await initData();

  if (!projectBm.value) {
    await rbcTotalAndReCount();
  }
}

const printClose = () => {
  printOnOff.value = false;
}

const wbcClassTileChange = (): string => !projectBm.value ? 'WBC Classification' : 'BM Classification';

const printStart = (event: MouseEvent) => {
  event.stopPropagation(); // 이벤트 전파를 막아 handleClickOutside 실행 방지
  printOnOff.value = true;
};

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
  if (selectItems.value?.wbcInfoAfter && selectItems.value?.wbcInfoAfter.length !== 0) {
    let wbcArrs = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
    const sortedWbcInfo = sortWbcInfo(selectItems.value?.wbcInfoAfter, wbcArrs);
    nonWbcClassList.value = sortedWbcInfo.filter((item: any) => nonWbcTitleArr.includes(item.title));

    wbcInfo.value = sortedWbcInfo;

    if (!nonWbcClassList.value || nonWbcClassList.value.length === 0) {
      const sortedWbcInfo = sortWbcInfo(selectItems.value?.wbcInfo.wbcInfo[0], wbcArrs);
      nonWbcClassList.value = sortedWbcInfo.filter((item: any) => nonWbcTitleArr.includes(item.title));
      // wbcInfo.value = sortedWbcInfo;
    }
  } else {
    let wbcArrs = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
    const sortedWbcInfo = sortWbcInfo(selectItems.value?.wbcInfo.wbcInfo[0], wbcArrs);
    nonWbcClassList.value = sortedWbcInfo.filter((item: any) => nonWbcTitleArr.includes(item.title));
    wbcInfo.value = sortedWbcInfo;
  }

  await percentChangeBySiteCd();

  rbcInfo.value = selectItems.value?.rbcInfoAfter && selectItems.value?.rbcInfoAfter.length !== 0 ? selectItems.value?.rbcInfoAfter : selectItems.value?.rbcInfo.rbcClass;
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

const reDegree = async () => {
  let totalCount = rbcTotalVal.value;
  let sizeTotal = sizeChromiaTotal.value;
  let chromiaTotal = chromiaTotalTwo.value;

  selectItems.value?.rbcInfoAfter.forEach((rbcCategory: any, idx1: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any, idx2: any) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        // rbcClass.originalDegree = originalData[idx1].classInfo[idx2].degree;
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.degree);
          let percent = 0;

          if (degreeStandard.categoryId === '01') { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));

          } else if (degreeStandard.categoryId === '02') { // chromia total
            percent = Number(((degreeCount / chromiaTotal) * 100).toFixed(2));
          } else { // shape, inclusion body total
            percent = Number(((degreeCount / totalCount) * 100).toFixed(2));
          }

          if (isNaN(percent)) {
            percent = 0;
          }

          const setDegree = (value: any) => (rbcClass.degree = value);

          // 0
          if (percent < Number(degreeStandard.degree1)) setDegree('0');
          // 1
          else if (percent < Number(degreeStandard.degree2)) setDegree('1');
          // 2
          else if (percent < Number(degreeStandard.degree3)) setDegree('2');
          // 3
          else setDegree('3');

        }
      });
    });
  });
  selectItems.value.rbcInfoAfter.forEach((rbcCategory: any, idx1: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any, idx2: any) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        // rbcClass.originalDegree = originalData[idx1].classInfo[idx2].degree;
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.originalDegree);
          let percent = 0;

          if (degreeStandard.categoryId === '01') { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));

          } else if (degreeStandard.categoryId === '02') { // chromia total
            percent = Number(((degreeCount / chromiaTotal) * 100).toFixed(2));
          } else { // shape, inclusion body total
            percent = Number(((degreeCount / totalCount) * 100).toFixed(2));
          }

          if (isNaN(percent)) {
            percent = 0;
          }

          const setDegree = (value: any) => (rbcClass.degree = value);

          // 0
          if (percent < Number(degreeStandard.degree1)) setDegree('0');
          // 1
          else if (percent < Number(degreeStandard.degree2)) setDegree('1');
          // 2
          else if (percent < Number(degreeStandard.degree3)) setDegree('2');
          // 3
          else setDegree('3');

        }
      });
    });
  });


  selectItems.value.rbcInfoAfter.forEach((rbcCategory: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any) => {
      // size
      if (rbcCategory.categoryId === '01') {
        if (rbcClass.classId === '01') rbcCategory.classInfo[0].degree = '1';
        if (['02', '03'].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // chromia
      if (rbcCategory.categoryId === '02') {
        if (rbcClass.classId === '01') rbcCategory.classInfo[0].degree = '1';
        if (['02', '03'].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // Poikilocytosis
      if (rbcCategory.categoryId === '03') {
        if (rbcClass.classId === '01') {
          // normal
          rbcCategory.classInfo[0].degree = '1'
          // poikilo
          rbcCategory.classInfo[1].degree = '0'
        }

        if (rbcClass.classId !== '01' && rbcClass.classId !== '02') {
          var poikiloDegree = Number(rbcCategory.classInfo[1].degree)

          if (Number(rbcClass.degree) > poikiloDegree) {
            rbcCategory.classInfo[0].degree = '0'
            rbcCategory.classInfo[1].degree = rbcClass.degree
          }
        }
      }
    });
  });
}

const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi();
    const data = result.data;
    rbcDegreeStandard.value = data;
  } catch (e) {
    console.log(e);
  }
};

const submitStateChanged = (changedSubmitState: string) => {
  if (changedSubmitState) {
    isCommitChanged.value = !isCommitChanged.value;
  }
};

</script>
