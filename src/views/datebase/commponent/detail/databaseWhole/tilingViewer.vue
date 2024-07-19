<template>
  <img :src="hideImage" ref="hideImageRef" style="display: none" @load="onImageLoad(true)"  />
    <div class="tilingViewerContainer" style="height: 100%" id="tiling-container">
      <div ref="tilingViewerLayer" id="tiling-viewer" ></div>
    </div>
</template>

<script setup lang="ts">

import {defineProps, onMounted, ref, watch, computed, nextTick} from 'vue';
import OpenSeadragon from 'openseadragon';
import { useStore } from "vuex";

const props = defineProps(['selectItems']);
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const apiBaseUrl = sessionStorage.getItem('viewerCheck') === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;
const store = useStore();
const tilingViewerLayer = ref(null);
const hideImageRef = ref(null);
const newImgHeight = ref('');
const newImgWidth = ref('');
const hideImage = ref('');
let viewer:any = null;

onMounted(async () => {
  await onImageLoad(true);
});

watch( () => props.selectItems, async(newItem) => {
  await nextTick()
  await onImageLoad(false);
});
const onImageLoad = async (bool: boolean) => {
  const imgElement = hideImageRef.value;
  const slotId = props.selectItems?.slotId || "";
  const path = props.selectItems?.img_drive_root_path  !== '' && props.selectItems?.img_drive_root_path  ? props.selectItems?.img_drive_root_path : sessionStorage.getItem('iaRootPath');
  const folderPath = `${path}/${slotId}/01_Stitching_Image`;

  const imageUrl =  `${apiBaseUrl}/folders?folderPath=${folderPath}/PMC_Result.jpg`;
  hideImage.value = imageUrl;
  if (imgElement && imgElement.complete) {
    const imageHeight = imgElement.naturalHeight;
    const imageWidth = imgElement.naturalWidth;

    if (imageHeight !== 0) {
      newImgHeight.value = imageHeight;
      newImgWidth.value = imageWidth;
      await initElement(imageHeight, bool);
    }

  }
};



const initElement = async (imageHeight: any, bool: boolean) => {
  if (viewer) {
    viewer.destroy();
  }
  const slotId = props.selectItems?.slotId || "";
  const path = props.selectItems?.img_drive_root_path  !== '' && props.selectItems?.img_drive_root_path  ? props.selectItems?.img_drive_root_path  : sessionStorage.getItem('iaRootPath');

  const folderPath = `${path}/${slotId}/01_Stitching_Image`;

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
      prefixUrl:`${apiBaseUrl}/folders?folderPath=D:/UIMD_Data/Res/uimdFe/images/`,
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
      tilingViewerElement.style.width = `${containerWidth}px`;
      // tilingViewerElement.style.height = `${dynamicHeight}px`;
      tilingViewerElement.style.position = 'absolute';
      tilingViewerElement.style.left = '50%';
      tilingViewerElement.style.top = '50%';
      tilingViewerElement.style.transform = 'translate(-50%, -50%)';
    });

    viewer.addHandler("zoom", function () {
      const tilingViewerElement: any = document.getElementById("tiling-viewer");
      if(bool){
        tilingViewerElement && (tilingViewerElement.style.height = '80vh');
      }
    })


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
