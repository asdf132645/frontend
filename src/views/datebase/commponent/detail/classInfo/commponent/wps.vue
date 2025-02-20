<template>
  <div :class="'wpsDiv main ' + (cbcLayer ? 'cbcLayer' : '')">
    <div class="tiling-viewer_img_list-box_img_list" style="border-radius: 4px">
      <div ref="tilingViewerLayer"
           id="tilingViewerImgListWps"
           class="tilingViewerImgListWps" style="width: 100%;"></div>
    </div>
    <img v-show="imgOn && !hideSideNavigatorImage" id="background-image"
         :src="backgroundImage"
         class="background-image"/>
    <div v-if="!imgOn" class="selectImgWarn">
      <p class="hand-pointer">
        <font-awesome-icon :icon="['fas', 'arrow-pointer']"/>
      </p>
      <span>Please select an class image.</span>
    </div>
  </div>
  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
  />
</template>
<script setup lang="ts">
import {computed, defineProps, onMounted, ref, watch} from "vue";
import OpenSeadragon from "openseadragon";
import {useStore} from "vuex";
import {readDziFile, readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {openseadragonPrefixUrl} from "@/common/lib/utils/assetUtils";
import {MESSAGES} from "@/common/defines/constants/constantMessageText";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {apiUrl} from "@/common/api/apiUrl";

const store = useStore();
const props = defineProps(['wpsImgClickInfoData', 'slotId', 'selectItems']);
const wps = ref<any>({});
const tilingViewerLayer = ref(null);
let viewer: any = ref<any>(null);
const canvasCurrentHeight = ref('0');
const canvasCurrentWitdh = ref('0');
const fileNameResultArr = ref<any>([]);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const apiBaseUrl = window.LINUX_SERVER_SET ? window.EQUIPMENTPCIP : window.APP_API_BASE_URL;
const iaRootPath = ref<any>(store.state.commonModule.iaRootPath);
const canvasOverlay = ref<any>(null);
const backgroundImage = ref('');
const hideSideNavigatorImage = ref(false);
const imgOn = ref(false);
const findWbcClass = ref<any>([]);
const localSlotId = ref('');
let isZoomed = ref(true);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);
const emit = defineEmits(['borderDel', 'borderOn', 'wpsIsSelected']);
let currentOverlay: HTMLElement | null = null;
const imgType = ref('');

watch(() => props.wpsImgClickInfoData, async (newVal) => {
  // slotId가 변경된 경우
  if (localSlotId.value !== props.slotId) {
    const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path
        ? props.selectItems?.img_drive_root_path
        : iaRootPath.value;
    const tilingViewerLayer = document.getElementById('tilingViewerImgListWps');
    if (tilingViewerLayer) {
      localSlotId.value = props.slotId;
      tilingViewerLayer.innerHTML = ''; // 기존 내용 삭제

      // OpenSeadragon 초기화
      if (viewer.value) {
        viewer.value.destroy(); // 기존 뷰어 인스턴스 파괴
      }

      const folderPath = `${path}/${props.slotId}/04_WPS/WPS_files/0`;
      const url = `${apiBaseUrl}/folders?folderPath=${folderPath}`;
      const res = await fetch(url);
      const a = await res.json();

      imgType.value = a[0].split('.')[1];


      const url_new = `${path}/${props.slotId}/04_WPS/WPS.json`;
      const response_new = await readJsonFile({fullPath: url_new});
      findWbcClass.value = response_new.data;
      await wpsInitElement();
      wps.value = newVal;

    }
    const currentClass = findWbcClass.value.find((el: any) => el.FILE_NM === newVal.img.fileName.split('_').slice(2).join('_'));
    if (!currentClass) {
      toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
      showToast('Selected image does not have corresponding coordinates.');
      emit('borderDel');
    }
  } else {
    // slotId는 동일하지만 wpsImgClickInfoData만 변경된 경우
    if (viewer.value) {
      isZoomed.value = false;
      // 네비게이션 바 위치 조정
      const currentClass = findWbcClass.value.find((el: any) => el.FILE_NM === newVal.img.fileName.split('_').slice(2).join('_'));
      if (currentClass) {
        const {x1, x2, y1, y2} = currentClass;
        adjustNavBar(x1, x2, y1, y2);

        // drawBoxOnCanvas 호출
        const { boxX1, boxY1, boxWidth, boxHeight } = boxCoordinateReturn(currentClass);

        emit('borderOn');
        wps.value = newVal;
        // await drawBoxAllCanvas(findWbcClass.value);
        await drawBoxOnCanvas(boxX1, boxY1, boxWidth, boxHeight, findWbcClass.value);

      } else {
        toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
        showToast('Selected image does not have corresponding coordinates.');
        emit('borderDel');
      }


    }
  }
}, {deep: true});

