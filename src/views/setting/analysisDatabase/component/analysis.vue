<template>
  <div class="flex-center">
    <div class="cellImgAnalyzed-container">
      <div class="analysis-preset-wrapper">
        <div
            v-for="num in [1, 2, 3]"
            :key="num"
            @click="handlePresetChange(String(num))"
        >
          <Button :isActive="String(currentPresetNm) === String(num)">
            {{ num }}
          </Button>
        </div>
      </div>
      <table class="settingTable">
        <tbody>
        <tr>
          <th class="analysis-setting-subTitle">Analysis Type</th>
          <td colspan="2">
            <select v-model="cellInfo.analysisType">
              <option v-for="type in testTypeArr" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <!-- WBC / BM Diff Analysis -->
        <tr v-if="projectType === 'bm' || (projectType === 'pb' && cellInfo.analysisType === '01')">
          <th>{{ projectType === 'pb' ? 'WBC' : 'BM' }} Diff Analysis Values</th>
          <th>Cell Analyzing Count</th>
          <td>
            <select v-model="cellInfo.diffCellAnalyzingCount">
              <option v-for="type in analysisVal" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <!-- PBS Analysis -->
        <tr v-if="projectType === 'pb' && cellInfo.analysisType === '04'">
          <th rowspan="2">PBS Analysis Values</th>
          <th>Cell Analyzing Count</th>
          <td>
            <select v-model="cellInfo.pbsCellAnalyzingCount">
              <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="projectType === 'pb' && cellInfo.analysisType === '04'">
          <th>RBC Field</th>
          <td>
            <select v-model="cellInfo.stitchCount">
              <option v-for="type in stitchCountList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <!-- Edge Shot Type -->
        <tr v-if="projectType === 'pb' && cellInfo.analysisType === '04'">
          <th class="pos-relative">
            <font-awesome-icon :icon="['fas', 'circle-info']"
                               class="iconHover-position"
                               @mouseover="() => informationFontHover('edgeShotType', 'hover')"
                               @mouseout="informationFontHover('edgeShotType', 'leave')"
            />

            <Transition>
              <div v-if="showTutorialImage.edgeShotType" class="tutorial-edgeShotType-container">
                <img :src="smearTop" width="400"/>
              </div>
            </Transition>
            Edge Shot Type
          </th>
          <td colspan="2">
            <select v-model="cellInfo.edgeShotType">
              <option v-for="type in edgeShotTypeList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <!-- Edge Shot Count -->
        <tr v-if="projectType === 'pb' && machineVersion === '100a' && ['2', '3'].includes(cellInfo.edgeShotType)">
          <th class="pos-relative">Edge Shot Count</th>
          <td>
            <select v-if="cellInfo.edgeShotType === '2'" v-model="cellInfo.edgeShotLPCount">
              <option v-for="type in EDGE_SHOT_COUNT_LIST_LP" :key="type.value" :value="type.value">{{
                  type.text
                }}
              </option>
            </select>
            <select v-if="cellInfo.edgeShotType === '3'" v-model="cellInfo.edgeShotHPCount">
              <option v-for="type in EDGE_SHOT_COUNT_LIST_HP" :key="type.value" :value="type.value">{{
                  type.text
                }}
              </option>
            </select>
          </td>
        </tr>

        <!-- BF Analysis -->
        <tr v-if="projectType === 'pb'">
          <th>BF Analysis Values</th>
          <th>Cell Analyzing Count</th>
          <td>
            <select v-model="cellInfo.bfCellAnalyzingCount">
              <option v-for="type in AnalysisList" :key="type.value" :value="type.value">{{ type.text }}</option>
            </select>
          </td>
        </tr>

        <!-- Common Analysis -->
        <tr v-if="projectType === 'pb' && ['01', '04'].includes(cellInfo.analysisType)">
          <th :rowspan="pbsAnalysisValuesRowIndex(cellInfo.analysisType)" class="pos-relative">
            <font-awesome-icon :icon="['fas', 'circle-info']"
                               class="iconHover-position"
                               @mouseover="() => informationFontHover('positionMargin', 'hover')"
                               @mouseout="informationFontHover('positionMargin', 'leave')"
            />
            <Transition>
              <div v-show="showTutorialImage.positionMargin" class="tutorial-positionMargin-container">
                <img :src="commonPositionMargin" width="140"/>
              </div>
            </Transition>
            Common
          </th>
          <th>WBC Position Margin</th>
          <td>
            <select v-model="cellInfo.diffWbcPositionMargin">
              <option v-for="type in POSITION_MARGIN_LIST" :key="type.value" :value="type.value">{{
                  type.text
                }}
              </option>
            </select>
          </td>
        </tr>
        <tr v-if="projectType === 'pb' && cellInfo.analysisType === '04'">
          <th>RBC Position Margin</th>
          <td>
            <select v-model="cellInfo.diffRbcPositionMargin">
              <option v-for="type in POSITION_MARGIN_LIST" :key="type.value" :value="type.value">{{
                  type.text
                }}
              </option>
            </select>
          </td>
        </tr>
        <tr v-if="projectType === 'pb' && cellInfo.analysisType === '04'">
          <th>Edge Position Margin</th>
          <td>
            <select v-model="cellInfo.diffPltPositionMargin">
              <option v-for="type in POSITION_MARGIN_LIST" :key="type.value" :value="type.value">{{
                  type.text
                }}
              </option>
            </select>
          </td>
        </tr>

        <!-- IA Root Path -->
        <tr>
          <th class="pos-relative" colspan="1">
            <font-awesome-icon :icon="['fas', 'circle-info']"
                               class="iconHover-position"
                               @mouseover="tooltipVisibleFunc('iaRootPath', true)"
                               @mouseout="tooltipVisibleFunc('iaRootPath', false)"
            />
            <Tooltip :isVisible="tooltipVisible.iaRootPath" position="top" :message="MSG.TOOLTIP.IA_ROOT_PATH"/>
            IA Root Path
          </th>
          <td colspan="2">
            <select v-model="cellInfo.iaRootPath" disabled>
              <option v-for="type in drive" :key="type" :value="type">{{ type }}</option>
            </select>
          </td>
        </tr>

        <tr>
          <th class="pos-relative">
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                class="iconHover-position"
                @mouseover="tooltipVisibleFunc('nsNbIntegration', true)"
                @mouseout="tooltipVisibleFunc('nsNbIntegration', false)"
            />
            <Tooltip :isVisible="tooltipVisible.nsNbIntegration" position="top" :message="MSG.TOOLTIP.NS_NB_INTEGRATION"/>
            NS/NB Integration
          </th>
          <td>
            <Toggle @click="toggleNsNbIntegration" :isToggleOn="cellInfo.isNsNbIntegration" />
          </td>
        </tr>
        </tbody>
      </table>

      <Button @click='cellImgSet()' class="setting-saveBtn">Save</Button>
    </div>
  </div>

  <ConfirmThreeBtn
      v-if="showConfirm"
      :is-visible="showConfirm"
      :message="confirmMessage"
      :confirmFirstText="MESSAGES.SAVE"
      :confirmSecondText="MESSAGES.LEAVE"
      :closeText="MESSAGES.CANCEL"
      @hide="closeConfirm"
      @okConfirm="handleOkConfirm"
      @okConfirm2="hideConfirm"
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
  deleteCellImgApi, getCellImgAllApi,
  getCellImgApi,
  getDrivesApi,
  putCellImgApi
} from "@/common/api/service/setting/settingApi";
import {computed, nextTick, onMounted, ref, watch, getCurrentInstance, onBeforeMount} from "vue";
import {useStore} from "vuex";
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
import Confirm from "@/components/commonUi/Confirm.vue";
import {useRouter} from "vue-router";
import commonPositionMargin from "@/assets/images/commonMargin.png";
import smearTop from "@/assets/images/smearTop.png";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {CellImageAnalyzedType} from "@/common/type/tooltipType";
import {scrollToTop} from "@/common/lib/utils/scroll";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import {CellImgAnalyzedResponse} from "@/common/api/service/setting/dto/cellImgAnalyzedDto";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {defaultCellImgData} from "@/common/helpers/common/setting";
import Button from "@/components/commonUi/Button.vue";
import {useToast} from "@/common/lib/utils/toast";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";
import Toggle from "@/components/commonUi/Toggle.vue";

