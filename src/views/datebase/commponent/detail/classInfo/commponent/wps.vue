<template>
  <div class="wpsDiv main">
    <div class="tiling-viewer_img_list-box_img_list">
      <div ref="tilingViewerLayer"
           id="tilingViewerImgListWps"
           class="tilingViewerImgListWps" style="width: 100%;"></div>
    </div>
    <img v-show="imgOn && !hideSideNavigatorImage" id="background-image"
         :src="backgroundImage"
         class="background-image"/>
    <div v-if="!imgOn" class="selectImgWarn">
      <p class="hand-pointer">
        <font-awesome-icon :icon="['fas', 'arrow-pointer']" />
      </p>
      <span>Please select an class image.</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, defineProps, ref, watch} from "vue";
import OpenSeadragon from "openseadragon";
import {useStore} from "vuex";
import {readDziFile, readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {openseadragonPrefixUrl} from "@/common/lib/utils/assetUtils";

const store = useStore();
const props = defineProps(['wpsImgClickInfoData', 'slotId', 'selectItems']);
const wps = ref<any>({});
const tilingViewerLayer = ref(null);
let viewer: any = ref<any>(null);
const canvasCurrentHeight = ref('0');
const canvasCurrentWitdh = ref('0');
const fileNameResultArr = ref<any>([]);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const apiBaseUrl = viewerCheck.value === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;
const iaRootPath = ref<any>(store.state.commonModule.iaRootPath);
const canvasOverlay = ref<any>(null);
const backgroundImage = ref('');
const hideSideNavigatorImage = ref(false);
const imgOn = ref(false);

watch(() => props.wpsImgClickInfoData, async (newVal) => {
      wps.value = newVal;
      const tilingViewerLayer = document.getElementById('tilingViewerImgListWps');
      if (tilingViewerLayer) {
        tilingViewerLayer.innerHTML = ''; // 기존 내용 삭제

        // OpenSeadragon 인스턴스가 존재하면 초기화하지 않고 캔버스만 업데이트
        if (viewer.value) {
          viewer.value.destroy(); // 기존 뷰어 인스턴스 파괴
        }

        await wpsInitElement();
      }
    },
    {deep: true}
);
const adjustNavBar = (x1: any, x2: any, y1: any, y2: any) => {
  const navBar = document.querySelector('.openseadragon-container .navigator');
  const navBarCanvas = document.querySelector('.openseadragon-container .navigator .openseadragon-canvas');
  const parentElement = navBar?.parentNode;

  if (parentElement) {
    // parentElement.classList.add('nav-bar-custom');
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
    // 배경 이미지 축소 비율에 맞춰 좌표와 크기 계산
    const scaleFactor = 0.5;  // 1/2 비율로 축소
    const left = x1 * scaleFactor;
    const top = y1 * scaleFactor;
    // const width = (x2 - x1) * scaleFactor;
    // const height = (y2 - y1) * scaleFactor;
    navBar.style.position = 'absolute';
    // 네비게이션 바의 위치 및 크기 적용
    navBar.style.left = `${left}px`;
    navBar.style.top = `${top}px`;
    // navBar.style.width = `${width}px`;
    // navBar.style.height = `${height}px`;
  }

}


const wpsInitElement = async () => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const folderPath = `${path}/${props.slotId}/04_WPS`;
  backgroundImage.value = `${apiBaseUrl}/images/getImageRealTime?folder=${folderPath}&imageName=slide.jpg`;
  const tilesInfo = await fetchTilesInfo(folderPath);

  try {
    viewer.value = OpenSeadragon({
      id: "tilingViewerImgListWps",
      animationTime: 0.4,
      navigatorSizeRatio: 0.05,
      showNavigator: !hideSideNavigatorImage.value,
      navigatorAutoFade: false, // 네비게이터가 자동으로 숨겨지지 않도록 설정
      sequenceMode: true,
      defaultZoomLevel: 1,
      navigatorBackground: "transparent",
      prefixUrl: openseadragonPrefixUrl(apiBaseUrl),
      tileSources: tilesInfo,
      showReferenceStrip: false,
      showFullPageControl: false,
      showSequenceControl: false,
      showZoomControl: false,
      showHomeControl: false,
      gestureSettingsMouse: {clickToZoom: false},
      maxZoomLevel: 30,
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

    viewer.value.addHandler('open', function (event) {
      adjustNavBar(40, 100, 170, 210);
      imgOn.value = true;
      const fullPageButton = viewer.value.buttons.buttons.find((button) => button.tooltip === 'Toggle full page');

      if (fullPageButton) {
        fullPageButton.element.addEventListener('click', async () => {
          if (viewer.value.isFullPage()) {
            await document.exitFullscreen();
            viewer.value.setFullPage(false);
          } else {
            viewer.value.setFullPage(true);
          }
        });

      }

      // 캔버스 크기를 조정
      canvas.width = event.source.Image.Size.Width;
      canvas.height = event.source.Image.Size.Height;

      // 예시 확대 - 특정 좌표에 맞춰 확대
      const zoomRect = new OpenSeadragon.Rect(0.1, 0.1, 0.2, 0.2); // 비율로 설정
      viewer.value.viewport.fitBounds(zoomRect);
    });

    const drawBoxOnCanvas = async (x, y, width, height) => {
      if (!viewer.value) return;

      // OpenSeadragon의 `addOverlay` 사용
      const overlayDiv = document.createElement('div');
      overlayDiv.style.border = '2px solid red'; // 박스 스타일
      overlayDiv.style.position = 'absolute'; // 위치 설정
      overlayDiv.style.width = `${width}%`; // 뷰포트에 비례한 너비
      overlayDiv.style.height = `${height}%`; // 뷰포트에 비례한 높이



      const overlayRect = viewer.value.viewport.imageToViewportRectangle(Number(x), Number(y), Number(width), Number(height)); // 이미지 좌표를 뷰포트 좌표로 변환
      viewer.value.addOverlay({
        element: overlayDiv,
        location: overlayRect
      });

      await zoomToBox(x, y, width, height); // 박스에 맞춰 줌

    };




    let isZoomed = false;

    const zoomToBox = (x, y, width, height) => {
      if (isZoomed) return;  // 이미 줌이 설정된 경우, 더 이상 실행하지 않음

      // // 이미지 크기 가져오기
      const imageWidth = Number(canvasCurrentWitdh.value);
      const imageHeight = Number(canvasCurrentHeight.value);


      // x, y, width, height를 뷰포트 좌표로 변환
      const viewportX = x / imageWidth;
      const viewportY = y / imageHeight;
      const viewportWidth = width / imageWidth;
      const viewportHeight = height / imageHeight;

      // 현재 줌 레벨 가져오기
      const currentZoom = viewer.value.viewport.getZoom();

      // 줌 비율을 이미지 크기와 뷰포트 비율에 맞게 계산
      const zoomLevel = Math.min(currentZoom * 2, 2); // 줌 레벨 제한 (최대 줌 비율 4배)

      // 줌 비율 적용
      viewer.value.viewport.zoomTo(zoomLevel);

      // 주어진 영역에 맞춰서 뷰포트 영역 조정
      const newCenterX = viewportX + viewportWidth / 2;
      const newCenterY = viewportY + viewportHeight / 2;
      viewer.value.viewport.panTo(new OpenSeadragon.Point(newCenterX, newCenterY));

      isZoomed = true;  // 줌 설정 후 플래그를 true로 설정해야 줌이 계속 실행되지 않음

      // 박스를 그리기 위한 추가 함수 호출
    };



    viewer.value.addHandler('animation',async () => {
      // FILE_NM
      // console.log(props.wpsImgClickInfoData.img.fileName)
      const extracted = props.wpsImgClickInfoData.img.fileName.split('_').slice(2).join('_');
      const url_new = `${path}/${props.slotId}/04_WPS/WPS.json`;

      const response_new = await readJsonFile({fullPath: url_new});
      const findWbcClass = response_new.data.find((el: any) => {return el.FILE_NM === extracted})
      console.log(findWbcClass)
      if(findWbcClass){
        const boxX1 = Number(findWbcClass.POSX1); // 박스의 시작 X 좌표
        const boxY1 = Number(findWbcClass.POSY1); // 박스의 시작 Y 좌표
        const boxX2 = Number(findWbcClass.POSX2); // 박스의 시작 X 좌표
        const boxY2 = Number(findWbcClass.POSY2); // 박스의 시작 Y 좌표

        const boxWidth = Number(boxX2) - Number(boxX1);// 박스의 너비
        const boxHeight = Number(boxY2) - Number(boxY1); // 박스의 높이

        drawBoxOnCanvas(boxX1, boxY1, boxWidth, boxHeight);

      }
    });

  } catch (e) {
    console.error("Error initializing viewer:", e);
  }
}


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
        const {width, height, tileSize} = await dziWidthHeight(fileNameResult)
        tilesInfo.push({
          Image: {
            xmlns: "http://schemas.microsoft.com/deepzoom/2009",
            Type: 'image',
            Url: `${apiBaseUrl}/folders?folderPath=${folderPath}/${fileName}/`,
            Format: "jpg",
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

const dziWidthHeight = async (imageFileName: any): Promise<any> => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const urlImage = `${path}/${props.selectItems.slotId}/04_WPS/WPS.dzi`;
  const imageResponse = await readDziFile({filePath: urlImage});
  return await extractWidthHeightFromDzi(`WPS_files`, imageResponse);
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
</script>