<!-- ListInfo.vue -->
<template>
  <div v-if="Object.keys(selectedItem).length !== 0">
    <div>
      <h3 class="orderTitle hh3title">Order Information</h3>
      <div class="orderListWrapper" style="padding: 0;">
        <ul class="orderListUi">
          <li v-if="selectedItem?.testType">
            <p>Analysis Type</p>
            <p>{{ selectedItem?.testType }}</p>
          </li>
          <li v-if="selectedItem?.barcodeNo">
            <p>Barcode ID</p>
            <p>{{ selectedItem?.barcodeNo }}</p>
          </li>
          <li v-if="selectedItem?.analyzedDttm">
            <p>Analyzed Date</p>
            <p>{{ getDateTimeYYYYMMDDHHmmss(selectedItem?.analyzedDttm) }}</p>
          </li>
          <li v-if="selectedItem?.patientNm">
            <p>Patient Name</p>
            <p>{{ selectedItem?.patientNm }}</p>
          </li>
          <li v-if="selectedItem?.cbcSex">
            <p>Sex</p>
            <p>{{ selectedItem?.cbcSex }}</p>
          </li>
          <li v-if="selectedItem?.cbcAge">
            <p>Age</p>
            <p>{{ selectedItem?.cbcAge }}</p>
          </li>
          <li v-if="selectedItem?.hosNm">
            <p>Hospital</p>
            <p>{{ selectedItem?.hosNm }}</p>
          </li>
          <li>
            <p>NS, NB Integration</p>
            <p>{{ integrationFindNe(selectedItem.wbcInfoAfter) }}</p>
          </li>
        </ul>
        <div>
          <img v-show="!barCodeImageShowError && siteCd !== HOSPITAL_SITE_CD_BY_NAME['고대구로병원']" @error="onImageError" :src="barcodeImg"
               style="width: 200px; height: 120px; float:right;"/>
        </div>
      </div>
    </div>
    <div class="resultInformationContainer" style="padding-top: 0;">
      <h3 class="mt20 mb10 hh3title">Result Information</h3>
      <ul class="resInfoTopContainer">
        <div v-if="selectedItem?.testType === '01' || selectedItem?.testType === '04' || projectType === 'bm'" class="resInfoContainer">
            <li class="resInfoWrapper mb10">
              <p>Class</p>
              <p>Count</p>
              <p>Percent</p>
            </li>
            <template v-for="result in wbcInfoAfter" :key="result.title">
              <li v-if="showClassificationResults(result.title) && result.count > 0"
                  class="resInfoWrapper resInfoWrapperLine">
                <p>{{ result.title }}</p>
                <p>{{ result.count }}</p>
                <p>{{ percentWithNoError(result.percent) + '%' }}</p>
              </li>
            </template>
            <li class="resInfoWrapper mt10 mb20">
              <p>Total</p>
              <p>{{ wbcTotal }}</p>
              <p>100%</p>
            </li>

            <template v-for="result in wbcInfoAfter" :key="result.title">
              <li v-if="showClassificationNonWbcResults(result.title) && result.count > 0"
                  class="resInfoWrapper resInfoWrapperLine">
                <p>{{ result.title }}</p>
                <p>{{ result.count }}</p>
                <p>-</p>
              </li>
            </template>
          </div>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, onMounted, watch, computed, onBeforeMount} from 'vue';
import { DIR_NAME } from "@/common/defines/constants/settings";
import moment from "moment/moment";
import {useStore} from "vuex";
import {getOrderClassApi} from "@/common/api/service/setting/settingApi";
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";
import {
  incheonGilPercentChange,
  incheonStMaryPercentChange,
  inhaPercentChange,
  percentWithNoError,
  seoulStMaryPercentChange
} from "@/common/helpers/common/classPercent";
import { HOSPITAL_SITE_CD_BY_NAME } from "@/common/defines/constants/siteCd";
import {getDateTimeYYYYMMDDHHmmss} from "@/common/lib/utils/dateUtils";

const store = useStore();
const props = defineProps(['selectedItem']);
const iaRootPath = ref(store.state.commonModule.iaRootPath);
const siteCd = computed(() => store.state.commonModule.siteCd);

const barcodeImg = ref('');
const barCodeImageShowError = ref(false);
const wbcTotal = ref(0);
const nonWbcTitles = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM', 'OT'];
const projectType = ref('');
const orderClass = ref({});
const wbcInfoAfter = ref({});

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

onMounted(async () => {
  await getClassOrder();
  barCodeImageShowError.value = false;
  if (iaRootPath.value) {
    barcodeImg.value = getImageUrl('barcode_image.jpg');
  }
});

watch(() => props.selectedItem, (newSelectedItem) => {
  if (Object.keys(newSelectedItem).length === 0) return;
  barCodeImageShowError.value = false;
  setWbcTotalAndPercent();
  sortClassOrder();

  if (iaRootPath.value) {
    barcodeImg.value = getImageUrl('barcode_image.jpg', newSelectedItem);
  }
});

