<template>
  <div v-show="moveImgIsBool" class="moveImgIsBool"> Moving image...</div>
  <!--  <div v-show="moveImgIsBool" class="moveImgIsBool"> Loading...</div>-->
  <ClassInfoMenu @refreshClass="refreshClass" :isNext="isNext" @isNextFalse="isNextFalse"
                 :changeSlideByLisUpload="changeSlideByLisUpload"/>

  <div class="wbcContent">
    <DetailHeader
        v-if="slideData"
        :testType="projectType === 'bm' ? getBmTestTypeText(selectItems?.testType) : getTestTypeText(selectItems?.testType)"
        :barcodeNo="selectItems?.barcodeNo"
        :cbcPatientNo="selectItems?.cbcPatientNo"
        :hospitalName="selectItems?.hosName"
        :cbcSex="selectItems?.cbcSex"
        :cbcAge="selectItems?.cbcAge"
        :analyzedDttm="selectItems?.analyzedDttm"
        :cbcPatientName="cbcPatientNm"
        :patientName="patientNm"
        :slideData="selectItems"
        @updateSlideDataByCBCData="updateCBCData"
        @nextPage="nextPage"
        @uploadLisChangeSlide="uploadLisChangeSlide"
        :checkedAllClass="checkedAllClass"
    />
    <LisCbc v-if="cbcLayer" :selectItems="selectItems"/>
    <div :class="'databaseWbcRight shadowBox' + (cbcLayer ? ' cbcLayer' : '')">
      <ClassInfo v-if="!isLoading" :wbcInfo="wbcInfo" :classCompareShow="classCompareShow"
                 type='listTable'
                 @scrollEvent="scrollToElement"
                 :selectItems="selectItems"
      />
    </div>

    <div :class="'databaseWbcLeft' + (cbcLayer ? ' cbcLayer' : '')">
      <div class="listDetail-top-button-container">
        <div class="listDetail-top-button-wrapper">
          <Button
              class="wbc-img-set"
              size="sm"
              @click="imgSetOpen"
              @mouseover="tooltipVisibleFunc('imageSetting', true)"
              @mouseout="tooltipVisibleFunc('imageSetting', false)"
              :icon="['fas', 'gear']"
              :isActive="imgSet"
          >
            IMG Setting
            <Tooltip :isVisible="tooltipVisible.imageSetting" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.CELL_IMG_SETTING"/>
          </Button>
          <Button
              type="button"
              size="sm"
              @click="drawCellMarker(false)"
              class="pos-relative"
              @mouseover="tooltipVisibleFunc('cellMarking', true)"
              @mouseout="tooltipVisibleFunc('cellMarking', false)"
              :icon="['fas', 'marker']"
              :isActive="cellMarkerIcon"
          >
            Cell Marking
            <Tooltip :isVisible="tooltipVisible.cellMarking" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.CELL_MARKING"/>
          </Button>
          <Button
              size="sm"
              @click="classCompare"
              @mouseover="tooltipVisibleFunc('classCompare', true)"
              @mouseout="tooltipVisibleFunc('classCompare', false)"
              :icon="['fas', 'code-compare']"
              :isActive="classCompareShow"
          >
            Class Compare
            <Tooltip :isVisible="tooltipVisible.classCompare" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.CELL_CLASS_COMPARE"/>
          </Button>
          <Button
              @click="wps"
              v-if="isWpsBtnShow"
              size="sm"
              @mouseover="tooltipVisibleFunc('wps', true)"
              @mouseout="tooltipVisibleFunc('wps', false)"
              :icon="['fas', 'expand']"
              :isActive="wpsShow"
          >
            WPS
            <Tooltip :isVisible="tooltipVisible.wps" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.CELL_WPS"/>
          </Button>
        </div>
        <div class="listDetail-top-button-wrapper">
          <div class="listDetail-img-setting-container wbc-img-set" v-show="imgSet">
            <div class="listDetail-img-setting-wrapper">
              <div class="flex-center">
                <h1>Size</h1>
                <div class="customImgSet">
                  <input
                      type="number"
                      :value="displayValue"
                      @input="updateImageSize"
                  />
                </div>

              </div>
              <input
                  style="display: inline-flex"
                  type="range"
                  min="50"
                  max="290"
                  v-model="imageSize"
                  @input="changeImageSize"
              />
              <Button @click="imgSizeReset" class="w-full">
                Size Reset
              </Button>
            </div>
            <div class="listDetail-img-setting-wrapper">
              <div>
                <font-awesome-icon :icon="['fas', 'sun']"/>
                Brightness
                <div class="customImgSet"><input type="number" v-model="imgBrightness" @input="changeImgBrightness"/></div>
              </div>
              <input
                  type="range"
                  min="50"
                  max="120"
                  v-model="imgBrightness"
                  @input="changeImgBrightness"
              />
              <Button @click="brightnessReset" class="w-full">Brightness Reset</Button>
            </div>
            <div class="listDetail-img-setting-wrapper">
              <div>
                <font-awesome-icon :icon="['fas', 'palette']"/>
                RGB
                <div class="customImgSet rgb">
                  [
                  <input type="number" v-model="imageRgb[0]" @input="changeImageRgb('')"/>,
                  <input type="number" v-model="imageRgb[1]" @input="changeImageRgb('')"/>,
                  <input type="number" v-model="imageRgb[2]" @input="changeImageRgb('')"/>
                  ]
                </div>
              </div>
              <div class="listDetail-img-setting-rbcWrapper">
                <label>R</label>
                <input
                    type="range"
                    min="0"
                    max="255"
                    v-model="imageRgb[0]"
                    @input="changeImageRgb('')"
                />
              </div>
              <div class="listDetail-img-setting-rbcWrapper">
                <label>G</label>
                <input
                    type="range"
                    min="0"
                    max="255"
                    v-model="imageRgb[1]"
                    @input="changeImageRgb('')"
                />
              </div>
              <div class="listDetail-img-setting-rbcWrapper">
                <label>B</label>
                <input
                    type="range"
                    min="0"
                    max="255"
                    v-model="imageRgb[2]"
                    @input="changeImageRgb('')"
                />
              </div>
              <Button @click="rgbReset" class="w-full">RGB Reset</Button>
            </div>

          </div>
          <Button
              @click="rollbackChanges"
              size="sm"
              @mouseover="tooltipVisibleFunc('rollback', true)"
              @mouseout="tooltipVisibleFunc('rollback', false)"
              :icon="['fas', 'rotate-left']"
          >
            Rollback
            <Tooltip :isVisible="tooltipVisible.rollback" className="mb08 left20" :style="'left: 12px;'" position="top"
                     type="" :message="MSG.TOOLTIP.CELL_ROLLBACK"/>
          </Button>
        </div>
      </div>
      <div>
        <ImageGallery
            v-if="isLoadedSlideData && router.currentRoute.value.fullPath === '/databaseDetail'"
            ref="$imageGalleryRef"
            :wbcInfoRefresh="wbcInfoRefresh"
            :wbcInfo="wbcInfo"
            :wbcReset="wbcReset"
            :selectItems="selectItems"
            :totalCount="selectItems?.wbcInfo?.totalCount"
            :slotId="selectItems?.slotId"
            :iaRootPath="iaRootPath"
            :projectTypeReturn="projectTypeReturn(projectType)"
            :projectType="projectType"
            :apiBaseUrl="apiBaseUrl"
            :classCompareShow="classCompareShow"
            :wpsShow="wpsShow"
            :selectedTitle="selectedTitle"
            :hiddenImages="hiddenImages"
            :replaceFileNamePrefix="replaceFileNamePrefix"
            :onDragOver="onDragOver"
            :isBorderChanged="isBorderChanged"
            :isSelected="isSelected"
            :imageSize="imageSize"
            :updateWbcInfo="updateWbcInfo"
            @imgWpsIsSelect="wpsIsSelected"
            @allCheckChange="allCheckChange"
            @selectImage="selectImage"
            @borderDel="borderDel"
            @borderOn="borderOn"
            @openModal="openModal"
            @hideImage="hideImage"
            @handleRightClick="handleRightClick"
            @onDrop="onDrop"
            @onDragStart="onDragStart"
            @onDropCircle="onDropCircle"
            @onDragOverCircle="onDragOverCircle"
            @scrollToElement="scrollToElement"
            @allClassesChecked="allClassesChecked"
            :cellRef="cellRef"
            @update:cellRef="handleUpdateCellRef"
        />
      </div>
      <!--   우클릭 항목 메뉴   -->
      <div v-if="contextMenuVisible" :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
           class="context-menu detail">
        <ul>
          <li
              v-for="(item, itemIdx) in wbcInfo"
              :key="itemIdx"
              @click="moveSelectedImages(item, itemIdx)"
          >
            {{ excludeClassName(item.name, itemIdx) }}
          </li>
        </ul>
      </div>

      <!-- 모달 창 -->
      <div class="wbcModal" v-show="modalOpen" @wheel="handleWheel" @click="outerClickCloseModal">
        <div class="wbc-modal-content">
          <div class="wbcModal-title-wrapper">
            <h2>Cell Detail Information</h2>
            <span class="wbcClose" @click="closeModal">&times;</span>
          </div>

          <div :class="!isObjectEmpty(wpsJsonData) ? 'wbcModalImageContent' : 'wbcModalImageContentBefore'">
            <img :src="selectedImageSrc" :style="{ width: modalImageWidth, height: modalImageHeight }"
                 ref="modalImage"/>
          </div>

          <div :class="!isObjectEmpty(wpsJsonData) ? 'wbcModalButton-wrapper' : 'wbcModalButton-wrapperBefore'">
            <div class="rangeBox">
              <p>{{ ((zoomValue - 200) / 400 * 100).toFixed(0) }} %</p>
              <input type="range" min="200" max="600" v-model="zoomValue" @input="handleZoom"/>
            </div>
          </div>

          <div v-if="!isObjectEmpty(wpsJsonData)" class="wbcModalImageContent-slideImg">
            <img :src="slidePositionImg" ref="imageRef" @load="drawCanvas" style="display: none"/>
            <canvas ref="canvasRef"></canvas>
          </div>
        </div>
      </div>

    </div>
  </div>

  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
  />
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
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watch
} from "vue";
import {moveClassImagePost} from "@/common/api/service/dataBase/wbc/wbcApi";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {readDziFile, readFileTxt, readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {
  getBfHotKeysApi, getNormalRangeApi,
  getOrderClassApi,
  getWbcCustomClassApi,
  getWbcHotKeysApi
} from "@/common/api/service/setting/settingApi";
import {deleteDeleteFolderApi, fileSysPost, getFolders} from "@/common/api/service/fileSys/fileSysApi";
import {getBmTestTypeText, getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {
  basicBmClassList,
  basicWbcArr,
  defaultBmClassList,
  defaultWbcClassList
} from "@/store/modules/analysis/wbcclassification";
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import ClassInfo from "@/views/datebase/commponent/detail/classInfo/commonRightInfo/classInfo.vue";
import LisCbc from "@/views/datebase/commponent/detail/lisCbc.vue";
import ImageGallery from '@/views/datebase/commponent/detail/classInfo/ImageGallery.vue';
import Alert from "@/components/commonUi/Alert.vue";
import {disableScroll, enableScroll} from "@/common/lib/utils/scroll";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import DetailHeader from "@/views/datebase/commponent/detail/detailHeader.vue";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {MESSAGES, MSG, MSG_GENERAL} from "@/common/defines/constants/constantMessageText";
import {checkPbNormalCell} from "@/common/lib/utils/changeData";
import {getDeviceIpApi} from "@/common/api/service/device/deviceApi";
import {initCBCData} from "@/common/helpers/lisCbc/initCBC";
import {
  gqlGenericUpdate,
  isAllClassCheckedUpdateMutation,
  useUpdateRunningInfoMutation
} from "@/gql/mutation/slideData";
import {useImageRefs} from "@/common/lib/utils/useImageRefs";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import slidePositionImg from "@/assets/images/slide_pos.png";
import {DIR_NAME} from "@/common/defines/constants/settings";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {apiUrl} from "@/common/api/apiUrl";
import router from "@/router";
import Button from "@/components/commonUi/Button.vue";
import {TooltipListDetailType} from "@/common/type/tooltipType";

const selectedTitle = ref('');
const wbcInfo = ref<any>(null);
const updateWbcInfo = ref<any>(null)

const selectItems = ref<any>(null);
const store = useStore();
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const moveImgIsBool = computed(() => store.state.commonModule.moveImgIsBool);
const classInfoSort = computed(() => store.state.commonModule.classInfoSort);
const iaRootPath = ref<any>(store.state.commonModule.iaRootPath);
const siteCd = computed(() => store.state.commonModule.siteCd);
const deviceSerialNm = computed(() => store.state.commonModule.deviceSerialNm);
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const draggedItemIndex = ref<any>(null);
const draggedImageIndex = ref<any>(null);
const isShiftKeyPressed = ref(false);
const isCtrlKeyPressed = ref(false);
const firstClickedImageIndex = ref(null);
const wbcInfoRefresh = ref(false);

const draggedCircleIndex = ref<any>(null);
const draggedCircleIndexArr = ref<any>([]);
const draggedCircleImgIndex = ref<any>(null);
const selectedClickImages = ref<any>([]);
const shiftClickImages = ref<any>([]);
const rollbackHistory: any = [];
const imageSize = ref(150);
const imgBrightness = ref(100);
const imageRgb = ref([0, 0, 0]);
const selectSizeTitle = ref('ME')
const allCheck = ref('');
const cellRef = ref(null);
const cellMarkerIcon = ref(false);
const modalOpen = ref(false);
const selectedImageSrc = ref('');
const modalImageWidth = ref('200px');
const modalImageHeight = ref('200px');
const imgSet = ref(false);
const apiBaseUrl = window.LINUX_SERVER_SET ? window.EQUIPMENTPCIP : window.APP_API_BASE_URL;
const wbcCustomItems = ref<any>([]);
const wbcHotKeysItems = ref<any>([]);
const bfHotKeysItems = ref<any>([]);
const projectType = ref<any>('');
const opacity = ref('0.9');
const zoomValue = ref(200);

const selectItemImageArr = ref<any>([]);
const moveRightClickArr = ref<any>([]);
const orderClass = ref<any>([]);
const hiddenImages = ref<{ [key: string]: boolean }>({});
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const targetItem = ref<any>(null);
const isNext = ref(false);
const classCompareShow = ref(false);
const wpsShow = ref(false);
const isLoading = ref(true);
const $imageGalleryRef = ref<any>(null);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const wbcReset = ref(false);
const isLoadedSlideData = ref(true);
const isWpsBtnShow = ref(false);
const blockClicks = ref(false);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);
const changeSlideByLisUpload = ref(false);
const normalItems = ref<any>([]);
const slideData = computed(() => store.state.slideDataModule);
const ipAddress = ref('');
const patientNm = ref('');
const cbcPatientNm = ref('');
const checkedAllClass = ref(false);
const {imageRefs} = useImageRefs();
const wpsJsonData = ref<any>([]);
let abortController = new AbortController();

const wbcXYPos = ref({
  totalWidth: '0',
  totalHeight: '0',
  posX: '0',
  posY: '0',
})
const imageRef = ref<HTMLImageElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const tooltipVisible = ref<TooltipListDetailType>({
  cellMarking: false,
  imageSetting: false,
  classCompare: false,
  wps: false,
  rollback: false,
})


onBeforeMount(async () => {
  isLoading.value = false;
  isLoadedSlideData.value = false;
  projectType.value = window.PROJECT_TYPE;
  isLoadedSlideData.value = false;
  wbcInfoRefresh.value = false;
})

onMounted(async () => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  document.body.addEventListener("click", handleBodyClick);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(async () => {
  document.addEventListener('click', handleClickOutside);
})

watch(
    () => slideData.value,
    async (newVal, oldVal) => {
      if (newVal.id !== oldVal?.id) {
        await nextTick();

        if (projectType.value !== 'bm') {
          await checkWps(newVal);
        } else {
          isWpsBtnShow.value = false;
        }
        try {
          if (router.currentRoute.value.fullPath === '/databaseDetail') {

            await getNormalRange(); // 함수가 선언된 이후 호출
            await getDetailRunningInfo(newVal);
            await getWPSData();
            isLoadedSlideData.value = false;
            wbcInfo.value = [];
            isLoadedSlideData.value = true;

            await getWbcCustomClasses(false, null);
            wbcInfoRefresh.value = true;

            await imgSetLocalStorage();
            cellMarkerIcon.value = false;
            await drawCellMarker(true);
          }

        } catch (error) {
          console.error('비동기 작업 중 에러 발생:', error);
        }
      }
    },
    {immediate: true, deep: true}
);


watch(imgBrightness, (newVal) => {
  localStorage.setItem('imgBrightness', String(newVal));
});

watch(imageSize, (newVal) => {
  localStorage.setItem('imageSize', String(newVal));
})

watch(imageRgb, (newVal) => {
  const red = newVal[0];
  const green = newVal[1];
  const blue = newVal[2];
  localStorage.setItem('imageRgb', JSON.stringify([red, green, blue]));
}, {deep: true});

watch(() => moveImgIsBool.value, (currentMoveImgIsBool) => {
  if (currentMoveImgIsBool) {
    disableScroll();
  } else {
    enableScroll();
  }
})


const borderDel = () => {
  blockClicks.value = true;
}

const borderOn = () => {
  blockClicks.value = false;
}

const checkWps = async (newVal: any) => {
  const filePath = `${iaRootPath.value}/${newVal?.slotId}/04_WPS`;

  const foldersPath = `folderPath=${filePath}`;
  const wpsFolderCheck = await getFolders(foldersPath);
  if (wpsFolderCheck?.code !== 400) {
    isWpsBtnShow.value = true;
  } else {
    isWpsBtnShow.value = false;
    wpsShow.value = false;
  }
}
const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};
const handleZoom = () => {
  const newSize = zoomValue.value;
  modalImageWidth.value = `${newSize}px`;
  modalImageHeight.value = `${newSize}px`;
};

const getDetailRunningInfo = async (newValue: any) => {
  try {
    iaRootPath.value = newValue?.img_drive_root_path !== '' && newValue?.img_drive_root_path !== null && newValue?.img_drive_root_path ? newValue?.img_drive_root_path : store.state.commonModule.iaRootPath;
    patientNm.value = newValue?.patientNm;
    cbcPatientNm.value = newValue?.cbcPatientNm;
    selectItems.value = newValue;

  } catch (e) {
    console.error(e);
  }
}
const handleUpdateCellRef = (refValue: any) => {
  cellRef.value = refValue.value;
};

const classCompare = () => {
  wpsShow.value = false;
  classCompareShow.value = !classCompareShow.value;
}

const wps = () => {
  classCompareShow.value = false;
  wpsShow.value = !wpsShow.value;
  if (!wpsShow.value) {
    blockClicks.value = false;
  }
}

const imgPixelConvertToPercent = (imageSize: number) => {
  return Math.floor(((imageSize - 50) / 240) * 170 + 30) + '%';
}
const percentConvertToPixel = (percent: number): number => {
  return Math.floor((percent - 30) * 240 / 170 + 50);
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

  const red = imageRgb.value[0];
  const green = imageRgb.value[1];
  const blue = imageRgb.value[2];
  wbcInfo.value.forEach((item: any) => {
    item.images.forEach((image: any) => {
      image.filter = `opacity(0.9) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${imgBrightness.value}%)`;
      image.width = Number(imageSize.value);
      image.height = Number(imageSize.value);
    });
  });
}

const nextPage = () => {
  isNext.value = true;
}

const isNextFalse = () => {
  isNext.value = false;
}

const handleRightClick = (event: MouseEvent, image: any, item: any, itemIndex: number, imageIndex: number) => {
  event.preventDefault();
  if (selectItemImageArr.value.length === 0) {
    selectImage(itemIndex, imageIndex, item);
  }
  openContextMenu(event, item);
};

function hideImage(id: string, fileName: string, title?: string) {
  hiddenImages.value[`${id}-${fileName}`] = true;
}

const handleClickOutside = (event: any) => {
  // 클릭 이벤트의 대상이 imgSet이 아닌지 확인
  if (!event.target.closest('.wbc-img-set')) {
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
  const menuHeight = 506;

  // 화면의 높이와 마우스 클릭 위치를 기준으로 기본 위치 설정
  const screenHeight = window.innerHeight;
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  contextMenuVisible.value = true;

  let menuX = mouseX;
  let menuY = mouseY;

  // 메뉴가 화면을 벗어나지 않도록 조정
  if (mouseY + menuHeight > screenHeight) {
    // 메뉴를 마우스 커서 위쪽에 띄움
    menuY = mouseY - menuHeight;
  } else {
    // 메뉴를 마우스 커서 아래쪽에 띄움
    menuY = mouseY;
  }

  // X 위치 조정 (화면을 벗어나지 않도록)
  const menuWidth = 200;
  if (menuX + menuWidth > window.innerWidth) {
    menuX = window.innerWidth - menuWidth;
  }

  contextMenuX.value = menuX;
  contextMenuY.value = menuY;
  targetItem.value = item;
};


const moveSelectedImages = async (item: any, itemIdx: any) => {
  // 사진 선택 하지 않고 우클릭 후 이미지 변경 하였을 경우

  if (!selectedClickImages.value || Object.entries(selectedClickImages.value).length === 0) {
    showAlert.value = true;
    alertType.value = 'error';
    alertMessage.value = `Please select an image`;
    return;
  }
  const matchingItemFind = wbcInfo.value.find((infoItem: any) => infoItem.id === item.id);

  if (targetItem.value.title === matchingItemFind.title) {
    showAlert.value = true;
    alertType.value = 'error';
    alertMessage.value = `Transfer to different classes is the only option available.`;
    return;
  }

  await addToRollbackHistory();

  const draggedItem = wbcInfo.value[itemIdx];
  if (targetItem.value) {
    const matchingItemIndex = wbcInfo.value.findIndex((infoItem: any) => infoItem.id === item.id);
    await moveImage(matchingItemIndex, selectedClickImages.value, draggedItem, wbcInfo.value[matchingItemIndex], false, '', wbcInfo.value);
    contextMenuVisible.value = false;
  }
  contextMenuVisible.value = false;
};

const excludeClassName = (title: string, itemIdx: number): string => {
  if (title === 'Smudge' && siteCd.value !== HOSPITAL_SITE_CD_BY_NAME['고대안암병원']) return "";
  return `${itemIdx + 1}.${title}`;
}

const sortWbcInfo = async (wbcInfo: any, basicWbcArr: any) => {
  let newSortArr = wbcInfo.slice(); // 기존 배열 복사

  newSortArr.sort((a: any, b: any) => {
    const nameA = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (a.title || a.abbreviation));
    const nameB = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (b.title || b.abbreviation));

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });

  // 정렬된 배열을 wbcInfo에 할당
  wbcInfo.splice(0, wbcInfo.length, ...newSortArr);

};


