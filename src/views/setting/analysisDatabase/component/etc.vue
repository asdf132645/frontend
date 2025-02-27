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

  <div class="flex-center">
    <div class="cellImgAnalyzed-container">
      <table class="settingTable">
        <tbody>
        <tr v-if="viewerCheck !== 'viewer'">
          <th class="pos-relative">
            Alarm Timer (sec)
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseover="tooltipVisibleFunc('alarm', true)"
                @mouseout="tooltipVisibleFunc('alarm', false)"
            />
            <Tooltip :isVisible="tooltipVisible.alarm" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.ALARM"/>
          </th>
          <td>
            <font-awesome-icon
                :icon="cellInfo.isAlarm ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                class="iconSize"
                @click="toggleAlarm"
            />
          </td>
          <td>
            <input type="text" v-model='cellInfo.alarmCount' class="alarmInput" @input="filterNumbersOnly($event)">
          </td>
        </tr>
        <tr>
          <th class="pos-relative">
            Keep Page
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseover="tooltipVisibleFunc('keepPage', true)"
                @mouseout="tooltipVisibleFunc('keepPage', false)"
            />
            <Tooltip :isVisible="tooltipVisible.keepPage" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.KEEP_PAGE"/>
          </th>
          <td>
            <font-awesome-icon
                :icon="cellInfo.keepPage ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                class="iconSize"
                @click="toggleKeepPage"
            />
          </td>
        </tr>
        <tr>
          <th class="pos-relative">
            LIS Upload Check
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseover="tooltipVisibleFunc('lisUploadCheckAll', true)"
                @mouseout="tooltipVisibleFunc('lisUploadCheckAll', false)"
            />
            <Tooltip :isVisible="tooltipVisible.lisUploadCheckAll" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.LIS_UPLOAD_CHECK"/>
          </th>
          <td>
            <font-awesome-icon
                :icon="cellInfo.lisUploadCheckAll ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                class="iconSize"
                @click="toggleLisUploadCheckAll"
            />
          </td>
        </tr>
        <tr>
          <th>Auto Start</th>
          <td>
            <font-awesome-icon
                :icon="autoStart ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                class="iconSize"
                @click="toggleAutoStart"
            />
          </td>
        </tr>
        </tbody>
      </table>

      <table class="settingTable auto">
        <colgroup>
          <col width="70">
          <col width="30">
        </colgroup>
        <tbody>
        <tr>
          <th class="pos-relative">
            Download Save Path
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseover="tooltipVisibleFunc('downloadSavePath', true)"
                @mouseout="tooltipVisibleFunc('downloadSavePath', false)"
            />
            <Tooltip :isVisible="tooltipVisible.downloadSavePath" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.DOWNLOAD_SAVE_PATH"/>
          </th>

          <td>
            <div class="downloadSavePathContainer">
              <select v-model='downloadRootPath' class="downloadPath">
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
                <Tooltip :isVisible="tooltipVisible.openDownloadSavePath" className="mb08" position="top" type=""
                         :message="MSG.TOOLTIP.OPEN_DOWNLOAD_SAVE_PATH"/>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <th class="pos-relative">
            Download
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseover="tooltipVisibleFunc('download', true)"
                @mouseout="tooltipVisibleFunc('download', false)"
            />
            <Tooltip :isVisible="tooltipVisible.download" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.DOWNLOAD"/>
          </th>
          <td>
            <div class="backupDatePickers">
              <Datepicker v-model="cellInfo.backupStartDate" :week-starts-on="0" class="cursorDefault"></Datepicker>
              <Datepicker v-model="cellInfo.backupEndDate" :week-starts-on="0" class="cursorDefault"></Datepicker>
              <button class="backupBtn" @click="createBackup">Download</button>
            </div>
          </td>
        </tr>
        <tr>
          <th class="pos-relative">
            Upload
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseover="tooltipVisibleFunc('upload', true)"
                @mouseout="tooltipVisibleFunc('upload', false)"
            />
            <Tooltip :isVisible="tooltipVisible.upload" className="mb08" position="top" type=""
                     :message="MSG.TOOLTIP.UPLOAD"/>
          </th>
          <td colspan="2">
            <div class="settingUploadContainer">
              <select v-model='uploadRootPath' class="uploadSavePath">
                <option v-for="type in drive" :key="type" :value="type">{{ type }}</option>
              </select>
              <button class="uploadBtn" @click="handleSelectUploadFile">Upload</button>
            </div>
          </td>
        </tr>


        <!--      나중에 기능 추가 할 부분 자동 백업-->
        <!--      <tr>-->
        <!--        <th>Auto Backup</th>-->
        <!--        <td>-->
        <!--          <div class="autoDateBox">-->
        <!--            <select v-model='cellInfo.autoBackUpMonth'>-->
        <!--              <option v-for="month in autoDate" :key="month.value" :value="month.value">-->
        <!--                {{ month.value }}-->
        <!--              </option>-->
        <!--            </select>-->
        <!--            <span>Month</span>-->
        <!--          </div>-->
        <!--        </td>-->
        <!--      </tr>-->
        </tbody>
      </table>
      <button class="saveBtn" type="button" @click='cellImgSet()'>Save</button>
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

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :type="confirmType"
      :message="confirmMessage"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />

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
import {
  createCellImgApi,
  deleteCellImgApi, getCellImgAllApi,
  getCellImgApi,
  getDrivesApi,
  putCellImgApi
} from "@/common/api/service/setting/settingApi";
import Datepicker from 'vue3-datepicker';
import {computed, nextTick, onMounted, ref, watch, getCurrentInstance, onBeforeMount} from "vue";
import {useStore} from "vuex";
import moment from "moment";
import {
  AnalysisList,
  stitchCountList,
  testTypeList,
  testBmTypeList,
  bmAnalysisList,
  settingName,
  edgeShotTypeList,
  POSITION_MARGIN_LIST,
  EDGE_SHOT_COUNT_LIST_LP, EDGE_SHOT_COUNT_LIST_HP
} from "@/common/defines/constants/settings";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import {
  backUpDateApi,
  downloadPossibleApi,
  uploadPossibleApi,
  uploadBackupApi,
  openDriveApi,
  checkPossibleUploadFileApi
} from "@/common/api/service/backup/wbcApi";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useRouter} from "vue-router";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";
import commonPositionMargin from "@/assets/images/commonMargin.png";
import smearTop from "@/assets/images/smearTop.png";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {CellImageAnalyzedType} from "@/common/type/tooltipType";
import {scrollToTop} from "@/common/lib/utils/scroll";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import {CellImgAnalyzedResponse} from "@/common/api/service/setting/dto/cellImgAnalyzedDto";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import {getDeviceInfoApi, putDeviceInfoApi} from "@/common/api/service/device/deviceApi";

