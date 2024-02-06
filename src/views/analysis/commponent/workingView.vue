<template>
  <div class="mt2">
    <h3 class="titleText"><span class="greenColor">W</span>orking <span class="greenColor">V</span>iew </h3>
    <div>
      <p>{{ changeWqStatCd() }}</p>
      <p>{{ wbcCount }}</p>
      <p>Number of WBCs</p>
      <p> {{ slideTime }} </p>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, computed} from 'vue';
import { useStore } from "vuex";
import {SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {EmbeddedStatusState} from "@/store/modules/embeddedStatusModule";
import {getCountToTime} from "@/common/lib/utils/dateUtils";

// 스토어
const store = useStore();
const runningInfoModule = computed(() => store.state.runningInfoModule);
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
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

watch(() => store.state.embeddedStatusModule, (newData: EmbeddedStatusState) => {
  eqStatCd.value = newData.sysInfo.eqStatCd;
},{deep: true});

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
      // return item.stateCd === '02';
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


</script>
