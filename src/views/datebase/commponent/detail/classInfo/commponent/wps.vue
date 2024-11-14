<template>
  <div class="wpsDiv main">
    <div class="tiling-viewer_img_list-box_img_list">
      <div ref="tilingViewerLayer"
           id="tilingViewerImgListWps"
           class="tilingViewerImgListWps" style="width: 100%;"></div>
    </div>
    <img v-if="imgOn && !hideSideNavigatorImage" id="background-image"
         :src="backgroundImage"
         class="background-image"/>
    <div v-else class="selectImgWarn">
      <p class="hand-pointer">
        <font-awesome-icon :icon="['fas', 'arrow-pointer']" />
      </p>
      <span>Please select an image.</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, defineProps, ref, watch} from "vue";
import OpenSeadragon from "openseadragon";
import {useStore} from "vuex";
import {readDziFile} from "@/common/api/service/fileReader/fileReaderApi";

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
  const folderPath = `${path}/${props.slotId}/02_WBC_Image`;
  backgroundImage.value = `${apiBaseUrl}/images/getImageRealTime?folder=${folderPath}&imageName=slideImg.jpg`;
  const tilesInfo = await fetchTilesInfo(folderPath);

  try {
    viewer.value = OpenSeadragon({
      id: "tilingViewerImgListWps",
      animationTime: 0.4,
      navigatorSizeRatio: 0.05,
      showNavigator: !hideSideNavigatorImage.value,
      sequenceMode: true,
      defaultZoomLevel: 1,
      navigatorBackground: "transparent",
      prefixUrl: `${apiBaseUrl}/folders?folderPath=D:/UIMD_Data/Res/uimdFe/images/`,
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
      navigator: {
        autoHide: false // 네비게이터가 자동으로 숨겨지지 않도록 설정
      },
      navImages: {
        toggleNavigator: {
          REST: `${apiBaseUrl}/folders?folderPath=D:/UIMD_Data/Res/uimdFe/images/home_reset.png`,
          GROUP: `${apiBaseUrl}/folders?folderPath=D:/UIMD_Data/Res/uimdFe/images/home_grouphover.png`,
          HOVER: `${apiBaseUrl}/folders?folderPath=D:/UIMD_Data/Res/uimdFe/images/home_hover.png`,
          DOWN: `${apiBaseUrl}/folders?folderPath=D:/UIMD_Data/Res/uimdFe/images/home_pressed.png`
        }
      }
    });

    const navigatorButton = new OpenSeadragon.Button({
      tooltip: 'Toggle Navigator',
      srcReset: viewer.value.navImages.toggleNavigator.RESET,
      srcGroup: viewer.value.navImages.toggleNavigator.GROUP,
      srcHover: viewer.value.navImages.toggleNavigator.HOVER,
      srcDown: viewer.value.navImages.toggleNavigator.DOWN,

      onClick: () => {
        hideSideNavigatorImage.value = !hideSideNavigatorImage.value;
        const nav = viewer.value.navigator.element;
        nav.style.display = nav.style.display === 'none' ? 'inline-block' : 'none';
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

    const drawBoxOnCanvas = (x, y, width, height) => {
      const canvas = canvasOverlay.value;
      const ctx = canvas.getContext('2d');

      // 캔버스 크기와 뷰포트 비율을 고려한 변환
      const imageWidth = viewer.value.world.getItemAt(0).getContentSize().x;
      const imageHeight = viewer.value.world.getItemAt(0).getContentSize().y;

      const scaleX = canvas.width / imageWidth;
      const scaleY = canvas.height / imageHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height); // 기존 그려진 내용 지우기
      ctx.beginPath();
      ctx.strokeStyle = 'red'; // 박스 색상
      ctx.lineWidth = 2; // 박스 두께
      let rectPath = new Path2D();

      // 캔버스에서의 좌표계에 맞게 그리기
      rectPath.rect(x * scaleX, y * scaleY, width * scaleX, height * scaleY);
      ctx.stroke(rectPath);
    };


    let isZoomed = false;  // 줌이 설정된 상태를 추적하는 변수

    const zoomToBox = (x, y, width, height) => {
      if (isZoomed) return;  // 이미 줌이 설정된 경우, 더 이상 실행하지 않음

      // 이미지 크기 가져오기
      const imageWidth = viewer.value.world.getItemAt(0).getContentSize().x;
      const imageHeight = viewer.value.world.getItemAt(0).getContentSize().y;

      // x, y, width, height를 뷰포트 좌표로 변환
      const viewportX = x / imageWidth;
      const viewportY = y / imageHeight;
      const viewportWidth = width / imageWidth;
      const viewportHeight = height / imageHeight;

      // 이미지가 너무 커서 확대가 심한 경우, 적절한 줌 비율을 계산하여 제한
      const zoomLevel = Math.min(viewer.value.viewport.getZoom() * 2, 4); // 줌 레벨 제한 4

      // 줌 비율 적용
      viewer.value.viewport.zoomTo(zoomLevel);

      // 주어진 영역에 맞춰서 뷰포트 영역 조정
      viewer.value.viewport.panTo(new OpenSeadragon.Point(viewportX + viewportWidth / 2, viewportY + viewportHeight / 2));

      isZoomed = true;  // 줌 설정 후 플래그를 true로 설정해야 줌이 계속 실행되지 않음
    };


    viewer.value.addHandler('animation', () => {
      const boxX1 = 1400; // 박스의 시작 X 좌표
      const boxY1 = 2000; // 박스의 시작 Y 좌표
      const boxX2 = 2400; // 박스의 시작 X 좌표
      const boxY2 = 1000; // 박스의 시작 Y 좌표

      const boxWidth = Number(boxX2) - Number(boxX1);// 박스의 너비
      const boxHeight = Number(boxY2) - Number(boxY1); // 박스의 높이

      drawBoxOnCanvas(boxX1, boxY1, boxWidth, boxHeight); // 박스 그리기
      zoomToBox(boxX1, boxY1, boxWidth, boxHeight); // 박스에 맞춰 줌

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
            Url: `${apiBaseUrl}/folders?folderPath=${folderPath}/${fileName}/`,
            Format: "png",
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
  const urlImage = `${path}/${props.selectItems.slotId}/02_WBC_Image/low_stitched_files.dzi`;
  const imageResponse = await readDziFile({filePath: urlImage});
  return await extractWidthHeightFromDzi(`low_stitched_files`, imageResponse);
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