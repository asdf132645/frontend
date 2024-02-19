<template>
  <div class="mt1">
    <transition name="fade" mode="out-in">
      <div :key="currentImageIndex" class="slider" v-if="images.length > 0">
        <img :src="images[currentImageIndex].path" alt="Slide" />
      </div>
    </transition>
    <button @click="prevSlide">prev</button>
    <button @click="nextSlide">next</button>
  </div>
</template>



<script setup lang="ts">
import {ref, watch, computed} from 'vue';
import { useStore } from 'vuex';
import { RunningInfo, SlotInfo } from '@/store/modules/testPageCommon/ruuningInfo';
import { getDateTimeStr } from '@/common/lib/utils/dateUtils';

const store = useStore();
const images = ref<RunningPathItem[]>([]);
const currentImageIndex = ref(0);
const runningInfoModule = computed(() => store.state.runningInfoModule);


interface RunningPathItem {
  path: string;
  id: string;
}

interface RunningInfoWithId extends RunningInfo {
  runningInfo: {
    slotInfo: {
      runningPath: RunningPathItem[];
    }[];
  };
}



watch([runningInfoModule.value], (newSlot: SlotInfo[]) => {
  // const firstItem = (runningInfoModule.value[0] as RunningInfoWithId)?.runningInfo;
  const firstItem = JSON.parse(JSON.stringify(newSlot))
  const slotInfo = firstItem[0].runningInfo?.slotInfo;
  if (slotInfo) {
    const accumulatedRunningPath: RunningPathItem[] = [];

    slotInfo.forEach((item: any) => {
      console.log(item.runningPath)
      if (item.stateCd === '03' && item.runningPath && item.runningPath.length > 0) {
        const runningPath: RunningPathItem[] = item.runningPath.map((pathItem: any) => ({
          ...pathItem,
          path: pathItem.path,
          id: generateUniqueId()
        }));

        accumulatedRunningPath.push(...runningPath);
      }
    });

    if (accumulatedRunningPath.length > 0) {
      images.value = accumulatedRunningPath;
      currentImageIndex.value = 0; // 초기 이미지 인덱스를 0으로 설정
    }
  }
});


function nextSlide() {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.value.length;
}

function prevSlide() {
  currentImageIndex.value = (currentImageIndex.value - 1 + images.value.length) % images.value.length;
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.slider {
  position: relative;
}
button {
  margin-top: 10px;
  cursor: pointer;
}
</style>
