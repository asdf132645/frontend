<template>
  <div class="loaderBackground" v-if="loadingDelay">
    <div class="loader"></div>
    <p class="loadingText">Loading...</p>
  </div>
  <table class='defaultTable mt20 dbDataTable' ref="scrollableDiv">
    <colgroup>
      <col width="7%"/>
      <col width="2%"/>
      <col width="7%"/>
      <col width="4%"/>
      <col width="6%"/>
      <col width="8%"/>
      <col width="8%"/>
      <col width="8%"/>
      <col width="12%"/>
      <col width="10%"/>
      <col width="6%"/>
      <col width="12%"/>
      <col width="4%"/>
    </colgroup>
    <thead>
    <tr style="position: sticky; top: 0;">
      <th>
        <input type="checkbox" v-model="selectAllCheckbox" @change="selectAllItems"/>
      </th>
      <th>NO</th>
      <th>Type</th>
      <th>State</th>
      <th>Tray Slot</th>
      <th>Barcode NO</th>
      <th>Patient ID</th>
      <th>Patient Name</th>
      <th>Analyzed Date</th>
      <th>Tact Time(sec)</th>
      <th>Submit</th>
      <th>Submit Date</th>
      <th>Edit</th>
    </tr>
    </thead>

    <tbody v-if="dbGetData.length !== 0">
    <template v-for="(item, idx) in dbGetData"
              :key="item.id">
      <tr
          :class="{
            selectedTr: selectedItemId === item.id,
            submittedTr: item.submitState === 'Submit',
            lisTr: item.submitState.includes('lis'),
            rock: item.lock_status && item.pcIp !== myIp,
            checkFirst: item.submitState === 'checkFirst',
          }"
          @click="selectItem(item)"
          @dblclick='rowDbClick(item)'
          ref="firstRow"
          style="height: 49px"
          v-bind:data-row-id="item.id"
          @contextmenu.prevent="rowRightClick(item, $event)"
      >
        <td @click="handleCheckboxChange(item)">
          <div
              @mouseenter="abnormalClassInfoOpen(true, item)"
              @mouseleave="abnormalClassInfoOpen(false, item)"
              class="listTable-abnormalIcon-wrapper"
          >
            <template v-if="visibleBySite(siteCd, [HOSPITAL_SITE_CD_BY_NAME['원자력병원'], HOSPITAL_SITE_CD_BY_NAME['TEST']], 'enable')">
              <font-awesome-icon class="icon-red-color isNotNormalIcon" :icon="['fas', 'triangle-exclamation']"
                                 v-if="item?.slideCondition?.condition === 'Bad'"
              />
              <font-awesome-icon class="icon-yellow-color isNotNormalIcon" :icon="['fas', 'triangle-exclamation']"
                                 v-else-if="item?.isNormal === 'N' && projectType === 'pb'"
              />
            </template>
            <template v-else>
              <font-awesome-icon class="icon-red-color isNotNormalIcon" :icon="['fas', 'triangle-exclamation']"
                                 v-if="item.isNormal === 'N' && projectType === 'pb'"/>
            </template>
            <div v-if="popupItemId === item.id && (item.isNormal === 'N' || slideCondition?.condition === 'Bad') && !isObjectEmpty(item.abnormalClassInfo)">
              <div class="slideStatus-container">
                <template v-if="visibleBySite(siteCd, [HOSPITAL_SITE_CD_BY_NAME['원자력병원'], HOSPITAL_SITE_CD_BY_NAME['TEST']], 'enable')">
                  <div v-if="slideCondition?.condition === 'Bad'" class="slideStatusPopup-wrapper">
                    <h1 class="slideStatusPopup-title icon-red-color">Condition</h1>
                    <span>{{ slideCondition?.desc }}</span>
                  </div>

                  <hr v-if="slideCondition?.condition === 'Bad'" class="slideStatusPopup-line" />
                </template>


                <div v-if="Array.isArray(item?.abnormalClassInfo) && projectType === 'pb'" class="slideStatusPopup-wrapper normalRange">
                  <h1 class="slideStatusPopup-title" :class="visibleBySite(siteCd, [HOSPITAL_SITE_CD_BY_NAME['원자력병원'], HOSPITAL_SITE_CD_BY_NAME['TEST']], 'enable') ? 'icon-yellow-color' : ''">Out of Normal Range</h1>
                  <div class="slideStatusPopup-content" v-for="(abItem, abnormalIdx) in item.abnormalClassInfo" :key="abnormalIdx">
                    <p v-if="abItem?.classNm" class="slideStatusPopup-normal-wrapper">
                      <span>{{ abItem?.classNm }}</span>
                      <span>{{ handleAbnormalValue(abItem?.val) }}</span>
                      <span>{{ handleAbnormalRange(abItem?.val, currentAbnormalRange[abnormalIdx]?.min, currentAbnormalRange[abnormalIdx]?.max, currentAbnormalRange[abnormalIdx]?.unit) }}</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <input type="checkbox" v-model="item.checked" :checked="item.checked"/>
        </td>
        <td>{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
        <td> {{ projectType !== 'bm' ? getTestTypeText(item?.testType) : getBmTestTypeText(item?.testType) }}</td>
        <td>
          <font-awesome-icon
              :icon="['fas', `${!item?.lock_status || item.pcIp === myIp ? 'lock-open' : 'lock' }`]"
          />
        </td>
        <td> {{ item?.traySlot }}</td>
        <td> {{ item?.barcodeNo }}</td>
        <td> {{ item?.patientId }}</td>
        <td> {{ item?.patientNm }}</td>
        <td> {{ item?.analyzedDttm === '' ? '' : formatDateString(item?.analyzedDttm) }}</td>
        <td> {{ item?.tactTime }}</td>
        <td> {{ submitStateChangeText(item?.submitState, item?.submitUserId) }}</td>
        <td> {{ item?.submitOfDate === '' || !item?.submitOfDate ? '' : formatDateString(item?.submitOfDate) }}</td>
        <td>
          <font-awesome-icon
              v-if="(item?.submitState === 'checkFirst' || item?.submitState === '' || !item?.submitState) && !item.lock_status || item.pcIp === myIp"
              :icon="['fas', 'pen-to-square']"
              @click="editData(item)"/>
        </td>
      </tr>
    </template>
    <tr>
      <div ref="loadMoreRef" style="height: 30px;"></div>
    </tr>
    </tbody>
    <tbody v-else>
    <tr class="text-center">
      <td colspan="13">
        <p class="nodataimg">
          <font-awesome-icon :icon="['fas', 'circle-exclamation']"/>
        </p>
        NO Data
      </td>
    </tr>
    </tbody>
  </table>
  <!-- 페이지네이션 버튼 -->
  <div class="paginationDiv" v-if="dbGetData.length !== 0 && totalPages > 0">
    <div class="pagination">
      <button @click="handlePrevPage" :disabled="currentPage <= 1"><font-awesome-icon :icon="['fas', 'caret-left']" /></button>
      <button
          v-for="pageNum in totalPages"
          :key="pageNum"
          :class="{ active: pageNum === currentPage }"
          @click="handlePageClick(pageNum)"
      >
        {{ pageNum }}
      </button>
      <button @click="handleNextPage" :disabled="currentPage >= totalPages">
        <font-awesome-icon :icon="['fas', 'caret-right']" />
      </button>
    </div>
  </div>

  <div v-if="contextMenu.visible" :style="{ top: (contextMenu.y - 100) + 'px', left: contextMenu.x + 'px' }"
       class="context-menu">
    <ul>
      <li @click="printStart">Print</li>
      <li @click="classificationRowDbClick">Classification</li>
      <li @click="editOrderData">Edit order data</li>
      <li @click="showDeleteConfirm">Delete</li>
    </ul>
  </div>

  <Modal v-if="visible" @update:closeLayer="closeLayer" @afterOpen="onModalOpen" width="400">
    <!-- 헤더 슬롯에 들어갈 내용 -->
    <template #header>
      <h2>Edit order data</h2>
    </template>

    <!-- 컨텐츠 슬롯에 들어갈 내용 -->
    <template #content>
      <div>
        <ul class="editOrder">
          <li class="flex-column mr12">
            <label for="testType">PB/BF</label>
            <input id="testType" class="inputDisabled" type="text" v-model="itemObj.testType" readonly disabled/>
          </li>
          <li class="flex-column mr12">
            <label for="traySlot">Tray Slot</label>
            <input id="traySlot" class="inputDisabled" type="text" v-model="itemObj.traySlot" readonly disabled/>
          </li>
          <li class="flex-column mr12">
            <label for="barcode">BARCODE ID</label>
            <input id="barcode" type="text" v-model="itemObj.barcodeNo" placeholder="BARCODE ID"/>
          </li>
          <li class="flex-column mr12">
            <label for="patientId">PATIENT ID</label>
            <input id="patientId" type="text" v-model="itemObj.patientId" placeholder="PATIENT ID"/>
          </li>
          <li class="flex-column mr12">
            <label for="patientName">PATIENT NAME</label>
            <input id="patientName" type="text" v-model="itemObj.patientNm" placeholder="PATIENT NAME"/>
          </li>
          <li class="flex-column mr12">
            <label for="analyzedDate">Analyzed date</label>
            <input id="analyzedDate" class="inputDisabled" type="text" v-model="itemObj.analyzedDttm" readonly
                   disabled/>
          </li>
          <li class="flex-column mr12">
            <label for="signedState">Signed state</label>
            <input id="signedState" class="inputDisabled" type="text" v-model="itemObj.submitState" readonly disabled/>
          </li>
          <li v-if="!barCodeImageShowError">
            <p>Barcode Image</p>
            <img class="mt10 w-full br-04" :src="barcodeImg" @error="onImageError"/>
          </li>
        </ul>
      </div>
      <div class="modalBottom">
        <button class="alertButton" @click="dbDataEditSet">Save</button>
      </div>
    </template>
  </Modal>

    <PrintNew v-if="printOnOff" :selectItems="rightClickItem" ref="printContent" :printOnOff="printOnOff"
              :selectItemWbc="selectItemWbc" @printClose="printClose"/>
<!--  <template v-else>-->
<!--    <Print v-if="printOnOff" :selectItems="rightClickItem" ref="printContent" :printOnOff="printOnOff"-->
<!--           :selectItemWbc="selectItemWbc" @printClose="printClose"/>-->
<!--  </template>-->

  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      type="delete"
      :message="confirmMessage"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />
</template>

<script setup>
import {getBarcodeDetailImageUrl, getBmTestTypeText, getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {
  ref,
  onMounted,
  watchEffect,
  defineProps,
  defineEmits,
  computed,
  onUnmounted,
  getCurrentInstance, watch, onBeforeMount
} from 'vue';
import router from "@/router";
import Modal from "@/components/commonUi/modal.vue";
import {deleteRunningApi, updatePcIpStateApi, updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {MESSAGES} from "@/common/defines/constants/constantMessageText";
import Print from "@/views/datebase/commponent/detail/report/print.vue";
import {getNormalRangeApi, getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import moment from "moment";
import {getDeviceIpApi} from "@/common/api/service/device/deviceApi";
import {DIR_NAME} from "@/common/defines/constants/settings";
import Confirm from "@/components/commonUi/Confirm.vue";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import {useGetRunningInfoByIdQuery} from "@/gql/useQueries";
import PrintNew from "@/views/datebase/commponent/detail/report/printNew.vue";
import {gqlGenericUpdate, slideConditionUpdateMutation} from "@/gql/mutation/slideData";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {visibleBySite} from "@/common/lib/utils/visibleBySite";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";

const props = defineProps(['dbData', 'selectedItemIdFalse', 'notStartLoading', 'loadingDelayParents', 'total', 'itemsPerPage', 'toggleRefreshPagination']);
const loadMoreRef = ref(null);
const emits = defineEmits();
const selectedItemId = ref('');
const visible = ref(false);
const itemObj = ref({});
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const projectType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const myIp = ref('');
const loadingDelay = ref(false);
const formatDateString = (dateString) => {
  const momentObj = moment(dateString, 'YYYYMMDDHHmmss');
  return momentObj.format('YYYY-MM-DD HH:mm:ss');
}
const showConfirm = ref(false);
const confirmMessage = ref('');
const slideCondition = ref({
  condition: '',
  desc: '',
})
const currentAbnormalRange = ref([]);


const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0
});
const rbcDegreeStandard = ref([]);
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const rightClickItem = ref({});
const printOnOff = ref(false);
const printContent = ref(null);
const selectItemWbc = ref([]);
const selectAllCheckbox = ref(false);
const instance = getCurrentInstance();
const barcodeImg = ref('');
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const dataBasePageReset = computed(() => store.state.commonModule);
const siteCd = computed(() => store.state.commonModule.siteCd);
const isCtrlKeyPressed = ref(false);
const isShiftKeyPressed = ref(false);
const firstShiftKeyStr = ref('');
const lastShiftKeyStr = ref('');
let socketTimeoutId = undefined; // 타이머 ID 저장
const scrollableDiv = ref(null);
const barCodeImageShowError = ref(false);
const selectedItemsUsedInDelete = ref([]);
const dbDataFindByIdUsedInDelete = ref([]);
const popupItemId = ref('');
const currentPage = ref(1);
const dbGetData = ref([]);


const normalItems = ref([]);

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

onMounted(async () => {
  myIp.value = JSON.parse(sessionStorage.getItem('pcIp'));
  try {

    userId.value = getStoredUser.id;
    await getRbcDegreeData();
  } catch (e) {
    console.error(e);
  }
  await getNormalRange();
  document.addEventListener('click', handleOutsideClick);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  const lastSearchParams = loadLastSearchParams();

  if (!isObjectEmpty(lastSearchParams)) {
    currentPage.value = lastSearchParams.page;
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

watchEffect(async () => {
  if (selectedSampleId.value) {
    const filteredItems = props.dbData.filter(item => item.id === Number(selectedSampleId.value || 0));
    await selectItem(filteredItems[0]);
  }
  dbGetData.value = props.dbData; // 부모로부터 전달받은 데이터를 자식에서 사용
  loadingDelay.value = false; // 데이터 로딩이 끝났으므로 로딩 상태 해제
});

watch(() => props.toggleRefreshPagination, () => {
  const lastSearchParams = loadLastSearchParams();

  if (!isObjectEmpty(lastSearchParams)) {
    currentPage.value = lastSearchParams.page;
  }
})

watch(
    () => props.loadingDelayParents,
    (newVal) => {
      loadingDelay.value = newVal;
    }
);


// watchEffect(async () => {
//   try {
//     if (props.dbData.length > 0) {
//       await nextTick();
//       loadingDelay.value = false;
//       const filteredItems = props.dbData.filter(item => item.id === Number(selectedSampleId.value || 0));
//
//       // IntersectionObserver 설정
//       const observer = new IntersectionObserver(handleIntersection, {
//         root: null,
//         rootMargin: '0px',
//         threshold: 0.5,
//       });
//       if (loadMoreRef.value) {
//         observer.observe(loadMoreRef.value);
//       }
//
//       if (selectedItemId.value === '0' || !selectedItemId.value) {
//         loadingDelay.value = false;
//       }
//
//       // 데이터베이스 페이지 리셋 상태 확인
//       if (dataBasePageReset.value.dataBasePageReset === true && filteredItems.length !== 0) {
//         // loadingDelay.value = true;
//         await selectItem(filteredItems[0]);
//         await store.dispatch('commonModule/setCommonInfo', {dataBasePageReset: false});
//         await removeCheckBox();
//         return;
//       }
//     }
//   } catch (error) {
//     console.error('Error during watchEffect execution:', error);
//     loadingDelay.value = false;  // 예외 발생 시에도 loadingDelay를 false로 설정
//   }
// });

async function selectItem(item) {
  if (isShiftKeyPressed.value) {
    if (firstShiftKeyStr.value) {
      lastShiftKeyStr.value = item.id;
      handleShiftSelection();
    }
  } else {
    lastShiftKeyStr.value = '';
  }
  if (isCtrlKeyPressed.value) {
    handleCheckboxChange(item);
  }
  // 부모로 전달
  if (!item) {
    return;
  }

  firstShiftKeyStr.value = item.id;

  emits('selectItem', item);
  selectedItemId.value = item.id;
  await store.dispatch('commonModule/setCommonInfo', {selectedSampleId: String(item.id)});
}

// 페이지 클릭 시 부모 컴포넌트로 페이지 번호 전달
const handlePageClick = (pageNum) => {
  currentPage.value = pageNum;
  emits('loadMoreData', pageNum); // 부모 컴포넌트에 페이지 번호 전달
};

// 이전 페이지 클릭
const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    emits('loadMoreData', currentPage.value);
  }
};

// 다음 페이지 클릭
const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
    emits('loadMoreData', currentPage.value);
  }
};


const abnormalClassInfoOpen = async (isOpen, item) => {
  if (!isOpen) {
    popupItemId.value = isOpen ? item.id : null;
    return;
  }

  if (!item.slideCondition?.desc) {
    const slideInfo = await getSlideCondition(item.slotId);
    const slideInfoObj = {
      condition: slideInfo?.slideCondition,
      desc: slideInfo?.slideDescription
    };

    const updatedRuningInfo = { ...item, slideCondition: slideInfoObj };
    await gqlGenericUpdate(slideConditionUpdateMutation, {
      id: item?.id,
      slideCondition: slideInfoObj
    });
    slideCondition.value.condition = slideInfoObj.condition;
    slideCondition.value.desc = slideInfoObj.desc;
    await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
  } else {
    slideCondition.value.condition = item.slideCondition?.condition;
    slideCondition.value.desc = item.slideCondition?.desc;
  }

  updateAbnormalRanges(item);

  popupItemId.value = isOpen ? item.id : null;
}

async function handleKeyDown(event) {
  // 컨트롤 키가 눌렸는지 확인
  if (event.ctrlKey) {
    isCtrlKeyPressed.value = true;
  }
  // 쉬프트 키가 눌렸는지 확인
  if (event.shiftKey) {
    isShiftKeyPressed.value = true;
  }
}


function handleKeyUp(event) {
  // Ctrl 키가 떼어졌는지 확인
  if (!event.ctrlKey) {
    isCtrlKeyPressed.value = false;
  }
  // 쉬프트 키가 눌렸는지 확인
  if (!event.shiftKey) {
    isShiftKeyPressed.value = false;
  }
}



const totalPages = computed(() => {
  return Math.ceil(props.total / props.itemsPerPage);
});


const printClose = () => {
  printOnOff.value = false;
}

const printStart = () => {
  printOnOff.value = true;
  resetContextMenu();
}
const editOrderData = () => {
  editData(rightClickItem.value);
  resetContextMenu();
};

const classificationRowDbClick = () => {
  rowDbClick(rightClickItem.value);
  resetContextMenu();
}
const selectAllItems = () => {
  props.dbData.forEach(item => {
    item.checked = selectAllCheckbox.value;
  });
  emits('checkListItem', props.dbData.filter(dbDataItem => dbDataItem.checked));
};

const removeCheckBox = () => {
  props.dbData.forEach(item => {
    item.checked = false;
  });
  emits('checkListItem', props.dbData.filter(dbDataItem => dbDataItem.checked));
};


const resetContextMenu = () => {
  contextMenu.value.x = 0;
  contextMenu.value.y = 0;
  contextMenu.value.visible = false;
}

const handleOutsideClick = (event) => {
  const contextMenuElement = document.querySelector('.context-menu');
  if (contextMenuElement && !contextMenuElement.contains(event.target)) {
    resetContextMenu();
  }
};


const rowRightClick = async (item, event) => {
  if (props.dbData.filter(data => data.id === item.id).lock_status === false) {
    showSuccessAlert(MESSAGES.IDS_ERROR_SELECT_A_TARGET_ITEM);
    return;
  }
  await store.dispatch('commonModule/setCommonInfo', {selectedSampleId: item.id});
  rightClickItem.value = item;
  if (Object.keys(item?.wbcInfo).length !== 0) {
    const wbcInfoData = item?.wbcInfo?.wbcInfo[0];
    const sortedArray = wbcInfoData.sort((a, b) => a.id - b.id);
    selectItemWbc.value = sortedArray;
  }
  if (event) {
    contextMenu.value.x = event.clientX;
    contextMenu.value.y = event.clientY;
    contextMenu.value.visible = true;
  }
};

const handleShiftSelection = () => {
  const startId = Math.min(Number(firstShiftKeyStr.value), Number(lastShiftKeyStr.value));
  const endId = Math.max(Number(firstShiftKeyStr.value), Number(lastShiftKeyStr.value));

  const items = props.dbData;

  items.forEach((item) => {
    const itemId = Number(item.id);
    if (itemId >= startId && itemId <= endId) {
      item.checked = !item.checked;
    }
  });

  emits('checkListItem', props.dbData.filter(dbDataItem => dbDataItem.checked));
};

const handleCheckboxChange = (item) => {
  if (!item) return;
  item.checked = !item.checked;
  emits('checkListItem', props.dbData.filter(dbDataItem => dbDataItem.checked));
};


const handleIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio !== 1) {
      emits('loadMoreData');
    }
  });
};

