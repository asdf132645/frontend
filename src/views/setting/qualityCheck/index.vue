<template>
  <div class="loadingBackground" v-show="isLoadingProgressBar">
    <div class="progressContainer">
      <p class="loadingProgressBarText">{{ ((successFileCount / totalFileCount) * 100).toFixed(0) }}%</p>
      <div
          class="progressBar"
          :style="{ width: (successFileCount / totalFileCount) * 100 + '%' }"
      ></div>
    </div>
  </div>

  <div class="loadingBackground" v-if="isRestoring || isDownloading">
    <div class="loaderForLogin"></div>
    <p class="loadingTextLogin">Loading...</p>
  </div>


  <div class="setting-container setting-addOns-container">
    <div class="setting-activeBtn-container">
      <Button @click="handleSettingMenu('downloadUpload')" :isActive="activeTab === 'downloadUpload'">Download & Upload</Button>
      <Button @click="handleSettingMenu('etc')" :isActive="activeTab === 'etc'">Etc</Button>
    </div>

    <div v-if="activeTab === 'downloadUpload'" class="setting-addOns-wrapper">
      <div class="pos-relative">
        <font-awesome-icon :icon="['fas', 'circle-info']"
                           @mouseover="tooltipVisibleFunc('iaRootPath', true)"
                           @mouseout="tooltipVisibleFunc('iaRootPath', false)"
        />
        <Tooltip :isVisible="tooltipVisible.iaRootPath" className="mb08" position="top" type=""
                 :message="MSG.TOOLTIP.IA_ROOT_PATH"/>
        Source Path
      </div>
      <div class="mb4">
        <select v-model="cellInfo.iaRootPath" disabled>
          <option v-for="type in drive" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <h2 class="pos-relative">
        <font-awesome-icon
            :icon="['fas', 'circle-info']"
            @mouseover="tooltipVisibleFunc('downloadSavePath', true)"
            @mouseout="tooltipVisibleFunc('downloadSavePath', false)"
        />
        <Tooltip :isVisible="tooltipVisible.downloadSavePath" position="top"
                 :message="MSG.TOOLTIP.DOWNLOAD_SAVE_PATH"/>
        Download Path
      </h2>

      <div class="download-savePath-container">
        <select v-model='downloadRootPath'>
          <option v-for="type in backupDrive" :key="type" :value="type">{{ type }}</option>
        </select>
        <div class="pos-relative">
          <font-awesome-icon
              :icon="['fas', 'folder-open']"
              @click="openSourceDrive"
              class="openDriveIcon"
              @mouseover="tooltipVisibleFunc('openDownloadSavePath', true)"
              @mouseout="tooltipVisibleFunc('openDownloadSavePath', false)"
          />
          <Tooltip :isVisible="tooltipVisible.openDownloadSavePath" position="top"
                   :message="MSG.TOOLTIP.OPEN_DOWNLOAD_SAVE_PATH"/>
        </div>
      </div>

      <h2 class="pos-relative">
        <font-awesome-icon
            :icon="['fas', 'circle-info']"
            @mouseover="tooltipVisibleFunc('download', true)"
            @mouseout="tooltipVisibleFunc('download', false)"
        />
        <Tooltip :isVisible="tooltipVisible.download" position="top" :message="MSG.TOOLTIP.DOWNLOAD"/>
        Download
      </h2>

      <div class="backupDatePickers-container">
        <div class="backupDatePickers-wrapper">
          <div>
            <Datepicker v-model="cellInfo.backupStartDate" :week-starts-on="0" class="cursorDefault"></Datepicker>
          </div>
          <div>
            <Datepicker v-model="cellInfo.backupEndDate" :week-starts-on="0" class="cursorDefault"></Datepicker>
          </div>
        </div>
        <Button size="sm" @click="createBackup">Download</Button>
      </div>

      <h2 class="pos-relative">
        <font-awesome-icon
            :icon="['fas', 'circle-info']"
            @mouseover="tooltipVisibleFunc('upload', true)"
            @mouseout="tooltipVisibleFunc('upload', false)"
        />
        <Tooltip :isVisible="tooltipVisible.upload" position="top" :message="MSG.TOOLTIP.UPLOAD"/>
        Upload Path
      </h2>

      <div class="settingUploadContainer">
        <select v-model='uploadRootPath'>
          <option v-for="type in drive" :key="type" :value="type">{{ type }}</option>
        </select>
        <Button size="sm" @click="handleSelectUploadFile" style="width: 83px;">Upload</Button>
      </div>
    </div>

    <div v-if="activeTab === 'etc'">
      <ul>
        <li class="mt20">
          <p class="mb10">Quality Check</p>
          <Button @click="qualityCheckOpen" size="lg" class="w120-min">OK</Button>
        </li>
        <li class="mt20">
          <p class="mb10">Gripper Open</p>
          <Button @click="onGripperOpen" size="lg" class="w120-min" :class="{'blinkGripper': isBlinkingGripper}">OK
          </Button>
        </li>
        <li class="mt20">
          <p class="mb10">Camera Reset</p>
          <Button @click="onCameraReset" size="lg" class="w120-min" :class="{'blinkGripper': isBlinkCameraReset}">OK
          </Button>
        </li>
        <li class="mt20">
          <p class="mb10">Charge Remaining Count</p>
          <Button @click="onScan" size="lg" class="w120-min">Scan</Button>
        </li>
      </ul>
    </div>
  </div>

  <!-- Upload 확인 모달 -->
  <div v-if="showUploadModal" :class="impossibleUploadCount === 0 ? 'uploadModalSmall' : 'uploadModal'">
    <p v-if="impossibleUploadCount === 0" class="fs12" style="top: 0;">Would you like to upload?</p>
    <pre v-else-if="impossibleUploadCount > 0"
         class="fs12"
    >
      There are <span style="color: red;">duplicated</span> items
      Would you like to upload possible items?
    </pre>
    <div :class="impossibleUploadCount === 0 && 'uploadModalCountWrapperSmall'">
      <p>Movable Items Count: {{ possibleUploadCount }}</p>
      <p>Duplicated Count: {{ impossibleUploadCount }}</p>
    </div>
    <div v-if="impossibleUploadCount > 0" class="uploadDuplicatedSlotContainer">
      <p style="color: black;">Duplicated Barcode Numbers</p>
      <ul class="uploadDuplicatedSlotWrapper">
        <li class="userSelectText" v-for="barcodeNo in uploadSlotIdObj?.duplicated" :key="barcodeNo">
          {{ barcodeNo }}
        </li>
      </ul>
    </div>
    <div class="uploadModalBtnContainer">
      <button v-show="possibleUploadCount > 0" class="memoModalBtn" @click="uploadConfirm('copy')">{{
          MESSAGES.COPY
        }}
      </button>
      <button v-show="possibleUploadCount > 0" class="memoModalBtn" @click="uploadConfirm('move')">{{
          MESSAGES.MOVE
        }}
      </button>
      <button class="memoModalBtn" @click="uploadCancel">{{
          impossibleUploadCount === 0 ? MESSAGES.CANCEL : MESSAGES.CLOSE
        }}
      </button>
    </div>
  </div>

  <!-- Upload 선택 모달 -->
  <div v-show="showUploadSelectModal"
       :class="possibleUploadFileNames.length === 0 ? 'downloadDeleteSmallModal' : 'downloadDeleteModal'">
    <p class="fs12" style="top: 0;">Upload file list</p>
    <div v-show="possibleUploadFileNames.length > 0" class="downloadDeleteContainer">
      <p class="downloadDeleteSemiTitle">Select upload file</p>
      <ul class="downloadDeleteWrapper">
        <li class="userSelectText flex-justify-between" v-for="folderName in possibleUploadFileNames" :key="folderName">
          <p style="font-size: 0.8rem;">{{ folderName }}</p>
          <input style="margin: 0;" v-model="selectedUploadFile" type="radio" :value="folderName"/>
        </li>

      </ul>
    </div>
    <p class="mt40" v-show="possibleUploadFileNames.length === 0">No files</p>
    <div class="uploadModalBtnContainer">
      <template v-if="possibleUploadFileNames.length > 0">
        <button class="memoModalBtn" @click="handleUploadSelectFile">{{ MESSAGES.UPLOAD }}</button>
        <button class="memoModalBtn" @click="handleUploadSelectModalClose">{{ MESSAGES.CANCEL }}</button>
      </template>
      <button v-else class="memoModalBtn" @click="handleUploadSelectModalClose">{{ MESSAGES.CLOSE }}</button>
    </div>
  </div>

  <ConfirmThreeBtn
      v-if="showDownloadConfirm"
      :is-visible="showDownloadConfirm"
      :message="downloadConfirmMessage"
      :confirmFirstText="MESSAGES.MOVE"
      :confirmSecondText="MESSAGES.COPY"
      :closeText="MESSAGES.CLOSE"
      @hide="handleDownloadClose"
      @okConfirm="handleDownload('move')"
      @okConfirm2="handleDownload('copy')"
  />

  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />

  <ToastNotification
      v-if="toastInfo.message"
      :message="toastInfo.message"
      :messageType="toastInfo.messageType"
      :duration="1500"
  />
