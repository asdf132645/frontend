<template>
<!--  <img :src="hideImage" ref="hideImageRef" style="display: none" @load="onImageLoad(true)"  />-->
    <div class="tilingViewerContainer" style="height: 100%" id="tiling-container">
      <div ref="tilingViewerLayer" id="tiling-viewer" :style="{ height: viewerHeight }">
      </div>
    </div>
</template>

<script setup lang="ts">

import {defineProps, onMounted, ref, watch, computed, nextTick} from 'vue';
import OpenSeadragon from 'openseadragon';
import { useStore } from "vuex";
import {readDziFile, readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";

const props = defineProps(['selectItems']);
const store = useStore();
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const apiBaseUrl = viewerCheck.value === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;
const tilingViewerLayer = ref(null);
const newImgHeight = ref('');
const newImgWidth = ref('');
const viewerHeight = ref('85vh'); // 기본값 설정

let viewer:any = null;

onMounted(async () => {
  const urlImage = `PMC_Result`;
  const {width, height} = await dziWidthHeight(urlImage)
  newImgHeight.value = height;
  newImgWidth.value = width;
  viewerHeight.value = `${Math.min((height / window.innerHeight) * 100, 85)}vh`; // 최대 80vh로 제한
  await initElement(height, false);});

watch( () => props.selectItems, async(newItem) => {
  await nextTick()
  // await onImageLoad(false);
  const urlImage = `PMC_Result`;
  const {width, height} = await dziWidthHeight(urlImage)
  newImgHeight.value = height;
  newImgWidth.value = width;
  await initElement(height, false);
});

watch(
    () => window.innerHeight,
    () => {
      viewerHeight.value = `${Math.min((Number(newImgHeight.value) / window.innerHeight) * 100, 85)}vh`; // 최대 80vh로 제한
    }
);
const initElement = async (imageHeight: any, bool: boolean) => {
  if (viewer) {
    viewer.destroy();
  }
  const slotId = props.selectItems?.slotId || "";
  const path = props.selectItems?.img_drive_root_path  !== '' && props.selectItems?.img_drive_root_path  ? props.selectItems?.img_drive_root_path  : sessionStorage.getItem('iaRootPath');

  const folderPath = `${path}/${slotId}/01_Stitching_Image`;

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

      const fileNameResult = extractSubStringBeforeFiles(fileName);
      const {width, height, tileSize} = await dziWidthHeight(fileNameResult);
      tilesInfo.push({
        Image: {
          xmlns: "http://schemas.microsoft.com/deepzoom/2009",
          Url: `${apiBaseUrl}/folders?folderPath=${folderPath}/${fileName}/`,
          Format: "jpg",
          Overlap: "1",
          TileSize: tileSize,
          Size: {
            Width: width,
            Height: height
          }
        }
      });
    }
  }

  return tilesInfo;
};

const dziWidthHeight = async (imageFileName: any): Promise<any> => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const urlImage = `${path}/${props.selectItems.slotId}/01_Stitching_Image/${imageFileName}.dzi`;
  const imageResponse = await readDziFile({filePath: urlImage});
  return await extractWidthHeightFromDzi(`${imageFileName}`, imageResponse);
}

const extractWidthHeightFromDzi = (fileName: string, xmlString: any): any => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const sizeElement = xmlDoc.getElementsByTagName("Size")[0];
  const tileSizeEl = xmlDoc.getElementsByTagName('Image')[0];
  const tileSize = tileSizeEl.getAttribute("TileSize");
  const width = sizeElement.getAttribute("Width");
  const height = sizeElement.getAttribute("Height");
  return {fileName, width: Number(width), height: Number(height), tileSize: Number(tileSize)}
}

const extractSubStringBeforeFiles = (str: string) => {
  const searchString = '_files';
  const endIndex = str.indexOf(searchString);

  if (endIndex !== -1) {
    return str.substring(0, endIndex);
  }

  return str;
}

</script>
