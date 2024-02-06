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
  </div>
</template>


<script setup lang="ts">
import {ref, onMounted, watch} from "vue";
import {useStore} from "vuex";
import {RbcInfo, basicRbcArr} from "@/store/modules/analysis/rbcClassification";

const store = useStore();
const dspRbcClassList = ref<RbcInfo[][]>([]);


const updateDataArray = (newSlotInfo: RbcInfo[]) => {
  const slotArray = JSON.parse(JSON.stringify(newSlotInfo));
  if (Array.isArray(slotArray.rbcInfo)) {
    const wbcInfoArray = slotArray.rbcInfo.map((slot: any) => slot.rbcInfo);
    dspRbcClassList.value = wbcInfoArray[0].length > 0 ? wbcInfoArray : [basicRbcArr];
  }else{
    dspRbcClassList.value = [basicRbcArr];
  }

};

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

const getCategoryName = (category: RbcInfo) => category?.categoryNm;
</script>
<style>
td, th {
  border: 1px solid #353942;
}
</style>