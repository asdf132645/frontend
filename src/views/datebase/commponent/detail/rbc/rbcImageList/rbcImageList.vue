<template>
  <div class="rbc-container imgList">
    <div class="btn-container_img_list">
      <div>
        <button
            @click="toggleViewer('lowMag')"
            class="tab-btn_img_list"
            :class="{ 'active': activeTab === 'lowMag', 'inactive': activeTab !== 'lowMag'}"
        >Low magnification
        </button>
        <button
            @click="toggleViewer('malaria')"
            class="tab-btn_img_list"
            :class="{ 'active': activeTab === 'malaria', 'inactive': activeTab !== 'malaria' }"
        >Malaria
        </button>
      </div>
      <div class='btn-imgsetbox_img_list' ref="imgSetWrap">
        <button class="darkButton" @click="imgSetOpen" v-show="activeTab !== 'malaria'">IMG Setting</button>
        <div class="imgSet_img_list" v-show="imgSet_img_list">
          <div>
            <font-awesome-icon :icon="['fas', 'sun']"/>
            <span>Brightness {{ imgBrightness }}</span>
            <input
                type="range"
                min="50"
                max="120"
                v-model="imgBrightness"
                @input="changeImgBrightness"
            />
            <button class="resetBtn" @click="brightnessReset">Brightness Reset</button>
          </div>
          <div>
            <font-awesome-icon :icon="['fas', 'palette']"/>
            <span>RGB [ {{ `${imageRgb[0]} , ${imageRgb[1]}, ${imageRgb[2]}` }} ]</span>
            <div class="alignItemsCenter">
              <label>R</label>
              <input
                  type="range"
                  min="0"
                  max="255"
                  v-model="imageRgb[0]"
                  @input="changeImageRgb"
              />
            </div>
            <div class="alignItemsCenter">
              <label>G</label>
              <input
                  type="range"
                  min="0"
                  max="255"
                  v-model="imageRgb[1]"
                  @input="changeImageRgb"
              />
            </div>
            <div class="alignItemsCenter">
              <label>B</label>
              <input
                  type="range"
                  min="0"
                  max="255"
                  v-model="imageRgb[2]"
                  @input="changeImageRgb"
              />
            </div>
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
            <div class="ruler_box_img_list">
              <button
                  class="tab-ruler-btn_img_list"
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
    <div class="tiling-viewer_img_list-box_img_list">
      <Malaria v-if="activeTab === 'malaria'" :selectItems="selectItems"/>
      <div v-else-if="activeTab !== 'malaria' && tileExist"
           ref="tilingViewerLayer"
           id="tiling-viewer_img_list" style="width: 100%;"
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
              <li v-if="classInfo.classNm !== 'Poikilocyte'" @click="moveRbcClassEvent(category.categoryId, classInfo.classId, classInfo.classNm)">
                <span>{{ classInfo?.classNm }}</span>
              </li>

              <li v-if="classInfo.classNm === 'Basophilic Stippling'" @click="moveRbcClassEvent('05', '03', 'Malaria')">
                <span>Malaria</span>
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
          <li @click="moveRbcClassEvent('04', '01', 'Platelet')">
            <span>Platelets</span>
          </li>
        </ul>
      </div>

    </template>
  </div>
  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, nextTick, onMounted, ref, watch} from 'vue';
