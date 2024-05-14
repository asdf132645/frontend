<template>
  <div></div>
    <div class="rbc-container">
      <div class="btn-container">
        <div>
          <button 
            @click="toggleViewer('lowMag')" 
            class="tab-btn" 
            :class="{ 'active': activeTab === 'lowMag', 'inactive': activeTab !== 'lowMag'}"
            >Low magnification</button>
          <button 
            @click="toggleViewer('malaria')" 
            class="tab-btn" 
            :class="{ 'active': activeTab === 'malaria', 'inactive': activeTab !== 'malaria' }"
          >Malaria</button>
        </div>
        <div class='btn-imgsetbox'>
          <button class="img-btn" @click="imgSetOpen">Img Setting</button>
          <div class="imgSet" v-if="imgSet">
              <div>
                <font-awesome-icon :icon="['fas', 'sun']"/>
                <span>Brightness</span>
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
                <span>RGB</span>
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
                <span>Grid</span>
                <font-awesome-icon
                  :icon="isGrid ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                  @click="onClickGrid"
                />
              </div>
              <!-- <div>
                <font-awesome-icon :icon="['fas', 'crop']"/>
                <span>Crop</span>
                <font-awesome-icon
                  :icon="isCrop? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                  @click="onClickCrop"
                />
              </div> -->
              <div>
                <font-awesome-icon :icon="['fas', 'ruler']"/>
                <span>Ruler</span>
                <div class="ruler-box">
                  <button 
                  class="tab-ruler-btn" 
                  @click="onClickRuler(ruler)" 
                  v-for="ruler in rulers" 
                  :key="ruler.id"
                  :class="{ 'active': activeRuler === ruler.text, 'inactive': activeRuler !== ruler.text}"
                >{{ruler.text}}</button>
                </div>
              </div>
              <div>
                <font-awesome-icon :icon="['fas', 'magnifying-glass']"/>
                <span>Zoom</span>
                <font-awesome-icon
                  :icon="isMagnifyingGlass ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                  @click="onClickZoom"
                />
              </div>
              
          </div>
        </div>
      </div>
      <div class="tiling-viewer-box">
        <Malaria v-if="activeTab === 'malaria'" :selectItems="selectItems"/>
        <div v-else-if="activeTab !== 'malaria' && tileExist" ref="tilingViewerLayer" id="tiling-viewer" ></div>
        <div v-else>
          <span>Tile does not exist.</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, onMounted, ref, watch, computed} from 'vue';
  import OpenSeadragon from 'openseadragon';
  import {rulers} from '@/common/defines/constFile/rbc';
  import {dirName} from "@/common/defines/constFile/settings";
  import Malaria from './Malaria.vue';
  import {useStore} from "vuex";
  
  const props = defineProps(['rbcInfo', 'selectItems', 'originalDb', 'type']);const store = useStore();
  const pbiaRootPath = computed(() => store.state.commonModule.pbiaRootPath);
  const activeTab = ref('lowMag');
  const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.115:3002';
  
  let viewer:any = null;
  const imgSet = ref(false);
  const imgBrightness = ref(100);
  const imageRgb = ref([0, 0, 0]);
  const isGrid = ref(false);
  const isCrop = ref(false);
  const isMagnifyingGlass = ref(false);
  const ruler = ref(null);
  const activeRuler = ref('None');
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
  const tilingViewerLayer = ref(null);
  let isFirstDragEvent = ref(true);
  let dragForCrop = ref({});
  const tileExist = ref(true);

  onMounted(() => {
    initElement();
  });
  
  watch(() => props.rbcInfo, (newItem) => {
    activeTab.value = 'lowMag';
    initElement();
  });
  
  const initElement = async () => {
    const folderPath = `${sessionStorage.getItem('pbiaRootPath')}/${props.selectItems.slotId}/${dirName.rbcImageDirName}`;
    try {
  
      const tilesInfo = await fetchTilesInfo(folderPath);

      if (tilesInfo.length !== 0) {
  
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
            magCanvas.style.zIndex = '0'
    
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
          },
        });
      }
  
  } catch (err) {
      console.error('Error:', err);
    }
  };
  
  const fetchTilesInfo = async (folderPath: string) => {
    const url = `${apiBaseUrl}/folders?folderPath=${folderPath}`;
    const response = await fetch(url);
  
    if (!response.ok) {
      tileExist.value = false;
      throw new Error('Network response was not ok');
    } else {
  
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
      tileExist.value = true;  
      return tilesInfo;
    }
  };
  
  
  // Low magnification and Malaria tab
  const toggleViewer = (viewerType: string) => {
    switch (viewerType) {
      case 'lowMag':
        activeTab.value = 'lowMag';
        break;
      case 'malaria':
        activeTab.value = 'malaria';
        imgSet.value = false;
        break;
    }
    
    if (activeTab.value !== 'malaria') {
      initElement();
    }
  };
  
  
  // Img setting
  const imgSetOpen = () => {
    imgSet.value = !imgSet.value;
  }
  
  
  // Brightness
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
  
  
  // RGB
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
  
  const rgbReset = () => {
    imgBrightness.value = 100;
    imageRgb.value = [0, 0, 0];
  
    const imageContainer = document.getElementById('tiling-viewer');
    if (imageContainer) {
      imageContainer.style.filter = `opacity(1) drop-shadow(0 0 0 rgb(0,0,0)) brightness(100%)`;
    }
  };
  
  
  // Grid
  const onClickGrid = () => {
    isGrid.value = !isGrid.value;
    viewer.addHandler('zoom', drawLines);
    if (isGrid.value) {
      drawLines();
    } else {
      removeGridLines();
    }
  }
  
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
  
  
  // Ruler
  const onClickRuler = (ruler: any) => {
    switch (ruler.text) {
      case 'None':
        activeRuler.value = 'None';
        break;
      case 'Line':
        activeRuler.value = 'Line';
        break;
      case 'Cross':
        activeRuler.value = 'Cross';
        break;
      case 'Circle':
        activeRuler.value = 'Circle';
        break;
    }
    drawRuler(ruler);
  }
  
  const drawRuler = (ruler: any) => {
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
        isPress = false
      }
  
      element.onwheel = function(e) {
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
  
  const refreshRuler = (element, rulerSize, ruler) => {
    if (typeof rulerSize === 'object') {
      rulerSize = rulerSize.value;
    }
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
  
      titleElement.innerHTML = '<div style="width: 100%;">' + rulerSize + 'μm' + '</div>' +
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
  
  
  // Zoom
  const onClickZoom = () => {
    isMagnifyingGlass.value = !isMagnifyingGlass.value;
  }
  
  
  
  </script>
  
  <style scoped>
  
  .tab-btn {
    padding: 10px 20px;
    cursor: pointer;
    border: none;
    border-radius: 3px;
    color: white;
    background-color: #2c2d2c;
  }
  
  .ruler-box {
    display: flex;
    justify-content: space-between;
  }
  
  .tab-ruler-btn {
    padding: 5px 10px;
    margin-right: 5px;
    cursor: pointer;
    border: none;
    border-radius: 3px;
    color: white;
    background-color: #2c2d2c;
  }
  
  .tab-btn.active, .tab-ruler-btn.active {
    color: white;
    background-color: #2c2d2c;
  }
  
  .tab-btn.inactive, .tab-ruler-btn.inactive {
    color: darkgray;
    background-color: #393939;
  }
  
  
  .btn-imgsetbox{
    position: relative;
  }
  
  .imgSet {
    position: absolute;
    top: 40px;
    left: -150px;
    width: 250px;
  
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .imgSet div {
    padding: 10px;
  }
  
  .img-btn {
    padding: 10px 20px;
    cursor: pointer;
    border: none;
    border-radius: 3px;
    color: white;
    background-color: #2c2d2c;
  }
  
  span {
    margin: 0 10px 0 10px;
  }
  
  .tiling-viewer-box {
    max-width: 100%;
    overflow: hidden;
  }
  
  #tiling-viewer {
    position: relative;
    width: 100%;
    height: 80vh;
  }
  
  .rbc-container {
    height:85vh;
  }
  
  .btn-container {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
  }
  
  </style>