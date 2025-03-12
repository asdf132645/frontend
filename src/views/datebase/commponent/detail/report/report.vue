<template>

  <ClassInfoMenu :changeSlideByLisUpload="changeSlideByLisUpload" />
  <div :class="'reportSection' + (cbcLayer ? ' cbcLayer' : '')">
    <DetailHeader
        :testType="projectBm ? getBmTestTypeText(selectItems?.testType) : getTestTypeText(selectItems?.testType)"
        :barcodeNo="selectItems?.barcodeNo"
        :cbcPatientNo="selectItems?.cbcPatientNo"
        :patientName="patientName"
        :hospitalName="selectItems?.hosName"
        :cbcPatientName="selectItems?.cbcPatientNm"
        :cbcSex="selectItems?.cbcSex"
        :cbcAge="selectItems?.cbcAge"
        :analyzedDttm="selectItems?.analyzedDttm"
        :slideData="selectItems"
        @uploadLisChangeSlide="uploadLisChangeSlide"
    />
    <div style="display:flex;">
      <LisCbc v-if="cbcLayer" :selectItems="selectItems"/>
      <div class="reportDiv">
        <div class="rbcDiv shadowBox" :class="cbcLayer ? 'rbcDivInReportWithCBC' : ''" v-if="!projectBm && selectItems.testType === '04'">
          <RbcClass v-if="!isLoading" :rbcInfo="rbcInfo" type='report' />
        </div>
        <div class="wbcDiv shadowBox">
          <WbcClass v-if="!isLoading" :wbcInfo="wbcInfo" :selectItems="selectItems" type='report'
                    @classOrderChanged="classOrderChanged"
          />
        </div>
        <div class="reportDetail shadowBox" :class="{ 'reportBm': projectBm }" v-if="!crcConnect">
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
              <h3 class="reportH3 mb10 pl0">{{ wbcClassTileChange() }} result</h3>
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
                <tr v-for="(item) in wbcInfoAfter" :key="item.id" class="wbcClassDbDiv">
                  <template v-if="shouldRenderCategory(item.title)">
                    <td>{{ item?.name }}</td>
                    <td>{{ item?.count }}</td>
                    <td> {{ Math.floor(Number(item?.percent)) || '0' }}</td>
                  </template>
                </tr>
                <tr>
                  <td>Total</td>
                  <td>{{ selectItems?.wbcInfo?.totalCount || 0 }}</td>
                  <td>100.00</td>
                </tr>
                </tbody>
              </table>

              <h3 v-if="!selectItems?.wbcInfo?.nonRbcClassList && !projectBm" class="reportH3 mb10 pl0">non-WBC</h3>
              <table class="tableClass" v-if="!projectBm">
                <colgroup>
                  <col width="40%">
                  <col width="20%">
                  <col width="20%">
                </colgroup>
                <tbody>
                <template v-for="(nWbcItem, outerIndex) in nonWbcClassList" :key="outerIndex">
                  <tr v-show="siteCd !== HOSPITAL_SITE_CD_BY_NAME['고대안암병원'] && nWbcItem?.title !== 'SM'">
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
              <template v-for="(classList, outerIndex) in [rbcInfoData]" :key="outerIndex">
                <!--              <template v-for="(classList, outerIndex) in [slideData.rbcInfoAfter]" :key="outerIndex">-->
                <template v-for="(category, innerIndex) in classList" :key="innerIndex">
                  <div class="categories">
                    <ul class="printRbcCategory">
                      <li v-if="innerIndex === 0" class="mb10 liTitle" style="cursor: default;">Category</li>
                      <li style="cursor: default;">{{ category?.categoryNm }}</li>
                    </ul>
                    <ul class="printRbcClass">
                      <li v-if="innerIndex === 0" class="mb10 liTitle" style="cursor: default;">Class</li>
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
                      <li v-if="innerIndex === 0" class="mb10 liTitle" style="cursor: default;">Degree</li>
                      <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                        <li style="cursor: default;">{{ Number(classInfo?.degree) || 0 }}</li>
                        <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '03'" class="cursorDefault">-</li>
                        <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryNm === 'Inclusion Body'">-</li>
                      </template>

                      <li class="printTotalText cursorDefault" v-show="category.categoryNm !== 'Shape'">Total</li>
                    </ul>
                    <ul class="printRbcCount">
                      <li v-if="innerIndex === 0" class="mb10 liTitle" style="cursor: default;">Count</li>
                      <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                        <li style="cursor: default;">
                          {{ Number(classInfo?.originalDegree) || 0 }}
                        </li>

                        <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '03'"
                            style="cursor: default;"
                        >
                          {{ Number(rbcCount.shapeOthersTotalCount) || 0 }}
                        </li>

                        <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryNm === 'Inclusion Body'"
                            style="cursor: default;"
                        >
                          {{ Number(rbcCount.malariaCount) || 0 }}
                        </li>
                      </template>

                      <li v-show="category?.categoryNm === 'Size' || category?.categoryNm === 'Chromia'"
                          style="cursor: default;">
                        {{ Number(rbcCount.sizeChromiaTotalCount) || 0 }}
                      </li>
                      <li v-show="category?.categoryNm === 'Inclusion Body'" style="cursor: default;">
                        {{ Number(rbcCount.shapeBodyTotalCount) || 0 }}
                      </li>
                    </ul>
                    <ul class="printRbcPercent">
                      <li v-if="innerIndex === 0" class="mb10 liTitle" style="cursor: default;">Percent</li>
                      <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                        <li style="cursor: default;">
                          {{ percentageChange(Number(classInfo?.originalDegree), RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID) || 0 }}
                        </li>

                        <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '03'"
                            style="cursor: default;"
                        >
                          {{ percentageChange(rbcCount.shapeOthersTotalCount, RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID) || 0 }}
                        </li>

                        <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryNm === 'Inclusion Body'"
                            style="cursor: default;"
                        >
                          {{ percentageChange(rbcCount.malariaCount, RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) || 0 }}
                        </li>
                      </template>

                      <li v-show="category.categoryNm !== 'Shape'" style="cursor: default;">100%</li>
                    </ul>
                  </div>

                  <div v-if="innerIndex === classList.length - 1" class="categories">
                    <ul class="printRbcCategory">
                      <li style="cursor: default;">Others</li>
                    </ul>

                    <ul class="printRbcClass">
                      <li style="cursor: default;">Platelet</li>
                    </ul>
                    <ul class="printRbcDegree">-</ul>
                    <ul class="w-quarter">{{ rbcCount.pltCount || 0 }} PLT / 1000 RBC</ul>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
        <Crc v-else-if="isContent && crcConnect" :crcDataVal="crcData" :selectItems="selectItems"/>
      </div>
    </div>

  </div>
  <div ref="printContent">
    <Print v-if="printOnOff" @printClose="printClose"/>
  </div>

  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
  />