const getWbcCustomClasses = async (upDown: any, upDownData: any) => {
  const ip = await getDeviceIpApi();
  ipAddress.value = ip.data;
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
          const filePath = `${iaRootPath.value}/${selectItems.value?.slotId}/${projectTypeReturn(projectType.value)}/${item.customNum}_${item?.abbreviation}`;
          deleteDeleteFolderApi({path: filePath})
        }
      });
    }
    sessionStorage.setItem('customClass', JSON.stringify(data));
    wbcCustomItems.value = data;
    let wbcinfo = selectItems.value?.wbcInfoAfter.length !== 0 ? selectItems.value?.wbcInfoAfter : selectItems.value?.wbcInfo.wbcInfo[0];
    if (newData.length !== 0) {
      for (const item of newData) { // 커스텀클래스 폴더 생성
        const {fullNm, abbreviation, customNum} = item;
        const filePath = `${iaRootPath.value}/${selectItems.value?.slotId}/${projectTypeReturn(projectType.value)}/${customNum}_${abbreviation}`;
        await fileSysPost({path: filePath});

        const wbcPush = {
          id: customNum,
          name: fullNm,
          count: '0',
          images: [],
          title: abbreviation,
        };

        const foundObject = wbcinfo.find((wbcItem: any) => wbcItem.id == wbcPush.id && wbcItem.name === wbcPush.name);
        if (!foundObject) {
          wbcinfo.push(wbcPush);
          wbcInfo.value = wbcinfo;
          await updateOriginalDb('notWbcAfterSave');
        }
      }
    } else {
      const itemsToDelete: any = [];
      const sortArr = window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
      wbcinfo.forEach((item: any) => {
        const findDelData = sortArr.find((dataItems: any) => dataItems.id === item.id);
        if (!findDelData) {
          const filePath = `${iaRootPath.value}/${selectItems.value?.slotId}/${projectTypeReturn(projectType.value)}/${item}_${item?.title}`;
          deleteDeleteFolderApi({path: filePath});
          itemsToDelete.push(item);
        }
      });
      // 수집한 아이템을 wbcinfo 배열에서 삭제
      itemsToDelete.forEach((item: any) => {
        const index = wbcinfo.indexOf(item);
        if (index > -1) {
          wbcinfo.splice(index, 1);
        }
      });
      selectItems.value.wbcInfoAfter = wbcinfo
      wbcInfo.value = selectItems.value.wbcInfoAfter;
      await updateOriginalDb();

    }
    await getWbcHotKeyClasses();
    // await getBfHotKeyClasses();
    await getOrderClass();
    await initData(newData, upDown, upDownData);
  } catch (e) {
    console.error(e);
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
    console.error(e);
  }
}

