<template>
  <div>
    <h3 class="titleText"><span class="greenColor">W</span>orking <span class="greenColor">V</span>iew </h3>
    <div>
      <p>{{ changeWqStatCd() }}</p>
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
      <p class="slideTime1 mt2">Number of WBCs</p>
      <p> {{ timeDataGet.totalSlideTime }} </p>

    </div>
    <div class='slideCardWrap'>
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
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, computed} from 'vue';
import {useStore} from "vuex";
import {SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {EmbeddedStatusState} from "@/store/modules/embeddedStatusModule";
import {getCountToTime} from "@/common/lib/utils/dateUtils";
import {slideCard} from "@/common/defines/constFile/analysis";

// 스토어
const store = useStore();
const runningInfoModule = computed(() => store.state.runningInfoModule);
const commonDataGet = computed(() => store.state.commonModule);
const timeDataGet = computed(() => store.state.timeModule);


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
let totalCountingStarted = false;


watch(() => store.state.embeddedStatusModule, (newData: EmbeddedStatusState) => {
  const sysInfo = newData.sysInfo;
  eqStatCd.value = newData.sysInfo.eqStatCd;
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

  if (!newValsObj[0].startEmbedded) { // 슬라이드 검사가 끝난 후
    stopCounting();
  } else {
    startTotalCounting();
  }

  if (!newValsObj[0].isRunningState) {
    stopTotalCounting();
    stopCounting();
  }
});


watch([runningInfoModule.value], (newSlot: SlotInfo[]) => {
  const slotArray = JSON.parse(JSON.stringify(newSlot))

  if (slotArray[0].changeSlideState?.changeSlide.value === 'start' && slotArray[0].slideBooleanState?.slideIs.value === true) {
    startCounting();
  } else if (slotArray[0].changeSlideState?.changeSlide.value === 'stop') {
    if (countingInterval !== null) {
      // stop일 경우 실행 중인 interval을 중지
      clearInterval(countingInterval);
      countingInterval = null;
    }
  }


  if (slotArray[0].runningInfo) {

    const currentSlot = slotArray[0].runningInfo.slotInfo.find((item: any) => {
      return item.stateCd === '03';
    });

    if (currentSlot) {
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


onMounted(() => {
  totalCountingStarted = false;
  eqStatCd.value = '01';
  slideCardData.value.input.forEach(item => {
    item.slotState = '0';
  });

  slideCardData.value.output.forEach(item => {
    item.slotState = '0';
  });

  const getItem = sessionStorage.getItem('totalElapsedTimeCount');
  totalElapsedTimeCount.value = getItem && !commonDataGet.value.isRunningState ? Number(getItem) : 0;

  const getTimeSlide = sessionStorage.getItem('elapsedTimeCount');
  elapsedTimeCount.value = getTimeSlide && !commonDataGet.value.isRunningState ? Number(getTimeSlide) : 0;
});

const updateInputState = (source: string, target: any[]): void => {
  // 2는 진행중, 1은 있다. 3은 완료 iCasStat 기준
  target.forEach((item, index) => {
    item.slotState = source.charAt(index);
  });
}


const startCounting = (): void => {
  if (countingInterval) {
    clearInterval(countingInterval);
  }

  elapsedTimeCount.value = 0;
  countingInterval = setInterval(() => {
    if (commonDataGet.value.isRunningState) {
      elapsedTimeCount.value += 1;
      timeNum.value = elapsedTimeCount.value % 60;
      sessionStorage.setItem('elapsedTimeCount', String(elapsedTimeCount.value));
      store.dispatch('timeModule/setTimeInfo', {slideTime: getCountToTime(elapsedTimeCount.value)});
    }
  }, 1000);

  onBeforeUnmount(() => {
    if (countingInterval) {
      clearInterval(countingInterval);
    }
  });
};

const startTotalCounting = (): void => {
  if (countingIntervalTotal) {
    clearInterval(countingIntervalTotal);
  }
  // totalElapsedTimeCount.value = 0;
  countingIntervalTotal = setInterval(() => {
    if (commonDataGet.value.isRunningState) {
      totalElapsedTimeCount.value += 1;
      sessionStorage.setItem('totalElapsedTimeCount', String(totalElapsedTimeCount.value));
      store.dispatch('timeModule/setTimeInfo', {totalSlideTime: getCountToTime(totalElapsedTimeCount.value)});
    }
  }, 1000);

  onBeforeUnmount(() => {
    if (countingIntervalTotal) {
      clearInterval(countingIntervalTotal);
    }
  });
};

const stopCounting = () => {
  if (countingInterval !== null) {
    clearInterval(countingInterval);
    countingInterval = null;
  }
  slideTime.value = getCountToTime(0);
  sessionStorage.removeItem('elapsedTimeCount');
  store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
  elapsedTimeCount.value = 0;
};

const stopTotalCounting = (): void => {
  if (countingIntervalTotal !== null) {
    clearInterval(countingIntervalTotal);
    countingIntervalTotal = null;
  }
  totalSlideTime.value = getCountToTime(0);
  sessionStorage.removeItem('totalElapsedTimeCount');
  store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
  totalElapsedTimeCount.value = 0;
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

</script>
