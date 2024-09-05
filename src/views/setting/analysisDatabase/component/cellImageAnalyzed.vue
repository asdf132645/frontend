<template>
  <div class="loadingBackground" v-show="isLoadingProgressBar">
    <div class="progressContainer">
      <p class="loadingProgressBarText">{{ successFileCount }} / {{ totalFileCount  }} files {{ loadingState }}...</p>
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
    <div class="settingCellImgAnalyzedContainer">
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
        <!--Common analysis values-->

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
          <th :rowspan="projectType === 'pb' && testTypeCd === '04' ? 3 : 2">PBS Analysis Values</th>
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
        <tr v-show="projectType === 'pb' && testTypeCd === '04' && viewerCheck !== 'viewer'">
          <th>Edge Shot Type</th>
          <td>
            <select v-model='edgeShotType'>
              <option v-for="type in edgeShotTypeList" :key="type.value" :value="type.value">{{ type.text }}</option>
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
          <th rowspan="3">Common</th>
          <th>Wbc Position Margin</th>
          <td>
            <select v-model='wbcPositionMargin'>
              <option v-for="type in WbcPositionMarginList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
          <th>Rbc Position Margin</th>
          <td>
            <select v-model='rbcPositionMargin'>
              <option v-for="type in PositionMarginList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="projectType === 'pb' && viewerCheck !== 'viewer'">
          <th>Plt Position Margin</th>
          <td>
            <select v-model='pltPositionMargin'>
              <option v-for="type in PositionMarginList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr>
          <th :style="viewerCheck === 'viewer' && 'width: 214px;'">
            IA Root Path
            <font-awesome-icon :icon="['fas', 'circle-info']" :title="messages.SETTING_INFO_IA_ROOT_PATH_KO" />
          </th>
          <td colspan="2">
            <select v-model='iaRootPath'>
              <option v-for="type in drive" :key="type" :value="type">{{ type }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="viewerCheck !== 'viewer'">
          <th>
            NS/NB Integration
            <font-awesome-icon :icon="['fas', 'circle-info']" :title="messages.SETTING_INFO_NS_NB_INTEGRATION_KO" />
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
          <th>
            Alarm Timer (sec)
            <font-awesome-icon :icon="['fas', 'circle-info']" :title="messages.SETTING_INFO_ALARM_TIME_KO" />
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
        <tr v-if="viewerCheck !== 'viewer'">
          <th>
            Keep Page
            <font-awesome-icon :icon="['fas', 'circle-info']" :title="messages.SETTING_INFO_KEEP_PAGE_KO" />
          </th>
          <td>
            <font-awesome-icon
                :icon="keepPage ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                class="iconSize"
                @click="toggleKeepPage"
            />
          </td>
        </tr>
        </tbody>
      </table>

      <table class="settingTable auto">
        <colgroup>
          <col width="90">
          <col width="10">
        </colgroup>
        <tbody>
        <tr>
          <th>
            Download Save Path
            <font-awesome-icon :icon="['fas', 'circle-info']" :title="messages.SETTING_INFO_DOWNLOAD_SAVE_PATH_KO" />
          </th>

          <td>
            <div class="downloadSavePathContainer">
              <select v-model='downloadRootPath' class="downloadPath">
                <option v-for="type in backupDrive" :key="type" :value="type">{{ type }}</option>
              </select>
              <font-awesome-icon :icon="['fas', 'folder-open']" @click="openSourceDrive" class="openDriveIcon" />
            </div>
          </td>
        </tr>
        <tr>
          <th title="Download data from start to end date">
            Download
            <font-awesome-icon :icon="['fas', 'circle-info']" :title="messages.SETTING_INFO_DOWNLOAD_KO" />
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
          <th>
            Upload
            <font-awesome-icon :icon="['fas', 'circle-info']" :title="messages.SETTING_INFO_UPLOAD_KO" />
          </th>
          <td colspan="2">
            <div class="settingUploadContainer">
              <select v-model='uploadRootPath' class="uploadSavePath">
                <option v-for="type in drive" :key="type" :value="type">{{ type }}</option>
              </select>

<!--              <input type="file" ref="uploadFileInput" @change="handleUploadFileChange" style="display: none;" accept=".sql" />-->
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
      <button class="saveBtn mb2" type="button" @click='cellImgSet()'>Save</button>
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
      <button v-show="possibleUploadCount > 0" class="memoModalBtn" @click="uploadConfirm('copy')">{{ messages.COPY }}</button>
<!--      <button v-show="possibleUploadCount > 0" class="memoModalBtn" @click="uploadConfirm('move')">{{ messages.MOVE }}</button>-->
      <button class="memoModalBtn" @click="uploadCancel">{{ impossibleUploadCount === 0 ? messages.CANCEL : messages.CLOSE }}</button>
    </div>
  </div>

  <!-- Upload 선택 모달 -->
  <div v-show="showUploadSelectModal" :class="possibleUploadFileNames.length === 0 ? 'downloadDeleteSmallModal' : 'downloadDeleteModal'">
    <p class="fs12" style="top: 0;">Upload file list</p>
    <div v-show="possibleUploadFileNames.length > 0" class="downloadDeleteContainer">
      <p class="downloadDeleteSemiTitle">Select upload file</p>
      <ul class="downloadDeleteWrapper">
        <li class="userSelectText flexSpaceBetween" v-for="folderName in possibleUploadFileNames" :key="folderName">
          <p style="font-size: 0.8rem;">{{ folderName }}</p>
          <input style="margin: 0;" v-model="selectedUploadFile" type="radio" :value="folderName" />
        </li>

      </ul>
    </div>
    <p class="mt4" v-show="possibleUploadFileNames.length === 0">No files</p>
    <div class="uploadModalBtnContainer">
      <template v-if="possibleUploadFileNames.length > 0">
        <button class="memoModalBtn" @click="handleUploadSelectFile">{{ messages.UPLOAD }}</button>
        <button class="memoModalBtn" @click="handleUploadSelectModalClose">{{ messages.CANCEL }}</button>
      </template>
      <button v-else class="memoModalBtn" @click="handleUploadSelectModalClose">{{ messages.CLOSE }}</button>
    </div>
  </div>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :message="confirmMessage"
      :confirmText="messages.SAVE"
      :closeText="messages.LEAVE"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />

  <Confirm
      v-if="showDownloadConfirm"
      :is-visible="showDownloadConfirm"
      :message="downloadConfirmMessage"
      :confirmText="messages.COPY"
      :closeText="messages.CLOSE"
      @hide="handleDownloadClose"
      @okConfirm="handleDownload('copy')"
  />
<!--  <ConfirmThreeBtn-->
<!--      v-if="showDownloadConfirm"-->
<!--      :is-visible="showDownloadConfirm"-->
<!--      :message="downloadConfirmMessage"-->
<!--      :confirmText="messages.MOVE"-->
<!--      :confirmText2="messages.COPY"-->
<!--      :closeText="messages.CLOSE"-->
<!--      @hide="handleDownloadClose"-->
<!--      @okConfirm="handleDownload('move')"-->
<!--      @okConfirm2="handleDownload('copy')"-->
<!--  />-->

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

import { computed, nextTick, onMounted, ref, watch, getCurrentInstance } from "vue";
import {
  AnalysisList,
  PositionMarginList, stitchCountList,
  testTypeList,
  WbcPositionMarginList,
  testBmTypeList, bmAnalysisList, settingName, edgeShotTypeList
} from "@/common/defines/constFile/settings";
import Alert from "@/components/commonUi/Alert.vue";
import {useStore} from "vuex";
import {messages} from "@/common/defines/constFile/constantMessageText";
import moment from "moment";
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
const bfCellAnalyzingCount = ref('100');
const iaRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc');
const downloadRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup');
const uploadRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc');
const isNsNbIntegration = ref(false);
const isAlarm = ref(false);
const alarmCount = ref('5');
const keepPage = ref(false);
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

onMounted(async () => {
  await nextTick();
  testTypeCd.value = window.PROJECT_TYPE === 'bm' ? '02' : '01';
  projectType.value = window.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
  testTypeArr.value = window.PROJECT_TYPE === 'bm' ? testBmTypeList : testTypeList;
  analysisVal.value = window.PROJECT_TYPE === 'bm' ? bmAnalysisList : AnalysisList;
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.cellImageAnalyzed });

  await cellImgGet();
  await driveGet();
});

