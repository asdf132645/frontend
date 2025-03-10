<template>
  <div>
    <h3 class="titleText">Working View</h3>
    <div>

      <div class="circular-progress-bar mt20">
        <svg class="progress-ring" width="140" height="140">
          <!-- Define Rotating Gradient -->
          <defs>

            <!-- Gradient for Progress Circle -->
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <template v-if="!embeddedStatusJobCmd.value?.userStop">
                <stop offset="0%" stop-color="#56ccf2"/>
                <stop offset="50%" stop-color="#35b0b6"/>
                <stop offset="100%" stop-color="#2f80ed"/>
              </template>
              <template v-else>
                <stop offset="100%" :stop-color="progressColor"/>
              </template>

              <!-- Rotate the gradient over time -->
              <animateTransform
                  attributeName="gradientTransform"
                  type="rotate"
                  from="0 0.5 0.5"
                  to="360 0.5 0.5"
                  dur="2s"
                  repeatCount="indefinite"
              />
            </linearGradient>

            <!-- Drop Shadow Filter -->
            <filter id="shadow">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="rgba(0, 0, 0, 0.3)"/>
            </filter>
          </defs>

          <circle
              :cx="radius"
              :cy="radius"
              :r="radius - strokeWidth / 2"
              :stroke-width="strokeWidth"
              stroke="#2e2e2e"
              fill="none"
          />
          <circle
              :cx="radius"
              :cy="radius"
              :r="radius - strokeWidth / 2"
              :stroke-width="strokeWidth"
              stroke="url(#gradient)"
              fill="none"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashoffset"
              filter="url(#shadow)"
          />
        </svg>
        <p :class="{'blinkColor': isBlinking,'renewalStateText': true}">{{ changeWqStatCd() }}</p>
        <div class="progress-bar-text-gauge">
          <div>{{ progressData.progressBarPercent }}</div>
          <span>%</span>
        </div>
      </div>


    </div>
    <GaugeBar :parsedDataSysInfo="parsedDataSysInfo"/>
    <div class='slideCardWrap' v-if="pbVersion === '12a'">
      <ul class='slideContent'>
        <li v-for="item in slideCardData.INPUT" :key="item.slotNo"
            :class="getSlotStateClass(item.slotState,'input')"></li>
        <p v-show="commonDataGet.isRunningState" class="mt10">INPUT</p>
      </ul>
      <ul class='slideContent'>
        <li v-for="item in slideCardData.OUTPUT" :key="item.slotNo"
            :class="getSlotStateClass(item.slotState,'output')"></li>
        <p v-show="commonDataGet.isRunningState" class="mt10">OUTPUT</p>
      </ul>
    </div>
    <div class='slideCardWrap' v-else>
      <ul class='slideContent pb100a'>
        <p v-show="commonDataGet.isRunningState">INPUT : {{ casExistChangeText(iCasExist) }}</p>
        <li v-for="item in [...slideCardData.INPUT].reverse()" :key="item.slotNo" :class="getSlotStateClass(item.slotState,'input')"></li>
        <p v-show="commonDataGet.isRunningState" class="mt10">OUTPUT : {{ casExistChangeText(oCasExist) }}</p>
      </ul>
    </div>
    <div class="lineRenewal"></div>
    <p class="renewal slideTime1">Processing Total Time</p>
    <p class="renewalTotalTime"> {{ timeDataGet.totalSlideTime }} </p>
    <div class="renewalSlideTime">
      <span>Slide Time</span>
      <p class="slideTime"> {{ timeDataGet.slideTime }} </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, computed, defineProps, onBeforeMount, reactive, nextTick} from 'vue';
