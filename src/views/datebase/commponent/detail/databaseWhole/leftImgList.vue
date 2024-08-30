<template>
  <div class="closeViewer" @click="closeViewer" v-if="buttonOfen">x</div>
  <div id="viewerSmall"></div>
  <div class="leftImgList">
    <ul class="leftImgUl">
      <p>Partical Image</p>
      <li v-for="(image, index) in paImages" :key="index" class="leftImgLi">
        <img :src="getImageUrlsSmallImg(image, 'particle')" alt="Partical Image"
             @dblclick="openInViewer(getImageUrls(image, 'particle'), '02_Particle_Image')">
      </li>
    </ul>
    <ul class="leftImgUl">
      <p>Ideal Zone</p>
      <li v-for="(image, index) in idealZoneImages" :key="index" class="leftImgLi" style="width:100px">
        <img :src="getImageUrlsSmallImg(image, 'idealZone')"
             @dblclick="openInViewer(getImageUrls(image, 'idealZone'),'03_Cell_Ideal_Image')">
      </li>
    </ul>
    <ul class="leftImgUl">
      <div>
        <p>Ideal stitch</p>
        <li v-for="(image, index) in idealStitchImages" :key="index" class="leftImgLi">
          <img :src="getImageUrlsSmallImg(image, 'idealStitch')"
               @dblclick="openInViewer(getImageUrls(image, 'idealStitch'), '04_Cell_Ideal_Stitch_Image')">
        </li>
      </div>
      <div>
        <p>Megakaryocyte</p>
        <li v-for="(image, index) in megaImages" :key="index" class="leftImgLi">
          <img :src="getImageUrlsSmallImg(image, 'mega')"
               @dblclick="openInViewer(getImageUrls(image, 'mega'),'05_Mega_Image')">
        </li>
      </div>
    </ul>
  </div>

</template>

<script setup lang="ts">
import {computed, defineProps, nextTick, onMounted, ref, watch} from "vue";
import OpenSeadragon from "openseadragon";
import axios from "axios";
import {useStore} from "vuex";
import {readDziFile} from "@/common/api/service/fileReader/fileReaderApi";

const props = defineProps(['selectItems']);

const store = useStore();
const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';

const paImages = ref([]);
const idealZoneImages = ref([]);
const idealStitchImages = ref([]);
const megaImages = ref([]);
const strArray = ['02_Particle_Image', '03_Cell_Ideal_Image', '04_Cell_Ideal_Stitch_Image', '05_Mega_Image'];
const buttonOfen = ref(false);
let viewerSmall: any = null;
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);

onMounted(async () => {
  await nextTick();
  await getImgUrl();
});

watch(() => props.selectItems, async (newItem) => {
  await getImgUrl();
});

const getImageUrls = (imageName: string, type: string) => {
  let folderName;
  switch (type) {
    case 'particle':
      folderName = '02_Particle_Image/Thumb';
      break;
    case 'idealZone':
      folderName = '03_Cell_Ideal_Image';
      break;
    case 'idealStitch':
      folderName = '04_Cell_Ideal_Stitch_Image';
      break;
    case 'mega':
      folderName = '05_Mega_Image';
      break;
    default:
      break;
  }
  const slotId = props.selectItems?.slotId || "";
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : sessionStorage.getItem('iaRootPath');
  const folderPath = `${path}/${slotId}/${folderName}`;

  return `${apiBaseUrl}/folders?folderPath=${folderPath}/${imageName}`;
};

const getImageUrlsSmallImg = (imageName: string, type: string) => {
  let folderName;
  const slotId = props.selectItems?.slotId || "";
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : sessionStorage.getItem('iaRootPath');
  let folderPath = ``;
  let returnVal = '';
  switch (type) {
    case 'particle':
      folderName = `02_Particle_Image/${imageName}/10`;
      returnVal = `${apiBaseUrl}/folders/getFilesInFolderWhole?folderPath=${path}/${slotId}/${folderName}/0_0.jpg`;
      break;
    case 'idealZone':
      returnVal = `${apiBaseUrl}/folders/getFilesInFolderWhole?folderPath=${path}/${slotId}/03_Cell_Ideal_Image/${imageName}`;
      break;
    case 'idealStitch':
      folderName = `04_Cell_Ideal_Stitch_Image/${imageName}/10`;
      returnVal = `${apiBaseUrl}/folders/getFilesInFolderWhole?folderPath=${path}/${slotId}/${folderName}/0_0.jpg`;
      break;
    case 'mega':
      folderName = '';
      returnVal = `${apiBaseUrl}/folders/getFilesInFolderWhole?folderPath=${folderPath}/${imageName}`;
      break;
    default:
      break;
  }

  return returnVal;
};

