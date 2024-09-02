<template>
  <div>
    <h3 class="titleText">Working View</h3>
    <div>
      <p :class="{'blinkColor': isBlinking}">{{ changeWqStatCd() }}</p>
      <p>{{ wbcCount }}</p>

      <div class="circular-progress-bar mt2">
        <svg class="progress-ring" width="120" height="120">
          <circle
              :cx="radius"
              :cy="radius"
              :r="radius - strokeWidth / 2"
              :stroke-width="strokeWidth"
              stroke="#ccc"
              fill="none"
          />
          <circle
              :cx="radius"
              :cy="radius"
              :r="radius - strokeWidth / 2"
              :stroke-width="strokeWidth"
              :stroke="progressColor"
              fill="none"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashoffset"
          />
        </svg>
        <p class="slideTime"> {{ timeDataGet.slideTime }} </p>
      </div>
      <p class="slideTime1 mt2">Total Time</p>
      <p> {{ timeDataGet.totalSlideTime }} </p>

    </div>
    <div class='slideCardWrap' v-if="pbVersion === '12a'">
      <!-- input -->
      <ul class='slideContent'>
        <li v-for="item in slideCardData.input" :key="item.slotNo"
            :class="getSlotStateClass(item.slotState,'input')"></li>
        <p class="mt1">INPUT</p>
      </ul>
      <!-- output -->
      <ul class='slideContent'>
        <li v-for="item in slideCardData.output" :key="item.slotNo"
            :class="getSlotStateClass(item.slotState,'output')"></li>
        <p class="mt1">OUTPUT</p>
      </ul>
    </div>
    <div class='slideCardWrap' v-else>
      <!-- input -->
      <ul class='slideContent pb100a'>
        <p>INPUT : {{ casExistChangeText(iCasExist) }}</p>
        <li v-for="item in [...slideCardData.input].reverse()" :key="item.slotNo"
            :class="getSlotStateClass(item.slotState,'input')"></li>
        <p class="mt1">OUTPUT : {{ casExistChangeText(oCasExist) }}</p>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, computed, defineProps, onBeforeMount} from 'vue';