const instance = getCurrentInstance();
const store = useStore();
const router = useRouter();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const analysisVal = ref<any>([]);
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
const showConfirm = ref(false);
const confirmType = ref('setting');
const confirmMessage = ref('');
const siteCd = computed(() => store.state.commonModule.siteCd);
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);
const beforeSettingFormattedString= computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const saveHttpType = ref('');
const showTutorialImage = ref({
  edgeShotType: false,
  positionMargin: false,
})
const currentPresetNm = ref('1');
const movingPresetNm = ref('1');
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
const allCellInfo = ref<{ serverData: CellImgAnalyzedResponse[], clientData: CellImgAnalyzedResponse[] }>({
  serverData: [],
  clientData: [],
});
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
  edgeShotLPCount: '1',
  edgeShotHPCount: '3',
  iaRootPath: window.PROJECT_TYPE === 'bm' ? 'D:\\BMIA_proc' : 'D:\\PBIA_proc',
  isNsNbIntegration: false,
  autoBackUpMonth: 'Not selected',
  presetChecked: false,
})
const { toastInfo, showToast } = useToast();

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

  await cellImgGet();
  await driveGet();
  await cellImgGetAll();

  setInitialPresetName();
});

watch(cellInfo.value, async () => {
  if (isObjectEmpty(allCellInfo.value?.clientData)) {
    return;
  }

  const requestAllCellInfo = allCellInfo.value.clientData.map((item) => {
    if (String(item.id) === String(cellInfo.value.id)) {
      return {...item, ...cellInfo.value, edgeShotType: Number(cellInfo.value.edgeShotType)};
    } else {
      return {...item};
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
  confirmMessage.value = MESSAGES.settingNotSaved;
}

const handlePresetChange = (presetNm: string) => {
  if (beforeSettingFormattedString.value !== afterSettingFormattedString.value) {
    movingPresetNm.value = presetNm;
    checkIsMovingWhenSettingNotSaved();
    return;
  }

  currentPresetNm.value = presetNm;
  movingPresetNm.value = presetNm;

  if (allCellInfo.value.clientData.length < 3) {
    const {
      testTypeCd, diffCellAnalyzingCount, diffWbcPositionMargin, diffRbcPositionMargin,
      diffPltPositionMargin, pbsCellAnalyzingCount, stitchCount, edgeShotType,
      edgeShotLPCount, edgeShotHPCount, bfCellAnalyzingCount, iaRootPath,
      backupPath, backupStartDate, backupEndDate
    } = defaultCellImgData;

    const cellImgSet = {
      analysisType: testTypeCd,
      diffCellAnalyzingCount,
      diffWbcPositionMargin,
      diffRbcPositionMargin,
      diffPltPositionMargin,
      pbsCellAnalyzingCount,
      stitchCount,
      edgeShotType,
      edgeShotLPCount,
      edgeShotHPCount,
      bfCellAnalyzingCount,
      iaRootPath,
      backupPath,
      backupStartDate: backupStartDate.toISOString().split('T')[0],
      backupEndDate: backupEndDate.toISOString().split('T')[0],
      autoBackUpMonth: 'Not selected',
      autoBackUpStartDate: null,
    };

    allCellInfo.value.clientData.push(cellImgSet);

  }

  const selectedIndex = Number(presetNm) - 1;
  const selectedCellInfo = allCellInfo.value.clientData[selectedIndex];

  if (selectedCellInfo) {
    Object.assign(cellInfo.value, {
      ...selectedCellInfo,
      edgeShotType: String(selectedCellInfo?.edgeShotType),
      edgeShotLPCount: String(selectedCellInfo?.edgeShotLPCount),
      edgeShotHPCount: String(selectedCellInfo?.edgeShotHPCount),
    })
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

        cellInfo.value.id = data.id;
        cellInfo.value.analysisType = data.analysisType;
        cellInfo.value.diffCellAnalyzingCount = data.diffCellAnalyzingCount;
        cellInfo.value.diffWbcPositionMargin = data.diffWbcPositionMargin;
        cellInfo.value.diffRbcPositionMargin = data.diffRbcPositionMargin;
        cellInfo.value.diffPltPositionMargin = data.diffPltPositionMargin;
        cellInfo.value.pbsCellAnalyzingCount = data.pbsCellAnalyzingCount;
        cellInfo.value.stitchCount = data.stitchCount;
        cellInfo.value.bfCellAnalyzingCount = data.bfCellAnalyzingCount;
        cellInfo.value.edgeShotType = String(data?.edgeShotType);
        cellInfo.value.edgeShotLPCount = String(data?.edgeShotLPCount);
        cellInfo.value.edgeShotHPCount = String(data?.edgeShotHPCount);
        cellInfo.value.iaRootPath = data.iaRootPath;
        cellInfo.value.presetChecked = data?.presetChecked;
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
      }
    }

    showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
    await cellImgGetAll();
    handleChangeCellId(Number(allCellInfo.value.clientData[Number(currentPresetNm.value) - 1].id));
    scrollToTop();
    const data = allCellInfo.value.serverData.filter((item) => String(item.id) === String(cellInfo.value.id))[0];
    await store.dispatch('commonModule/setCommonInfo', {isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N'});

    // 공통으로 사용되는 부분 세션스토리지 저장 새로고침시에도 가지고 있어야하는부분
    sessionStorage.setItem('isNsNbIntegration', data.isNsNbIntegration ? 'Y' : 'N');
    sessionStorage.setItem('wbcPositionMargin', data?.diffWbcPositionMargin);
    sessionStorage.setItem('rbcPositionMargin', data?.diffRbcPositionMargin);
    sessionStorage.setItem('pltPositionMargin', data?.diffPltPositionMargin);
    sessionStorage.setItem('edgeShotType', String(data?.edgeShotType));
    sessionStorage.setItem('edgeShotLPCount', String(data?.edgeShotLPCount));
    sessionStorage.setItem('edgeShotHPCount', String(data?.edgeShotHPCount));
    sessionStorage.setItem('iaRootPath', data?.iaRootPath);
    await store.dispatch('commonModule/setCommonInfo', {resetAnalyzing: true});
    await store.dispatch('commonModule/setCommonInfo', {showLISUploadAfterCheckingAll: data?.lisUploadCheckAll});
  } catch (e) {
    console.error(e);
    showToast(MSG.TOAST.UPDATE_FAIL, MESSAGES.TOAST_MSG_ERROR);
  }
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

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
  currentPresetNm.value = movingPresetNm.value;
  handlePresetChange(movingPresetNm.value);
}

const closeConfirm = () => {
  showConfirm.value = false;
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

const tooltipVisibleFunc = (type: keyof CellImageAnalyzedType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}

const pbsAnalysisValuesRowIndex = (analysisType: string) => {
  if (analysisType === '01') return 1;
  if (analysisType === '04') return 3;
  return 3;
}

const handleChangeCellId = (cellId: number) => {
  if (!isObjectEmpty(allCellInfo.value)) {
    return;
  }

  const selectedCellInfo = allCellInfo.value.clientData.find((item) => String(item?.id) === String(cellId));
  if (selectedCellInfo) {
    Object.assign(cellInfo.value, selectedCellInfo, {
      id: String(selectedCellInfo?.id),
      edgeShotType: String(selectedCellInfo?.edgeShotType),
      edgeShotLPCount: String(selectedCellInfo?.edgeShotLPCount),
      edgeShotHPCount: String(selectedCellInfo?.edgeShotHPCount),
    });
  }
}

const deleteCellImg = async () => {
  try {
    await deleteCellImgApi({id: String(cellInfo.value.id)});
    await cellImgGetAll();
    handleChangeCellId(Number(allCellInfo.value.clientData[0].id));
    showToast(MSG.TOAST.DELETE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
  } catch (error) {
    console.error(error);
    showToast(MSG.TOAST.DELETE_FAILED, MESSAGES.TOAST_MSG_ERROR);
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

const setInitialPresetName = () => {
  const currentPresetIndex = allCellInfo.value.clientData.findIndex(item => item.presetChecked);
  currentPresetNm.value = currentPresetIndex === -1 ? '1' : String(currentPresetIndex + 1);
}

const toggleNsNbIntegration = () => {
  cellInfo.value.isNsNbIntegration = !cellInfo.value.isNsNbIntegration;
};

</script>
