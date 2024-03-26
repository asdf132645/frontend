<template>
<div></div>
  <div class="rbc-container">
    <div class="btn-container">
      <div>
        <button @click="toggleViewer('lowMag')">Low magnification</button>
        <button @click="toggleViewer('malaria')">Malaria</button>
      </div>
      <div>
        <button @click="imgSetOpen">img Setting</button>
        <div class="imgSet" v-if="imgSet">
            <div>
              <font-awesome-icon :icon="['fas', 'sun']"/>
                Brightness
              <input
                  type="range"
                  min="80"
                  max="150"
                  v-model="imgBrightness"
                  @input="changeImgBrightness"
              />
            </div>
            <div>
              <font-awesome-icon :icon="['fas', 'palette']"/>
              RGB
              <input
                  type="range"
                  min="0"
                  max="255"
                  v-model="imageRgb[0]"
                  @input="changeImageRgb"
              />
              <input
                  type="range"
                  min="0"
                  max="255"
                  v-model="imageRgb[1]"
                  @input="changeImageRgb"
              />
              <input
                  type="range"
                  min="0"
                  max="255"
                  v-model="imageRgb[2]"
                  @input="changeImageRgb"
              />
              <button class="resetBtn" @click="rgbReset">RGB Reset</button>
            </div>
            <div>
              <font-awesome-icon :icon="['fas', 'th']"/>
              Grid
              <font-awesome-icon
                :icon="isGrid ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                @click="onClickGrid"
              />
            </div>
            <div>
              <font-awesome-icon :icon="['fas', 'ruler']"/>
              Ruler
              <div>
                <button @click="onClickRuler(ruler)" v-for="ruler in rulers" :key="ruler.id">{{ruler.text}}</button>
              </div>
            </div>
            <div>
              <font-awesome-icon :icon="['fas', 'glass']"/>
              Zoom
              <font-awesome-icon
                :icon="isMagnifyingGlass ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                @click="onClickMagnifyingGlass"
              />
            </div>
        </div>
      </div>
    </div>
    <div>
      <Malaria v-if="activeViewer === 'malaria'"/>
      <div v-else style="width: 100%; height: 89vh;" id="tiling-viewer" ref="image"></div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { defineProps, onMounted, ref, watch } from 'vue';
import OpenSeadragon from 'openseadragon';
// import '@/components/Plugins/OpenSeadragonCanvasOverlay-0.0.2/openseadragon-canvas-overlay.js'
import {rulers} from '@/common/defines/constFile/rbc';
import Malaria from './Malaria.vue';

const props = defineProps(['selectItems']);
const pbiaRootPath = sessionStorage.getItem('pbiaRootPath') || 'D:/ia_proc';
const activeViewer = ref('');
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';

let viewer:any = null;
const imgSet = ref(false);
const imgBrightness = ref(100);
const imageRgb = ref([0, 0, 0]);
const isRuler = ref(false);
const isGrid = ref(false);
const isMagnifyingGlass = ref(false);
const ruler = ref(null);
const rulerPos = ref({
  prevPosX: 0,
  prevPosY: 0,
  posX: 0,
  posY: 0,
  left: 0,
  top: 0,
  width: 50,
  height: 50
});
const rulerSize = ref(5);
const rulerWidth = ref(0);
const viewBoxWH = ref(150);

onMounted(() => {
  initElement();
});


const changeImageRgb = () => {
  const red = imageRgb.value[0];
  const green = imageRgb.value[1];
  const blue = imageRgb.value[2];
  const brightness = imgBrightness.value;
  
  const imageContainer = document.getElementById('tiling-viewer');

  if (imageContainer) {
    imageContainer.style.filter = `opacity(0.88) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${brightness}%)`;
  }

}

const changeImgBrightness = (event: any) => {
  const brightness = event?.target?.value;
  
  const red = imageRgb.value[0];
  const green = imageRgb.value[1];
  const blue = imageRgb.value[2];
  
  const imageContainer = document.getElementById('tiling-viewer');
  if (imageContainer) {
    imageContainer.style.filter = `opacity(1) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${brightness}%)`;
  }
};

