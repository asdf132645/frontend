<!-- ListInfo.vue -->
<template>

  <div v-if="Object.keys(selectedItem).length !== 0">
    <div>
      <h3 class="orderTitle hh3title">Order Information</h3>
      <ul class="orderListUi">
        <li>Order ID: <span>{{ selectedItem?.slotId }}</span>  </li>
        <li>LIS status: <span>No data sent or received from LIS</span>  </li>
        <li>Type of order:
          <span v-if="selectedItem?.testType === '01' || selectedItem?.testType === '04'">WBC + RBC</span>
          <span v-else>{{ selectedItem?.testType }}</span>
        </li> 
        <li>NS, NB Integration: <span>{{ selectedItem?.isNsNbIntegration }}</span>  </li>
        <li>Patient ID: <span>{{ selectedItem?.patientId }}</span>  </li>
        <li>Patient Name: <span>{{ selectedItem?.patientNm }}</span>  </li>
        <li>
          <img v-show="!barCodeImageShowError" @error="onImageError" :src="pilePath" style="width: 355px"/>
        </li>
      </ul>
    </div>
    <div>
      <h3 class="mt2 mb1 hh3title">Result Information</h3>
      <ul>
<!--        <li>Analyzed Date <span>{{ formatDateString(selectedItem?.analyzedDttm) }}</span></li>-->
<!--        <li>Signed State <span>{{ selectedItem?.submitState }}</span></li>-->
<!--        <li>Signed of Date <span>{{ selectedItem?.submitOfDate }}</span></li>-->
<!--        <li>Signed User ID <span>{{ selectedItem?.submitUserId }}</span></li>-->
        <li v-if="selectedItem?.testType === '01' || selectedItem?.testType === '04'">
          <div class="resInfoContainer">
            <li class="resInfoWrapper mb1">
              <p>Class</p>
              <p>Count</p>
              <p>Percent</p>
            </li>
            <template v-for="result in selectedItem?.wbcInfoAfter" :key="result.title" >
              <li v-if="showClassificationResults(result.title) && result.count > 0" class="resInfoWrapper resInfoWrapperLine">
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

            <template v-for="result in selectedItem?.wbcInfoAfter" :key="result.title" >
              <li v-if="showClassificationNonWbcResults(result.title) && result.count > 0" class="resInfoWrapper resInfoWrapperLine">
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

<script setup >
import {ref, defineProps, onMounted, watchEffect, watch, nextTick} from 'vue';
import {barcodeImgDir} from "@/common/defines/constFile/settings";
import moment from "moment/moment";
import {useStore} from "vuex";
const store = useStore();

const props = defineProps(['selectedItem']);
const iaRootPath = ref(store.state.commonModule.iaRootPath);
const pilePath = ref('');
const barCodeImageShowError = ref(false);
const wbcTotal = ref(0);
const nonWbcTitles = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM'];

onMounted(() => {
  barCodeImageShowError.value = false;
  // iaRootPath가 존재하면 getImageUrl 함수 호출
  if (iaRootPath.value) {
    pilePath.value = getImageUrl('barcode_image.jpg');
  }
});
watch(() => props.selectedItem, (newSelectedItem) => {
  barCodeImageShowError.value = false;
  wbcTotal.value = props.selectedItem.wbcInfoAfter.reduce((acc,item) => {
    if (!nonWbcTitles.includes(item.title)) return acc + Number(item.count)
    return acc
  }, 0)
  if (iaRootPath.value) {
    pilePath.value = getImageUrl('barcode_image.jpg', newSelectedItem);
  }
});

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

function getImageUrl(imageName){
  const path = props.selectedItem?.img_drive_root_path !== '' && props.selectedItem?.img_drive_root_path ? props.selectedItem?.img_drive_root_path : iaRootPath.value;
  return `${apiBaseUrl}/images?folder=${path + '/' + props.selectedItem.slotId + '/' + barcodeImgDir.barcodeDirName + '/'}&imageName=${imageName}`;
}

const onImageError = () => {
  barCodeImageShowError.value = true;
}

</script>
