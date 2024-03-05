<template>
  <div class="databaseWbcRight">
    <img :src="getBarcodeImageUrl('barcode_image.jpg')"/>
    <h3>WBC Classification</h3>
    <div>
      <ul>
        <li>
          <font-awesome-icon :icon="['fas', 'comment-dots']"/>
        </li>
        <li>
          <font-awesome-icon :icon="['fas', 'square-check']"/>
        </li>
        <li>
          <font-awesome-icon :icon="['fas', 'upload']"/>
        </li>
      </ul>
      <p>
        <font-awesome-icon :icon="['fas', 'lock']"/>
        <font-awesome-icon :icon="['fas', 'lock-open']"/>
      </p>
    </div>
  </div>
  <div class="databaseWbcLeft">
    <div>
      <button type="button">Cell marking</button>
    </div>
    <div>
      <font-awesome-icon :icon="['fas', 'plus-minus']"/>
      <font-awesome-icon :icon="['fas', 'sun']"/>
      <font-awesome-icon :icon="['fas', 'palette']"/>
      <font-awesome-icon :icon="['fas', 'file-excel']"/>
    </div>
    <div>
      <ul class="wbcInfoDbUl">
        <!--        {{ wbcInfo }}-->
        <li v-for="item in wbcInfo" :key="item.id">
          <div class="circle">
            <p>{{ item.title }}</p>
            <p>{{ item.count }}</p>
          </div>
        </li>
      </ul>
      <ul>
        <li v-for="(item, itemIndex) in wbcInfo" :key="item.id">
          <div>
            <p>{{ item.title }}</p>
            <p>{{ item.count }}</p>
          </div>
          <ul class="wbcImgWrap">
            <li v-for="(image, imageIndex) in item.images" :key="image.fileName"
                :class="{ 'border-changed': image.changed }">
              <img
                  :src="getImageUrl(image.fileName, item.id, item.title)"
                  :alt="image.fileName"
                  @dragstart="onDragStart(Number(itemIndex), Number(imageIndex))"
                  @dragover.prevent="onDragOver(Number(itemIndex))"
                  @drop="onDrop(Number(itemIndex))"
                  draggable="true"
              />
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {barcodeImgDir} from "@/common/defines/constFile/settings";

const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const wbcInfo = ref<any>(null);

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const pbiaRootPath = sessionStorage.getItem("pbiaRootPath");

onMounted(() => {
  wbcInfo.value = selectItemWbc ? JSON.parse(selectItemWbc) : null;
});
const draggedItemIndex = ref<any>(null);
const draggedImageIndex = ref<any>(null);


function onDragStart(itemIndex: number, imageIndex: number) {
  // 드래그 시작 시 인덱스 저장
  draggedItemIndex.value = itemIndex;
  draggedImageIndex.value = imageIndex;
}


function onDrop(targetItemIndex: number) {
  //targetItemIndex -> 옮겨져야하는 index
  if ((draggedItemIndex.value !== null && draggedImageIndex.value !== null) && (draggedItemIndex.value !== targetItemIndex)) {
    const draggedItem = wbcInfo.value[draggedItemIndex.value]; // 옮기는 기존 배열
    const draggedImage = draggedItem.images[draggedImageIndex.value]; // 드래그 후 옮기는 이미지

    // 드래그된 이미지를 원래 위치에서 제거
    draggedItem.images.splice(draggedImageIndex.value, 1);

    // 변경되면 테두리 표시
    draggedImage.changed = true;

    // 드롭된 위치에 이미지를 삽입
    wbcInfo.value[targetItemIndex].images.push(draggedImage);


    // Count 업데이트

    const newCount = parseInt(wbcInfo.value[targetItemIndex].count) + 1;
    wbcInfo.value[targetItemIndex].count = newCount.toString();

    // 이미지 이동 함수 호출
    moveImage(targetItemIndex);


    // 드래그 인덱스 초기화
    draggedItemIndex.value = null;
    draggedImageIndex.value = null;
  }
}

function onDragOver(targetItemIndex: number) {
  //
}


function getImageUrl(imageName: any, id: string, title: string): string {
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!wbcInfo.value || wbcInfo.value.length === 0) {
    return "";
  }

  const slotId = selectItems.value?.slotId || "";
  const folderPath = `${pbiaRootPath}/${slotId}/01_WBC_Classification/${id}_${title}`;
  return `http://localhost:3002/images?folder=${folderPath}&imageName=${imageName}`;
}

function getBarcodeImageUrl(imageName: string): string {
  return `http://localhost:3002/images?folder=${pbiaRootPath + "/" + selectItems.value.slotId + "/" + barcodeImgDir.barcodeDirName + "/"}&imageName=${imageName}`;
}

async function moveImage(targetItemIndex: number) {
  // sourceFolder -> 원본 폴더 , destinationFolder -> 대상 폴더
  const sourceFolder = `${pbiaRootPath}/${selectItems.value?.slotId}/01_WBC_Classification/${draggedItemIndex.value + 1}_${wbcInfo.value[draggedItemIndex.value].title}`;
  const destinationFolder = `${pbiaRootPath}/${selectItems.value?.slotId}/01_WBC_Classification/${targetItemIndex + 1}_${wbcInfo.value[targetItemIndex].title}`;
  const imageName = wbcInfo.value[draggedItemIndex.value].images[draggedImageIndex.value].fileName;

  try {
    const response = await fetch(`http://localhost:3002/images/move?sourceFolder=${sourceFolder}&destinationFolder=${destinationFolder}&imageName=${imageName}`, {
      method: 'POST',
    });

    if (response.ok) {
      console.log('이미지 움직이기 성공');
      onMounted();
    } else {
      console.error('실패함 움직이기:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}



</script>
