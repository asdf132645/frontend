<template>
  <div class="mt2">
    <h3 class="titleText"><span class="greenColor">W</span>orking <span class="greenColor">V</span>iew </h3>
    <div>
      <p>IDLE</p>
      <div class="circular-progress-bar">
        <svg class="progress-ring" width="120" height="120">
          <circle
              class="progress-ring-circle"
              :class="{ 'completed': progress === 100 }"
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

// 스토어
const store = useStore();
const progress = ref(0);
const radius = 50; // 반지름
const circumference = 2 * Math.PI * radius;
const dashoffset = ref(circumference);
const wbcCount = ref(0);
const progressMax = ref(0);
const runningInfoModule = computed(() => store.state.runningInfoModule);


watch([runningInfoModule.value], (newSlot: SlotInfo[]) => {
  // Convert iterable to an array using spread operator
  const slotArray = JSON.parse(JSON.stringify(newSlot))


  console.log(slotArray[0].runningInfo.slotInfo);

  if (slotArray.length > 0) {
    console.log(slotArray);

    const currentSlot = slotArray[0].runningInfo.slotInfo.find((item: any) => {
      // return item.stateCd === '03';
      return item.stateCd === '02';
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

  onBeforeUnmount(() => {
    clearInterval(interval);
  });
});
</script>
