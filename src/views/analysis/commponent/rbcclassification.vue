<template>
  <div class="mt2">
    <div v-if="testType !== '01' && testType !== '04'">
      <h3 class="titleText">
        <span class="greenColor">Whole</span> Slide Image
      </h3>
      <div>
        <div v-for="(rowStart, rowIndex) in [0, 6, 12, 18, 24, 30]" :key="rowIndex" class="pl-2">
          <div class="row">
            <div v-for="(lowPower, colIndex) in lowPowerPath.slice(rowStart, rowStart + 6)" :key="colIndex" class="col-2 p-1">
              <img :src="lowPower.path" :id="lowPower.seqNo" ref="wholeSlideImg" class="wholeSlideImg" @click="onClickBfImg($event, lowPower)" style="width: 75px;" />
            </div>
          </div>
        </div>

        <div v-if="testType === '03'" class="mt-3 row">
          <div class="col">
            <div style="color: #2798DC">Select Interest Area</div>
          </div>
          <div class="col">
            <div>{{ bfSelectModeList.length }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <h3 class="titleText">
        <span class="greenColor">RBC</span> <span class="greenColor">C</span>lassification
      </h3>
      <template v-for="(classList, outerIndex) in dspRbcClassList" :key="outerIndex">
        <template v-for="(category, innerIndex) in classList" :key="innerIndex">
          <div class="categories">
            <ul class="categoryNm">
              <li v-if="innerIndex === 0" class="mb1 liTitle">Category</li>
              <li>{{ getCategoryName(category) }}</li>
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
                <li>
                  <font-awesome-icon
                      :icon="['fas', 'circle']"
                      v-for="(degree, degreeIndex) in 4"
                      :key="degreeIndex"
                      :class="{ 'degreeActive': degreeIndex < classInfo?.degree }"
                  />
                </li>
              </template>
            </ul>
          </div>
        </template>
      </template>
    </div>
    <!--orders-->
    <div>
      <div class="categories">
        <ul class="categoryNm">
          <li>Others</li>
        </ul>
        <ul class="classNm">
          <li>Platelets</li>
          <li>Malaria</li>
        </ul>
        <ul class="degree">
          <li style="font-size: 0.7rem">{{ pltCount || 0 }} PLT / 1000 RBC</li>
          <li style="font-size: 0.7rem">{{ malariaCount || 0 }} / {{ maxRbcCount || 0 }} RBC</li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {ref, onMounted, watch, computed} from "vue";
import {useStore} from "vuex";
import {RbcInfo, basicRbcArr} from "@/store/modules/analysis/rbcClassification";
import {SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";

const store = useStore();
const runningInfoModule = computed(() => store.state.runningInfoModule);
const dspRbcClassList = ref<RbcInfo[][]>([]);
const malariaCount = ref('');
const maxRbcCount = ref('');
const pltCount = ref('');
const testType = ref<string>("01");
const bfSelectModeList = ref<any>([]);
const wholeSlideImgRef = ref(null);


watch([runningInfoModule.value], (newVal: any) => {
  if (newVal.length > 0) {
    const firstItem = newVal[0].runningInfo;
    if (firstItem) {
      if (firstItem.jobCmd === 'RUNNING_INFO') {
        const currentSlot = firstItem?.slotInfo.find(
            (item: SlotInfo) => item.stateCd === "03"
        );
        if (currentSlot) {
          malariaCount.value = currentSlot.malariaCount;
          maxRbcCount.value = currentSlot.maxRbcCount;
          pltCount.value = currentSlot.pltCount;
        }
      }
    }
  }
});


onMounted(() => {
  const initialRbcClassList = store.state.rbcClassificationModule;
  updateDataArray(initialRbcClassList);
});

watch(
    () => store.state.rbcClassificationModule,
    (newSlotInfo) => {
      updateDataArray(newSlotInfo);
    },
    {deep: true}
);
const lowPowerPath = ref([]);
const updateDataArray = (newSlotInfo: RbcInfo[]) => {
  const slotArray = JSON.parse(JSON.stringify(newSlotInfo));
  if (Array.isArray(slotArray.rbcInfo)) {
    testType.value = slotArray.rbcInfo[0].testType;
    const wbcInfoArray = slotArray.rbcInfo.map((slot: any) => slot.rbcInfo);
    dspRbcClassList.value = wbcInfoArray[0].length > 0 ? wbcInfoArray : [basicRbcArr];

    if (slotArray.lowPowerPath) {  // Check if lowPowerPath exists
      lowPowerPath.value = slotArray.lowPowerPath.sort(function (a: any, b: any) {
        return a.seqNo - b.seqNo;
      });
      // lowPowerPath.value.forEach(function(item: any) {
      //   item.path = item.path + '?' + getDateTimeStr()
      // });
    } else {
      lowPowerPath.value = [];
    }


  } else {
    dspRbcClassList.value = [basicRbcArr];
  }

};
const getCategoryName = (category: RbcInfo) => category?.categoryNm;

const onClickBfImg = (event: any, lowPower: any) => {
  if (testType.value === '03') {
    // lowPower가 이미 bfSelectModeList에 있는지 확인
    const existingIndex = bfSelectModeList.value.findIndex((item: any) => item.seqNo === lowPower.seqNo);

    if (existingIndex !== -1) {
      // 만약 lowPower가 이미 bfSelectModeList에 있다면, 제거
      bfSelectModeList.value.splice(existingIndex, 1);
    } else {
      // lowPower가 bfSelectModeList에 없다면, 추가
      bfSelectModeList.value.push(lowPower);
    }
  }
}

</script>
<style>
td, th {
  border: 1px solid #353942;
}
</style>