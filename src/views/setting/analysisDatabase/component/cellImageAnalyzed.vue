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
  <table class="settingTable">
    <tbody>
    <tr v-if="viewerCheck !== 'viewer'">
      <th>Analysis Type</th>
      <td colspan="2">
        <select v-model='testTypeCd'>
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

        <select v-model='diffCellAnalyzingCount'>
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
        <select v-model='pbsCellAnalyzingCount'>
          <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
        </select>
      </td>
    </tr>
    <tr v-if="viewerCheck !== 'viewer'">
      <th v-if="projectType === 'bm'"></th>
      <th>Stitch Count</th>
      <td>
        <select v-model='stitchCount'>
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
        <select v-model='edgeShotType'>
          <option v-for="type in edgeShotTypeList" :key="type.value" :value="type.value">{{ type.text }}</option>
        </select>
      </td>
    </tr>

    <tr v-show="projectType === 'pb' && viewerCheck !== 'viewer' && machineVersion === '100a' && (edgeShotType === '2' || edgeShotType === '3')">
      <th class="pos-relative">Edge Shot Count</th>
      <td v-show="edgeShotType === '2'">
        <select v-model='edgeShotCount.LP'>
          <option v-for="type in EDGE_SHOT_COUNT_LIST_LP" :key="type.value" :value="type.value">{{ type.text }}</option>
        </select>
      </td>
      <td v-show="edgeShotType === '3'">
        <select v-model='edgeShotCount.HP'>
          <option v-for="type in EDGE_SHOT_COUNT_LIST_HP" :key="type.value" :value="type.value">{{ type.text }}</option>
        </select>
      </td>
    </tr>

    <!--      BF analysis values-->
    <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
      <th>BF Analysis Values</th>
      <th>Cell Analyzing Count</th>
      <td>
        <select v-model='bfCellAnalyzingCount'>
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
        <select v-model='wbcPositionMargin'>
          <option v-for="type in POSITION_MARGIN_LIST" :key="type.value" :value="type.value">{{ type.text }}</option>
        </select>
      </td>
    </tr>
    <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
      <th>Rbc Position Margin</th>
      <td>
        <select v-model='rbcPositionMargin'>
          <option v-for="type in POSITION_MARGIN_LIST" :key="type.value" :value="type.value">{{ type.text }}</option>
        </select>
      </td>
    </tr>
    <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
      <th>Edge Position Margin</th>
      <td>
        <select v-model='pltPositionMargin'>
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
        <select v-model='iaRootPath'>
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
            :icon="isNsNbIntegration ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
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
            :icon="isAlarm ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
            class="iconSize"
            @click="toggleAlarm"
        />
      </td>
      <td>
        <input type="text" v-model='alarmCount' class="alarmInput" @input="filterNumbersOnly($event)">
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
            :icon="keepPage ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
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
            :icon="lisUploadCheckAll ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
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
          <Datepicker v-model="backupStartDate"></Datepicker>
          <Datepicker v-model="backupEndDate"></Datepicker>
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
    <!--            <select v-model='autoBackUpMonth'>-->
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
</template>
<script setup lang="ts">
import { createCellImgApi, getCellImgApi, getDrivesApi, putCellImgApi } from "@/common/api/service/setting/settingApi";
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

const instance = getCurrentInstance();
const store = useStore();
const router = useRouter();
const showAlert = ref(false);
const alertType = ref('');
const showUploadModal = ref(false);
const alertMessage = ref('');
const analysisVal = ref<any>([]);
const testTypeCd = ref('01');
const diffCellAnalyzingCount = ref('100');
const wbcPositionMargin = ref('0');
const rbcPositionMargin = ref('0');
const pltPositionMargin = ref('0');
const pbsCellAnalyzingCount = ref('100');
const stitchCount = ref('1');
const edgeShotType = ref('0');
const edgeShotCount = ref({
  'LP': '1',
  'HP': '3',
})
const bfCellAnalyzingCount = ref('100');
const iaRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc');
const downloadRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup');
const uploadRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc');
const isNsNbIntegration = ref(false);
const isAlarm = ref(false);
const alarmCount = ref('5');
const keepPage = ref(false);
const lisUploadCheckAll = ref(false);
const backupStartDate = ref(moment().local().toDate());
const backupEndDate = ref(moment().local().toDate());
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
const autoBackUpMonth = ref('Not selected');
const saveHttpType = ref('');
const drive = ref<any>([]);
const backupDrive = ref<any>([]);
const cellimgId = ref('');

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