const rgbReset = () => {
  imgBrightness.value = 100;
  imageRgb.value = [0, 0, 0];

  const imageContainer = document.getElementById('tiling-viewer');
  if (imageContainer) {
    imageContainer.style.filter = `opacity(1) drop-shadow(0 0 0 rgb(0,0,0)) brightness(100%)`;
  }
};

const onClickRuler = (ruler: any) => {
  isRuler.value = !isRuler.value;
  if (isRuler.value) {
    drawRuler(ruler);
  }
}

const onClickGrid = () => {
  isGrid.value = !isGrid.value;
  viewer.forceRedraw()
  if (isGrid.value) {
    drawLines();
  } else {
    removeGridLines();
  }
}

const onClickMagnifyingGlass = () => {
  isMagnifyingGlass.value = !isMagnifyingGlass.value;
}

const imgSetOpen = () => {
  imgSet.value = !imgSet.value;
}

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

    new OpenSeadragon.MouseTracker({
      element: viewer.element,
      moveHandler: function(event: any) {
        if (!isMagnifyingGlass.value) {
          if (document.getElementById('magCanvas') !== null) {
            viewer.element.removeChild(document.getElementById('magCanvas'))
          }
          return;
        }

        const { canvas } = viewer.drawer
        const ctx = canvas.getContext("2d")

        if (document.getElementById('magCanvas') !== null) {
          viewer.element.removeChild(document.getElementById('magCanvas'))
        }

        const magWidth = 200
        const magHeight = 200
        const zoomLevel = 5

        const magCanvas = document.createElement('canvas')
        magCanvas.id = 'magCanvas'
        magCanvas.style.position = 'absolute'
        magCanvas.style.left = (event.position.x - (magWidth / 2)) + 'px'
        magCanvas.style.top = (event.position.y - (magHeight / 2)) + 'px'
        magCanvas.style.border = '1px solid'
        magCanvas.style.borderRadius = '50%'
        magCanvas.style.width = magWidth + 'px'
        magCanvas.style.height = magHeight + 'px'
        magCanvas.style.zIndex = '20'

        viewer.element.appendChild(magCanvas)
        const magCtx = magCanvas.getContext('2d')
        magCtx?.drawImage(canvas,
          event.position.x - ((magWidth / 2) / 4),
          event.position.y - ((magHeight / 2) / 4),
          magWidth,
          magHeight,
          0,
          0,
          magWidth * zoomLevel,
          (magHeight / 2) * zoomLevel
        )
        if (event.position.y <= 0 || event.position.x <= 0) {
          magCanvas.style.visibility = 'hidden'
        } else {
          magCanvas.style.visibility = 'visible'
        }
      }
    });

    viewer.addHandler('zoom', handleGridZoom);

    // const gridOverlay = viewer.addOverlay({
    //   element: document.createElement("div"),
    //   location: viewer.world.getHomeBounds(),
    //   checkResize: false
    // });

    // const gridElement = gridOverlay.element;
    // gridElement.style.width = "100%";
    // gridElement.style.height = "100%";
    // gridElement.style.background = "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3) 100%), linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3) 100%)";
    // gridElement.style.backgroundSize = "20px 20px";

} catch (err) {
    console.error('Error:', err);
  }
};

