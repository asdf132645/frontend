<template>
  <div :class="[bmIsBoolen ? 'bmclass' : '']">
    <h3 class="titleText">
      <template v-if="bmIsBoolen"><span class="greenColor">BM</span> <span class="greenColor">C</span>lassification</template>
      <template v-else><span class="greenColor">WBC</span> <span class="greenColor">C</span>lassification</template>
    </h3>
    <div>
      <template v-for="(classList, outerIndex) in dspWbcClassList" :key="outerIndex">
        <template v-for="(category, innerIndex) in classList" :key="innerIndex">
          <div class="categories" v-if="shouldRenderCategory(category)">
            <ul class="categoryNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">Class</li>
              <li>{{ getCategoryName(category) }}</li>
<!--              <li v-if="innerIndex === classList.length - 1 && outerIndex === dspWbcClassList.length - 1">-->
<!--                total-->
<!--              </li>-->
            </ul>
            <ul class="classNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">Count</li>
              <li>{{ category?.count }}</li>
<!--              <li v-if="innerIndex === classList.length - 1 && outerIndex === dspWbcClassList.length - 1">-->
<!--                {{ totalCount || 0 }}-->
<!--              </li>-->
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
      <div class="categories">
        <ul class="categoryNm">
          <li>
            total
          </li>
        </ul>
        <ul class="classNm">
          <li>
            {{ totalCount || 0 }}
          </li>
        </ul>
        <ul class="degree">
          <li>
            100.00
          </li>
        </ul>
      </div>
      <!--      nonrbc-->
      <div class='mt1'>
        <template v-for="(nWbcItem, outerIndex) in nonWbcClassList" :key="outerIndex">
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
import {computed, ref, onMounted, watch, defineProps} from "vue";
import {useStore} from "vuex";
import {WbcInfo, basicWbcArr, basicBmClassList} from "@/store/modules/analysis/wbcclassification";
const props = defineProps(['bmIsBoolen']);
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
const dspBfClassList = ref<any[]>([]);
const nonWbcClassList = ref<any[]>([]);

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

const updateDataArray = async (newSlotInfo: any) => {
  const slotArray = JSON.parse(JSON.stringify(newSlotInfo));
  if (slotArray.wbcInfo) {
    testType.value = slotArray?.wbcInfo?.testType;
    const wbcinfoType = props.bmIsBoolen ? [slotArray.wbcInfo.bmInfo] : [slotArray.wbcInfo.wbcInfo];
    const wbcInfoArray = wbcinfoType;
    const arrType = props.bmIsBoolen ? [basicBmClassList] : [basicWbcArr];
    dspWbcClassList.value = wbcInfoArray[0].length > 0 ? wbcInfoArray : arrType;
    dspBfClassList.value = dspWbcClassList.value.flat();

    const nonRbcWbcInfoArray = wbcInfoArray
        .flat()  // 중첩 배열을 평탄화
        .filter((item: any) =>
            ['NR', 'AR', 'GP', 'PA', 'MC', 'MA', 'GP', 'PA','SM'].includes(item?.title)
        );
    nonWbcClassList.value = nonRbcWbcInfoArray;

  } else {
    const arrType = props.bmIsBoolen ? [basicBmClassList] : [basicWbcArr];
    dspWbcClassList.value = arrType;
    dspBfClassList.value = dspWbcClassList.value.flat();
  }
  if (slotArray && slotArray.wbcInfo) {
    const currentSlot = slotArray.wbcInfo;
    if (currentSlot && currentSlot?.stateCd === '03') {
      if(currentSlot.wbcCount === '00'){
        return;
      }
      await updateCounts(currentSlot);
      maxWbcCount.value = currentSlot.maxWbcCount;
    }
  }
  await updatePercentages();
  // console.log('?!@!@')
  await store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
    slotInfo: [
      {
        wbcInfo: {
          wbcInfo: dspWbcClassList.value,
          nonRbcClassList: nonWbcClassList,
          totalCount: totalCount.value,
          maxWbcCount: maxWbcCount.value,
        },
      },
    ]
  });
};






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


const updateCounts = async (currentSlot: any) => {
  const arrType = props.bmIsBoolen ? currentSlot.bmInfo : currentSlot.wbcInfo;
  const wbcList = arrType;
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
  await updatePercentages();
};

const shouldRenderCategory = (category: WbcInfo) => {
  const includesStr = siteCd.value === '0006' ? ["AR", "NR", "GP", "PA", "MC", "MA", 'NE','GP','PA'] : ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE','GP','PA'];
  const includesStr2 = siteCd.value === '0006' ? ["NR", "AR", "MC", "MA", 'NE','GP','PA'] : ["NR", "AR", "MC", "MA", "SM", 'NE','GP','PA'];

  const targetArray = testType.value === '01' || testType.value === '04' ? includesStr : includesStr2;

  return !targetArray.includes(category.title);
};

const updatePercentages = async () => {
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
