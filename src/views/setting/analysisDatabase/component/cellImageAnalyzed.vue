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
          <th>Analysis Type</th>
          <td colspan="2">
            <select v-model='cellInfo.testTypeCd'>
              <option v-for="type in testTypeArr" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <tr v-if="viewerCheck !== 'viewer'">
          <!-- WBC diff analysis values -->
          <th rowspan="1" v-if="projectType === 'pb'">WBC Diff Analysis Values</th>

          <!-- BM diff analysis values -->
          <th v-if="projectType === 'bm'">BM Diff Analysis Values</th>
          <th>Cell Analyzing Count</th>
          <td>

            <select v-model='cellInfo.diffCellAnalyzingCount'>
              <option v-for="type in analysisVal" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <!--      PBS analysis values-->
        <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
          <th :rowspan="pbsAnalysisValuesRowIndex()">PBS Analysis Values</th>
          <th>
            Cell Analyzing Count
          </th>
          <td>
            <select v-model='cellInfo.pbsCellAnalyzingCount'>
              <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="viewerCheck !== 'viewer'">
          <th v-if="projectType === 'bm'"></th>
          <th>Stitch Count</th>
          <td>
            <select v-model='cellInfo.stitchCount'>
              <option v-for="type in stitchCountList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr v-show="projectType === 'pb' && viewerCheck !== 'viewer'">
          <th class="pos-relative">
            Edge Shot Type
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseenter="() => informationFontHover('edgeShotType', 'hover')"
                @mouseleave="informationFontHover('edgeShotType', 'leave')"
            />
            <Transition>
              <div v-if="showTutorialImage.edgeShotType" class="tutorial-edgeShotType-container">
                <img :src="smearTop" width="400" />
              </div>
            </Transition>
          </th>
          <td>
            <select v-model='cellInfo.edgeShotType'>
              <option v-for="type in edgeShotTypeList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <tr v-show="projectType === 'pb' && viewerCheck !== 'viewer' && machineVersion === '100a' && (cellInfo.edgeShotType === '2' || cellInfo.edgeShotType === '3')">
          <th class="pos-relative">Edge Shot Count</th>
          <td v-show="cellInfo.edgeShotType === '2'">
            <select v-model='cellInfo.edgeShotCount.LP'>
              <option v-for="type in EDGE_SHOT_COUNT_LIST_LP" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
          <td v-show="cellInfo.edgeShotType === '3'">
            <select v-model='cellInfo.edgeShotCount.HP'>
              <option v-for="type in EDGE_SHOT_COUNT_LIST_HP" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <!--      BF analysis values-->
        <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
          <th>BF Analysis Values</th>
          <th>Cell Analyzing Count</th>
          <td>
            <select v-model='cellInfo.bfCellAnalyzingCount'>
              <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
          <th rowspan="3" class="pos-relative">
            Common
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseenter="() => informationFontHover('positionMargin', 'hover')"
                @mouseleave="informationFontHover('positionMargin', 'leave')"
            />
            <Transition>
              <div v-show="showTutorialImage.positionMargin" class="tutorial-positionMargin-container">
                <img :src="commonPositionMargin" width="140" />
              </div>
            </Transition>
          </th>
          <th>Wbc Position Margin</th>
          <td>
            <select v-model='cellInfo.diffWbcPositionMargin'>
              <option v-for="type in POSITION_MARGIN_LIST" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
          <th>Rbc Position Margin</th>
          <td>
            <select v-model='cellInfo.diffRbcPositionMargin'>
              <option v-for="type in POSITION_MARGIN_LIST" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
          <th>Edge Position Margin</th>
          <td>
            <select v-model='cellInfo.diffPltPositionMargin'>
              <option v-for="type in POSITION_MARGIN_LIST" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr>
          <th :style="viewerCheck === 'viewer' && 'width: 214px;'" class="pos-relative">
            IA Root Path
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                :title="MESSAGES.SETTING_INFO_IA_ROOT_PATH_KO"
                @mouseenter="tooltipVisibleFunc('iaRootPath', true)"
                @mouseleave="tooltipVisibleFunc('iaRootPath', false)"
            />
            <Tooltip :isVisible="tooltipVisible.iaRootPath" className="mb08" position="top" type="" :message="MSG.TOOLTIP.IA_ROOT_PATH" />
          </th>
          <td colspan="2">
            <select v-model='cellInfo.iaRootPath'>
              <option v-for="type in drive" :key="type" :value="type">{{ type }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="viewerCheck !== 'viewer'">
          <th class="pos-relative">
            NS/NB Integration
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseenter="tooltipVisibleFunc('nsNbIntegration', true)"
                @mouseleave="tooltipVisibleFunc('nsNbIntegration', false)"
            />
            <Tooltip :isVisible="tooltipVisible.nsNbIntegration" className="mb08" position="top" type="" :message="MSG.TOOLTIP.NS_NB_INTEGRATION" />
          </th>
          <td>
            <font-awesome-icon
                :icon="cellInfo.isNsNbIntegration ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                class="iconSize"
                @click="toggleNsNbIntegration"
            />
          </td>
        </tr>
        <tr v-if="viewerCheck !== 'viewer'">
          <th class="pos-relative">
            Alarm Timer (sec)
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseenter="tooltipVisibleFunc('alarm', true)"
                @mouseleave="tooltipVisibleFunc('alarm', false)"
            />
            <Tooltip :isVisible="tooltipVisible.alarm" className="mb08" position="top" type="" :message="MSG.TOOLTIP.ALARM" />
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
                @mouseenter="tooltipVisibleFunc('keepPage', true)"
                @mouseleave="tooltipVisibleFunc('keepPage', false)"
            />
            <Tooltip :isVisible="tooltipVisible.keepPage" className="mb08" position="top" type="" :message="MSG.TOOLTIP.KEEP_PAGE" />
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
                @mouseenter="tooltipVisibleFunc('lisUploadCheckAll', true)"
                @mouseleave="tooltipVisibleFunc('lisUploadCheckAll', false)"
            />
            <Tooltip :isVisible="tooltipVisible.lisUploadCheckAll" className="mb08" position="top" type="" :message="MSG.TOOLTIP.LIS_UPLOAD_CHECK" />
          </th>
          <td>
            <font-awesome-icon
                :icon="cellInfo.lisUploadCheckAll ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                class="iconSize"
                @click="toggleLisUploadCheckAll"
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
                @mouseenter="tooltipVisibleFunc('downloadSavePath', true)"
                @mouseleave="tooltipVisibleFunc('downloadSavePath', false)"
            />
            <Tooltip :isVisible="tooltipVisible.downloadSavePath" className="mb08" position="top" type="" :message="MSG.TOOLTIP.DOWNLOAD_SAVE_PATH" />
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
                    @mouseenter="tooltipVisibleFunc('openDownloadSavePath', true)"
                    @mouseleave="tooltipVisibleFunc('openDownloadSavePath', false)"
                />
                <Tooltip :isVisible="tooltipVisible.openDownloadSavePath" className="mb08" position="top" type="" :message="MSG.TOOLTIP.OPEN_DOWNLOAD_SAVE_PATH" />
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <th class="pos-relative">
            Download
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                @mouseenter="tooltipVisibleFunc('download', true)"
                @mouseleave="tooltipVisibleFunc('download', false)"
            />
            <Tooltip :isVisible="tooltipVisible.download" className="mb08" position="top" type="" :message="MSG.TOOLTIP.DOWNLOAD" />
          </th>
          <td>
            <div class="backupDatePickers">
              <Datepicker v-model="cellInfo.backupStartDate" :week-starts-on="0"></Datepicker>
              <Datepicker v-model="cellInfo.backupEndDate" :week-starts-on="0"></Datepicker>
              <button class="backupBtn" @click="createBackup">Download</button>
            </div>
          </td>
        </tr>
        <tr>
          <th class="pos-relative">
            Upload
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                :title="MESSAGES.SETTING_INFO_UPLOAD_KO"
                @mouseenter="tooltipVisibleFunc('upload', true)"
                @mouseleave="tooltipVisibleFunc('upload', false)"
            />
            <Tooltip :isVisible="tooltipVisible.upload" className="mb08" position="top" type="" :message="MSG.TOOLTIP.UPLOAD" />
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
      <button class="saveBtn mb20" type="button" @click='cellImgSet()'>Save</button>
    </div>
    <aside v-if="siteCd === '9090'" class="cellImgAnalyzed-aside-container">
      <h1>Preset</h1>

      <div class="presetButtonGroup-container">
        <div v-for="(cellId, cellIndex) in cellIdArr"
             :key="cellId"
             class="preset-container">
          <div class="preset-item">
            <input
                :id="String(cellId)"
                type="radio"
                name="cellIdGroup"
                :checked="cellIdArr[0] === cellId"
                @click="handleChangeCellId(cellId)" />
            <label :for="String(cellId)">{{ cellIndex + 1}}</label>
          </div>
          <button
              class="delete-preset-btn"
              @click.stop="handleDeletePreset(cellId)"
              v-if="cellIdArr.length > 1">×</button>
<!--          <button-->
<!--              class="edit-preset-btn"-->
<!--              @click.stop="handleEditPresetName(cellId)"-->
<!--              v-if="cellIdArr.length > 1">-->
<!--            <font-awesome-icon :icon="['fas', 'pen-to-square']" />-->
<!--          </button>-->
        </div>
        <button v-if="cellIdArr.length < 5" class="add-preset-btn" @click="handleCreatePreset">+</button>
      </div>
    </aside>
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
      <button v-show="possibleUploadCount > 0" class="memoModalBtn" @click="uploadConfirm('copy')">{{ MESSAGES.COPY }}</button>
      <button v-show="possibleUploadCount > 0" class="memoModalBtn" @click="uploadConfirm('move')">{{ MESSAGES.MOVE }}</button>
      <button class="memoModalBtn" @click="uploadCancel">{{
          impossibleUploadCount === 0 ? MESSAGES.CANCEL : MESSAGES.CLOSE
        }}</button>
    </div>
  </div>

  <!-- Upload 선택 모달 -->
  <div v-show="showUploadSelectModal" :class="possibleUploadFileNames.length === 0 ? 'downloadDeleteSmallModal' : 'downloadDeleteModal'">
    <p class="fs12" style="top: 0;">Upload file list</p>
    <div v-show="possibleUploadFileNames.length > 0" class="downloadDeleteContainer">
      <p class="downloadDeleteSemiTitle">Select upload file</p>
      <ul class="downloadDeleteWrapper">
        <li class="userSelectText flex-justify-between" v-for="folderName in possibleUploadFileNames" :key="folderName">
          <p style="font-size: 0.8rem;">{{ folderName }}</p>
          <input style="margin: 0;" v-model="selectedUploadFile" type="radio" :value="folderName" />
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
      type="setting"
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
      position="bottom-right"
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
import {computed, nextTick, onMounted, ref, watch, getCurrentInstance, reactive, onBeforeMount} from "vue";
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
import { CellImageAnalyzedType } from "@/common/type/tooltipType";
import {scrollToTop} from "@/common/lib/utils/scroll";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import {CellImgAnalyzedResponse} from "@/common/api/service/setting/dto/cellImgAnalyzedDto";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";

const instance = getCurrentInstance();
const store = useStore();
const router = useRouter();
const showAlert = ref(false);
const alertType = ref('');
const showUploadModal = ref(false);
const alertMessage = ref('');
const analysisVal = ref<any>([]);
const currentPresetId = ref(1);
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
const saveHttpType = ref('');
const drive = ref<any>([]);
const backupDrive = ref<any>([]);
const projectType = ref('pb');
const testTypeArr = ref<any>([]);
const uploadSlotIdObj = ref({duplicated: [], nonDuplicated: []});
const possibleUploadCount = computed(() => uploadSlotIdObj.value?.nonDuplicated && uploadSlotIdObj.value?.nonDuplicated.length);
const impossibleUploadCount = computed(() => uploadSlotIdObj.value?.duplicated && uploadSlotIdObj.value?.duplicated.length);
const showConfirm = ref(false);
const confirmMessage = ref('');
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
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
const selectedUploadFile = ref('');
const showTutorialImage = ref({
  edgeShotType: false,
  positionMargin: false,
})
const apiUrl = ref('');
const tooltipVisible = ref({
  iaRootPath: false,
  nsNbIntegration: false,
  alarm: false,
  keepPage: false,
  lisUploadCheckAll: false,
  downloadSavePath: false,
  download: false,
  upload: false,
  openDownloadSavePath: false,
})
const machineVersion = ref<'12a' | '100a'>('12a');
const cellIdArr = ref<number[]>([]);
const currentCellId = ref(0);
const currentEditingCellId = ref(0);
const allCellInfo = ref<CellImgAnalyzedResponse[]>([]);
const cellInfo = ref({
  cellImgId: '',
  testTypeCd: '01',
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
  backupStartDate: moment().local().toDate(),
  backupEndDate: moment().local().toDate(),
  autoBackUpMonth: 'Not selected',
  presetChecked: false,
  presetNm: '1',
})
const toastInfo = ref({
  message: '',
  messageType: MESSAGES.TOAST_MSG_SUCCESS,
})



instance?.appContext.config.globalProperties.$socket.on('downloadUploadFinished', async (downloadUploadObj: { type: 'download' | 'upload'; isFinished: boolean}) => {
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
})

onMounted(async () => {
  getApiUrl();
  await nextTick();
  cellInfo.value.testTypeCd = window.PROJECT_TYPE === 'bm' ? '02' : '01';
  testTypeArr.value = window.PROJECT_TYPE === 'bm' ? testBmTypeList : testTypeList;
  analysisVal.value = window.PROJECT_TYPE === 'bm' ? bmAnalysisList : AnalysisList;
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.cellImageAnalyzed });

  await cellImgGet();
  await driveGet();
  await cellImgGetAll();
});

