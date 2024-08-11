<template>
  <div :class="[bmIsBoolen ? 'bmclass' : '']">
    <h3 class="titleText">
      <template v-if="bmIsBoolen"><span class="greenColor">BM</span>Classification
      </template>
      <template v-else><span class="greenColor">WBC</span> Classification</template>
    </h3>
    <div class="analysisWbc">
      <template v-for="(classList, outerIndex) in dspWbcClassList" :key="outerIndex">
        <template v-for="(category, innerIndex) in classList" :key="innerIndex">
          <div class="categories" v-if="shouldRenderCategory(category)">
            <ul class="categoryNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle" style="cursor: default;">Class</li>
              <li style="cursor: default;">{{ getCategoryName(category) }}</li>
            </ul>
            <ul class="classNm">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle" style="cursor: default;">Count</li>
              <li style="text-align: center; cursor: default;">{{ category?.count }}</li>
            </ul>
            <ul class="degree">
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle" style="cursor: default;">%</li>
              <li style="cursor: default;">
                {{
                  totalCount && totalCount !== '0' ? ((Number(category?.count) / Number(totalCount)) * 100).toFixed((Number(category?.count) / Number(totalCount)) === 0 ? 0 : 1) : '0'
                }}
              </li>
            </ul>
          </div>
        </template>
      </template>
      <div class="categories">
        <ul class="categoryNm">
          <li style="cursor: default;">
            Total
          </li>
        </ul>
        <ul class="classNm">
          <li style="cursor: default;">
            {{ totalCount || 0 }}
          </li>
        </ul>
        <ul class="degree">
          <li style="cursor: default;">
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
              <li v-if="innerIndex === 0 && outerIndex === 0" class="mb1 liTitle">-</li>
              <li>
                {{
                  totalCount && totalCount !== '0' ? ((Number(category?.count) / Number(totalCount)) * 100).toFixed(0) : '0'
                }}
              </li>
            </ul>
          </div>
        </template>
      </template>

      <!-- nonWbc -->
      <div class='mt1'>
        <template v-for="(nWbcItem, outerIndex) in selectNonWbc(dspWbcClassList)" :key="outerIndex">
          <div class="categories">
            <ul class="categoryNm" style="cursor: default;">
              <li class="mb1 liTitle" v-if="outerIndex === 0" style="cursor: default;">non-WBC</li>
              <li style="cursor: default;">{{ getCategoryName(nWbcItem) }}</li>
            </ul>
            <ul class="classNm">
              <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
              <li style="cursor: default;">{{ nWbcItem?.count }} <span
                  v-if="nWbcItem.title === 'NR' || nWbcItem.title === 'GP'"> / {{ maxWbcCount }} WBC</span></li>
            </ul>
            <ul class="degree">
              <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
              <li style="cursor: default;">-</li>
            </ul>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, defineProps, getCurrentInstance, defineEmits } from "vue";
import { useStore } from "vuex";
import {
  WbcInfo,
  basicWbcArr,
  basicBmClassList,
  basicWbcArrClint,
  basicBmClassListClint
} from "@/store/modules/analysis/wbcclassification";

const props = defineProps(['bmIsBoolen','parsedData']);
const storeEm = useStore();
const siteCd = computed(() => storeEm.state.commonModule.siteCd);
const firstTry = ref(false);

interface SlotInfo {
  stateCd: string;
  testType: string;
  maxWbcCount: string;
  malariaCount: string;
  wbcInfo: WbcInfo[];
}

const dspWbcClassList = ref<any>([]);
const dspBfClassList = ref<any[]>([]);

const testType = ref<string>("");
const totalCount = ref<string>("0");
const maxWbcCount = ref<string>('');
const emits = defineEmits();

const isNsNbIntegration = sessionStorage.getItem('isNsNbIntegration');

onMounted(() => {
  updateDataArray( basicBmClassList, null, true);
});

watch(
    () => props.parsedData, // 감시할 데이터
    (newVal, oldVal) => {
      // 데이터 변경 시 실행할 코드
      runningInfoGet(newVal);
    },
    { deep: true }
);
const runningInfoGet = async (data: any) => {
  const parsedData = data
  if(parsedData.jobCmd === 'RUNNING_INFO'){
    await updateDataArray({wbcInfo: parsedData.slotInfo}, parsedData);
  }
}

