<template>
  <div v-show="moveImgIsBool" class="moveImgIsBool"> Moving image...</div>
  <ClassInfoMenu @refreshClass="refreshClass" :isNext="isNext" @isNextFalse="isNextFalse"/>

  <div class="wbcContent">
    <div class="topClintInfo">
      <ul>
        <li>
          {{ projectType === 'bm' ? getBmTestTypeText(selectItems?.testType) : getTestTypeText(selectItems?.testType) }}
        </li>
        <li>{{ selectItems?.barcodeNo }}</li>
        <li>{{ selectItems?.patientId || 'patientId No Data' }}</li>
        <li>{{ selectItems?.cbcPatientNo }}</li>
        <li>{{ selectItems?.patientName }}</li>
        <li> {{ selectItems?.cbcPatientNm }} {{ selectItems?.cbcSex }} {{ selectItems?.cbcAge }}</li>
        <li>{{ selectItems?.createDate }}</li>
      </ul>
    </div>
    <LisCbc v-if="cbcLayer" :selectItems="selectItems"/>
    <div :class="'databaseWbcRight' + (cbcLayer ? ' cbcLayer' : '')">
      <ClassInfo :wbcInfo="wbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='listTable'
                 @nextPage="nextPage"
                 @scrollEvent="scrollToElement" @isBefore="isBeforeDataSet"/>
    </div>

    <div :class="'databaseWbcLeft' + (cbcLayer ? ' cbcLayer' : '')">
      <div class="imgMenuSetDiv" @mouseleave="hideSizeControl">
        <button type="button" @click="drawCellMarker(false)">
          <font-awesome-icon
              :icon="cellMarkerIcon ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
          />
          Cell Marking
        </button>
        <button @click="excelDownload">
          <font-awesome-icon :icon="['fas', 'file-csv']"/>
          Excel
        </button>
        <!--size-->
        <button @mouseover="showSizeControl">
          <font-awesome-icon :icon="['fas', 'plus-minus']"/>
          Size
        </button>
        <div v-show="showSize" class="sizeContainer">
          <div>
            Size {{ imageSize }}
            <font-awesome-icon :icon="['fas', 'undo']" @click="imgSizeReset"/>
            <input
                type="range"
                min="80"
                max="300"
                v-model="imageSize"
                @input="changeImageSize"
            />
            <!--            <button class="resetBtn mb2" @click="imgSizeReset">Size Reset</button>-->
          </div>

        </div>
        <div class="imgSetWrap" ref="imgSetWrap">
          <button @click="imgSetOpen">
            <font-awesome-icon :icon="['fas', 'gear']"/>
            IMG Setting
          </button>
          <div class="imgSet" v-show="imgSet">
            <div>
              <font-awesome-icon :icon="['fas', 'sun']"/>
              Brightness {{ imgBrightness }}
              <input
                  type="range"
                  min="50"
                  max="600"
                  v-model="imgBrightness"
                  @input="changeImgBrightness"
              />
              <button class="resetBtn mb2" @click="brightnessReset">Brightness Reset</button>
            </div>
            <div>
              <font-awesome-icon :icon="['fas', 'palette']"/>
              RGB [ {{ `${imageRgb[0]} , ${imageRgb[1]}, ${imageRgb[2]}` }} ]
              <input
                  type="range"
                  min="0"
                  max="255"
                  v-model="imageRgb[0]"
                  @input="changeImageRgb('')"
              />
              <input
                  type="range"
                  min="0"
                  max="255"
                  v-model="imageRgb[1]"
                  @input="changeImageRgb('')"
              />
              <input
                  type="range"
                  min="0"
                  max="255"
                  v-model="imageRgb[2]"
                  @input="changeImageRgb('')"
              />
              <button class="resetBtn" @click="rgbReset">RGB Reset</button>
            </div>

          </div>
        </div>
        <button v-if="false" @click="classCompare">Class Compare</button>
        <button @click="rollbackChanges" class="rollbackButton">
          <font-awesome-icon :icon="['fas', 'rotate-left']"/>
          Rollback
        </button>
      </div>

      <div>
        <ul class="wbcInfoDbUl">
          <template v-for="(item) in wbcInfo" :key="item.id">
            <li @click="scrollToElement(item.id)" v-show="siteCd !== '0006' && item?.title !== 'SM'">
              <div class="circle" @dragover.prevent="onDragOverCircle()" @drop="onDropCircle(item)">
                <p>{{ item?.title }}</p>
                <p>{{ item?.count }}</p>
              </div>
            </li>
          </template>
        </ul>
        <ul class="cellImgBox" v-if="!classCompareShow">
          <li v-for="(item, itemIndex) in wbcInfo" :key="item.id" :ref="setRef(item.id)">
            <div v-show="item?.count !== '0' && item?.count !== 0">
              <p class="mt1">
                <input type="checkbox" @input="allCheckChange($event,item.title)"
                       :checked="selectedTitle === item.title">
                {{ item?.title }}
                ({{ item?.count }})</p>
            </div>
            <ul :class="'wbcImgWrap ' + item?.title" @dragover.prevent="onDragOver()" @drop="onDrop(itemIndex)"
                v-show="item?.count !== '0' && item?.count !== 0">
              <template v-for="(image, imageIndex) in item.images" :key="image.fileName">
                <li
                    :class="{
                    'border-changed': isBorderChanged(image),
                    'selected-image': isSelected(image),
                    'wbcImgWrapLi': true
                  }"
                    @click="selectImage(itemIndex, imageIndex, item)"
                    @dblclick="openModal(image, item)"
                    v-show="!hiddenImages[`${item.id}-${image.fileName}`]"
                    @contextmenu="handleRightClick($event, image, item)"
                >
                  <div style="position: relative;">
                    <div class="titleImg" v-show="replaceFileNamePrefix(image.fileName) !== item?.title">
                      <div class="fileTitle">{{ replaceFileNamePrefix(image.fileName) }}
                        <font-awesome-icon
                            :icon="['fas', 'arrow-right']"/>
                        {{ image.title }}
                      </div>
                    </div>
                    <img :src="getImageUrl(image.fileName, item.id, item.title, '')"
                         :width="image.width ? image.width : '150px'"
                         :height="image.height ? image.height : '150px'"
                         :style="{ filter: image.filter }"
                         @dragstart="onDragStart(itemIndex, imageIndex)"
                         draggable="true"
                         class="cellImg"
                         ref="cellRef"
                         @error="hideImage(item.id, image.fileName, item.title)"
                         v-show="!hiddenImages[`${item.id}-${image.fileName}`]"
                    />
                    <div class="center-point" :style="image.coordinates"></div>
                  </div>
                </li>
              </template>
            </ul>
          </li>
        </ul>
        <div v-else>
          <div>
            <select>
              <option>1</option>
            </select>
            <div>
              <div v-show="wbcInfo[0]?.count !== '0' && wbcInfo[0]?.count !== 0">
                <p class="mt1">
                  <input type="checkbox" @input="allCheckChange($event,wbcInfo[0].title)"
                         :checked="selectedTitle === wbcInfo[0].title">
                  {{ wbcInfo[0]?.title }}
                  ({{ wbcInfo[0]?.count }})</p>
              </div>
            </div>
          </div>
          <div>
            <select>
              <option>1</option>
            </select>
            <div></div>
          </div>
        </div>
      </div>
      <!--   우클릭 항목 메뉴   -->
      <div v-if="contextMenuVisible" :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
           class="context-menu detail">
        <ul>
          <li v-for="(item, itemIdx) in wbcInfo" :key="itemIdx" @click="moveSelectedImages(item, itemIdx)">
            {{ item.name }}
          </li>
        </ul>
      </div>
      <!-- 모달 창 -->
      <div class="wbcModal" v-show="modalOpen">
        <div class="wbc-modal-content">
          <span class="wbcClose" @click="closeModal">&times;</span>
          <div class="wbcModalImageContent">
            <img :src="selectedImageSrc" :style="{ width: modalImageWidth, height: modalImageHeight }"
                 class="modal-image"/>
          </div>
          <div class="buttons">
            <button @click="zoomIn">+</button>
            <button @click="zoomOut">-</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineEmits, getCurrentInstance, onMounted, onUnmounted, ref, watch} from "vue";
