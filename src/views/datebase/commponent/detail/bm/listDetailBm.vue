<template>
  <div class="wbcMenu">
    <ul>
      <template v-if="['bm', 'pb'].includes(projectType)">
        <li @click="pageGo(projectType === 'bm' ? '/databaseWhole' : '/databaseRbc')">
          {{ projectType === 'bm' ? 'WHOLE' : 'RBC' }}
        </li>
        <li class="onRight" @click="pageGo(projectType === 'bm' ? '/databaseBm' : '/databaseWbc')">
          {{ projectType === 'bm' ? 'BM CELL' : 'WBC' }}
        </li>
        <li @click="pageGo('/report')">REPORT</li>
      </template>
      <!--      <li>LIS-CBC</li>-->
    </ul>
    <!--    <div class="wbcMenuBottom">-->
    <!--      <button @click="moveWbc('up')">-->
    <!--        <font-awesome-icon :icon="['fas', 'circle-up']"/>-->
    <!--      </button>-->
    <!--      <button @click="moveWbc('down')">-->
    <!--        <font-awesome-icon :icon="['fas', 'circle-down']"/>-->
    <!--      </button>-->
    <!--    </div>-->
  </div>

  <div class="wbcContent">
    <div class="topClintInfo">
      <ul>
        <li>{{ getBmTestTypeText(selectItems?.testType) }}</li>
        <li>{{ selectItems?.barcodeNo }}</li>
        <li>{{ selectItems?.patientId || 'patientId No Data' }}</li>
        <li>{{ selectItems?.cbcPatientNo }}</li>
        <li>{{ selectItems?.patientName }}</li>
        <li> {{ selectItems?.cbcPatientNm }} {{ selectItems?.cbcSex }} {{ selectItems?.cbcAge }}</li>
        <li>{{ selectItems?.createDate }}</li>
      </ul>
    </div>
    <div class="databaseWbcRight">
      <ClassInfo :wbcInfo="wbcInfo" :selectItems="selectItems" :originalDb="originalDb" type='listTable'/>
    </div>

    <div class="databaseWbcLeft">
      <div class="imgMenuSetDiv">
        <button type="button" @click="drawCellMarker">
          <font-awesome-icon
              :icon="cellMarkerIcon ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
          />
          Cell Marking
        </button>
        <button @click="excelDownload">
          <font-awesome-icon :icon="['fas', 'file-csv']"/>
          Excel
        </button>
        <div class="imgSetWrap" ref="imgSetWrap">
          <button @click="imgSetOpen">
            <font-awesome-icon :icon="['fas', 'gear']"/>
            IMG Setting
          </button>
          <div class="imgSet" v-if="imgSet">
            <div>
              <font-awesome-icon :icon="['fas', 'plus-minus']"/>
              Size {{ imageSize }}
              <input
                  type="range"
                  min="150"
                  max="600"
                  v-model="imageSize"
                  @input="changeImageSize"
              />
              <button class="resetBtn mb2" @click="imgSizeReset">SIZE Reset</button>
            </div>
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
              RGB Select a Class
              <select v-model="selectSizeTitle" class="selectSizeTitle">
                <option v-for="(item) in wbcInfo" :key="item.id" :value="item.title">{{ item.title }}</option>
              </select>
              <button class="resetBtn" @click="rgbReset">RGB Reset</button>
            </div>

          </div>
        </div>
        <button @click="rollbackChanges" class="rollbackButton">
          <font-awesome-icon :icon="['fas', 'rotate-left']"/>
          Rollback
        </button>
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
              <p class="mt1">
                <!--                <input type="checkbox" @input="allCheckChange($event,item.title)">-->
                {{ item?.title }}
                ({{ item?.count }})</p>
            </div>
            <ul :class="'wbcImgWrap ' + item?.title" @dragover.prevent="onDragOver()" @drop="onDrop(itemIndex)">
              <li v-for="(image, imageIndex) in item.images" :key="image.fileName"
                  :class="{
                    'border-changed': isBorderChanged(image),
                    'selected-image': isSelected(image),
                    'wbcImgWrapLi': true
                  }"
                  @click="selectImage(itemIndex, imageIndex, item)"
                  @dblclick="openModal(image, item)"
              >
                <div style="position: relative; height: 150px">
                  <div class="titleImg" v-if="replaceFileNamePrefix(image.fileName) !== image.title">
                    <div>{{ replaceFileNamePrefix(image.fileName) }}
                      <font-awesome-icon
                          :icon="['fas', 'arrow-right']"/>
                      {{ image.title }}
                    </div>
                  </div>
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
      <!-- 모달 창 -->
      <div class="wbcModal" v-if="modalOpen">
        <div class="wbc-modal-content">
          <span class="wbcClose" @click="closeModal">&times;</span>
          <img :src="selectedImageSrc" :style="{ width: modalImageWidth, height: modalImageHeight }"
               class="modal-image"/>
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
import {computed, getCurrentInstance, onMounted, onUnmounted, ref, watch} from "vue";
import {moveImgPost} from "@/common/api/service/dataBase/wbc/wbcApi";
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
import {getBfHotKeysApi, getWbcCustomClassApi, getWbcWbcHotKeysApi} from "@/common/api/service/setting/settingApi";
import {deleteRunningApi, fileSysPost} from "@/common/api/service/fileSys/fileSysApi";
import {getBmTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {moveFunction, stateDeleteCommon, stateUpdateCommon} from "@/common/lib/commonfunction";
import {getUserIpApi} from "@/common/api/service/user/userApi";
import process from "process";
import ClassInfo from "@/views/datebase/commponent/detail/bm/commonRightInfo/classInfo.vue";

const selectItemWbc = sessionStorage.getItem("selectItemWbc");
const wbcInfo = ref<any>(null);
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const clickid = ref(sessionStorage.getItem('dbBaseTrClickId'));
const store = useStore();
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const commonDataGetSiteCd = computed(() => store.state.embeddedStatusModule.sysInfo.siteCd);
const pbiaRootPath = computed(() => store.state.commonModule.pbiaRootPath);
const draggedItemIndex = ref<any>(null);
const draggedImageIndex = ref<any>(null);
const isShiftKeyPressed = ref(false);
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

const modalOpen = ref(false);
const selectedImageSrc = ref('');
const modalImageWidth = ref('150px');
const modalImageHeight = ref('150px');
const imgSet = ref(false);
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';
const wbcCustomItems = ref<any>([]);
const wbcHotKeysItems = ref<any>([]);
const bfHotKeysItems = ref<any>([]);
const instance = getCurrentInstance();
const projectType = ref<any>('bm');
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";

const selectItemIamgeArr = ref<any>([]);
onMounted(async () => {
  projectType.value = process.env.PROJECT_TYPE;
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  document.body.addEventListener("click", handleBodyClick);
  await getWbcCustomClasses();
  const result = await getUserIpApi();
  await stateUpdateCommon(selectItems.value, result.data, [...originalDb.value], userModuleDataGet.value.id).then(response => {
    instance?.appContext.config.globalProperties.$socket.emit('state', {
      type: 'SEND_DATA',
      payload: 'refreshDb'
    });
  }).catch(error => {
    console.error('Error:', error.response.data);
  });
  document.addEventListener('click', handleClickOutside);

});
onUnmounted(async () => {
  await stateDeleteCommon(originalDb.value, selectItems.value, userModuleDataGet.value.id)
      .then(response => {
        instance?.appContext.config.globalProperties.$socket.emit('state', {
          type: 'SEND_DATA',
          payload: 'refreshDb'
        });
        initData('');
      }).catch(error => {
        console.error('Error:', error.response.data);
      });
  document.addEventListener('click', handleClickOutside);

})

const handleClickOutside = (event: any) => {
  // 클릭 이벤트의 대상이 imgSet이 아닌지 확인
  if (!event.target.closest('.imgSetWrap')) {
    imgSet.value = false; // imgSet.value를 false로 설정
  }
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


const getWbcCustomClasses = async () => {
  try {
    const result = await getWbcCustomClassApi(String(userModuleDataGet.value.id));

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
      const foundObject = selectItems.value.wbcInfo.wbcInfo[0].find((wbcItem: any) => wbcItem.id === wbcPush.id && wbcItem.name === wbcPush.name);
      if (!foundObject) {
        selectItems.value.wbcInfo.wbcInfo[0].push(wbcPush);
        wbcInfo.value = selectItems.value.wbcInfo.wbcInfo[0];
        sessionStorage.setItem("selectItems", JSON.stringify(selectItems.value));
        console.log('foundObject');
        await updateOriginalDb('notWbcAfterSave');
      } else {
        // console.log(foundObject);
      }
    }
    await getWbcHotKeyClasses();
    await getBfHotKeyClasses();
    await initData(newData);
  } catch (e) {
    console.log(e);
  }
};

const getBfHotKeyClasses = async () => {
  try {
    const result = await getBfHotKeysApi(String(userModuleDataGet.value.id));
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
    const result = await getWbcWbcHotKeysApi(String(userModuleDataGet.value.id));
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

  const replacements = {
    'NES': 'NS',
    'NEB': 'NB'
  };

  const modifiedPrefix = Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(key, replacements[key]);
  }, prefix);

  return image.title !== modifiedPrefix;
}

