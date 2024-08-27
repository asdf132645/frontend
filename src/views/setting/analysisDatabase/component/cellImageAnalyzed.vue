<template>
  <div class="loadingBackground" v-if="isRestoring || isBackuping">
    <div class="loaderForLogin"></div>
    <p class="loadingTextLogin">Loading...</p>
  </div>

    <div>
      <template v-if="viewerCheck !== 'viewer'">
        <table class="settingTable">
        <tbody>
        <tr>
          <th>Analysis Type</th>
          <td colspan="2">
            <select v-model='testTypeCd'>
              <option v-for="type in testTypeArr" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <!--Common analysis values-->

        <tr>
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
        <tr v-if="projectType === 'pb'">
          <th rowspan="2">PBS Analysis Values</th>
          <th>
            Cell Analyzing Count
          </th>
          <td>
            <select v-model='pbsCellAnalyzingCount'>
              <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr>
          <th v-if="projectType === 'bm'"></th>
          <th>Stitch Count</th>
          <td>
            <select v-model='stitchCount'>
              <option v-for="type in stitchCountList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <!--      BF analysis values-->
        <tr v-if="projectType === 'pb'">
          <th>BF Analysis Values</th>
          <th>Cell Analyzing Count</th>
          <td>
            <select v-model='bfCellAnalyzingCount'>
              <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <tr v-if="projectType === 'pb'">
          <th rowspan="3">Common</th>
          <th>Wbc Position Margin</th>
          <td>
            <select v-model='wbcPositionMargin'>
              <option v-for="type in WbcPositionMarginList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="projectType === 'pb'">
          <th>Rbc Position Margin</th>
          <td>
            <select v-model='rbcPositionMargin'>
              <option v-for="type in PositionMarginList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="projectType === 'pb'">
          <th>Plt Position Margin</th>
          <td>
            <select v-model='pltPositionMargin'>
              <option v-for="type in PositionMarginList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <tr>
          <th>IA Root Path</th>
          <td colspan="2">
            <select v-model='iaRootPath'>
              <option v-for="type in drive" :key="type" :value="type">{{ type }}</option>
            </select>
          </td>
        </tr>
        <tr>
          <th>NS/NB Integration</th>
          <td>
            <font-awesome-icon
                :icon="isNsNbIntegration ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
                class="iconSize"
                @click="toggleNsNbIntegration"
            />
          </td>
        </tr>
        <tr>
          <th>Alarm Timer (sec)</th>
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
        <tr v-if="projectType === 'pb'">
          <th>Keep Page</th>
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
      </template>
      <table class="settingTable auto">
        <colgroup>
          <col width="90">
          <col width="10">
        </colgroup>
        <tbody>
        <tr>
          <th>Download Save Path</th>
          <td colspan="2">
            <select v-model='backupRootPath' class="autoBackUpPath">
              <option v-for="type in backupDrive" :key="type" :value="type">{{ type }}</option>
            </select>
          </td>
        </tr>
        <tr>
          <th>Download and Upload</th>
          <td>
            <div class="backupDatePickers">
              <Datepicker v-model="backupStartDate"></Datepicker>
              <Datepicker v-model="backupEndDate"></Datepicker>
              <button class="backupBtn" @click="createBackup">Download</button>
            </div>
          </td>
        </tr>
        <tr>
          <th>Upload</th>
          <td class="uploadButton">
            <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
            <button class="restoreBtn" @click="handleFileSelect">Upload</button>
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
      <button v-if="viewerCheck !== 'viewer'" class="saveBtn mb2" type="button" @click='cellImgSet()'>Save</button>
    </div>


  <div v-if="showRestoreModal" :class="impossibleRestoreCount === 0 ? 'restoreModalSmall' : 'restoreModal'">
    <p v-if="impossibleRestoreCount === 0" class="fs12" style="top: 0;">Would you like to Restore?</p>
    <pre v-else-if="impossibleRestoreCount > 0"
        class="fs12"
    >
      There are <span style="color: red;">duplicated</span> items
    </pre>
    <div :class="impossibleRestoreCount === 0 && 'restoreModalCountWrapperSmall'">
      <p>Non-duplicated Count: {{ possibleRestoreCount }}</p>
      <p>Duplicated Count: {{ impossibleRestoreCount }}</p>
    </div>
    <div v-if="impossibleRestoreCount > 0" class="restoreDuplicatedSlotContainer">
      <p style="color: black;">Duplicated Barcode Numbers</p>
      <ul class="restoreDuplicatedSlotWrapper">
          <li class="userSelectText" v-for="barcodeNo in restoreSlotIdObj?.duplicated" :key="barcodeNo">
            {{ barcodeNo }}
          </li>
      </ul>
    </div>
    <div class="restoreModalBtnContainer">
      <button v-show="impossibleRestoreCount === 0" class="memoModalBtn" @click="restoreConfirm">RESTORE</button>
      <button class="memoModalBtn" @click="restoreCancel">{{ impossibleRestoreCount === 0 ? 'Cancel' : 'Close' }}</button>
    </div>
  </div>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :message="confirmMessage"
      confirmText="save"
      closeText="leave"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />

  <ConfirmThreeBtn
      v-if="showBackupConfirm"
      :is-visible="showBackupConfirm"
      :message="backupConfirmMessage"
      confirmText="move"
      confirmText2="copy"
      closeText="close"
      @hide="handleBackupClose"
      @okConfirm="handleBackupMove"
      @okConfirm2="handleBackupCopy"
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

