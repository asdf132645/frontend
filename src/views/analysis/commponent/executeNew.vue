<template>
  <div class="execute-container">

    <div class="flex-justify-between w-full">
      <p class="startStopP-wrapper" v-if="showStopBtn" @click="isInit === 'Y' && toggleStartStop('start')">
        <font-awesome-icon :icon="['fas', 'circle-play']" :class="{ 'startBtn': true, [btnStatus]: true }"/>
      </p>
      <p class="startStopP-wrapper" v-else @click="toggleStartStop('stop')">
        <font-awesome-icon :icon="['fas', 'circle-stop']" class='stopBtn' />
      </p>

      <div class="stop-container">

        <select :disabled="isRunningState" @change="handleChangeCellInfo" v-model="cellInfo.id">
          <option v-for="cellItem in cellImageAnalyzedData" :key="cellItem.id" :value="cellItem.id">{{ !isPresetChanged ? cellItem.presetNm : 'Custom' }}</option>
        </select>
        <div class="flex-align-center mt5">
          <select v-model="cellInfo.analysisType" :disabled="isRunningState" @change="sendSearchCardCount">
            <option v-for="option in testTypeArr" :key="option.value" :value="option.value">{{ option.text }}</option>
          </select>
          <select v-model="cellInfo.wbcCount" class="execute-wbcCount-wrapper" :disabled="isRunningState || (cellInfo.analysisType === '05')">
            <option v-for="option in countType" :key="option.value" :value="option.value">{{ option.text }}</option>
          </select>
        </div>


        <div class="flex-justify-between">
          <div v-if="is100A" class="rewindBtn flex-center" @mousedown="sendRewindBelt(true)" @mouseup="sendRewindBelt(false)">
            <font-awesome-icon :icon="['fas', 'backward-fast']" flip="horizontal" />
          </div>

          <div class="initBtn" @click="sendInit" :class="{'isInitDisabled': isInit === 'Y', 'initBtn-is100a': is100A }" style="width: 100%;">
            <span> {{isRunningState ? 'INITIALIZING' : 'INITIALIZE' }} </span>
          </div>
        </div>

      </div>
    </div>

  </div>
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
      :type="confirmType"
      :message="confirmMessage"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, nextTick, defineEmits, onBeforeMount} from "vue";

import {useStore} from "vuex";
import {
  WBC_COUNT_OPTIONS,
  STITCH_COUNT_OPTIONS,
  BM_COUNT_OPTIONS
} from '@/common/defines/constants/analysis';
import { MESSAGES, MSG } from '@/common/defines/constants/constantMessageText';
import {tcpReq} from '@/common/defines/constants/tcpRequest/tcpReq';
import {getCellImgApi, getRunInfoApi, putCellImgApi} from "@/common/api/service/setting/settingApi";
import EventBus from "@/eventBus/eventBus";
import Alert from "@/components/commonUi/Alert.vue";
import { testBmTypeList, testTypeList } from "@/common/defines/constants/settings";
import Confirm from "@/components/commonUi/Confirm.vue";
import {getDeviceInfoApi} from "@/common/api/service/device/deviceApi";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";


const store = useStore();
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const userModuleDataGet = computed(() => store.state.userModule);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const cellImageAnalyzedData = computed(() => store.state.commonModule.cellImageAnalyzedData);
const projectType = ref('pb');
const countType = ref<any>([]);