function replaceFileNamePrefix(fileName: string) {
  const replacements = {
    'NES': 'NS',
    'NEB': 'NB'
  };

  const prefix = fileName.split('_')[0];

  // 대체 규칙에 따라 prefix를 변경
  const modifiedPrefix = Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(key, replacements[key]);
  }, prefix);

  // 변경된 prefix 반환
  return modifiedPrefix;
}


const openModal = (image: any, item: any) => {
  modalOpen.value = true;
  selectedImageSrc.value = getImageUrl(image.fileName, item.id, item.title);
};

const closeModal = () => {
  modalOpen.value = false;
};

const imgSetOpen = () => {
  imgSet.value = !imgSet.value
}

const zoomIn = () => {
  modalImageWidth.value = `${parseFloat(modalImageWidth.value) + 50}px`;
  modalImageHeight.value = `${parseFloat(modalImageHeight.value) + 50}px`;
};

const zoomOut = () => {
  modalImageWidth.value = `${parseFloat(modalImageWidth.value) - 50}px`;
  modalImageHeight.value = `${parseFloat(modalImageHeight.value) - 50}px`;
};


watch(userModuleDataGet.value, (newUserId, oldUserId) => {
  userId.value = newUserId.id;
});

watch(wbcInfo.value, (newVal) => {
  console.log(newVal)
});