const showSuccessAlert = (message) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const showErrorAlert = (message) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
}

const hideAlert = () => {
  showAlert.value = false;
};




const getIpAddress = async (item) => {
  try {
    const result = await getDeviceIpApi();
    const ipAddress = result.data;
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const req = `oldPcIp=${ipAddress}&newEntityId=${item.id}&newPcIp=${ipAddress}&dayQuery=${dayQuery}`

    await updatePcIpStateApi(req).then(response => {
      delayedEmit('SEND_DATA', 'refreshDb', 100);
    }).catch(error => {
      console.error(error)
    });
  } catch (e) {
    console.error(e)
  }
}

const delayedEmit = (type, payload, delay) => {
  if (socketTimeoutId !== undefined) {
    clearTimeout(socketTimeoutId); // 이전 타이머 클리어
  }

  socketTimeoutId = window.setTimeout(() => {
    instance?.appContext.config.globalProperties.$socket.emit('state', {
      type: 'SEND_DATA',
      payload: 'refreshDb'
    });
  }, delay);
};
const rowDbClick = async (item) => {
  if (item.lock_status && item?.pcIp !== myIp.value) {
    return;
  }

  await getIpAddress(item);
  const {result, loading, error} = useGetRunningInfoByIdQuery(
      {id: Number(item.id)},
      {fetchPolicy: 'no-cache'}
  );

  // result를 watch하여 변경될 때마다 반응하도록 처리
  watch(result, async (newValue) => {
    if (newValue) {
      // 쿼리에서 새로운 데이터가 있으면 상태 업데이트
      await store.dispatch('slideDataModule/updateSlideData', newValue?.getRunningInfoByIdGQL);

      // 페이지 이동
      await router.push('/databaseDetail');
    } else {
      console.log('No result');
    }
  });

}


