<template>
  <div class="mt2">
    <h3 class="titleText"><span class="greenColor">W</span>orking <span class="greenColor">V</span>iew </h3>
    <div>
      <p>{{ changeWqStatCd() }}</p>
      <p>{{ wbcCount }}</p>

      <div class="circular-progress-bar">
        <svg class="progress-ring" width="120" height="120">
          <circle
              class="progress-ring-circle"
              :class="{ 'completed': progress === 100, 'rotate-animation': isAnimationEnabled }"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashoffset"
              r="50"
              cx="60"
              cy="60"
              :stroke="progress === 100 ? 'green' : 'blue'"
              stroke-width="8"
          />
        </svg>
        <p class="slideTime"> {{ slideTime }} </p>
      </div>
      <p class="slideTime1">Number of WBCs</p>

    </div>
    <div class='slideCardWrap'>
      <!-- input -->
      <ul class='slideContent'>
        <li v-for="item in slideCardData.input" :key="item.slotNo" :class="getSlotStateClass(item.slotState,'input')"></li>
        <p class="mt1">INPUT</p>
      </ul>
      <!-- output -->
      <ul class='slideContent'>
        <li v-for="item in slideCardData.output" :key="item.slotNo" :class="getSlotStateClass(item.slotState,'output')"></li>
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


// 스토어

const progress = ref(0);
const timeNum = ref(0);
const radius = 50; // 반지름
const circumference = 2 * Math.PI * radius;
const dashoffset = ref(circumference);
const wbcCount = ref(0);
const progressMax = ref(0);
const eqStatCd = ref('');
const slideTime = ref('');
const time = ref('');
let countingInterval: number | null = null;
const isAnimationEnabled = ref(false);
const slideCardData = ref(slideCard);

const updateInputState = (source: string, target: any[]): void => {
  // 2는 진행중, 1은 있다. 3은 완료 iCasStat 기준
  target.forEach((item, index) => {
    item.slotState = source.charAt(index);
    // console.log(source)
  });
}

watch(() => store.state.embeddedStatusModule, (newData: EmbeddedStatusState) => {
  const sysInfo = newData.sysInfo;
  eqStatCd.value = newData.sysInfo.eqStatCd;
  if (commonDataGet.value.isRunningState) {
    updateInputState(sysInfo.iCasStat, slideCardData.value.input);
    updateInputState(sysInfo.oCasStat, slideCardData.value.output);
  }
  if(sysInfo.iCasStat === '300000000000'){ // 끝났을 경우 체크하는 곳
    updateInputState(sysInfo.iCasStat, slideCardData.value.input);
    updateInputState(sysInfo.oCasStat, slideCardData.value.output);
  }
}, { deep: true });


// 장비가 슬라이드 검사를 완료 할때 감시
watch([commonDataGet.value], async (newVals: any) => {
  const newValsObj = JSON.parse(JSON.stringify(newVals))
  if (!newValsObj[0].startEmbedded) { // 슬라이드 검사가 끝난 후
    if (countingInterval !== null) {
      clearInterval(countingInterval);
      countingInterval = null;
    }
    isAnimationEnabled.value = false;
    slideTime.value = getCountToTime(0);
    time.value = getCountToTime(0);
  }
  if (!newValsObj[0].isRunningState) {
    if (countingInterval !== null) {
      clearInterval(countingInterval);
      countingInterval = null;
    }
    isAnimationEnabled.value = false;
    slideTime.value = getCountToTime(0);
    time.value = getCountToTime(0);
  }
})


const startCounting = (): void => {
  if (countingInterval) {
    // 이미 실행 중인 interval이 있다면 중지
    clearInterval(countingInterval);
  }

  countingInterval = setInterval(() => {
    // 초를 1씩 증가
    timeNum.value = (timeNum.value + 1) % 60;
    // slideTime을 갱신
    slideTime.value = getCountToTime(timeNum.value);
  }, 1000);

  onBeforeUnmount(() => {
    if (countingInterval) {
      clearInterval(countingInterval);
    }
  });
};


watch([runningInfoModule.value], (newSlot: SlotInfo[]) => {
  const slotArray = JSON.parse(JSON.stringify(newSlot))

  if (slotArray[0].changeSlideState?.changeSlide.value === 'start') {
    startCounting();
    isAnimationEnabled.value = true;
  } else if (slotArray[0].changeSlideState?.changeSlide.value === 'stop') {
    if (countingInterval !== null) {
      // stop일 경우 실행 중인 interval을 중지
      clearInterval(countingInterval);
      countingInterval = null;
    }
    isAnimationEnabled.value = false;
  }


  if (slotArray[0].runningInfo) {

    const currentSlot = slotArray[0].runningInfo.slotInfo.find((item: any) => {
      return item.stateCd === '03';
    });

    if (currentSlot) {
      wbcCount.value = Number(currentSlot.wbcCount);
      progressMax.value = Number(currentSlot.maxWbcCount);

      if (wbcCount.value > progressMax.value) {
        wbcCount.value = progressMax.value;
      }

      const progressValue = ((wbcCount.value / progressMax.value) * 100).toFixed(2);
      dashoffset.value = circumference * (1 - parseFloat(progressValue) / 100);
    }
  }
});


onMounted(() => {
  slideCardData.value.input.forEach(item => {
    item.slotState = '0';
  });

  slideCardData.value.output.forEach(item => {
    item.slotState = '0';
  });


  const interval = setInterval(() => {
    progress.value = (progress.value + 1) % 101;
  }, 50);

  eqStatCd.value = '01';
  slideTime.value = getCountToTime(0);
  time.value = getCountToTime(0);

  onBeforeUnmount(() => {
    clearInterval(interval);
  });
});

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
  if(type === 'input'){
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
  }else{
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
