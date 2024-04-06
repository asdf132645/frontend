<template>
  <div class="wbcMenu">
    <ul>
      <li class="onRight" @click="pageGo('/databaseWhole')">WHOLE</li>
      <li @click="pageGo('/databaseBm')">BMCELL</li>
      <!--      <li @click="pageGo('/report')">REPORT</li>-->
      <li>LIS-CBC</li>
    </ul>
    <div class="wbcMenuBottom">
      <button @click="moveWbc('up')">
        <font-awesome-icon :icon="['fas', 'circle-up']"/>
      </button>
      <button @click="moveWbc('down')">
        <font-awesome-icon :icon="['fas', 'circle-down']"/>
      </button>
    </div>
  </div>
  <div class="imgContent">
    <div class="wrap-whole">
      <div ref="imageContainer" class="image-container">
        <TilingViewer/>
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
              @drag="handleDragTopLeft">
          </div>
        </div>
      </div>
      <div class="leftWhole">
        <LeftImgList/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, onMounted} from "vue";
import {useStore} from "vuex";
import LeftImgList from "@/views/datebase/commponent/detail/databaseWhole/leftImgList.vue";
import TilingViewer from './tilingViewer.vue';
import router from "@/router";

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const store = useStore();
const pbiaRootPath = computed(() => store.state.commonModule.pbiaRootPath);
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';
const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const wbcInfo = ref<any>(null);
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const clickid = ref(sessionStorage.getItem('dbBaseTrClickId'));


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

const pageGo = (path: string) => {
  router.push(path)
}

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

const moveWbc = async (direction: any) => {
  const currentDbIndex = originalDb.value.findIndex((item: any) => item.id === selectItems.value.id);
  const nextDbIndex = direction === 'up' ? currentDbIndex - 1 : currentDbIndex + 1;

  if (nextDbIndex >= 0 && nextDbIndex < originalDb.value.length) {
    selectItems.value = originalDb.value[nextDbIndex];
    sessionStorage.setItem('selectItems', JSON.stringify(originalDb.value[nextDbIndex]));
    sessionStorage.setItem('selectItemWbc', JSON.stringify(originalDb.value[nextDbIndex].wbcInfo.wbcInfo));
    sessionStorage.setItem('dbBaseTrClickId', String(Number(clickid.value) + (direction === 'up' ? -1 : 1)));
    clickid.value = String(Number(clickid.value) + (direction === 'up' ? -1 : 1));
    await updateUpDown(originalDb.value[nextDbIndex].wbcInfo.wbcInfo[0], originalDb.value[nextDbIndex]);
  }
}

const updateUpDown = async (selectWbc: any, selectItemsNewVal: any) => {
  wbcInfo.value = selectItemsNewVal.wbcInfoAfter && selectItemsNewVal.wbcInfoAfter.length !== 0
      ? selectItemsNewVal.wbcInfoAfter
      : selectItemsNewVal.wbcInfo.wbcInfo[0];
  await initData('');
};

async function initData(newData: any) {
  wbcInfo.value = selectItemWbc ? JSON.parse(selectItemWbc) : null;
  if (selectItems.value.wbcInfoAfter && selectItems.value.wbcInfoAfter.length !== 0) {
    wbcInfo.value = selectItems.value.wbcInfoAfter;
    selectItems.value.wbcInfo.wbcInfo[0].forEach((item: any) => {
      const title = item.title;
      const correspondingItem = selectItems.value.wbcInfoAfter.find((afterItem: any) => afterItem.title === title);
      if (correspondingItem) {
        correspondingItem.images.forEach((item: any) => {
          item.title = title;

        })
      }
    });
  } else {
    wbcInfo.value = selectItems.value.wbcInfo.wbcInfo[0];
    selectItems.value.wbcInfo.wbcInfo[0].forEach((item: any) => {
      if (item.images) {
        item.images.forEach((itemImg: any) => {
          itemImg.title = item.title;
        })
      }
    });
  }
  if (newData !== '') {
    selectItems.value.wbcInfo.wbcInfo[0] = selectItems.value.wbcInfo.wbcInfo[0].filter((item: any) => {
      return !newData.find((dataItem: any) => dataItem.customNum === item.id && dataItem.abbreviation === "");
    });
  }
}


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
  overflow: hidden;
  position: relative;
  width: 40%;
  height: 100vh;
}

.img {
  position: relative;
  object-fit: cover;
}
</style>