const runInfo = computed(() => store.state.commonModule);
const executeState = computed(() => store.state.executeModule);
const isPause = ref(runInfo.value?.isPause);
const isRunningState = computed(() => store.state.commonModule.isRunningState);
const userStop = ref(embeddedStatusJobCmd.value?.userStop);
const isRecoveryRun = ref(embeddedStatusJobCmd.value?.isRecoveryRun);
const isInit = ref(embeddedStatusJobCmd.value?.isInit);
const isInitializing = computed(() => store.state.commonModule.isInitializing);
const userId = ref('');
const bfSelectFiles = ref([]);
const commonDataGet = computed(() => store.state.commonModule);
const showStopBtn = ref(false);
const btnStatus = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const testTypeArr = ref<any>([]);
const emits = defineEmits();
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const siteCd = ref('');
const filteredWbcCount = ref<any>();
const is100A = ref(false);
const errorLevel = ref('0');
const cellInfo = ref({
  id: '1',
  analysisType: '01',
  wbcCount: '100',
  diffWbcPositionMargin: '0',
  diffRbcPositionMargin: '0',
  diffPltPositionMargin: '0',
  stitchCount: '1',
  edgeShotType: '0',
  edgeShotCount: {
    LP: '1',
    HP: '3',
  },
  presetChecked: false,
  presetNm: '1',
})
const isPresetChanged = ref(false);
const isRecovering = ref(false);

onBeforeMount(() => {
  is100A.value = window.MACHINE_VERSION === '100a';
  isRecovering.value = false;
})

onMounted(async () => {
  await initDataExecute();
});


watch(userModuleDataGet.value, async (newUserId, oldUserId) => {
  if (newUserId.id === '') {
    return;
  }
  userId.value = newUserId.id;
  await initDataExecute();
});

watch(commonDataGet.value, (value) => {
  if (value.loginSetData === '') {
    initDataExecute();
    store.dispatch('commonModule/setCommonInfo', {loginSetData: 'nn'});
  }
  if(value.resetAnalyzing){
    cellImgGet();
    store.dispatch('commonModule/setCommonInfo', {resetAnalyzing: false});
  }
},{deep: true});

watch([runInfo.value], async (newVals) => {
  await nextTick();
  const [newRunInfo] = newVals;

  const { bfSelectFiles: newBfSelectFiles} = newRunInfo || {};
  bfSelectFiles.value = newBfSelectFiles;

  if (isRunningState.value) {
    btnStatus.value = 'isRunning';
    showStopBtn.value = false;
  } else {
    // btnStatus.value = 'isInit';
    showStopBtn.value = true;
  }
})

// 스토어 변경 감시
watch([embeddedStatusJobCmd.value, executeState.value], async (newVals) => {
  const [newEmbeddedStatusJobCmd] = newVals;
  await nextTick();

  const {
    isPause: newIsPause,
    userStop: newUserStop,
    isRecoveryRun: newIsRecoveryRun,
    isInit: newIsInit,
    errorLevel: newErrorLevel,
  } = newEmbeddedStatusJobCmd || {};
  errorLevel.value = newErrorLevel;

  if (is100A.value && Number(newEmbeddedStatusJobCmd.sysInfo.autoStart) && !isRunningState.value) {
    toggleStartStop('start');
  }

  if (isInit.value === 'Y') {
    await store.dispatch('commonModule/setCommonInfo', { isInitializing: false });
  }

  isPause.value = newIsPause;
  userStop.value = newUserStop;
  isRecoveryRun.value = newIsRecoveryRun;
  isInit.value = newIsInit;

  if (isPause.value) {
    btnStatus.value = 'isPause';
    isRecovering.value = false;
  } else if (userStop.value && !isRecoveryRun.value) {
    btnStatus.value = 'onRecover';
  } else if (isInit.value === 'N' || isInit.value === '') {
    btnStatus.value = 'isInit';
    isRecovering.value = false;
  } else {
    btnStatus.value = 'start';
    isRecovering.value = false;
  }
});

watch(() => cellImageAnalyzedData.value, () => {
  const currentPreset = cellImageAnalyzedData.value.filter(item => item.presetChecked)[0];

  if (currentPreset) {
    setCellInfo(currentPreset);
  }
})