import OpenSeadragon from 'openseadragon';
import {rulers} from '@/common/defines/constFile/rbc';
import {dirName} from "@/common/defines/constFile/settings";
import Malaria from './Malaria.vue';
import {readDziFile, readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {useStore} from "vuex";
import pako from 'pako';
import Alert from "@/components/commonUi/Alert.vue";

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const props = defineProps(['rbcInfo', 'selectItems', 'type', 'classInfoArr', 'isBefore']);
const activeTab = ref('lowMag');

let viewer: any = ref<any>(null);
const imgSet_img_list = ref(false);
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
const newItemClassInfoArr = ref<any>([]);

const store = useStore();
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const apiBaseUrl = viewerCheck.value === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const rbcInfoPathAfter = ref<any>([]);
const classInfoArr = ref<any>([]);
const canvasOverlay = ref<any>(null);
const drawPath = ref<any>([]);
const moveRbcClass = ref<any>([]);
const selectBoxX = ref(0);
const selectBoxY = ref(0);
const emits = defineEmits();
const rightClickItem = ref<any>([]);
const rbcReData = computed(() => store.state.commonModule.rbcReData);
const classInfoArrNewReData = computed(() => store.state.commonModule.classInfoArr);
const canvasCurrentHeight = ref('0');
const canvasCurrentWitdh = ref('0');
const fileNameResultArr = ref<any>([]);
const notCanvasClick = ref(false);
const rbcImagePageNumber = ref(0);

onMounted(async () => {
  rbcImagePageNumber.value = 0;
  await nextTick();
  await initElement();
  document.addEventListener('click', closeSelectBox);
  rightClickItem.value = !props.selectItems.rbcInfo.rbcClass ? props.selectItems.rbcInfo : props.selectItems.rbcInfo.rbcClass;
});

const dziWidthHeight = async (imageFileName: any): Promise<any> => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const urlImage = `${path}/${props.selectItems.slotId}/02_RBC_Image/${imageFileName}.dzi`;
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


const moveRbcClassEvent = async (categoryId: string, classId: string, classNm: string) => {
  const existingOverlays = document.getElementsByClassName('overlayElement');
  if (existingOverlays.length === 0) {
    showErrorAlert('Nothing has been selected');
    return;
  }
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
  let newAsrr = [];
  for (const moveRbcClassItem of moveRbcClass.value) {
    for (const argument of rbcInfoPathAfter.value) {
      // 기존 부분 삭제
      if (moveRbcClassItem.categoryId === argument.categoryId) {
        const foundElementIndex = argument.classInfo.findIndex((el: any) => String(el.index) === moveRbcClassItem.index);
        if (foundElementIndex !== -1) {
          newAsrr.push({
            categoryId: categoryId,
            classNm: classNm,
            classId: classId,
            posX: moveRbcClassItem.posX,
            posY: moveRbcClassItem.posY,
            width: moveRbcClassItem.width,
            height: moveRbcClassItem.height,
            index: String(moveRbcClassItem.index)
          });
          argument.classInfo.splice(foundElementIndex, 1);
        }
      }
      //기존 부분을 li 클릭 한 곳으로 이동
      if (argument.categoryId === categoryId) {
        argument.classInfo.push({
          classNm: classNm,
          classId: classId,
          posX: moveRbcClassItem.posX,
          posY: moveRbcClassItem.posY,
          width: moveRbcClassItem.width,
          height: moveRbcClassItem.height,
          index: String(moveRbcClassItem.index)
        })
      }
    }
  }
  await removeDiv();
  await rbcInfoPathAfterJsonCreate(newAsrr);
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
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const url = `${path}/${props.selectItems?.slotId}/03_RBC_Classification/${props.selectItems?.slotId}_new.json`;
  const response = await readJsonFile({fullPath: url});
  let compareData = [];

  if (response.data !== 'not file') {
    const url = `${path}/${props.selectItems?.slotId}/03_RBC_Classification/${props.selectItems?.slotId}_new.json`;
    const response = await readJsonFile({fullPath: url});
    compareData = [...response.data, ...jsonData];
  } else {
    compareData = jsonData;
  }

  const jsonString = JSON.stringify(compareData);
  const utf8Data = new TextEncoder().encode(jsonString);
  const compressedData = pako.deflate(utf8Data);
  const blob = new Blob([compressedData], {type: 'application/octet-stream'});
  const formData = new FormData();
  formData.append('file', blob, `${props.selectItems?.slotId}_new.json`);
  const filePath = `${path}/${props.selectItems?.slotId}/03_RBC_Classification/${props.selectItems?.slotId}_new.json`
  try {

    const response = await fetch(`${apiBaseUrl}/jsonReader/upload?filePath=${filePath}`, {
      method: 'POST',
      body: formData,
    });
    await response.json();
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


watch(() => props.classInfoArr, (newData) => {
  newItemClassInfoArr.value = newData;

  if (newData.length === 0) {
    removeDiv();
    removeRbcMarker();
    return;
  }

  // 모든 <ol> 요소를 선택하고, data-class-nm 값을 배열로 수집
  const olElements = document.querySelectorAll('ol.overlayElement');

  // newData 배열에서 존재하는 data-class-nm 값을 수집
  const validClassNmSet = new Set(newData.map((el: any) => el.classNm));

  olElements.forEach(el => {
    const classNm = el.getAttribute('data-class-nm');

    // data-class-nm이 newData에 존재하지 않으면 해당 <ol> 요소를 제거
    if (!validClassNmSet.has(classNm)) {
      console.log('Removing <ol> with data-class-nm:', classNm);
      viewer.value.removeOverlay(el);
    }
  });

  // rbcMarker 함수 호출
  rbcMarker(newData, rbcImagePageNumber.value);
}, {deep: true});


watch(classInfoArrNewReData, async (nenenen, oldItem) => {
  if (rbcReData.value) {
    if (nenenen.length === 0) {
      removeDiv();
      removeRbcMarker();
      return;
    }
    await rbcMarker(nenenen, rbcImagePageNumber.value);
    await store.dispatch('commonModule/setCommonInfo', {rbcReData: false});
    await store.dispatch('commonModule/setCommonInfo', {classInfoArr: []});
    return;
  }

}, {deep: true})

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
const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};


const rbcMarker = async (newItem: any, imgNum: any) => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;

  const url_new = `${path}/${props.selectItems.slotId}/03_RBC_Classification/${props.selectItems.slotId}_new.json`;
  const response_new = await readJsonFile({fullPath: url_new});
  const url_Old = `${path}/${props.selectItems.slotId}/03_RBC_Classification/${props.selectItems.slotId}.json`;
  const response_old = await readJsonFile({fullPath: url_Old});
  if (response_new.data !== 'not file') { // 비포 , 애프터에 따른 json 파일 불러오는 부분
    const newJsonData = response_new?.data;
    for (const rbcItem of response_old.data[imgNum].rbcClassList) {
      for (const newRbcData of newJsonData) {
        // 기존 부분 삭제 // 여기서 index 찾아서 새로 생성된 json 부분을 추가해야함
        const foundElementIndex = rbcItem.classInfo.findIndex((el: any) =>
            String(el.index) === String(newRbcData.index)
        );
        if (foundElementIndex !== -1) {
          rbcItem.classInfo.splice(foundElementIndex, 1);
        }
        if (rbcItem.categoryId === newRbcData.categoryId) {
          let sss = {
            classNm: newRbcData.classNm,
            classId: newRbcData.classId,
            posX: String(newRbcData.posX),
            posY: String(newRbcData.posY),
            width: newRbcData.width,
            height: newRbcData.height,
            index: String(newRbcData.index),
          }
          rbcItem.classInfo.push(sss);
        }
      }
    }
    rbcInfoPathAfter.value = response_old.data[imgNum].rbcClassList;
  } else {
    rbcInfoPathAfter.value = response_old?.data[imgNum].rbcClassList;
  }
  classInfoArr.value = newItem;

  if (newItem.length === 0) {
    removeRbcMarker();
  } else {
    await drawRbcMarker(newItem); // 변경된 항목으로 마커 다시 그리기
  }
}


watch(() => props.selectItems, async (newItem) => {
  await nextTick();
  const tilingViewerLayer = document.getElementById('tiling-viewer_img_list');
  if (tilingViewerLayer) {
    tilingViewerLayer.innerHTML = ''; // 기존 내용 삭제

    // OpenSeadragon 인스턴스가 존재하면 초기화하지 않고 캔버스만 업데이트
    if (viewer.value) {
      viewer.value.destroy(); // 기존 뷰어 인스턴스 파괴
    }

    activeTab.value = 'lowMag';
    await initElement();
  }

});

// const rbc

const removeRbcMarker = () => {
  const canvas = canvasOverlay.value;
  if (!canvas) {
    console.error('Canvas element를 찾을 수 없습니다.');
    return null;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('2D context를 가져올 수 없습니다.');
    return null;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  drawPath.value = [];
  return ctx;
};


const drawRbcMarker = async (classInfoArr: any) => {
  // json rbcInfoPathAfter.value 로 그림 그리는곳
  const colors: any = {
    'Normal': 'red',
    'Poikilocyte': 'orange',
    'Target Cell': 'navy',
    'Burr Cell': 'purple',
    'Acanthocyte': '#1E90FF',
    'Ovalocyte': '#800080',
    'Schistocyte': 'magenta',
    'Sickle Cell': '#3CB371',
    'Stomatocyte': '#FFFF00',
    'TearDrop Cell': '#4682B4',
    'Spherocyte': '#FF6347',
    'Howell-Jolly Body': '#FF4500',
    'Basophilic Stippling': '#DDA0DD',
    'Malaria': 'black',
    'Platelet': '#C71585',
  };

  const ctx = removeRbcMarker(); // canvas 초기화
  if (!ctx) {
    console.error('Canvas context 초기화 실패');
    return;
  }

  // classInfoArr -> input 에서 체크된 값
  // rbcInfoPathAfter -> json 데이터
  // 여기서 새로 추가 된 index 로 있나 없나 따지고 after 에서 있으면 비포에서는 보여주지않는다.
  classInfoArr.forEach((info: any) => {
    rbcInfoPathAfter.value.forEach((category: any) => {
      category.classInfo.forEach((classItem: any) => {
        if (classItem.classNm.replace(/\s/g, '') === info.classNm.replace(/\s/g, '') && category.categoryId === info.categoryId) {

          ctx.lineWidth = 3;
          ctx.strokeStyle = `${colors[info.classNm] || 'black'}`;
          let rectPath = new Path2D();
          let width: number;
          let height: number;
          let classItemPosX: number;
          let classItemPosY: number;

          if (classItem?.width) {
            width = classItem.width;
            height = classItem.height;
            classItemPosX = classItem.posX;
            classItemPosY = classItem.posY;
          } else {
            width = Number(classItem.x2) - Number(classItem.x1);
            height = Number(classItem.y2) - Number(classItem.y1);
            classItemPosX = Number(classItem.x1);
            classItemPosY = Number(classItem.y1);
          }

          let ddrr = {
            categoryId: info.categoryId,
            classNm: info.classNm,
            classId: info.classId,
            posX: classItemPosX,
            posY: classItemPosY,
            width: width,
            height: height,
            index: String(classItem.index),
          };
          rectPath.rect(classItemPosX, classItemPosY, width, height);
          drawPath.value.push(ddrr);
          ctx.stroke(rectPath);
        }
      });
    });
  });
  await store.dispatch('commonModule/setCommonInfo', {resetRbcArr: true});
};


const initElement = async () => {
  if (props.selectItems.slotId === undefined) {
    return;
  }
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;

  try {
    const folderPath = `${path}/${props.selectItems.slotId}/${dirName.rbcImageDirName}`;
    const tilesInfo = await fetchTilesInfo(folderPath);

    if (tilesInfo.length !== 0) {
      viewer.value = OpenSeadragon({
        id: "tiling-viewer_img_list",
        animationTime: 0.4,
        navigatorSizeRatio: 0.25,
        showNavigator: true,
        sequenceMode: true,
        defaultZoomLevel: 1,
        prefixUrl: `${apiBaseUrl}/folders?folderPath=D:/UIMD_Data/Res/uimdFe/images/`,
        tileSources: tilesInfo,
        showReferenceStrip: false,
        gestureSettingsMouse: {clickToZoom: false},
        maxZoomLevel: 15,
        minZoomLevel: 1, // 최소 확대 레벨 설정
        zoomPerClick: 1.2, // 클릭 확대 비율 설정
        zoomPerScroll: 1.2, // 스크롤 확대 비율 설정
        viewportMargins: {top: 0, left: 0, bottom: 0, right: 0}, // 뷰포트 여백 설정
        visibilityRatio: 1.0 // 이미지를 뷰포트에 맞추기 위한 비율 설정
      });

      // 마그니파이어 설정 - 동그라미 줌기능
      new OpenSeadragon.MouseTracker({
        element: viewer.value.element,
        moveHandler: function (event) {
          const existingMagCanvas = document.getElementById('magCanvas');
          if (existingMagCanvas) {
            viewer.value.element.removeChild(existingMagCanvas);
          }

          if (!isMagnifyingGlass.value) {
            return;
          }

          const {canvas} = viewer.value.drawer;
          const magCanvas = document.createElement('canvas');
          const magCtx = magCanvas.getContext('2d');
          canvasOverlay.value = magCanvas;
          if (magCtx) {
            const magWidth = 200;
            const magHeight = 200;
            const zoomLevel = 5;

            magCanvas.id = 'magCanvas';
            magCanvas.width = magWidth;
            magCanvas.height = magHeight;
            magCanvas.style.position = 'absolute';
            magCanvas.style.left = `${event.position.x - magWidth / 2}px`;
            magCanvas.style.top = `${event.position.y - magHeight / 2}px`;
            magCanvas.style.border = '1px solid';
            magCanvas.style.borderRadius = '50%';
            magCanvas.style.width = `${magWidth}px`;
            magCanvas.style.height = `${magHeight}px`;
            magCanvas.style.zIndex = '0';

            viewer.value.element.appendChild(magCanvas);

            // 줌을 위한 확대된 부분을 정확히 잘라내기 위해 drawImage 메서드 수정
            magCtx.drawImage(
                canvas,
                event.position.x - (magWidth / 2 / zoomLevel),
                event.position.y - (magHeight / 2 / zoomLevel),
                magWidth / zoomLevel,
                magHeight / zoomLevel,
                0,
                0,
                magWidth,
                magHeight
            );

            magCanvas.style.visibility = event.position.y <= 0 || event.position.x <= 0 ? 'hidden' : 'visible';
          }
        },
      });


      // 캔버스 오버레이 생성 및 추가
      const canvas = document.createElement('canvas');
      const overlay = viewer.value.addOverlay({
        element: canvas,
        location: new OpenSeadragon.Rect(0, 0, 1, 1), // 캔버스가 뷰어 전체를 덮도록 설정
      });
      canvas.id = 'myCanvas';
      canvasOverlay.value = canvas;

      viewer.value.addHandler('open', function (event: any) {
        // 캔버스 크기를 조정
        canvas.width = event.source.Image.Size.Width;
        canvas.height = event.source.Image.Size.Height;
      });

      viewer.value.addHandler('page', function (event: any) {
        const notCanvasClick = !fileNameResultArr.value[event.page].includes('RBC_Image');
        if (!notCanvasClick) {
          rbcImagePageNumber.value = event.page;
          emits('changeCurrentRbcImagePageNumber', event.page);
        }
        emits('notCanvasClick', notCanvasClick);
        // 페이지가 변경될 때 오버레이를 다시 추가
        if (canvas.parentElement !== viewer.value.container) {
          viewer.value.addOverlay({
            element: canvas,
            location: new OpenSeadragon.Rect(0, 0, 1, 1),
          });
        }
        emits('unChecked');
      });

      viewer.value.addHandler('zoom', () => {
        if (activeRuler.value === 'None') {
          return;
        }
        drawRuler(activeRuler.value);
      });

      viewer.value.addHandler('canvas-click', async (event: any) => {
        //
        if (!event.originalEvent.ctrlKey) {
          await removeDiv();
        }
        if (!event.originalEvent.shiftKey) { // 쉬프트 키를 누르지 않았을 때
          const clickPos = viewer.value.viewport.pointFromPixel(event.position);
          const canvasPos = {
            x: clickPos.x * viewer.value.source.width,
            y: clickPos.y * viewer.value.source.height
          };

          for (const item of drawPath.value) {
            const itemPos = item;
            const width = itemPos.width; // 아이템의 너비
            const height = itemPos.height; // 아이템의 높이

            if (
                canvasPos.x >= Number(itemPos.posX) && canvasPos.x <= (Number(itemPos.posX) + width) &&
                canvasPos.y >= Number(itemPos.posY) && canvasPos.y <= (Number(itemPos.posY) + height)
            ) {
              const categoryId = item.categoryId;
              const color = 'lightgreen'; // 연한 연두색
              if (event.originalEvent.ctrlKey) { // 컨트롤 키를 눌렀을 때
                // 기존의 오버레이가 클릭된 위치에 있는지 확인
                const existingOverlay = document.querySelector(`.overlayElement[data-class-posX="${itemPos.posX}"][data-class-posY="${itemPos.posY}"]`);
                if (existingOverlay) {
                  // 클릭된 위치에 이미 오버레이가 있으면 새로 추가하지 않음
                  return;
                }

                moveRbcClass.value.push(item)
                const element = document.createElement('ol');
                element.className = 'overlayElement';
                element.id = 'overlayElement';
                element.setAttribute('data-category-id', categoryId);
                element.setAttribute('data-class-nm', item.classNm);
                element.setAttribute('data-class-posY', itemPos.posY);
                element.setAttribute('data-class-posX', itemPos.posX);
                element.style.width = `${item.width}px`;
                element.style.backgroundColor = color;
                element.style.height = `${item.height}px`;
                element.style.position = 'absolute';
                element.style.opacity = '0.5';

                const posX = parseFloat(itemPos.posX);
                const posY = parseFloat(itemPos.posY);
                const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, itemPos.width, itemPos.height); // 이미지 좌표를 뷰포트 좌표로 변환
                viewer.value.addOverlay({
                  element: element,
                  location: overlayRect
                });
              } else {

                if (
                    canvasPos.x >= Number(itemPos.posX) && canvasPos.x <= (Number(itemPos.posX) + width) &&
                    canvasPos.y >= Number(itemPos.posY) && canvasPos.y <= (Number(itemPos.posY) + height)
                ) {
                  // 클릭된 아이템 처리
                  const categoryId = item.categoryId;
                  const color = 'lightgreen'; // 연한 연두색
                  const classInfo = rbcInfoPathAfter.value.find((category: any) => category.categoryId === categoryId)?.classInfo.find((classItem: any) => classItem.index === item.index);
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
                      const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, itemPos.width, itemPos.height); // 이미지 좌표를 뷰포트 좌표로 변환
                      viewer.value.updateOverlay(previousOverlay, overlayRect);
                    } else {

                      const element = document.createElement('ol');
                      element.className = 'overlayElement';
                      element.id = 'overlayElement';
                      element.setAttribute('data-category-id', categoryId);
                      element.setAttribute('data-class-nm', item.classNm);
                      element.style.width = `${item.width}px`;
                      element.style.backgroundColor = color;
                      element.style.height = `${item.height}px`;
                      element.style.position = 'absolute';
                      element.style.opacity = '0.5';

                      const posX = parseFloat(itemPos.posX);
                      const posY = parseFloat(itemPos.posY);
                      const overlayRect = viewer.value.viewport.imageToViewportRectangle(Number(posX), Number(posY), Number(item.width), Number(item.height)); // 이미지 좌표를 뷰포트 좌표로 변환
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
          const clickPos = viewer.value.viewport.pointFromPixel(event.position);
          const canvasPos = {
            x: clickPos.x * viewer.value.source.width,
            y: clickPos.y * viewer.value.source.height
          };

          // 함수: 클릭 위치가 아이템 위치와 겹치는지 확인
          const isItemSelected = (item: any) => {
            const width = item.width;
            const height = item.height;
            return (
                canvasPos.x >= Number(item.posX) && canvasPos.x <= (Number(item.posX) + width) &&
                canvasPos.y >= Number(item.posY) && canvasPos.y <= (Number(item.posY) + height)
            );
          };

          // 선택된 아이템의 classNm 저장
          let selectItm = '';
          for (const item of drawPath.value) {
            if (item.classNm !== "Normal" && isItemSelected(item)) {
              selectItm = item.classNm;
              break; // 하나의 아이템만 선택됨
            }
          }

          // 선택된 아이템의 classNm에 해당하는 모든 아이템 처리
          for (const item of drawPath.value) {
            if (item.classNm !== "Normal" && selectItm === item.classNm) {
              console.log(item.classNm);
              moveRbcClass.value.push(item);

              const element = document.createElement('ol');
              element.className = 'overlayElement';
              element.id = 'overlayElement';
              element.setAttribute('data-category-id', item.categoryId);
              element.setAttribute('data-class-nm', item.classNm);
              element.style.width = `${item.width}px`; // 픽셀 단위 추가
              element.style.backgroundColor = 'lightgreen';
              element.style.height = `${item.height}px`; // 픽셀 단위 추가
              element.style.position = 'absolute';
              element.style.opacity = '0.5';

              const posX = parseFloat(item.posX);
              const posY = parseFloat(item.posY);
              const overlayRect = viewer.value.viewport.imageToViewportRectangle(posX, posY, item.width, item.height);
              viewer.value.addOverlay({
                element: element,
                location: overlayRect
              });
            }
          }
        }


      });


    }
  } catch (err) {
    console.error('Error:', err);
  }
};
// const drawOverlays = () => {
//   const overlays = drawPath.value; // drawPath에 있는 아이템들을 오버레이로 추가
//   overlays.forEach((item: any) => {
//     const element = document.createElement('div');
//     element.className = 'overlayElement';
//     element.style.background = 'rgba(255, 0, 0, 0.5)'; // 예시 스타일
//     viewer.value?.addOverlay({
//       element: element,
//       location: new OpenSeadragon.Rect(item.x, item.y, item.width, item.height)
//     });
//   });
// };

const fetchTilesInfo = async (folderPath: string) => {
  const url = `${apiBaseUrl}/folders?folderPath=${folderPath}`;
  const response = await fetch(url);

  if (!response.ok) {
    tileExist.value = false;
    throw new Error('Network response was not ok');
  } else {
    const fileNames = await response.json();
    const tilesInfo = [];
    fileNameResultArr.value = [];
    for (const fileName of fileNames) {
      if (fileName.endsWith('_files')) {

        const fileNameResult = extractSubStringBeforeFiles(fileName);
        fileNameResultArr.value.push(fileNameResult)
        const {width, height, tileSize} = await dziWidthHeight(fileNameResult)

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

        canvasCurrentWitdh.value = width;
        canvasCurrentHeight.value = height;
      }
    }
    tileExist.value = true;
    return tilesInfo;
  }
};

const extractSubStringBeforeFiles = (str: string) => {
  const searchString = '_files';
  const endIndex = str.indexOf(searchString);

  if (endIndex !== -1) {
    return str.substring(0, endIndex);
  }

  return str;
}


// Low magnification and Malaria tab
const toggleViewer = (viewerType: string) => {
  switch (viewerType) {
    case 'lowMag':
      activeTab.value = 'lowMag';
      break;
    case 'malaria':
      activeTab.value = 'malaria';
      imgSet_img_list.value = false;
      break;
  }

  if (activeTab.value !== 'malaria') {
    initElement();
    emits('notCanvasClick', false);
  }
};


// Img setting
const imgSetOpen = () => {
  imgSet_img_list.value = !imgSet_img_list.value;
}


// Brightness
const changeImgBrightness = (event: any) => {
  const brightness = event?.target?.value;

  const red = imageRgb.value[0];
  const green = imageRgb.value[1];
  const blue = imageRgb.value[2];

  const imageContainer = document.getElementById('tiling-viewer_img_list');
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

  const imageContainer = document.getElementById('tiling-viewer_img_list');

  if (imageContainer) {
    imageContainer.style.filter = `opacity(0.9) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${brightness}%)`;
  }

}

const rgbReset = () => {
  const brightness = imgBrightness.value;
  imageRgb.value = [0, 0, 0];

  const imageContainer = document.getElementById('tiling-viewer_img_list');
  if (imageContainer) {
    imageContainer.style.filter = `opacity(1) drop-shadow(0 0 0 rgb(0,0,0)) brightness(${brightness}%)`;
  }
};

const brightnessReset = () => {
  imgBrightness.value = 100;
  changeImageRgb();
}


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
  const divtilingViewer = document.getElementById('tiling-viewer_img_list');

  if (divtilingViewer instanceof HTMLElement) {
    const rulerOverlay = document.getElementById('rulerOverlay');
    if (rulerOverlay instanceof HTMLElement) {
      divtilingViewer.removeChild(rulerOverlay);
    }

    const element = document.createElement('div');
    element.id = 'rulerOverlay';
    element.style.position = 'absolute';
    element.style.width = rulerPos.value.width + 'px';
    element.style.height = rulerPos.value.height + 'px';
    element.style.zIndex = '9999999';

    // Zoom level calculation
    const zoom = viewer.value.viewport.getZoom(true);

    if (rulerPos.value.left === 0) {
      element.style.left = (viewer.value.container.clientWidth / 2) - (rulerPos.value.width / 2) + 'px';
    } else {
      element.style.left = (rulerPos.value.left / zoom) + 'px';
    }
    if (rulerPos.value.top === 0) {
      element.style.top = (viewer.value.container.clientHeight / 2) - (rulerPos.value.height / 2) + 'px';
    } else {
      element.style.top = (rulerPos.value.top / zoom) + 'px';
    }

    refreshRuler(element, rulerSize, ruler);
    divtilingViewer.appendChild(element);

    let isPress = false;

    element.onmousedown = function (e) {
      rulerPos.value.prevPosX = e.clientX;
      rulerPos.value.prevPosY = e.clientY;

      if (rulerPos.value.left <= 30) {
        rulerPos.value.left = 31;
      }

      if (rulerPos.value.top <= 80) {
        rulerPos.value.top = 81;
      }

      isPress = true;
    };

    element.onmouseup = function () {
      isPress = false;
    };

    element.onwheel = function (e) {
      if (e.deltaY < 0) {
        if (rulerSize.value < 20) {
          refreshRuler(element, ++rulerSize.value, ruler);
        }
      } else {
        if (rulerSize.value > 5) {
          refreshRuler(element, --rulerSize.value, ruler);
        }
      }
    };

    const parent = document.getElementById('tilingViewer');

    if (parent instanceof HTMLElement) {
      parent.onmousemove = function (e) {
        if (!isPress) {
          return;
        }

        if (rulerPos.value.left <= 30 || rulerPos.value.top <= 80) {
          return;
        }

        rulerPos.value.posX = rulerPos.value.prevPosX - e.clientX;
        rulerPos.value.posY = rulerPos.value.prevPosY - e.clientY;

        rulerPos.value.prevPosX = e.clientX;
        rulerPos.value.prevPosY = e.clientY;

        element.style.left = (element.offsetLeft - rulerPos.value.posX) + 'px';
        element.style.top = (element.offsetTop - rulerPos.value.posY) + 'px';

        rulerPos.value.left = element.offsetLeft;
        rulerPos.value.top = element.offsetTop;
      };
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
  if (ruler.id === 'line' || ruler === 'Line') {
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

  } else if (ruler.id === 'cross' || ruler === 'Cross') {
    const centerX = viewBoxWH.value / 2;
    const centerY = viewBoxWH.value / 2;
    const halfWidth = rulerWidth.value / 2;

    titleElement.innerHTML = '<div style="width: 100%;">' + rulerSize + 'μm' + '</div>' +
        '<svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">' +
        '<line x1="' + (centerX - halfWidth) + '" y1="' + centerY + '" x2="' + (centerX + halfWidth) + '" y2="' + centerY + '" stroke="black" stroke-width="2"/>' +
        '<line x1="' + centerX + '" y1="' + (centerY - halfWidth) + '" x2="' + centerX + '" y2="' + (centerY + halfWidth) + '" stroke="black" stroke-width="2"/>' +
        '</svg>';

    element.appendChild(titleElement);

  } else if (ruler.id === 'circle' || ruler === 'Circle') {
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

