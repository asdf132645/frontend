<template>
  <div class="mt3">
    <h3 class="mb1 hh3title infoImageTitle">BM Images</h3>
    <div v-if="allImages.length > 0" class="dbBmImageContainer">
      <template v-for="imageSet in allImages" :key="imageSet.id">
        <img v-for="image in imageSet.images" :key="image.fileName" class="dbBmImages" :src="getImageUrl(image.fileName, imageSet.id, imageSet.title)" />
      </template>
    </div>
    <div v-else>No images available</div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, ref, watch} from 'vue';
import {useStore} from "vuex";

const props = defineProps(['dbData', 'selectedItem']);
const store = useStore();
const pbiaRootPath = computed(() => store.state.commonModule.pbiaRootPath);
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';

const allImages = ref([]);

onMounted(() => {
  createAllImages();
});

watch(() => props.selectedItem, () => {
  createAllImages();
});

function createAllImages(): void {
  if(!props.selectedItem?.wbcInfo){
    return;
  }
  if(Object.keys(props.selectedItem?.wbcInfo).length === 0){
    return
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

function getImageUrl(imageName: any, id: string, title:string): string {
  const { selectedItem } = props;

  // 이미지 정보가 없다면 빈 문자열 반환
  if (!selectedItem?.wbcInfo?.wbcInfo || selectedItem?.wbcInfo?.wbcInfo.length === 0) {
    return '';
  }

  const slotId = selectedItem.slotId || '';
  const folderPath = `${pbiaRootPath.value}/${slotId}/04_BM_Classification/${id}_${title}`;
  return `${apiBaseUrl}/images?folder=${folderPath}&imageName=${imageName}`;
}
</script>
