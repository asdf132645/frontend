<template>
  <div class="flex-center">
    <div class="cellImgAnalyzed-container">
      <table class="settingTable">
        <tbody>
        <tr v-if="viewerCheck !== 'viewer'">
          <th class="pos-relative">
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                class="iconHover-position"
                @mouseover="tooltipVisibleFunc('alarm', true)"
                @mouseout="tooltipVisibleFunc('alarm', false)"
            />
            <Tooltip :isVisible="tooltipVisible.alarm" position="top" :message="MSG.TOOLTIP.ALARM"/>
            Alarm Timer (sec)
          </th>
          <td>
            <Toggle @click="toggleAlarm" :isToggleOn="cellInfo.isAlarm" />
          </td>
          <td>
            <input type="text" v-model='cellInfo.alarmCount' class="alarmInput" @input="filterNumbersOnly($event)">
          </td>
        </tr>
        <tr>
          <th class="pos-relative">
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                class="iconHover-position cursorPointer"
                @mouseover="tooltipVisibleFunc('keepPage', true)"
                @mouseout="tooltipVisibleFunc('keepPage', false)"
            />
            <Tooltip :isVisible="tooltipVisible.keepPage" position="top" :message="MSG.TOOLTIP.KEEP_PAGE"/>
            Keep left Tab
          </th>
          <td>
            <Toggle @click="toggleKeepPage" :isToggleOn="cellInfo.keepPage" />
          </td>
        </tr>
        <tr>
          <th class="pos-relative">
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                class="iconHover-position"
                @mouseover="tooltipVisibleFunc('lisUploadCheckAll', true)"
                @mouseout="tooltipVisibleFunc('lisUploadCheckAll', false)"
            />
            <Tooltip :isVisible="tooltipVisible.lisUploadCheckAll" position="top"
                     :message="MSG.TOOLTIP.LIS_UPLOAD_CHECK"/>
            Verify cells for upload
          </th>
          <td>
            <Toggle @click="toggleLisUploadCheckAll" :isToggleOn="cellInfo.lisUploadCheckAll" />
          </td>
        </tr>
        <tr>
          <th class="pos-relative">
            <font-awesome-icon
                :icon="['fas', 'circle-info']"
                class="iconHover-position"
                @mouseover="tooltipVisibleFunc('lisAutoNextPage', true)"
                @mouseout="tooltipVisibleFunc('lisAutoNextPage', false)"
            />
            <Tooltip :isVisible="tooltipVisible.lisAutoNextPage" position="top"
                     :message="MSG.TOOLTIP.MOVE_PAGE_AFTER_LIS"/>
            Auto move to the next slide data
          </th>
          <td>
            <Toggle @click="toggleLisAutoNextPage" :isToggleOn="cellInfo.lisAutoNextPage" />
          </td>
        </tr>
        <tr v-if="viewerCheck !== 'viewer'">
          <th>Auto Start</th>
          <td>
            <Toggle @click="toggleAutoStart" :isToggleOn="autoStart" />
          </td>
        </tr>
        </tbody>
      </table>

      <Button @click="cellImgSet()" class="setting-saveBtn">Save</Button>
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
  createCellImgApi,
  deleteCellImgApi, getCellImgAllApi,
  getCellImgApi,
  getDrivesApi,
  putCellImgApi
} from "@/common/api/service/setting/settingApi";
import {computed, nextTick, onMounted, ref, watch, getCurrentInstance, onBeforeMount} from "vue";
import {useStore} from "vuex";
import { settingName } from "@/common/defines/constants/settings";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useRouter} from "vue-router";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {CellImageAnalyzedType, EtcType} from "@/common/type/tooltipType";
import {scrollToTop} from "@/common/lib/utils/scroll";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import {CellImgAnalyzedResponse} from "@/common/api/service/setting/dto/cellImgAnalyzedDto";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {getDeviceInfoApi, putDeviceInfoApi} from "@/common/api/service/device/deviceApi";
import Button from "@/components/commonUi/Button.vue";
import {useToast} from "@/common/lib/utils/toast";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";
import Toggle from "@/components/commonUi/Toggle.vue";

