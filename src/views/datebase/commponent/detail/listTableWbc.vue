<template>
  <div class="databaseWbcRight">
    <img :src="getBarcodeImageUrl('barcode_image.jpg',pbiaRootPath, selectItems.slotId, barcodeImgDir.barcodeDirName)"/>
    <h3>WBC Classification</h3>
    <div>
      <ul>
        <li>
          <font-awesome-icon :icon="['fas', 'comment-dots']"/>
        </li>
        <li>
          <font-awesome-icon :icon="['fas', 'square-check']"/>
        </li>
        <li>
          <font-awesome-icon :icon="['fas', 'upload']"/>
        </li>
      </ul>
      <p>
        <font-awesome-icon :icon="['fas', 'lock']"/>
        <!--        <font-awesome-icon :icon="['fas', 'lock-open']"/>-->
      </p>
    </div>
    <div v-for="(item, idx) in wbcInfo" :key="item.id" class="wbcClassDbDiv">
      <div v-if="idx === 0">
        <p>Class</p>
        <p>Count</p>
        <p>%</p>
      </div>
      <div class="circle">
        <p>{{ item?.name }}</p>
        <p>{{ item?.count }}</p>
        <p> {{ item?.percent }} </p>
      </div>
    </div>
    <template v-for="(nWbcItem, outerIndex) in selectItems?.wbcInfo?.nonRbcClassList" :key="outerIndex">
      <div class="categories">
        <ul class="categoryNm">
          <li class="mb1 liTitle" v-if="outerIndex === 0">non-WBC</li>
          <li>{{ getCategoryName(nWbcItem) }}</li>
        </ul>
        <ul class="classNm">
          <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
          <li>
            {{ nWbcItem?.count }}
            <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'"> /{{ selectItems?.wbcInfo?.maxWbcCount }} WBC</span>
          </li>
        </ul>
        <ul class="degree">
          <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
          <li>-</li>
        </ul>
      </div>
    </template>
  </div>

  <div class="databaseWbcLeft">
    <div>
      <button type="button" @click="drawCellMarker">
        <font-awesome-icon
            :icon="cellMarkerIcon ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
        />
        Cell marking
      </button>
      <button @click="rollbackChanges">Rollback</button>

    </div>
    <div>
      <div>
        <font-awesome-icon :icon="['fas', 'plus-minus']"/>
        <input
            type="range"
            min="150"
            max="600"
            v-model="imageSize"
            @input="changeImageSize"
        />
      </div>
      <div>
        <font-awesome-icon :icon="['fas', 'sun']"/>
        <input
            type="range"
            min="50"
            max="600"
            v-model="imgBrightness"
            @input="changeImgBrightness"
        />
        {{ imgBrightness }}
      </div>
      <div>
        <font-awesome-icon :icon="['fas', 'palette']"/>
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
        <button @click="rgbReset">reset</button>
        <div>
          <select v-model="selectSizeTitle">
            <option v-for="(item) in wbcInfo" :key="item.id" :value="item.title">{{ item.title }}</option>
          </select>
        </div>
      </div>
      <font-awesome-icon :icon="['fas', 'file-excel']"/>
    </div>
    <div>
      <ul class="wbcInfoDbUl">
        <li v-for="(item) in wbcInfo" :key="item.id" @click="scrollToElement(item.id)">
          <div class="circle" @dragover.prevent="onDragOverCircle()" @drop="onDropCircle(item)">
            <p>{{ item?.title }}</p>
            <p>{{ item?.count }}</p>
          </div>
        </li>
      </ul>
      <ul class="cellImgBox">
        <li v-for="(item, itemIndex) in wbcInfo" :key="item.id" :ref="setRef(item.id)">
          <div>
            <p>{{ item?.title }}</p>
            <p>{{ item?.count }}</p>
            <input type="checkbox" @input="allCheckChange($event,item.title)">
          </div>
          <ul :class="'wbcImgWrap '+ item?.title" @dragover.prevent="onDragOver()" @drop="onDrop(itemIndex)">
            <li v-for="(image, imageIndex) in item.images" :key="image.fileName"
                :class="{ 'border-changed': image.changed, 'selected-image': isSelected(image) }"
                @click="selectImage(itemIndex, imageIndex)"
            >
              <div style="position: relative">
                <img :src="getImageUrl(image.fileName, item.id, item.title)"
                     :width="image.width ? image.width : '150px'"
                     :height="image.height ? image.height : '150px'"
                     :style="{ filter: image.filter }"
                     @dragstart="onDragStart(itemIndex, imageIndex)"
                     draggable="true"
                     class="cellImg"
                     ref="cellRef"
                />
                <div class="center-point" :style="image.coordinates"></div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {barcodeImgDir} from "@/common/defines/constFile/settings";