watch([testTypeCd, diffCellAnalyzingCount, diffCellAnalyzingCount, wbcPositionMargin, rbcPositionMargin,
  pltPositionMargin, pbsCellAnalyzingCount, edgeShotType, stitchCount, bfCellAnalyzingCount, iaRootPath, isNsNbIntegration, isAlarm, alarmCount, keepPage], async () => {
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
    bfCellAnalyzingCount: bfCellAnalyzingCount.value,
    iaRootPath: iaRootPath.value,
    isNsNbIntegration: isNsNbIntegration.value,
    isAlarm: isAlarm.value,
    alarmCount: alarmCount.value,
    keepPage: keepPage.value,
  }

  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(cellAfterSettingObj)});
  if (settingType.value !== settingName.cellImageAnalyzed) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.cellImageAnalyzed });
  }
})

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

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

    console.log(e);
  }
}

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
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
        iaRootPath.value = data.iaRootPath;
        downloadRootPath.value = data.backupPath || (window.PROJECT_TYPE === 'bm' ? 'D:\\UIMD_BM_backup' : 'D:\\UIMD_PB_backup');
        isNsNbIntegration.value = data.isNsNbIntegration;
        isAlarm.value = data.isAlarm;
        alarmCount.value = data.alarmCount;
        keepPage.value = data.keepPage;
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
          bfCellAnalyzingCount: data?.bfCellAnalyzingCount,
          iaRootPath: data?.iaRootPath,
          isNsNbIntegration: data?.isNsNbIntegration,
          isAlarm: data?.isAlarm,
          alarmCount: data?.alarmCount,
          keepPage: data?.keepPage,
        }

        await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(cellBeforeSettingObj) });
        await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(cellBeforeSettingObj) });
      }

    }
  } catch (e) {

    console.log(e);
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
    stitchCount: stitchCount.value,
    bfCellAnalyzingCount: bfCellAnalyzingCount.value,
    iaRootPath: iaRootPath.value,
    isNsNbIntegration: isNsNbIntegration.value,
    isAlarm: isAlarm.value,
    alarmCount: alarmCount.value,
    keepPage: keepPage.value,
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
      const text = saveHttpType.value === 'post' ? messages.settingSaveSuccess : messages.UPDATE_SUCCESSFULLY;
      showSuccessAlert(text);
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
      sessionStorage.setItem('iaRootPath', data?.iaRootPath);
      const keepPageType = projectType.value === 'pb' ? 'keepPage': 'bmKeepPage'
      sessionStorage.setItem(keepPageType, String(data?.keepPage));
      await store.dispatch('commonModule/setCommonInfo', {resetAnalyzing: true});
    }

    await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
    await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  } catch (e) {
    console.log(e);
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

const uploadConfirm = async (uploadType: 'move' | 'copy') => {
  showUploadModal.value = false;
  totalFileCount.value = possibleUploadCount.value;
  try {
    isLoadingProgressBar.value = true;
    const day = localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate , page, searchText, nrCount, testType, wbcInfo, wbcTotal}  = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;

    const uploadDto = {
      fileName: selectedUploadFile.value,
      destinationUploadPath: uploadRootPath.value,
      originUploadPath: downloadRootPath.value,
      dayQuery,
      projectType: projectType.value,
      uploadType
    }
    downloadUploadType.value = uploadType;

    if (uploadType === 'move') {
      loadingState.value = 'moved';
    } else {
      loadingState.value = 'copied';
    }

    successFileCount.value = 0;
    await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: true });
    downloadUploadStopWebSocket(true);
    handlePolling();
    const result = await uploadBackupApi(uploadDto);
    if (typeof result.data === 'string') {
      showErrorAlert(result.data);
    } else {
      showSuccessAlert('Upload completed successfully');
    }
  } catch (e) {
    console.log(e);
  } finally {
    successFileCount.value = totalFileCount.value;
    clearInterval(intervalId.value);
    downloadUploadStopWebSocket(false);
    await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: false });
  }
  await updateFileCounts('Upload');
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
  }, duration * 1500);
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

  try {
    handlePolling();
    await backUpDateApi(downloadDto);
  } catch (e) {
    console.log(e);
  } finally {
    clearInterval(intervalId.value);
    successFileCount.value = totalFileCount.value;
    downloadUploadStopWebSocket(false);
    await store.dispatch('commonModule/setCommonInfo', { isDownloadOrUploading: false });
  }

  await updateFileCounts('Download');
}