const store = useStore();
const router = useRouter();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const drive = ref<any>([]);
const backupDrive = ref<any>([]);
const projectType = ref('pb');
const showConfirm = ref(false);
const confirmType = ref('setting');
const confirmMessage = ref('');
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);
const saveHttpType = ref('');
const apiUrl = ref('');
const tooltipVisible = ref({
  alarm: false,
  keepPage: false,
  lisUploadCheckAll: false,
  lisAutoNextPage: false,
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
  isAlarm: false,
  alarmCount: '5',
  keepPage: false,
  lisUploadCheckAll: false,
  lisAutoNextPage: false,
});
const { toastInfo, showToast } = useToast();

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
  machineVersion.value = window.MACHINE_VERSION;
  getApiUrl();
})

onMounted(async () => {
  await nextTick();
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
      return { ...cellInfo.value, id: Number(cellInfo.value.id) };
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
        cellInfo.value.isAlarm = data.isAlarm;
        cellInfo.value.alarmCount = data.alarmCount;
        cellInfo.value.keepPage = data.keepPage;
        cellInfo.value.lisUploadCheckAll = data.lisUploadCheckAll;
        cellInfo.value.lisAutoNextPage = data.lisAutoNextPage;
        sessionStorage.setItem('isAlarm', String(data?.isAlarm));
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const cellImgSet = async () => {
  const copyCellInfo = { ...cellInfo.value };

  if (copyCellInfo?.id) {
    delete copyCellInfo.id;
  }

  try {
    const requestAllCellInfo = allCellInfo.value.clientData.map((item) => {
      if (String(item.id) === String(cellInfo.value.id)) {
        return {
          ...copyCellInfo,
          id: Number(cellInfo.value.id),
          presetChecked: true,
          backupEndDate: allCellInfo.value.serverData[0].backupEndDate,
          backupStartDate: allCellInfo.value.serverData[0].backupStartDate,
        };
      } else {
        return {...item, presetChecked: false, ...copyCellInfo };
      }
    })
    const allCellImgIds = allCellInfo.value.serverData.map(item => String(item.id));

    console.log('requestAllCellInfo, requestAllCellInfo', requestAllCellInfo);
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
    showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
    await cellImgGetAll();
    handleChangeCellId(Number(allCellInfo.value.clientData[0].id));
    scrollToTop();
    const data = allCellInfo.value.serverData.filter((item) => String(item.id) === String(cellInfo.value.id))[0];
    // 공통으로 사용되는 부분 세션스토리지 저장 새로고침시에도 가지고 있어야하는부분
    sessionStorage.setItem('isAlarm', String(data?.isAlarm));
    sessionStorage.setItem('lisAutoNextPage', String(data?.lisAutoNextPage));
    const keepPageType = projectType.value === 'pb' ? 'keepPage' : 'bmKeepPage'
    sessionStorage.setItem(keepPageType, String(data?.keepPage));
    await store.dispatch('commonModule/setCommonInfo', {resetAnalyzing: true});
    await store.dispatch('commonModule/setCommonInfo', {showLISUploadAfterCheckingAll: data?.lisUploadCheckAll });

    await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
    await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  } catch (e) {
    console.error(e);
    showToast(MSG.TOAST.UPDATE_FAIL, MESSAGES.TOAST_MSG_ERROR);
  }
}

const updateDeviceInfo = async () => {
  try {
    await putDeviceInfoApi({autoStart: autoStart.value})
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

const toggleLisAutoNextPage = () => {
  cellInfo.value.lisAutoNextPage = !cellInfo.value.lisAutoNextPage;
}

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
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

const tooltipVisibleFunc = (type: keyof EtcType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}

const handleChangeCellId = (cellId: number) => {
  const selectedCellInfo = allCellInfo.value.clientData.filter((item) => String(item.id) === String(cellId))[0];
  if (selectedCellInfo) {
    cellInfo.value.isAlarm = selectedCellInfo.isAlarm;
    cellInfo.value.alarmCount = selectedCellInfo.alarmCount;
    cellInfo.value.keepPage = selectedCellInfo.keepPage;
    cellInfo.value.lisUploadCheckAll = selectedCellInfo.lisUploadCheckAll;
    cellInfo.value.lisAutoNextPage = selectedCellInfo.lisAutoNextPage;
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

</script>