const pageGo = (path: string) => {
  router.push(path)
}


const excelDownload = () => {
  const groundTruth = selectItems.value.wbcInfoAfter; // 실제 정답 데이터
  const predicted = selectItems.value.wbcInfo.wbcInfo[0]; // AI가 예측한 데이터
  console.log('groundTruth:', JSON.stringify(groundTruth))
  console.log('predicted:', JSON.stringify(predicted))
  const confusionMatrix: Record<CellType, Record<CellType, number>> = confusionMatrixVal;
  const cellTypes: CellType[] = ["NES", "NEB", "ME", "MY", "PR", "LY", "LR", "LA", "MO", "EO", "BA", "BL", "PC", "NR", "GP", "PA", "AR"];

  // 오차 행렬 초기화
  cellTypes.forEach((trueType) => {
    confusionMatrix[trueType] = {};
    cellTypes.forEach((predictedType) => {
      confusionMatrix[trueType][predictedType] = 0;
    });
  });
  const metricsArrVal: MetricsVal = {
    NES: confusionMatrix.NES.NES,
    NEB: confusionMatrix.NEB.NEB,
    ME: confusionMatrix.ME.ME,
    MY: confusionMatrix.MY.MY,
    PR: confusionMatrix.PR.PR,
    LY: confusionMatrix.LY.LY,
    LR: confusionMatrix.LR.LR,
    LA: confusionMatrix.LA.LA,
    MO: confusionMatrix.MO.MO,
    EO: confusionMatrix.EO.EO,
    BA: confusionMatrix.BA.BA,
    BL: confusionMatrix.BL.BL,
    PC: confusionMatrix.PC.PC,
    NR: confusionMatrix.NR.NR,
    GP: confusionMatrix.GP.GP,
    PA: confusionMatrix.PA.PA,
    AR: confusionMatrix.AR.AR,
    Total: 0,
    Recall: 0,
    Precision: 0,
    F1Score: 0,
    TruePositives: 0,
    TrueNegatives: 0,
    FalsePositives: 0,
    FalseNegatives: 0,
    Accuracy: 0,
  };
  // 오차 행렬 업데이트
  groundTruth.forEach((cell: any, index: any) => {
    const trueType = cell.title as CellType;
    const trueImages = cell.images.map((image: any) => image.fileName);
    const predictedType = predicted[index].title as CellType;
    const predictedImages = predicted[index].images.map((image: any) => image.fileName);

    if (cellTypes.includes(trueType) && cellTypes.includes(predictedType)) {
      // 정답과 예측값이 같으면 대각선에 해당하므로 해당 셀에 값을 증가
      if (trueImages.some((image) => predictedImages.includes(image))) {
        confusionMatrix[trueType][predictedType]++;
      }
    } else {
      console.warn(`Invalid cell title: trueType - ${trueType}, predictedType - ${predictedType}`);
    }
  });


  const metrics: MetricsVal = metricsArrVal;
  console.log(metricsArrVal);
  // 오차 행렬의 Total 값 계산
  cellTypes.forEach((trueType) => {
    cellTypes.forEach((predictedType) => {
      metrics.Total += confusionMatrix[trueType][predictedType];
    });
  });

  let truePositives = 0;
  let trueNegatives = 0; // 수정: trueNegatives 변수 추가
  let falsePositives = 0;
  let falseNegatives = 0;
  let total = 0;

  cellTypes.forEach((trueType) => {
    cellTypes.forEach((predictedType) => {
      const count = confusionMatrix[trueType][predictedType];
      total += count;

      if (trueType === predictedType) {
        truePositives += count;
      } else {
        falsePositives += count;
        falseNegatives += confusionMatrix[predictedType][trueType];
      }
    });
    trueNegatives += total - truePositives; // 수정: trueNegatives 계산
  });

  // Recall, Precision, F1-Score 계산
  const recall = calculateRecall(truePositives, truePositives + falseNegatives);
  const precision = calculatePrecision(truePositives, falsePositives);
  const f1Score = calculateF1Score(recall, precision);

  // 소수점까지 나타내기
  const formattedRecall = Number(recall.toFixed(2));
  const formattedPrecision = Number(precision.toFixed(2));
  const formattedF1Score = Number(f1Score.toFixed(2));

  // Accuracy 계산
  const accuracy = (truePositives + trueNegatives) / total;
  const formattedAccuracy = Number(accuracy.toFixed(2));

  const excelData = formatDataForExcel(confusionMatrix, {
    ...metrics,
    Total: total,
    Recall: formattedRecall,
    Precision: formattedPrecision,
    F1Score: formattedF1Score,
    Accuracy: formattedAccuracy,
  });

  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ConfusionMatrix');
  XLSX.writeFile(wb, 'confusion_matrix.xlsx');

}