</template>

<script setup lang="ts">

import {computed, nextTick, onBeforeMount, onMounted, onUnmounted, ref, watch} from "vue";
import { useStore } from "vuex";
import WbcClass from "@/views/datebase/commponent/detail/classInfo/commonRightInfo/classInfo.vue";
import {getBmTestTypeText, getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {defaultBmClassList, defaultWbcClassList, WbcInfo} from "@/store/modules/analysis/wbcclassification";
import Print from "@/views/datebase/commponent/detail/report/print.vue";
import RbcClass from "@/views/datebase/commponent/detail/rbc/rbcClass.vue";
import { formatDateString } from "@/common/lib/utils/dateUtils";
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import {crcGet, crcOptionGet, getOrderClassApi, getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import LisCbc from "@/views/datebase/commponent/detail/lisCbc.vue";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {
  incheonGilPercentChange,
  incheonStMaryPercentChange,
  inhaPercentChange,
  seoulStMaryPercentChange
} from "@/common/helpers/common/classPercent";
import Crc from "@/views/datebase/commponent/detail/report/crcResultCodes.vue";
import {removeDuplicatesById} from "@/common/lib/utils/removeDuplicateIds";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import {RBC_CODE_CLASS_ID, SHOWING_RBC_SHAPE_CLASS_IDS} from "@/common/defines/constants/dataBase";
import DetailHeader from "@/views/datebase/commponent/detail/detailHeader.vue";
import { DIR_NAME } from "@/common/defines/constants/settings";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import {MESSAGES, MSG_GENERAL} from "@/common/defines/constants/constantMessageText";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {fileSearchApi} from "@/common/api/service/fileSys/fileSysApi";

const getCategoryName = (category: WbcInfo) => category?.name;
const store = useStore();

const selectItems = ref<any>([]);
const wbcInfo = ref<any>(null);
const printOnOff = ref(false);
const rbcInfo = ref<any>([]);
const siteCd = computed(() => store.state.commonModule.siteCd);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const slideData = computed(() => store.state.slideDataModule);
const projectBm = ref(false);
const orderClass = ref<any>([]);
const isLoading = ref(true);
const nonWbcTitleArr = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM'];
const nonWbcClassList = ref<any[]>([]);
const printContent = ref<HTMLElement | null>(null);
const rbcInfoData = ref<any>([]);
const rbcInfoPathAfter = ref<any>([]);
const rbcCount = ref({
  rbcTotalCount: 0,
  pltCount: 0,
  pltTotalCount: 0,
  malariaCount: 0,
  maxRbcCount: 0,
  sizeChromiaTotalCount: 0,
  chromiaTotalCount: 0,
  shapeBodyTotalCount: 0,
  shapeOthersTotalCount: 0,
})
const rbcDegreeStandard = ref<any>([]);
const wbcInfoAfter = ref<any>([]);
const crcData = ref<any>([]);
const crcConnect = ref(false);
const isContent = ref(false);
const changeSlideByLisUpload = ref(false);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);
const totalRBCImageNames = ref<string[]>([]);
const patientName = ref('');

watch(
    () => slideData.value,
    async (newVal, oldVal) => {
      if (newVal.id !== oldVal?.id) {
        await nextTick();

        await getDetailRunningInfo(newVal);
        await getOrderClass();
        await initData(newVal);

        if (!projectBm.value && slideData.value?.testType === '04') {
          rbcInfoData.value = isObjectEmpty(slideData.value?.rbcInfoAfter) ? slideData.value?.rbcInfo.rbcClass : slideData.value?.rbcInfoAfter;
          resetRBCValue(rbcInfoData.value);
          await checkRBCTotalImageNames();
          await rbcTotalAndReCountForReport();
          // await reDegree(rbcInfoData.value);
          slideData.value.rbcInfoAfter = rbcInfoData.value;
        }
      }
    },
    {immediate: true, deep: true}
);

onBeforeMount(async () => {
  projectBm.value = window.PROJECT_TYPE === 'bm';
  if (!projectBm.value) {
    const crcOptionApi = await crcOptionGet();
    if (crcOptionApi.data.length !== 0) {
      crcConnect.value = crcOptionApi.data[0].crcConnect;
    }
    const result = (await crcGet());
    if (result.code === 200) {
      isContent.value = true;
      crcData.value = result.data;
    }
  }
})

const handleClickOutside = (event: MouseEvent) => {
  if (printContent.value && !printContent.value.contains(event.target as Node) && printOnOff.value) {
    printClose();
  }
};

onMounted(async () => {
  await nextTick();
  await store.dispatch('commonModule/setCommonInfo', { rbcImagePageNumber: 0 });
  isLoading.value = false;
  await getRbcDegreeData();
  await getOrderClass();
  await initData();
  document.addEventListener('click', handleClickOutside);
  if (!projectBm.value) {
    await store.dispatch('commonModule/setCommonInfo', {cbcLayer: true});
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const getDetailRunningInfo = async (data) => {
  try {
    selectItems.value = data;
    patientName.value = data?.patientNm;
    if (
        siteCd.value === HOSPITAL_SITE_CD_BY_NAME['서울성모병원'] ||
        siteCd.value === HOSPITAL_SITE_CD_BY_NAME['UIMD'] ||
        siteCd.value === HOSPITAL_SITE_CD_BY_NAME['NONE']
    ) {
      let wbcAfterInfo = removeDuplicatesById(selectItems.value?.wbcInfoAfter || []);
      const wbcInfoAfterValForTotalCount = filterByTitle(wbcAfterInfo, 'wbc');

      wbcAfterInfo = removeDuplicatesById(wbcAfterInfo);
      if (projectBm.value) {
        wbcInfoAfter.value = selectItems.value?.wbcInfoAfter || [];
      } else {
        wbcInfoAfter.value = seoulStMaryPercentChange(wbcInfoAfterValForTotalCount, wbcAfterInfo);
      }

    } else {
      wbcInfoAfter.value = selectItems.value?.wbcInfoAfter || [];
    }


  } catch (e) {
    console.error(e);
  }
}

const filterByTitle = (wbcInfoArr: any, isNonWbc: 'wbc' | 'nonWbc') => {
  const titleArr = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM'];
  if (isNonWbc === 'nonWbc') {
    return wbcInfoArr.filter((item: any) => titleArr.includes(item.title));
  }

  return wbcInfoArr.filter((item: any) => !titleArr.includes(item.title));
}

const percentChangeBySiteCd = () => {
  const projectType = projectBm.value ? 'bm' : 'pb';

  if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['서울성모병원']) {
    selectItems.value.wbcInfoAfter = seoulStMaryPercentChange(selectItems.value?.wbcInfoAfter, selectItems.value?.wbcInfoAfter);
  } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
    selectItems.value.wbcInfoAfter = inhaPercentChange(selectItems.value, selectItems.value?.wbcInfoAfter);
  } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천성모병원']) {
    selectItems.value.wbcInfoAfter = incheonStMaryPercentChange(projectType, selectItems.value?.wbcInfoAfter);
  } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천길병원']) {
    selectItems.value.wbcInfoAfter = incheonGilPercentChange(selectItems.value?.wbcInfoAfter, selectItems.value?.wbcInfo.totalCount);
  }
  wbcInfo.value = selectItems.value.wbcInfoAfter;
}