</template>

<script setup lang="ts">

import {getCellImgApi, getDrivesApi, qualityCheck, remainingCount} from "@/common/api/service/setting/settingApi";
import {computed, getCurrentInstance, nextTick, onBeforeMount, onMounted, ref, watch} from "vue";
import {tcpReq} from "@/common/defines/constants/tcpRequest/tcpReq";
import {onCameraResetWebSocket, onGripperOpenWebSocket} from "@/common/helpers";
import EventBus from "@/eventBus/eventBus";
import {useStore} from "vuex";
import Button from "@/components/commonUi/Button.vue";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import Alert from "@/components/commonUi/Alert.vue";
import {
  backUpDateApi, checkPossibleUploadFileApi,
  downloadPossibleApi,
  openDriveApi,
  uploadBackupApi,
  uploadPossibleApi
} from "@/common/api/service/backup/wbcApi";
import {scrollToTop} from "@/common/lib/utils/scroll";
import {CellImageAnalyzedType} from "@/common/type/tooltipType";
import moment from "moment/moment";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import Datepicker from "vue3-datepicker";
import {AddOnsSettingType, WbcActiveSettingType} from "@/common/type/settings";

const store = useStore();
const instance = getCurrentInstance();
const showAlert = ref(false);
const backupDrive = ref<any>([]);
const alertType = ref('');
const alertMessage = ref('');
const intervalId = ref<any>(null);
const isRestoring = ref(false);
const isDownloading = ref(false);
const isLoadingProgressBar = ref(false);
const showDownloadConfirm = ref(false);
const successFileCount = ref(0);
const totalFileCount = ref(1);
const showUploadModal = ref(false);
const uploadSlotIdObj = ref({duplicated: [], nonDuplicated: []});
const possibleUploadCount = computed(() => uploadSlotIdObj.value?.nonDuplicated && uploadSlotIdObj.value?.nonDuplicated.length);
const impossibleUploadCount = computed(() => uploadSlotIdObj.value?.duplicated && uploadSlotIdObj.value?.duplicated.length);
const showUploadSelectModal = ref(false);
const possibleUploadFileNames = ref([]);
const selectedUploadFile = ref('');
const downloadRootPath = ref('');
const uploadRootPath = ref('');
const projectType = ref('');
const machineVersion = ref('');
const apiUrl = ref('');
const downloadUploadType = ref('copy');
const deletableDownloadFiles = ref({});
const loadingState = ref('');
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const runInfo = computed(() => store.state.commonModule);
const isRunningState = ref(false);
const isBlinkingGripper = ref(false);
const showConfirm = ref(false);
const isBlinkCameraReset = ref(false);
let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
let cameraResetTimeOut: ReturnType<typeof setTimeout> | null = null;
const downloadConfirmMessage = ref('');
const saveHttpType = ref('');
const downloadDto = ref<any>({});
const activeTab = ref('downloadUpload');
const tooltipVisible = ref({
  iaRootPath: false,
  downloadSavePath: false,
  download: false,
  upload: false,
  openDownloadSavePath: false,
})
const toastInfo = ref({
  message: '',
  messageType: MESSAGES.TOAST_MSG_SUCCESS,
})
const cellInfo = ref({
  id: '',
  iaRootPath: window.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc',
  backupPath: '',
  // backupStartDate: moment(new Date()).local().toDate().toISOString().split('T')[0],
  // backupEndDate: moment(new Date()).local().toDate().toISOString().split('T')[0],
  backupStartDate: new Date(),
  backupEndDate: new Date(),
  autoBackUpMonth: 'Not selected',
})
const drive = ref<any>([]);

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
  machineVersion.value = window.MACHINE_VERSION;
  downloadRootPath.value = projectType.value === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup';
  uploadRootPath.value = projectType.value === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc';
  getApiUrl();
})

