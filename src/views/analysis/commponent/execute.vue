<template>
  <div class="execute">
    <div class='startDiv'>
      <select v-model="analysisType" :disabled="isRunningState" @change="sendSearchCardCount">
        <option v-for="option in testTypeArr" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <p class="startStopP" v-if="showStopBtn" @click="isInit === 'Y' && toggleStartStop('start')">
        <font-awesome-icon
            :icon="['fas', 'circle-play']"
            :class="{ 'startBtn': true, [btnStatus]: true }"
        />
      </p>
      <p class="startStopP" v-else @click="toggleStartStop('stop')">
        <font-awesome-icon :icon="['fas', 'circle-stop']" class='stopBtn' />
      </p>
    </div>

    <div class="stopDiv">
      <select v-model="wbcCount" :disabled="isRunningState">
        <option v-for="option in countType" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <select class="stopDivSelect" v-model="stitchCount" :disabled="isRunningState">
        <option v-for="option in STITCH_COUNT_OPTIONS" :key="option.value" :value="option.value">
          {{ option.text }}
        </option>
      </select>

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
import {MESSAGES} from '@/common/defines/constants/constantMessageText';
import {tcpReq} from '@/common/defines/constants/tcpRequest/tcpReq';
import {getCellImgApi, getRunInfoApi} from "@/common/api/service/setting/settingApi";
import EventBus from "@/eventBus/eventBus";
import Alert from "@/components/commonUi/Alert.vue";
import {testBmTypeList, testTypeList, wbcRunningCount} from "@/common/defines/constants/settings";
import Confirm from "@/components/commonUi/Confirm.vue";
import router from "@/router";
import {getDeviceInfoApi} from "@/common/api/service/device/deviceApi";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";


const store = useStore();
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const userModuleDataGet = computed(() => store.state.userModule);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const projectType = ref('pb');
const countType = ref<any>([]);

const runInfo = computed(() => store.state.commonModule);
const executeState = computed(() => store.state.executeModule);
const isPause = ref(runInfo.value?.isPause);
const isRunningState = ref(executeState.value?.isRunningState);
const userStop = ref(embeddedStatusJobCmd.value?.userStop);
const isRecoveryRun = ref(embeddedStatusJobCmd.value?.isRecoveryRun);
const isInit = ref(embeddedStatusJobCmd.value?.isInit);
const userId = ref('');
const analysisType = ref();
const wbcCount = ref();
const stitchCount = ref();
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

watch(userModuleDataGet.value, async (newUserId, oldUserId) => {
  if (newUserId.id === '') {
    return;
  }
  userId.value = newUserId.id;
  await initDataExecute();
});

onBeforeMount(() => {
  is100A.value = window.MACHINE_VERSION === '100a';
})

onMounted(async () => {
  await initDataExecute();
});

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

  const {isRunningState: newIsRunningState, bfSelectFiles: newBfSelectFiles} = newRunInfo || {};
  isRunningState.value = newIsRunningState;
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
  } = newEmbeddedStatusJobCmd || {};

  if (is100A.value && Number(newEmbeddedStatusJobCmd.sysInfo.autoStart)) {
    toggleStartStop('start', 'autoStart');
  }

  isPause.value = newIsPause;
  userStop.value = newUserStop;
  isRecoveryRun.value = newIsRecoveryRun;
  isInit.value = newIsInit;

  if (isPause.value) {
    btnStatus.value = 'isPause';
  } else if (userStop.value && !isRecoveryRun.value) {
    btnStatus.value = 'onRecover';
  } else if (isInit.value === 'N' || isInit.value === '') {
    btnStatus.value = 'isInit';
  } else {
    btnStatus.value = 'start';
  }
});


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
    testType: analysisType.value,
  }
  tcpReq().embedStatus.searchCardCount.reqUserId = userId.value;
  tcpReq().embedStatus.searchCardCount.testType = analysisType.value;
  EventBus.publish('childEmitSocketData', req);
}