const instance = getCurrentInstance();
const store = useStore();
const router = useRouter();
const showAlert = ref(false);
const alertType = ref('');
const showUploadModal = ref(false);
const alertMessage = ref('');
const analysisVal = ref<any>([]);
const downloadRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup');
const uploadRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc');
const autoDate = ref([
  {value: 'Not selected'},
  {value: 1},
  {value: 2},
  {value: 3},
  {value: 4},
  {value: 5},
  {value: 6},
  {value: 7},
  {value: 8},
  {value: 9},
  {value: 10},
  {value: 11},
  {value: 12}
]);
const drive = ref<any>([]);
const backupDrive = ref<any>([]);
const projectType = ref('pb');
const testTypeArr = ref<any>([]);
const uploadSlotIdObj = ref({duplicated: [], nonDuplicated: []});
const possibleUploadCount = computed(() => uploadSlotIdObj.value?.nonDuplicated && uploadSlotIdObj.value?.nonDuplicated.length);
const impossibleUploadCount = computed(() => uploadSlotIdObj.value?.duplicated && uploadSlotIdObj.value?.duplicated.length);
const showConfirm = ref(false);
const confirmType = ref('setting');
const confirmMessage = ref('');
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const settingType = computed(() => store.state.commonModule.settingType);
const siteCd = computed(() => store.state.commonModule.siteCd);
const isRestoring = ref(false);
const isDownloading = ref(false);
const isLoadingProgressBar = ref(false);
const showDownloadConfirm = ref(false);
const downloadConfirmMessage = ref('');
const downloadDto = ref<any>({});
const totalFileCount = ref(1);
const successFileCount = ref(0);
const downloadUploadType = ref('copy');
const intervalId = ref<any>(null);
const deletableDownloadFiles = ref({});
const loadingState = ref('');
const showUploadSelectModal = ref(false);
const possibleUploadFileNames = ref([]);
const saveHttpType = ref('');
const selectedUploadFile = ref('');
const showTutorialImage = ref({
  edgeShotType: false,
  positionMargin: false,
})
const apiUrl = ref('');
const tooltipVisible = ref({
  iaRootPath: false,
  alarm: false,
  keepPage: false,
  lisUploadCheckAll: false,
  downloadSavePath: false,
  download: false,
  upload: false,
  openDownloadSavePath: false,
})
const machineVersion = ref<'12a' | '100a'>('12a');
const currentCellId = ref(0);
const allCellInfo = ref<{ serverData: CellImgAnalyzedResponse[], clientData: CellImgAnalyzedResponse[] }>({
  serverData: [],
  clientData: [],
});
const autoStart = ref(false);
const cellInfo = ref({
  id: '',
  analysisType: '01',
  diffCellAnalyzingCount: '100',
  diffWbcPositionMargin: '0',
  diffRbcPositionMargin: '0',
  diffPltPositionMargin: '0',
  pbsCellAnalyzingCount: '100',
  bfCellAnalyzingCount: '100',
  stitchCount: '1',
  edgeShotType: '0',
  edgeShotCount: {
    LP: '1',
    HP: '3',
  },
  iaRootPath: window.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc',
  isNsNbIntegration: false,
  isAlarm: false,
  alarmCount: '5',
  keepPage: false,
  lisUploadCheckAll: false,
  backupPath: '',
  // backupStartDate: moment(new Date()).local().toDate().toISOString().split('T')[0],
  // backupEndDate: moment(new Date()).local().toDate().toISOString().split('T')[0],
  backupStartDate: new Date(),
  backupEndDate: new Date(),
  autoBackUpMonth: 'Not selected',
  presetChecked: false,
})
const toastInfo = ref({
  message: '',
  messageType: MESSAGES.TOAST_MSG_SUCCESS,
})
const editingItem = ref<any>(null);

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

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
  machineVersion.value = window.MACHINE_VERSION;
  getApiUrl();
})