const refreshRuler = (element, rulerSize, ruler) => {
  if(document.getElementById('rulerTitle') !== null) {
    element.removeChild(document.getElementById('rulerTitle'))
  }

  let rSize = 1
  if (rulerSize > 5) {
    rSize = rSize + (0.06 * (rulerSize - 5))
  }

  let zoomRatio = viewer.viewport.viewportToImageZoom(viewer.viewport.getZoom())

  if (zoomRatio > 1) {
    zoomRatio = zoomRatio * 1.02
  } else if (zoomRatio > 0.9 && zoomRatio < 1) {
    zoomRatio = zoomRatio * 1.12
  } else if (zoomRatio > 0.7 && zoomRatio <= 0.9) {
    zoomRatio = zoomRatio * 1.22
  } else if (zoomRatio > 0.6 && zoomRatio <= 0.7) {
    zoomRatio = zoomRatio * 1.32
  } else if (zoomRatio > 0.5 && zoomRatio <= 0.6) {
    zoomRatio = zoomRatio * 1.42
  } else if (zoomRatio > 0.4 && zoomRatio <= 0.5) {
    zoomRatio = zoomRatio * 1.52
  } else if (zoomRatio > 0.3 && zoomRatio <= 0.4) {
    zoomRatio = zoomRatio * 1.72
  } else if (zoomRatio > 0.2 && zoomRatio <= 0.3) {
    zoomRatio = zoomRatio * 1.92
  }

  rulerWidth.value = 60 * (zoomRatio * rSize)

  const titleElement = document.createElement('div')
  titleElement.id = 'rulerTitle'
  titleElement.style.color = 'black'
  titleElement.style.textAlign = 'center'
  titleElement.style.fontSize = '16px'
  titleElement.style.minWidth = '50px'
  titleElement.style.width = rulerWidth.value + 'px'

  if (ruler.id === 'line') {
    const startX = (viewBoxWH.value / 2) - (rulerWidth.value / 2)
    const endX = (viewBoxWH.value / 2) + (rulerWidth.value / 2)
    const startY = viewBoxWH.value / 2
    const endY = startY

    titleElement.innerHTML = '<div style="width: 100%;">' + rulerSize + 'μm' + '</div>' +
                              '<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">' +
                                '<line x1="' + startX + '" y1="' + startY + '" x2="' + endX + '" y2="' + endY + '" stroke="black" stroke-width="2"/>' +
                                '<line x1="' + startX + '" y1="' + (startY-5) + '" x2="' + startX + '" y2="' + (endY+5) + '" stroke="black" stroke-width="2"/>' +
                                '<line x1="' + endX + '" y1="' + (endY-5) + '" x2="' + endX + '" y2="' + (endY+5) + '" stroke="black" stroke-width="2"/>' +
                              '</svg>'
    element.appendChild(titleElement)

  } else if (ruler.id === 'cross') {
    const centerX = viewBoxWH.value / 2;
    const centerY = viewBoxWH.value / 2;
    const halfWidth = rulerWidth.value / 2;

    titleElement.innerHTML = '<div style="width: 100%;">' + rulerSize + 'μm' + '</div>' +
                              '<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">' +
                                '<line x1="' + (centerX - halfWidth) + '" y1="' + centerY + '" x2="' + (centerX + halfWidth) + '" y2="' + centerY + '" stroke="black" stroke-width="2"/>' +
                                '<line x1="' + centerX + '" y1="' + (centerY - halfWidth) + '" x2="' + centerX + '" y2="' + (centerY + halfWidth) + '" stroke="black" stroke-width="2"/>' +
                              '</svg>';

    element.appendChild(titleElement);

  } else if (ruler.id === 'circle') {
    const cx = viewBoxWH.value / 2
    const cy = viewBoxWH.value / 2
    const radius = rulerWidth.value * 0.5

    titleElement.innerHTML = '<div style="width: 100%;">' + rulerSize.value + 'μm' + '</div>' +
                              '<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">' +
                              '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" stroke="black" stroke-width="2" fill="transparent" opacity="0.6" />' +
                              '</svg>';

    element.appendChild(titleElement)
  } else {
    const rulerOverlay = document.getElementById('rulerOverlay')
    if (rulerOverlay !== null) {
      const divtilingViewer = document.getElementById('tilingViewer')
      divtilingViewer?.removeChild(rulerOverlay)
    }
  }
};