onMounted(async () => {
  const newUserId = JSON.parse(JSON.stringify(userModuleDataGet.value));
  userId.value = newUserId.userId;
  await cellImgGet();
  await driveGet();
});

watch([runInfo.value], async (newVals) => {
  await nextTick();
  const [newRunInfo] = newVals;

  const {isRunningState: newIsRunningState} = newRunInfo || {};
  isRunningState.value = newIsRunningState;

})

const onScan = async () => {
  await remainingCount();
}

const onGripperOpen = () => {
  if (blinkTimeout !== null) {
    clearTimeout(blinkTimeout);
  }

  isBlinkingGripper.value = true;
  tcpReq().embedStatus.gripperOpen.reqUserId = userId.value;
  EventBus.publish('childEmitSocketData', tcpReq().embedStatus.gripperOpen);

  blinkTimeout = setTimeout(() => {
    isBlinkingGripper.value = false;
    blinkTimeout = null;
  }, 500);

}

const onCameraReset = () => {
  if (cameraResetTimeOut !== null) {
    clearTimeout(cameraResetTimeOut);
  }

  isBlinkCameraReset.value = true;
  tcpReq().embedStatus.gripperOpen.reqUserId = userId.value;
  EventBus.publish('childEmitSocketData', tcpReq().embedStatus.cameraReset);

  cameraResetTimeOut = setTimeout(() => {
    isBlinkCameraReset.value = false;
    cameraResetTimeOut = null;
  }, 500);
}