const getWbcHotKeyClasses = async () => {
  try {
    const result = await getWbcHotKeysApi();
    if (result && result?.data) {
      wbcHotKeysItems.value = result.data;
    }
  } catch (e) {
    console.error(e);
  }
}


function isBorderChanged(image: any) {
  const prefix = image.fileName.split('_')[0];
  const isNsNbIntegration = selectItems.value.wbcInfoAfter.find((el: any) => {
    return el.title === 'NE'
  })

  const replacements: any = {
    'NES': isNsNbIntegration ? 'NE' : 'NS',
    'NEB': 'NB'
  };

  const modifiedPrefix = Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(key, replacements[key]);
  }, prefix);

  return image.title !== modifiedPrefix;
}

function replaceFileNamePrefix(fileName: string) {
  const isNsNbIntegration = selectItems.value.wbcInfoAfter.find((el: any) => {
    return el.title === 'NE'
  })

  const replacements: any = {
    'NES': isNsNbIntegration ? 'NE' : 'NS',
    'NEB': isNsNbIntegration ? 'NE' : 'NB'
  };

  const prefix = fileName.split('_')[0];

  // 대체 규칙에 따라 prefix를 변경
  const modifiedPrefix: any = Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(key, replacements[key]);
  }, prefix);
  // 변경된 prefix 반환
  return modifiedPrefix;
}


