<template>
  <div :class="[bmIsBoolen ? 'bmclass' : '']">
    <h3 class="titleText">
      <template v-if="bmIsBoolen"><span class="greenColor">BM</span> <span class="greenColor">C</span>lassification
      </template>
      <template v-else><span class="greenColor">WBC</span> <span class="greenColor">C</span>lassification</template>
    </h3>
    <div>
      <template v-for="(classList, outerIndex) in dspWbcClassList" :key="outerIndex">
        <template v-for="(category, innerIndex) in classList" :key="innerIndex">
          <div class="categories" v-if="shouldRenderCategory(category)">
            <ul class="categoryNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">Class</li>
              <li>{{ getCategoryName(category) }}</li>
            </ul>
            <ul class="classNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">Count</li>
              <li style="text-align: center">{{ category?.count }}</li>
            </ul>
            <ul class="degree">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">%</li>
              <li>
                {{
                  totalCount && totalCount !== '0' ? ((Number(category?.count) / Number(totalCount)) * 100).toFixed(0) : '0'
                }}
              </li>
              <!--              <li v-if="innerIndex === dspWbcClassList.length && dspWbcClassList.length !== 1">-->
              <!--                100.00-->
              <!--              </li>-->
            </ul>
          </div>
        </template>
      </template>
      <div class="categories">
        <ul class="categoryNm">
          <li>
            Total
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
      <template v-for="(classList, outerIndex) in dspWbcClassList" :key="outerIndex">
        <template v-for="(category, innerIndex) in classList" :key="innerIndex">
          <div class="categories mt1" v-if="category.title === 'OT'">
            <ul class="categoryNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">Class</li>
              <li>{{ getCategoryName(category) }}</li>
            </ul>
            <ul class="classNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">Count</li>
              <li style="text-align: center">{{ category?.count }}</li>
            </ul>
            <ul class="degree">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">%</li>
              <li>
                {{
                  totalCount && totalCount !== '0' ? ((Number(category?.count) / Number(totalCount)) * 100).toFixed(0) : '0'
                }}
              </li>
            </ul>
          </div>
        </template>
      </template>
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
              <li>{{ nWbcItem?.count }} <span
                  v-if="nWbcItem.title === 'NR' || nWbcItem.title === 'GP'"> / {{ maxWbcCount }} WBC</span></li>
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
import {computed, ref, onMounted, watch, defineProps, getCurrentInstance} from "vue";
import {useStore} from "vuex";
import {WbcInfo, basicWbcArr, basicBmClassList} from "@/store/modules/analysis/wbcclassification";

const props = defineProps(['bmIsBoolen']);
const storeEm = useStore();
const embeddedStatusJobCmd = computed(() => storeEm.state.embeddedStatusModule);
const commonDataGet = computed(() => storeEm.state.commonModule);
const chatRunningData = computed(() => storeEm.state.commonModule.chatRunningData);
const slotIndex = computed(() => storeEm.state.commonModule.slotIndex);

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
const totalCount = ref<string>("0");
const maxWbcCount = ref<string>('');
const slideProceeding = ref('0');
const instance = getCurrentInstance();
const classArr = computed(() => storeEm.state.commonModule.classArr);
watch([embeddedStatusJobCmd.value], async (newVal) => {
  if (newVal.length > 0) {
    const sysInfo = newVal[0].sysInfo;
    siteCd.value = sysInfo.siteCd;
  }
})

watch([commonDataGet.value], async (newVals: any) => {
  if (newVals) {
    slideProceeding.value = newVals.slideProceeding;
  }
})
watch(() => chatRunningData.value, (data) => {
  try {

    const parsedData = data;
    if (parsedData.jobCmd === 'RUNNING_INFO') {
      updateDataArray({wbcInfo: parsedData.slotInfo}, parsedData);
    }
  } catch (e) {
    // console.log(e)
  }
});

onMounted(() => {
  // const initialWbcClassList = store.state.wbcClassificationModule;
  updateDataArray(basicBmClassList, null, true);
});


const updateDataArray = async (newSlotInfo: any, parsedData?: any, type?: boolean) => {

  const slotArray = JSON.parse(JSON.stringify(newSlotInfo));
  if (slotArray.wbcInfo) {
    testType.value = slotArray?.wbcInfo?.testType;
    const wbcinfoType = props.bmIsBoolen ? [slotArray.wbcInfo.bmInfo] : [slotArray.wbcInfo.wbcInfo];
    const wbcInfoArray = wbcinfoType;
    const arrType = props.bmIsBoolen ? [basicBmClassList] : [basicWbcArr];
    dspWbcClassList.value = wbcInfoArray[0].length > 0 ? wbcInfoArray : arrType;
    const areAllCountsZero = (classList: any[]) => {
      // 모든 요소의 count가 0인지 확인
      return classList.every((classGroup) => {
        return classGroup.every((category: any) => {
          return category.count === '0';
        });
      });
    };

    // dspWbcClassList.value 배열의 모든 count 값이 '0'인지 확인
    const allCountsAreZero = areAllCountsZero(dspWbcClassList.value);

    if (allCountsAreZero) {
      totalCount.value = '0'
    }

    dspBfClassList.value = dspWbcClassList.value.flat();

    const nonRbcWbcInfoArray = wbcInfoArray
        .flat()  // 중첩 배열을 평탄화
        .filter((item: any) =>
            ['NR', 'AR', 'GP', 'PA', 'MC', 'MA', 'GP', 'PA', 'SM'].includes(item?.title)
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
      if (currentSlot.wbcCount === '00') {
        return;
      }
      await updateCounts(currentSlot);
      maxWbcCount.value = currentSlot.maxWbcCount;
    }
  }
  await updatePercentages();
  const str: any = parsedData?.iCasStat ?? '';
  const iCasStatArr: any = [...str];
  if (iCasStatArr.lastIndexOf("2") !== -1) {
    classArr.value[iCasStatArr.lastIndexOf("2")] = {
      wbcInfo: dspWbcClassList.value,
      nonRbcClassList: nonWbcClassList,
      totalCount: totalCount.value,
      maxWbcCount: maxWbcCount.value,
      slotId: parsedData.slotInfo.slotId
    };
  }
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
  const includesStr = siteCd.value === '0006' ? ["AR", "NR", "GP", "PA", "MC", "MA", "OT"] : ["AR", "NR", "GP", "PA", "MC", "MA", "SM", "OT"]
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
  let totalVal = "0";

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
  const includesStr = siteCd.value === '0006' ? ["AR", "NR", "GP", "PA", "MC", "MA", 'NE', 'GP', 'PA', 'OT'] : ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'];
  const includesStr2 = siteCd.value === '0006' ? ["NR", "AR", "MC", "MA", 'NE', 'GP', 'PA', 'OT'] : ["NR", "AR", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'];

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
