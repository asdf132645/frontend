<template>
  <!-- malaria -->
  <div
    data-draggable="target"
    @dragover.prevent="onDragOver()"
    @drop="onDrop('malaria')"
    style="text-align: left; overflow: auto; height: 400px;"
  >
    <img
      v-for="(malaria, index) in malariaList"
      :key="'malaria-' + index" 
      :src="malaria" 
      alt="malaria-image"
      :class="{ 'item-image': true, 'selected': isSelected('malaria', index, malaria) }"
      draggable="true"
      @dragstart="onDragStart('malaria', index, malaria)"
      @click="selectImage('malaria', index, malaria, $event)"
    >
  </div>
  <!-- no malaria -->
  <div>
    <div class="no-malaria" style="text-align:left">No Malaria</div>
    <div
      data-draggable="target"
      @dragover.prevent="onDragOver()"
      @drop="onDrop('noMalaria')"
      style="text-align: left; overflow: auto; height: 400px;"
    >
      <img
        v-for="(noMalaria, index) in noMalariaList"
        :key="'noMalaria-' + index"
        :src="noMalaria"
        alt="noMalaria-image"  
        :class="{ 'item-image': true, 'selected': isSelected('noMalaria', index, noMalaria) }"
        draggable="true"
        @dragstart="onDragStart('noMalaria', index, noMalaria)"
        @click="selectImage('noMalaria', index, noMalaria, $event)"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import axios from "axios";
import { ref, onMounted } from "vue";
import { dirName } from "@/common/defines/constFile/settings";
import {moveImgPost} from "@/common/api/service/dataBase/wbc/wbcApi";

const props = defineProps(['selectItems']);
const pbiaRootPath = sessionStorage.getItem('pbiaRootPath') || dirName.pbiaRootPath;
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.115:3002';
const malariaList = ref([]);
const noMalariaList = ref([]);
const selectedClickImages = ref<{ section: string, index: number, imageName: string }[]>([]);
let shiftStartIndex = ref<number | null>(null);
let isCtrlPressed = ref(false);
let isShiftPressed = ref(false);

onMounted(async () => {
  await getImageList(dirName.malariaDirName, malariaList);
  await getImageList(dirName.noMalariaDirName, noMalariaList);
  document.body.addEventListener("click", handleBodyClick);
});

async function getImageList(folderName: string, list: []) {
  const slotId = props.selectItems.slotId || '';
  const folderPath = `${pbiaRootPath}/${slotId}/${dirName.rbcClassDirName}/${folderName}`;

  try {
    const response = await axios.get(`${apiBaseUrl}/folders?folderPath=${folderPath}`);
    list.value = response.data.map((image: string) => `${apiBaseUrl}/folders?folderPath=${folderPath}/${image}`);
  } catch (err) {
    console.error(err);
  }
}

function selectImage(section: string, index: number, imageName: string, event: MouseEvent) {
  const clickedImage = { section, index, imageName };

  isCtrlPressed.value = event.ctrlKey || event.metaKey;
  isShiftPressed.value = event.shiftKey;

  // if (isSelected(section, index, imageName)) {
  //   // 이미 선택된 이미지 또 클릭시 선택 해제
  //   selectedClickImages.value = selectedClickImages.value.filter(item => !(item.section === section && item.index === index));
  //   return;
  // }
  
  // 현재 클릭된 이미지의 영역과 이전에 선택된 이미지들의 영역을 확인
  const isSameSection = selectedClickImages.value.length > 0 && selectedClickImages.value[0].section === section;

  if (isShiftPressed.value && shiftStartIndex.value !== null) {
    const start = Math.min(shiftStartIndex.value, index);
    const end = Math.max(shiftStartIndex.value, index);
    selectedClickImages.value = [];
    for (let i = start; i <= end; i++) {
      selectedClickImages.value.push({ section, index: i, imageName });
    }
  } else {
    // isSameSection ? selectedClickImages.value.push(clickedImage) : selectedClickImages.value = [clickedImage];

    if (!isCtrlPressed.value) {
      selectedClickImages.value = [{ section, index, imageName }];
    } else {
      isSameSection ? selectedClickImages.value.push(clickedImage) : selectedClickImages.value = [clickedImage];
    }
  }
    shiftStartIndex.value = index;

  // console.log(selectedClickImages.value)
}

function isSelected(section: string, index: number, imageName: string): boolean {
  for (const item of selectedClickImages.value) {
    console.log(item.section === section && item.index === index && item.imageName === imageName)
    if (item.section === section && item.index === index && item.imageName === imageName) {
      return true;
    }
  }
  return false;
}

function handleBodyClick(event: Event) {
  const target = event.target as HTMLElement;
  
  if (!target.closest('.item-image')) {
    selectedClickImages.value = [];
  }
}

function onDragOver() {
  // 동작 안함
}

function onDragStart(section: string, index: number, item: any) {
  // selectImage(section, index, item, event);
}

async function onDrop(section: string) {
  const slotId = props.selectItems.slotId || '';
  const path = `${pbiaRootPath}/${slotId}/${dirName.rbcClassDirName}`;
  const sourceFolder = section === 'malaria' ? `${path}/${dirName.noMalariaDirName}` : `${path}/${dirName.malariaDirName}`;
  const destinationFolder = section === 'malaria' ? `${path}/${dirName.malariaDirName}` : `${path}/${dirName.noMalariaDirName}`;
 
  for (const image of selectedClickImages.value) {
    const imgNameArr = image.imageName.split("/");
    const imgName = imgNameArr[imgNameArr.length-1];
    
    try {
      const response = await moveImgPost(`sourceFolder=${sourceFolder}&destinationFolder=${destinationFolder}&imageName=${imgName}`);
      if (response) {
        const sourceList = section === 'malaria' ? noMalariaList : malariaList;
        const destinationList = section === 'malaria' ? malariaList : noMalariaList;

        sourceList.value.splice(image.index, 1);
        destinationList.value.push(image.imageName);
      }
    } 
    catch (error) {
      console.error(error);
    }
  }

  // 이미지 이동 후 선택된 이미지 초기화
  selectedClickImages.value = [];

}



</script>

<style scoped>
.item-image {
  cursor: pointer;
  width: 150px;
  margin: 5px;
}

.selected {
  border: 6px solid rgb(106, 153, 194);
}
</style>
