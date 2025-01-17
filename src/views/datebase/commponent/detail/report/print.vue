<template>
  <div v-show="printReady" class="moveImgIsBool"> Loading Print...</div>
  <div
      style="font-size: 0.8rem; width: 900px; height: 90%; overflow-y: auto; background: #fff; color: #000; position: absolute; top: 10%; left: 33%; box-sizing: border-box; padding: 3rem 7rem; border: 2px solid #ccc; border-radius: 10px; z-index:9999;">
    <button
        style="position: absolute; right: 8px; background: none; border: 1px solid #000; border-radius: 5px; padding: 7px 25px; top: 5px; cursor: pointer"
        @click="closePrint">Close
    </button>
    <div ref="printContent" style="margin-top: 20px;">
      <div>
        <h3 style="margin: 10px 0; font-size: 1.2rem; font-weight: 600; text-align: center;">Analysis Report from UIMD
          {{ projectType === 'bm' ? 'BM' : 'PB' }} system</h3>
      </div>
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <table style="width: 100%; font-size: 0.8rem;">
          <colgroup>
            <col style="width: 30%;"/>
            <col style="width: 70%;"/>
          </colgroup>
          <tbody>
          <tr style="padding-bottom: 5px;">
            <th style="text-align: left; padding: 5px 0;">Slot ID</th>
            <td style="text-align: left; padding: 5px 0;">{{ selectItems?.slotId }}</td>
          </tr>
          <tr style="padding-bottom: 5px;">
            <th style="text-align: left; padding: 5px 0;">Ordered date</th>
            <td style="text-align: left; padding: 5px 0;">{{ formatDateString(selectItems?.orderDttm) }}</td>
          </tr>
          <tr style="padding-bottom: 5px;">
            <th style="text-align: left; padding: 5px 0;">Signed by ID</th>
            <td style="text-align: left; padding: 5px 0;">{{ selectItems?.submitUserId }}</td>
          </tr>
          <tr style="padding-bottom: 5px;">
            <th style="text-align: left; padding: 5px 0;">Signed date</th>
            <td style="text-align: left; padding: 5px 0;">{{ selectItems?.submitOfDate }}</td>
          </tr>
          <tr style="padding-bottom: 5px;">
            <th style="text-align: left;">Ordered Classification</th>
            <td style="text-align: left; padding: 5px 0;">{{
                projectType === 'pb' ? getTestTypeText(selectItems?.testType) : getBmTestTypeText(selectItems?.testType)
              }}
            </td>
          </tr>
          <tr style="padding-bottom: 5px;">
            <th style="text-align: left; padding: 5px 0;">Name</th>
            <td style="text-align: left; padding: 5px 0;">{{ selectItems?.patientName }}</td>
          </tr>
          <tr style="padding-bottom: 5px;">
            <th style="text-align: left; padding: 5px 0;">Birth</th>
            <td style="text-align: left; padding: 5px 0;">{{ selectItems?.birthDay }}</td>
          </tr>
          <tr style="padding-bottom: 5px;">
            <th style="text-align: left; padding: 5px 0;">Gender</th>
            <td style="text-align: left; padding: 5px 0;">{{ selectItems?.gender === '' ? '' : selectItems?.gender === '01' ? 'Male' : 'Female' }}</td>
          </tr>

          </tbody>
        </table>

        <div v-if="selectItems?.testType === '04'" style="margin-top: 20px; border-top: 2px dotted #696969"></div>

        <!-- RBC Classification -->
        <div v-if="selectItems?.testType === '04'" style="margin-top: 20px;">
          <h3 style="margin: 10px 0; font-size: 1.2rem; font-weight: 600; text-align: center;">RBC classification result</h3>
          <table style="width: 100%; font-size: 0.8rem;">
            <colgroup>
              <col style="width: 20%;"/>
              <col style="width: 25%;"/>
              <col style="width: 25%;"/>
              <col style="width: 15%;"/>
              <col style="width: 15%;"/>
            </colgroup>
            <thead>
            <tr style="margin-bottom: 15px; font-size: 18px; font-weight: normal; padding-bottom: 100px;">
              <th style="text-align: left;">Category</th>
              <th style="text-align: left;">Class</th>
              <th style="text-align: left;">Degree</th>
              <th style="text-align: left;">Count</th>
              <th style="text-align: left;">Percent</th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(classList, outerIndex) in [selectItems.rbcInfoAfter]" :key="outerIndex">
              <template v-for="(category, innerIndex) in classList" :key="innerIndex">
                <tr>
                  <td :rowspan="category.classInfo.length + (category.categoryNm !== 'Shape' ? 1 : 0)"
                      style="text-align: left; vertical-align: top;">{{ category.categoryNm }}
                  </td>
                  <td style="text-align: left;">{{ category.classInfo[0]?.classNm }}</td>
                  <td style="text-align: left;">{{ category.classInfo[0]?.degree }}</td>
                  <td style="text-align: left;">{{ category.classInfo[0]?.originalDegree }}</td>
                  <td style="text-align: left;">{{ percentageChange(category.classInfo[0]?.originalDegree, RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID) }}</td>
                </tr>

                <template v-for="(classInfo, classIndex) in category.classInfo.slice(1)" :key="classIndex">
                  <tr>
                    <td style="text-align: left;">{{ classInfo.classNm }}</td>
                    <td style="text-align: left;">{{ classInfo.degree }}</td>
                    <td style="text-align: left;">{{ classInfo.originalDegree }}</td>
                    <td style="text-align: left;">{{ percentageChange(classInfo.originalDegree, RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID) }}</td>
                  </tr>

                  <!-- Shape Others -->
                  <tr v-if="category.categoryNm === 'Shape' && classIndex === category.classInfo.slice(1).length - 1">
                    <td></td>
                    <td style="text-align: left;">Others</td>
                    <td style="text-align: left;">-</td>
                    <td style="text-align: left;">{{ rbcCount.shapeOthersTotalCount }}</td>
                    <td style="text-align: left;">{{ percentageChange(rbcCount.shapeOthersTotalCount, RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID) }} %</td>
                  </tr>

                  <!-- Inclusion Body Malaria -->
                  <tr v-if="category.categoryNm === 'Inclusion Body' && classIndex === category.classInfo.slice(1).length - 1">
                    <td style="text-align: left;">Malaria</td>
                    <td style="text-align: left;">-</td>
                    <td style="text-align: left;">{{ rbcCount.malariaCount }}</td>
                    <td style="text-align: left;">{{ percentageChange(rbcCount.malariaCount, RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) }}</td>
                  </tr>
                </template>
                <tr v-if="category.categoryNm !== 'Shape' && category.categoryNm !== 'Inclusion Body'">
                  <td style="text-align: left;"></td>
                  <td style="text-align: left; font-weight: bold;">Total</td>
                  <td style="text-align: left; font-weight: bold;">{{ rbcCount.sizeChromiaTotalCount }}</td>
                  <td style="text-align: left; font-weight: bold;">{{ percentageChange(rbcCount.sizeChromiaTotalCount, RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) }} %</td>
                </tr>

                <tr v-if="category.categoryNm == 'Inclusion Body'">
                  <td></td>
                  <td></td>
                  <td style="text-align: left; font-weight: bold;">Total</td>
                  <td style="text-align: left; font-weight: bold;">{{ rbcCount.shapeBodyTotalCount }}</td>
                  <td style="text-align: left; font-weight: bold;">{{ percentageChange(rbcCount.shapeBodyTotalCount, RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) }} %</td>
                </tr>
              </template>
            </template>
            <tr>
              <th style="text-align: left; padding: 15px 0;">Others</th>
              <th style="text-align: left; padding: 15px 0;">Platelets</th>
              <th></th>
              <th style="text-align: left; padding: 15px 0;" colspan="2">{{ rbcCount.pltCount }} PLT / 1000 RBC</th>
            </tr>
            <tr>
              <th style="text-align: left; padding-top: 15px;">Comment</th>
              <th v-show="selectItems?.rbcMemo" style="text-align: left; padding-top: 15px;" colspan="4">
                <pre style="text-align: left; outline: 1px solid #252629; padding: 4px;">{{
                    selectItems?.rbcMemo
                  }}</pre>
              </th>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- WBC Classification -->
        <div style="margin-top: 150px; margin-bottom: 50px; border-top: 2px dotted #696969">
          <h3 style="margin: 10px 0; font-size: 1.2rem; font-weight: 600; text-align: center;">
            {{ projectType === 'pb' ? 'WBC' : 'BM' }} classification result</h3>
          <table style="width: 100%; font-size: 0.8rem;">
            <colgroup>
              <col style="width: 30%;"/>
              <col style="width: 45%;"/>
              <col style="width: 25%;"/>
            </colgroup>
            <thead>
            <tr style="margin-bottom: 15px; font-size: 18px; font-weight: normal; padding-bottom: 100px;">
              <th style="text-align: left;">Class</th>
              <th style="text-align: left;">Count</th>
              <th style="text-align: left;">Percent</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in filteredWbcInfo(wbcInfo, 'wbc')" :key="item.id" style="padding-bottom: 5px;">
              <th style="text-align: left; padding: 5px 0;">{{ item?.name }}</th>
              <td style="text-align: left; padding: 5px 0;">{{ item?.count }}</td>
              <td style="text-align: left; padding: 5px 0;">{{ item?.percent }} %</td>
            </tr>
            <tr style="padding-bottom: 5px;">
              <th style="text-align: left; font-weight: bold; padding: 5px 0;">Total</th>
              <td style="text-align: left; padding: 5px 0;">{{ selectItems?.wbcInfo?.totalCount }}</td>
              <td style="text-align: left; padding: 5px 0;">100.00%</td>
            </tr>


            <th style="text-align: left; padding-top: 30px; font-weight: bold;" v-if="projectType !== 'bm'">non-Wbc</th>

              <template v-for="item in filteredWbcInfo(wbcInfo, 'nonWbc')" :key="item.id">
                <tr style="padding-top: 5px; padding-bottom: 15px;" v-if="projectType !== 'bm'">
                  <td style="text-align: left; padding: 5px 0; width: 30%;">{{ item.name }}</td>
                  <td style="text-align: left; padding: 5px 0; width: 45%;">{{ item.count }}</td>
                  <td style="text-align: left; padding: 5px 0; width: 25%;">-</td>
                </tr>
              </template>
            <tr style="padding-bottom: 5px;">
              <th style="text-align: left; padding: 15px 0;">Comment</th>
              <td v-show="selectItems?.wbcMemo" colspan="2" style="text-align: left; padding: 5px 0;">
                <pre style="text-align: left; outline: 1px solid #252629; padding: 4px;">{{
                    selectItems?.wbcMemo
                  }}</pre>
              </td>
            </tr>
            </tbody>
          </table>

          <!-- Print List -->
          <ul class="print"
              style="list-style: none; padding-left: 0; margin-top: 20px; text-align: center; display:flex; flex-direction: column; align-items: center; justify-content: center;">
            <li v-for="(item) in noImageList(wbcInfo)" :key="item.id" style="">
              <div style="font-weight: bold; font-size: 18px; margin: 10px auto 20px;">{{ item?.title }} ({{
                  item?.count
                }})
              </div>
              <ul :class="'wbcImgWrap ' + item?.title"
                  style="list-style: none; padding-left: 0; margin-top: 10px;text-align: left;">
                <li v-for="(image) in item.images" :key="image.fileName"
                    style="display: inline-block; margin-right: 5px; margin-top: 5px; outline: 1px solid #2c2d2c; cursor: auto;">
                  <div style="position: relative; text-align: left;">
                    <img
                        :src="getImageUrl(image.fileName, item.id, item.title)"
                        v-if="!hiddenImages[`${item.id}-${image.fileName}`]"
                        :width="image.width ? image.width : '150px'" :height="image.height ? image.height : '150px'"
                        @error="handleImageError(item.id, image.fileName)"
                        :style="{ filter: image.filter }" class="cellImg" ref="cellRef"/>
                    <div class="center-point" :style="image.coordinates"></div>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, defineEmits, onMounted, ref } from "vue";