const drawRuler = (ruler: any) => {
  console.log("drawruler")
  
  const divtilingViewer = document.getElementById('tiling-viewer')

  if (divtilingViewer !== null) {
    const rulerOverlay = document.getElementById('rulerOverlay')
    if (rulerOverlay !== null) {
      // self.viewer.canvas.removeChild(rulerOverlay)
      divtilingViewer.removeChild(rulerOverlay)
    }


    const element = document.createElement('div')
    element.id = 'rulerOverlay'
    element.style.position = 'absolute'
    // element.style.background = 'rgba(0, 0, 0, 0.3)'
    element.style.width = rulerPos.value.width + 'px'
    element.style.height = rulerPos.value.height + 'px'
    console.log(rulerPos)

    if (rulerPos.value.left === 0) {
      element.style.left = (viewer.canvas.clientWidth / 2) - (rulerPos.value.width / 2) + 'px'
    } else {
      element.style.left = rulerPos.value.left + 'px'
    }

    if (rulerPos.value.top === 0) {
      element.style.top = (viewer.canvas.clientHeight / 2) - (rulerPos.value.height / 2) + 'px'
    } else {
      element.style.top = rulerPos.value.top + 'px'
    }

    refreshRuler(element, rulerSize, ruler);
    divtilingViewer.appendChild(element)

    let isPress = false

    element.onmousedown = function(e) {
      console.log('onmousedown')
      rulerPos.value.prevPosX = e.clientX
      rulerPos.value.prevPosY = e.clientY

      if (rulerPos.value.left <= 30) {
        rulerPos.value.left = 31
      }

      if (rulerPos.value.top <= 80) {
        rulerPos.value.top = 81
      }

      isPress = true
    }

    element.onmouseup = function() {
      console.log('onmouseup')

      isPress = false
    }

    element.onwheel = function(e) {
      console.log('onwheel')

      if (e.deltaY < 0) {
        if (rulerSize.value < 20) {
          refreshRuler(element, ++rulerSize.value, ruler)
        }

      } else {
        if (rulerSize.value > 5) {
          refreshRuler(element, --rulerSize.value, ruler)
        }
      }
    }

    const parent = document.getElementById('tilingViewer')

    if (parent) {
      parent.onmousemove = function(e) {
        console.log('onmousemove')
        console.log(e)
        if (!isPress) {
          return
        }
  
        if (rulerPos.value.left <= 30) {
          return
        }
  
        if (rulerPos.value.top <= 80) {
          return
        }
  
        rulerPos.value.posX = rulerPos.value.prevPosX - e.clientX
        rulerPos.value.posY = rulerPos.value.prevPosY - e.clientY
  
        rulerPos.value.prevPosX = e.clientX
        rulerPos.value.prevPosY = e.clientY
  
        element.style.left = (element.offsetLeft - rulerPos.value.posX) + 'px'
        element.style.top = (element.offsetTop - rulerPos.value.posY) + 'px'
  
        rulerPos.value.left = element.offsetLeft - rulerPos.value.posX
        rulerPos.value.top = element.offsetTop - rulerPos.value.posY
      }
    }
  }
};

const handleGridZoom = () => {
  drawLines();
};

const drawLines = () => {
  removeGridLines();
  if (isGrid.value) {
    const imageHeight = viewer.world.getItemAt(0).getContentSize().y;
    const imageWidth = viewer.world.getItemAt(0).getContentSize().x;
    const zoom = viewer.viewport.getZoom();

    const maxNumberOfLines = 400;
    const numberOfLines = Math.round(maxNumberOfLines / zoom);

    const minGap = Math.min(imageWidth, imageHeight) / numberOfLines;

    for (let i = 1; i < numberOfLines; i++) {
      const linePosition = i * minGap;

      drawLine(linePosition, 0, 1, imageHeight, 'rgba(128, 128, 128, 0.2)'); // 세로선
      drawLine(0, linePosition, imageWidth, 1, 'rgba(128, 128, 128, 0.2)'); // 가로선
    }
  }
};


const drawLine = (x: number, y: number, width: number, height: number, color: string) => {
  const lineElement = document.createElement('div');
  lineElement.className = 'grid-line';
  lineElement.style.position = 'absolute';
  lineElement.style.left = `${x}px`;
  lineElement.style.top = `${y}px`;
  lineElement.style.width = `${width}px`;
  lineElement.style.height = `${height}px`;
  lineElement.style.background = color;
  lineElement.style.userSelect = 'none';
  lineElement.style.pointerEvents = 'none';
  viewer.container.appendChild(lineElement);
};

const removeGridLines = () => {
  const gridLines = document.querySelectorAll('.grid-line');
  gridLines.forEach(line => line.remove());
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
}

.rbc-container {
  max-height:100vh;
}

.btn-container {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
}

</style>