const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi();
    const data = result.data;
    rbcDegreeStandard.value = data
  } catch (e) {
    console.error(e);
  }
};


const closeLayer = (val) => {
  visible.value = val;
};

const onModalOpen = () => {
  //
};

const dbDataEditSet = async () => {
  try {
    const updatedRuningInfo = {
      id: itemObj.value.id,
      barcodeNo: itemObj.value.barcodeNo,
      patientId: itemObj.value.patientId,
      patientNm: itemObj.value.patientNm,
    };

    const localDbData = [...props.dbData];

    const indexToUpdate = localDbData.findIndex(item => item.id === itemObj.value.id);

    if (indexToUpdate !== -1) {
      localDbData[indexToUpdate] = {...localDbData[indexToUpdate], ...updatedRuningInfo};
    }
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const response = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: [localDbData[indexToUpdate]],
      dayQuery: dayQuery,
    })
    if (response) {
      showSuccessAlert('Success');
      emits('initData');
      closeLayer();
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


const editData = async (item) => {
  openLayer();
  itemObj.value = JSON.parse(JSON.stringify(item));
  itemObj.value.submitState = ['', 'Ready', 'checkFirst'].includes(itemObj.value.submitState) ? '' : itemObj.value.submitState;
  itemObj.value.testType = projectType.value !== 'bm' ? getTestTypeText(item?.testType) : getBmTestTypeText(item?.testType);
  const path = item?.img_drive_root_path !== '' && item?.img_drive_root_path ? item?.img_drive_root_path : pbiaRootDir.value;
  barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, item.slotId, DIR_NAME.BARCODE);

}