import {moveImgPost} from "@/common/api/service/dataBase/wbc/wbcApi";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {WbcInfo} from "@/store/modules/analysis/wbcclassification";
import {useStore} from "vuex";
import {getBarcodeImageUrl} from "@/common/lib/utils/conversionDataUtils";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";

const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const wbcInfo = ref<any>(null);
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const pbiaRootPath = sessionStorage.getItem("pbiaRootPath");
const store = useStore();
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const draggedItemIndex = ref<any>(null);
const draggedImageIndex = ref<any>(null);
const isShiftKeyPressed = ref(false);
const isCtrlKeyPressed = ref(false);
const draggedCircleIndex = ref<number | null>(null);
const draggedCircleImgIndex = ref<number | null>(null);
const selectedClickImages = ref<any>([]);
const shiftClickImages = ref<any>([]);
const rollbackHistory: any = [];
const imageSize = ref(150);
const imgBrightness = ref(100);
const imageRgb = ref([0, 0, 0]);
const selectSizeTitle = ref('')
const refsArray = ref<any[]>([]);
const allCheck = ref('');
const cellRef = ref(null);
const cellMarkerIcon = ref(false);

onMounted(() => {
  initData();
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  document.body.addEventListener("click", handleBodyClick);
});

watch(userModuleDataGet.value, (newUserId, oldUserId) => {
  userId.value = newUserId.id;
});


const drawCellMarker = async () => {
  cellMarkerIcon.value = !cellMarkerIcon.value

  if (cellMarkerIcon.value) {
    let url = '';
    if (selectItems.value.testType === '01' || selectItems.value.testType === '04') {
      url = `${pbiaRootPath}/${selectItems.value.slotId}/01_WBC_Classification/${selectItems.value.slotId}.json`
    } else {
      url = `${pbiaRootPath}/${selectItems.value.slotId}/05_BF_Classification/${selectItems.value.slotId}.json`
    }
    const response = await readJsonFile({fullPath: url});

    if (response && response.success) {
      const jsonImageDat = response.data;
      wbcInfo.value.forEach((item: any) => {
        item.images.forEach((image: any) => {
          const imageElement: any = cellRef.value;
          const foundItem = jsonImageDat.find((item: any) => item?.FILE_NM === image?.fileName);
          if (foundItem) {
            const widthRatio = (imageElement[0]?.width || 150) / Number(foundItem.ORG_WIDTH) * 100;
            const heightRatio = (imageElement[0]?.height || 150) / Number(foundItem.ORG_HEIGHT) * 100;

            const rectWidth = (Number(foundItem.POSX2) - Number(foundItem.POSX1)) * (widthRatio / 100);
            const rectHeight = (Number(foundItem.POSY2) - Number(foundItem.POSY1)) * (heightRatio / 100);

            const left = imageElement[0]?.offsetLeft + (Number(foundItem.POSX1) * (widthRatio / 100)) + (rectWidth / 2) + 'px';
            const top = imageElement[0]?.offsetTop + (Number(foundItem.POSY1) * (heightRatio / 100)) + (rectHeight / 2) + 'px';

            image.coordinates = {
              position: 'absolute',
              left,
              top,
              width: '5px',
              height: '5px',
              background: '#10ff00'
            };
          }
        });
      });
    }
  }else{
    wbcInfo.value.forEach((item: any) => {
      item.images.forEach((image: any) => {
        image.coordinates = {
          display: 'none'
        };
      });
    });
  }
}

