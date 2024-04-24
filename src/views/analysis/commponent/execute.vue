<template>
  <div class="execute">
    <div class='startDiv'>
      <select v-model="analysisType">
        <option v-for="option in testTypeArr" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <p class=" startStopP" v-if="showStopBtn">
        <font-awesome-icon
            :icon="['fas', 'circle-play']"
            :class="{ 'startBtn': true, [btnStatus]: true }"
            @click="toggleStartStop('start')"
        />
      </p>
      <p class="startStopP" v-else>
        <font-awesome-icon :icon="['fas', 'circle-stop']" class='stopBtn' @click="toggleStartStop('stop')"/>
      </p>
    </div>

    <div class="stopDiv">
      <select v-model="wbcCount" :disabled="isRunningState">
        <option v-for="option in countType" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <select class="stopDivSelect" v-model="stitchCount" :disabled="isRunningState && analysisType === '04'">
        <option v-for="option in stitchCountOptions" :key="option.value" :value="option.value">
          {{ option.text }}
        </option>
      </select>
<!--      {{ isInit }}-->
      <div class="initBtn" @click="sendInit" :class="{'isInitDisabled': isInit === 'Y'}">
        <font-awesome-icon :icon="['fas', 'rotate-right']" style="font-size: 0.9rem;"
                           :class="{ 'disabled': isInit !== 'N' }"
        />
        <span> INITIALIZING </span>
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
</template>

<script setup lang="ts">
import {ref, getCurrentInstance, computed, watch, onMounted, nextTick} from "vue";

import {useStore} from "vuex";
import {
  analysisOptions,
  wbcCountOptions,
  stitchCountOptions,
  bmCountOptions
} from '@/common/defines/constFile/analysis';
import {messages} from '@/common/defines/constFile/constantMessageText';
import {tcpReq} from '@/common/tcpRequest/tcpReq';
import {getCellImgApi} from "@/common/api/service/setting/settingApi";
import EventBus from "@/eventBus/eventBus";
import Alert from "@/components/commonUi/Alert.vue";
import process from "process";
import {testBmTypeList, testTypeList} from "@/common/defines/constFile/settings";


const store = useStore();
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const userModuleDataGet = computed(() => store.state.userModule);
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

// 스토어 end
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const commonDataGet = computed(() => store.state.commonModule);

//내부 변수
const showStopBtn = ref(false);
const btnStatus = ref('');

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const testTypeArr = ref<any>([]);

onMounted(async () => {
  await initDataExecut();
});

const initDataExecut =async () =>{
  projectType.value = process.env.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
  testTypeArr.value = process.env.PROJECT_TYPE === 'bm' ? testBmTypeList : analysisOptions;

  countType.value = process.env.PROJECT_TYPE === 'bm' ? bmCountOptions : wbcCountOptions
  userId.value = getStoredUser.id;
  await nextTick();
  await cellImgGet();
  initData();
  if (isRunningState.value) {
    btnStatus.value = 'isRunning';
    showStopBtn.value = false;
  } else {
    btnStatus.value = 'start';
    showStopBtn.value = true;
  }
}

watch(commonDataGet.value, (value, oldValue) => {
  if(value.loginSetData === ''){
    console.log(value.resFlag)
    initDataExecut();
    store.dispatch('commonModule/setCommonInfo', {loginSetData: 'nn'});
  }
});

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
  const [newEmbeddedStatusJobCmd, newExecuteState] = newVals;

  await nextTick();
  const {
    isPause: newIsPause,
    userStop: newUserStop,
    isRecoveryRun: newIsRecoveryRun,
    isInit: newIsInit
  } = newEmbeddedStatusJobCmd || {};
  // console.log(newIsRecoveryRun)

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
const emitSocketData = async (type: string, payload: object) => {
  EventBus.publish('messageSent', payload);
};
const toggleStartStop = (action: 'start' | 'stop') => {
  if (action === 'start') {
    if (isPause.value) { // 일시정지인 상태일 경우 임베디드에게 상태값을 알려준다.

      tcpReq().embedStatus.restart.bfSelectFiles = bfSelectFiles.value;
      tcpReq().embedStatus.restart.reqUserId = userId.value;
      emitSocketData('SEND_DATA', tcpReq().embedStatus.restart);
      return;
    }
    // 실행 여부 체크
    if (isRunningState.value) {
      showSuccessAlert(messages.IDS_ERROR_ALREADY_RUNNING);
      return;
    } else if (userStop.value) {
      if (confirm(messages.IDS_RECOVER_GRIPPER_CONDITION) === true) {
        tcpReq().embedStatus.recovery.reqUserId = userId.value;
        emitSocketData('SEND_DATA', tcpReq().embedStatus.recovery);
      }
      return;
    }
    const rbcPositionMargin = sessionStorage.getItem('rbcPositionMargin');
    const wbcPositionMargin = sessionStorage.getItem('wbcPositionMargin');
    const pltPositionMargin = sessionStorage.getItem('pltPositionMargin');

    let startAction = tcpReq().embedStatus.startAction;
    Object.assign(startAction, {
      testType: analysisType.value,
      wbcCount: wbcCount.value,
      stitchCount: stitchCount.value,
      reqUserId: userId.value,
      rbcPositionMargin: rbcPositionMargin || '0',
      wbcPositionMargin: wbcPositionMargin || '0',
      pltPositionMargin: pltPositionMargin || '0',
    });
    console.log(startAction);
    if (process.env.PROJECT_TYPE === 'bm') {
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
          "testType": analysisType.value,
          "stainType": "01",
          "userInputStainType": "",
          "analysisType": "02",
          "bmSamplingSide": "01",
          "cellCount": "500",
          "department": "s",
          "stitchCount":stitchCount.value,
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
      showSuccessAlert(messages.IDS_ERROR_STOP_PROCESS);
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


const sendInit = () => { // 장비 초기화 진행
  if(isInit.value === 'Y'){
    showSuccessAlert(messages.alreadyInitialized);
    return;
  }
  tcpReq().embedStatus.init.reqUserId = userId.value;
  emitSocketData('SEND_DATA', tcpReq().embedStatus.init);
}

const initData = () => {
  const newObj = {...embeddedStatusJobCmd.value}
  const runInfoObj = {...runInfo.value};
  // console.log('isInit 값:', newObj.isInit);
  isInit.value = newObj.isInit;
  isPause.value = newObj.isPause;
  userStop.value = newObj.userStop;
  isRecoveryRun.value = newObj.isRecoveryRun;
  isRunningState.value = runInfoObj.isRunningState;
  showStopBtn.value = (isInit.value === 'N' || isInit.value === '') && !isRunningState.value;
}

const cellImgGet = async () => {
  console.log('cellimg')
  try {
    const result = await getCellImgApi(String(userId.value));
    if (result) {
      if (result?.data) {
        const data = result.data;
        analysisType.value = data.analysisType;
        if(process.env.PROJECT_TYPE === 'bm'){
          wbcCount.value = data.cellAnalyzingCount;
        }else{
          switch (analysisType.value) {
            case '01':
              wbcCount.value = data.cellAnalyzingCount;
              break;
            case '04':
              wbcCount.value = data.pbAnalysisType2;
              break;
            default:
              wbcCount.value = data.bfAnalysisType;
          }
        }

        stitchCount.value = data.stitchCount
      }
    }

  } catch (e) {

    console.log(e);
  }
}

</script>
