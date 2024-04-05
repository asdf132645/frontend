<template>
    <div>
      <div ref="tilingViewerLayer" id="tiling-viewer" ></div>
    </div>
</template>

<script setup lang="ts">

import { defineProps, onMounted, ref, watch, computed } from 'vue';
import OpenSeadragon from 'openseadragon';
import {rulers} from '@/common/defines/constFile/rbc';
import {dirName} from "@/common/defines/constFile/settings";
import { useStore } from "vuex";
import malaria from './malaria.vue';

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const props = defineProps(['selectItems']);
const pbiaRootPath = computed(() => store.state.commonModule.pbiaRootPath);
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.115:3002';
const store = useStore();
const tilingViewerLayer = ref(null);

onMounted(() => {
  initElement();
});


const initElement = async () => {
  const slotId = selectItems.value?.slotId || "";
  const folderPath = `${sessionStorage.getItem('pbiaRootPath')}/${slotId}/01_Stitching_Image`;

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
            Height: "3295",
            Width: "3349"
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
  max-width: 100%; 
  height: 85vh;
}

</style>