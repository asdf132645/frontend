<template>
  <div></div>
  <div class="rbc-container">
    <div class="btn-container">
      <div>
        <button
            @click="toggleViewer('lowMag')"
            class="tab-btn"
            :class="{ 'active': activeTab === 'lowMag', 'inactive': activeTab !== 'lowMag'}"
        >Low magnification
        </button>
        <button
            @click="toggleViewer('malaria')"
            class="tab-btn"
            :class="{ 'active': activeTab === 'malaria', 'inactive': activeTab !== 'malaria' }"
        >Malaria
        </button>
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
              >{{ ruler.text }}
              </button>
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
      <div v-else-if="activeTab !== 'malaria' && tileExist"
           ref="tilingViewerLayer"
           id="tiling-viewer" style="width: 100%;"
           @contextmenu.prevent="rbcClassRightClick"></div>
      <div v-else>
        <span>Tile does not exist.</span>
      </div>

    </div>
  </div>
  <div v-if="showSelect" class="rbc-select-box" :style="{ left: `${selectBoxX}px`, top: `${selectBoxY}px` }">
    <template v-for="(classList, outerIndex) in [rightClickItem]" :key="outerIndex">
      <template v-for="(category, innerIndex) in classList" :key="innerIndex">
        <div class="categories" v-show="category?.categoryNm === 'Shape' || category.categoryNm === 'Inclusion Body'">
          <ul class="categoryNm">
            <li>{{ category.categoryNm }}</li>
          </ul>
          <ul class="classNmRbc">
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li @click="moveRbcClassEvent(category.categoryId, classInfo.classId, classInfo.classNm)">
                <span>{{ classInfo?.classNm }}</span>
              </li>
            </template>
          </ul>
        </div>
      </template>
      <div class="categories">
        <ul class="categoryNm">
          <li>Others</li>
        </ul>
        <ul class="classNmRbc">
          <li @click="moveRbcClassEvent('04', '01', 'Giant Platelet')">
            <span>Platelets</span>
          </li>
          <li @click="moveRbcClassEvent('05', '03', 'Malaria')">
            <span>Malaria</span>
          </li>
        </ul>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, onMounted, ref, watch} from 'vue';
import OpenSeadragon from 'openseadragon';
import {rulers} from '@/common/defines/constFile/rbc';
import {dirName} from "@/common/defines/constFile/settings";
import Malaria from './Malaria.vue';
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {useStore} from "vuex";
import pako from 'pako';

const props = defineProps(['rbcInfo', 'selectItems', 'type', 'classInfoArr', 'isBefore']);
const activeTab = ref('lowMag');
const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.115:3002';

let viewer: any = ref<any>(null);
const imgSet = ref(false);
const imgBrightness = ref(100);
const imageRgb = ref([0, 0, 0]);
const isGrid = ref(false);
const isMagnifyingGlass = ref(false);
const ruler = ref(null);
const activeRuler = ref('None');
const showSelect = ref<any>(false);
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
const tileExist = ref(true);
const store = useStore();
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const rbcInfoPathAfter = ref<any>([]);
const classInfoArr = ref<any>([]);
const canvasOverlay = ref<any>(null);
const drawPath = ref<any>([]);
const moveRbcClass = ref<any>([]);
const selectBoxX = ref(0);
const selectBoxY = ref(0);
const emits = defineEmits();
const rightClickItem = ref([]);

