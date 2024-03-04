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
          <img :src="getImageUrl('barcode_image.jpg')"/>
        </li>
      </ul>
    </div>
    <div>
      <h3>Result information</h3>
      <ul>
        <li>Analyzed date : {{ stringToDateTime(selectedItem?.analyzedDttm) }}<span></span></li>
        <li>Signed state : {{ stringToDateTime(selectedItem?.signedState) }}<span></span></li>
        <li>Signed of date : {{ stringToDateTime(selectedItem?.signedOfDate) }}<span></span></li>
        <li>Signed user ID : {{ stringToDateTime(selectedItem?.signedUserId) }}<span></span></li>
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
import { ref, defineProps } from 'vue';
import {stringToDateTime} from "@/common/lib/utils/conversionDataUtils";
import {barcodeImgDir} from "@/common/defines/constFile/settings";

const props = defineProps(['selectedItem']);
const pbiaRootPath = sessionStorage.getItem('pbiaRootPath')

const showClassificationResults = (classificationResult) => {
  return (
      classificationResult &&
      classificationResult.length > 0 &&
      !['12_NR', '13_GP', '14_PA', '15_AR', '16_MA', '17_SM'].includes(result.dirName)
  );

};
function getImageUrl(imageName){
  return `http://localhost:3002/images?folder=${pbiaRootPath + '/' + props.selectedItem.slotId + '/' + barcodeImgDir.barcodeDirName + '/'}&imageName=${imageName}`;
}

</script>