const openLayer = () => {
  visible.value = true;
};

const deleteRow = async (selectedItems) => {
  try {
    if (selectedItemId.value === '') {
      showErrorAlert(MESSAGES.IDS_ERROR_SELECT_A_TARGET_ITEM);
    } else {
      if (selectedItems.lock_status) {
        showErrorAlert(MESSAGES.lockRow);
        return;
      }
      const idsToDeleteArr = selectedItems.map((item) => item.id);
      const rootPaths = selectedItems.map((item) => {
        const path = item?.img_drive_root_path !== '' && item?.img_drive_root_path ? item?.img_drive_root_path : sessionStorage.getItem('iaRootPath');
        return `${path}/${item.slotId}`;
      })
      const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
      const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
      const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;

      const apiUrlTmp = window.APP_API_BASE_URL.split(':');
      const apiUrl = `${apiUrlTmp[0]}:${apiUrlTmp[1]}`;

      const req = {
        ids: idsToDeleteArr,
        img_drive_root_path: rootPaths,
        dayQuery: dayQuery,
        apiUrl: apiUrl
      }
      loadingDelay.value = true;

      const response = await deleteRunningApi(req);

      if (response.success) {
        showSuccessAlert('Items deleted successfully');
        emits('refresh'); // 데이터 다시 불러오기

      } else {
        console.error('Failed to delete items');
      }

      loadingDelay.value = false;
    }
  } catch (error) {
    console.error('Error:', error);
  }

  loadingDelay.value = false;
}