import { computed, nextTick, onMounted, ref, watch } from "vue";
import {
  AnalysisList,
  PositionMarginList, stitchCountList,
  testTypeList,
  WbcPositionMarginList,
  testBmTypeList, bmAnalysisList, settingName
} from "@/common/defines/constFile/settings";
import Alert from "@/components/commonUi/Alert.vue";
import {useStore} from "vuex";
import {messages} from "@/common/defines/constFile/constantMessageText";
import moment from "moment";
import {backUpDate, backupPossibleApi, checkDuplicatedData, restoreBackup} from "@/common/api/service/backup/wbcApi";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useRouter} from "vue-router";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";

const store = useStore();
const router = useRouter();
const showAlert = ref(false);
const alertType = ref('');
const showRestoreModal = ref(false);

const alertMessage = ref('');
const analysisVal = ref<any>([]);
const testTypeCd = ref('01');
const diffCellAnalyzingCount = ref('100');
const wbcPositionMargin = ref('0');
const rbcPositionMargin = ref('0');
const pltPositionMargin = ref('0');
const pbsCellAnalyzingCount = ref('100');
const stitchCount = ref('1');
const bfCellAnalyzingCount = ref('100');
const iaRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc');
const backupRootPath = ref(window.PROJECT_TYPE === 'bm' ? 'D:\\BM_backup' : 'D:\\PB_backup');
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
const fileInput = ref<any>(null);
const restoreSlotIdObj = ref({duplicated: [], nonDuplicated: []});
const selectedFileName = ref('');
const possibleRestoreCount = computed(() => restoreSlotIdObj.value?.nonDuplicated && restoreSlotIdObj.value?.nonDuplicated.length);
const impossibleRestoreCount = computed(() => restoreSlotIdObj.value?.duplicated && restoreSlotIdObj.value?.duplicated.length);
const showConfirm = ref(false);
const confirmMessage = ref('');
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const settingType = computed(() => store.state.commonModule.settingType);
const isRestoring = ref(false);
const isBackuping = ref(false);
const showBackupConfirm = ref(false);
const backupConfirmMessage = ref('');
const backupDto = ref<any>({});


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
  pltPositionMargin, pbsCellAnalyzingCount, stitchCount, bfCellAnalyzingCount, iaRootPath, backupRootPath, isNsNbIntegration, isAlarm, alarmCount, keepPage, backupStartDate, backupEndDate], async () => {
  const cellAfterSettingObj = {
    id: cellimgId.value,
    analysisType: testTypeCd.value,
    diffCellAnalyzingCount: diffCellAnalyzingCount.value,
    diffWbcPositionMargin: wbcPositionMargin.value,
    diffRbcPositionMargin: rbcPositionMargin.value,
    diffPltPositionMargin: pltPositionMargin.value,
    pbsCellAnalyzingCount: pbsCellAnalyzingCount.value,
    stitchCount: stitchCount.value,
    bfCellAnalyzingCount: bfCellAnalyzingCount.value,
    iaRootPath: iaRootPath.value,
    isNsNbIntegration: isNsNbIntegration.value,
    isAlarm: isAlarm.value,
    alarmCount: alarmCount.value,
    keepPage: keepPage.value,
    backupPath: backupRootPath.value,
    backupStartDate: moment(backupStartDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0],
    backupEndDate: moment(backupEndDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0],
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

const createBackup = async () => {
  if (backupRootPath.value === ''){
    showErrorAlert('Please select a backup save path');
    return
  }

  const sendingBackupStartDate = moment(backupStartDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0];
  const sendingBackupEndDate = moment(backupEndDate.value).add(1, 'day').local().toDate().toISOString().split('T')[0];

  const beforeSetting = JSON.parse(beforeSettingFormattedString.value);
  beforeSetting.backupStartDate = sendingBackupStartDate;
  beforeSetting.backupEndDate = sendingBackupEndDate;
  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(beforeSetting) });

  if (!moment(sendingBackupStartDate).isSameOrBefore(sendingBackupEndDate)) {
    showErrorAlert('Please check the date');
    return
  }


  backupDto.value = {
    startDate: sendingBackupStartDate, // 백업 시작일
    endDate: sendingBackupEndDate, // 백업 종료일
    backupPath: backupRootPath.value, // 백업 경로
    sourceFolderPath: `${iaRootPath.value}` //이미지가 있는 경로 옮겨져야 하는 폴더 위치
  };
  try {
    isBackuping.value = true;
    const isPossibleToBackup = await backupPossibleApi(backupDto.value);
    if (isPossibleToBackup.data) {
      showBackupConfirm.value = true;
      backupConfirmMessage.value = `Would you move or copy files`;
    } else {
      showErrorAlert('The download file for the specified date already exists');
    }
    isBackuping.value = false;
  } catch (e) {
    console.log(e);
    isBackuping.value = false;
  }
}

