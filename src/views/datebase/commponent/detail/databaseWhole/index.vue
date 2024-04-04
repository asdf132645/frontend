<template>
  <div>
    <div ref="imageContainer" class="image-container" >
      <TilingViewer />
      <!-- <img class="img"
           ref='imgRef'
           :src="getImageUrl()"
           :style="{ width: imageWidth + 'px', height: imageHeight + 'px' }"
           @wheel.prevent="zoomImage"
           @click="handleMouseClick"
           /> -->
      <div
          v-if="dragging"
          class="resize-overlay"
          :style="{ left: dragStartX + 'px', top: dragStartY + 'px', width: dragWidth + 'px', height: dragHeight + 'px' }"
          @dragover="handleDragOver"
          @drop="handleDrop">
        <div
            class="resize-handle top-left"
            draggable="true"
            @dragstart="handleDragStart"
            @drag="handleDragTopLeft"></div>
<!--        <div-->
<!--            class="resize-handle top-right"-->
<!--            draggable="true"-->
<!--            @dragstart="handleDragStart"-->
<!--            @drag="handleDragTopRight"></div>-->
<!--        <div-->
<!--            class="resize-handle bottom-left"-->
<!--            draggable="true"-->
<!--            @dragstart="handleDragStart"-->
<!--            @drag="handleDragBottomLeft"></div>-->
<!--        <div-->
<!--            class="resize-handle bottom-right"-->
<!--            draggable="true"-->
<!--            @dragstart="handleDragStart"-->
<!--            @drag="handleDragBottomRight"></div>-->
      </div>
      <button @click="zoomIn">Zoom In</button>
      <button @click="zoomOut">Zoom Out</button>
    </div>
    <LeftImgList/>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import LeftImgList from "@/views/datebase/commponent/detail/databaseWhole/leftImgList.vue";
import TilingViewer from './tilingViewer.vue';

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const store = useStore();
const pbiaRootPath = computed(() => store.state.commonModule.pbiaRootPath);
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';

const imgRef = ref<HTMLElement | null>(null); 
const imageContainer = ref<HTMLElement | null>(null);
const imageWidth = ref(700);
const imageHeight = ref(700);
const dragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragWidth = ref(150); // 초기 너비
const dragHeight = ref(150); // 초기 높이
const minDragWidth = 50; // 최소 너비
const minDragHeight = 50; // 최소 높이

const getImageUrl = () => {
  const slotId = selectItems.value?.slotId || "";
  const folderPath = `${sessionStorage.getItem('pbiaRootPath')}/${slotId}/01_Stitching_Image`;
  return `${apiBaseUrl}/images?folder=${folderPath}&imageName=PMC_Result.jpg`;
};

const zoomIn = () => {
  imageWidth.value += 10;
  imageHeight.value += 10;
};

const zoomOut = () => {
  imageWidth.value -= 10;
  imageHeight.value -= 10;
};

const zoomImage = (event: WheelEvent) => {
  if (event.deltaY < 0) {
    // Zoom In
    zoomIn();
  } else {
    // Zoom Out
    zoomOut();
  }
};

