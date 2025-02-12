<template>
  <div class="listTableImageContainer">
    <h3 class="mb10 hh3title infoImageTitle mt10">WBC Images</h3>
    <div v-if="currntVue.length > 0" class="dbImageContainer">
      <template v-for="(image) in currntVue" :key="image.fileName">
        <img
            class="dbRightImages"
            :class="['dbRightImages', {'selected-image': isSelectedImage(`${image.id}-${image.fileName}`)}]"
            :src="getImageUrl(image.fileName, image.id, image.title)"
            @error="hideImage(image.id, image.fileName)"
            v-show="!hiddenImages[`${image.id}-${image.fileName}`]"
            @click="clickImage(`${image.id}-${image.fileName}`)"
        />
      </template>
      <div class="listWbcImg-pagination-controls">
        <button class="wbcListTableImg" @click="prevPage" :disabled="currentPage === 1">
          <font-awesome-icon :icon="['fas', 'caret-left']"/>
        </button>
        <span>{{ currentPage }} / {{ totalPages - 1 }}</span>
        <button class="wbcListTableImg" @click="nextPage" :disabled="currentPage === totalPages - 1">
          <font-awesome-icon :icon="['fas', 'caret-right']"/>
        </button>
      </div>
    </div>
    <div v-else>No images available</div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, ref, watch} from 'vue';
import {useStore} from "vuex";
import {DIR_NAME} from "@/common/defines/constants/settings";

const props = defineProps(['dbData', 'selectedItem']);
const store = useStore();
const iaRootPath = ref(store.state.commonModule.iaRootPath);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const apiBaseUrl = computed(() => viewerCheck.value === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL);

const allImages = ref<any>([]);
const hiddenImages = ref({});
const selectedImage = ref('');
const currentPage = ref(1);
const imagesPerPage = 8;
const currntVue = ref<any>([]);

const slotId = computed(() => props.selectedItem?.slotId || '');
const path = computed(() => props.selectedItem?.img_drive_root_path || iaRootPath.value);

const totalPages = computed(() => Math.ceil(allImages.value.length / imagesPerPage));

onMounted(() => {
  createAllImages();
});

watch(() => props.selectedItem, createAllImages, {deep: true});

function createAllImages() {
  if (!props.selectedItem?.wbcInfo || !props.selectedItem.wbcInfo.wbcInfo?.length) {
    allImages.value = [];
    return;
  }

  allImages.value = [];
  const images = props.selectedItem.wbcInfo.wbcInfo[0];
  allImages.value = extractImagesWithInfo(images);
  currntVue.value = groupImagesByPage(allImages.value)[0];

  currentPage.value = 1; // 첫 페이지로 초기화
}

function extractImagesWithInfo(wbcData) {
  if (!wbcData || !Array.isArray(wbcData)) return [];

  const fileNameSet = new Set();

  return wbcData.reduce((acc, { id, name, count, title, images }) => {
    images.forEach(image => {
      if (!fileNameSet.has(image.fileName)) {
        fileNameSet.add(image.fileName);
        acc.push({
          id,
          name,
          count,
          title,
          fileName: image.fileName,
          width: image.width,
          height: image.height,
          filter: image.filter,
          coordinates: image.coordinates
        });
      }
    });
    return acc;
  }, []);
}

const groupImagesByPage = (allImages: any, itemsPerPage = 8) => {
  return allImages.reduce((acc: any, item: any, index: any) => {
    const pageIndex = Math.floor(index / itemsPerPage);
    if (!acc[pageIndex]) acc[pageIndex] = [];

    acc[pageIndex].push({...item, currentPage: pageIndex + 1});

    return acc;
  }, []);
};


function getImageUrl(imageName: string, id: string, title: string): string {
  if (!slotId.value || !path.value) return '';
  const folderPath = `${path.value}/${slotId.value}/${DIR_NAME.WBC_CLASS}/${id}_${title}`;
  return `${apiBaseUrl.value}/images/getImageRealTime?folder=${folderPath}&imageName=${imageName}`;
}

function hideImage(id: string, fileName: string) {
  hiddenImages.value[`${id}-${fileName}`] = true;
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
  currntVue.value = groupImagesByPage(allImages.value)[currentPage.value];
};

const nextPage = () => {
  if (totalPages.value - 1 === currentPage.value) {
    return;
  }
  if (currentPage.value < totalPages.value) currentPage.value++;
  currntVue.value = groupImagesByPage(allImages.value)[currentPage.value];
};

const clickImage = (selectImageText: string) => {
  selectedImage.value = selectedImage.value === selectImageText ? '' : selectImageText;
};

const isSelectedImage = (selectImageText: string) => selectedImage.value === selectImageText;
</script>