const allCheckChange = (event: any, title: string) => {
  allCheck.value = event.target.checked ? title : '';
  console.log(allCheck.value)
  allCheckInsert();
}

const allCheckInsert = () => {
  // 선택된 이미지 초기화
  selectedClickImages.value = [];
  for (const idx in wbcInfo.value) {
    if (allCheck.value === wbcInfo.value[idx].title) {
      for (const idxKey in wbcInfo.value[idx].images) {
        selectedClickImages.value.push({
          id: wbcInfo.value[idx].id,
          title: wbcInfo.value[idx].title,
          ...wbcInfo.value[idx].images[idxKey],
        });
      }
    }
  }
}

const setRef = (itemId: number) => {
  return (el: HTMLElement | null) => {
    refsArray.value[itemId] = el;
  };
};

const scrollToElement = (itemId: number) => {
  const targetElement = refsArray.value[itemId];
  if (targetElement) {
    targetElement.scrollIntoView({behavior: 'smooth'});
  }
};


function rgbReset() {
  imageRgb.value = [0, 0, 0];
  changeImageRgb();
}

function changeImageRgb() {
  const selectedSizeTitle = selectSizeTitle.value;
  if (!selectedSizeTitle) {
    alert('No selected size title.');
    rgbReset();
    return;
  }
  const red = 255 - imageRgb.value[0];
  const green = 255 - imageRgb.value[1];
  const blue = 255 - imageRgb.value[2];

  // 선택된 크기 타이틀과 일치하는 이미지들에 대해 크기 조절
  wbcInfo.value.forEach((item: any) => {
    if (item.title === selectedSizeTitle) {
      item.images.forEach((image: any) => {
        // 각 색상 채널 개별적으로 조절
        image.filter = `opacity(0.85) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${imgBrightness.value}%)`;
      });
    }
  });

}

function changeImgBrightness(event: any) {
  const red = imageRgb.value[0];
  const green = imageRgb.value[1];
  const blue = imageRgb.value[2];

  wbcInfo.value.forEach((item: any) => {
    item.images.forEach((image: any) => {
      // 각 색상 채널 개별적으로 조절
      image.filter = `opacity(0.85) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${event?.target?.value}%)`;
    });
  });
}

function changeImageSize(event: any) {
  wbcInfo.value.forEach((item: any) => {
    item.images.forEach((image: any) => {
      console.log(event?.target)
      // 현재 이미지의 width와 height
      let currentWidth = event?.target?.value;
      let currentHeight = event?.target?.value;

      // 크기를 더하거나 빼는 값
      const sizeChange = 60;

      // 이미지의 width와 height를 조절
      image.width = Number(currentWidth) + Number(sizeChange);
      image.height = Number(currentHeight) + Number(sizeChange);
    });
  });
}


function onDragOverCircle() {
  // 드래그 동작을 위한 빈 함수, 이벤트 리스너가 있어야 드롭이 작동함 지우지 마세요.
}

function addToRollbackHistory() {
  rollbackHistory.push(JSON.parse(JSON.stringify(wbcInfo.value)));
}

// 상단 타이틀 이동 시 실행되는 함수
async function onDropCircle(item: any) {
  const draggedItem = wbcInfo.value[draggedCircleIndex.value];
  addToRollbackHistory();
  if (selectedClickImages.value.length === 0) {
    // 이미지를 한 개만 드래그한 경우
    const draggedImage = draggedItem.images[draggedCircleImgIndex.value];
    item.images.push(draggedImage);
    // 드롭된 위치에 이미지 추가
    const matchingItemIndex = wbcInfo.value.findIndex((infoItem: any) => infoItem.id === item.id);
    if (matchingItemIndex !== -1) {
      wbcInfo.value[matchingItemIndex].images.push(draggedImage);
    } else {
      console.error('일치하는 id를 가진 요소 없음');
    }
    // 이미지를 한 개만 드래그한 경우에만 이동 API 호출
    await moveImage(matchingItemIndex, [{fileName: draggedImage.fileName}], draggedItem, wbcInfo.value[matchingItemIndex], false);
  } else {
    // 여러 이미지를 드래그한 경우
    for (const selectedImage of selectedClickImages.value) {
      item.images.push(selectedImage);
      // 드롭된 위치에 이미지 추가
      const matchingItemIndex = wbcInfo.value.findIndex((infoItem: any) => infoItem.id === item.id);
      if (matchingItemIndex !== -1) {
        wbcInfo.value[matchingItemIndex].images.push(selectedImage);
      } else {
        console.error('일치하는 id를 가진 요소 없음');
      }
      // 여러 이미지를 드래그한 경우에도 이동 API 호출
      await moveImage(matchingItemIndex, [{fileName: selectedImage.fileName}], draggedItem, wbcInfo.value[matchingItemIndex], false);
    }
  }
}

