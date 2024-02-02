<template>
  <div class="mt2">
    <h3 class="titleText">
      <span class="greenColor">WBC</span> <span class="greenColor">C</span>lassification
    </h3>
    <div>
      {{ dspWbcClassList }}
      <template v-for="(category, index) in dspWbcClassList" :key="index">
        <div class="categories">
          <ul class="categoryNm">
            <li v-if="index === 0">클래스</li>
            <li>{{ getCategoryName(category) }}</li>
          </ul>
          <ul class="classNm">
            <li v-if="index === 0">카운트</li>
            <li>{{ category?.count }}</li>
          </ul>
          <ul class="degree">
            <li v-if="index === 0">%</li>
            <li>{{ category?.percent }}</li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { WbcInfo } from "@/store/modules/analysis/wbcclassification";

interface SlotInfo {
  stateCd: string;
  testType: string;
  maxWbcCount: string;
  malariaCount: string;
  wbcInfo: WbcInfo[];
}

interface RootState {
  wbcClassificationModule: WbcInfo[];
  runningInfoModule: { slotInfo: SlotInfo[] };
}

const store = useStore<RootState>();
const dspWbcClassList = ref<WbcInfo[]>([]);
const dspBfClassList = ref<WbcInfo[]>([]);
const testType = ref<string>("");
const maxWbcCount = ref<string>("");
const malariaCount = ref<string>("");
const totalCount = ref<string>("");
// 누락된 변수들
const pltCount = ref<string>("");
const lowPowerPath = ref<any[]>([]);

const updateDataArray = (newSlotInfo: WbcInfo[]) => {
  dspWbcClassList.value = newSlotInfo;
  dspBfClassList.value = newSlotInfo;
};
onMounted(() => {
  const initialWbcClassList = store.state.wbcClassificationModule;
  updateDataArray(initialWbcClassList);
});

watch(
    () => store.state.wbcClassificationModule,
    (newSlotInfo) => {
      updateDataArray(newSlotInfo);
    },
    { deep: true }
);

watch(
    () => store.state.runningInfoModule,
    (newSlot) => {
      if (newSlot && newSlot.slotInfo) {
        const currentSlot = newSlot.slotInfo.find(
            (item: SlotInfo) => item.stateCd === "03"
        );
        if (currentSlot) {
          updateCounts(currentSlot);
        }
      }
    },
    { deep: true }
);

const calculateWbcPercentages = (
    classList: WbcInfo[],
    wbcList: WbcInfo[]
) => {
  const total = classList
      .filter(
          (category) =>
              !["AR", "NR", "GP", "PA", "MC", "MA"].includes(category.title)
      )
      .reduce((acc, category) => {
        const matchingWbcItem = wbcList.find(
            (wbcItem) => category.id === wbcItem.id
        );

        if (matchingWbcItem) {
          category.count = matchingWbcItem.count;
          return acc + Number(matchingWbcItem.count);
        }

        return acc;
      }, 0);

  return total;
};

const updateCounts = (currentSlot: SlotInfo) => {
  testType.value = currentSlot.testType;
  maxWbcCount.value = currentSlot.maxWbcCount;
  malariaCount.value = currentSlot.malariaCount;
  totalCount.value = "0";
  // pltCount.value = currentSlot.pltCount;
  // lowPowerPath.value = currentSlot.lowPowerPath;

  const wbcList = currentSlot.wbcInfo;

  if (testType.value === "01" || testType.value === "04") {
    totalCount.value = calculateWbcPercentages(
        dspWbcClassList.value,
        wbcList
    ).toFixed(0);
  } else {
    totalCount.value = calculateWbcPercentages(
        dspBfClassList.value,
        wbcList
    ).toFixed(0);
  }
};

const getCategoryName = (category: WbcInfo) => category?.name;
</script>
