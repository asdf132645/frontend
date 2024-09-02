<!-- ListInfo.vue -->
<template>

  <div v-if="Object.keys(selectedItem).length !== 0">
    <div>
      <h3 class="orderTitle hh3title">Order Information</h3>
      <div class="orderListWrapper" style="padding: 0;">
        <ul class="orderListUi">
          <li class="flexColumn">
            <span class="mb1">Order ID:</span>
            <span class="mb2">{{ selectedItem?.slotId }}</span>
          </li>
          <li>NS, NB Integration: {{ selectedItem?.isNsNbIntegration === '' ? 'N' : 'Y' }}</li>
        </ul>
        <div>
          <img v-show="!barCodeImageShowError" @error="onImageError" :src="pilePath"
               style="width: 200px; float:right;"/>
        </div>
      </div>
    </div>
    <div class="resultInformationContainer" style="padding-top: 0;">
      <h3 class="mt2 mb1 hh3title">Result Information</h3>
      <ul class="resInfoTopContainer">
        <li v-if="selectedItem?.testType === '01' || selectedItem?.testType === '04' || projectType === 'bm'">
          <div class="resInfoContainer">
            <li class="resInfoWrapper mb1">
              <p>Class</p>
              <p>Count</p>
              <p>Percent</p>
            </li>
            <template v-for="result in wbcInfoAfter" :key="result.title">
              <li v-if="showClassificationResults(result.title) && result.count > 0"
                  class="resInfoWrapper resInfoWrapperLine">
                <p>{{ result.title }}</p>
                <p>{{ result.count }}</p>
                <p>{{ result.percent + '%' }}</p>
              </li>
            </template>
            <li class="resInfoWrapper mt1 mb2">
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
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, onMounted, watch, computed, onBeforeMount} from 'vue';
import {barcodeImgDir} from "@/common/defines/constFile/settings";
import moment from "moment/moment";
import {useStore} from "vuex";
import {getOrderClassApi} from "@/common/api/service/setting/settingApi";
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";

const store = useStore();
const props = defineProps(['selectedItem']);
const iaRootPath = ref(store.state.commonModule.iaRootPath);
const siteCd = computed(() => store.state.commonModule.siteCd);

const pilePath = ref('');
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
  // iaRootPath가 존재하면 getImageUrl 함수 호출
  if (iaRootPath.value) {
    pilePath.value = getImageUrl('barcode_image.jpg');
  }
});

watch(() => props.selectedItem, (newSelectedItem) => {
  barCodeImageShowError.value = false;
  setWbcTotalAndPercent();
  sortClassOrder();

  if (iaRootPath.value) {
    pilePath.value = getImageUrl('barcode_image.jpg', newSelectedItem);
  }
});

const sortClassOrder = () => {
  if (!orderClass.value || orderClass.value.length === 0 || !Array.isArray(orderClass.value)) {
    wbcInfoAfter.value = props.selectedItem.wbcInfoAfter;
    return;
  }
  const oArr = orderClass.value.sort((a, b) => Number(a.orderIdx) - Number(b.orderIdx));
  const sortArr = orderClass.value.length !== 0 ? oArr : projectType.value === 'bm' ? basicBmClassList : basicWbcArr;
  const sortedWbcInfoData = sortWbcInfo(props.selectedItem.wbcInfoAfter, sortArr);
  wbcInfoAfter.value = sortedWbcInfoData;
  if (siteCd.value === '0011') {
    wbcInfoAfter.value = inhaDataChangeSave(props.selectedItem, props.selectedItem.wbcInfoAfter)
  }
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
    console.log(e);
  }
}

const setWbcTotalAndPercent = () => {
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
      if (siteCd.value !== '0011') {
        const targetArray = getStringArrayBySiteCd(siteCd.value, props.selectedItem?.testType);
        if (!targetArray.includes(item.title)) {
          const percentage = ((Number(item.count) / Number(wbcTotal.value)) * 100).toFixed(1); // 소수점 0인경우 정수 표현
          item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
        }
      }
    }
  }
}

async function inhaDataChangeSave(runningInfoData, wbcInfo) {
  if (runningInfoData.testType !== '04') {
    const excludedTitles = ['NR', 'AR', 'GP', 'PA', 'MC', 'MA'];

    // wbcTotal 계산
    let wbcTotal = 0;
    wbcInfo.forEach((wbcItem) => {
      if (Number(wbcItem.count) > 0 && !excludedTitles.includes(wbcItem.title)) {
        wbcTotal += Number(wbcItem.count);
      }
    });
    // console.log('wbcTotal : ' + wbcTotal);

    let maxItem = null;
    let percentTotal = 0;

    // 퍼센트 계산 및 maxItem 결정
    wbcInfo.forEach((wbcItem, index) => {
      let percent = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(0));
      let percentN2 = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(2));

      // console.log(percentN2);

      // 특정 조건에 따라 퍼센트 조정
      if ((wbcItem.title === 'BL' || ['LA', 'IM', 'MB', 'AM'].includes(wbcItem.title)) &&
          Number(wbcItem.count) > 0 &&
          percentN2 >= 0 &&
          percentN2 <= 1) {
        percent = 1;
      }

      wbcItem.percent = percent;
      // console.log(wbcItem.title + ':' + wbcItem.percent);

      // 제외할 타이틀이 아닌 경우 percentTotal 및 maxItem 갱신
      if (!excludedTitles.includes(wbcItem.title)) {
        percentTotal += Number(wbcItem.percent);
        if (maxItem === null || Number(maxItem.count) < Number(wbcItem.count)) {
          maxItem = wbcItem;
        }
      }

      // console.log('maxItem : ' + (maxItem ? maxItem.title : 'null'));
      // console.log(percentTotal);

      // 마지막 항목일 때 백분율 오차 보정
      if (maxItem !== null && (index + 1) === wbcInfo.length) {
        // console.log(Number(maxItem.percent));
        // console.log(100 - percentTotal);
        maxItem.percent = Number(maxItem.percent) + (100 - percentTotal);
        // console.log(maxItem.percent);
      }
    });

    return wbcInfo;
  }
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
  return `${apiBaseUrl}/images?folder=${path + '/' + props.selectedItem.slotId + '/' + barcodeImgDir.barcodeDirName + '/'}&imageName=${imageName}`;
}

const onImageError = () => {
  barCodeImageShowError.value = true;
}

</script>