onMounted(() => {
  initElement();
  document.addEventListener('click', closeSelectBox);
  rightClickItem.value = !props.selectItems.rbcInfo.rbcClass ? props.selectItems.rbcInfo : props.selectItems.rbcInfo.rbcClass;
});
watch(() => props.isBefore, (newItem) => {
  removeRbcMarker();
  removeDiv();
  emits('unChecked')
}, {deep: true})
const moveRbcClassEvent = async (categoryId: string, classId: string, classNm: string) => {
  // categoryId에 해당하는 객체를 찾음
  let category = rbcInfoPathAfter.value.find((item: any) => item.categoryId === categoryId);

  // categoryId에 해당하는 객체가 없으면 새로 추가
  if (!category) {
    category = {
      categoryId: categoryId,
      classInfo: []
    };
    rbcInfoPathAfter.value.push(category);
  }

  for (const moveRbcClassItem of moveRbcClass.value) {
    for (const argument of rbcInfoPathAfter.value) {
      // 기존 부분 삭제
      if (moveRbcClassItem.categoryId === argument.categoryId) {
        const foundElementIndex = argument.classInfo.findIndex((el: any) => Number(el.posX) === moveRbcClassItem.posX + 20 && Number(el.posY) === moveRbcClassItem.posY + 20);
        if (foundElementIndex !== -1) {
          argument.classInfo.splice(foundElementIndex, 1);
        }
      }
      //기존 부분을 li 클릭 한 곳으로 이동
      if (argument.categoryId === categoryId) {
        argument.classInfo.push({
          classNm: classNm,
          classId: classId,
          posX: moveRbcClassItem.posX + 20,
          posY: moveRbcClassItem.posY + 20
        })
      }
    }
  }
  await removeDiv();
  await rbcInfoPathAfterJsonCreate(rbcInfoPathAfter.value);
  await drawRbcMarker(classInfoArr.value);

}

const removeDiv = async () => {
  const existingOverlays = document.getElementsByClassName('overlayElement');
  const overlaysArray = Array.from(existingOverlays); // HTMLCollection을 배열로 변환

  // 모든 오버레이 제거
  overlaysArray.forEach(overlay => {
    viewer.value.removeOverlay(overlay);
  });

  showSelect.value = false;
};


const rbcInfoPathAfterJsonCreate = async (jsonData: any) => {
  const jsonString = JSON.stringify(jsonData);
  const utf8Data = new TextEncoder().encode(jsonString);
  const compressedData = pako.deflate(utf8Data);
  const blob = new Blob([compressedData], {type: 'application/octet-stream'});
  const formData = new FormData();
  formData.append('file', blob, `${props.selectItems.slotId}_new.json`);
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const filePath = `${path}/${props.selectItems.slotId}/03_RBC_Classification/${props.selectItems.slotId}_new.json`
  try {
    const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';

    const response = await fetch(`${apiBaseUrl}/jsonReader/upload?filePath=${filePath}`, {
      method: 'POST',
      body: formData,
    });
    const responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    console.error('Error:', error);
  }
};

const closeSelectBox = (event: MouseEvent) => {
  const selectBox = document.querySelector('.rbc-select-box');
  if (selectBox && !selectBox.contains(event.target as Node)) {
    showSelect.value = false; // 셀렉트 박스 닫기
  }
};

watch(() => props.classInfoArr, (newItem) => {
  if (newItem.length === 0) {
    removeDiv();
    removeRbcMarker();
  }

  rbcMarker(newItem);
}, {deep: true});

const rbcClassRightClick = (event: MouseEvent) => {
  if (props.isBefore || classInfoArr.value.length === 0) {
    return;
  }

  showSelect.value = true;

  if (event.currentTarget instanceof HTMLElement) {
    selectBoxX.value = event.clientX;
    selectBoxY.value = event.clientY - 300;
  }
};


const rbcMarker = async (newItem: any) => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;

  const url = `${path}/${props.selectItems.slotId}/03_RBC_Classification/${props.selectItems.slotId}_new.json`;
  const response = await readJsonFile({fullPath: url});
  if (response.data === 'not file' || props.isBefore) { // 비포 , 애프터에 따른 json 파일 불러오는 부분
    const url = `${path}/${props.selectItems.slotId}/03_RBC_Classification/${props.selectItems.slotId}.json`;
    const response = await readJsonFile({fullPath: url});
    rbcInfoPathAfter.value = response?.data[0].rbcClassList;
  } else {
    rbcInfoPathAfter.value = response?.data;
  }

  classInfoArr.value = newItem;
  if (newItem.length === 0) {
    removeRbcMarker();
  } else {
    await drawRbcMarker(newItem); // 변경된 항목으로 마커 다시 그리기
  }
}