const integrationFindNe = (wbcInfoAfter) => {
  let returnText = '';
  const neFindItem = wbcInfoAfter.find((el) => {
    return el.title === 'NE'
  });

  if(neFindItem){
    returnText = 'Y' ;
  }else{
    returnText = 'N';
  }
  return returnText;
}

const sortClassOrder = async () => {
  if (!orderClass.value || orderClass.value.length === 0 || !Array.isArray(orderClass.value)) {
    wbcInfoAfter.value = props.selectedItem.wbcInfoAfter;
    return;
  }

  const oArr = orderClass.value.sort((a, b) => Number(a.orderIdx) - Number(b.orderIdx));
  const sortArr = orderClass.value.length !== 0 ? oArr : projectType.value === 'bm' ? basicBmClassList : basicWbcArr;
  const sortedWbcInfoData = sortWbcInfo(props.selectedItem.wbcInfoAfter, sortArr);
  wbcInfoAfter.value = sortedWbcInfoData;
}

const sortWbcInfo = (wbcInfo, basicWbcArr) => {
  let newSortArr = wbcInfo.slice(); // 기존 배열 복사

  return newSortArr.sort((a, b) => {
    const nameA = basicWbcArr.findIndex((item) => (item.title || item.abbreviation) === (a.title || a.abbreviation));
    const nameB = basicWbcArr.findIndex((item) => (item.title || item.abbreviation) === (b.title || b.abbreviation));

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });
};

const getClassOrder = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        orderClass.value = [];
      } else {
        orderClass.value = result.data.sort((a, b) => Number(a.orderIdx) - Number(b.orderIdx));
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const setWbcTotalAndPercent = async () => {
  wbcTotal.value = props.selectedItem.wbcInfoAfter.reduce((acc, item) => {
    if (!nonWbcTitles.includes(item.title)) return acc + Number(item.count)
    return acc
  }, 0)

  for (const item of props.selectedItem.wbcInfoAfter) {
    if (window.PROJECT_TYPE === 'bm') {
      if (item.title !== 'OT') {
        const percentage = ((Number(item.count) / Number(wbcTotal.value)) * 100).toFixed(1);  // 소수점 0인경우 정수 표현
        item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
      }
    } else {
      const targetArray = getStringArrayBySiteCd(siteCd.value, props.selectedItem?.testType);
      if (!targetArray.includes(item.title)) {
        item.percent = calculatePercentage(item.count, wbcTotal.value);
      }

      if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['서울성모병원']) {
        wbcInfoAfter.value = await seoulStMaryPercentChange(props.selectedItem.wbcInfoAfter, props.selectedItem.wbcInfoAfter);
      } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
        wbcInfoAfter.value = await inhaPercentChange(props.selectedItem, props.selectedItem.wbcInfoAfter);
      } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천성모병원']) {
        wbcInfoAfter.value = await incheonStMaryPercentChange(projectType.value, props.selectedItem.wbcInfoAfter);
      } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천길병원']) {
        wbcInfoAfter.value = await incheonGilPercentChange(props.selectedItem.wbcInfoAfter, props.selectedItem.wbcInfo.totalCount);
      }
    }
  }
}

const calculatePercentage = (count, total) => {
  const percentage = ((Number(count) / Number(total)) * 100).toFixed(1);
  return Number(percentage) === Math.floor(Number(percentage)) ? Math.floor(Number(percentage)).toString() : percentage;
}

const getStringArrayBySiteCd = (siteCd, testType) => {
  if (!siteCd && siteCd === '') {
    siteCd = '0000';
    testType = '01';
  }
  const arraysBySiteCd = { // 0006 -> 고대
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

const formatDateString = (dateString) => {
  const momentObj = moment(dateString, 'YYYYMMDDHHmmssSSSSS');
  return momentObj.format('YYYY-MM-DD HH:mm:ss');
}

const showClassificationResults = (classificationResult) => {
  return (
      classificationResult &&
      classificationResult.length > 0 &&
      !nonWbcTitles.includes(classificationResult)
  );
};

const showClassificationNonWbcResults = (classificationResult) => {
  return (classificationResult && classificationResult.length > 0 && nonWbcTitles.includes(classificationResult))
}


const apiBaseUrl = sessionStorage.getItem('viewerCheck') === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;

function getImageUrl(imageName) {
  const path = props.selectedItem?.img_drive_root_path !== '' && props.selectedItem?.img_drive_root_path ? props.selectedItem?.img_drive_root_path : iaRootPath.value;
  return `${apiBaseUrl}/images?folder=${path + '/' + props.selectedItem.slotId + '/' + DIR_NAME.BARCODE + '/'}&imageName=${imageName}`;
}

const onImageError = () => {
  barCodeImageShowError.value = true;
}

</script>