const getImgUrl = () => {
  const slotId = props.selectItems?.slotId || "";
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : sessionStorage.getItem('iaRootPath');

  for (const item of strArray) {
    axios.get(`${apiBaseUrl}/folders?folderPath=${path}/${slotId}/${item}`)
        .then(response => {
          switch (item) {
            case '02_Particle_Image':
              paImages.value = response.data.filter((resp: any) => !resp.includes('.dzi')).slice(0, 7);
              console.log(paImages.value)
              break;
            case '03_Cell_Ideal_Image':
              idealZoneImages.value = response.data.filter((resp: any) => resp !== 'Thumb').slice(0, 14);
              break;
            case '04_Cell_Ideal_Stitch_Image':
              idealStitchImages.value = response.data.filter((resp: any) => !resp.includes('.dzi')).slice(0, 7);
              break;
            case '05_Mega_Image':
              megaImages.value = response.data.filter((resp: any) => resp !== 'Thumb');
              break;
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
  }
};

// 이미지를 더블클릭하면 OpenSeadragon 뷰어에서 열기
const openInViewer = async (imageUrl: string, type: string) => {
  // 기존의 뷰어 제거
  if (viewerSmall) {
    viewerSmall.destroy();
  }
  let urlTileSources = {};
  if (type === '03_Cell_Ideal_Image') {
    urlTileSources = {
      type: "image",
      url: imageUrl,
    }
  } else {
    const slotId = props.selectItems?.slotId || "";
    const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : sessionStorage.getItem('iaRootPath');

    const folderPath = `${path}/${slotId}/${type}`;
    urlTileSources = await fetchTilesInfo(folderPath);
  }
  // 새로운 OpenSeadragon 뷰어 생성
  viewerSmall = OpenSeadragon({
    id: "viewerSmall",
    element: document.getElementById("viewerSmall"),
    tileSources: urlTileSources,
    defaultZoomLevel: 0.2,
    navigator: false,
    minZoomLevel: 0.2,
    maxZoomLevel: 2,
    showZoomControl: false, // 줌 컨트롤 숨기기
    showHomeControl: false, // 홈 컨트롤 숨기기
    showFullScreenControl: false, // 전체 화면 컨트롤 숨기기
    showRotationControl: false, // 회전 컨트롤 숨기기
    showFullPageControl: false,
  });
  buttonOfen.value = true;

  viewerSmall.addHandler("open", function () {
    // 타일링 뷰어에 height 동적 조정
    const imageWidth = viewerSmall.source.dimensions.x;
    const imageHeight = viewerSmall.source.dimensions.y;

    const tilingViewerElement: any = document.getElementById("viewerSmall");

    const containerWidth = tilingViewerElement.clientWidth;
    const aspectRatio = imageHeight / imageWidth;
    const dynamicHeight = containerWidth * aspectRatio;

    tilingViewerElement.style.position = `fixed`;
    tilingViewerElement.style.height = `${dynamicHeight}px`;
    tilingViewerElement.style.width = `100%`;
    tilingViewerElement.style.left = `0`;
    tilingViewerElement.style.background = `#00000061`;
  });

  viewerSmall.addHandler('canvas-click', (event: any) => {
    event.preventDefaultAction = true;
  })

};

const closeViewer = () => {
  if (viewerSmall) {
    viewerSmall.destroy();

    // // viewerSmall 요소를 제거하여 닫기
    const viewerElement = document.getElementById('viewerSmall');
    if (viewerElement) {
      viewerElement.innerHTML = '';  // 뷰어 요소의 내용을 비워서 닫기
      viewerElement.style.background = 'none';
      viewerElement.style.height = `0`;
      viewerElement.style.width = `0`;

      // 클릭 이벤트 리스너 제거
      viewerElement.removeEventListener('click', closeViewer);
    }

    // viewerSmall 변수를 null로 설정
    viewerSmall = null;
    buttonOfen.value = false;
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

      const fileNameResult = extractSubStringBeforeFiles(fileName);
      const {width, height, tileSize} = await dziWidthHeight(fileNameResult, folderPath);
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
    }
  }

  return tilesInfo;
};

const extractSubStringBeforeFiles = (str: string) => {
  const searchString = '_files';
  const endIndex = str.indexOf(searchString);

  if (endIndex !== -1) {
    return str.substring(0, endIndex);
  }

  return str;
}
const dziWidthHeight = async (imageFileName: any, folderPath: string): Promise<any> => {
  const urlImage = `${folderPath}/${imageFileName}.dzi`;
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
</script>