const openModal = async (image: any, item: any) => {
  modalOpen.value = true;
  selectedImageSrc.value = getImageUrl(image.fileName, item.id, item.title, 'getImageRealTime');
  await getImageXYPosition(image);
};

const closeModal = () => {
  modalOpen.value = false;
};

const outerClickCloseModal = (e: any) => {
  if (e.target.classList.contains('wbcModal')) {
    modalOpen.value = false;
  }
}

const handleWheel = (event: WheelEvent) => {
  if (event.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

const imgSetOpen = () => {
  imgSet.value = !imgSet.value
}

const zoomIn = () => {
  let newWidth = Math.min(parseFloat(modalImageWidth.value) + 50, 600);
  let newHeight = Math.min(parseFloat(modalImageHeight.value) + 50, 600);

  modalImageWidth.value = `${newWidth}px`;
  modalImageHeight.value = `${newHeight}px`;
  zoomValue.value = Number(newWidth);
};


const zoomOut = () => {
  let newWidth = Math.max(parseFloat(modalImageWidth.value) - 50, 200);
  let newHeight = Math.max(parseFloat(modalImageHeight.value) - 50, 200);

  modalImageWidth.value = `${newWidth}px`;
  modalImageHeight.value = `${newHeight}px`;
  zoomValue.value = Number(newWidth);

};

watch(userModuleDataGet.value, (newUserId, oldUserId) => {
  userId.value = newUserId.id;
});

watch(() => classInfoSort.value, async (newItem) => { // 오더클래스부분 순서 변경시 감지하여 재정렬
  wbcInfoRefresh.value = true;
  await getOrderClass();
  const sortArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
  await sortWbcInfo(wbcInfo.value, sortArr);
});

const refreshClass = async (data: any) => {
  isLoadedSlideData.value = false;
  cellMarkerIcon.value = false;
  await getDetailRunningInfo(data);
  await getWPSData();
  isLoadedSlideData.value = true;
  await drawCellMarker(true);
  classCompareShow.value = false;
  iaRootPath.value = selectItems.value?.img_drive_root_path !== '' && selectItems.value?.img_drive_root_path ? selectItems.value?.img_drive_root_path : store.state.commonModule.iaRootPath;

  await getWbcCustomClasses(true, data);
  await imgSetLocalStorage();
  await nextTick();
  if (projectType.value !== 'bm') {
    await checkWps(data);
  } else {
    isWpsBtnShow.value = false;
  }
}

const calculatedX = computed(() => {
  if (isObjectEmpty(wpsJsonData)) {
    return;
  }

  const x1 = Number(wpsJsonData.value[0]?.x1 || 0);
  const x2 = Number(wpsJsonData.value[0]?.x2 || 0)
  const tempX = Math.round(x1 + Number(wbcXYPos.value.posX) / (Number(wbcXYPos.value.totalWidth) / (x2 - x1)))
  return ((tempX / 256) * 22).toFixed(2);
});

const realX = computed(() => {
  return (calculatedX.value / 22) * 256;
})

const calculatedY = computed(() => {
  if (isObjectEmpty(wpsJsonData)) {
    return;
  }

  const y1 = Number(wpsJsonData.value[0]?.y1 || 0);
  const y2 = Number(wpsJsonData.value[0]?.y2 || 0)
  const tempY = Math.round(y1 + Number(wbcXYPos.value.posY) / (Number(wbcXYPos.value.totalHeight) / (y2 - y1)))
  return ((tempY / 746) * 76).toFixed(2);
});

const realY = computed(() => {
  return (calculatedY.value / 76) * 746;
})

const drawCanvas = () => {
  const canvas = canvasRef.value;
  const img = imageRef.value;

  if (canvas && img) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image onto the canvas
    // 22 76
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Draw dashed lines
    ctx.setLineDash([5, 5]); // Dash pattern: 5px dash, 5px gap
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(realX.value, 0); // Vertical line
    ctx.lineTo(realX.value, canvas.height - 200); // Stop at 209px from bottom
    ctx.moveTo(0, realY.value); // Horizontal line
    ctx.lineTo(canvas.width, realY.value);
    ctx.stroke();

    // Draw red circle at the intersection
    ctx.setLineDash([]); // Reset dash
    ctx.beginPath();
    ctx.arc(realX.value, realY.value, 5, 0, 2 * Math.PI); // Circle radius: 5
    ctx.fillStyle = "red";
    ctx.fill();

    // Add HTML divs for X and Y values
    const canvasContainer: any = canvas.parentElement;

    // Remove any existing indicators
    const oldIndicators = canvasContainer.querySelectorAll(".indicator");
    oldIndicators.forEach((el) => el.remove());

    const zeroIndicator = document.createElement("div");
    zeroIndicator.className = "indicator y-indicator";
    zeroIndicator.style.position = "absolute";
    zeroIndicator.style.left = `-14px`;
    zeroIndicator.style.top = `-16px`;
    zeroIndicator.style.color = "white";
    zeroIndicator.style.fontSize = "14px";
    zeroIndicator.textContent = `(0, 0)`;
    canvasContainer.appendChild(zeroIndicator);

    const xyIndicator = document.createElement("div");
    xyIndicator.className = "indicator xy-indicator";
    xyIndicator.style.position = "absolute";
    xyIndicator.style.left = calculatedX.value < 12 ? `${realX.value + 8}px` : `${realX.value - 94}px`; // Slightly to the left of the canvas
    xyIndicator.style.top = `${realY.value - 16}px`;
    xyIndicator.style.color = "black";
    xyIndicator.style.fontSize = "14px";
    xyIndicator.textContent = `(${calculatedX.value}, ${calculatedY.value})`;
    canvasContainer.appendChild(xyIndicator);
  }
};


// Re-draw canvas when dependencies change
watch([calculatedX, calculatedY], drawCanvas);
const drawCellMarker = async (imgResize?: boolean) => {
  if (!imgResize) {
    cellMarkerIcon.value = !cellMarkerIcon.value
  }

  if (cellMarkerIcon.value) {
    let url = '';
    if (projectType.value === 'pb') {
      url = `${iaRootPath.value}/${selectItems.value?.slotId}/${
          selectItems.value.testType === '01' || selectItems.value?.testType === '04'
              ? '01_WBC_Classification'
              : '05_BF_Classification'
      }/${selectItems.value?.slotId}.json`;
    } else if (projectType.value === 'bm') {
      url = `${iaRootPath.value}/${selectItems.value?.slotId}/${projectTypeReturn(projectType.value)}/${selectItems.value?.slotId}.json`
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
  allCheck.value = event?.target?.checked ? title : '';
  if (event?.target?.checked) {
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
  selectItemImageArr.value = [];
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
        selectItemImageArr.value.push(item);

      }
    }
  }
}


const scrollToElement = (itemId: number) => {
  if ($imageGalleryRef.value) {
    $imageGalleryRef.value.scrollToElement(itemId);
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
  const red = imageRgb.value[0];
  const green = imageRgb.value[1];
  const blue = imageRgb.value[2];
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
      image.filter = `opacity(1) drop-shadow(0 0 0 rgb(${red}, ${green}, ${blue})) brightness(${brightness}%)`;
    });
  });
}

