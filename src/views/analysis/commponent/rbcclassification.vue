<template>
  <div class="mt2">
    <h3 class="titleText">
      <span class="greenColor">RBC</span> <span class="greenColor">C</span>lassification
    </h3>
    <div v-if="dspRbcClassList.length > 0">
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

const store = useStore();
const runningInfoModule = computed(() => store.state.runningInfoModule);
const dspRbcClassList = ref<RbcInfo[][]>([]);
const malariaCount = ref('');
const maxRbcCount = ref('');
const pltCount = ref('');

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

const updateDataArray = (newSlotInfo: RbcInfo[]) => {
  const slotArray = JSON.parse(JSON.stringify(newSlotInfo));
  if (Array.isArray(slotArray.rbcInfo)) {
    const wbcInfoArray = slotArray.rbcInfo.map((slot: any) => slot.rbcInfo);
    dspRbcClassList.value = wbcInfoArray[0].length > 0 ? wbcInfoArray : [basicRbcArr];
  } else {
    dspRbcClassList.value = [basicRbcArr];
  }

};
const getCategoryName = (category: RbcInfo) => category?.categoryNm;
</script>
<style>
td, th {
  border: 1px solid #353942;
}
</style>