onMounted(async () => {
  await nextTick();
  cellInfo.value.analysisType = window.PROJECT_TYPE === 'bm' ? '02' : '01';
  testTypeArr.value = window.PROJECT_TYPE === 'bm' ? testBmTypeList : testTypeList;
  analysisVal.value = window.PROJECT_TYPE === 'bm' ? bmAnalysisList : AnalysisList;
  await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.cellImageAnalyzed});

  await getDeviceInfo();
  await cellImgGet();
  await driveGet();
  await cellImgGetAll();
});

watch(cellInfo.value, async () => {
  if (isObjectEmpty(allCellInfo.value?.clientData)) {
    return;
  }

  const requestAllCellInfo = allCellInfo.value.clientData.map((item) => {
    if (String(item.id) === String(cellInfo.value.id)) {
      return {
        ...cellInfo.value,
        id: Number(cellInfo.value.id),
        presetChecked: true,
        backupEndDate: allCellInfo.value.serverData[0].backupEndDate,
        backupStartDate: allCellInfo.value.serverData[0].backupStartDate,
      };
    } else {
      return {...item, presetChecked: false};
    }
  })

  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(requestAllCellInfo)});
  if (settingType.value !== settingName.cellImageAnalyzed) {
    await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.cellImageAnalyzed});
  }
}, {deep: true})

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const getApiUrl = () => {
  const tmp = window.LINUX_SERVER_SET ? window.EQUIPMENTPCIP.split(':') : window.APP_API_BASE_URL.split(':');
  apiUrl.value = `${tmp[0]}:${tmp[1]}`;
}

const filterNumbersOnly = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^0-9]/g, '');
  cellInfo.value.alarmCount = filteredValue.trim();
};

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