const resetTotalCounts = () => {
  rbcCount.value.rbcTotalCount = 0;
  rbcCount.value.sizeChromiaTotalCount = 0;
  rbcCount.value.chromiaTotalCount = 0;
  rbcCount.value.shapeBodyTotalCount = 0;
  rbcCount.value.shapeOthersTotalCount = 0;
  rbcCount.value.maxRbcCount = 0;
  rbcCount.value.pltCount = 0;
  rbcCount.value.malariaCount = 0;
  rbcCount.value.pltTotalCount = 0;
}

const rbcTotalAndReCountForReport = async () => {
  const path = slideData.value?.img_drive_root_path !== '' && slideData.value?.img_drive_root_path ? slideData.value?.img_drive_root_path : iaRootPath.value;

  resetTotalCounts();
  for (const rbcImageName of totalRBCImageNames.value) {
    const url_new = `${path}/${slideData.value.slotId}/${DIR_NAME.RBC_CLASS}/${slideData.value.slotId}_new_${rbcImageName}.json`;
    const response_new = await readJsonFile({fullPath: url_new});
    const url_Old = `${path}/${slideData.value.slotId}/${DIR_NAME.RBC_CLASS}/${slideData.value.slotId}.json`;
    const response_old = await readJsonFile({fullPath: url_Old});

    if (response_new.data !== 'not file') { // 비포 , 애프터에 따른 json 파일 불러오는 부분
      const newJsonData = response_new?.data;
      for (const rbcItem of response_old.data[Number(rbcImageName)].rbcClassList) {
        for (const newRbcData of newJsonData) {
          // 기존 부분 삭제 // 여기서 index 찾아서 새로 생성된 json 부분을 추가해야함
          const foundElementIndex = rbcItem.classInfo.findIndex((el: any) =>
              el.index === newRbcData.index
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
      rbcInfoPathAfter.value = response_old.data[Number(rbcImageName)].rbcClassList;
    } else {
      if (response_old.data.length === 0 || !response_old?.data[Number(rbcImageName)]) {
        rbcInfoPathAfter.value = [];
      } else {
        rbcInfoPathAfter.value = response_old?.data[Number(rbcImageName)].rbcClassList;
      }
    }
    if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
      return;
    }

    let total = 0;
    let chromiaTotalval = 0;
    let shapeTotalVal = 0;
    let inclusionBody = 0;

    rbcInfoPathAfter.value.forEach(el => {
      switch (el.categoryId) {
        case RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID:
          total = el.classInfo.length;
          break;
        case RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID:
          chromiaTotalval = el.classInfo.length;
          break;
        case RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID:
          shapeTotalVal = el.classInfo.length;

          for (const classItem of el.classInfo) {
            if (!SHOWING_RBC_SHAPE_CLASS_IDS.includes(classItem.classId)) {
              rbcCount.value.shapeOthersTotalCount += 1;
            }
          }
          break;
        case RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID:
          inclusionBody = el.classInfo.length;
          break;
        default:
          break;
      }
    });

    rbcCount.value.rbcTotalCount += Number(total);
    rbcCount.value.sizeChromiaTotalCount += Number(total);
    rbcCount.value.chromiaTotalCount += chromiaTotalval;
    rbcCount.value.shapeBodyTotalCount += Number(shapeTotalVal) + Number(inclusionBody);


    if (totalRBCImageNames.value[totalRBCImageNames.value.length - 1] === rbcImageName) {
      await countReAddForReport('last');
    } else {
      await countReAddForReport();
    }
  }
}

const countReAddForReport = async (type?: 'last') => {
  for (const category of rbcInfoData.value) {
    for (const classItem of category.classInfo) {
      let count = 0;
      for (const afterCategory of rbcInfoPathAfter.value) {
        for (const afterClassItem of afterCategory.classInfo) {
          if (afterClassItem.classId === classItem.classId && afterCategory.categoryId === category.categoryId) {
            count++;
          }
        }
      }

      classItem.originalDegree += Number(count);
      if (type === 'last') {
        classItem.percent = percentageChange(classItem.originalDegree, category.categoryId);  // percent는 맨 마지막에 계산해야 함
      }
    }
  }

  let totalPLT = 0;
  let malariaTotal = 0;
  for (const el of rbcInfoPathAfter.value) {
    if (el.categoryId === RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID || el.categoryId === RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) {
      rbcCount.value.maxRbcCount += Number(el.classInfo.length);
    }
    if (el.categoryId === RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID) {
      for (const xel of el.classInfo) {
        if (xel.classId === RBC_CODE_CLASS_ID.OTHERS.PLATELET) {
          totalPLT += 1;
        }
      }
    } else if (el.categoryId === RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) {
      for (const xel of el.classInfo) {
        if (xel.classId === RBC_CODE_CLASS_ID.INCLUSION_BODY.MALARIA) {
          malariaTotal += 1;
        }
      }
    }
  }
  rbcCount.value.pltTotalCount += totalPLT;

  if (type === 'last') {
    rbcCount.value.pltCount += Math.floor((rbcCount.value.pltTotalCount / parseFloat(rbcCount.value.maxRbcCount)) * 1000);
  }
  rbcCount.value.malariaCount += malariaTotal;
};

const resetRBCValue = (rbcInfo: any) => {
  for (const categoryItem of rbcInfo) {
    for (const classItem of categoryItem.classInfo) {
      classItem.originalDegree = 0;
    }
  }
}

const percentageChange = (count: any, categoryId: string): any => {
  const percentage: any = ((Number(count) / calculateRbcTotalByCategoryId(categoryId)) * 100).toFixed(1);
  if (isNaN(percentage)) return '-';
  return (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
}

const calculateRbcTotalByCategoryId = (categoryId: string) => {
  switch (categoryId) {
    case RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID:
      return Number(rbcCount.value.rbcTotalCount);
    case RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID:
      return Number(rbcCount.value.chromiaTotalCount);
    case RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID:
    case RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID:
      return Number(rbcCount.value.shapeBodyTotalCount);
    default:
      return Number(rbcCount.value.rbcTotalCount);
  }
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



const printClose = () => {
  printOnOff.value = false;
}

const wbcClassTileChange = (): string => !projectBm.value ? 'WBC Classification' : 'BM Classification';

const printStart = (event: MouseEvent) => {
  event.stopPropagation(); // 이벤트 전파를 막아 handleClickOutside 실행 방지
  printOnOff.value = true;
};
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
    console.error(e)
  }
}

async function initData(data?: any) {
  if (selectItems.value?.wbcInfoAfter && selectItems.value?.wbcInfoAfter.length !== 0) {
    let wbcArrs = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
    const sortedWbcInfo = sortWbcInfo(selectItems.value?.wbcInfoAfter, wbcArrs);
    nonWbcClassList.value = sortedWbcInfo.filter((item: any) => nonWbcTitleArr.includes(item.title));

    selectItems.value.wbcInfoAfter = sortedWbcInfo;
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
    selectItems.value.wbcInfoAfter = sortedWbcInfo;
    wbcInfo.value = sortedWbcInfo;
  }

  await percentChangeBySiteCd();

  rbcInfo.value = data;
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

const checkRBCTotalImageNames = async () => {
  const rootPath = slideData.value?.img_drive_root_path !== '' && slideData.value?.img_drive_root_path ? slideData.value?.img_drive_root_path : iaRootPath.value;
  const fileSearchApiParam = `directoryPath=${rootPath}\\${slideData.value?.slotId}\\${DIR_NAME.RBC_IMAGE}&searchString=RBC_Image`;
  try {
    const response = await fileSearchApi(fileSearchApiParam);

    if (response.data) {
      const rbcImageFileNames = response.data.filter((item) => item.endsWith('_files'));
      totalRBCImageNames.value = rbcImageFileNames.map((item) => {
        const splitedItem = item.split('_');
        return splitedItem[splitedItem.length - 2];
      })
    } else {
      totalRBCImageNames.value = [];
    }
  } catch (error) {
    totalRBCImageNames.value = [];
    console.error(error);
  }
}

const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};

const uploadLisChangeSlide = (hospitalNm: any) => {
  if (hospitalNm === HOSPITAL_SITE_CD_BY_NAME['인천길병원']) {
    changeSlideByLisUpload.value = !changeSlideByLisUpload.value;
  }
}

const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi();
    const data = result.data;
    rbcDegreeStandard.value = data;
  } catch (e) {
    console.error(e);
  }
};

