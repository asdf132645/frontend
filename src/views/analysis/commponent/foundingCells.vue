<template>
  <div class="mt1">
    <transition name="fade" mode="out-in">
      <div class="slider" v-if="images.length > 0">
        <img v-for="type in images" :key="type.id" :src="getImageUrl(type)" alt="Slide" />
      </div>
    </transition>
  </div>
</template>



<script setup lang="ts">
import {ref, watch, computed} from 'vue';
import { useStore } from 'vuex';
import { RunningInfo, SlotInfo } from '@/store/modules/testPageCommon/ruuningInfo';
import { getDateTimeStr } from '@/common/lib/utils/dateUtils';

const store = useStore();
const images = ref<RunningPathItem[]>([]);
const runningInfoModule = computed(() => store.state.runningInfoModule);


interface RunningPathItem {
  path: string;
  id: string;
}



watch([runningInfoModule.value], (newSlot: SlotInfo[]) => {
  const firstItem = JSON.parse(JSON.stringify(newSlot))
  const slotInfo = firstItem[0].runningInfo?.slotInfo;
  if (slotInfo) {
    let accumulatedRunningPath: any = {};

    slotInfo.forEach((item: any) => {
      if (item.stateCd === '03' && item.runningPath && item.runningPath.length > 0) {
        const runningPath: RunningPathItem[] = item.runningPath.map((pathItem: any) => ({
          ...pathItem,
          // path: pathItem.path + '?' + getDateTimeStr(),
          path: pathItem.path,
          id: generateUniqueId()
        }));

        accumulatedRunningPath = runningPath;
      }
    });

    if (accumulatedRunningPath.length > 0) {
      images.value.push(accumulatedRunningPath);
    }
  }
});

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getImageUrl(type: RunningPathItem | undefined): string {
  if (!type || !type.path) {
    return ''; // or any default value you prefer
  }

  const folderPath = encodeURIComponent(type.path.replace(/\/[^\/]+$/, ''));
  const imageName = encodeURIComponent(type.path.match(/\/([^\/]+)$/)?.[1] || '');
  return `http://localhost:3002/images?folder=${folderPath}&imageName=${imageName}`;
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