watch(() => cellInfo.value, (newCellInfo) => {
  if (!newCellInfo) {
    return;
  }

  const currentCellInfo = cellImageAnalyzedData.value.find(item => item?.id === newCellInfo.id);
  if (!currentCellInfo) {
    isPresetChanged.value = true;
  } else {
    const currentWbcCount = setWbcCount(currentCellInfo) ?? 0; // null/undefined 방지
    const isMatching =
        currentCellInfo.analysisType === newCellInfo.analysisType &&
        currentWbcCount === (newCellInfo.wbcCount ?? 0) && // null/undefined 방지
        currentCellInfo.stitchCount === newCellInfo.stitchCount;

    isPresetChanged.value = !isMatching;
  }
}, { deep: true })

const initDataExecute = async () => {
  projectType.value = window.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
  testTypeArr.value = window.PROJECT_TYPE === 'bm' ? testBmTypeList : testTypeList;

  countType.value = window.PROJECT_TYPE === 'bm' ? BM_COUNT_OPTIONS : WBC_COUNT_OPTIONS
  // userId.value = getStoredUser.id;

  await nextTick();
  await cellImgGet();
  await getDeviceInfo();
  await setWbcRunningCount();
  await initData();
  if (isRunningState.value) {
    btnStatus.value = 'isRunning';
    showStopBtn.value = false;
  } else {
    btnStatus.value = 'start';
    showStopBtn.value = true;
  }
}

//웹소켓으로 백엔드에 전송
const emitSocketData = async (type: string, payload: any) => {
  await EventBus.publish('childEmitSocketData', payload);
};

const sendSearchCardCount = () => {
  const reqDttm = getDateTimeStr(); // 현재 날짜와 시간을 가져오는 함수
  const req = {
    jobCmd: 'SEARCH_CARD_COUNT',
    reqUserId: userId.value,
    reqDttm: reqDttm,
    testType: cellInfo.value.analysisType,
  }
  tcpReq().embedStatus.searchCardCount.reqUserId = userId.value;
  tcpReq().embedStatus.searchCardCount.testType = cellInfo.value.analysisType;
  EventBus.publish('childEmitSocketData', req);
}