const reDegree = async (rbcInfoArray: any) => {
  let totalCount = rbcCount.value.rbcTotalCount;
  let sizeTotal = rbcCount.value.sizeChromiaTotalCount;
  let chromiaTotal = rbcCount.value.chromiaTotalCount;
  if (!Array.isArray(rbcInfoArray)) {
    return;
  }
  rbcInfoArray.forEach((rbcCategory: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.originalDegree);
          let percent = 0;

          if (degreeStandard.categoryId === RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID) { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));

          } else if (degreeStandard.categoryId === RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID) { // chromia total
            percent = Number(((degreeCount / chromiaTotal) * 100).toFixed(2));
          } else { // shape, inclusion body total
            percent = Number(((degreeCount / totalCount) * 100).toFixed(2));
          }
          if (isNaN(percent)) {
            percent = 0;
          }
          const setDegree = (value: any) => (rbcClass.degree = value);
          // 0
          if (percent < Number(degreeStandard.degree1)) {
            setDegree('0');
            return;
          }
          // 1
          else if (percent < Number(degreeStandard.degree2)) {
            setDegree('1');
            return;
          }
          // 2
          else if (percent < Number(degreeStandard.degree3)) {
            setDegree('2');
            return;
          }
          // 3
          else {
            setDegree('3');
            return;
          }
        }
      });
    });
  });

  rbcInfoArray.forEach((rbcCategory) => {
    rbcCategory.classInfo.forEach((rbcClass) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.originalDegree);
          let percent = 0;

          if (degreeStandard.categoryId === RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID) { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));
          } else if (degreeStandard.categoryId === RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID) { // chromia total
            percent = Number(((degreeCount / chromiaTotal) * 100).toFixed(2));
          } else { // shape, inclusion body total
            percent = Number(((degreeCount / totalCount) * 100).toFixed(2));
          }

          if (isNaN(percent)) percent = 0;

          const setDegree = (value: any) => (rbcClass.degree = value);

          if (percent < Number(degreeStandard.degree1)) setDegree('0');
          else if (percent < Number(degreeStandard.degree2)) setDegree('1');
          else if (percent < Number(degreeStandard.degree3)) setDegree('2');
          else setDegree('3');
        }
      });
    });
  });

  rbcInfoArray.forEach((rbcCategory) => {
    rbcCategory.classInfo.forEach((rbcClass) => {
      // size
      if (rbcCategory.categoryId === RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID) {
        if (rbcClass.classId === RBC_CODE_CLASS_ID.SIZE.NORMAL) rbcCategory.classInfo[0].degree = '1';
        if ([RBC_CODE_CLASS_ID.SIZE.MACROCYTE, RBC_CODE_CLASS_ID.SIZE.MICROCTYE].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // chromia
      if (rbcCategory.categoryId === RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID) {
        if (rbcClass.classId === RBC_CODE_CLASS_ID.CHROMIA.NORMAL) rbcCategory.classInfo[0].degree = '1';
        if ([RBC_CODE_CLASS_ID.CHROMIA.HYPERCHROMIC, RBC_CODE_CLASS_ID.CHROMIA.HYPOCHROMIC].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // Poikilocytosis
      if (rbcCategory.categoryId === RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID) {
        if (rbcClass.classId === RBC_CODE_CLASS_ID.SHAPE.NORMAL) {
          // normal
          rbcCategory.classInfo[0].degree = '1'
          // poikilo
          rbcCategory.classInfo[1].degree = '0'
        }

        if (rbcClass.classId !== RBC_CODE_CLASS_ID.SHAPE.NORMAL && rbcClass.classId !== RBC_CODE_CLASS_ID.SHAPE.POLIKILOCYTOSIS) {
          const poikiloDegree = Number(rbcCategory.classInfo[1].degree)

          if (Number(rbcClass.degree) > poikiloDegree) {
            rbcCategory.classInfo[0].degree = '0'
            rbcCategory.classInfo[1].degree = rbcClass.degree
          }
        }
      }
    });
  });
};

</script>
