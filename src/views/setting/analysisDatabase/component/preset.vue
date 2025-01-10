<template>
  <div class="alignDiv">
    <div class="presetButtonGroup-container">
      <div v-for="(cellId, cellIdIndex) in cellIdArr"
           :key="cellId"
           class="preset-container">
        <div class="preset-item">
          <input
              :id="String(cellId)"
              type="radio"
              name="cellIdGroup"
              :checked="cellIdIndex === 0"
              @click="handleChangeCellId(cellId)" />
          <label :for="String(cellId)">{{ cellIdIndex + 1 }}</label>
        </div>
        <button
            class="delete-preset-btn"
            @click.stop="handleDeletePreset(cellId)"
            v-if="cellIdArr.length > 1">×</button>
      </div>
      <button v-if="cellIdArr.length < 5" class="add-preset-btn" @click="handleCreatePreset">+</button>
    </div>
  </div>

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
    </tbody>
  </table>

  <div class="mt10">
    <button class="saveBtn" type="button" @click="cellImgUpdate">Save</button>
  </div>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      type="setting"
      :message="confirmMessage"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
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
import {computed, onBeforeMount, onMounted, ref, watch} from "vue";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {
  createCellImgApi, deleteCellImgApi,
  getCellImgAllApi,
  getCellImgApi,
  putCellImgApi
} from "@/common/api/service/setting/settingApi";
import moment from "moment/moment";
import {
  AnalysisList, bmAnalysisList, EDGE_SHOT_COUNT_LIST_HP,
  EDGE_SHOT_COUNT_LIST_LP,
  edgeShotTypeList,
  stitchCountList, testBmTypeList, testTypeList
} from "@/common/defines/constants/settings";
import smearTop from "@/assets/images/smearTop.png";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import { CellImgAnalyzedResponse } from "@/common/api/service/setting/dto/cellImgAnalyzedDto";
import {scrollToTop} from "@/common/lib/utils/scroll";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";

const store = useStore();
const router = useRouter();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const currentPresetId = ref(1);
const analysisVal = ref<any>([]);
const testTypeArr = ref<any>([]);
const cellIdArr = ref<number[]>([]);
const allCellInfo = ref<CellImgAnalyzedResponse[]>([]);
const projectType = ref('pb');
const machineVersion = ref<'12a' | '100a'>('12a');
const showTutorialImage = ref({
  edgeShotType: false,
  positionMargin: false,
})
const cellInfo = ref({
  cellImgId: '',
  testTypeCd: '01',
  diffCellAnalyzingCount: '100',
  pbsCellAnalyzingCount: '100',
  stitchCount: '1',
  edgeShotType: '0',
  edgeShotCount: {
    LP: '1',
    HP: '3',
  }
})
const toastInfo = ref({
  message: '',
  messageType: MESSAGES.TOAST_MSG_SUCCESS,
})

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
  machineVersion.value = window.MACHINE_VERSION;
})

onMounted(async () => {
  cellInfo.value.testTypeCd = window.PROJECT_TYPE === 'bm' ? '02' : '01';
  testTypeArr.value = window.PROJECT_TYPE === 'bm' ? testBmTypeList : testTypeList;
  analysisVal.value = window.PROJECT_TYPE === 'bm' ? bmAnalysisList : AnalysisList;
  await cellImgGet();
  await cellImgGetAll();
});

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

const cellImgGet = async () => {
  try {
    const result = await getCellImgApi();
    if (result && result.data) {
      console.log('data', result.data);
      const data = result.data;

      cellInfo.value.cellImgId = String(data.id);
      cellInfo.value.testTypeCd = data.analysisType;
      cellInfo.value.diffCellAnalyzingCount = data.diffCellAnalyzingCount;
      cellInfo.value.pbsCellAnalyzingCount = data.pbsCellAnalyzingCount;
      cellInfo.value.stitchCount = data.stitchCount;
      cellInfo.value.edgeShotType = String(data?.edgeShotType);
      cellInfo.value.edgeShotCount.LP = String(data?.edgeShotLPCount);
      cellInfo.value.edgeShotCount.HP = String(data?.edgeShotHPCount);


      const cellBeforeSettingObj = {
        id: cellInfo.value.cellImgId,
        analysisType: data?.analysisType,
        diffCellAnalyzingCount: data?.diffCellAnalyzingCount,
        pbsCellAnalyzingCount: data?.pbsCellAnalyzingCount,
        stitchCount: data?.stitchCount,
        edgeShotType: data?.edgeShotType,
        edgeShotLPCount: data?.edgeShotLPCount,
        edgeShotHPCount: data?.edgeShotHPCount,
      }

      sessionStorage.setItem('isAlarm', String(data?.isAlarm));
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(cellBeforeSettingObj) });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(cellBeforeSettingObj) });
    }
  } catch (e) {

    console.error(e);
  }
}

const cellImgUpdate = async () => {
  const request = { ...cellInfo.value, presetChecked: true };
  const presetCheckedItems = allCellInfo.value.filter((item: any) => item.presetChecked);
  try {
    for (const presetCheckedItem of presetCheckedItems) {
      const fixedRequest = { ...presetCheckedItem, presetChecked: false };
      await putCellImgApi(fixedRequest, String(presetCheckedItem.id));
    }
    const result = await putCellImgApi(request, cellInfo.value.cellImgId);

    toastInfo.value.messageType = MESSAGES.TOAST_MSG_SUCCESS;
    showToast(MSG.TOAST.UPDATE_SUCCESS);
    await cellImgGetAll();
  } catch (error) {
    console.error(error);
    toastInfo.value.messageType = MESSAGES.TOAST_MSG_SUCCESS;
    showToast(MSG.TOAST.UPDATE_FAIL);
  }
  scrollToTop();
}

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

const pbsAnalysisValuesRowIndex = () => {
  if (projectType.value !== 'pb') return 2;
  if (machineVersion.value === '100a' && (cellInfo.value.edgeShotType === '2' || cellInfo.value.edgeShotType === '3')) return 4;
  if (machineVersion.value === '100a') return 3;
  if (machineVersion.value === '12a') return 3;
  return 3;
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
    await cellImgGetAll();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

const handleChangeCellId = (cellId: number) => {
  const selectedCellInfo = allCellInfo.value.filter((item) => item.id === cellId)[0];
  if (selectedCellInfo) {
    cellInfo.value.cellImgId = String(selectedCellInfo.id);
    cellInfo.value.testTypeCd = selectedCellInfo.analysisType;
    cellInfo.value.diffCellAnalyzingCount = selectedCellInfo.diffCellAnalyzingCount;
    cellInfo.value.pbsCellAnalyzingCount = selectedCellInfo.pbsCellAnalyzingCount;
    cellInfo.value.stitchCount = selectedCellInfo.stitchCount;
    cellInfo.value.edgeShotType = String(selectedCellInfo?.edgeShotType);
    cellInfo.value.edgeShotCount.LP = String(selectedCellInfo?.edgeShotLPCount);
    cellInfo.value.edgeShotCount.HP = String(selectedCellInfo?.edgeShotHPCount);
  }
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
  showConfirm.value = false;
}

const showToast = (message: string) => {
  toastInfo.value.message = message;
  setTimeout(() => {
    toastInfo.value.message = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};

</script>