function changeImageSize(event: any) {
  const newSize = Number(event?.target?.value);

  for (const item of wbcInfo.value) {
    for (const image of item.images) {
      image.width = newSize;
      image.height = newSize;
    }
  }

  requestAnimationFrame(() => drawCellMarker(true));
}

const updateImageSize = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newPercentValue = parseFloat(target.value);
  if (!isNaN(newPercentValue)) {
    imageSize.value = percentConvertToPixel(newPercentValue + 1);
  }
  requestAnimationFrame(() => drawCellMarker(true));
}
const displayValue = computed(() => {
  return imgPixelConvertToPercent(imageSize.value).replace('%', '');
});

function onDragOverCircle() {
  // 드래그 동작을 위한 빈 함수, 이벤트 리스너가 있어야 드롭이 작동함 지우지 마세요.
}

async function addToRollbackHistory() {
  rollbackHistory.push(JSON.parse(JSON.stringify(wbcInfo.value)));
}

// 상단 타이틀 이동 시 실행되는 함수
async function onDropCircle(item: any) {
  const draggedItem = wbcInfo.value[draggedCircleIndex.value];
  // 선택한 이미지(들)가 같은 Class로 욺직이려고 할 때
  if (item.id === draggedItem.id) return;

  await addToRollbackHistory();
  if (selectedClickImages.value.length === 0) {
    // 이미지를 한 개만 드래그한 경우
    const draggedImage = draggedItem.images[draggedCircleImgIndex.value];
    item.images.push(draggedImage);
    // 드롭된 위치에 이미지 추가
    const updatedWbcInfo = JSON.parse(JSON.stringify(wbcInfo.value));

    const matchingItemIndex = updatedWbcInfo.findIndex((infoItem: any) => infoItem.id === item.id);
    if (matchingItemIndex !== -1) {
      updatedWbcInfo[matchingItemIndex].images.push(draggedImage);
    } else {
      console.error('일치하는 id를 가진 요소 없음');
    }
    // 이미지를 한 개만 드래그한 경우에만 이동 API 호출
    await moveImage(matchingItemIndex, [{fileName: draggedImage.fileName}], wbcInfo.value[draggedCircleIndex.value], updatedWbcInfo[matchingItemIndex], false);
  } else {
    const matchingItemIndex = wbcInfo.value.findIndex((infoItem: any) => infoItem.id === item.id);
    // 여러 이미지를 드래그한 경우에도 이동 API 호출
    await moveImage(matchingItemIndex, selectedClickImages.value, draggedItem, wbcInfo.value[matchingItemIndex], false, '', wbcInfo.value);

  }
}