const formatDataForExcel = (confusionMatrix: Record<CellType, Record<CellType, number>>, metrics: MetricsVal): any[] => {
  const cellTypes: CellType[] = ["NES", "NEB", "ME", "MY", "PR", "LY", "LR", "LA", "MO", "EO", "BA", "BL", "PC", "NR", "GP", "PA", "AR"];

  const excelData: any[] = [];
  const headerRow: any[] = [''].concat(cellTypes).concat(['Total', 'Recall', 'Precision', 'F1-Score']);

  excelData.push(headerRow);

  cellTypes.forEach((trueType) => {
    const row: any[] = [trueType];
    cellTypes.forEach((predictedType) => {
      row.push(confusionMatrix[trueType][predictedType]);
    });
    row.push(metrics[`${trueType}`], metrics.Recall, metrics.Precision, metrics.F1Score);
    excelData.push(row);
  });

  const totalRow: any[] = ['Total'];
  cellTypes.forEach((type) => {
    totalRow.push(metrics[`${type}`]);
  });
  totalRow.push(metrics.Total, 'Accuracy', metrics.Accuracy);

  excelData.push(totalRow);

  return excelData;
};

const updateUpDown = async (selectWbc: any, selectItemsNewVal: any) => {
  wbcInfo.value = selectItemsNewVal.wbcInfoAfter && selectItemsNewVal.wbcInfoAfter.length !== 0
      ? selectItemsNewVal.wbcInfoAfter
      : selectItemsNewVal.wbcInfo.wbcInfo[0];
  await initData('');
};