watch([cellInfo.value.testTypeCd, cellInfo.value.diffCellAnalyzingCount, cellInfo.value.diffWbcPositionMargin, cellInfo.value.diffRbcPositionMargin,
  cellInfo.value.diffPltPositionMargin, cellInfo.value.pbsCellAnalyzingCount, cellInfo.value.edgeShotType, cellInfo.value.edgeShotCount, cellInfo.value.stitchCount, cellInfo.value.bfCellAnalyzingCount, cellInfo.value.iaRootPath, cellInfo.value.isNsNbIntegration,
  cellInfo.value.isAlarm,
  cellInfo.value.alarmCount,
  cellInfo.value.keepPage,
  cellInfo.value.lisUploadCheckAll,], async () => {
  const cellAfterSettingObj = {
    id: cellInfo.value.cellImgId,
    analysisType: cellInfo.value.testTypeCd,
    diffCellAnalyzingCount: cellInfo.value.diffCellAnalyzingCount,
    diffWbcPositionMargin: cellInfo.value.diffWbcPositionMargin,
    diffRbcPositionMargin: cellInfo.value.diffRbcPositionMargin,
    diffPltPositionMargin: cellInfo.value.diffPltPositionMargin,
    pbsCellAnalyzingCount: cellInfo.value.pbsCellAnalyzingCount,
    stitchCount: cellInfo.value.stitchCount,
    edgeShotType: cellInfo.value.edgeShotType,
    edgeShotLPCount: cellInfo.value.edgeShotCount.LP,
    edgeShotHPCount: cellInfo.value.edgeShotCount.HP,
    bfCellAnalyzingCount: cellInfo.value.bfCellAnalyzingCount,
    iaRootPath: cellInfo.value.iaRootPath,
    isNsNbIntegration: cellInfo.value.isNsNbIntegration,
    isAlarm: cellInfo.value.isAlarm,
    alarmCount: cellInfo.value.alarmCount,
    keepPage: cellInfo.value.keepPage,
    lisUploadCheckAll: cellInfo.value.lisUploadCheckAll,
  }

  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(cellAfterSettingObj)});
  if (settingType.value !== settingName.cellImageAnalyzed) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.cellImageAnalyzed });
  }
})

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const getApiUrl = () => {
  const tmp = window.APP_API_BASE_URL.split(':');
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

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = `${settingType.value} ${MESSAGES.settingNotSaved}`;
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
        cellInfo.value.cellImgId = String(data.id);
        cellInfo.value.testTypeCd = data.analysisType;
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

        const cellBeforeSettingObj = {
          id: data?.id,
          analysisType: data?.analysisType,
          diffCellAnalyzingCount: data?.diffCellAnalyzingCount,
          diffWbcPositionMargin: data?.diffWbcPositionMargin,
          diffRbcPositionMargin: data?.diffRbcPositionMargin,
          diffPltPositionMargin: data?.diffPltPositionMargin,
          pbsCellAnalyzingCount: data?.pbsCellAnalyzingCount,
          stitchCount: data?.stitchCount,
          edgeShotType: data?.edgeShotType,
          edgeShotLPCount: data?.edgeShotLPCount,
          edgeShotHPCount: data?.edgeShotHPCount,
          bfCellAnalyzingCount: data?.bfCellAnalyzingCount,
          iaRootPath: data?.iaRootPath,
          isNsNbIntegration: data?.isNsNbIntegration,
          isAlarm: data?.isAlarm,
          alarmCount: data?.alarmCount,
          keepPage: data?.keepPage,
          lisUploadCheckAll: data?.lisUploadCheckAll,
          presetChecked: data?.presetChecked,
          presetNm: data?.presetNm,
        }

        sessionStorage.setItem('isAlarm', String(data?.isAlarm));
        await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(cellBeforeSettingObj) });
        await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(cellBeforeSettingObj) });
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const cellImgSet = async () => {
  const cellImgSet = {
    analysisType: cellInfo.value.testTypeCd,
    diffCellAnalyzingCount: cellInfo.value.diffCellAnalyzingCount,
    diffWbcPositionMargin: cellInfo.value.diffWbcPositionMargin,
    diffRbcPositionMargin: cellInfo.value.diffRbcPositionMargin,
    diffPltPositionMargin: cellInfo.value.diffPltPositionMargin,
    pbsCellAnalyzingCount: cellInfo.value.pbsCellAnalyzingCount,
    edgeShotType: cellInfo.value.edgeShotType,
    edgeShotLPCount: cellInfo.value.edgeShotCount.LP,
    edgeShotHPCount: cellInfo.value.edgeShotCount.HP,
    stitchCount: cellInfo.value.stitchCount,
    bfCellAnalyzingCount: cellInfo.value.bfCellAnalyzingCount,
    iaRootPath: cellInfo.value.iaRootPath,
    isNsNbIntegration: cellInfo.value.isNsNbIntegration,
    isAlarm: cellInfo.value.isAlarm,
    alarmCount: cellInfo.value.alarmCount,
    keepPage: cellInfo.value.keepPage,
    lisUploadCheckAll: cellInfo.value.lisUploadCheckAll,
    backupPath: cellInfo.value.backupPath,
    backupStartDate: moment(cellInfo.value.backupStartDate).add(1, 'day').local().toDate().toISOString().split('T')[0],
    backupEndDate: moment(cellInfo.value.backupEndDate).add(1, 'day').local().toDate().toISOString().split('T')[0],
    autoBackUpMonth: cellInfo.value.autoBackUpMonth,
    autoBackUpStartDate: cellInfo.value.autoBackUpMonth !== 'Not selected' ? moment(new Date()).local().toDate().toISOString().split('T')[0] : null,
    presetChecked: true,
    presetNm: cellInfo.value.presetNm,

  }

  try {
    let result: any = {};
    if (saveHttpType.value === 'post') {
      result = await createCellImgApi(cellImgSet);
    } else {
      const presetCheckedItems = allCellInfo.value.filter((item: any) => item.presetChecked);
      for (const presetCheckedItem of presetCheckedItems) {
        const fixedRequest = { ...presetCheckedItem, presetChecked: false };
        await putCellImgApi(fixedRequest, String(presetCheckedItem.id));
      }
      result = await putCellImgApi(cellImgSet, cellInfo.value.cellImgId);
    }

    if (result) {
      toastInfo.value.messageType = MESSAGES.TOAST_MSG_SUCCESS;
      showToast(MSG.TOAST.UPDATE_SUCCESS);
      await cellImgGetAll();
      scrollToTop();
      const data = result?.data;
      await store.dispatch('commonModule/setCommonInfo', { isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N' });
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
      const keepPageType = projectType.value === 'pb' ? 'keepPage': 'bmKeepPage'
      sessionStorage.setItem(keepPageType, String(data?.keepPage));
      await store.dispatch('commonModule/setCommonInfo', {resetAnalyzing: true});
      await store.dispatch('commonModule/setCommonInfo', { showLISUploadAfterCheckingAll: data?.lisUploadCheckAll });
    }

    await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
    await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  } catch (e) {
    console.error(e);
    toastInfo.value.messageType = MESSAGES.TOAST_MSG_ERROR;
    showToast(MSG.TOAST.UPDATE_FAIL);
  }
}

const toggleNsNbIntegration = () => {
  cellInfo.value.isNsNbIntegration = !cellInfo.value.isNsNbIntegration;
};

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
    const {startDate, endDate , page, searchText, nrCount, testType, wbcInfo, wbcTotal}  = JSON.parse(day);
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
  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  await cellImgSet();
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

  console.log('downloadDto', downloadDto);
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
  const {startDate, endDate , page, searchText, nrCount, testType, wbcInfo, wbcTotal}  = JSON.parse(day);
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
  if (downloadRootPath.value === ''){
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

const pbsAnalysisValuesRowIndex = () => {
  if (projectType.value !== 'pb') return 2;
  if (machineVersion.value === '100a' && (cellInfo.value.edgeShotType === '2' || cellInfo.value.edgeShotType === '3')) return 4;
  if (machineVersion.value === '100a') return 3;
  if (machineVersion.value === '12a') return 3;
  return 3;
}

const handleChangeCellId = (cellId: number) => {
  const selectedCellInfo = allCellInfo.value.filter((item) => item.id === cellId)[0];
  if (selectedCellInfo) {
    cellInfo.value.cellImgId = String(selectedCellInfo.id);
    cellInfo.value.testTypeCd = selectedCellInfo.analysisType;
    cellInfo.value.diffCellAnalyzingCount = selectedCellInfo.diffCellAnalyzingCount;
    cellInfo.value.diffWbcPositionMargin = selectedCellInfo.diffWbcPositionMargin;
    cellInfo.value.diffRbcPositionMargin = selectedCellInfo.diffRbcPositionMargin;
    cellInfo.value.diffPltPositionMargin = selectedCellInfo.diffPltPositionMargin;
    cellInfo.value.pbsCellAnalyzingCount = selectedCellInfo.pbsCellAnalyzingCount;
    cellInfo.value.bfCellAnalyzingCount = selectedCellInfo.bfCellAnalyzingCount;
    cellInfo.value.stitchCount = selectedCellInfo.stitchCount;
    cellInfo.value.edgeShotType = String(selectedCellInfo?.edgeShotType);
    cellInfo.value.edgeShotCount.LP = String(selectedCellInfo?.edgeShotLPCount);
    cellInfo.value.edgeShotCount.HP = String(selectedCellInfo?.edgeShotHPCount);
    cellInfo.value.iaRootPath = selectedCellInfo.iaRootPath;
    downloadRootPath.value = selectedCellInfo.backupPath || (window.PROJECT_TYPE === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup');
    cellInfo.value.isNsNbIntegration = selectedCellInfo.isNsNbIntegration;
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

const handleCreatePreset = async () => {

  const defaultCellImgData = {
    testTypeCd: projectType.value === 'bm' ? '02' : '01',
    diffCellAnalyzingCount: projectType.value === 'bm' ? '500':'100',
    diffWbcPositionMargin: '0',
    diffRbcPositionMargin: '0',
    diffPltPositionMargin: '0',
    pbsCellAnalyzingCount: '100',
    stitchCount: '1',
    edgeShotType: '0',
    edgeShotLPCount: '1',
    edgeShotHPCount: '3',
    bfCellAnalyzingCount: '100',
    iaRootPath: projectType.value === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc',
    isNsNbIntegration: false,
    isAlarm: false,
    alarmCount: '5',
    keepPage: false,
    lisUploadCheckAll: false,
    backupPath: '',
    backupStartDate: moment(new Date()).local().toDate().toISOString().split('T')[0],
    backupEndDate: moment(new Date()).local().toDate().toISOString().split('T')[0],
    presetChecked: false,
    presetNm: '1',
  };

  try {
    const result = await createCellImgApi(defaultCellImgData);
    if (result.data) {
      currentPresetId.value = result.data?.id;
      cellIdArr.value.push(currentPresetId.value);
    }

  } catch (error) {
    console.error(error);
  }
}

const handleDeletePreset = async (selectedCellId: number) => {
  try {
    const result = deleteCellImgApi({ id: String(selectedCellId) });
    allCellInfo.value = allCellInfo.value.filter((item) => String(item.id) !== String(selectedCellId));
    cellIdArr.value = cellIdArr.value.filter((id) => String(id) !== String(selectedCellId));
    await handleChangeCellId(cellIdArr.value[0]);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

const handleEditPresetName = async (selectedCellId: number) => {
  console.log('currentEditingCellId', currentEditingCellId.value);
  console.log('selectedCellId', selectedCellId);
  if (currentEditingCellId.value === selectedCellId) {
    currentEditingCellId.value = undefined;
  }
  currentEditingCellId.value = selectedCellId;

  console.log('edit name', selectedCellId);
  //
}

const cellImgGetAll = async () => {
  try {
    const result = await getCellImgAllApi();
    if (result?.data && !isObjectEmpty(result?.data)) {
      cellIdArr.value = result.data.map((item) => item.id);
      allCellInfo.value = result.data;
    }
  } catch (error) {
    console.error(error);
    cellIdArr.value = [];
  }
}

const showToast = (message: string) => {
  toastInfo.value.message = message;
  setTimeout(() => {
    toastInfo.value.message = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};

</script>
