<template>
  <div class="mt3">
    <h3>WBC Images</h3>
    <div v-if="allImages.length > 0" class="image-container">
      <img v-for="image in allImages" :key="image.id" :src="getImageUrl(image.path)" alt="Image" />
    </div>
    <div v-else>No images available</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps(['dbData', 'selectedItem']);
const pbiaRootPath = sessionStorage.getItem('pbiaRootPath')

const allImages = props.dbData.reduce((acc: any, item: any) => {
  if (item.images && item.images.length > 0) {
    acc.push(...item.images);
  }
  return acc;
}, []);

function getImageUrl(imageName: any): string {
  const { selectedItem } = props;
  const slotId = selectedItem?.slotId || '';
  const slotNo = selectedItem?.slotNo || '';
  const title = selectedItem?.wbcInfo?.wbcInfo[0]?.title || '';

  const folderPath = `${pbiaRootPath}/${slotId}/01_WBC_Classification/${slotNo}_${title}`;
  return `http://localhost:3002/images?folder=${folderPath}&imageName=${imageName}`;
}


</script>

<style scoped>
.image-container {
  display: flex;
  flex-wrap: wrap;
}

.image-container img {
  max-width: 100px;
  max-height: 100px;
  margin: 5px;
}
</style>