const moveWbc = async (direction: any) => {
  await stateDeleteCommon(originalDb.value, selectItems.value, userModuleDataGet.value.id);
  await moveFunction(direction, originalDb, selectItems, clickid, updateUpDown);
  // const result = await getUserIpApi();
  // await stateUpdateCommon(selectItems.value, result.data, [...originalDb.value], userModuleDataGet.value.id).then(response => {
  //   instance?.appContext.config.globalProperties.$socket.emit('state', {
  //     type: 'SEND_DATA',
  //     payload: 'refreshDb'
  //   });
  // }).catch(error => {
  //   console.error('Error:', error.response.data);
  // });
}


const drawCellMarker = async () => {
  cellMarkerIcon.value = !cellMarkerIcon.value

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
  console.log(allCheck.value)
  allCheckInsert();
}

const allCheckInsert = () => {
  // 선택된 이미지 초기화
  selectedClickImages.value = [];
  selectItemIamgeArr.value = [];
  for (const idx in wbcInfo.value) {
    if (allCheck.value === wbcInfo.value[idx].title) {
      selectItemIamgeArr.value.push(wbcInfo.value[idx])
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

function imgSizeReset() {
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
  changeImageRgb();
}

function changeImageRgb() {
  const selectedSizeTitle = selectSizeTitle.value;
  if (!selectedSizeTitle) {
    // alert('No selected size title.');
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
  console.log(draggedCircleIndexArr.value)
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
  if (!target.closest('.wbcImgWrapLi')) {
    // 모든 selected-image 클래스를 리셋
    selectedClickImages.value = [];
    shiftClickImages.value = [];
    selectItemIamgeArr.value = [];
  }
}

function handleKeyDown(event: KeyboardEvent) {
  // 쉬프트 키가 눌렸는지 확인
  if (event.shiftKey) {
    isShiftKeyPressed.value = true;
  }

  // 컨트롤 키가 눌렸는지 확인
  if (event.ctrlKey) {
    isCtrlKeyPressed.value = true;
  }

  // 이미지 이동 단축키 확인
  if(projectType.value === 'pb'){
    if (event.key && (selectItems.value.testType === '01' ? wbcHotKeysItems.value : bfHotKeysItems.value).some((item: any) => item.key.toUpperCase() === event.key.toUpperCase())) {
      moveSelectedImagesToTargetItem((selectItems.value.testType === '01' ? wbcHotKeysItems.value : bfHotKeysItems.value).find((item: any) => item.key.toUpperCase() === event.key.toUpperCase()));
    }
  }else if (projectType.value === 'bm'){
    if (event.key && wbcHotKeysItems.value.some((item: any) => item.key.toUpperCase() === event.key.toUpperCase())) {
      moveSelectedImagesToTargetItem(wbcHotKeysItems.value.find((item: any) => item.key.toUpperCase() === event.key.toUpperCase()));
    }
  }
}

async function moveSelectedImagesToTargetItem(targetItem: any) {
  const targetIndex = wbcInfo.value.findIndex((item: any) => item.title === targetItem.title);
  const selectedImages = selectedClickImages.value;

  // 선택된 이미지를 타겟 아이템으로 이동
  for (const selectedImage of selectedImages) {
    const sourceItemIndex = wbcInfo.value.findIndex((item: any) => item.title === selectedImage.title);
    const sourceItem = wbcInfo.value[sourceItemIndex];
    const imageIndex = sourceItem.images.findIndex((image: any) => image.fileName === selectedImage.fileName);
    if (imageIndex !== -1) {
      // 이미지를 타겟 아이템으로 이동
      const image = sourceItem.images.splice(imageIndex, 1)[0];
      image.title = wbcInfo.value[targetIndex].title;
      wbcInfo.value[targetIndex].images.push(image);
      // 카운트 업데이트
      sourceItem.count--;
      wbcInfo.value[targetIndex].count++;

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

async function initData(newData: any) {
  wbcInfo.value = [];
  wbcInfo.value = selectItemWbc ? JSON.parse(selectItemWbc) : null;
  if (selectItems.value.wbcInfoAfter && selectItems.value.wbcInfoAfter.length !== 0) {
    wbcInfo.value = selectItems.value.wbcInfoAfter;
    selectItems.value.wbcInfo.wbcInfo[0].forEach((item: any) => {
      const title = item.title;
      const correspondingItem = selectItems.value.wbcInfoAfter.find((afterItem: any) => afterItem.title === title);
      if (correspondingItem) {
        correspondingItem.images.forEach((item: any) => {
          item.title = title;

        })
      }
    });
  } else {
    wbcInfo.value = selectItems.value.wbcInfo.wbcInfo[0];
    selectItems.value.wbcInfo.wbcInfo[0].forEach((item: any) => {
      if (item.images.length > 0) {
        item.images.forEach((itemImg: any) => {
          itemImg.title = item.title;
        })
      }

    });
  }
  if (newData !== '') {
    selectItems.value.wbcInfo.wbcInfo[0] = selectItems.value.wbcInfo.wbcInfo[0].filter((item: any) => {
      return !newData.find((dataItem: any) => dataItem.customNum === item.id && dataItem.abbreviation === "");
    });
  }
  const sortArr = process.env.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  await sortWbcInfo(wbcInfo.value, sortArr);
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
    // 현재 선택한 이미지
    shiftClickImages.value.push(imageIndex);
    // 시작과 끝 인덱스 결정
    const start = shiftClickImages.value[0];
    const end = shiftClickImages.value[shiftClickImages.value.length - 1];
    const startIndex = start > end ? end : start;
    const endIndex = start > end ? start : end;

    // 선택된 이미지 초기화
    selectedClickImages.value = [];
    selectItemIamgeArr.value = [];
    // 범위 내의 이미지 선택
    for (let i = startIndex; i <= endIndex; i++) {
      // 최대 10개까지만 선택 가능
      if (selectedClickImages.value.length < 10) {
        selectedClickImages.value.push({
          id: wbcInfo.value[itemIndex].id,
          title: wbcInfo.value[itemIndex].title,
          ...wbcInfo.value[itemIndex].images[i],
        });
        selectItemIamgeArr.value.push(classInfoitem);
      }
    }
  } else { // 쉬프트 키를 누르지 않은 경우
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
      // 이미지를 선택하고 10개 미만일 때만 추가
      if (selectedClickImages.value.length < 10) {
        selectedClickImages.value.push({...selectedImage, id: wbcInfo.value[itemIndex].id});
        selectItemIamgeArr.value.push(classInfoitem);
      }
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
    if (!wbcInfosArr) {
      const sourceFolder = type ? `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${selectedImage.id}_${selectedImage.title}` :
          `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${draggedItem.id}_${draggedItem.title}`;
      const destinationFolder = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${targetItem.id}_${targetItem.title}`;
      destinationFolders.push(destinationFolder);
      sourceFolders.push(sourceFolder);
    }
    if (keyMove === 'keyMove') { // 단축키로 움직였을 경우
      let res = await moveImgPost(`sourceFolders=${sourceFolders}&destinationFolders=${destinationFolders}&imageNames=${fileNames}`);
      if (res) {
        // 선택된 이미지 초기화
        selectedClickImages.value = [];
        selectItemIamgeArr.value = [];
        shiftClickImages.value = [];
        await updateOriginalDb();
      }
      return;
    }
    if (!wbcInfosArr) {
      let res = await moveImgPost(`sourceFolders=${sourceFolders}&destinationFolders=${destinationFolders}&imageNames=${fileNames}`);
      // 드래그된 이미지를 원래 위치에서 제거
      if (res) {
        const draggedImageIndex = draggedItem.images.findIndex((img: any) => img.fileName === fileName);
        draggedItem.images.splice(draggedImageIndex, 1);
        // 드롭된 위치에 이미지를 삽입
        wbcInfo.value[targetItemIndex].images.push(selectedImage);

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
  if (wbcInfosArr) {
    console.log(selectItemIamgeArr.value)
    for (const seItem of selectItemIamgeArr.value) {
      const sourceFolder = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${seItem.id}_${seItem.title}`;
      const destinationFolder = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${targetItem.id}_${targetItem.title}`;
      destinationFolders.push(destinationFolder);
      sourceFolders.push(sourceFolder);
    }
    // console.log('selectItemIamgeArr.value', JSON.stringify(selectItemIamgeArr.value))
    // console.log('selectedImagesToMove', JSON.stringify(selectedImagesToMove));
    // console.log('draggedItem', draggedItem); // 내가 클릭해서 잡은 영역
    // console.log('targetItemIndex', targetItemIndex); // 옮겨져야하는 인덱스
    // console.log('wbcInfo.value', wbcInfo.value);
    // return;
    // sourceFolders, destinationFolders, imageNames를 moveImgPost 함수에 전달
    let res = await moveImgPost(`sourceFolders=${sourceFolders}&destinationFolders=${destinationFolders}&imageNames=${fileNames}`);
    if (res) {
      // selectedImagesToMove 배열의 이미지를 targetItemIndex에서 wbcInfo.value의 객체에 추가
      const targetItem = wbcInfo.value[targetItemIndex];
      for (const seItem of removeDuplicatesByProperty(selectItemIamgeArr.value, 'title')) {
        const findImage = selectedImagesToMove.filter(item => item.title === seItem.title);
        targetItem.images.push(...findImage);
        targetItem.count = targetItem.images.length;
        // draggedItem.title을 가진 객체의 images 배열에서 draggedItem.images의 fileName과 일치하는 이미지 제거
        const draggedItemIdx = wbcInfo.value.findIndex(item => item.title === seItem.title);
        if (draggedItemIdx !== -1) {
          const draggedItemObj = wbcInfo.value[draggedItemIdx];
          const selectedImagesFileNames = selectedImagesToMove.map(image => image.fileName);
          const filteredImages = draggedItemObj.images.filter(image => !selectedImagesFileNames.includes(image.fileName));
          // 새로 생성한 배열을 draggedItemObj의 images 배열에 할당
          draggedItemObj.images = filteredImages;
          draggedItemObj.count = draggedItemObj.images.length;
        }
      }
      for (const images of selectedImagesToMove) {
        images.title = wbcInfo.value[targetItemIndex].title;
      }
    }
  }
  // 선택된 이미지 초기화
  selectedClickImages.value = [];
  selectItemIamgeArr.value = [];
  shiftClickImages.value = [];
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

async function updateOriginalDb(notWbcAfterSave?: string) {
  console.log('updateOriginalDb')
  let originalDbVal: any = [];
  // wbcInfo.value를 깊은 복제(clone)하여 새로운 배열을 생성
  let clonedWbcInfo = JSON.parse(JSON.stringify(wbcInfo.value));
  // 각 이미지 객체에서 width와 height 속성은 저장 안해도되는 부분이라서 디비에 저장 안함
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      delete image.width;
      delete image.height;
      delete image.filter;
    });
    item.percent = selectItems.value.wbcInfo.totalCount && selectItems.value.wbcInfo.totalCount !== '0' ? ((Number(item.count) / Number(selectItems.value.wbcInfo.totalCount)) * 100).toFixed(0) : '0'
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
    // console.log('???')
  }


  //updateRunningApi 호출
  await updateRunningApiPost(clonedWbcInfo, originalDbVal);
}

async function updateRunningApiPost(wbcInfo: any, originalDb: any) {
  try {
    const response = await updateRunningApi({userId: Number(userId.value), runingInfoDtoItems: originalDb})
    if (response) {
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function getImageUrl(imageName: any, id: string, title: string): string {
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!wbcInfo.value || wbcInfo.value.length === 0) {
    return "";
  }
  const slotId = selectItems.value.slotId || "";
  const folderPath = `${pbiaRootPath.value}/${slotId}/${projectTypeReturn(projectType.value)}/${id}_${title}`;
  return `${apiBaseUrl}/images?folder=${folderPath}&imageName=${imageName}`;

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
  // 이동된 이미지들을 이전 위치로 다시 이동시킴
  for (const index in sourceFolderInfo) {
    const sourceFolder = `${pbiaRootPath.value}/${selectItems.value.slotId}/${projectTypeReturn(projectType.value)}/${sourceFolderInfo[index].id}_${sourceFolderInfo[index].title}`;
    const destinationFolder = `${pbiaRootPath.value}/${selectItems.value.slotId}/${projectTypeReturn(projectType.value)}/${destinationFolderInfo[index].id}_${destinationFolderInfo[index].title}`;
    const response = await moveImgPost(`sourceFolder=${sourceFolder}&destinationFolder=${destinationFolder}&imageName=${sourceFolderInfo[index].fileName}`);

    if (response) {
      wbcInfo.value = prevWbcInfo;
    }
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