const adjustNavBar = (x1: number, x2: number, y1: number, y2: number) => {
  const navBar = document.querySelector('.openseadragon-container .navigator');
  const navBarCanvas = document.querySelector('.openseadragon-container .navigator .openseadragon-canvas');
  const parentElement = navBar?.parentNode;

  if (parentElement) {
    navBarCanvas?.classList.add('nav-bar-canvas');

    parentElement?.classList.add('opacityZero');  // 배경 이미지보다 앞에 위치하도록 설정
    parentElement.style.zIndex = '10';  // 배경 이미지보다 앞에 위치하도록 설정
    parentElement.style.position = 'relative';

    // 네비게이션 바의 위치 및 크기 적용
    parentElement.style.width = `130px`;
    parentElement.style.height = `375px`;
  }

  if (navBar) {
    navBar.classList.add('custom-nav-bar-canvas');
    const realWidth = Number(x2) - Number(x1);
    const realHeight = Number(y2) - Number(y1);

    // 배경 이미지 축소 비율에 맞춰 좌표와 크기 계산
    const scaleFactor = 0.5;  // 1/2 비율로 축소
    const left = x1 * scaleFactor;
    const top = y1 * scaleFactor;
    navBar.style.position = 'absolute';
    navBar.style.width = `${realWidth * scaleFactor}px`;
    navBar.style.height = `${realHeight * scaleFactor}px`;
    // 네비게이션 바의 위치 및 크기 적용
    navBar.style.left = `${left}px`;
    navBar.style.top = `${top}px`;
  }

}


