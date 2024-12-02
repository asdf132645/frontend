<template>
  <div class="IsWbcImageSelect">
    <div class="pos-relative">
      <h1 class="wbcImageSelect-title">WBC images</h1>
<!--      <input-->
<!--          type="checkbox"-->
<!--          id="selectAll"-->
<!--          v-model="isAllChecked"-->
<!--          @change="toggleSelectAll"-->
<!--          style="width: fit-content"-->
<!--      />-->
<!--      <label for="selectAll">All Check / Uncheck</label>-->
      <ul>
        <li v-for="(item) in selectItems?.wbcInfoAfter" :key="item.id">
          <div v-if="item?.count !== '0' && item?.count !== 0">
            <p class="mt10" style="margin-left: 4px;">
              {{ item?.title }} <span class="smallName">({{ item.name }})</span>
            </p>
            <template v-for="(image, idx) in item.images" :key="idx">
              <img :src="getImageUrl(image.fileName, item.id, item.title, '')"
                   @click="toggleImageSelection(image, item)"
                   :class="{ selected: isImageSelected(image, item) }"
                   class="cursorPointer"
              />
            </template>
          </div>
        </li>
      </ul>
    </div>
    <div class="fixedWbcBottom">
      <button class="crcBtn crcBtnWithBg" @click="confirmSelection">Save</button>
      <button class="crcBtn crcBtnWithBg" @click="closeWbcSelectChild">Close</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, defineProps, onBeforeMount, onMounted, ref} from "vue";
import {useStore} from "vuex";

const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const projectType = ref<any>('');
const store = useStore();
const apiBaseUrl = sessionStorage.getItem('viewerCheck') === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;

const props = defineProps(['selectItems']);
const emit = defineEmits(['closeWbcSelect', 'selectWbcImgSend']);
const selectedImages = ref<string[]>([]);
const isAllChecked = ref(false);


onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

const closeWbcSelectChild = () => {
  emit('closeWbcSelect')
}
const toggleImageSelection = (image: any, item: any) => {
  if (isImageSelected(image, item)) {
    selectedImages.value = selectedImages.value.filter(
        (selected) => selected.image !== image || selected.item !== item
    );
  } else {
    selectedImages.value.push({image, item});
  }
};


const isImageSelected = (image: any, item: any) => {
  return selectedImages.value.some(
      (selected) => selected.image === image && selected.item === item
  );
};


const toggleSelectAll = () => {
  if (isAllChecked.value) {
    // 모든 이미지 선택
    selectedImages.value = [];
    props.selectItems?.wbcInfoAfter.forEach((item: any) => {
      item.images.forEach((image: any) => {
        selectedImages.value.push({image, item});
      });
    });
  } else {
    // 선택 초기화
    selectedImages.value = [];
  }
};


const confirmSelection = () => {
  emit('selectWbcImgSend', selectedImages.value);
};

function getImageUrl(imageName: any, id: string, title: string, highImg: string, findAfterArr?: boolean): string {
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!props.selectItems?.wbcInfoAfter || props.selectItems?.wbcInfoAfter.length === 0) {
    return "";
  }
  const slotId = props.selectItems.slotId || '';
  const folderPath = `${pbiaRootDir.value}/${slotId}/${projectTypeReturn(projectType.value)}/${id}_${title}`;
  let url = '';

  // 타임스탬프 추가

  if (highImg === 'getImageRealTime' || projectType.value === 'pb') {
    url = `${apiBaseUrl}/images/getImageRealTime?folder=${folderPath}&imageName=${imageName}`;
  } else {
    url = `${apiBaseUrl}/images?folder=${folderPath}&imageName=${imageName}`;
  }


  return url;
}

const projectTypeReturn = (type: string): any => {
  if (type === 'bm') {
    return '04_BM_Classification';
  } else if (type === 'pb') {
    return '01_WBC_Classification';
  }
}
</script>