function handleBodyClick(event: Event) {
  const target = event.target as HTMLElement;
  // 클릭한 요소 또는 그 조상 중에 .wbcImgWrap 클래스를 가지고 있지 않으면
  if (!target.closest('.wbcImgWrap')) {
    // 모든 selected-image 클래스를 리셋
    selectedClickImages.value = [];
    shiftClickImages.value = [];
  }
}

function handleKeyDown(event: KeyboardEvent) {
  // Shift 키가 눌렸는지 확인
  if (event.shiftKey) {
    isShiftKeyPressed.value = true;
  }

  // Ctrl 키가 눌렸는지 확인
  if (event.ctrlKey) {
    isCtrlKeyPressed.value = true;
  }
}


function handleKeyUp(event: KeyboardEvent) {
  // Shift 키가 떼어졌는지 확인
  if (!event.shiftKey) {
    isShiftKeyPressed.value = false;
  }

  // Ctrl 키가 떼어졌는지 확인
  if (!event.ctrlKey) {
    isCtrlKeyPressed.value = false;
  }
}


function initData() {
  wbcInfo.value = selectItemWbc ? JSON.parse(selectItemWbc) : null;
  if (selectItems.value.wbcInfoAfter && selectItems.value.wbcInfoAfter.length !== 0) {
    wbcInfo.value = selectItems.value.wbcInfoAfter;
  } else {
    wbcInfo.value = selectItems.value.wbcInfo.wbcInfo[0]
  }
}

function onDragOver() {
  //이부분이 없으면 드래그 동작안함 지우지마세요
}

function onDragStart(itemIndex: any, imageIndex: any) {
  // 드래그 시작 시 인덱스 저장
  draggedItemIndex.value = itemIndex;
  draggedImageIndex.value = imageIndex;
  draggedCircleImgIndex.value = imageIndex;
  draggedCircleIndex.value = itemIndex;
}

function selectImage(itemIndex: any, imageIndex: any) {
  console.log(selectedClickImages.value)
  // 쉬프트 키를 누른 경우
  if (isShiftKeyPressed.value) {
    // 현재 선택한 이미지
    shiftClickImages.value.push(imageIndex);
    // 시작과 끝 인덱스 결정
    const start = shiftClickImages.value[0];
    const end = shiftClickImages.value[shiftClickImages.value.length - 1];
    const startIndex = start > end ? end : start;
    const endIndex = start > end ? start : end;

    // 선택된 이미지 초기화
    selectedClickImages.value = [];
    // 범위 내의 이미지 선택
    for (let i = startIndex; i <= endIndex; i++) {
      selectedClickImages.value.push({
        id: wbcInfo.value[itemIndex].id,
        title: wbcInfo.value[itemIndex].title,
        ...wbcInfo.value[itemIndex].images[i],
      });
    }
  } else { // 쉬프트 키를 누르지 않은 경우
    if (!isCtrlKeyPressed.value) {
      return
    }
    const selectedImage = wbcInfo.value[itemIndex].images[imageIndex];
    if (!isSelected(selectedImage)) {
      selectedClickImages.value.push(selectedImage);
    } else {
      selectedClickImages.value = selectedClickImages.value.filter((img: any) => img !== selectedImage);
    }
  }
}

function isSelected(image: any) {
  const imageFileName = image.fileName;
  return selectedClickImages.value.some((selectedImage: any) => selectedImage.fileName === imageFileName);
}

