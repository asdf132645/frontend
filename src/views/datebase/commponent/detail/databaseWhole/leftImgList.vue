<template>
  <div class="closeViewer" @click="closeViewer" v-if="buttonOfen">x</div>
  <div id="viewerSmall"></div>
  <div class="leftImgList">
    <ul class="leftImgUl">
      <p>Partical Image</p>
      <li v-for="(image, index) in paImages" :key="index" class="leftImgLi">
        <img :src="getImageUrlsSmallImg(image, 'particle')" alt="Partical Image" @dblclick="openInViewer(getImageUrls(image, 'particle'))">
      </li>
    </ul>
    <ul class="leftImgUl">
      <p>Ideal Zone</p>
      <li v-for="(image, index) in idealZoneImages" :key="index" class="leftImgLi" style="width:100px">
        <img :src="getImageUrlsSmallImg(image, 'idealZone')" @dblclick="openInViewer(getImageUrls(image, 'idealZone'))">
      </li>
    </ul>
    <ul class="leftImgUl">
      <div>
        <p>Ideal stitch</p>
        <li v-for="(image, index) in idealStitchImages" :key="index" class="leftImgLi">
          <img :src="getImageUrlsSmallImg(image, 'idealStitch')" @dblclick="openInViewer(getImageUrls(image, 'idealStitch'))">
        </li>
      </div>
      <div>
        <p>Megakaryocyte</p>
        <li v-for="(image, index) in megaImages" :key="index" class="leftImgLi">
          <img :src="getImageUrlsSmallImg(image, 'mega')" @dblclick="openInViewer(getImageUrls(image, 'mega'))">
        </li>
      </div>
    </ul>
  </div>

</template>

<script setup lang="ts">
import {defineProps, nextTick, onMounted, ref, watch} from "vue";
import OpenSeadragon from "openseadragon";
import axios from "axios";
import {useStore} from "vuex";

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

onMounted(async () => {
  await nextTick();
  await getImgUrl();
});

watch(() => props.selectItems, async(newItem) => {
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
  const path = props.selectItems?.img_drive_root_path  !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : sessionStorage.getItem('iaRootPath');
  const folderPath = `${path}/${slotId}/${folderName}`;

  return `${apiBaseUrl}/folders?folderPath=${folderPath}/${imageName}`;
};

const getImageUrlsSmallImg = (imageName: string, type: string) => {
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

  return `${apiBaseUrl}/folders/getFilesInFolderWhole?folderPath=${folderPath}/${imageName}`;
};

const getImgUrl = () => {
  const slotId = props.selectItems?.slotId || "";
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : sessionStorage.getItem('iaRootPath');

  for (const item of strArray) {
    axios.get(`${apiBaseUrl}/folders?folderPath=${path}/${slotId}/${item}`)
        .then(response => {
          switch (item) {
            case '02_Particle_Image':
              paImages.value = response.data.filter((resp: any) => resp !== 'Thumb').slice(0, 7);
              break;
            case '03_Cell_Ideal_Image':
              idealZoneImages.value = response.data.filter((resp: any) => resp !== 'Thumb').slice(0, 14);
              break;
            case '04_Cell_Ideal_Stitch_Image':
              idealStitchImages.value = response.data.filter((resp: any) => resp !== 'Thumb');
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
const openInViewer = (imageUrl: string) => {
  // 기존의 뷰어 제거
  if (viewerSmall) {
    viewerSmall.destroy();
  }

  // 새로운 OpenSeadragon 뷰어 생성
  viewerSmall = OpenSeadragon({
    id: "viewerSmall",
    element: document.getElementById("viewerSmall"),
    tileSources: {
      type: "image",
      url: imageUrl,
    },
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

    // const viewportPoint = viewerSmall.viewport.pointFromPixel(event.position);
    // const imagePoint = viewerSmall.viewport.viewportToImageCoordinates(viewportPoint);
    //
    // const imageWidth = viewerSmall.world.getItemAt(0).getContentSize().x;
    // const imageHeight = viewerSmall.world.getItemAt(0).getContentSize().y;
    //
    // // 이미지 외부를 클릭했을 때 동작
    // if (imagePoint.x < 0 || imagePoint.x > imageWidth || imagePoint.y < 0 || imagePoint.y > imageHeight) {
    //   closeViewer();
    // }
  })

};

const closeSmallImageViewer = () => {
  if (viewerSmall) {
    // viewerSmall 요소를 제거하여 닫기
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
}

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

</script>