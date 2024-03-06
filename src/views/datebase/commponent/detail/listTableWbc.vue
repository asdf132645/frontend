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
    <div v-for="(item, idx) in wbcInfo" :key="item.id" class="wbcClassDbDiv">
      <div v-if="idx === 0">
        <p>Class</p>
        <p>Count</p>
        <p>%</p>
      </div>
      <div class="circle">
        <p>{{ item?.name }}</p>
        <p>{{ item?.count }}</p>
        <p> {{ item?.percent }} </p>
      </div>
    </div>
    <template v-for="(nWbcItem, outerIndex) in selectItems.wbcInfo.nonRbcClassList" :key="outerIndex">
      <div class="categories">
        <ul class="categoryNm">
          <li class="mb1 liTitle" v-if="outerIndex === 0">non-WBC</li>
          <li>{{ getCategoryName(nWbcItem) }}</li>
        </ul>
        <ul class="classNm">
          <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
          <li>{{ nWbcItem?.count }} <span v-if="nWbcItem.title === 'NR' || nWbcItem.title === 'GP'"> / {{ selectItems?.wbcInfo?.maxWbcCount }} WBC</span></li>
        </ul>
        <ul class="degree">
          <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
          <li>-</li>
        </ul>
      </div>
    </template>
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
                  @dragover.prevent="onDragOver()"
                  @dragstart="onDragStart(Number(itemIndex), Number(imageIndex))"
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
import {moveImgPost} from "@/common/api/service/dataBase/wbc/wbcApi";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {WbcInfo} from "@/store/modules/analysis/wbcclassification";

const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const wbcInfo = ref<any>(null);

const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const pbiaRootPath = sessionStorage.getItem("pbiaRootPath");

const userId = ref('');
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');

const draggedItemIndex = ref<any>(null);
const draggedImageIndex = ref<any>(null);

onMounted(() => {
  userId.value = getStoredUser.id;
  wbcInfo.value = selectItemWbc ? JSON.parse(selectItemWbc) : null;
  if(selectItems.value.wbcInfoAfter && selectItems.value.wbcInfoAfter.length !== 0){
    wbcInfo.value = selectItems.value.wbcInfoAfter;
  }else{
    wbcInfo.value = selectItems.value.wbcInfo.wbcInfo[0]
  }

});


function onDragOver (){
  //
}

function onDragStart(itemIndex: number, imageIndex: number) {
  // 드래그 시작 시 인덱스 저장
  draggedItemIndex.value = itemIndex;
  draggedImageIndex.value = imageIndex;
}


function onDrop(targetItemIndex: number) {
  //targetItemIndex -> 옮겨져야하는 index
  if ((draggedItemIndex.value !== null && draggedImageIndex.value !== null) && (draggedItemIndex.value !== targetItemIndex)) {
    const draggedItem = wbcInfo.value[draggedItemIndex.value];
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
    moveImage(targetItemIndex, draggedImage.fileName, draggedItem, wbcInfo.value[targetItemIndex]);


    // 드래그 인덱스 초기화
    draggedItemIndex.value = null;
    draggedImageIndex.value = null;
  }
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

async function moveImage(targetItemIndex: number, fileName: string, draggedItem: any, targetItem: any) {
  // sourceFolder -> 원본 폴더 , destinationFolder -> 대상 폴더
  const sourceFolder = `${pbiaRootPath}/${selectItems.value?.slotId}/01_WBC_Classification/${draggedItem.id}_${draggedItem.title}`;
  const destinationFolder = `${pbiaRootPath}/${selectItems.value?.slotId}/01_WBC_Classification/${targetItem.id}_${targetItem.title}`;

  try {
    const response = await moveImgPost(`sourceFolder=${sourceFolder}&destinationFolder=${destinationFolder}&imageName=${fileName}`)
    if (response) {
      await updateOriginalDb();
      await updateRunningApi({userId: Number(userId.value), runingInfoDtoItems: originalDb.value});
    } else {
      console.error('실패함 움직이기');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
async function updateOriginalDb() {
  selectItems.value.wbcInfoAfter = wbcInfo.value;
  sessionStorage.setItem("selectItems", JSON.stringify(selectItems.value));
  sessionStorage.setItem("selectItemWbc", JSON.stringify(wbcInfo.value));

  const filteredItems = originalDb.value.filter((item: any) => item.id === selectItems.value.id);
  // 필터링된 항목이 존재하면 wbcInfoAfter 업데이트
  if (filteredItems.length > 0) {
    filteredItems.forEach((filteredItem:any) => {
      filteredItem.wbcInfoAfter = wbcInfo.value;
    });
  }
  originalDb.value = filteredItems;
}

const getCategoryName = (category: WbcInfo) => category?.name;



</script>
