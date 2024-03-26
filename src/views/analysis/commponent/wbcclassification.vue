<template>
  <div>
    <h3 class="titleText">
      <span class="greenColor">WBC</span> <span class="greenColor">C</span>lassification
    </h3>
    <div>
      <template v-for="(classList, outerIndex) in dspWbcClassList" :key="outerIndex">
        <template v-for="(category, innerIndex) in classList" :key="innerIndex">
          <div class="categories" v-if="shouldRenderCategory(category)">
            <ul class="categoryNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">Class</li>
              <li>{{ getCategoryName(category) }}</li>
              <li v-if="innerIndex === dspWbcClassList.length && dspWbcClassList.length !== 1">
                total
              </li>
            </ul>
            <ul class="classNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">Count</li>
              <li>{{ category?.count }}</li>
              <li v-if="innerIndex === dspWbcClassList.length && dspWbcClassList.length !== 1">
                {{ totalCount || 0 }}
              </li>
            </ul>
            <ul class="degree">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">%</li>
              <li>
                {{
                  totalCount && totalCount !== '0' ? ((Number(category?.count) / Number(totalCount)) * 100).toFixed(0) : '0'
                }}
              </li>
              <li v-if="innerIndex === dspWbcClassList.length && dspWbcClassList.length !== 1">
                100.00
              </li>
            </ul>
          </div>
        </template>
      </template>
      <!--      nonrbc-->
      <div class='mt1'>
        <template v-for="(nWbcItem, outerIndex) in nonRbcClassList" :key="outerIndex">
          <div class="categories">
            <ul class="categoryNm">
              <li class="mb1 liTitle" v-if="outerIndex === 0">non-WBC</li>
              <li>{{ getCategoryName(nWbcItem) }}</li>
            </ul>
            <ul class="classNm">
              <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
              <li>{{ nWbcItem?.count }} <span v-if="nWbcItem.title === 'NR' || nWbcItem.title === 'GP'"> / {{ maxWbcCount }} WBC</span></li>
            </ul>
            <ul class="degree">
              <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
              <li>-</li>
            </ul>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, onMounted, watch} from "vue";
import {useStore} from "vuex";
import {WbcInfo, basicWbcArr} from "@/store/modules/analysis/wbcclassification";

const storeEm = useStore();
const embeddedStatusJobCmd = computed(() => storeEm.state.embeddedStatusModule);
const commonDataGet = computed(() => storeEm.state.commonModule);

const siteCd = ref('');

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
const dspWbcClassList = ref<any>([]);
const dspBfClassList = ref<WbcInfo[]>([]);
const nonRbcClassList = ref<WbcInfo[]>([]);

const testType = ref<string>("");
const totalCount = ref<string>("");
const maxWbcCount = ref<string>('');
const slideProceeding = ref('0');
watch([embeddedStatusJobCmd.value], async (newVal) => {
  if (newVal.length > 0) {
    const sysInfo = newVal[0].sysInfo;
    siteCd.value = sysInfo.siteCd;
  }
})

watch([commonDataGet.value], async (newVals: any) => {
  if(newVals){
    slideProceeding.value = newVals.slideProceeding;
  }
})

const updateDataArray = (newSlotInfo: WbcInfo[]) => {
  const slotArray = JSON.parse(JSON.stringify(newSlotInfo));

  if (Array.isArray(slotArray.wbcInfo)) {
    testType.value = slotArray.wbcInfo[0].testType;
    if(!slotArray.wbcInfo[commonDataGet.value.slideProceeding]){
      return
    }
    const wbcInfoArray = [slotArray.wbcInfo[commonDataGet.value.slideProceeding].wbcInfo];
    dspWbcClassList.value = wbcInfoArray[0].length > 0 ? wbcInfoArray : [basicWbcArr];
    dspBfClassList.value = dspWbcClassList.value.flat();

    const nonRbcWbcInfoArray = wbcInfoArray
        .flat()  // 중첩 배열을 평탄화
        .filter((item: any) =>
            ['NR', 'AR', 'GP', 'PA', 'MC', 'MA'].includes(item?.title)
        );
    nonRbcClassList.value = nonRbcWbcInfoArray;

  } else {
    dspWbcClassList.value = [basicWbcArr];
    dspBfClassList.value = dspWbcClassList.value.flat();
  }
  if (slotArray && slotArray.wbcInfo) {
    const currentSlot = slotArray.wbcInfo.find(
        (item: SlotInfo) => item.stateCd === "03"
    );
    if (currentSlot) {
      updateCounts(currentSlot);
      maxWbcCount.value = currentSlot.maxWbcCount;
    }
  }
  updatePercentages();
  const wbcInfoArr = [];
  for (const slotArrayKey in slotArray.wbcInfo) {
    wbcInfoArr.push({
      wbcInfo: dspWbcClassList.value[slotArrayKey],
      barcodeId: slotArray.wbcInfo[slotArrayKey].barcodeNo
    })
  }
  store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
    slotInfo: [
      {
        wbcInfo: {
          wbcInfo: wbcInfoArr,
          nonRbcClassList: nonRbcClassList,
          totalCount: totalCount.value,
          maxWbcCount: maxWbcCount.value,
        },
      },
    ]
  });
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
    {deep: true}
);


const calculateWbcPercentages = (
    classList: WbcInfo[],
    wbcList: WbcInfo[]
) => {
  const includesStr = siteCd.value === '0006' ? ["AR", "NR", "GP", "PA", "MC", "MA"]:["AR", "NR", "GP", "PA", "MC", "MA", "SM"]
  const total = classList
      .filter(
          (category) =>
              !includesStr.includes(category.title)
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
  const wbcList = currentSlot.wbcInfo;
  let totalVal = "";

  if (testType.value === "01" || testType.value === "04") {
    totalVal = calculateWbcPercentages(
        dspWbcClassList.value.flat(),
        wbcList
    ).toFixed(0);
  } else {
    totalVal = calculateWbcPercentages(dspBfClassList.value, wbcList).toFixed(0);
  }

  totalCount.value = totalVal;
  updatePercentages();
};

const shouldRenderCategory = (category: WbcInfo) => {
  const includesStr = siteCd.value === '0006' ? ["AR", "NR", "GP", "PA", "MC", "MA"] : ["AR", "NR", "GP", "PA", "MC", "MA", "SM"];
  const includesStr2 = siteCd.value === '0006' ? ["NR", "AR", "MC", "MA"] : ["NR", "AR", "MC", "MA", "SM"];

  const targetArray = testType.value === '01' || testType.value === '04' ? includesStr : includesStr2;

  return !targetArray.includes(category.title);
};

const updatePercentages = () => {
  const percent = dspWbcClassList.value.map((classList: any) => {
    return classList.map((category: any) => {
      // Calculate and update percentage
      return {
        ...category,
        percent: totalCount.value && totalCount.value !== '0' ? ((Number(category.count) / Number(totalCount.value)) * 100).toFixed(0) : '0'
      };
    });
  });
  dspWbcClassList.value = percent;
};



const getCategoryName = (category: WbcInfo) => category?.name;
</script>
