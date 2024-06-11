<template>
  <div class="mt3">
    <h3 class="mb1 hh3title infoImageTitle">WBC Images</h3>
    <div v-if="allImages.length > 0" class="dbWbcImageContainer">
      <template v-for="imageSet in allImages" :key="imageSet.id">
        <img
            v-for="image in imageSet.images"
            :key="image.fileName"
            class="dbRightImages"
            :src="getImageUrl(image.fileName, imageSet.id, imageSet.title)"
            @error="hideImage(imageSet.id, image.fileName)"
            v-show="!hiddenImages[`${imageSet.id}-${image.fileName}`]"
        />
      </template>
    </div>
    <div v-else>No images available</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, watch } from 'vue';

const props = defineProps(['dbData', 'selectedItem']);
const pbiaRootPath = sessionStorage.getItem('pbiaRootPath');
const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';

const allImages = ref([]);
const hiddenImages = ref<{ [key: string]: boolean }>({});

onMounted(() => {
  allImages.value = [];
  createAllImages();
});

watch(() => props.selectedItem, () => {
  allImages.value = [];
  createAllImages();
},{deep: true});

function createAllImages(): void {
  if (!props.selectedItem?.wbcInfo) {
    return;
  }
  if (Object.keys(props.selectedItem?.wbcInfo).length === 0) {
    return;
  }
  allImages.value = props.selectedItem?.wbcInfo?.wbcInfo[0]?.reduce((acc: any, item: any) => {
    if (item.images && item.images.length > 0) {
      acc.push({
        id: item.id,
        images: item.images,
        title: item.title,
      });
    }
    return acc;
  }, []) || [];
}

function getImageUrl(imageName: any, id: string, title: string): string {
  const { selectedItem } = props;
  console.log(selectedItem?.rootPath)
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!selectedItem?.wbcInfo?.wbcInfo || selectedItem?.wbcInfo?.wbcInfo.length === 0) {
    return '';
  }

  const slotId = selectedItem.slotId || '';
  const path = selectedItem?.rootPath !== '' && selectedItem?.rootPath ? selectedItem?.rootPath : pbiaRootPath;
  const folderPath = `${path}/${slotId}/01_WBC_Classification/${id}_${title}`;
  return `${apiBaseUrl}/images/getImageRealTime?folder=${folderPath}&imageName=${imageName}`;
}

function hideImage(id: string, fileName: string) {
  hiddenImages.value[`${id}-${fileName}`] = true;
}
</script>

<style scoped>
.image-container {
  display: flex;
  flex-wrap: wrap;
  max-height: 348px;
  overflow: auto;
}

.image-container img {
  max-width: 100px;
  max-height: 100px;
  margin: 5px;
}
</style>
