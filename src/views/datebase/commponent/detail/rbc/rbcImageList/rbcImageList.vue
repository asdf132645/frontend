<template>
  <div class="rbc-container">
    <button @click="toggleMagnification(true)">Low magnification</button>
    <button @click="toggleMagnification(false)">Malaria</button>
    <div v-if="showMagnification" style="width: 100%; height: 800px;" id="tiling-viewer" ref="image"></div>
    <div v-else>Malairia</div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, ref, watch} from 'vue';
import OpenSeadragon from 'openseadragon';
import {useStore} from "vuex";
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';


const props = defineProps(['selectItems']);
const store = useStore();
const commonDataGet = computed(() => store.state.commonModule);
const pbiaRootPath = commonDataGet.value.pbiaRootPath || 'D:/ia_proc';
const showMagnification = ref(true);
let viewer = null;

onMounted(() => {
  initElement();
});

watch(showMagnification, (newValue) => {
  if (newValue) {
    // Show magnification
    initElement();
  } else {
    // Hide magnification
    if (viewer) {
      viewer.destroy();
      viewer = null;
    }
  }
});

const toggleMagnification = (value: boolean) => {
  showMagnification.value = value;
}

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
      gestureSettingsMouse: { clickToZoom: false }
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
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