import {useStore} from "vuex";
import {SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {EmbeddedStatusState} from "@/store/modules/embeddedStatusModule";
import {getCountToTime} from "@/common/lib/utils/dateUtils";
import {slideCard, slideCard100a} from "@/common/defines/constFile/analysis";

// 스토어
const store = useStore();
const runningInfoModule = computed(() => store.state.runningInfoModule);
const commonDataGet = computed(() => store.state.commonModule);
const initValData = computed(() => store.state.commonModule.initValData);
const timeDataGet = computed(() => store.state.timeModule);
const props = defineProps(['parsedData', 'pb100aCassette']);


// 스토어

const timeNum = ref(0);
const size = ref(120); // SVG 크기
const strokeWidth = ref(6); // 프로그레스 바 두께
const progressColor = ref('#00c2ff'); // 프로그레스 바 색상
const radius = ref(size.value / 2);
const circumference = ref(2 * Math.PI * (radius.value - strokeWidth.value / 2));
const dashoffset = ref(circumference.value);
const wbcCount = ref(0);// wbc 개수
const maxWbcCount = ref(0); // wbc 총합
const eqStatCd = ref('');
const slideTime = ref('');
const totalSlideTime = ref('');
let countingInterval: any = null;
let countingIntervalTotal: any = null;
const slideCardData = ref(slideCard);
let totalElapsedTimeCount = ref(0);
let elapsedTimeCount = ref(0);
const isBlinking = ref(false);
let interval: any = ref(null);
const isBm = ref(false);
const fixEqStatCd = ref(false);
const pbVersion = ref<any>('');
const iCasExist = ref<any>('0');
const oCasExist = ref<any>('0');

watch(() => store.state.embeddedStatusModule, (newData: EmbeddedStatusState) => {
  const sysInfo = newData.sysInfo;
  if (sysInfo.eqStatCd === '02') {
    fixEqStatCd.value = false;
  }

  if (!fixEqStatCd.value) {
    eqStatCd.value = newData.sysInfo.eqStatCd;
  }

  if (commonDataGet.value.isRunningState) {
    updateInputState(sysInfo.iCasStat, slideCardData.value.input);
    updateInputState(sysInfo.oCasStat, slideCardData.value.output);
  } else {
    stopTotalCounting();
    stopCounting();
  }

  const regex = /[1,2,9]/g;
  const dataICasStat = String(sysInfo?.iCasStat);
  if (String(sysInfo?.iCasStat) !== '999999999999') {
    if ((dataICasStat.search(regex) < 0) || sysInfo?.oCasStat === '111111111111') { // 끝났을 경우 체크하는 곳
      updateInputState(sysInfo.iCasStat, slideCardData.value.input);
      updateInputState(sysInfo.oCasStat, slideCardData.value.output);
    }
  }
}, {deep: true});

// 장비가 슬라이드 검사를 완료 할때 감시
watch([commonDataGet.value], async (newVals: any) => {
  const newValsObj = JSON.parse(JSON.stringify(newVals));

  if (!newValsObj[0].startEmbedded) {
    stopCounting();
  } else if (newValsObj[0].runningSlotId === '' && newValsObj[0].startEmbedded) {
    startTotalCounting();
  }


  if (!newValsObj[0].isRunningState) {
    stopTotalCounting();
    stopCounting();
    dashoffset.value = circumference.value;
  }
});


watch([runningInfoModule.value], (newSlot: SlotInfo[]) => {
  const slotArray = JSON.parse(JSON.stringify(newSlot))
  iCasExist.value = slotArray[0]?.runningInfo?.iCasExist;
  oCasExist.value = slotArray[0]?.runningInfo?.oCasExist;
  if (slotArray[0].changeSlideState?.changeSlide.value === 'start' && slotArray[0].slideBooleanState?.slideIs.value === true) {
    startCounting();
  } else if (slotArray[0].changeSlideState?.changeSlide.value === 'stop') {
    if (countingInterval !== null) {
      // stop일 경우 실행 중인 interval을 중지
      clearInterval(countingInterval);
      countingInterval = null;
    }
  }
  // afterChange
  if (slotArray[0].changeSlideState?.changeSlide.value === 'afterChange') {
    stopCounting();
    startCounting();
  }


  if (slotArray[0].runningInfo) {

    const currentSlot = slotArray[0].runningInfo.slotInfo;

    if (currentSlot && currentSlot?.stateCd === '03') {
      wbcCount.value = Number(currentSlot.wbcCount);
      maxWbcCount.value = Number(currentSlot.maxWbcCount);

      if (wbcCount.value > maxWbcCount.value) {
        wbcCount.value = maxWbcCount.value;
      }

      const percentage = (wbcCount.value / maxWbcCount.value) * 100;
      dashoffset.value = circumference.value * (1 - percentage / 100);
    }
  }
});


watch(() => eqStatCd.value, (newVal) => {
  if (newVal === '05') {
    interval.value = setInterval(() => {
      isBlinking.value = !isBlinking.value;
    }, 1000);

  } else {
    isBlinking.value = false;
    clearInterval(interval.value);
  }
})

watch(() => initValData.value, (newVal) => {
  if (newVal) {
    eqStatCd.value = '05';
  }
  fixEqStatCd.value = newVal;
})
watch(
    () => props.pb100aCassette,
    (newVal) => {
      if (newVal === 'reset') {
        stopTotalCounting();
        startTotalCounting();
        stopCounting();
      }
    },
    {deep: true}
);

onBeforeMount(() => {
  pbVersion.value = window.PB_VERSION;
  // slideCard100a
  slideCardData.value = pbVersion.value === '100a' ? slideCard100a : slideCard;
})

onMounted(() => {
  eqStatCd.value = '01';
  slideCardData.value.input.forEach(item => {
    item.slotState = '0';
  });

  slideCardData.value.output.forEach(item => {
    item.slotState = '0';
  });

  isBm.value = window.PROJECT_TYPE === 'bm';
});


const updateInputState = (source: string, target: any[]): void => {
  // 2는 진행중, 1은 있다. 3은 완료 iCasStat 기준
  target.forEach((item, index) => {
    item.slotState = source.charAt(index);
  });
}


const startCounting = (): void => {
  if (!countingInterval) {
    countingInterval = setInterval(() => {
      if (commonDataGet.value.isRunningState) {
        elapsedTimeCount.value += 1;
        timeNum.value = elapsedTimeCount.value % 60;
        sessionStorage.setItem('elapsedTimeCount', String(elapsedTimeCount.value));
        store.dispatch('timeModule/setTimeInfo', {slideTime: getCountToTime(elapsedTimeCount.value)});
      }
    }, 1000);
  }
};

onBeforeUnmount(() => {
  if (countingInterval) {
    clearInterval(countingInterval);
    countingInterval = null;
  }
  if (countingIntervalTotal) {
    clearInterval(countingIntervalTotal);
    countingIntervalTotal = null;
  }
});

const startTotalCounting = (): void => {
  if (!countingIntervalTotal) {
    countingIntervalTotal = setInterval(() => {
      if (commonDataGet.value.isRunningState) {
        totalElapsedTimeCount.value += 1;
        sessionStorage.setItem('totalElapsedTimeCount', String(totalElapsedTimeCount.value));
        store.dispatch('timeModule/setTimeInfo', {totalSlideTime: getCountToTime(totalElapsedTimeCount.value)});
      }
    }, 1000);
  }
};

const stopCounting = () => {
  clearInterval(countingInterval);
  countingInterval = null;
  elapsedTimeCount.value = 0;
  slideTime.value = getCountToTime(0);
  sessionStorage.removeItem('elapsedTimeCount');
  store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
};

const stopTotalCounting = (): void => {
  clearInterval(countingIntervalTotal);
  countingIntervalTotal = null;
  totalElapsedTimeCount.value = 0;
  totalSlideTime.value = getCountToTime(0);
  sessionStorage.removeItem('totalElapsedTimeCount');
  store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
};


const changeWqStatCd = (): string => {
  switch (eqStatCd.value) {
    case '01':
      return 'IDLE';
    case '02':
      return 'READY';
    case '03':
      return 'ERROR';
    case '04':
      return 'RUNNING';
    case '05':
      return 'INITIALIZATION';
    default:
      return 'UNKNOWN';
  }
}

const getSlotStateClass = (state: string, type: string): string => {
  // 각 상태에 따라 클래스명 반환
  if (type === 'input') {
    switch (state) {
      case '0':
        return 'class-for-state-0';
      case '1':
        return 'class-for-state-1';
      case '2':
        return 'class-for-state-2';
      case '3':
        return 'class-for-state-3';
      case '4':
        return 'class-for-state-4';
      default:
        return '';
    }
  } else {
    switch (state) {
      case '0':
        return 'out-for-state-0';
      case '1':
        return 'out-for-state-1';
      default:
        return 'outClassDefault';
    }
  }

}

const casExistChangeText = (val: string) => {
  switch (val) {
    case '0':
      return 'EMPTY';
    case '1':
      return 'EXIST';
    case '2':
      return 'FULL';
  }
}

</script>