import {moveClassImagePost, moveImgPost} from "@/common/api/service/dataBase/wbc/wbcApi";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import * as XLSX from 'xlsx';
import router from "@/router";
import {
  calculateF1Score,
  calculatePrecision,
  calculateRecall, CellType,
  confusionMatrixVal,
  MetricsVal
} from "@/common/defines/constFile/classification";
import {
  getBfHotKeysApi,
  getOrderClassApi,
  getWbcCustomClassApi,
  getWbcWbcHotKeysApi
} from "@/common/api/service/setting/settingApi";
import {deleteRunningApi, fileSysPost} from "@/common/api/service/fileSys/fileSysApi";
import {getBmTestTypeText, getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import process from "process";
import ClassInfo from "@/views/datebase/commponent/detail/classInfo/commonRightInfo/classInfo.vue";
import LisCbc from "@/views/datebase/commponent/detail/lisCbc.vue";

const cellRefs: any = ref({});
const selectedTitle = ref('');
const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const wbcInfo = ref<any>(null);
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const store = useStore();
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const moveImgIsBool = computed(() => store.state.commonModule.moveImgIsBool);
const classInfoSort = computed(() => store.state.commonModule.classInfoSort);
const pbiaRootPath = ref<any>(store.state.commonModule.pbiaRootPath);
const siteCd = computed(() => store.state.commonModule.siteCd);
const draggedItemIndex = ref<any>(null);
const draggedImageIndex = ref<any>(null);
const isShiftKeyPressed = ref(false);
const firstClickedImageIndex = ref(null);
const isCtrlKeyPressed = ref(false);
const draggedCircleIndex = ref<number | null>(null);
const draggedCircleIndexArr = ref<any>([]);
const draggedCircleImgIndex = ref<number | null>(null);
const selectedClickImages = ref<any>([]);
const shiftClickImages = ref<any>([]);
const rollbackHistory: any = [];
const imageSize = ref(150);
const imgBrightness = ref(100);
const imageRgb = ref([0, 0, 0]);
const selectSizeTitle = ref('ME')
const refsArray = ref<any[]>([]);
const allCheck = ref('');
const cellRef = ref(null);
const cellMarkerIcon = ref(false);
const isBeforeChild = ref(false);
const modalOpen = ref(false);
const selectedImageSrc = ref('');
const modalImageWidth = ref('150px');
const modalImageHeight = ref('150px');
const imgSet = ref(false);
const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
const wbcCustomItems = ref<any>([]);
const wbcHotKeysItems = ref<any>([]);
const bfHotKeysItems = ref<any>([]);
const instance = getCurrentInstance();
const projectType = ref<any>('bm');
const opacity = ref('0.9');

const selectItemIamgeArr = ref<any>([]);
const moveRightClickArr = ref<any>([]);
const orderClass = ref<any>([]);
const showSize = ref(false);
const hiddenImages = ref<{ [key: string]: boolean }>({});
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const targetItem = ref<any>(null);
const isNext = ref(false);
const classCompareShow = ref(false);
onMounted(async () => {
  wbcInfo.value = [];
  selectItems.value = selectItemsData ? JSON.parse(selectItemsData) : null;
  projectType.value = window.PROJECT_TYPE;
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  document.body.addEventListener("click", handleBodyClick);
  await getWbcCustomClasses(false, null);
  document.addEventListener('click', handleClickOutside);
  const path = selectItems.value?.rootPath !== '' && selectItems.value?.rootPath ? selectItems.value?.rootPath : store.state.commonModule.pbiaRootPath;
  pbiaRootPath.value = path;
  // 로컬 스토리지 값으로 이미지 셋팅 값들 채워넣기
  await imgSetLocalStorage();
  // end
});
onUnmounted(async () => {
  document.addEventListener('click', handleClickOutside);
})

watch(imgBrightness, (newVal) => {
  localStorage.setItem('imgBrightness', String(newVal));
});

watch(imageSize, (newVal) => {
  localStorage.setItem('imageSize', String(newVal));
})

watch(isBeforeChild, (newVal) => {
  // console.log('ssss')
  getWbcCustomClasses(false, null);
}, {deep: true});

watch(imageRgb, (newVal) => {
  const red = newVal[0];
  const green = newVal[1];
  const blue = newVal[2];
  localStorage.setItem('imageRgb', JSON.stringify([red, green, blue]));
}, {deep: true});

const classCompare = () => {
  classCompareShow.value = !classCompareShow.value;
}

const imgSetLocalStorage = async () => {
  const storedBrightness = localStorage.getItem('imgBrightness');
  const storedRgb = localStorage.getItem('imageRgb');
  const imageSizeCopy = localStorage.getItem('imageSize');
  if (storedRgb) {
    imageRgb.value = JSON.parse(storedRgb);
  }
  if (storedBrightness) {
    imgBrightness.value = Number(storedBrightness);
  }

  if (imageSizeCopy) {
    imageSize.value = Number(imageSizeCopy);
  }

  const red = 255 - imageRgb.value[0];
  const green = 255 - imageRgb.value[1];
  const blue = 255 - imageRgb.value[2];
  wbcInfo.value.forEach((item: any) => {
    item.images.forEach((image: any) => {
      image.filter = `opacity(0.9) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${imgBrightness.value}%)`;
      image.width = Number(imageSize.value);
      image.height = Number(imageSize.value);
    });
  });
}

const isBeforeDataSet = (data: any) => {
  isBeforeChild.value = data;
}

const nextPage = () => {
  isNext.value = true;
}

const isNextFalse = () => {
  isNext.value = false;
}

const handleRightClick = (event: MouseEvent, image: any, item: any) => {
  event.preventDefault();
  openContextMenu(event, item);
};

function hideImage(id: string, fileName: string, title?: string) {
  hiddenImages.value[`${id}-${fileName}`] = true;
}

const getNewImageUrl = (fileName: any, title: any): any => {
  if (isBeforeChild.value) {
    const matchingImage = selectItems.value.wbcInfoAfter.find((el: any) => {
      return el.images && el.images.find((image: any) => image.fileName === fileName);
    });
    if (matchingImage.title !== title) {
      return {fileNameMa: fileName, idMa: matchingImage.id, titleMa: matchingImage.title};
    }
  }
  return null; // 새로운 이미지 URL이 없는 경우 null을 반환
}


const showSizeControl = () => {
  showSize.value = true;
};

const hideSizeControl = () => {
  showSize.value = false;
};

const handleClickOutside = (event: any) => {
  // 클릭 이벤트의 대상이 imgSet이 아닌지 확인
  if (!event.target.closest('.imgSetWrap')) {
    imgSet.value = false;
    selectedTitle.value = '';
  }
};
document.addEventListener('click', (event) => {
  if (contextMenuVisible.value) {
    contextMenuVisible.value = false;
  }
});
const openContextMenu = (event: MouseEvent, item: any) => {
  if (isBeforeChild.value) {
    return;
  }
  contextMenuVisible.value = true;
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY - 250;
  targetItem.value = item;
};

const moveSelectedImages = async (item: any, itemIdx: any) => {
  addToRollbackHistory();
  const draggedItem = wbcInfo.value[itemIdx];
  if (targetItem.value) {
    const matchingItemIndex = wbcInfo.value.findIndex((infoItem: any) => infoItem.id === item.id);
    await moveImage(matchingItemIndex, selectedClickImages.value, draggedItem, wbcInfo.value[matchingItemIndex], false, '', wbcInfo.value);
    contextMenuVisible.value = false;
  }
  contextMenuVisible.value = false;
};


const sortWbcInfo = async (wbcInfo: any, basicWbcArr: any) => {
  let newSortArr = wbcInfo.slice(); // 기존 배열 복사

  newSortArr.sort((a: any, b: any) => {
    const nameA = basicWbcArr.findIndex((item: any) => item.title === a.title);
    const nameB = basicWbcArr.findIndex((item: any) => item.title === b.title);

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });

  // 정렬된 배열을 wbcInfo에 할당
  wbcInfo.splice(0, wbcInfo.length, ...newSortArr);
};


const getWbcCustomClasses = async (upDown: any, upDownData: any) => {
  wbcInfo.value = [];
  try {
    const result = await getWbcCustomClassApi();

    const data: any = result.data;
    const newData = data.filter((item: any) => item.abbreviation);

    const customClassData: any = sessionStorage.getItem('customClass');
    const getCustomSessionData = JSON.parse(customClassData);

    if (getCustomSessionData) { // 커스텀 클래스 삭제하는 if 문
      getCustomSessionData.forEach((item: any) => {
        const findDelData = data.find((dataItems: any) => dataItems.customNum === item.customNum && dataItems.abbreviation !== item.abbreviation);
        if (findDelData) {
          if (item?.abbreviation === '') {
            return;
          }
          const filePath = `${pbiaRootPath.value}/${selectItems.value.slotId}/${projectTypeReturn(projectType.value)}/${item?.abbreviation}`;
          deleteRunningApi({path: filePath})
        }
      });
    }
    sessionStorage.setItem('customClass', JSON.stringify(data));
    wbcCustomItems.value = data;
    for (const item of newData) { // 커스텀클래스 폴더 생성
      const {className, abbreviation, customNum} = item;
      const filePath = `${pbiaRootPath.value}/${selectItems.value.slotId}/${projectTypeReturn(projectType.value)}/${customNum}_${abbreviation}`;
      await fileSysPost({path: filePath});

      const wbcPush = {
        id: customNum,
        name: className,
        count: '0',
        images: [],
        title: abbreviation,
      };
      let wbcinfo = [];
      if (isBeforeChild.value) {
        wbcinfo = selectItems.value.wbcInfo.wbcInfo[0];
      } else {
        wbcinfo = selectItems.value.wbcInfoAfter.length !== 0 ? selectItems.value.wbcInfoAfter : selectItems.value.wbcInfo.wbcInfo[0];
      }
      const foundObject = wbcinfo.find((wbcItem: any) => wbcItem.id === wbcPush.id && wbcItem.name === wbcPush.name);
      if (!foundObject) {
        wbcinfo.push(wbcPush);
        wbcInfo.value = wbcinfo;
        sessionStorage.setItem("selectItems", JSON.stringify(selectItems.value));
        await updateOriginalDb('notWbcAfterSave');
      }
    }
    await getWbcHotKeyClasses();
    await getBfHotKeyClasses();
    await getOrderClass();
    await initData(newData, upDown, upDownData);
  } catch (e) {
    console.log(e);
  }
};

const getBfHotKeyClasses = async () => {
  try {
    const result = await getBfHotKeysApi();
    if (result) {
      if (result?.data) {
        const data = result.data;
        bfHotKeysItems.value = data;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

const getWbcHotKeyClasses = async () => {
  try {
    const result = await getWbcWbcHotKeysApi();
    if (result) {
      if (result?.data) {
        const data = result.data;
        wbcHotKeysItems.value = data;
      }
    }
  } catch (e) {
    console.log(e);
  }
}


function isBorderChanged(image: any) {
  const prefix = image.fileName.split('_')[0];

  const replacements: any = {
    'NES': 'NS',
    'NEB': 'NB'
  };

  const modifiedPrefix = Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(key, replacements[key]);
  }, prefix);

  return image.title !== modifiedPrefix;
}

function replaceFileNamePrefix(fileName: string) {
  const replacements: any = {
    'NES': 'NS',
    'NEB': 'NB'
  };

  const prefix = fileName.split('_')[0];

  // 대체 규칙에 따라 prefix를 변경
  const modifiedPrefix: any = Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(key, replacements[key]);
  }, prefix);
  // 변경된 prefix 반환
  return modifiedPrefix;
}


const openModal = (image: any, item: any) => {
  modalOpen.value = true;
  selectedImageSrc.value = getImageUrl(image.fileName, item.id, item.title, 'getImageRealTime');
};

const closeModal = () => {
  modalOpen.value = false;
};

const imgSetOpen = () => {
  imgSet.value = !imgSet.value
}

const zoomIn = () => {
  let newWidth = Math.min(parseFloat(modalImageWidth.value) + 50, 400);
  let newHeight = Math.min(parseFloat(modalImageHeight.value) + 50, 400);

  modalImageWidth.value = `${newWidth}px`;
  modalImageHeight.value = `${newHeight}px`;
};


const zoomOut = () => {
  let newWidth = Math.max(parseFloat(modalImageWidth.value) - 50, 150);
  let newHeight = Math.max(parseFloat(modalImageHeight.value) - 50, 150);

  modalImageWidth.value = `${newWidth}px`;
  modalImageHeight.value = `${newHeight}px`;
};


watch(userModuleDataGet.value, (newUserId, oldUserId) => {
  userId.value = newUserId.id;
});

watch(() => classInfoSort.value, async (newItem) => { // 오더클래스부분 순서 변경시 감지하여 재정렬
  await getOrderClass();
  const sortArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  await sortWbcInfo(wbcInfo.value, sortArr);
});

const refreshClass = async (data: any) => {
  selectItems.value = data;
  const path = selectItems.value?.rootPath !== '' && selectItems.value?.rootPath ? selectItems.value?.rootPath : store.state.commonModule.pbiaRootPath;
  pbiaRootPath.value = path;
  await getWbcCustomClasses(true, data);
}

const excelDownload = () => {
  //
}

const drawCellMarker = async (imgResize?: boolean) => {
  if (!imgResize) {
    cellMarkerIcon.value = !cellMarkerIcon.value
  }

  if (cellMarkerIcon.value) {
    let url = '';
    if (projectType.value === 'pb') {
      url = `${pbiaRootPath.value}/${selectItems.value.slotId}/${
          selectItems.value.testType === '01' || selectItems.value.testType === '04'
              ? '01_WBC_Classification'
              : '05_BF_Classification'
      }/${selectItems.value.slotId}.json`;
    } else if (projectType.value === 'bm') {
      url = `${pbiaRootPath.value}/${selectItems.value.slotId}/${projectTypeReturn(projectType.value)}/${selectItems.value.slotId}.json`
    }
    const response = await readJsonFile({fullPath: url});

    if (response && response.success) {
      const jsonImageDat = response.data;
      wbcInfo.value.forEach((item: any) => {
        if (item.images.length === 0) return;
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
  } else {
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
  if (event.target.checked) {
    // 선택된 항목을 저장
    selectedTitle.value = title;
  } else {
    // 선택된 항목을 해제
    selectedTitle.value = '';
  }

  allCheckInsert();
}

const allCheckInsert = () => {
  // 선택된 이미지 초기화
  selectedClickImages.value = [];
  selectItemIamgeArr.value = [];
  moveRightClickArr.value = [];
  for (const idx in wbcInfo.value) {
    if (allCheck.value === wbcInfo.value[idx].title) {
      for (const idxKey in wbcInfo.value[idx].images) {
        const item = {
          id: wbcInfo.value[idx].id,
          title: wbcInfo.value[idx].title,
          ...wbcInfo.value[idx].images[idxKey],
        };
        selectedClickImages.value.push(item);
        selectItemIamgeArr.value.push(item);

      }
    }
  }
}

const setRef = (itemId: any) => {
  return (el: any) => {
    if (el) {
      refsArray.value[itemId] = el;
    }
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
  opacity.value = '0.9';
  changeImageRgb('reset');
}

function imgSizeReset() {
  drawCellMarker(true);
  imageSize.value = 150;
  wbcInfo.value.forEach((item: any) => {
    item.images.forEach((image: any) => {
      // 이미지의 width와 height를 조절
      image.width = 150;
      image.height = 150;
    });
  });
}

function brightnessReset() {
  imgBrightness.value = 100;
  opacity.value = '0.9';
  changeImageRgb('reset');
}

function changeImageRgb(reset: string) {
  const selectedSizeTitle = selectSizeTitle.value;
  if (!selectedSizeTitle) {
    rgbReset();
    return;
  }
  if (reset !== 'reset') {
    opacity.value = '0.9';
  }
  const red = 255 - imageRgb.value[0];
  const green = 255 - imageRgb.value[1];
  const blue = 255 - imageRgb.value[2];
  // 선택된 크기 타이틀과 일치하는 이미지들에 대해 크기 조절
  wbcInfo.value.forEach((item: any) => {
    // if (item.title === selectedSizeTitle) {
    item.images.forEach((image: any) => {
      // 각 색상 채널 개별적으로 조절
      image.filter = `opacity(${opacity.value}) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${imgBrightness.value}%)`;

    });
    // }
  });

}

function changeImgBrightness(event: any) {
  const red = imageRgb.value[0];
  const green = imageRgb.value[1];
  const blue = imageRgb.value[2];
  const brightness = event?.target?.value;

  wbcInfo.value.forEach((item: any) => {
    item.images.forEach((image: any) => {
      // 각 색상 채널 개별적으로 조절
      image.filter = `opacity(0.9) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${brightness}%)`;
    });
  });
}

function changeImageSize(event: any) {
  wbcInfo.value.forEach((item: any) => {
    item.images.forEach((image: any) => {
      // 현재 이미지의 width와 height
      let currentWidth = event?.target?.value;
      let currentHeight = event?.target?.value;

      // 이미지의 width와 height를 조절
      image.width = Number(currentWidth);
      image.height = Number(currentHeight);
    });
  });
  drawCellMarker(true);
}


function onDragOverCircle() {
  // 드래그 동작을 위한 빈 함수, 이벤트 리스너가 있어야 드롭이 작동함 지우지 마세요.
}

function addToRollbackHistory() {
  rollbackHistory.push(JSON.parse(JSON.stringify(wbcInfo.value)));
}

// 상단 타이틀 이동 시 실행되는 함수
async function onDropCircle(item: any) {
  if (isBeforeChild.value) {
    return;
  }
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
    const matchingItemIndex = wbcInfo.value.findIndex((infoItem: any) => infoItem.id === item.id);
    // 여러 이미지를 드래그한 경우에도 이동 API 호출
    await moveImage(matchingItemIndex, selectedClickImages.value, draggedItem, wbcInfo.value[matchingItemIndex], false, '', wbcInfo.value);

  }
}

function handleBodyClick(event: Event) {
  const target = event.target as HTMLElement;
  // 클릭한 요소 또는 그 부모 중에 .wbcImgWrap 클래스를 가지고 있지 않으면
  if (!target.closest('.wbcImgWrapLi') && !target.closest('.context-menu')) {
    // 모든 selected-image 클래스를 리셋
    selectedClickImages.value = [];
    shiftClickImages.value = [];
    selectItemIamgeArr.value = [];
  }
}

async function handleKeyDown(event: KeyboardEvent) {
  // 쉬프트 키가 눌렸는지 확인
  if (event.shiftKey) {
    isShiftKeyPressed.value = true;
  }

  // 컨트롤 키가 눌렸는지 확인
  if (event.ctrlKey) {
    isCtrlKeyPressed.value = true;
  }


  // 이미지 이동 단축키 확인
  if (projectType.value === 'pb') {
    if (event.key && (selectItems.value.testType === '01' || selectItems.value.testType === '04' ? wbcHotKeysItems.value : bfHotKeysItems.value).some((item: any) => item.key.toUpperCase() === event.key.toUpperCase())) {
      await moveSelectedImagesToTargetItem((selectItems.value.testType === '01' || selectItems.value.testType === '04' ? wbcHotKeysItems.value : bfHotKeysItems.value).find((item: any) => item.key.toUpperCase() === event.key.toUpperCase()));
    }
  } else if (projectType.value === 'bm') {
    if (event.key && wbcHotKeysItems.value.some((item: any) => item.key.toUpperCase() === event.key.toUpperCase())) {
      await moveSelectedImagesToTargetItem(wbcHotKeysItems.value.find((item: any) => item.key.toUpperCase() === event.key.toUpperCase()));
    }
  }


}

async function moveSelectedImagesToTargetItem(targetItem: any) {
  const targetIndex = wbcInfo.value.findIndex((item: any) => item.title === targetItem.title);
  const selectedImages = selectedClickImages.value;
  addToRollbackHistory();
  for (const selectedImage of selectedImages) {
    const sourceItemIndex = wbcInfo.value.findIndex((item: any) => item.title === selectedImage.title);
    const sourceItem = wbcInfo.value[sourceItemIndex];
    const imageIndex = sourceItem.images.findIndex((image: any) => image.fileName === selectedImage.fileName);
    if (imageIndex !== -1) {
      // 이동된 이미지 정보를 moveImage 함수로 전달하여 데이터 업데이트
      await moveImage(targetIndex, [{
        fileName: selectedImage.fileName,
        id: selectedImage.id,
        title: selectedImage.title
      }], targetItem, wbcInfo.value[targetIndex], true, 'keyMove');
    }
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

async function initData(newData: any, upDown: any, upDownData: any) {
  wbcInfo.value = [];
  let selectItemsVal: any = [];
  if (!upDown) {
    wbcInfo.value = selectItemWbc ? JSON.parse(selectItemWbc) : null;
    selectItemsVal = selectItems.value;
  } else {
    wbcInfo.value = upDownData;
    selectItemsVal = upDownData;
  }
  if (selectItemsVal.wbcInfoAfter && selectItemsVal.wbcInfoAfter.length !== 0 && !isBeforeChild.value) {
    wbcInfo.value = selectItemsVal.wbcInfoAfter;
    selectItemsVal.wbcInfo.wbcInfo[0].forEach((item: any) => {
      const title = item.title;
      const correspondingItem = selectItemsVal.wbcInfoAfter.find((afterItem: any) => afterItem.title === title);
      if (correspondingItem) {
        correspondingItem.images.forEach((item: any) => {
          item.title = title;
        })
      }
    });
  } else if (isBeforeChild.value) {
    wbcInfo.value = selectItemsVal.wbcInfo.wbcInfo[0];
    selectItemsVal.wbcInfo.wbcInfo[0].forEach((item: any) => {
      if (item.images) {
        if (item.images.length > 0) {
          item.images.forEach((itemImg: any) => {
            itemImg.title = item.title;
          })
        }
      }
    });
  }
  if (newData !== '') {
    selectItemsVal.wbcInfo.wbcInfo[0] = selectItemsVal.wbcInfo.wbcInfo[0].filter((item: any) => {
      return !newData.find((dataItem: any) => dataItem.customNum === item.id && dataItem.abbreviation === "");
    });
  }
  const oArr = orderClass.value.sort((a: any, b: any) => Number(a.orderText) - Number(b.orderText));
  const sortArr = orderClass.value.length !== 0 ? oArr : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  await sortWbcInfo(wbcInfo.value, sortArr);
}

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        orderClass.value = [];
      } else {
        orderClass.value = result.data.sort((a: any, b: any) => Number(a.orderText) - Number(b.orderText));
      }
    }
  } catch (e) {
    console.log(e)
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
  draggedCircleIndexArr.value.push(itemIndex);
}

function selectImage(itemIndex: any, imageIndex: any, classInfoitem: any) {
  // 쉬프트 키를 누른 경우
  if (isShiftKeyPressed.value) {
    if (firstClickedImageIndex.value !== null) {
      // 현재 선택한 이미지
      shiftClickImages.value.push(imageIndex);
      // 시작과 끝 인덱스 결정
      const start = Math.min(firstClickedImageIndex.value, imageIndex);
      const end = Math.max(firstClickedImageIndex.value, imageIndex);

      // 선택된 이미지 초기화
      selectedClickImages.value = [];
      selectItemIamgeArr.value = [];
      // 범위 내의 이미지 선택
      for (let i = start; i <= end; i++) {
        selectedClickImages.value.push({
          id: wbcInfo.value[itemIndex].id,
          title: wbcInfo.value[itemIndex].title,
          ...wbcInfo.value[itemIndex].images[i],
        });
        // console.log(wbcInfo.value[itemIndex])
        // console.log(classInfoitem)
        selectItemIamgeArr.value.push(classInfoitem);
      }
    }
  } else { // 쉬프트 키를 누르지 않은 경우
    // 처음 클릭한 이미지의 인덱스를 저장
    firstClickedImageIndex.value = imageIndex;

    const selectedImage = wbcInfo.value[itemIndex].images[imageIndex];
    if (!isCtrlKeyPressed.value) {
      selectedClickImages.value = [];
      selectItemIamgeArr.value = [];
      selectedClickImages.value.push({...selectedImage, id: wbcInfo.value[itemIndex].id});
      selectItemIamgeArr.value.push(classInfoitem);
      return;
    }

    // 선택된 이미지가 배열에 있는지 확인
    const imageIndexInSelected = selectedClickImages.value.findIndex((img: any) => img === selectedImage);

    if (imageIndexInSelected === -1) {
      selectedClickImages.value.push({...selectedImage, id: wbcInfo.value[itemIndex].id});
      selectItemIamgeArr.value.push(classInfoitem);
    } else {
      // 이미 선택된 이미지를 다시 클릭하면 선택 해제
      selectedClickImages.value.splice(imageIndexInSelected, 1);
      selectItemIamgeArr.value.splice(imageIndexInSelected, 1);
    }
  }
}


function isSelected(image: any) {
  const imageFileName = image.fileName;
  return selectedClickImages.value.some((selectedImage: any) => selectedImage.fileName === imageFileName);
}

async function onDrop(targetItemIndex: any) {
  if (isBeforeChild.value) {
    return;
  }
  addToRollbackHistory();
  if (selectedClickImages.value.length === 0) {
    return await originalOnDrop(targetItemIndex);
  }
  // 화면 딜레이
  await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: true});
  for (const selectedImage of selectedClickImages.value) {
    const fileName = selectedImage.fileName;
    const draggedItemIndex = wbcInfo.value.findIndex((item: any) => item.images.some((img: any) => img.fileName === fileName));
    const draggedItem = wbcInfo.value[draggedItemIndex];
    await moveImage(targetItemIndex, [{fileName: selectedImage.fileName}], draggedItem, wbcInfo.value[targetItemIndex], false);
  }
  // 화면 딜레이 끄기
  await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: false});
  // 선택된 이미지 초기화
  selectedClickImages.value = [];
  selectItemIamgeArr.value = [];
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

async function moveImage(targetItemIndex: number, selectedImagesToMove: any[], draggedItem: any, targetItem: any, type: boolean, keyMove?: string, wbcInfosArr?: any) {
  const {slotId} = selectItems.value;
  const arrType = selectedImagesToMove;
  let sourceFolders = [];
  let destinationFolders = [];
  let fileNames = [];

  // 선택된 이미지 배열에 대해 반복
  for (const selectedImage of arrType) {
    const fileName = selectedImage.fileName;
    fileNames.push(fileName)
    if (keyMove === 'keyMove') { // 단축키로 움직였을 경우
      const classInfoBagic = window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
      const matchingItem = classInfoBagic.find(item => item.title === selectedImage.title);
      const sourceFolder = type ? `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${matchingItem?.id}_${selectedImage.title}` :
          `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${matchingItem?.id}_${draggedItem.title}`;
      const destinationFolder = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${targetItem.id}_${targetItem.title}`;
      destinationFolders.push(destinationFolder);
      sourceFolders.push(sourceFolder);
      const data = {
        sourceFolders,
        destinationFolders,
        fileNames
      };
      await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: true});
      const res = await moveClassImagePost(data);
      if (res) {
        // 이미지를 타겟 아이템으로 이동
        const sourceItemIndex = wbcInfo.value.findIndex((item: any) => item.title === selectedImage.title);
        const sourceItem = wbcInfo.value[sourceItemIndex];
        const imageIndex = sourceItem.images.findIndex((image: any) => image.fileName === selectedImage.fileName);
        if (imageIndex !== -1) {
          const image = sourceItem.images.splice(imageIndex, 1)[0];
          image.title = wbcInfo.value[targetItemIndex].title;
          image.width = imageSize.value;
          image.height = imageSize.value;
          wbcInfo.value[targetItemIndex].images.push(image);
          // 카운트 업데이트
          sourceItem.count--;
          wbcInfo.value[targetItemIndex].count++;
        }

        // 선택된 이미지 초기화
        selectedClickImages.value = [];
        selectItemIamgeArr.value = [];
        shiftClickImages.value = [];
        await updateOriginalDb();
        await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: false});
      }
      return;
    }
    // wbcInfosArr => 원에다가 움직이거나 우클릭 해서 클래스 옮길 시 사용 하는 부분임
    if (!wbcInfosArr && keyMove !== 'keyMove') { // 마우스로 같은 class 공간으로 드롭시켜서 이동시

      const sourceFolder = type ? `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${selectedImage.id}_${selectedImage.title}` :
          `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${draggedItem.id}_${draggedItem.title}`;
      const destinationFolder = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${targetItem.id}_${targetItem.title}`;
      destinationFolders.push(destinationFolder);
      sourceFolders.push(sourceFolder);
      const data = {
        sourceFolders,
        destinationFolders,
        fileNames
      }
      let res = await moveClassImagePost(data);
      // 드래그된 이미지를 원래 위치에서 제거
      if (res) {
        const draggedImageIndex = draggedItem.images.findIndex((img: any) => img.fileName === fileName);
        draggedItem.images.splice(draggedImageIndex, 1);
        const imgAttr = {
          width: imageSize.value,
          height: imageSize.value,
        }
        // 드롭된 위치에 이미지를 삽입
        wbcInfo.value[targetItemIndex].images.push({...selectedImage, ...imgAttr});

        wbcInfo.value = removeDuplicateImages(wbcInfo.value);
        wbcInfo.value.forEach((item: any) => {
          item.count = item.images.length;
          if (item.images.length > 0) {
            item.images.forEach((itemImg: any) => {
              itemImg.title = item.title;
            })
          }
        });
      }
    }

  }
  if (wbcInfosArr) { // 동그라미 네비게이션 바로 옮길경우, 또는 우클릭 해서 클래스 이동시 사용
    // destinationFolders -> 이동 되는 폴더
    // sourceFolders -> 기존 폴더
    // targetItemIndex -> 이동되어야하는 아이템 인덱스
    // findImage - > 움직여야하는 이미지
    // draggedItemIdx - > 기존 폴더 위치
    // moveImgIsBool = > 사용자가 이미지 이동 시 다른 동작 못하도록 막는 레이어임
    await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: true});
    for (const seItem of selectItemIamgeArr.value) {
      const classInfoBagic = window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
      const matchingItem = classInfoBagic.find(item => item.title === seItem.title);
      const sourceFolder = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${matchingItem?.id}_${seItem.title}`;
      const destinationFolder = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${targetItem.id}_${targetItem.title}`;
      destinationFolders.push(destinationFolder);
      sourceFolders.push(sourceFolder);
    }
    const data = {
      sourceFolders,
      destinationFolders,
      fileNames
    }
    let res = await moveClassImagePost(data);
    if (res) {
      // selectedImagesToMove 배열의 이미지를 targetItemIndex에서 wbcInfo.value의 객체에 추가
      const targetItem = wbcInfo.value[targetItemIndex];
      for (const seItem of removeDuplicatesByProperty(selectItemIamgeArr.value, 'title')) {
        const findImage = selectedImagesToMove.filter(item => item.title === seItem.title);
        targetItem.images.push(...findImage);
        targetItem.count = targetItem.images.length;
        const draggedItemIdx = wbcInfo.value.findIndex((item: any) => item.title === seItem.title);
        if (draggedItemIdx !== -1) {
          const draggedItemObj = wbcInfo.value[draggedItemIdx];
          const selectedImagesFileNames = selectedImagesToMove.map(image => image.fileName);
          const filteredImages = draggedItemObj.images.filter((image: any) => !selectedImagesFileNames.includes(image.fileName));
          // 새로 생성한 배열을 draggedItemObj의 images 배열에 할당
          draggedItemObj.images = filteredImages;
          draggedItemObj.count = draggedItemObj.images.length;
        }
      }
      for (const images of selectedImagesToMove) {
        images.title = wbcInfo.value[targetItemIndex].title;
        images.width = imageSize.value;
        images.height = imageSize.value;
      }
      await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: false});
    } else {
      await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: false});
    }
  }
  // 선택된 이미지 초기화
  selectedClickImages.value = [];
  selectItemIamgeArr.value = [];
  shiftClickImages.value = [];
  allCheck.value = '';
  selectedTitle.value = '';
  // 원본 데이터베이스 업데이트
  await updateOriginalDb();
}