async function onDrop(targetItemIndex: any) {
  addToRollbackHistory();
  if (selectedClickImages.value.length === 0) {
    return await originalOnDrop(targetItemIndex);
  }
  for (const selectedImage of selectedClickImages.value) {
    const fileName = selectedImage.fileName;
    const draggedItemIndex = wbcInfo.value.findIndex((item: any) => item.images.some((img: any) => img.fileName === fileName));
    const draggedItem = wbcInfo.value[draggedItemIndex];
    await moveImage(targetItemIndex, [{fileName: selectedImage.fileName}], draggedItem, wbcInfo.value[targetItemIndex], false);
  }
  // 선택된 이미지 초기화
  selectedClickImages.value = [];
  shiftClickImages.value = [];
}

async function originalOnDrop(targetItemIndex: number) {
  //targetItemIndex -> 옮겨져야하는 index
  if ((draggedItemIndex.value !== null && draggedImageIndex.value !== null) && (draggedItemIndex.value !== targetItemIndex)) {
    const draggedItem = wbcInfo.value[draggedItemIndex.value];
    const draggedImage = draggedItem.images[draggedImageIndex.value]; // 드래그 후 옮기는 이미지
    // 이미지 이동 함수 호출
    await moveImage(targetItemIndex, [{fileName: draggedImage.fileName}], draggedItem, wbcInfo.value[targetItemIndex], false);
  }
}

async function moveImage(targetItemIndex: number, selectedImagesToMove: any[], draggedItem: any, targetItem: any, type: boolean) {
  const {slotId} = selectItems.value;
  const arrType = selectedImagesToMove;
  try {
    // 선택된 이미지 배열에 대해 반복
    for (const selectedImage of arrType) {
      const fileName = selectedImage.fileName;
      const sourceFolder = type ? `${pbiaRootPath}/${slotId}/01_WBC_Classification/${selectedImage.id}_${selectedImage.title}` :
          `${pbiaRootPath}/${slotId}/01_WBC_Classification/${draggedItem.id}_${draggedItem.title}`;
      const destinationFolder = `${pbiaRootPath}/${slotId}/01_WBC_Classification/${targetItem.id}_${targetItem.title}`;
      // 이미지 이동 API 호출
      const response = await moveImgPost(`sourceFolder=${sourceFolder}&destinationFolder=${destinationFolder}&imageName=${fileName}`);
      if (response) {
        // 드래그된 이미지를 원래 위치에서 제거
        const draggedImageIndex = draggedItem.images.findIndex((img: any) => img.fileName === fileName);
        draggedItem.images.splice(draggedImageIndex, 1);
        // 변경되면 테두리 표시
        selectedImage.changed = true;
        // 드롭된 위치에 이미지를 삽입
        wbcInfo.value[targetItemIndex].images.push(selectedImage);
        // Count 업데이트 옮겨진 곳
        const newCountPlus = parseInt(wbcInfo.value[targetItemIndex].count) + 1;
        wbcInfo.value[targetItemIndex].count = newCountPlus.toString();
        // 옮기는 곳
        const newCountMinus = parseInt(wbcInfo.value[draggedItemIndex.value].count) - 1;
        wbcInfo.value[draggedItemIndex.value].count = newCountMinus.toString();
      } else {
        console.error('이미지 이동 실패:', fileName);
      }
    }
    // 선택된 이미지 초기화
    selectedClickImages.value = [];
    shiftClickImages.value = [];
    // 원본 데이터베이스 업데이트
    await updateOriginalDb();
  } catch (error) {
    console.error('에러:', error);
  }
}

async function updateOriginalDb() {
  // wbcInfo.value를 깊은 복제(clone)하여 새로운 배열을 생성
  const clonedWbcInfo = JSON.parse(JSON.stringify(wbcInfo.value));

  // 각 이미지 객체에서 width와 height 속성은 저장 안해도되는 부분이라서 디비에 저장 안함
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      delete image.width;
      delete image.height;
      delete image.filter;
      delete image.changed;
    });
  });

  // wbcInfoAfter 업데이트 및 sessionStorage에 저장
  selectItems.value.wbcInfoAfter = clonedWbcInfo;
  sessionStorage.setItem("selectItems", JSON.stringify(selectItems.value));
  sessionStorage.setItem("selectItemWbc", JSON.stringify(clonedWbcInfo));

  // originalDb 업데이트
  const filteredItems = originalDb.value.filter((item: any) => item.id === selectItems.value.id);
  if (filteredItems.length > 0) {
    filteredItems.forEach((filteredItem: any) => {
      filteredItem.wbcInfoAfter = clonedWbcInfo;
    });
  }
  originalDb.value = filteredItems;

  //updateRunningApi 호출
  await updateRunningApiPost(clonedWbcInfo, originalDb.value);
}