const handleMouseClick = (event: MouseEvent) => {
  dragging.value = true;
  if (imgRef.value) {
    const containerRect = imgRef.value.getBoundingClientRect();
    dragStartX.value = event.clientX - containerRect.left;
    dragStartY.value = event.clientY - containerRect.top;
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault(); // 드롭을 허용합니다.
};

const handleDragStart = (event: any) => {
  event.dataTransfer.setData("text/plain", ""); // 필수입니다.
};

const handleDrop = (event: DragEvent) => {
  const offsetX = event.clientX - dragStartX.value;
  const offsetY = event.clientY - dragStartY.value;
  dragWidth.value -= offsetX;
  dragHeight.value -= offsetY;

  // 최소 너비 및 높이 설정
  if (dragWidth.value < minDragWidth) {
    dragWidth.value = minDragWidth;
  }
  if (dragHeight.value < minDragHeight) {
    dragHeight.value = minDragHeight;
  }
};

const handleDragTopLeft = (event: DragEvent) => {
  if (imgRef.value) {
    const containerRect = imgRef.value.getBoundingClientRect();
    const offsetX = event.clientX - containerRect.left - dragStartX.value;
    const offsetY = event.clientY - containerRect.top - dragStartY.value;
    dragWidth.value -= offsetX;
    dragHeight.value -= offsetY;
    dragStartX.value = event.clientX - containerRect.left;
    dragStartY.value = event.clientY - containerRect.top;

    // 최소 너비 및 높이 설정
    if (dragWidth.value < minDragWidth) {
      dragWidth.value = minDragWidth;
    }
    if (dragHeight.value < minDragHeight) {
      dragHeight.value = minDragHeight;
    }
  }
};

const handleDragTopRight = (event: DragEvent) => {
  if (imgRef.value) {
    const containerRect = imgRef.value.getBoundingClientRect();
    const offsetX = (containerRect.right - event.clientX + dragStartX.value) / 2; // X축 이동 거리를 계산
    const offsetY = (event.clientY - containerRect.top - dragStartY.value) / 2; // Y축 이동 거리를 계산
    dragWidth.value += offsetX; // 너비 조절
    dragHeight.value -= offsetY; // 높이 조절
    dragStartY.value = event.clientY - containerRect.top; // 시작점 재설정

    // 최소 너비 및 높이 설정
    if (dragWidth.value < minDragWidth) {
      dragWidth.value = minDragWidth;
    }
    if (dragHeight.value < minDragHeight) {
      dragHeight.value = minDragHeight;
    }
  }
};

const handleDragBottomLeft = (event: DragEvent) => {
  if (imgRef.value) {
    const containerRect = imgRef.value.getBoundingClientRect();
    const offsetX = (event.clientX - containerRect.left - dragStartX.value) / 2; // X축 이동 거리를 계산
    const offsetY = (containerRect.bottom - event.clientY + dragStartY.value) / 2; // Y축 이동 거리를 계산
    dragWidth.value -= offsetX; // 너비 조절
    dragHeight.value += offsetY; // 높이 조절
    dragStartX.value = event.clientX - containerRect.left; // 시작점 재설정

    // 최소 너비 및 높이 설정
    if (dragWidth.value < minDragWidth) {
      dragWidth.value = minDragWidth;
    }
    if (dragHeight.value < minDragHeight) {
      dragHeight.value = minDragHeight;
    }
  }
};

const handleDragBottomRight = (event: DragEvent) => {
  console.log(event.clientX)
  if (imgRef.value) {
    const containerRect = imgRef.value.getBoundingClientRect();
    const offsetX = (event.clientX - containerRect.right + dragStartX.value); // X축 이동 거리를 계산
    const offsetY = (event.clientY - containerRect.bottom + dragStartY.value); // Y축 이동 거리를 계산
    dragWidth.value -= event.clientX; // 너비 조절
    dragHeight.value -= event.clientY; // 높이 조절

    // 최소 너비 및 높이 설정
    if (dragWidth.value < minDragWidth) {
      dragWidth.value = minDragWidth;
    }
    if (dragHeight.value < minDragHeight) {
      dragHeight.value = minDragHeight;
    }
  }
};



onMounted(() => {
  imgRef.value = document.querySelector('.img'); // Assign imgRef ref
  // imageContainer.value = document.querySelector('.image-container');
});
</script>

<style scoped>
.resize-overlay {
  position: absolute;
  border: 2px solid red;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: black;
}

.top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

.image-container {
  max-height: 700px;
  max-width: 700px;
  overflow: hidden;
  position: relative;
  width: 700px;
  height: 700px;
}

.img {
  position: relative;
  object-fit: cover;
}
</style>
