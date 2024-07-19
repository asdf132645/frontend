<template>
  <div class="mt1">
    <transition name="fade" mode="out-in">
      <div class="slider-found" v-if="images.length > 0">
        <template v-for="type in images" :key="type.id">
          <img
              :src="getImageUrl(type)"
              v-if="getImageUrl(type)"
              alt="Slide"
          />
        </template>
      </div>
    </transition>
  </div>
</template>


<script setup lang="ts">
import {ref, watch, defineProps} from 'vue';
const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
const props = defineProps([ 'parsedData', 'pb100aCassette']);

const images = ref<RunningPathItem[]>([]);

watch(
    () => props.pb100aCassette,
    (newVal) => {
      if(newVal === 'reset'){
        images.value = [];
      }
    },
    { deep: true }
);
interface RunningPathItem {
  path: string;
  id: string;
}

watch(
    () => props.parsedData,
    (newVal, oldVal) => {
      const slotInfo = newVal?.slotInfo;
      if (slotInfo) {
        let accumulatedRunningPath: any = {};

        if (slotInfo.stateCd === '03' && slotInfo.runningPath && slotInfo.runningPath.length > 0) {
          const runningPath: RunningPathItem[] = slotInfo.runningPath.map((pathItem: any) => ({
            ...pathItem,
            // path: pathItem.path + '?' + getDateTimeStr(),
            path: pathItem.path,
            id: generateUniqueId()
          }));

          accumulatedRunningPath = runningPath;
        }

        if (accumulatedRunningPath.length > 0) {
          // 이미지 배열을 순회하며 중복 확인
          let isDuplicate = false;
          for (const image of accumulatedRunningPath) {
            if (!images.value.find(existingImage => existingImage.path === image.path)) {
              // 중복되지 않는 경우에만 이미지 배열에 추가
              images.value.unshift(image);
            } else {
              isDuplicate = true;
              break;
            }
          }
        }

      }
    },
    { deep: true }
);


function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getImageUrl(types: RunningPathItem[] | undefined): string[] {
  if (!types || types.length === 0) {
    return [];
  }

  // 이미지의 URL들을 담을 배열
  const imageUrls: string[] = [];

  // 각 이미지의 URL을 가져와서 배열에 추가
  const folderPath = types?.path.match(/^(.*\\)\d+_Real_Time\\/)?.[0];

  // 파일 경로에서 파일 이름 부분 추출
  const fileName = types?.path.match(/[^\\]*$/)[0];

  // 이미지의 URL 생성
  const imageUrl = `${apiBaseUrl}/images/getImageRealTime?folder=${folderPath}&imageName=${fileName}`;

  // URL이 `undefined`, 빈 문자열, 또는 `null`이 아닌 경우만 배열에 추가
  if (imageUrl) {
    imageUrls.unshift(imageUrl);
  }

  return imageUrls;
}
</script>