const toggleStartStop = (action: 'start' | 'stop', autoStart = '') => {
  if (viewerCheck.value !== 'main' && window.FORCE_VIEWER !== 'main') return;

  if (action === 'start') {
    if (isPause.value) { // 일시정지인 상태일 경우 임베디드에게 상태값을 알려준다.

      tcpReq().embedStatus.restart.bfSelectFiles = bfSelectFiles.value;
      tcpReq().embedStatus.restart.reqUserId = userId.value;
      emitSocketData('SEND_DATA', tcpReq().embedStatus.restart);
      return;
    }
    // 실행 여부 체크
    if (isRunningState.value && autoStart !== 'autoStart') {
      showSuccessAlert(MESSAGES.IDS_ERROR_ALREADY_RUNNING);
      return;
    } else if (userStop.value) {
      confirmMessage.value = MESSAGES.IDS_RECOVER_GRIPPER_CONDITION;
      showConfirm.value = true;
      return;
    }
    const rbcPositionMargin = sessionStorage.getItem('rbcPositionMargin');
    const wbcPositionMargin = sessionStorage.getItem('wbcPositionMargin');
    const pltPositionMargin = sessionStorage.getItem('pltPositionMargin');
    const edgeShotType = sessionStorage.getItem('edgeShotType') || '0';
    const autoStart = sessionStorage.getItem('autoStart') || 1;

    let startAction = tcpReq().embedStatus.startAction;
    Object.assign(startAction, {
      testType: analysisType.value,
      wbcCount: filteredWbcCount.value || wbcCount.value,
      stitchCount: stitchCount.value,
      reqUserId: userId.value,
      rbcPositionMargin: rbcPositionMargin || '0',
      wbcPositionMargin: wbcPositionMargin || '0',
      pltPositionMargin: pltPositionMargin || '0',
      edgeShotType:  edgeShotType || '0',
    });

    if (is100A.value) {
      Object.assign(startAction, {
        autoStart: Number(autoStart),
      })
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
          "analysisType": analysisType.value,
          "bmSamplingSide": "01",
          "cellCount": wbcCount.value,
          "department": "s",
          "stitchCount": stitchCount.value,
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

const showErrorALert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
}

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = () => {
  showConfirm.value = false;
}

const handleOkConfirm = () => {
  showConfirm.value = false;
  tcpReq().embedStatus.recovery.reqUserId = userId.value;
  emitSocketData('SEND_DATA', tcpReq().embedStatus.recovery);
}

const sendInit = () => { // 장비 초기화 진행

  if (viewerCheck.value !== 'main' && window.FORCE_VIEWER !== 'main') return;
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
  const runInfoObj = {...runInfo.value};
  isInit.value = newObj.isInit;
  isPause.value = newObj.isPause;
  userStop.value = newObj.userStop;
  isRecoveryRun.value = newObj.isRecoveryRun;
  isRunningState.value = runInfoObj.isRunningState;
  showStopBtn.value = (isInit.value === 'N' || isInit.value === '') && !isRunningState.value;
}

const cellImgGet = async () => {
  try {
    const result = await getCellImgApi();
    if (result) {
      if (result?.data) {
        const data = result.data;
        analysisType.value = data.analysisType;
        await store.dispatch('commonModule/setCommonInfo', { analysisType: analysisType.value });
        if (window.PROJECT_TYPE === 'bm') {
          wbcCount.value = data.diffCellAnalyzingCount;
        } else {
          switch (analysisType.value) {
            case '01':
              wbcCount.value = data.diffCellAnalyzingCount;
              break;
            case '04':
              wbcCount.value = data.pbsCellAnalyzingCount;
              break;
            default:
              wbcCount.value = data.bfCellAnalyzingCount;
          }
        }

        stitchCount.value = data.stitchCount
      }
    }

  } catch (e) {

    console.log(e);
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
        const filteredRunCountData: any = runCountData.filter(data => data.min <= wbcCount.value && wbcCount.value <= data.max)[0];
        if (filteredRunCountData.wbcTargetCount) {
          filteredWbcCount.value = filteredRunCountData.wbcTargetCount;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

const getDeviceInfo = async () => {
  try {
    const deviceData = await getDeviceInfoApi();
    siteCd.value = deviceData.data.siteCd;
  } catch (e) {
    console.log(e);
  }
}

</script>