function handleBodyClick(event: Event) {
  const target = event.target as HTMLElement;
  // 클릭한 요소 또는 그 부모 중에 .wbcImgWrap 클래스를 가지고 있지 않으면
  if (!target.closest('.wbcImgWrapLi') && !target.closest('.context-menu') && target.className !== 'openseadragon-canvas') {
    // 모든 selected-image 클래스를 리셋
    selectedClickImages.value = [];
    shiftClickImages.value = [];
    selectItemImageArr.value = [];
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

  if (event.key === 'Escape' && modalOpen) {
    modalOpen.value = false;
  }

  // 이미지 이동 단축키 확인
  if (projectType.value === 'pb') {
    if (event.key && (selectItems.value?.testType === '01' || selectItems.value?.testType === '04' ? wbcHotKeysItems.value : bfHotKeysItems.value).some((item: any) => item.key.toUpperCase() === event.key.toUpperCase())) {
      await moveSelectedImagesToTargetItem((selectItems.value?.testType === '01' || selectItems.value?.testType === '04' ? wbcHotKeysItems.value : bfHotKeysItems.value).find((item: any) => item.key.toUpperCase() === event.key.toUpperCase()));
    }
  } else if (projectType.value === 'bm') {
    if (event.key && wbcHotKeysItems.value.some((item: any) => item.key.toUpperCase() === event.key.toUpperCase())) {
      await moveSelectedImagesToTargetItem(wbcHotKeysItems.value.find((item: any) => item.key.toUpperCase() === event.key.toUpperCase()));
    }
  }


}

async function moveSelectedImagesToTargetItem(targetItem: any) {
  const targetIndex = wbcInfo.value.findIndex((item: any) => (item.title || item.abbreviation) === (targetItem.title || targetItem.abbreviation));
  const selectedImages = selectedClickImages.value;
  await addToRollbackHistory();

  const selectedImagesToMove = [];
  for (const selectedImage of selectedImages) {
    const sourceItemIndex = wbcInfo.value.findIndex((item: any) => (item.title || item.abbreviation) === (selectedImage.title || selectedImage.abbreviation));
    const sourceItem = wbcInfo.value[sourceItemIndex];
    const imageIndex = sourceItem.images.findIndex((image: any) => image.fileName === selectedImage.fileName);
    if (imageIndex !== -1) {
      selectedImagesToMove.push({
        fileName: selectedImage.fileName,
        id: selectedImage.id,
        title: selectedImage.title
      });
    }
  }

  if (selectedImagesToMove.length > 0) {
    await moveImage(targetIndex, selectedImagesToMove, selectedImages, targetItem, true, 'keyMove');
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
    wbcInfo.value = selectItems.value.wbcInfoAfter.length !== 0 ? selectItems.value.wbcInfoAfter : selectItems.value.wbcInfo.wbcInfo[0];
    selectItemsVal = selectItems.value;
  } else {
    wbcInfo.value = upDownData.wbcInfoAfter.length !== 0 ? upDownData.wbcInfoAfter : upDownData.wbcInfo.wbcInfo[0];
    selectItemsVal = upDownData;
  }
  if (selectItemsVal.wbcInfoAfter && selectItemsVal.wbcInfoAfter.length !== 0) {
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
  } else {
    wbcInfo.value = selectItemsVal.wbcInfo.wbcInfo[0];
    selectItemsVal.wbcInfo.wbcInfo[0].forEach((item: any) => {
      if (item.images && item.images.length > 0) {
        item.images.forEach((itemImg: any) => {
          itemImg.title = item.title;
        })
      }
    });
  }
  if (newData !== '') {
    selectItemsVal.wbcInfo.wbcInfo[0] = selectItemsVal.wbcInfo.wbcInfo[0].filter((item: any) => {
      return !newData.find((dataItem: any) => dataItem.customNum === item.id && dataItem.abbreviation === "");
    });
  }

  // customClass wbcInfo After 상태에서 추가하는 코드
  const wbcInfoIdArr = wbcInfo.value.map((item: any) => item.id)
  const customClassArr = selectItemsVal.wbcInfo.wbcInfo[0].filter((item: any) => !wbcInfoIdArr.includes(item.id))
  wbcInfo.value = [...wbcInfo.value, ...customClassArr];

  const oArr = orderClass.value.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
  const sortArr = orderClass.value.length !== 0 ? oArr : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  await sortWbcInfo(wbcInfo.value, sortArr);

  // UIMD web 팀에서만 사용하는 코드
  await handleMoveImages();
}

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        orderClass.value = [];
      } else {
        orderClass.value = result.data.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
      }
    }
  } catch (e) {
    console.error(e)
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
  if (blockClicks.value) {
    return;
  }
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
      selectItemImageArr.value = [];
      // 범위 내의 이미지 선택
      for (let i = start; i <= end; i++) {
        selectedClickImages.value.push({
          id: wbcInfo.value[itemIndex].id,
          title: wbcInfo.value[itemIndex].title,
          ...wbcInfo.value[itemIndex].images[i],
        });
        selectItemImageArr.value.push(classInfoitem);
      }

      if (selectItemImageArr.value.length === end - start + 1) {
        selectedTitle.value = wbcInfo.value[0].title;
      }
    }
  } else { // 쉬프트 키를 누르지 않은 경우
    // 처음 클릭한 이미지의 인덱스를 저장
    firstClickedImageIndex.value = imageIndex;

    const selectedImage = wbcInfo.value[itemIndex].images[imageIndex];
    if (!isCtrlKeyPressed.value) {
      selectedClickImages.value = [];
      selectItemImageArr.value = [];
      selectedClickImages.value.push({...selectedImage, id: wbcInfo.value[itemIndex].id});
      selectItemImageArr.value.push(classInfoitem);
      return;
    }

    // 선택된 이미지가 배열에 있는지 확인
    const imageIndexInSelected = selectedClickImages.value.findIndex((img: any) => img.fileName === selectedImage.fileName);

    if (imageIndexInSelected === -1) {
      selectedClickImages.value.push({...selectedImage, id: wbcInfo.value[itemIndex].id});
      selectItemImageArr.value.push(classInfoitem);
    } else {
      // 이미 선택된 이미지를 다시 클릭하면 선택 해제
      selectedClickImages.value.splice(imageIndexInSelected, 1);
      selectItemImageArr.value.splice(imageIndexInSelected, 1);
    }
  }
}


function isSelected(image: any) {
  const imageFileName = image.fileName;
  const returnVal = selectedClickImages.value.some((selectedImage: any) => selectedImage.fileName === imageFileName);
  return returnVal;
}

const wpsIsSelected = (selectedImg: any) => {
  selectedClickImages.value = [];
  selectedClickImages.value.push(selectedImg);
  const targetElement = imageRefs.value[selectedImg?.uniqueKey];
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth', // 부드러운 스크롤
      block: 'center', // 화면 중앙으로 정렬
    });
  }

  wbcReset.value = true;
  nextTick()
  wbcReset.value = false;
}

const isLowMagnWhether = async (image: any) => {
  const path = selectItems.value?.img_drive_root_path !== '' && selectItems.value?.img_drive_root_path
      ? selectItems.value?.img_drive_root_path
      : iaRootPath.value;
  const url_new = `${path}/${selectItems.value.slotId}/04_WPS/WPS.json`;
  const response_new = await readJsonFile({fullPath: url_new});
  const extracted = image.fileName.split('_').slice(2).join('_');

  // response_new.data가 배열인지 확인
  if (Array.isArray(response_new.data)) {
    return response_new.data.some((el: any) => el.FILE_NM === extracted);
  } else {
    console.error('response_new.data is not an array:', response_new.data);
    return false; // 또는 적절한 기본값 반환
  }
}


const getImageXYPosition = async (image: any) => {
  const extracted = image.fileName.split('_').slice(2).join('_');
  const foundData = wpsJsonData.value.find((item: any) => item?.FILE_NM && item.FILE_NM === extracted);
  if (foundData) {
    wbcXYPos.value.posX = foundData.POSX1;
    wbcXYPos.value.posY = foundData.POSY1;
  }
}

const getWPSData = async () => {
  const path = selectItems.value?.img_drive_root_path !== '' && selectItems.value?.img_drive_root_path
      ? selectItems.value?.img_drive_root_path
      : iaRootPath.value;
  const url_new = `${path}/${selectItems.value.slotId}/04_WPS/WPS.json`;
  try {
    const response_new = await readJsonFile({fullPath: url_new});
    if (response_new.data) {
      wpsJsonData.value = response_new.data;
    } else {
      wpsJsonData.value = [];
    }
    const {width, height} = await dziWidthHeight();
    wbcXYPos.value.totalWidth = width;
    wbcXYPos.value.totalHeight = height;
  } catch (err) {
    console.error(err);
    wpsJsonData.value = [];
  }
}

