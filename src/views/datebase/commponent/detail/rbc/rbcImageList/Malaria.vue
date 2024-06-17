<template>
  <div v-if="imageExist">
    <!-- malaria -->
    <div>
      <div @drop="onDrop('malaria')" @dragover.prevent style="text-align: left; overflow: auto; height: 400px;">
        <img
          v-for="(malaria, index) in malariaList"
          :key="'malaria-' + index" 
          :src="malaria" 
          class="item-image"
          :class="{'selected': isSelected('malaria', malaria) }"
          alt="malaria-image"
          @click="handleClickImage('malaria', malaria, index, $event)"
          @dragstart="onDragStart('malaria', malaria, index)"
        >
      </div>
    </div>
    <!-- no malaria -->
    <div>
      <div class="no-malaria" style="text-align:left">No Malaria</div>
      <div @drop="onDrop('noMalaria')" @dragover.prevent style="text-align: left; overflow: auto; height: 400px;">
        <img
          v-for="(noMalaria, index) in noMalariaList"
          :key="'noMalaria-' + index"
          :src="noMalaria"
          class="item-image"
          :class="{'selected': isSelected('noMalaria', noMalaria) }"
          alt="noMalaria-image"  
          @click="handleClickImage('noMalaria', noMalaria, index, $event)"
          @dragstart="onDragStart('noMalaria', noMalaria, index)"
        >
      </div>
    </div>
  </div>
  <div v-else>
    <span>Malaria Images do not exist.</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import axios from "axios";
import { ref, onMounted } from "vue";
import { dirName } from "@/common/defines/constFile/settings";
import {moveImgPost} from "@/common/api/service/dataBase/wbc/wbcApi";

const props = defineProps(['selectItems']);
const iaRootPath = sessionStorage.getItem('iaRootPath') || dirName.iaRootPath;
const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.115:3002';
const malariaList = ref([]);
const noMalariaList = ref([]);
const selectedClickImages = ref<{ section: string, imgName: string, index: number }[]>([]);
let indexBeforePressingShift = ref<number | null>(null);
let draggedImages = ref<{ section: string, imgName: string, index: number }[]>([]);
const imageExist = ref(false);

onMounted(async () => {
  await getImageList(dirName.malariaDirName, malariaList);
  await getImageList(dirName.noMalariaDirName, noMalariaList);
  document.body.addEventListener("click", handleBodyClick);
});

async function getImageList(folderName: string, list: []) {
  const slotId = props.selectItems.slotId || '';
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath;
  const folderPath = `${path}/${slotId}/${dirName.rbcClassDirName}/${folderName}`;

  try {
    const response = await fetch(`${apiBaseUrl}/folders?folderPath=${folderPath}`);
    if (!response.ok) {
      imageExist.value = false;
      throw new Error('Network response was not ok');
    } else {
      const data = await response.json();
      list.value = data.map((image: string) => `${apiBaseUrl}/folders?folderPath=${folderPath}/${image}`);
      imageExist.value = true;
    }
  } catch (err) {
    console.error(err);
  }
}

function handleBodyClick(event: Event) {
  const target = event.target as HTMLElement;
  
  if (!target.closest('.item-image')) {
    selectedClickImages.value = [];
  }
}

function handleClickImage(section: string, imgName: string, index: number, event: MouseEvent) {
  const clickedImage = { section, imgName, index };

  if (selectedClickImages.value.length > 0 && selectedClickImages.value[selectedClickImages.value.length - 1].section !== section) {
    selectedClickImages.value = [clickedImage];
  } else {
    if (event.shiftKey && indexBeforePressingShift.value !== null) {

      const startIdx = Math.min(indexBeforePressingShift.value, index);
      const endIdx = Math.max(indexBeforePressingShift.value, index);

      for (let i = startIdx; i <= endIdx; i++) {
        const existingIndex = selectedClickImages.value.findIndex(item => item.index === i);
        if (existingIndex === -1) {
          selectedClickImages.value.push({ section, imgName: section === 'malaria' ? malariaList.value[i] : noMalariaList.value[i], index: i });
        }
      }
      
    } else if (event.ctrlKey && indexBeforePressingShift.value !== null) {
      selectedClickImages.value.push(clickedImage);
    } else {
      const existingIndex = selectedClickImages.value.findIndex(item => item.imgName === imgName);
      if (existingIndex !== -1) {
        selectedClickImages.value.splice(existingIndex, 1);
      } else {
        selectedClickImages.value = [clickedImage];
      }
    }
  }

  indexBeforePressingShift.value = index;
}

function isSelected(section: string, imgName: string): boolean {
  return selectedClickImages.value.some(selectedImage => selectedImage.imgName === imgName);
}


function onDragStart(section: string, imgName: string, index: number) {
  if (selectedClickImages.value.length > 0) {
    draggedImages.value = selectedClickImages.value;
  } else {
    draggedImages.value = [{ section, imgName, index }];
  }
}

function onDrop(targetSection: string) {
  for (const draggedImage of draggedImages.value) {
    if (targetSection !== draggedImage.section) {
      moveImage(targetSection, draggedImage.imgName);
    }
  }
}

async function moveImage(targetSection: string, imgName: string) {
  const slotId = props.selectItems.slotId || '';
  const pathNew = props.selectItems?.rootPath !== '' && props.selectItems?.rootPath ? props.selectItems?.rootPath : iaRootPath;

  const path = `${pathNew}/${slotId}/${dirName.rbcClassDirName}`
  const sourceFolder = targetSection === 'malaria' ? `${path}/${dirName.noMalariaDirName}` : `${path}/${dirName.malariaDirName}`;
  const destinationFolder = targetSection === 'malaria' ? `${path}/${dirName.malariaDirName}` : `${path}/${dirName.noMalariaDirName}`;

  const imgNameArr = imgName.split("/");
  const imageName = imgNameArr[imgNameArr.length-1];


  const response = await moveImgPost(`sourceFolder=${sourceFolder}&destinationFolder=${destinationFolder}&imageName=${imageName}`);
  
  if (response) {
    const index = targetSection === 'malaria' ? noMalariaList.value.findIndex(image => image === imgName) : malariaList.value.findIndex(image => image === imgName);
    if (targetSection === 'malaria') {
      noMalariaList.value.splice(index, 1);
      malariaList.value.push(imgName);
    } else {
      malariaList.value.splice(index, 1);
      noMalariaList.value.push(imgName);
    }
  }

  // 선택된 이미지 초기화
  selectedClickImages.value = [];
}

</script>