function removeDuplicatesByProperty(array: any, property: any) {
  const seen = new Set();
  return array.filter((item: any) => {
    const key = item[property];
    if (seen.has(key)) {
      return false; // 중복된 객체는 제거
    } else {
      seen.add(key);
      return true; // 처음 등장한 객체는 유지
    }
  });
}


function removeDuplicateImages(data: any[]): any[] {
  const uniqueFileNames = new Set<string>();

  return data.map(item => {
    const uniqueImages = item.images.filter((image: any) => {
      if (!uniqueFileNames.has(image.fileName)) {
        uniqueFileNames.add(image.fileName);
        return true;
      }
      return false;
    });

    return {...item, images: uniqueImages};
  });
}

const getStringArrayBySiteCd = (siteCd: string, testType: string): string[] => {
  if (!siteCd && siteCd === '') {
    siteCd = '0000';
    testType = '01';
  }
  // 사전을 사용하여 각 siteCd에 따라 반환할 배열을 정의
  const arraysBySiteCd: any = {
    '0006': {
      includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
      includesStr2: ["NR", "AR", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
    },
  };

  // 지정된 siteCd에 대한 배열을 가져오거나, 기본 배열을 반환
  const arraysForSiteCd = arraysBySiteCd[siteCd] || {
    includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
    includesStr2: ["NR", "AR", "MC", "MA", 'NE', "SM", 'GP', 'PA', 'OT'],
  };

  // testType에 따라 적절한 배열을 반환
  return (testType === '01' || testType === '04') ? arraysForSiteCd.includesStr : arraysForSiteCd.includesStr2;
};


async function updateOriginalDb(notWbcAfterSave?: string) {
  let originalDbVal: any = [];
  // wbcInfo.value를 깊은 복제(clone)하여 새로운 배열을 생성
  let clonedWbcInfo = JSON.parse(JSON.stringify(wbcInfo.value));
  let totalCount = 0;
  clonedWbcInfo.forEach((item: any) => {
    if (projectType.value === 'bm') {
      if (item.title !== 'OT') {
        totalCount += Number(item.count);
      }
    } else {
      const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
      if (!targetArray.includes(item.title)) {
        totalCount += Number(item.count);
      }
    }
  });
  // 각 이미지 객체에서 width와 height 속성은 저장 안해도되는 부분이라서 디비에 저장 안함
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      delete image.width;
      delete image.height;
      delete image.filter;
    });
    if (projectType.value === 'bm') {
      if (item.title !== 'OT') {
        const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1);
        item.percent = (Number(percentage) === Math.floor(Number(percentage)))
            ? Math.floor(Number(percentage)).toString()
            : percentage;
      }
    } else {
      const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
      if (!targetArray.includes(item.title)) { // 퍼센트를 소수점 한 자리까지 계산
        const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1); // 소수점 부분이 0이면 정수만, 아니면 소수점 한 자리까지 표시
        item.percent = (Number(percentage) === Math.floor(Number(percentage)))
            ? Math.floor(Number(percentage)).toString()
            : percentage;
      }
    }

  });

  let uniqueImages: any = [];
  const uniqueData = clonedWbcInfo.map((item: any) => {
    const uniqueImagesForItem = item.images.filter((image: any) => {
      if (!uniqueImages.includes(image.fileName)) {
        uniqueImages.push(image.fileName);
        return true;
      }
      return false;
    });
    return {...item, images: uniqueImagesForItem};
  });
  clonedWbcInfo = uniqueData;
  if (notWbcAfterSave !== 'notWbcAfterSave') {
    // wbcInfoAfter 업데이트 및 sessionStorage에 저장
    selectItems.value.wbcInfoAfter = clonedWbcInfo;
    sessionStorage.setItem("selectItems", JSON.stringify(selectItems.value));
    sessionStorage.setItem("selectItemWbc", JSON.stringify(clonedWbcInfo));
    await store.dispatch('commonModule/setCommonInfo', {clonedWbcInfo: clonedWbcInfo});

    // originalDb 업데이트
    const filteredItems = originalDb.value.filter((item: any) => item.id === selectItems.value.id);
    if (filteredItems.length > 0) {
      filteredItems.forEach((filteredItem: any) => {
        filteredItem.wbcInfoAfter = clonedWbcInfo;
      });
    }
    originalDbVal = filteredItems;
  }


  //updateRunningApi 호출
  await updateRunningApiPost(clonedWbcInfo, originalDbVal);
}