const dziWidthHeight = async (): Promise<any> => {
  const path = selectItems.value?.img_drive_root_path !== '' && selectItems.value?.img_drive_root_path
      ? selectItems.value?.img_drive_root_path
      : iaRootPath.value;
  const urlImage = `${path}/${selectItems.value.slotId}/04_WPS/WPS.dzi`;
  const imageResponse = await readDziFile({filePath: urlImage});
  return await extractWidthHeightFromDzi(imageResponse);
}

const extractWidthHeightFromDzi = (xmlString: any): any => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const sizeElement = xmlDoc.getElementsByTagName("Size")[0];
  const width = sizeElement.getAttribute("Width");
  const height = sizeElement.getAttribute("Height");
  return {width: Number(width), height: Number(height)};
}

async function onDrop(targetItemIndex: any) {
  await addToRollbackHistory();
  if (selectedClickImages.value.length === 0) {
    return await originalOnDrop(targetItemIndex);
  }

  await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: true});

  const selectedImagesToMove = [];
  const draggedItems = [];
  const targetItems = [];
  let type = false;
  let keyMove = '';

  for (const selectedImage of selectedClickImages.value) {
    const fileName = selectedImage.fileName;

    const draggedItemIndex = wbcInfo.value.findIndex((item: any) =>
        item.images.some((img: any) => img.fileName === fileName)
    );

    if (draggedItemIndex === -1) {
      console.error(`Dragged item with image ${fileName} not found`);
      continue;
    }

    const draggedItem = wbcInfo.value[draggedItemIndex];

    if (draggedItem.id === wbcInfo.value[targetItemIndex].id) {
      selectedTitle.value = '';
      continue;
    }

    selectedImagesToMove.push({fileName: selectedImage.fileName});
    draggedItems.push(draggedItem);
    targetItems.push(wbcInfo.value[targetItemIndex]);

    keyMove = keyMove || (selectedImage.keyMove || '');
  }

  if (selectedImagesToMove.length > 0) {
    await moveImage(targetItemIndex, selectedImagesToMove, draggedItems, targetItems[0], type, keyMove);
  }

  await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: false});

  selectedClickImages.value = [];
  selectItemImageArr.value = [];
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
  wbcInfoRefresh.value = false;
  const {slotId} = selectItems.value;
  const arrType = selectedImagesToMove;
  let sourceFolders = [];
  let destinationFolders = [];
  let fileNames = [];
  let idx = 0;
  // 선택된 이미지 배열에 대해 반복
  for (const selectedImage of arrType) {
    const fileName = selectedImage.fileName;
    fileNames.push(fileName);
    try {
      if (keyMove === 'keyMove') { // 단축키로 움직였을 경우
        const formattedTargetItemId = targetItem.id < 10 ? `0${targetItem.id}` : targetItem.id;

        const classInfoBagic = window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
        const matchingItem = classInfoBagic.find(item => item.abbreviation === (selectedImage.title || selectedImage.abbreviation));
        const sourceFolder = type ? `${iaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${matchingItem?.id}_${selectedImage.title}` :
            `${iaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${matchingItem?.id}_${draggedItem[idx].title}`;
        const destinationFolder = `${iaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${formattedTargetItemId}_${targetItem.abbreviation}`;
        destinationFolders.push(destinationFolder);
        sourceFolders.push(sourceFolder);
      } else if (!wbcInfosArr && keyMove !== 'keyMove') { // 마우스로 같은 class 공간으로 드롭시켜서 이동시
        const newArr = draggedItem[idx] ? draggedItem[idx] : draggedItem;
        const sourceFolder = type ? `${iaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${selectedImage.id}_${selectedImage.title}` :
            `${iaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${newArr.id}_${newArr.title}`;
        const destinationFolder = `${iaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${targetItem.id}_${targetItem.title}`;
        destinationFolders.push(destinationFolder);
        sourceFolders.push(sourceFolder);
      }
    } catch (error) {
      console.error('Error during image move:', error);
    }
    idx++;
  }

  // 최종적으로 백엔드로 데이터 전송
  const data = {
    sourceFolders,
    destinationFolders,
    fileNames
  };

  try {

    const res = await moveClassImagePost(data);
    await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: true});
    if (res) {
      let idx = 0;
      for (const selectedImage of arrType) {
        const fileName = selectedImage.fileName;

        if (keyMove === 'keyMove') {
          // 이미지를 타겟 아이템으로 이동
          const sourceItemIndex = wbcInfo.value.findIndex((item: any) => item.title === (selectedImage.title || selectedImage.abbreviation));
          const sourceItem = wbcInfo.value[sourceItemIndex];
          const imageIndex = sourceItem.images.findIndex((image: any) => image.fileName === fileName);
          if (imageIndex !== -1) {
            const image = sourceItem.images.splice(imageIndex, 1)[0];
            image.title = wbcInfo.value[targetItemIndex].title;
            image.width = imageSize.value;
            image.height = imageSize.value;
            image.imgBrightness = imgBrightness.value;
            wbcInfo.value[targetItemIndex].images.push(image);
            // 카운트 업데이트
            sourceItem.count--;
            wbcInfo.value[targetItemIndex].count++;
          }
        } else {
          let newArr: any = [];
          if (!draggedItem[idx]) {
            newArr = draggedItem;
          } else {
            newArr = draggedItem[idx];
          }
          // 드래그된 이미지를 원래 위치에서 제거
          const draggedImageIndex = newArr.images.findIndex((img: any) => img.fileName === fileName);
          if (draggedImageIndex !== -1) {
            newArr.images.splice(draggedImageIndex, 1);
          }
          const newArrIdx = wbcInfo.value.findIndex((item: any) => item.title === newArr.title);
          wbcInfo.value[newArrIdx] = newArr;
          const imgAttr = {
            width: imageSize.value,
            height: imageSize.value,
            filter: `opacity(0.9) drop-shadow(0 0 0 rgb(${imageRgb.value[0]}, ${imageRgb.value[1]}, ${imageRgb.value[2]})) brightness(${imgBrightness.value}%)`,
          };
          // 드롭된 위치에 이미지를 삽입
          wbcInfo.value[targetItemIndex].images.push({...selectedImage, ...imgAttr});

          wbcInfo.value = removeDuplicateImages(wbcInfo.value);
          wbcInfo.value.forEach((item: any) => {
            item.count = item.images.length;
            if (item.images.length > 0) {
              item.images.forEach((itemImg: any) => {
                itemImg.title = item.title;
              });
            }
          });
        }
        idx++;
      }

      // 선택된 이미지 초기화
      selectedClickImages.value = [];
      selectItemImageArr.value = [];
      shiftClickImages.value = [];
      await updateOriginalDb();
    } else {
      console.error('이미지 옮기기 실패.');
    }
  } catch (error) {
    console.error('이미지 옮기는 작업 서버 실패:', error);
  } finally {
    await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: false});
  }

  if (wbcInfosArr) { // 동그라미 네비게이션 바로 옮길경우, 또는 우클릭 해서 클래스 이동시 사용
    try {
      await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: true});
      for (const seItem of selectItemImageArr.value) {
        const classInfoBagic = window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
        const matchingItem = classInfoBagic.find(item => item.abbreviation === (seItem.title || seItem.abbreviation));
        const sourceFolder = `${iaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${matchingItem?.id}_${seItem.title}`;
        const destinationFolder = `${iaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${targetItem.id}_${targetItem.title}`;
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
        for (const seItem of removeDuplicatesByProperty(selectItemImageArr.value, 'title')) {
          const findImage = selectedImagesToMove.filter(item => item.title === (seItem.title || seItem.abbreviation));
          targetItem.images.push(...findImage);
          targetItem.count = targetItem.images.length;
          const draggedItemIdx = wbcInfo.value.findIndex((item: any) => item.title === (seItem.title || seItem.abbreviation));
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
          images.filter = `opacity(0.9) drop-shadow(0 0 0 rgb(${imageRgb.value[0]}, ${imageRgb.value[1]}, ${imageRgb.value[2]})) brightness(${imgBrightness.value}%)`;

        }
      } else {
        console.error('이미지 움직임 실패.');
      }
    } catch (error) {
      console.error('서버 이미지 옮기기 실패:', error);
    } finally {
      await store.dispatch('commonModule/setCommonInfo', {moveImgIsBool: false});
    }
  }

  // 선택된 이미지 초기화
  selectedClickImages.value = [];
  selectItemImageArr.value = [];
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
    includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'GP', 'PA', 'OT'],
    includesStr2: ["NR", "AR", "MC", "MA", "SM", 'GP', 'PA', 'OT'],
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
    // wbcInfoAfter 업데이트
    selectItems.value.wbcInfoAfter = clonedWbcInfo;

    wbcInfo.value = clonedWbcInfo;

    // originalDb 업데이트
    const res: any = slideData.value;
    if (res) res.wbcInfoAfter = clonedWbcInfo;
    const {isNormal, classInfo} = checkPbNormalCell(clonedWbcInfo, normalItems.value)
    if (projectType.value === 'bm') {
      // 현재 BM은 Normal Range가 없습니다.
      res.isNormal = 'Y';
    } else {
      res.isNormal = isNormal;
    }
    res.abnormalClassInfo = classInfo;
    // 실제 락 거는 부분 여기로 변경 함 그래프 ql 로 변경하면서 버그 방지를 위해서 변경
    res.pcIp = ipAddress.value;
    res.lock_status = true;
    res.submitState = res.submitState === '' || !res?.submitState ? 'checkFirst' : res.submitState;
    originalDbVal = [res];
  }

  //updateRunningApi 호출
  await updateRunningApiPost(clonedWbcInfo, originalDbVal);
}