import {useStore} from "vuex";
import {SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {EmbeddedStatusState} from "@/store/modules/embeddedStatusModule";
import {getCountToTime} from "@/common/lib/utils/dateUtils";
import {SLIDE_CARD_12A, SLIDE_CARD_100A} from "@/common/defines/constants/analysis";
import GaugeBar from "@/components/commonUi/GaugeBar.vue";

// 스토어
const store = useStore();
const runningInfoModule = computed(() => store.state.runningInfoModule);
const commonDataGet = computed(() => store.state.commonModule);
const initValData = computed(() => store.state.commonModule.initValData);
const timeDataGet = computed(() => store.state.timeModule);
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const props = defineProps(['parsedData', 'pb100aCassette', 'parsedDataSysInfo']);
const siteCd = computed(() => store.state.commonModule.siteCd);


// 스토어

const timeNum = ref(0);
const size = ref(140); // SVG 크기
const strokeWidth = ref(3); // 프로그레스 바 두께
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
const slideCardData = ref<any>({});
let totalElapsedTimeCount = ref(0);
let elapsedTimeCount = ref(0);
const isBlinking = ref(false);
let interval: any = ref(null);
const isBm = ref(false);
const fixEqStatCd = ref(false);
const pbVersion = ref<any>('');
const iCasExist = ref<any>('0');
const oCasExist = ref<any>('0');
const viewerType = ref('');
const progressData = reactive({
  progressBarText: '',
  progressBarPercent: 0,
});


watch(() => embeddedStatusJobCmd.value?.userStop, async (userStop) => {
  if (userStop) {
    await nextTick();
    progressColor.value = 'red';
    progressData.progressBarPercent = 0;
    const nnn = pbVersion.value === '100a' ? SLIDE_CARD_100A : SLIDE_CARD_12A;
    slideCardData.value = {
      INPUT: nnn.INPUT.map(item => ({ ...item, slotState: '0' })),
      OUTPUT: nnn.OUTPUT.map(item => ({ ...item, slotState: '0' }))
    };

    console.log('slideCardData', slideCardData.value)
  } else {
    progressColor.value = '#00c2ff';
  }
})

watch(() => store.state.embeddedStatusModule, (newData: EmbeddedStatusState) => {
  const sysInfo = newData.sysInfo;
  if (sysInfo.eqStatCd === '02') {
    fixEqStatCd.value = false;
  }

  if (!fixEqStatCd.value) {
    eqStatCd.value = newData.sysInfo.eqStatCd;
  }

  if (commonDataGet.value.isRunningState) {
    updateInputState(sysInfo.iCasStat, slideCardData.value.INPUT);
    updateInputState(sysInfo.oCasStat, slideCardData.value.OUTPUT);
  } else {
    dashoffset.value = circumference.value;
    stopTotalCounting();
    stopCounting();
  }

  const regex = /[1,2,9]/g;
  const dataICasStat = String(sysInfo?.iCasStat);
  if (String(sysInfo?.iCasStat) !== '999999999999') {
    if ((dataICasStat.search(regex) < 0) || sysInfo?.oCasStat === '111111111111') { // 끝났을 경우 체크하는 곳
      updateInputState(sysInfo.iCasStat, slideCardData.value.INPUT);
      updateInputState(sysInfo.oCasStat, slideCardData.value.OUTPUT);
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

watch(
    () => props.parsedDataSysInfo, // 감시할 데이터
    (newVal, oldVal) => {
      progressData.progressBarText = newVal.progressBarText || '';
      progressData.progressBarPercent = newVal.progressBarPercent || 0;
      dashoffset.value = calculateDashOffset(newVal.progressBarPercent);
      // 데이터 변경 시 실행할 코드
    },
    {deep: true}
);

watch([runningInfoModule.value], (newSlot: SlotInfo[]) => {
  const slotArray = JSON.parse(JSON.stringify(newSlot));
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
  if (slotArray[0].changeSlideState?.changeSlide.value === 'afterChange') {
    stopCounting();
    startCounting();
  }


  if (slotArray[0].runningInfo) {

    const currentSlot = slotArray[0].runningInfo.slotInfo;

    if (currentSlot && currentSlot?.stateCd === '03') {
      wbcCount.value = Number(currentSlot.wbcCount);
      maxWbcCount.value = window.PROJECT_TYPE === 'pb' ? Number(currentSlot.maxWbcCount) : Number(currentSlot.cellCount);
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
  viewerType.value = window.FORCE_VIEWER;
  pbVersion.value = window.MACHINE_VERSION;
  slideCardData.value = pbVersion.value === '100a'
      ? JSON.parse(JSON.stringify(SLIDE_CARD_100A))
      : JSON.parse(JSON.stringify(SLIDE_CARD_12A));

  if (viewerType.value === 'exhibition') {
    progressData.progressBarText = 'INITIALIZE';
    progressData.progressBarPercent = 0;
  }
})

onMounted(() => {
  eqStatCd.value = '01';
  slideCardData.value.INPUT.forEach(item => {
    item.slotState = '0';
  });

  slideCardData.value.OUTPUT.forEach(item => {
    item.slotState = '0';
  });

  isBm.value = window.PROJECT_TYPE === 'bm';
});

const calculateDashOffset = (percentage: number) => circumference.value * (1 - percentage / 100);

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