const updateDataArray = async (newSlotInfo: any, parsedData?: any, type?: boolean) => {
  const slotArray = JSON.parse(JSON.stringify(newSlotInfo));
  if (slotArray.wbcInfo) {
    testType.value = slotArray?.wbcInfo?.testType;
    const wbcinfoType = props.bmIsBoolen ? [slotArray.wbcInfo.bmInfo] : [slotArray.wbcInfo.wbcInfo];
    const wbcInfoArray = wbcinfoType;
    const arrType = props.bmIsBoolen ? [basicBmClassListClint] : [basicWbcArrClint];
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

  } else {
    const arrType = props.bmIsBoolen ? [basicBmClassListClint] : [basicWbcArrClint];
    dspWbcClassList.value = arrType;
    dspBfClassList.value = dspWbcClassList.value.flat();
  }
  if (slotArray && slotArray.wbcInfo) {
    const currentSlot = slotArray.wbcInfo;
    if (currentSlot && currentSlot?.stateCd === '03') {
      // if (currentSlot.wbcCount === '00') {
      //   return;
      // }
      await updateCounts(currentSlot);
      maxWbcCount.value = currentSlot.maxWbcCount;
    }
  }
  // await updatePercentages();
  const str: any = parsedData?.iCasStat ?? '';
  const iCasStatArr: any = [...str];
  // if(lastCompleteIndex !== slotIndex.value){
  //   return;
  // }
  if (iCasStatArr.lastIndexOf("2") !== -1) {
    const data = {
      classInfo:{
        wbcInfo: dspWbcClassList.value,
        // nonRbcClassList: nonWbcClassList,
        totalCount: totalCount.value,
        maxWbcCount: maxWbcCount.value,
        slotId: parsedData.slotInfo.slotId
      },
      iCasStatArr: iCasStatArr.lastIndexOf("2")
    };
    emits('classInfoUpdate',data)
  }
};

const selectNonWbc = (wbcArray: any) => {
  return wbcArray.flat().filter((item: any) => ['NR', 'AR', 'GP', 'PA', 'MC', 'MA', 'GP', 'PA', 'SM'].includes(item?.title));
}

const getIncludesStrBySiteCd = (siteCd: string, testType: string): string[] => {
  if (!siteCd || siteCd === '') {
    siteCd = '0000';
    testType = '01';
  }

  const arraysBySiteCd: any = {
    '0006': {
      includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", "NE", "GP", "PA", "OT"],
      includesStr2: ["NR", "AR", "MC", "MA", "SM", "NE", "GP", "PA", "OT"],
    },
  };

  // 지정된 siteCd에 대한 배열을 가져오거나, 기본 배열을 반환
  const arraysForSiteCd = arraysBySiteCd[siteCd] || {
    includesStr: ["AR", "NR", "GP", "PA", "MC", "SM", "MA", "GP", "PA", "OT"],
    includesStr2: ["NR", "AR", "MC", "MA", "SM", "GP", "PA", "OT"],
  };

  // testType에 따라 적절한 배열을 반환
  return (testType === '01' || testType === '04') ? arraysForSiteCd.includesStr : arraysForSiteCd.includesStr2;
};

// 퍼센트 계산 하는 부분
const calculateWbcPercentages = (
    classList: WbcInfo[],
    wbcList: WbcInfo[]
) => {

  const includesStr = getIncludesStrBySiteCd(siteCd.value, testType.value);
  let total = 0;

  for (let category of classList) {
    if (!includesStr.includes(category.title)) {
      total += Number(category.count);
    }
  }

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
  const targetArray = getStringArrayBySiteCd(siteCd.value, testType.value);
  return !targetArray.includes(category.title);
};


const getStringArrayBySiteCd = (siteCd: string, testType: string): string[] => {
  // 사전을 사용하여 각 siteCd에 따라 반환할 배열을 정의
  const arraysBySiteCd: any = {
    '0006': {
      includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
      includesStr2: ["NR", "AR", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
    },
  };

  // 지정된 siteCd에 대한 배열을 가져오거나, 기본 배열을 반환
  const arraysForSiteCd = arraysBySiteCd[siteCd] || {
    includesStr: ["AR", "NR", "GP", "PA", "MC", "SM", "MA", 'GP', 'PA', 'OT'],
    includesStr2: ["NR", "AR", "MC", "MA", "SM", 'GP', 'PA', 'OT'],
  };

  // testType에 따라 적절한 배열을 반환
  return (testType === '01' || testType === '04') ? arraysForSiteCd.includesStr : arraysForSiteCd.includesStr2;
};


const updatePercentages = async () => {

  const percent = dspWbcClassList.value.map((classList: any) => {
    return classList.map((category: any) => {
      const percentage = totalCount.value && totalCount.value !== '0'
          ? ((Number(category.count) / Number(totalCount.value)) * 100).toFixed(1)
          : '0';
      // 퍼센트를 정수와 비교해서 정수일 경우 정수만, 그렇지 않으면 소수점 한 자리까지 표시
      const formattedPercent = (Number(percentage) === Math.floor(Number(percentage)))
          ? Math.floor(Number(percentage)).toString()
          : percentage;

      return {
        ...category,
        percent: formattedPercent,
      };
    });
  });
  dspWbcClassList.value = percent;
};




const getCategoryName = (category: WbcInfo) => category?.name;
</script>