const wpsInitElement = async () => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const folderPath = `${path}/${props.slotId}/04_WPS`;
  backgroundImage.value = `${apiUrl()}/images/getImageRealTime?folder=${folderPath}&imageName=slide.jpg`;
  const tilesInfo = await fetchTilesInfo(folderPath);

  try {
    viewer.value = OpenSeadragon({
      id: "tilingViewerImgListWps",
      animationTime: 0.4,
      navigatorHeight: (+findWbcClass.value[0].y2 - +findWbcClass.value[0].y1) * 0.5,
      navigatorWidth: (+findWbcClass.value[0].x2 - +findWbcClass.value[0].x1) * 0.5,
      showNavigator: !hideSideNavigatorImage.value,
      navigatorAutoFade: true, // 네비게이터가 자동으로 숨겨지지 않도록 설정
      sequenceMode: true,
      defaultZoomLevel: 1,
      navigatorBackground: "transparent",
      prefixUrl: openseadragonPrefixUrl(apiUrl()),
      tileSources: tilesInfo,
      showReferenceStrip: false,
      showFullPageControl: false,
      showSequenceControl: false,
      showZoomControl: false,
      showHomeControl: false,
      gestureSettingsMouse: {clickToZoom: false},
      minZoomLevel: 1,
      zoomPerClick: 1.2,
      zoomPerScroll: 1.2,
      viewportMargins: {top: 0, left: 0, bottom: 0, right: 0},
      visibilityRatio: 1.0,
    });

    const navigatorButton = new OpenSeadragon.Button({
      tooltip: 'Toggle Navigator',
      srcRest: openseadragonPrefixUrl(apiBaseUrl) + 'home_rest.png',
      srcGroup: openseadragonPrefixUrl(apiBaseUrl) + 'home_grouphover.png',
      srcHover: openseadragonPrefixUrl(apiBaseUrl) + 'home_hover.png',
      srcDown: openseadragonPrefixUrl(apiBaseUrl) + 'home_pressed.png',

      onClick: () => {
        hideSideNavigatorImage.value = !hideSideNavigatorImage.value;
        const nav = viewer.value.navigator?.element;
        if (nav) nav.style.display = nav.style.display === 'none' ? 'block' : 'none';
      }
    })

    viewer.value.buttonGroup.buttons.push(navigatorButton);
    viewer.value.buttonGroup.element.appendChild(navigatorButton.element);

    const canvas = document.createElement('canvas');
    viewer.value.addOverlay({
      element: canvas,
      location: new OpenSeadragon.Rect(0, 0, 1, 1),
    });


    canvas.id = 'myCanvas';
    canvasOverlay.value = canvas;

    viewer.value.addHandler('open', async function (event: Event) {
      imgOn.value = true;

      // 캔버스 크기를 조정
      canvas.width = event.source.Image.Size.Width;
      canvas.height = event.source.Image.Size.Height;

      // 예시 확대 - 특정 좌표에 맞춰 확대
      const zoomRect = new OpenSeadragon.Rect(0.1, 0.1, 0.2, 0.2); // 비율로 설정
      viewer.value.viewport.fitBounds(zoomRect);

      adjustNavBar(findWbcClass.value[0].x1, findWbcClass.value[0].x2, findWbcClass.value[0].y1, findWbcClass.value[0].y2);
      // FILE_NM
      const extracted = props.wpsImgClickInfoData.img.fileName.split('_').slice(2).join('_');
      const findWbcClassVal = findWbcClass.value.find((el: any) => {
        return el.FILE_NM === extracted
      })
      if (findWbcClassVal) {
        const { boxX1, boxY1, boxWidth, boxHeight } = boxCoordinateReturn(findWbcClassVal);
        await drawBoxAllCanvas(findWbcClass.value);
        await drawBoxOnCanvas(boxX1, boxY1, boxWidth, boxHeight, findWbcClass.value);

      }
    });
    viewer.value.addHandler('canvas-click', function (event) {
      // OpenSeadragon의 좌표를 캔버스 좌표로 변환
      const webPoint = event.position; // 클릭 위치 (뷰어의 웹 좌표)
      const viewportPoint = viewer.value.viewport.pointFromPixel(webPoint); // 뷰포트 좌표
      const imagePoint = viewer.value.viewport.viewportToImageCoordinates(viewportPoint); // 이미지 좌표

      // 클릭 좌표
      const clickX = imagePoint.x;
      const clickY = imagePoint.y;

      // 박스 클릭 확인
      findWbcClass.value.forEach((box) => {
        const { POSX1, POSY1, POSX2, POSY2 } = box;
        const boxX1F = Number(POSX1);
        const boxY1F = Number(POSY1);
        const boxX2F = Number(POSX2);
        const boxY2F = Number(POSY2);

        if (clickX >= boxX1F && clickX <= boxX2F && clickY >= boxY1F && clickY <= boxY2F) {
          const { boxX1, boxY1, boxWidth, boxHeight } = boxCoordinateReturn(box);
          drawBoxOnCanvas(boxX1, boxY1, boxWidth, boxHeight, findWbcClass.value);
          emit('wpsIsSelected', box);
        }
      });
    });


    isZoomed.value = false;


  } catch (e) {
    console.error("Error initializing viewer:", e);
  }
}

const boxCoordinateReturn = (box: any) => {
  const boxX1 = Number(box.POSX1); // 박스의 시작 X 좌표
  const boxY1 = Number(box.POSY1); // 박스의 시작 Y 좌표
  const boxX2 = Number(box.POSX2); // 박스의 시작 X 좌표
  const boxY2 = Number(box.POSY2); // 박스의 시작 Y 좌표

  const boxWidth = Number(boxX2) - Number(boxX1);// 박스의 너비
  const boxHeight = Number(boxY2) - Number(boxY1); // 박스의 높이

  return { boxX1, boxY1, boxWidth, boxHeight }
}

const zoomToBox = (x: any, y: any, width: any, height: any) => {
  if (isZoomed.value) return;  // 이미 줌이 설정된 경우, 더 이상 실행하지 않음

  if (viewer.value) {
    // OpenSeadragon 뷰포트 좌표로 변환
    let viewportRect = viewer.value.viewport.imageToViewportRectangle(x, y, width, height);

    // 4배 확대를 위해 영역 크기 축소
    const zoomFactor = 0.09;
    const adjustedRect = new OpenSeadragon.Rect(
        viewportRect.x + viewportRect.width * (1 - 1 / zoomFactor) / 2, // 중심점 기준으로 위치 조정
        viewportRect.y + viewportRect.height * (1 - 1 / zoomFactor) / 2,
        viewportRect.width / zoomFactor, // 크기 축소
        viewportRect.height / zoomFactor
    );

    // 뷰포트를 해당 영역으로 확대
    viewer.value.viewport.fitBounds(adjustedRect, true);
  }
  isZoomed.value = true;  // 줌 설정 후 플래그를 true로 설정해야 줌이 계속 실행되지 않음
};