const toggleStartStop = (action: 'start' | 'stop') => {
  if (viewerCheck.value !== 'main' && window.FORCE_VIEWER !== 'main') {
    return;
  }

  if (action === 'start') {
    // 일시정지인 상태일 경우 임베디드에게 상태값을 알려준다.
    if (isPause.value) {
      handlePauseState(bfSelectFiles.value, userId.value);
      return;
    }

    // 실행 여부 체크
    if (isRunningState.value) {
      showSuccessAlert(MSG.SYSTEM.PROCESS_ALREADY_RUNNING);
      return;
    }

    if (isRecovering.value) {
      showSuccessAlert(MSG.SYSTEM.RECOVERY_PROGRESS);
      return;
    }

    if (userStop.value) {
      confirmMessage.value = MSG.SYSTEM.RECOVER_SYSTEM;
      showConfirm.value = true;
      return;
    }

    const rbcPositionMargin = sessionStorage.getItem('rbcPositionMargin');
    const wbcPositionMargin = sessionStorage.getItem('wbcPositionMargin');
    const pltPositionMargin = sessionStorage.getItem('pltPositionMargin');
    const edgeShotType = sessionStorage.getItem('edgeShotType') || '0';
    let reqAutoStart;
    let autoStart = sessionStorage.getItem('autoStart');
    if (autoStart === 'true') {
      reqAutoStart = 1;
    } else if (autoStart === 'false') {
      reqAutoStart = 0;
    }

    let startAction = tcpReq().embedStatus.startAction;
    Object.assign(startAction, {
      testType: cellInfo.value.analysisType,
      wbcCount: filteredWbcCount.value || cellInfo.value.wbcCount,
      stitchCount: cellInfo.value.stitchCount,
      reqUserId: userId.value,
      rbcPositionMargin: rbcPositionMargin || '0',
      wbcPositionMargin: wbcPositionMargin || '0',
      pltPositionMargin: pltPositionMargin || '0',
      edgeShotType:  edgeShotType || '0',
    });

    if (is100A.value) {
      Object.assign(startAction, {
        autoStart: Number(reqAutoStart),
      })
    }

    // 2: LowPower | 3: HighPower
    if (window.PROJECT_TYPE === 'pb' && ['2', '3'].includes(edgeShotType)) {
      const key = edgeShotType === '2' ? 'edgeShotLPCount' : 'edgeShotHPCount';
      const defaultCount = edgeShotType === '2' ? '1' : '3';
      const edgeShotCount = sessionStorage.getItem(key) || defaultCount;

      Object.assign(startAction, { edgeShotCount });
    }


    if (window.PROJECT_TYPE === 'bm') {
      startAction = {
        "jobCmd": "START",
        "reqUserId": userId.value,
        "reqDttm": tcpReq().embedStatus.startAction.reqDttm,
        "orderInfo": [{
          "orderId": "1",
          "cassetNo": "",
          "slotNo": "1",
          "bmNo": "1",
          "patientId": "",
          "patientNm": "",
          "age": "1",
          "gender": "01",
          "testType": '02',
          "stainType": "01",
          "userInputStainType": "",
          "analysisType": cellInfo.value.analysisType,
          "bmSamplingSide": "01",
          "cellCount": cellInfo.value.wbcCount,
          "department": "s",
          "stitchCount": cellInfo.value.stitchCount,
        }],
        "runningMode": "00",
        "positionMargin": "0"
      }
    }

    if (isInit.value === 'Y') { // 초기화 여부 체크 초기화가 되어있는 상태이면 실행
      // 웹소켓으로 백엔드에 전송
      emitSocketData('SEND_DATA', startAction);
      const InfoData = {
        startEmbedded: true,
      }
      // 시작 버튼이 눌리면 연속적으로 실행정보, 장비정보를 요청한다.
      store.dispatch('commonModule/setCommonInfo', InfoData);
    }
  } else {
    // 장비 중단
    if (!isRunningState.value) {
      showSuccessAlert(MESSAGES.IDS_ERROR_STOP_PROCESS);
      return;
    }
    store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {userStop: true});
    tcpReq().embedStatus.stop.reqUserId = userId.value;
    emitSocketData('SEND_DATA', tcpReq().embedStatus.stop);

  }

};

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = () => {
  showConfirm.value = false;
}

const handleOkConfirm = async () => {
  showConfirm.value = false;
  tcpReq().embedStatus.recovery.reqUserId = userId.value;
  await emitSocketData('SEND_DATA', tcpReq().embedStatus.recovery);
  isRecovering.value = true;
}

const sendInit = () => { // 장비 초기화 진행
  if (viewerCheck.value !== 'main' && window.FORCE_VIEWER !== 'main') return;
  if (errorLevel.value === '1' || errorLevel.value === '2') return;
  if (isInitializing.value) return;
  if (isInit.value === 'Y') {
    showSuccessAlert(MESSAGES.alreadyInitialized);
    return;
  }

  tcpReq().embedStatus.init.reqUserId = userId.value;
  emitSocketData('SEND_DATA', tcpReq().embedStatus.init);
  emits('initDataChangeText', true);
}

const sendRewindBelt = async (isRewindingBelt: boolean) => {
  await store.dispatch('commonModule/setCommonInfo', { isRewindingBelt: isRewindingBelt });
}

const initData = async () => {
  const newObj = {...embeddedStatusJobCmd.value }
  isInit.value = newObj.isInit;
  isPause.value = newObj.isPause;
  userStop.value = newObj.userStop;
  isRecoveryRun.value = newObj.isRecoveryRun;
  showStopBtn.value = (isInit.value === 'N' || isInit.value === '') && !isRunningState.value;
}

const cellImgGet = async () => {
  try {
    const result = await getCellImgApi();
    if (result) {
      if (result?.data) {
        const data = result.data;
        setCellInfo(data);
        await store.dispatch('commonModule/setCommonInfo', { analysisType: data.analysisType });


      }
    }

  } catch (e) {
    console.error(e);
  }
}

