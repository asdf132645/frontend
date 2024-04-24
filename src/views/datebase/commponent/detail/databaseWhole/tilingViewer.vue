<template>
  <img :src="hideImage" ref="hideImageRef" style="display: none" @load="onImageLoad" />
    <div>
      <div ref="tilingViewerLayer" id="tiling-viewer" ></div>
    </div>
</template>

<script setup lang="ts">

import {defineProps, onMounted, ref, watch, computed, nextTick} from 'vue';
import OpenSeadragon from 'openseadragon';
import { useStore } from "vuex";

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const props = defineProps(['selectItems']);
const pbiaRootPath = computed(() => store.state.commonModule.pbiaRootPath);
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.115:3002';
const store = useStore();
const tilingViewerLayer = ref(null);
const hideImageRef = ref(null);
const newImgHeight = ref('');
const newImgWidth = ref('');

const hideImage = ref('');
let viewer:any = null;

onMounted(async () => {
  await onImageLoad();
});

const onImageLoad = async () => {
  const imgElement = hideImageRef.value;
  // 이미지가 로드되었는지 확인합니다.
  if (imgElement && imgElement.complete) {
    const imageHeight = imgElement.naturalHeight;
    const imageWidth = imgElement.naturalWidth;

    // 이미지 높이가 0이 아닌지 확인합니다.
    if (imageHeight !== 0) {
      console.log('이미지 높이:', imageHeight);
      newImgHeight.value = imageHeight;
      newImgWidth.value = imageWidth;

      // 이미지 높이를 얻은 후 initElement 함수를 호출합니다.

    }
    console.log('???')
    await initElement(imageHeight);
  }
};



const initElement = async (imageHeight: any) => {
  if (viewer) {
    viewer.destroy();
  }
  const slotId = selectItems.value?.slotId || "";
  const folderPath = `${sessionStorage.getItem('pbiaRootPath')}/${slotId}/01_Stitching_Image`;

  const imageUrl =  `${apiBaseUrl}/folders?folderPath=${folderPath}/PMC_Result.jpg`;
  hideImage.value = imageUrl;
  try {
    const tilesInfo = await fetchTilesInfo(folderPath);
    viewer = OpenSeadragon({
      id: "tiling-viewer",
      animationTime: 0.4,
      navigatorSizeRatio: 0.25,
      showNavigator: true,
      sequenceMode: true,
      defaultZoomLevel: 1,
      prefixUrl:`${apiBaseUrl}/folders?folderPath=C:/workspace/uimdFe/images/`,
      tileSources: tilesInfo,
      gestureSettingsMouse: { clickToZoom: false },
    });

    viewer.addHandler("open", function() {
      // 타일링 뷰어에 height 동적 조정
      const imageWidth = viewer.source.dimensions.x;
      const imageHeight = viewer.source.dimensions.y;

      const tilingViewerElement: any = document.getElementById("tiling-viewer");

      const containerWidth = tilingViewerElement.clientWidth;

      const aspectRatio = imageHeight / imageWidth;

      const dynamicHeight = containerWidth * aspectRatio;
      tilingViewerElement.style.height = `${dynamicHeight}px`;
    });


  } catch (err) {
    console.error('Error:', err);
  }
};

const fetchTilesInfo = async (folderPath: string) => {
  const url = `${apiBaseUrl}/folders?folderPath=${folderPath}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const fileNames = await response.json();
  const tilesInfo = [];
  // console.log()
  for (const fileName of fileNames) {
    if (fileName.endsWith('_files')) {
      tilesInfo.push({
        Image: {
          xmlns: "http://schemas.microsoft.com/deepzoom/2009",
          Url: `${apiBaseUrl}/folders?folderPath=${folderPath}/${fileName}/`,
          Format: "jpg",
          Overlap: "1",
          TileSize: "1024",
          Size: {
            Width: newImgWidth.value,
            Height: newImgHeight.value
          }
        }
      });
    }
  }

  return tilesInfo;
};

</script>

<style scoped>

#tiling-viewer {
  position: relative;
  width: 100%;
}

</style>