watch(() => props.selectItems, (newItem) => {
  const tilingViewerLayer = document.getElementById('tiling-viewer');
  if (tilingViewerLayer) {
    tilingViewerLayer.innerHTML = ''; // 기존 내용 삭제

    // 다시 그리는 HTML 코드 생성
    const newHtml = `
        <div id="tiling-viewer" ref="tilingViewerLayer"></div>
      `;

    // 생성한 HTML 코드를 tilingViewerLayer에 추가
    tilingViewerLayer.insertAdjacentHTML('beforeend', newHtml);
    activeTab.value = 'lowMag';
    initElement();
  }

});

const removeRbcMarker = () => {
  let ctx = canvasOverlay.value.getContext('2d'); // canvasOverlay를 직접 사용
  let canvas = canvasOverlay.value;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  drawPath.value = [];
  return ctx;
}

const drawRbcMarker = async (classInfoArr: any) => {
  // json rbcInfoPathAfter.value 로 그림 그리는곳
  const colors: any = {
    '01': 'red',
    '02': 'green',
    '03': 'blue',
    '05': 'brown',
  };

  const ctx = removeRbcMarker();
  // 여기서 새로 추가 된 index 로 있나 없나 따지고 after 에서 있으면 비포에서는 보여주지않는다.
  classInfoArr.forEach((info: any) => {
    rbcInfoPathAfter.value.forEach((category: any) => {
      category.classInfo.forEach((classItem: any) => {
        if (classItem.classNm === info.classNm && category.categoryId === info.categoryId) {
          ctx.lineWidth = '2';
          ctx.strokeStyle = `${colors[info.categoryId] || 'black'}`;
          let rectPath = new Path2D();
          rectPath.rect(classItem.posX - 20, classItem.posY - 20, 40, 40);
          // rectPath.rect(classItem.x1, classItem.y1, x2-x1, y2-y1);
          drawPath.value.push({
            categoryId: info.categoryId,
            classNm: info.classNm,
            classId: info.classId,
            posX: classItem.posX - 20,
            posY: classItem.posY - 20,
          })
          ctx.stroke(rectPath)

        }
      });
    });
  });
};