const handleFileSelect = () => {
  setTimeout(() => {
    fileInput.value.click();
  }, 100)
  fileInput.value.value = null;
}

const handleFileChange = async (event: any) => {
  await restoreBackupData(event);
}

const restoreBackupData = async (event: any) => {
  const fileName = event.target.files[0]?.name;
  if (!fileName || !fileName.includes('.sql')) {
    showErrorAlert('File type is not supported.')
    return;
  }
  selectedFileName.value = fileName;

  try {
    isRestoring.value = true;
    const result: any = await checkDuplicatedData({ fileName: fileName, saveFilePath: iaRootPath.value, backupFilePath: backupRootPath.value });

    if (typeof result.data === 'string') {
      showErrorAlert(result.data);
    } else {
      showRestoreModal.value = true;
      restoreSlotIdObj.value = result.data;
    }
  } catch (e) {
    console.log(e);
  } finally {
    isRestoring.value = false;
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
        const backupPlace = window.PROJECT_TYPE === 'bm' ? 'BM_backup' : 'PB_backup';
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
        iaRootPath.value = data.iaRootPath;
        backupRootPath.value = data.backupPath || (window.PROJECT_TYPE === 'bm' ? 'D:\\BM_backup' : 'D:\\PB_backup');
        isNsNbIntegration.value = data.isNsNbIntegration;
        isAlarm.value = data.isAlarm;
        alarmCount.value = data.alarmCount;
        keepPage.value = data.keepPage;
        backupStartDate.value = moment(data.backupStartDate).local().toDate();
        backupEndDate.value = moment(data.backupEndDate).local().toDate();
        autoBackUpMonth.value = data?.autoBackUpMonth;

        const cellBeforeSettingObj = {
          id: cellimgId.value,
          analysisType: data.analysisType,
          diffCellAnalyzingCount: data.diffCellAnalyzingCount,
          diffWbcPositionMargin: data.diffWbcPositionMargin,
          diffRbcPositionMargin: data.diffRbcPositionMargin,
          diffPltPositionMargin: data.diffPltPositionMargin,
          pbsCellAnalyzingCount: data.pbsCellAnalyzingCount,
          stitchCount: data.stitchCount,
          bfCellAnalyzingCount: data.bfCellAnalyzingCount,
          iaRootPath: data.iaRootPath,
          isNsNbIntegration: data.isNsNbIntegration,
          isAlarm: data.isAlarm,
          alarmCount: data.alarmCount,
          keepPage: data.keepPage,
          backupPath: data.backupPath || (window.PROJECT_TYPE === 'bm' ? 'D:\\BM_backup' : 'D:\\PB_backup'),
          backupStartDate: moment(data.backupStartDate).add(1, 'day').local().toDate().toISOString().split('T')[0],
          backupEndDate: moment(data.backupEndDate).add(1, 'day').local().toDate().toISOString().split('T')[0],
        }

        await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(cellBeforeSettingObj) });
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
    stitchCount: stitchCount.value,
    bfCellAnalyzingCount: bfCellAnalyzingCount.value,
    iaRootPath: iaRootPath.value,
    isNsNbIntegration: isNsNbIntegration.value,
    isAlarm: isAlarm.value,
    alarmCount: alarmCount.value,
    keepPage: keepPage.value,
    backupPath: backupRootPath.value,
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
      sessionStorage.setItem('iaRootPath', data?.iaRootPath);
      sessionStorage.setItem('keepPage', String(data?.keepPage));
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