async function updateRunningApiPost(wbcInfo: any, originalDb: any) {
  try {
    const response = await updateRunningApi({userId: Number(userId.value), runingInfoDtoItems: originalDb})
    if (response) {
      if (cellMarkerIcon.value) {
        // 다시 불러올경우 셀마킹이 켜있는경우 다시 셀마크 그려주기
        await drawCellMarker(true);
      }
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function getImageUrl(imageName: any, id: string, title: string, highImg: string, findAfterArr?: boolean): string {
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!wbcInfo.value || wbcInfo.value.length === 0) {
    return "";
  }

  const slotId = selectItems.value.slotId || "";
  let folderPath = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${id}_${title}`;
  let url = '';
  if (isBeforeChild.value) {

    if (getNewImageUrl(imageName, title)) {
      const {idMa, titleMa} = getNewImageUrl(imageName, title);
      folderPath = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${idMa}_${titleMa}`;
    }

  }
  if (highImg === 'getImageRealTime' || projectType.value === 'pb') {
    url = `${apiBaseUrl}/images/getImageRealTime?folder=${folderPath}&imageName=${imageName}`;
  } else {
    url = `${apiBaseUrl}/images?folder=${folderPath}&imageName=${imageName}`;
  }
  return url;

}


async function rollbackChanges() {
  if (rollbackHistory.length > 0) {
    // 롤백할 때마다 히스토리에서 마지막 상태를 꺼내어 복원
    const prevWbcInfo = rollbackHistory.pop();

    // 롤백 후 초기화
    draggedItemIndex.value = null;
    draggedImageIndex.value = null;
    draggedCircleIndex.value = null;
    draggedCircleIndexArr.value = [];
    draggedCircleImgIndex.value = null;
    selectedClickImages.value = [];
    selectItemIamgeArr.value = [];
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
  let sourceFolders = [];
  let destinationFolders = [];
  let fileNames = [];

  // 이동된 이미지들을 이전 위치로 다시 이동시킴
  for (const index in sourceFolderInfo) {
    const sourceFolder = `${pbiaRootPath.value}/${selectItems.value.slotId}/${projectTypeReturn(projectType.value)}/${sourceFolderInfo[index].id}_${sourceFolderInfo[index].title}`;
    const destinationFolder = `${pbiaRootPath.value}/${selectItems.value.slotId}/${projectTypeReturn(projectType.value)}/${destinationFolderInfo[index].id}_${destinationFolderInfo[index].title}`;
    sourceFolders.push(sourceFolder)
    destinationFolders.push(destinationFolder)
    fileNames.push(sourceFolderInfo[index].fileName)

  }
  const data = {
    sourceFolders: sourceFolders,
    destinationFolders: destinationFolders,
    fileNames: fileNames,
  }
  let response = await moveClassImagePost(data);

  if (response) {
    wbcInfo.value = prevWbcInfo;
  }
  // 원본 데이터베이스 업데이트
  await updateOriginalDb();
}

const projectTypeReturn = (type: string): any => {
  if (type === 'bm') {
    return '04_BM_Classification';
  } else if (type === 'pb') {
    return '01_WBC_Classification';
  }
}

</script>