const initElement = async () => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;

  const folderPath = `${path}/${props.selectItems.slotId}/${dirName.rbcImageDirName}`;
  try {
    const tilesInfo = await fetchTilesInfo(folderPath);

    if (tilesInfo.length !== 0) {
      viewer.value = OpenSeadragon({
        id: "tiling-viewer",
        animationTime: 0.4,
        navigatorSizeRatio: 0.25,
        showNavigator: true,
        sequenceMode: true,
        defaultZoomLevel: 1,
        prefixUrl: `${apiBaseUrl}/folders?folderPath=D:/UIMD_Data/Res/uimdFe/images/`,
        tileSources: tilesInfo,
        showReferenceStrip: false,
        gestureSettingsMouse: {clickToZoom: false},
        maxZoomLevel: 15
      });

      // 마그니파이어 설정
      new OpenSeadragon.MouseTracker({
        element: viewer.value.element,
        moveHandler: function (event: any) {
          if (!isMagnifyingGlass.value) {
            const magCanvas = document.getElementById('magCanvas');
            if (magCanvas) {
              viewer.value.element.removeChild(magCanvas);
            }
            return;
          }

          const {canvas} = viewer.value.drawer;
          const magCanvas = document.createElement('canvas');
          const magCtx = magCanvas.getContext('2d');
          canvasOverlay.value = magCanvas
          if (magCtx) {
            const magWidth = 200;
            const magHeight = 200;
            const zoomLevel = 5;

            magCanvas.id = 'magCanvas';
            magCanvas.style.position = 'absolute';
            magCanvas.style.left = `${event.position.x - (magWidth / 2)}px`;
            magCanvas.style.top = `${event.position.y - (magHeight / 2)}px`;
            magCanvas.style.border = '1px solid';
            magCanvas.style.borderRadius = '50%';
            magCanvas.style.width = `${magWidth}px`;
            magCanvas.style.height = `${magHeight}px`;
            magCanvas.style.zIndex = '0';

            viewer.value.element.appendChild(magCanvas);

            magCtx.drawImage(
                canvas,
                event.position.x - (magWidth / 8),
                event.position.y - (magHeight / 8),
                magWidth,
                magHeight,
                0,
                0,
                magWidth * zoomLevel,
                magHeight * zoomLevel
            );

            magCanvas.style.visibility = event.position.y <= 0 || event.position.x <= 0 ? 'hidden' : 'visible';

          }
        },
      });

      const canvas = document.createElement('canvas');
      const overlay = viewer.value.addOverlay({
        element: canvas,
        location: new OpenSeadragon.Rect(0, 0, 1, 1), // 캔버스가 뷰어 전체를 덮도록 설정
      });


      viewer.value.addHandler('open', function (event: any) {
        canvas.width = 3317;
        canvas.height = 3311;
        canvas.id = 'myCanvas';
        overlay.canvas = canvas;
        canvasOverlay.value = canvas;
      });


      viewer.value.addHandler('canvas-click', async (event: any) => {
        if (!event.originalEvent.shiftKey) { // 쉬프트 키를 누르지 않았을 때
          const clickPos = viewer.value.viewport.pointFromPixel(event.position);
          const canvasPos = {
            x: clickPos.x * viewer.value.source.width,
            y: clickPos.y * viewer.value.source.height
          };


          // 클릭된 아이템 확인
          for (const item of drawPath.value) {
            const itemPos = item;
            const width = 40; // 아이템의 너비
            const height = 40; // 아이템의 높이

            // 클릭된 아이템 확인
            if (
                canvasPos.x >= itemPos.posX && canvasPos.x <= (itemPos.posX + width) &&
                canvasPos.y >= itemPos.posY && canvasPos.y <= (itemPos.posY + height)
            ) {
              const categoryId = item.categoryId;
              const color = 'lightgreen'; // 연한 연두색
              if (event.originalEvent.ctrlKey) { // 컨트롤 키를 눌렀을 때
                moveRbcClass.value.push(item)
                const element = document.createElement('ol');
                element.className = 'overlayElement';
                element.id = 'overlayElement';
                element.setAttribute('data-category-id', categoryId);
                element.setAttribute('data-class-nm', item.classNm);
                element.style.width = '40px';
                element.style.backgroundColor = color;
                element.style.height = '40px';
                element.style.position = 'absolute';
                element.style.opacity = '0.5';

                const posX = parseFloat(itemPos.posX);
                const posY = parseFloat(itemPos.posY);
                const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, 40, 40); // 이미지 좌표를 뷰포트 좌표로 변환
                viewer.value.addOverlay({
                  element: element,
                  location: overlayRect
                });
              }else{
                if (
                    canvasPos.x >= itemPos.posX && canvasPos.x <= (itemPos.posX + width) &&
                    canvasPos.y >= itemPos.posY && canvasPos.y <= (itemPos.posY + height)
                ) {
                  // 클릭된 아이템 처리
                  const categoryId = item.categoryId;
                  const color = 'lightgreen'; // 연한 연두색
                  const classInfo = rbcInfoPathAfter.value.find((category: any) => category.categoryId === categoryId)?.classInfo.find(classItem => classItem.classNm === item.classNm);
                  if (classInfo) {
                    moveRbcClass.value = [item];
                    const existingOverlay = document.getElementById('overlayElement');
                    if (existingOverlay) {
                      viewer.value.removeOverlay(existingOverlay);
                    }

                    const previousOverlay = document.querySelector(`.overlayElement[data-category-id="${categoryId}"][data-class-nm="${item.classNm}"]`);
                    if (previousOverlay) {
                      const posX = parseFloat(itemPos.posX);
                      const posY = parseFloat(itemPos.posY);
                      const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, 40, 40); // 이미지 좌표를 뷰포트 좌표로 변환
                      viewer.value.updateOverlay(previousOverlay, overlayRect);
                    } else {

                      const element = document.createElement('ol');
                      element.className = 'overlayElement';
                      element.id = 'overlayElement';
                      element.setAttribute('data-category-id', categoryId);
                      element.setAttribute('data-class-nm', item.classNm);
                      element.style.width = '40px';
                      element.style.backgroundColor = color;
                      element.style.height = '40px';
                      element.style.position = 'absolute';
                      element.style.opacity = '0.5';

                      const posX = parseFloat(itemPos.posX);
                      const posY = parseFloat(itemPos.posY);
                      const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, 40, 40); // 이미지 좌표를 뷰포트 좌표로 변환
                      viewer.value.addOverlay({
                        element: element,
                        location: overlayRect
                      });
                    }
                  }
                }
              }
              break;
            }
          }
        } else { // 쉬프트 키를 눌렀을 때

          for (const item of drawPath.value) {
            if(item.classNm === "Normal"){
              return;
            }
            const itemPos = item;
            const categoryId = item.categoryId;
            const color = 'lightgreen'; // 연한 연두색
            moveRbcClass.value.push(item)
            const element = document.createElement('ol');
            element.className = 'overlayElement';
            element.id = 'overlayElement';
            element.setAttribute('data-category-id', categoryId);
            element.setAttribute('data-class-nm', item.classNm);
            element.style.width = '40px';
            element.style.backgroundColor = color;
            element.style.height = '40px';
            element.style.position = 'absolute';
            element.style.opacity = '0.5';

            const posX = parseFloat(itemPos.posX);
            const posY = parseFloat(itemPos.posY);
            const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, 40, 40); // 이미지 좌표를 뷰포트 좌표로 변환
            viewer.value.addOverlay({
              element: element,
              location: overlayRect
            });
          }
        }
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
              Height: "3311",
              Width: "3317"
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
  viewer.value.addHandler('zoom', drawLines);
  if (isGrid.value) {
    drawLines();
  } else {
    removeGridLines();
  }
}