import {getTestTypeText, getBmTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {getImagePrintApi, getOrderClassApi} from "@/common/api/service/setting/settingApi";
import {useStore} from "vuex";
import pako from 'pako';
import {formatDateString} from "@/common/lib/utils/dateUtils";
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {disableScroll, enableScroll} from "@/common/lib/utils/scroll";
import {
  incheonGilPercentChange,
  incheonStMaryPercentChange,
  inhaPercentChange,
  seoulStMaryPercentChange
} from "@/common/helpers/common/classPercent";
import { HOSPITAL_SITE_CD_BY_NAME } from "@/common/defines/constants/siteCd";
import {RBC_CODE_CLASS_ID, SHOWING_RBC_SHAPE_CLASS_IDS} from "@/common/defines/constants/dataBase";
import {DIR_NAME} from "@/common/defines/constants/settings";
import {fileSearchApi} from "@/common/api/service/fileSys/fileSysApi";

const projectType = window.PROJECT_TYPE;
const store = useStore();
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const apiBaseUrl = viewerCheck.value === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;

const printContent = ref(null);
const wbcInfo = ref([]);

const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const siteCd = computed(() => store.state.commonModule.siteCd);
const slideData = computed(() => store.state.slideDataModule);

const selectItems = ref<any>(null);
const orderClass = ref<any>({});

const imagePrintAndWbcArr = ref<string[]>([]);
const emit = defineEmits(['printClose']);
const nonWbcIdList = ['12', '13', '14', '15', '16'];
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
const totalRBCImageNames = ref<string[]>([]);
const rbcTotalVal = ref(0);
const sizeChromiaTotal = ref(0);
const chromiaTotalTwo = ref(0);
const shapeBodyTotal = ref(0);

const maxRbcCount = ref(0);
const pltCount = ref(0);
const malariaCount = ref(0);
const shapeOthersCount = ref(0);

const printReady = ref(false);

onMounted(async () => {
  await getDetailRunningInfo();
  await getOrderClass();
  await getImagePrintData();
  if (projectType !== 'bm') {
    resetRBCValue(selectItems.value.rbcInfoAfter);
    await checkRBCTotalImageNames();
    await rbcTotalAndReCountForReport();
    await calcShapeOthersCount();
  }
  await printPage();
});

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

const calcShapeOthersCount = async () => {
  const shapeOthers: any = await getShapeOthers();
  shapeOthersCount.value = shapeOthers?.artifact + shapeOthers?.doubleNormal;
}

const getShapeOthers = async () => {
  const path = selectItems.value?.img_drive_root_path !== '' && selectItems.value?.img_drive_root_path ? selectItems.value?.img_drive_root_path : iaRootPath.value;
  const url_Old = `${path}/${selectItems.value?.slotId}/${DIR_NAME.RBC_CLASS}/${selectItems.value?.slotId}.json`;
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
  for (const category of selectItems.value.rbcInfoAfter) {
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

const hiddenImages = ref<Record<string, boolean>>({});

const handleImageError = (itemId: number, fileName: string) => {
  hiddenImages.value[`${itemId}-${fileName}`] = true;
};

const percentageChange = (count: any, categoryId: string): any => {
  const percentage = ((Number(count) / calculateRbcTotalByCategoryId(categoryId)) * 100).toFixed(1);
  return (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage
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

const getDetailRunningInfo = async () => {
  try {
    selectItems.value = slideData.value;
    wbcInfo.value = slideData.value.wbcInfoAfter;
  } catch (e) {
    console.error(e);
  }
}

const filteredWbcInfo = (wbcInfoArr: any, type: 'wbc' | 'nonWbc') => {
  if (type === 'nonWbc') {
    return wbcInfoArr.filter((item: any) => nonWbcIdList.includes(item.id) && item.count > 0);
  }
  return wbcInfoArr.filter((item: any) => !nonWbcIdList.includes(item.id) && item.count > 0);
}

function getImageUrl(imageName: any, id: string, title: string): string {
  // 이미지 정보가 없다면 빈 문자열 반환
  const showImage = [...imagePrintAndWbcArr.value].find(item => item === String(id));
  if (!showImage) {
    return '';
  }

  if (!wbcInfo.value || wbcInfo.value.length === 0) {
    return "";
  }

  const path = selectItems.value.img_drive_root_path !== '' && selectItems.value.img_drive_root_path ? selectItems.value.img_drive_root_path : iaRootPath.value;
  const slotId = selectItems.value.slotId || "";
  const dirName = projectType === 'bm' ? DIR_NAME.BM_CLASS : DIR_NAME.WBC_CLASS;
  const folderPath = `${path}/${slotId}/${dirName}/${id}_${title}`;
  return `${apiBaseUrl}/images/print?folder=${folderPath}&imageName=${imageName}`;
}

const noImageList = (wbcArr: any) => {
  return wbcArr.filter((item: any) => [...imagePrintAndWbcArr.value].includes(String(item.id)));
}


const printPage = async () => {
  printReady.value = true;
  disableScroll();

  percentChangeBySiteCd();
  try {
    // 프린트할 컨텐츠를 가져옴
    const content = printContent.value;
    if (!content) {
      throw new Error("프린트할 내용을 찾을 수 없습니다.");
    }

    // HTML 컨텐츠를 Gzip으로 압축
    const compressedContent = pako.gzip(content.innerHTML, { level: 9 });

    // HTML 컨텐츠를 PDF로 변환하는 요청을 보냄
    const response = await fetch(`${apiBaseUrl}/pdf/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'gzip',
      },
      body: compressedContent,
    });

    if (!response.ok) {
      throw new Error('HTML을 PDF로 변환하는데 실패했습니다.');
    }

    // 받은 PDF 파일을 blob으로 변환
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Edge 브라우저에서 PDF 다운로드를 위한 처리
    const isEdge = /Edg/.test(navigator.userAgent);
    if (isEdge) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectItems.value.barcodeNo}-report`; // 다운로드할 파일명 설정
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 다른 브라우저에서 새 창에 PDF 열기
      window.open(url, '_blank', 'width=800,height=500,noopener,noreferrer');
    }

    window.URL.revokeObjectURL(url);
    printReady.value = false;
  } catch (error) {
    console.error('Error:', error);
    printReady.value = false;
  } finally {
    enableScroll();
  }
};



const getImagePrintData = async () => {
  try {
    const result = await getImagePrintApi();

    if (result && result.data) {
      const data = result.data;

      imagePrintAndWbcArr.value = data.filter((item) => item.checked).map(item => item.classId);

      // count가 없는 경우 print에서 보여줄 wbcInfo에서 제거
      wbcInfo.value = wbcInfo.value.filter((item: any) => item.count !== '0');

      // wbcClassification Order 적용
      const oArr = orderClass.value.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
      const sortArr = orderClass.value.length !== 0 ? oArr : projectType === 'bm' ? basicBmClassList : basicWbcArr;
      const sortedWbcInfoData = await sortWbcInfo(wbcInfo.value, sortArr);
      wbcInfo.value = sortedWbcInfoData;
      percentChangeBySiteCd();
    }
  } catch (e) {
    console.error(e);
  }
};

const sortWbcInfo = (wbcInfo: any, basicWbcArr: any) => {
  let newSortArr = wbcInfo.slice(); // 기존 배열 복사

  newSortArr.sort((a: any, b: any) => {
    const nameA = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (a.title || a.abbreviation));
    const nameB = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (b.title || b.abbreviation));

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });

  // 정렬된 배열을 wbcInfo에 할당
  return wbcInfo.splice(0, wbcInfo.length, ...newSortArr);
};

const percentChangeBySiteCd = async () => {
  if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['서울성모병원']) {
    wbcInfo.value = seoulStMaryPercentChange(wbcInfo.value, wbcInfo.value);
  } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
    wbcInfo.value = await inhaPercentChange(selectItems.value, wbcInfo.value);
  } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천성모병원']) {
    wbcInfo.value = incheonStMaryPercentChange(projectType, wbcInfo.value);
  } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천길병원']) {
    wbcInfo.value = incheonGilPercentChange(wbcInfo.value, selectItems.value?.wbcInfo.totalCount);
  }
}

const closePrint = () => {
  emit('printClose');
}

</script>