const setWbcRunningCount = async () => {
  // 0011 - 인하대인 경우 -> WbcRunningCount로 분류
  if (window.PROJECT_TYPE !== 'pb' || siteCd.value !== '0011') return;

  try {
    const runCountResult = await getRunInfoApi();

    if (runCountResult && runCountResult.data) {
      const runCountData = runCountResult.data;

      if (runCountData && runCountData?.length > 0) {
        const filteredRunCountData: any = runCountData.filter(data => data.min <= cellInfo.value.wbcCount && cellInfo.value.wbcCount <= data.max)[0];
        if (filteredRunCountData.wbcTargetCount) {
          filteredWbcCount.value = filteredRunCountData.wbcTargetCount;
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const setWbcCount = (data) => {
  if (window.PROJECT_TYPE === 'bm') {
    return data.diffCellAnalyzingCount;
  }

  switch (cellInfo.value.analysisType) {
    case '01':
      return data.diffCellAnalyzingCount;
    case '04':
      return data.pbsCellAnalyzingCount;
    default:
      return data.bfCellAnalyzingCount;
  }
}

const handleChangeCellInfo = async (event: Event) => {
  const selectedCellId = event.target as HTMLSelectElement;
  const selectedCellInfo = cellImageAnalyzedData.value.filter((item) => String(item.id) === selectedCellId.value)[0];
  const restCellInfo = cellImageAnalyzedData.value.filter((item) => String(item.id) !== selectedCellId.value);
  const requestItem = { ...selectedCellInfo, presetChecked: true };
  try {
    for (const resetItem of restCellInfo) {
      const restRequestItem = { ...resetItem, presetChecked: false };
      await putCellImgApi(restRequestItem, String(restRequestItem.id));
    }
    await putCellImgApi(requestItem, String(requestItem.id));
  } catch (error) {
    console.error(error);
  }

  const currentPreset = cellImageAnalyzedData.value.filter(item => String(item.id) === selectedCellId.value)[0];
  if (currentPreset) {
    setCellInfo(currentPreset);
  }
}

const handlePauseState = (bfSelectFiles: any, userId: string) => {
  tcpReq().embedStatus.restart.bfSelectFiles = bfSelectFiles;
  tcpReq().embedStatus.restart.reqUserId = userId;
  emitSocketData('SEND_DATA', tcpReq().embedStatus.restart);
}

const setCellInfo = (data: any) => {
  cellInfo.value.analysisType = data.analysisType;
  cellInfo.value.id = data.id;
  cellInfo.value.wbcCount = setWbcCount(data);
  cellInfo.value.diffWbcPositionMargin = data.diffWbcPositionMargin;
  cellInfo.value.diffRbcPositionMargin = data.diffRbcPositionMargin;
  cellInfo.value.diffPltPositionMargin = data.diffPltPositionMargin;
  cellInfo.value.stitchCount = data.stitchCount;
  cellInfo.value.edgeShotType = data.edgeShotType;
  cellInfo.value.edgeShotCount.LP = data.edgeShotLPCount;
  cellInfo.value.edgeShotCount.HP = data.edgeShotHPCount;
  sessionStorage.setItem('wbcPositionMargin', data.diffWbcPositionMargin);
  sessionStorage.setItem('rbcPositionMargin', data.diffRbcPositionMargin);
  sessionStorage.setItem('pltPositionMargin', data.diffPltPositionMargin);
  sessionStorage.setItem('edgeShotType', data.edgeShotType || '0');
  sessionStorage.setItem('edgeShotLPCount', data.edgeShotLPCount);
  sessionStorage.setItem('edgeShotHPCount', data.edgeShotHPCount);
}

const getDeviceInfo = async () => {
  try {
    const deviceData = await getDeviceInfoApi();
    siteCd.value = deviceData.data.siteCd;
  } catch (e) {
    console.error(e);
  }
}

</script>