const drawLines = () => {
  removeGridLines();
  if (isGrid.value) {
    const imageHeight = viewer.value.world.getItemAt(0).getContentSize().y;
    const imageWidth = viewer.value.world.getItemAt(0).getContentSize().x;
    const zoom = viewer.value.viewport.getZoom();

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
  viewer.value.container.appendChild(lineElement);
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
      element.style.left = (viewer.value.canvas.clientWidth / 2) - (rulerPos.value.width / 2) + 'px'
    } else {
      element.style.left = rulerPos.value.left + 'px'
    }

    if (rulerPos.value.top === 0) {
      element.style.top = (viewer.value.canvas.clientHeight / 2) - (rulerPos.value.height / 2) + 'px'
    } else {
      element.style.top = rulerPos.value.top + 'px'
    }

    refreshRuler(element, rulerSize, ruler);
    divtilingViewer.appendChild(element)

    let isPress = false

    element.onmousedown = function (e) {
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

    element.onmouseup = function () {
      isPress = false
    }

    element.onwheel = function (e) {
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
      parent.onmousemove = function (e) {
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

const refreshRuler = (element: any, rulerSize: any, ruler: any) => {
  if (typeof rulerSize === 'object') {
    rulerSize = rulerSize.value;
  }
  if (document.getElementById('rulerTitle') !== null) {
    element.removeChild(document.getElementById('rulerTitle'))
  }

  let rSize = 1
  if (rulerSize > 5) {
    rSize = rSize + (0.06 * (rulerSize - 5))
  }

  let zoomRatio = viewer.value.viewport.viewportToImageZoom(viewer.value.viewport.getZoom())

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
        '<line x1="' + startX + '" y1="' + (startY - 5) + '" x2="' + startX + '" y2="' + (endY + 5) + '" stroke="black" stroke-width="2"/>' +
        '<line x1="' + endX + '" y1="' + (endY - 5) + '" x2="' + endX + '" y2="' + (endY + 5) + '" stroke="black" stroke-width="2"/>' +
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


.btn-imgsetbox {
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
  position: relative; /* 수정 */
}

#tiling-viewer {
  position: relative;
  width: 100%;
  height: 80vh;
}

.rbc-container {
  height: 85vh;
}

.btn-container {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
}

</style>