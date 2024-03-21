<template>
<div></div>
  <div class="rbc-container">
    <div>
      <button @click="toggleViewer('lowMag')">Low magnification</button>
      <button @click="toggleViewer('malaria')">Malaria</button>
    </div>
    <div>
      <Malaria v-if="activeViewer === 'malaria'"/>
      <div v-else style="width: 100%; height: 89vh;" id="tiling-viewer" ref="image"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import OpenSeadragon from 'openseadragon';
import Malaria from './Malaria.vue';

const props = defineProps(['selectItems']);
const pbiaRootPath = sessionStorage.getItem('pbiaRootPath') || 'D:/ia_proc';
const activeViewer = ref('');
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';

onMounted(() => {
  initElement();
});

const toggleViewer = (viewerType: string) => {
  switch (viewerType) {
    case 'lowMag':
      activeViewer.value = 'lowMag';
      break;
    case 'malaria':
      activeViewer.value = 'malaria';
      break;
  }
  
  if (activeViewer.value !== 'malaria') {
    initElement();
  }
};

const initElement = async () => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }

  const folderPath = `${pbiaRootPath}/${props.selectItems.slotId}/02_RBC_Image`;
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
.rbc-container {
  max-height:100vh;
}
</style>
