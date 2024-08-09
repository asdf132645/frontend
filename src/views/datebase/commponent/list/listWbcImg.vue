<template>
  <div class="mt1 listTableImageContainer">
    <h3 class="mb1 hh3title infoImageTitle">WBC Images</h3>
    <div v-if="allImages.length > 0" class="dbImageContainer">
      <template v-for="imageSet in allImages" :key="imageSet.id">
        <img
            v-for="image in imageSet.images"
            :key="image.fileName"
            class="dbRightImages"
            :class="['dbRightImages', {'selected-image': isSelectedImage(`${imageSet.id}-${image.fileName}`)}]"
            :src="getImageUrl(image.fileName, imageSet.id, imageSet.title)"
            @error="hideImage(imageSet.id, image.fileName)"
            v-show="!hiddenImages[`${imageSet.id}-${image.fileName}`]"
            @click="clickImage(`${imageSet.id}-${image.fileName}`)"
        />
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
const iaRootPath = ref<any>(store.state.commonModule.iaRootPath);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const apiBaseUrl = viewerCheck.value === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;

const allImages = ref([]);
const hiddenImages = ref<{ [key: string]: boolean }>({});
const selectedImage = ref('');

onMounted(() => {
  allImages.value = [];
  createAllImages();
});

watch(() => props.selectedItem, () => {
  allImages.value = [];
  createAllImages();
},{deep: true});


const clickImage = (selectImageText: string) => {
  if (selectedImage.value === selectImageText) {
    selectedImage.value = '';
  } else {
    selectedImage.value = selectImageText
  }
}

const isSelectedImage = (selectImageText: string) => {
  return selectedImage.value === selectImageText;
}

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
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!selectedItem?.wbcInfo?.wbcInfo || selectedItem?.wbcInfo?.wbcInfo.length === 0) {
    return '';
  }

  const slotId = selectedItem.slotId || '';
  const path = selectedItem?.img_drive_root_path !== '' && selectedItem?.img_drive_root_path ? selectedItem?.img_drive_root_path : iaRootPath.value;
  const folderPath = `${path}/${slotId}/01_WBC_Classification/${id}_${title}`;
  return `${apiBaseUrl}/images/getImageRealTime?folder=${folderPath}&imageName=${imageName}`;
}

function hideImage(id: string, fileName: string) {
  hiddenImages.value[`${id}-${fileName}`] = true;
}
</script>
