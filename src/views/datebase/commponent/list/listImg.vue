<template>
  <div class="listTableImageContainer">
    <h3 class="mb10 hh3title infoImageTitle mt10">{{ projectName() }} Images</h3>
    <div v-if="allImages.length > 0" class="dbWBCImageContainer">
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
import {computed, defineProps, onBeforeMount, onMounted, ref, watch} from 'vue';
import {useStore} from 'vuex';
import {DIR_NAME} from "@/common/defines/constants/settings";

const props = defineProps(['dbData', 'selectedItem']);
const store = useStore();
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const apiBaseUrl = computed(() => viewerCheck.value === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL);
const allImages = ref([]);
const hiddenImages = ref<{ [key: string]: boolean }>({});
const projectType = ref('');
const selectedImage = ref('');

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

onMounted(() => {
  allImages.value = [];
  createAllImages();
});

watch(() => props.selectedItem, () => {
  allImages.value = [];
  createAllImages();
}, { deep: true });

const isSelectedImage = (selectImageText: string) => {
  return selectedImage.value === selectImageText;
}

const clickImage = (selectImageText: string) => {
  if (selectedImage.value === selectImageText) {
    selectedImage.value = '';
  } else {
    selectedImage.value = selectImageText
  }
}

function createAllImages(): void {
  if (!props.selectedItem?.wbcInfo) {
    return;
  }
  if (Object.keys(props.selectedItem?.wbcInfo).length === 0) {
    return;
  }

  allImages.value = props.selectedItem?.wbcInfo?.wbcInfo[0]?.reduce((acc: any, item: any) => {
    if (item.images?.length) {
      const uniqueImages = Array.from(new Map(item.images.map(img => [img.fileName, img])).values()); // 중복 제거

      acc.push({
        id: item.id,
        images: uniqueImages,
        title: item.title,
      });
    }
    return acc;
  }, []) || [];
}

function getImageUrl(imageName: any, id: string, title: string): string {
  const { selectedItem } = props;

  if (!selectedItem?.wbcInfo?.wbcInfo || selectedItem?.wbcInfo?.wbcInfo.length === 0) {
    return '';
  }

  const slotId = selectedItem.slotId || '';
  const path = selectedItem?.img_drive_root_path !== '' && selectedItem?.img_drive_root_path ? selectedItem?.img_drive_root_path : iaRootPath.value;
  if (projectType.value === 'pb') {
    const folderPath = `${path}/${slotId}/${DIR_NAME.WBC_CLASS}/${id}_${title}`;
    return `${apiBaseUrl.value}/images/getImageRealTime?folder=${folderPath}&imageName=${imageName}`;
  } else {
    const folderPath = `${path}/${slotId}/${DIR_NAME.BM_CLASS}/${id}_${title}`;
    return `${apiBaseUrl.value}/images?folder=${folderPath}&imageName=${imageName}`;
  }
}

function hideImage(id: string, fileName: string) {
  hiddenImages.value[`${id}-${fileName}`] = true;
}

const projectName = () => {
  return projectType.value === 'pb' ? 'WBC' : 'BM';
}
</script>