const drawBoxAllCanvas = async (findWbcClass: any) => {
  for (const el of findWbcClass) {
    const { boxX1, boxY1, boxWidth, boxHeight } = boxCoordinateReturn(el);

    const overlayDiv = document.createElement('div');
    overlayDiv.style.border = '2px solid red'; // 박스 스타일
    overlayDiv.style.position = 'absolute'; // 위치 설정
    overlayDiv.style.width = `${boxWidth}%`; // 뷰포트에 비례한 너비
    overlayDiv.style.height = `${boxHeight}%`; // 뷰포트에 비례한 높이
    overlayDiv.style.cursor = 'pointer';

    // 이미지 좌표를 뷰포트 좌표로 변환
    const overlayRect = viewer.value.viewport.imageToViewportRectangle(boxX1, boxY1, Number(boxWidth), Number(boxHeight));

    // 오버레이 추가
    viewer.value.addOverlay({
      element: overlayDiv,
      location: overlayRect,
    });
  }
//
}

const drawBoxOnCanvas = async (x: number, y: number, width: number, height: number, findWbcClass: any) => {
  if (!viewer.value) return;
  // 이전 오버레이 삭제
  if (currentOverlay) {
    viewer.value.removeOverlay(currentOverlay);
    currentOverlay = null;
  }
  // 새로운 오버레이 생성
  const overlayDiv = document.createElement('div');
  overlayDiv.style.border = '2px solid #20eaa7'; // 박스 스타일
  overlayDiv.style.position = 'absolute'; // 위치 설정
  overlayDiv.style.width = `${width}%`; // 뷰포트에 비례한 너비
  overlayDiv.style.height = `${height}%`; // 뷰포트에 비례한 높이

  // 이미지 좌표를 뷰포트 좌표로 변환
  const overlayRect = viewer.value.viewport.imageToViewportRectangle(Number(x), Number(y), Number(width), Number(height));

  // 오버레이 추가
  viewer.value.addOverlay({
    element: overlayDiv,
    location: overlayRect,
  });

  // 현재 오버레이 요소를 추적
  currentOverlay = overlayDiv;
  // currentBox = { x, y, width, height };

  // 박스에 맞춰 줌
  zoomToBox(x, y, width, height);
};


const fetchTilesInfo = async (folderPath: string) => {
  const url = `${apiBaseUrl}/folders?folderPath=${folderPath}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  } else {
    const fileNames = await response.json();
    const tilesInfo = [];
    fileNameResultArr.value = [];
    for (const fileName of fileNames) {
      if (fileName.endsWith('_files')) {

        const fileNameResult = extractSubStringBeforeFiles(fileName);
        fileNameResultArr.value.push(fileNameResult)
        const {width, height, tileSize} = await dziWidthHeight(fileNameResult);

        tilesInfo.push({
          Image: {
            xmlns: "http://schemas.microsoft.com/deepzoom/2009",
            Type: 'image',
            Url: `${apiBaseUrl}/folders?folderPath=${folderPath}/${fileName}/`,
            Format: imgType.value,
            Overlap: "1",
            TileSize: tileSize,
            buildPyramid: false,
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

const dziWidthHeight = async (): Promise<any> => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const urlImage = `${path}/${props.selectItems.slotId}/04_WPS/WPS.dzi`;
  const imageResponse = await readDziFile({filePath: urlImage});
  return await extractWidthHeightFromDzi(imageResponse);
}

const extractWidthHeightFromDzi = (xmlString: any): any => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const sizeElement = xmlDoc.getElementsByTagName("Size")[0];
  const tileSizeEl = xmlDoc.getElementsByTagName('Image')[0];
  const tileSize = tileSizeEl.getAttribute("TileSize");
  const width = sizeElement.getAttribute("Width");
  const height = sizeElement.getAttribute("Height");
  return {width: Number(width), height: Number(height), tileSize: Number(tileSize)}
}

const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};
</script>