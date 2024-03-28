<template>
  <!--malaria-->
  <div
    data-draggable="target"
    @dragover.prevent="onDragOver()"
    @drop="onDrop('malaria', draggedItemIndex)"
    style="text-align: left; overflow: auto; height: 250px;"
  >
    <img
      v-for="(malaria, index) in malariaList"
      :key="index" 
      :src="malaria" 
      alt="malaria-images"
      class="item-image"
      draggable="true"
      @dragstart="onDragStart(index, malaria)"
    >
  </div>
  <!--no malaria-->
  <div>
    <div>No Malaria</div>
    <div
      data-draggable="target"
      @dragover.prevent="onDragOver()"
      @drop="onDrop('noMalaria', draggedItemIndex)"
      style="text-align: left; overflow: auto; height: 250px;"
      
    >
      <img
        v-for="(noMalaria, index) in noMalariaList"
        :key="index"
        :src="noMalaria"
        alt="nomalaria-images"  
        class="item-image"
        draggable="true"
        @dragstart="onDragStart(index, noMalaria)"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import {moveImgPost} from "@/common/api/service/dataBase/wbc/wbcApi";
import {dirName} from "@/common/defines/constFile/settings";

const props = defineProps(['selectItems']);
const pbiaRootPath = sessionStorage.getItem('pbiaRootPath') || dirName.pbiaRootPath;
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.115:3002';
const draggedItemIndex = ref();
const draggedImageUrl = ref('');
const malariaList = ref([]);
const noMalariaList = ref([]);
const selectedClickImages = ref([]);

onMounted(async () => {
  try {
    await getImageList(dirName.malariaDirName, malariaList);
    await getImageList(dirName.noMalariaDirName, noMalariaList);
  } catch (error) {
    console.error("이미지를 가져오는 도중 오류 발생: ", error);
  }
});

async function getImageList(folderName: string, list: any) {
  const slotId = props.selectItems.slotId || '';
  const folderPath = `${pbiaRootPath}/${slotId}/${dirName.rbcClassDirName}/${folderName}`;

  // const response = await axios.get(`${apiBaseUrl}/folders?folderPath=${folderPath}`);
  // list.value = response.data.map((image: any) => `${apiBaseUrl}/folders?folderPath=${folderPath}/${image}`);
  
  try {
    const response = await axios.get(`${apiBaseUrl}/folders?folderPath=${folderPath}`);
    list.value = response.data.map((image: any) => `${apiBaseUrl}/folders?folderPath=${folderPath}/${image}`);
  } catch (err) {
    console.log(err);
  }

}

function onDragStart(index: number, item: any) {
  draggedItemIndex.value = index;
  draggedImageUrl.value = item;
}

async function onDrop(droppedSection: string, index: number) {
  // section이 옮겨져도 draggedImageUrl은 그대로라 별 의미 없음.
  // const draggedSection = draggedImageUrl.value.includes(dirName.malariaDirName) ? 'malaria' : 'noMalaria';

  console.log('droppedSection')
  console.log(droppedSection)
  // console.log('draggedSection')
  // console.log(draggedSection)
  
  return await moveImage(droppedSection);

  // if (droppedSection !== draggedSection) {
  //   return await moveImage(droppedSection);
  // } else {
  //   return;
  // }
}

async function moveImage(section: string) {
  const slotId = props.selectItems.slotId || '';
  const path = `${pbiaRootPath}/${slotId}/${dirName.rbcClassDirName}`
  const sourceFolder = section === 'malaria' ? `${path}/${dirName.noMalariaDirName}` : `${path}/${dirName.malariaDirName}`;
  const destinationFolder = section === 'malaria' ? `${path}/${dirName.malariaDirName}` : `${path}/${dirName.noMalariaDirName}`;
  
  const arrangedImg = draggedImageUrl.value.split("/");
  const imageName = arrangedImg[arrangedImg.length - 1];

  const response = await moveImgPost(`sourceFolder=${sourceFolder}&destinationFolder=${destinationFolder}&imageName=${imageName}`);

  if (response) {
    if (section === 'malaria') {
      noMalariaList.value.splice(draggedItemIndex.value, 1);
      malariaList.value.push(draggedImageUrl.value);
    } else {
      malariaList.value.splice(draggedItemIndex.value, 1);
      noMalariaList.value.push(draggedImageUrl.value);
    }
  }
}

function onDragOver() {
  // 이 부분 없으면 드래그 동작 안 함
}


</script>

<style scoped>
  .item-image {
    width: 120px;
    margin-right: 10px;
  }
</style>