const updateFileCounts = async (downloadUploadType: 'Download' | 'Upload') => {
  successFileCount.value = totalFileCount.value;
  setTimeout(async () => {
    totalFileCount.value = 0;
    successFileCount.value = 0;
    isLoadingProgressBar.value = false;
  }, 2000)
  await showSuccessAlert(`${downloadUploadType} Success`);
}

const downloadDtoObj = (downloadType: 'move' | 'copy') => {
  downloadUploadType.value = downloadType;
  showDownloadConfirm.value = false;
  const day = localStorage.getItem('lastSearchParams') || '';
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
    downloadType
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
    isDownloading.value = true;
    const isPossibleToBackup = await downloadPossibleApi(downloadDto.value);
    if (isPossibleToBackup.data.success) {
      totalFileCount.value = Number(isPossibleToBackup.data.message.split(' ')[1]);
      showDownloadConfirm.value = true;
      downloadConfirmMessage.value = 'Would you like to copy files?';
      // downloadConfirmMessage.value = `Would you move or copy files`;
    } else {
      showErrorAlert(isPossibleToBackup.data.message);
    }
  } catch (e) {
    console.log(e);
  } finally {
    isDownloading.value = false;
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
    console.log(error);
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
    console.log(e);
  }
}

const handleUploadSelectFile = async () => {
    try {
    isRestoring.value = true;
    const uploadDto = {
      fileName: selectedUploadFile.value,
      destinationUploadPath: uploadRootPath.value,
      originUploadPath: downloadRootPath.value,
      projectType: projectType.value
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
    console.log(e);
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

</script>