async function updateRunningApiPost(wbcInfo: any, originalDb: any) {
  try {
    const response = await updateRunningApi({userId: Number(userId.value), runingInfoDtoItems: originalDb})
    if (response) {
      initDataRefresh(wbcInfo);
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function initDataRefresh(wbcInfo: any) {
  wbcInfo.value = [];
  for (const item of wbcInfo) {
    wbcInfo.value.push({...item, images: [...item.images]});
  }
}

function getImageUrl(imageName: any, id: string, title: string): string {
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!wbcInfo.value || wbcInfo.value.length === 0) {
    return "";
  }
  const slotId = selectItems.value?.slotId || "";
  const folderPath = `${pbiaRootPath}/${slotId}/01_WBC_Classification/${id}_${title}`;
  return `http://localhost:3002/images?folder=${folderPath}&imageName=${imageName}`;

}

const getCategoryName = (category: WbcInfo) => category?.name;

async function rollbackChanges() {
  if (rollbackHistory.length > 0) {
    // 롤백할 때마다 히스토리에서 마지막 상태를 꺼내어 복원
    const prevWbcInfo = rollbackHistory.pop();

    // 롤백 후 초기화
    draggedItemIndex.value = null;
    draggedImageIndex.value = null;
    draggedCircleIndex.value = null;
    draggedCircleImgIndex.value = null;
    selectedClickImages.value = [];
    shiftClickImages.value = [];

    // 현재 상태에서 이전 상태로 이미지 롤백
    await rollbackImages(wbcInfo.value, prevWbcInfo);

    // wbcInfo 업데이트
    wbcInfo.value = prevWbcInfo;
  }
}

const findUndefinedImages = (sourceWbcInfo: any, targetWbcInfo: any, infoArray: any) => {
  sourceWbcInfo.forEach((sourceItem: any, sourceIndex: any) => {
    const targetItem = targetWbcInfo[sourceIndex];
    if (sourceItem && targetItem) {
      sourceItem.images.forEach((sourceImage: any, imageIndex: any) => {
        const targetImage = targetItem.images[imageIndex];
        if (targetImage === undefined) {
          infoArray.push({
            itemIndex: sourceIndex,
            imageIndex,
            fileName: sourceImage.fileName,
            title: targetItem.title,
            id: targetItem.id,
          });
        }
      });
    }
  });
};

async function rollbackImages(currentWbcInfo: any, prevWbcInfo: any) {
  // 각 상태에서 이동된 이미지 정보 추출
  const sourceFolderInfo: any = [];
  const destinationFolderInfo: any = [];
  findUndefinedImages(currentWbcInfo, prevWbcInfo, sourceFolderInfo);
  findUndefinedImages(prevWbcInfo, currentWbcInfo, destinationFolderInfo);
  // 이동된 이미지들을 이전 위치로 다시 이동시킴
  for (const index in sourceFolderInfo) {
    const sourceFolder = `${pbiaRootPath}/${selectItems.value.slotId}/01_WBC_Classification/${sourceFolderInfo[index].id}_${sourceFolderInfo[index].title}`;
    const destinationFolder = `${pbiaRootPath}/${selectItems.value.slotId}/01_WBC_Classification/${destinationFolderInfo[index].id}_${destinationFolderInfo[index].title}`;
    const response = await moveImgPost(`sourceFolder=${sourceFolder}&destinationFolder=${destinationFolder}&imageName=${sourceFolderInfo[index].fileName}`);

    if (response) {
      wbcInfo.value = prevWbcInfo;
    }
  }
  // 원본 데이터베이스 업데이트
  await updateOriginalDb();
}


</script>