instance?.appContext.config.globalProperties.$socket.on('downloadUploadFinished', async (downloadUploadObj: {
  type: 'download' | 'upload';
  isFinished: boolean
}) => {
  if (downloadUploadObj?.isFinished) {
    clearInterval(intervalId.value);
    successFileCount.value = totalFileCount.value;
    downloadUploadStopWebSocket(false);
    await updateFileCounts();
  }
})

const qualityCheckOpen = async () => {
  await qualityCheck();
}

const getApiUrl = () => {
  const tmp = window.LINUX_SERVER_SET ? window.EQUIPMENTPCIP.split(':') : window.APP_API_BASE_URL.split(':');
  apiUrl.value = `${tmp[0]}:${tmp[1]}`;
}

const uploadConfirm = async (uploadType: 'move' | 'copy') => {
  showUploadModal.value = false;
  totalFileCount.value = possibleUploadCount.value;
  try {
    isLoadingProgressBar.value = true;
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;

    const uploadDto = {
      fileName: selectedUploadFile.value,
      destinationUploadPath: uploadRootPath.value,
      originUploadPath: downloadRootPath.value,
      dayQuery,
      projectType: projectType.value,
      uploadType,
      apiUrl: apiUrl.value,
    }
    downloadUploadType.value = uploadType;

    loadingState.value = uploadType === 'move' ? 'moved' : 'copied';

    successFileCount.value = 0;
    downloadUploadStopWebSocket(true);
    handlePolling();
    const result = await uploadBackupApi(uploadDto);
    if (typeof result.data === 'string') {
      showErrorAlert(result.data);
    } else {
      showSuccessAlert('Upload completed successfully');
      scrollToTop();
    }
  } catch (e) {
    console.error(e);
  }
}