const getDeviceInfo = async () => {
  try {
    const result = await getDeviceInfoApi()
    autoStart.value = !!result.data[0]?.autoStart;
  } catch (e) {
    autoStart.value = true;
  }
  sessionStorage.setItem('autoStart', JSON.stringify(autoStart.value));
}

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.settingNotSaved;
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

        currentCellId.value = data.id;
        cellInfo.value.id = String(data.id);
        cellInfo.value.analysisType = data.analysisType;
        cellInfo.value.diffCellAnalyzingCount = data.diffCellAnalyzingCount;
        cellInfo.value.diffWbcPositionMargin = data.diffWbcPositionMargin;
        cellInfo.value.diffRbcPositionMargin = data.diffRbcPositionMargin;
        cellInfo.value.diffPltPositionMargin = data.diffPltPositionMargin;
        cellInfo.value.pbsCellAnalyzingCount = data.pbsCellAnalyzingCount;
        cellInfo.value.stitchCount = data.stitchCount;
        cellInfo.value.bfCellAnalyzingCount = data.bfCellAnalyzingCount;
        cellInfo.value.edgeShotType = String(data?.edgeShotType);
        cellInfo.value.edgeShotCount.LP = String(data?.edgeShotLPCount);
        cellInfo.value.edgeShotCount.HP = String(data?.edgeShotHPCount);
        cellInfo.value.iaRootPath = data.iaRootPath;
        downloadRootPath.value = data.backupPath || (window.PROJECT_TYPE === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup');
        cellInfo.value.isNsNbIntegration = data.isNsNbIntegration;
        cellInfo.value.isAlarm = data.isAlarm;
        cellInfo.value.alarmCount = data.alarmCount;
        cellInfo.value.keepPage = data.keepPage;
        cellInfo.value.lisUploadCheckAll = data.lisUploadCheckAll;
        cellInfo.value.backupStartDate = moment(data.backupStartDate).local().toDate();
        cellInfo.value.backupEndDate = moment(data.backupEndDate).local().toDate();
        cellInfo.value.autoBackUpMonth = data?.autoBackUpMonth;
        cellInfo.value.presetNm = data?.presetNm;
        cellInfo.value.presetChecked = data?.presetChecked;

        sessionStorage.setItem('isAlarm', String(data?.isAlarm));
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const cellImgSet = async () => {
  try {
    const requestAllCellInfo = allCellInfo.value.clientData.map((item) => {
      if (String(item.id) === String(cellInfo.value.id)) {
        return {
          ...cellInfo.value,
          id: Number(cellInfo.value.id),
          presetChecked: true,
          backupEndDate: allCellInfo.value.serverData[0].backupEndDate,
          backupStartDate: allCellInfo.value.serverData[0].backupStartDate,
        };
      } else {
        return {...item, presetChecked: false};
      }
    })
    const allCellImgIds = allCellInfo.value.serverData.map(item => String(item.id));

    for (const requestCellInfo of requestAllCellInfo) {
      if (allCellImgIds.includes(String(requestCellInfo.id))) {
        await putCellImgApi(requestCellInfo, String(requestCellInfo.id));
      } else {
        if (requestCellInfo?.id) {
          delete requestCellInfo.id;
        }
        await createCellImgApi(requestCellInfo);
      }
    }

    toastInfo.value.messageType = MESSAGES.TOAST_MSG_SUCCESS;
    showToast(MSG.TOAST.UPDATE_SUCCESS);
    await cellImgGetAll();
    handleChangeCellId(Number(allCellInfo.value.clientData[0].id));
    scrollToTop();
    const data = allCellInfo.value.serverData.filter((item) => String(item.id) === String(cellInfo.value.id))[0];
    await store.dispatch('commonModule/setCommonInfo', {isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N'});
    await store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
      isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N'
    });
    // 공통으로 사용되는 부분 세션스토리지 저장 새로고침시에도 가지고 있어야하는부분
    sessionStorage.setItem('isNsNbIntegration', data.isNsNbIntegration ? 'Y' : 'N');
    sessionStorage.setItem('wbcPositionMargin', data?.diffWbcPositionMargin);
    sessionStorage.setItem('rbcPositionMargin', data?.diffRbcPositionMargin);
    sessionStorage.setItem('pltPositionMargin', data?.diffPltPositionMargin);
    sessionStorage.setItem('edgeShotType', String(data?.edgeShotType));
    sessionStorage.setItem('edgeShotLPCount', String(data?.edgeShotLPCount));
    sessionStorage.setItem('edgeShotHPCount', String(data?.edgeShotHPCount));
    sessionStorage.setItem('iaRootPath', data?.iaRootPath);
    sessionStorage.setItem('isAlarm', String(data?.isAlarm));
    const keepPageType = projectType.value === 'pb' ? 'keepPage' : 'bmKeepPage'
    sessionStorage.setItem(keepPageType, String(data?.keepPage));
    await store.dispatch('commonModule/setCommonInfo', {resetAnalyzing: true});
    await store.dispatch('commonModule/setCommonInfo', {showLISUploadAfterCheckingAll: data?.lisUploadCheckAll});

    await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
    await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  } catch (e) {
    console.error(e);
    toastInfo.value.messageType = MESSAGES.TOAST_MSG_ERROR;
    showToast(MSG.TOAST.UPDATE_FAIL);
  }
}

const updateDeviceInfo = async () => {
  try {
    await putDeviceInfoApi({ autoStart: autoStart.value })
  } catch (e) {
    console.error(e);
  }
}

const toggleAutoStart = async () => {
  autoStart.value = !autoStart.value;
  sessionStorage.setItem('autoStart', JSON.stringify(autoStart.value));
  await updateDeviceInfo();
}

const toggleAlarm = () => {
  cellInfo.value.isAlarm = !cellInfo.value.isAlarm;
};

const toggleKeepPage = () => {
  cellInfo.value.keepPage = !cellInfo.value.keepPage;
};

const toggleLisUploadCheckAll = () => {
  cellInfo.value.lisUploadCheckAll = !cellInfo.value.lisUploadCheckAll;
};

const informationFontHover = (type: 'edgeShotType' | 'positionMargin', hoverStatus: 'hover' | 'leave') => {
  if (hoverStatus === 'leave') {
    showTutorialImage.value.edgeShotType = false;
    showTutorialImage.value.positionMargin = false;
    return;
  }
  switch (type) {
    case 'edgeShotType':
      showTutorialImage.value.edgeShotType = true;
      break;
    case 'positionMargin':
      showTutorialImage.value.positionMargin = true;
      break;
    default:
      break;
  }
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

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  // 프리셋 삭제
  if (confirmType.value === 'delete') {
    await deleteCellImg();
  } else {
    await cellImgSet();
  }
  showConfirm.value = false;
}

const handleDownloadClose = () => {
  showDownloadConfirm.value = false;
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

const downloadUploadStopWebSocket = (state: boolean) => {
  instance?.appContext.config.globalProperties.$socket.emit('isDownloadUploading', {
    type: 'SEND_DATA',
    payload: state
  });
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

const updateFileCounts = async () => {
  successFileCount.value = totalFileCount.value;
  setTimeout(async () => {
    totalFileCount.value = 0;
    successFileCount.value = 0;
    isLoadingProgressBar.value = false;
  }, 2000)
  await showSuccessAlert('Success');
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

const handleChangeCellId = (cellId: number) => {
  const selectedCellInfo = allCellInfo.value.clientData.filter((item) => String(item.id) === String(cellId))[0];
  if (selectedCellInfo) {
    cellInfo.value.iaRootPath = selectedCellInfo.iaRootPath;
    downloadRootPath.value = selectedCellInfo.backupPath || (window.PROJECT_TYPE === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup');
    cellInfo.value.isAlarm = selectedCellInfo.isAlarm;
    cellInfo.value.alarmCount = selectedCellInfo.alarmCount;
    cellInfo.value.keepPage = selectedCellInfo.keepPage;
    cellInfo.value.lisUploadCheckAll = selectedCellInfo.lisUploadCheckAll;
    cellInfo.value.backupStartDate = moment(selectedCellInfo.backupStartDate).local().toDate();
    cellInfo.value.backupEndDate = moment(selectedCellInfo.backupEndDate).local().toDate();
    cellInfo.value.autoBackUpMonth = selectedCellInfo?.autoBackUpMonth;
    cellInfo.value.presetChecked = selectedCellInfo?.presetChecked;
    cellInfo.value.presetNm = selectedCellInfo?.presetNm;
  }
}

const deleteCellImg = async () => {
  try {
    await deleteCellImgApi({id: String(cellInfo.value.id)});
    await cellImgGetAll();
    handleChangeCellId(Number(allCellInfo.value.clientData[0].id));
    toastInfo.value.messageType = MESSAGES.TOAST_MSG_SUCCESS;
    showToast(MSG.TOAST.DELETE_SUCCESS);
  } catch (error) {
    console.error(error);
    toastInfo.value.messageType = MESSAGES.TOAST_MSG_ERROR;
    showToast(MSG.TOAST.DELETE_FAILED);
  }
}

const cellImgGetAll = async () => {
  try {
    const result = await getCellImgAllApi();
    if (result?.data && !isObjectEmpty(result?.data)) {
      allCellInfo.value.clientData = [...result.data];
      allCellInfo.value.serverData = [...result.data];
      await store.dispatch('commonModule/setCommonInfo', {cellImageAnalyzedData: allCellInfo.value.serverData});
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: JSON.stringify(allCellInfo.value.clientData)});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(allCellInfo.value.clientData)});
    }
  } catch (error) {
    console.error(error);
    allCellInfo.value.clientData = [];
    allCellInfo.value.serverData = [];
  }
}

const showToast = (message: string) => {
  toastInfo.value.message = message;
  setTimeout(() => {
    toastInfo.value.message = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};

</script>