instance?.appContext.config.globalProperties.$socket.on('downloadUploadFinished', async (downloadUploadObj: { type: 'download' | 'upload'; isFinished: boolean}) => {
  if (downloadUploadObj?.isFinished) {
    clearInterval(intervalId.value);
    successFileCount.value = totalFileCount.value;
    downloadUploadStopWebSocket(false);
    await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: false });
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
  testTypeCd.value = window.PROJECT_TYPE === 'bm' ? '02' : '01';
  testTypeArr.value = window.PROJECT_TYPE === 'bm' ? testBmTypeList : testTypeList;
  analysisVal.value = window.PROJECT_TYPE === 'bm' ? bmAnalysisList : AnalysisList;
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.cellImageAnalyzed });

  await cellImgGet();
  await driveGet();
});

watch([testTypeCd, diffCellAnalyzingCount, diffCellAnalyzingCount, wbcPositionMargin, rbcPositionMargin,
  pltPositionMargin, pbsCellAnalyzingCount, edgeShotType, edgeShotCount, stitchCount, bfCellAnalyzingCount, iaRootPath, isNsNbIntegration, isAlarm, alarmCount, keepPage, lisUploadCheckAll], async () => {
  const cellAfterSettingObj = {
    id: cellimgId.value,
    analysisType: testTypeCd.value,
    diffCellAnalyzingCount: diffCellAnalyzingCount.value,
    diffWbcPositionMargin: wbcPositionMargin.value,
    diffRbcPositionMargin: rbcPositionMargin.value,
    diffPltPositionMargin: pltPositionMargin.value,
    pbsCellAnalyzingCount: pbsCellAnalyzingCount.value,
    stitchCount: stitchCount.value,
    edgeShotType: edgeShotType.value,
    edgeShotLPCount: edgeShotCount.value.LP,
    edgeShotHPCount: edgeShotCount.value.HP,
    bfCellAnalyzingCount: bfCellAnalyzingCount.value,
    iaRootPath: iaRootPath.value,
    isNsNbIntegration: isNsNbIntegration.value,
    isAlarm: isAlarm.value,
    alarmCount: alarmCount.value,
    keepPage: keepPage.value,
    lisUploadCheckAll: lisUploadCheckAll.value,
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
  alarmCount.value = filteredValue.trim();
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

        cellimgId.value = String(data.id);
        testTypeCd.value = data.analysisType;
        diffCellAnalyzingCount.value = data.diffCellAnalyzingCount;
        wbcPositionMargin.value = data.diffWbcPositionMargin;
        rbcPositionMargin.value = data.diffRbcPositionMargin;
        pltPositionMargin.value = data.diffPltPositionMargin;
        pbsCellAnalyzingCount.value = data.pbsCellAnalyzingCount;
        stitchCount.value = data.stitchCount;
        bfCellAnalyzingCount.value = data.bfCellAnalyzingCount;
        edgeShotType.value = String(data?.edgeShotType);
        edgeShotCount.value.LP = String(data?.edgeShotLPCount);
        edgeShotCount.value.HP = String(data?.edgeShotHPCount);
        iaRootPath.value = data.iaRootPath;
        downloadRootPath.value = data.backupPath || (window.PROJECT_TYPE === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup');
        isNsNbIntegration.value = data.isNsNbIntegration;
        isAlarm.value = data.isAlarm;
        alarmCount.value = data.alarmCount;
        keepPage.value = data.keepPage;
        lisUploadCheckAll.value = data.lisUploadCheckAll;
        backupStartDate.value = moment(data.backupStartDate).local().toDate();
        backupEndDate.value = moment(data.backupEndDate).local().toDate();
        autoBackUpMonth.value = data?.autoBackUpMonth;

        const cellBeforeSettingObj = {
          id: cellimgId.value,
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
    analysisType: testTypeCd.value,
    diffCellAnalyzingCount: diffCellAnalyzingCount.value,
    diffWbcPositionMargin: wbcPositionMargin.value,
    diffRbcPositionMargin: rbcPositionMargin.value,
    diffPltPositionMargin: pltPositionMargin.value,
    pbsCellAnalyzingCount: pbsCellAnalyzingCount.value,
    edgeShotType: edgeShotType.value,
    edgeShotLPCount: edgeShotCount.value.LP,
    edgeShotHPCount: edgeShotCount.value.HP,
    stitchCount: stitchCount.value,
    bfCellAnalyzingCount: bfCellAnalyzingCount.value,
    iaRootPath: iaRootPath.value,
    isNsNbIntegration: isNsNbIntegration.value,
    isAlarm: isAlarm.value,
    alarmCount: alarmCount.value,
    keepPage: keepPage.value,
    lisUploadCheckAll: lisUploadCheckAll.value,
    backupPath: downloadRootPath.value,
    backupStartDate: moment(backupStartDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0],
    backupEndDate: moment(backupEndDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0],
    autoBackUpMonth: autoBackUpMonth.value,
    autoBackUpStartDate: autoBackUpMonth.value !== 'Not selected' ? moment(new Date()).local().toDate().toISOString().split('T')[0]:null,
  }

  try {

    let result: any = {};
    if (saveHttpType.value === 'post') {
      result = await createCellImgApi(cellImgSet);
    } else {
      result = await putCellImgApi(cellImgSet, cellimgId.value);
    }

    if (result) {
      const text = saveHttpType.value === 'post' ? MESSAGES.settingSaveSuccess : MESSAGES.UPDATE_SUCCESSFULLY;
      showSuccessAlert(text);
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
      sessionStorage.setItem('lisUploadCheckAll', String(data?.lisUploadCheckAll));
      const keepPageType = projectType.value === 'pb' ? 'keepPage': 'bmKeepPage'
      sessionStorage.setItem(keepPageType, String(data?.keepPage));
      await store.dispatch('commonModule/setCommonInfo', {resetAnalyzing: true});
    }

    await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
    await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  } catch (e) {
    console.error(e);
  }
}

const toggleNsNbIntegration = () => {
  isNsNbIntegration.value = !isNsNbIntegration.value;
};

const toggleAlarm = () => {
  isAlarm.value = !isAlarm.value;
};

const toggleKeepPage = () => {
  keepPage.value = !keepPage.value;
};

const toggleLisUploadCheckAll = () => {
  lisUploadCheckAll.value = !lisUploadCheckAll.value;
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
    await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: true });
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

  await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: true });
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
  const sendingDownloadStartDate = moment(backupStartDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0];
  const sendingDownloadEndDate = moment(backupEndDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0];
  const downloadDto = {
    startDate: sendingDownloadStartDate, // 백업 시작일
    endDate: sendingDownloadEndDate, // 백업 종료일
    originDownloadPath: `${iaRootPath.value}`, //이미지가 있는 경로 옮겨져야 하는 폴더 위치
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

  const sendingDownloadStartDate = moment(backupStartDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0];
  const sendingDownloadEndDate = moment(backupEndDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0];

  if (!moment(sendingDownloadStartDate).isSameOrBefore(sendingDownloadEndDate)) {
    showErrorAlert('Please check the date');
    return
  }

  downloadDto.value = {
    startDate: sendingDownloadStartDate, // 백업 시작일
    endDate: sendingDownloadEndDate, // 백업 종료일
    originDownloadPath: `${iaRootPath.value}`, //이미지가 있는 경로 옮겨져야 하는 폴더 위치
    destinationDownloadPath: downloadRootPath.value, // 백업 경로
    projectType: projectType.value,
  };
  try {
    await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: true });
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
    await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: false });
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
    await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: true });
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
      await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: false });
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
  if (machineVersion.value === '100a' && (edgeShotType.value === '2' || edgeShotType.value === '3')) return 4;
  if (machineVersion.value === '100a') return 3;
  if (machineVersion.value === '12a') return 3;
  return 3;
}

</script>