const uploadCancel = async () => {
  showUploadModal.value = false;
}

const downloadUploadStopWebSocket = (state: boolean) => {
  instance?.appContext.config.globalProperties.$socket.emit('isDownloadUploading', {
    type: 'SEND_DATA',
    payload: state
  });
}

const handlePolling = async () => {
  const duration = String(totalFileCount.value).length // 1초
  intervalId.value = setInterval(async () => {
    successFileCount.value += 1;
    if (successFileCount.value === totalFileCount.value - 1) {
      clearInterval(intervalId.value);
    }
  }, duration * 3000);
}

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const handleUploadSelectFile = async () => {
  try {
    isRestoring.value = true;
    const uploadDto = {
      fileName: selectedUploadFile.value,
      destinationUploadPath: uploadRootPath.value,
      originUploadPath: downloadRootPath.value,
      projectType: projectType.value,
      apiUrl: apiUrl.value,
    }
    downloadUploadStopWebSocket(true);

    const result: any = await uploadPossibleApi(uploadDto);

    if (typeof result.data === 'string') {
      showErrorAlert(result.data);
    } else {
      totalFileCount.value = result.data.totalMove;
      successFileCount.value = result.data.successMove;
      showUploadModal.value = true;
      uploadSlotIdObj.value = result.data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    downloadUploadStopWebSocket(false);
    isRestoring.value = false;
  }

  showUploadSelectModal.value = false;
}

const handleUploadSelectModalClose = () => {
  showUploadSelectModal.value = false;
  selectedUploadFile.value = '';
}

const tooltipVisibleFunc = (type: keyof CellImageAnalyzedType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}

const handleDownloadClose = () => {
  showDownloadConfirm.value = false;
}

const handleDownload = async (downloadType: 'move' | 'copy') => {
  const downloadDto = downloadDtoObj(downloadType);
  downloadUploadStopWebSocket(true);

  if (downloadType === 'move') {
    loadingState.value = 'moved';
  } else {
    loadingState.value = 'copied';
  }

  successFileCount.value = 0;
  try {
    handlePolling();
    await backUpDateApi(downloadDto);
  } catch (e) {
    console.error(e);
  }
}

const downloadDtoObj = (downloadType: 'move' | 'copy') => {
  downloadUploadType.value = downloadType;
  showDownloadConfirm.value = false;
  const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
  const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
  const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
  const sendingDownloadStartDate = moment(cellInfo.value.backupStartDate).add(1, 'day').local().toDate().toISOString().split('T')[0];
  const sendingDownloadEndDate = moment(cellInfo.value.backupEndDate).add(1, 'day').local().toDate().toISOString().split('T')[0];
  const downloadDto = {
    startDate: sendingDownloadStartDate, // 백업 시작일
    endDate: sendingDownloadEndDate, // 백업 종료일
    originDownloadPath: `${cellInfo.value.iaRootPath}`, //이미지가 있는 경로 옮겨져야 하는 폴더 위치
    destinationDownloadPath: downloadRootPath.value, // 백업 경로
    projectType: projectType.value,
    dayQuery,
    downloadType,
    apiUrl: apiUrl.value,
  }
  isLoadingProgressBar.value = true;

  return downloadDto;
}

const openSourceDrive = async () => {
  const downloadDto = {
    originDownloadPath: downloadRootPath.value
  };

  try {
    await openDriveApi(downloadDto);
  } catch (e) {
    deletableDownloadFiles.value = [];
    console.error(e);
  }
}

const driveGet = async () => {
  try {
    const result = await getDrivesApi();
    if (result) {
      if (!result?.data) {
      } else {
        const data = result.data;
        const saveData = JSON.parse(JSON.stringify(data));
        const backUpData = JSON.parse(JSON.stringify(data));

        const savePlace = window.PROJECT_TYPE === 'bm' ? 'BMIA_proc' : 'PBIA_proc';
        const backupPlace = window.PROJECT_TYPE === 'bm' ? 'UIMD_BM_backup' : 'UIMD_PB_backup';
        for (const dataKey in data) {
          saveData[dataKey] = saveData[dataKey] + `\\${savePlace}`;
          backUpData[dataKey] = backUpData[dataKey] + `\\${backupPlace}`;
        }
        drive.value = saveData;
        backupDrive.value = backUpData;
      }

    }

  } catch (e) {

    console.error(e);
  }
}

const cellImgGet = async () => {
  try {
    const result = await getCellImgApi();
    if (result) {
      if (!result?.data) {
        saveHttpType.value = 'post';
      } else {
        saveHttpType.value = 'put';

        const data = result.data;
        cellInfo.value.id = String(data.id);
        cellInfo.value.iaRootPath = data.iaRootPath;
        downloadRootPath.value = data.backupPath || (projectType.value === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup');
        cellInfo.value.backupStartDate = moment(data.backupStartDate).local().toDate();
        cellInfo.value.backupEndDate = moment(data.backupEndDate).local().toDate();
        cellInfo.value.autoBackUpMonth = data?.autoBackUpMonth;

        sessionStorage.setItem('isAlarm', String(data?.isAlarm));
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const updateFileCounts = async () => {
  successFileCount.value = totalFileCount.value;
  setTimeout(async () => {
    totalFileCount.value = 0;
    successFileCount.value = 0;
    isLoadingProgressBar.value = false;
  }, 2000)
  showSuccessAlert('Success');
}

const createBackup = async () => {
  if (downloadRootPath.value === '') {
    showErrorAlert('Please select a download save path');
    return
  }

  const sendingDownloadStartDate = moment(cellInfo.value.backupStartDate).add(1, 'day').local().toDate().toISOString().split('T')[0];
  const sendingDownloadEndDate = moment(cellInfo.value.backupEndDate).add(1, 'day').local().toDate().toISOString().split('T')[0];

  if (!moment(sendingDownloadStartDate).isSameOrBefore(sendingDownloadEndDate)) {
    showErrorAlert('Please check the date');
    return
  }

  downloadDto.value = {
    startDate: sendingDownloadStartDate, // 백업 시작일
    endDate: sendingDownloadEndDate, // 백업 종료일
    originDownloadPath: `${cellInfo.value.iaRootPath}`, //이미지가 있는 경로 옮겨져야 하는 폴더 위치
    destinationDownloadPath: downloadRootPath.value, // 백업 경로
    projectType: projectType.value,
  };
  try {
    downloadUploadStopWebSocket(true);
    const isPossibleToBackup = await downloadPossibleApi(downloadDto.value);
    if (isPossibleToBackup.data.success) {
      totalFileCount.value = Number(isPossibleToBackup.data.message.split(' ')[1]);
      showDownloadConfirm.value = true;
      downloadConfirmMessage.value = 'Would you like to copy files?';
    } else {
      showErrorAlert(isPossibleToBackup.data.message);
    }
  } catch (e) {
    console.error(e);
  } finally {
    downloadUploadStopWebSocket(false);
  }
}

const handleSelectUploadFile = async () => {
  const uploadDto = {
    originUploadPath: downloadRootPath.value
  };

  try {
    const result = await checkPossibleUploadFileApi(uploadDto);
    if (result.success) {
      possibleUploadFileNames.value = result.data;
    }
  } catch (error) {
    console.error(error);
    possibleUploadFileNames.value = [];
  } finally {
    showUploadSelectModal.value = true;
  }
}

const handleSettingMenu = (type: keyof AddOnsSettingType) => {
  if (activeTab.value === type) {
    return;
  }

  activeTab.value = type;
}
</script>