const submitStateChangeText = (text, submitUserId) => {
  switch (text) {
    case 'Ready':
      return 'Ready';
    case 'Submit':
      return `Submit (${submitUserId})`;
    case 'lisCbc':
      return `LIS (${submitUserId})`;
    default:
      return 'Ready';
  }
}

const onImageError = () => {
  barCodeImageShowError.value = true;
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const handleOkConfirm = async () => {
  showConfirm.value = false;
  await deleteRow(selectedItemsUsedInDelete.value);
}

const showDeleteConfirm = () => {
  showConfirm.value = true;
  confirmMessage.value = 'Would you want delete?';
  selectedItemsUsedInDelete.value = props.dbData.filter(item => item.checked);
  dbDataFindByIdUsedInDelete.value = props.dbData.find(item => item.id === selectedItemId.value);
  if (isObjectEmpty(selectedItemsUsedInDelete.value)) selectedItemsUsedInDelete.value = [dbDataFindByIdUsedInDelete.value];
  resetContextMenu();
  emits('disableSelectItem');
}

const getSlideCondition = async (slotId) => {
  const path = pbiaRootDir.value;
  const folderPath = projectType.value !== 'bm' ? DIR_NAME.WBC_CLASS : DIR_NAME.BM_CLASS;
  const url_new = `${path}/${slotId}/${folderPath}/Slide_Condition.json`;
  let slideCondition = '';
  let slideDescription = '';
  try {
    const response_new = await readJsonFile({fullPath: url_new});
    slideCondition = response_new?.data?.condition;
    slideDescription = response_new?.data?.description;
  } catch (err) {
    console.error(err);
  }

  return { slideCondition, slideDescription };
}

const getNormalRange = async () => {
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

const updateAbnormalRanges = (data) => {
  if (isObjectEmpty(data?.abnormalClassInfo) || (!Array.isArray(data?.abnormalClassInfo) && !data.abnormalClassInfo?.classNm)) {
    return;
  }

  currentAbnormalRange.value = data.abnormalClassInfo
      .map(abnormalItem => normalItems.value.find(normalRange => normalRange.abbreviation === abnormalItem.classNm))
      .filter(Boolean)
      .map(normalRange => ({
        title: normalRange.abbreviation,
        min: normalRange.min,
        max: normalRange.max,
        unit: normalRange.unit,
      }));
};

const handleAbnormalRange = (countVal, min, max, unit) => {
  const numericValue = parseFloat(countVal.match(/[\d.]+/)?.[0] || "0");
  const formattedMin = unit === "%" ? min.toFixed(2) : min;
  const formattedMax = unit === "%" ? max.toFixed(2) : max;

  if (numericValue < min) return `< ${formattedMin} ${unit}`;
  if (numericValue > max) return `> ${formattedMax} ${unit}`;
  return '';
}

const handleAbnormalValue = (value) => {
  return value.replace('[', '').replace(']', '');
}


const loadLastSearchParams = () => {
  const storedSearchParams = sessionStorage.getItem('lastSearchParams');
  return storedSearchParams ? JSON.parse(storedSearchParams) : {};
};
</script>

