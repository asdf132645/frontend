<template>
  <div class="mt3">
    <h3 class="mb1 hh3title infoImageTitle">WBC Images</h3>
    <div v-if="allImages.length > 0" class="image-container">
      <template v-for="imageSet in allImages" :key="imageSet.id">
        <img v-for="image in imageSet.images" :key="image.fileName" :src="getImageUrl(image.fileName, imageSet.id, imageSet.title)" />
      </template>
    </div>
    <div v-else>No images available</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, watch } from 'vue';

const props = defineProps(['dbData', 'selectedItem']);
const pbiaRootPath = sessionStorage.getItem('pbiaRootPath');
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';

const allImages = ref([]);

onMounted(() => {
  createAllImages();
});

watch(() => props.selectedItem, () => {
  createAllImages();
});

function createAllImages(): void {
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

function getImageUrl(imageName: any, id: string, title:string): string {
  const { selectedItem } = props;

  // 이미지 정보가 없다면 빈 문자열 반환
  if (!selectedItem?.wbcInfo?.wbcInfo || selectedItem?.wbcInfo?.wbcInfo.length === 0) {
    return '';
  }

  const slotId = selectedItem.slotId || '';
  const folderPath = `${pbiaRootPath}/${slotId}/01_WBC_Classification/${id}_${title}`;
  return `${apiBaseUrl}/images?folder=${folderPath}&imageName=${imageName}`;
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