async function updateRunningApiPost(wbcInfo: any, originalDb: any) {
  try {
    if (originalDb.length === 0) {
      return;
    }
    const res = await gqlGenericUpdate(useUpdateRunningInfoMutation, {
      id: originalDb[0].id,
      isNormal: originalDb[0].isNormal,
      abnormalClassInfo: originalDb[0].abnormalClassInfo,
      pcIp: originalDb[0].pcIp,
      lock_status: originalDb[0].lock_status,
      wbcInfoAfter: originalDb[0].wbcInfoAfter,
      submitState: originalDb[0].submitState,
    });

    if (res && res?.data?.updateRunningInfoGQL[0].length !== 0) {
      // getWbcCustomClasses(false, null);
      if (cellMarkerIcon.value) {
        // 다시 불러올경우 셀마킹이 켜있는경우 다시 셀마크 그려주기
        await drawCellMarker(true);
      }
      wbcInfo.value = [];
      wbcInfo.value = res?.data?.updateRunningInfoGQL[0].wbcInfoAfter;

      const sortArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
      await sortWbcInfo(wbcInfo.value, sortArr);
      wbcReset.value = true;
      await nextTick();
      wbcReset.value = false;

    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const resRunningItem = async (updatedRuningInfo: any) => {
  try {
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const response: any = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: [updatedRuningInfo],
      dayQuery: dayQuery,
    })
    if (!response) {
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
  const slotId = selectItems.value?.slotId || "";
  let folderPath = `${iaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${id}_${title}`;
  let url = '';

  // 타임스탬프 추가

  if (highImg === 'getImageRealTime' || projectType.value === 'pb') {
    url = `${apiUrl()}/images/getImageRealTime?folder=${folderPath}&imageName=${imageName}`;
  } else {
    url = `${apiUrl()}/images?folder=${folderPath}&imageName=${imageName}`;
  }


  return url;
}


async function rollbackChanges() {
  if (rollbackHistory.length <= 0) return;

  // 롤백할 때마다 히스토리에서 마지막 상태를 꺼내어 복원
  const prevWbcInfo = rollbackHistory.pop();

  // 롤백 후 초기화
  draggedItemIndex.value = null;
  draggedImageIndex.value = null;
  draggedCircleIndex.value = null;
  draggedCircleIndexArr.value = [];
  draggedCircleImgIndex.value = null;
  selectedClickImages.value = [];
  selectItemImageArr.value = [];
  shiftClickImages.value = [];

  // 현재 상태에서 이전 상태로 이미지 롤백
  await rollbackImages(wbcInfo.value, prevWbcInfo);

  // wbcInfo 업데이트
  wbcInfo.value = prevWbcInfo;
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
    const sourceFolder = `${iaRootPath.value}/${selectItems.value?.slotId}/${projectTypeReturn(projectType.value)}/${sourceFolderInfo[index].id}_${sourceFolderInfo[index].title}`;
    const destinationFolder = `${iaRootPath.value}/${selectItems.value?.slotId}/${projectTypeReturn(projectType.value)}/${destinationFolderInfo[index].id}_${destinationFolderInfo[index].title}`;
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
  updateWbcInfo.value = wbcInfo.value;
  // Rollback 후 현재 Class List로 정렬
  const oArr = orderClass.value.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
  const sortArr = orderClass.value.length !== 0 ? oArr : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  await sortWbcInfo(wbcInfo.value, sortArr);

  // 원본 데이터베이스 업데이트
  await updateOriginalDb();
}

const handleMoveImages = async () => {
  try {
    const folderPath = `${iaRootPath.value}/${selectItems.value.slotId}/${projectTypeReturn(projectType.value)}`;
    const response = await fetch(`${apiBaseUrl}/folders/check-and-move-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({folderPath, wbcInfo: wbcInfo.value}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
};
const projectTypeReturn = (type: string): any => {
  if (type === 'bm') {
    return DIR_NAME.BM_CLASS;
  } else if (type === 'pb') {
    return DIR_NAME.WBC_CLASS;
  }
}

const hideAlert = () => {
  showAlert.value = false;
}

async function getNormalRange() {
  try {
    const result = await getNormalRangeApi();
    if (result) {
      if (result?.data) {
        const data = result.data;
        normalItems.value = data;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const updateCBCData = async (incomingSlideData: any) => {
  const path = incomingSlideData?.img_drive_root_path !== '' && incomingSlideData?.img_drive_root_path ? incomingSlideData?.img_drive_root_path : pbiaRootDir.value;
  const cbcData: any = await initCBCData({
    barcodeNo: incomingSlideData.barcodeNo,
    siteCd: siteCd.value,
    userId: userId.value,
    deviceSerialNm: deviceSerialNm.value,
    imageDriveRootPath: path,
    slotId: incomingSlideData.slotId
  })

  if (cbcData) {
    const cbcChangeData = {
      cbcPatientNm: cbcData?.cbcPatientNm,
      patientNm: cbcData?.cbcPatientNm
    }

    const updatedRunningInfo = {...incomingSlideData, ...cbcChangeData};

    patientNm.value = cbcData?.cbcPatientNm;
    cbcPatientNm.value = cbcData?.cbcPatientNm;
    await resRunningItem(updatedRunningInfo);
  }
}

const allClassesChecked = async () => {
  checkedAllClass.value = !checkedAllClass.value;
  const updatedRuningInfo = {...slideData.value, isAllClassesChecked: true};
  await gqlGenericUpdate(isAllClassCheckedUpdateMutation, {
    id: slideData.value.id,
    isAllClassesChecked: true,
  });

  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
}

const tooltipVisibleFunc = (type: keyof TooltipListDetailType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}

const uploadLisChangeSlide = (hospitalNm: any) => {
  if (hospitalNm === HOSPITAL_SITE_CD_BY_NAME['인천길병원']) {
    changeSlideByLisUpload.value = !changeSlideByLisUpload.value;
  }
}

</script>
