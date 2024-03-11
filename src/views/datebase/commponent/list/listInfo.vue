<!-- ListInfo.vue -->
<template>

  <div v-if="Object.keys(selectedItem).length !== 0">
    <div>
      <h3>Order information</h3>
      <ul>
        <li>Order ID : <span>{{ selectedItem?.slotId }}</span>  </li>
        <li>LIS status : <span>No data sent or receuved from LIS</span>  </li>
        <li>Type of order : <span>No data sent or receuved from LIS</span>
          <span v-if="selectedItem?.testType === '01' || selectedItem?.testType === '04'">WBC + RBC</span>
          <span v-else>{{ selectedItem?.testType }}</span>
        </li>
        <li>NS, NB Integration : <span>{{ selectedItem?.isNsNbIntegration }}</span>  </li>
        <li>Patient ID : <span>{{ selectedItem?.patientId }}</span>  </li>
        <li>Patient name : <span>{{ selectedItem?.patientNm }}</span>  </li>
        <li>
          <img :src="pilePath"/>
        </li>
      </ul>
    </div>
    <div>
      <h3>Result information</h3>
      <ul>
        <li>Analyzed date : <span>{{ selectedItem?.analyzedDttm }}</span></li>
        <li>Signed state : <span>{{ selectedItem?.signedState }}</span></li>
        <li>Signed of date : <span>{{ selectedItem?.signedOfDate }}</span></li>
        <li>Signed user ID : <span>{{ selectedItem?.signedUserId }}</span></li>
        <li v-if="selectedItem?.testType === '01' || selectedItem?.testType === '04'">
          <div v-if="showClassificationResults(selectedItem?.classificationResult)">
            <div v-for="result in selectedItem.classificationResult" :key="result.title">
              <p>{{ result.title }}:</p>
              <p>{{ result.count }}:</p>
              <p>{{ result.percent }}:</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup >
import {ref, defineProps, onMounted, watchEffect, watch, nextTick} from 'vue';
import {stringToDateTime} from "@/common/lib/utils/conversionDataUtils";
import {barcodeImgDir} from "@/common/defines/constFile/settings";

const props = defineProps(['selectedItem']);
const pbiaRootPath = ref('');
const pilePath = ref('');


onMounted(() => {
  // pbiaRootPath가 존재하면 getImageUrl 함수 호출
  pbiaRootPath.value = sessionStorage.getItem('pbiaRootPath');
  if (pbiaRootPath.value) {
    pilePath.value = getImageUrl('barcode_image.jpg');
  }
});
watch(() => props.selectedItem, (newSelectedItem) => {
  if (pbiaRootPath.value) {
    pilePath.value = getImageUrl('barcode_image.jpg', newSelectedItem);
  }
});


const showClassificationResults = (classificationResult) => {
  return (
      classificationResult &&
      classificationResult.length > 0 &&
      !['12_NR', '13_GP', '14_PA', '15_AR', '16_MA', '17_SM'].includes(result.dirName)
  );

};
function getImageUrl(imageName){
  return `http://localhost:3002/images?folder=${pbiaRootPath.value + '/' + props.selectedItem.slotId + '/' + barcodeImgDir.barcodeDirName + '/'}&imageName=${imageName}`;
}

</script>