const restoreConfirm = async () => {
  showRestoreModal.value = false;
  try {
    isRestoring.value = true;
    const day = localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate , page, searchText, nrCount, testType, wbcInfo, wbcTotal}  = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const result = await restoreBackup({ fileName: selectedFileName.value, saveFilePath: iaRootPath.value, backupFilePath: backupRootPath.value, dayQuery });

    if (typeof result.data === 'string') {
      showErrorAlert(result.data);
    } else {
      showSuccessAlert('Restoration completed successfully');
    }
  } catch (e) {
    console.log(e);
  } finally {
    isRestoring.value = false;
  }
}

const restoreCancel = async () => {
  showRestoreModal.value = false;
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

const handleBackupClose = () => {
  showBackupConfirm.value = false;
}

const handleBackupMove = async () => {
  showBackupConfirm.value = false;
  isBackuping.value = true;
  const day = localStorage.getItem('lastSearchParams') || '';
  const {startDate, endDate , page, searchText, nrCount, testType, wbcInfo, wbcTotal}  = JSON.parse(day);
  const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
  backupDto.value['dayQuery'] = dayQuery;
  backupDto.value['method'] = 'move';
  try {
    await backUpDate(backupDto.value);
    await showSuccessAlert('Download Success')
  } catch (e) {
    console.log(e);
  }
  isBackuping.value = false;
}

const handleBackupCopy = async () => {
  showBackupConfirm.value = false;
  isBackuping.value = true;
  const day = localStorage.getItem('lastSearchParams') || '';
  const {startDate, endDate , page, searchText, nrCount, testType, wbcInfo, wbcTotal}  = JSON.parse(day);
  const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
  backupDto.value['dayQuery'] = dayQuery;
  backupDto.value['method'] = 'copy';
  try {
    await backUpDate(backupDto.value);
    await showSuccessAlert('Download Success')
  } catch (e) {
    console.log(e);
  }
  isBackuping.value = false;
}

</script>
