<template>
  <div class="execute">
    <div class='startDiv'>
      <select v-model="analysisType">
        <option v-for="option in analysisOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <p class="startStopP" v-if="showStopBtn">
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
        <option v-for="option in wbcCountOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <select v-model="stitchCount" :disabled="isRunningState && analysisType === '04'">
        <option v-for="option in stitchCountOptions" :key="option.value" :value="option.value">
          {{ option.text }}
        </option>
      </select>
      <div class="initBtn" @click="sendInit">
        <font-awesome-icon :icon="['fas', 'rotate-right']" style="font-size: 0.9rem;"
                           :class="{ 'disabled': isInit !== 'N' }"
        />
        <span> INITIALIZING </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, getCurrentInstance, computed, watch, onMounted, nextTick} from "vue";

import {useStore} from "vuex";
import {analysisOptions, wbcCountOptions, stitchCountOptions} from '@/common/defines/constFile/analysis';
import {messages} from '@/common/defines/constFile/constant';
import {tcpReq} from '@/common/tcpRequest/tcpReq';
import {reqUserId} from "@/common/lib/utils/dateUtils";

const instance = getCurrentInstance();

// 스토어
const store = useStore();
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const runInfo = computed(() => store.state.commonModule);
const executeState = computed(() => store.state.executeModule);
const isPause = ref(runInfo.value?.isPause);
const isRunningState = ref(executeState.value?.isRunningState);
const userStop = ref(embeddedStatusJobCmd.value?.userStop);
const isRecoveryRun = ref(embeddedStatusJobCmd.value?.isRecoveryRun);
const isInit = ref(embeddedStatusJobCmd.value?.isInit);
const userId = reqUserId();

const analysisType = ref();
const wbcCount = ref();
const stitchCount = ref();
const bfSelectFiles = ref([]);

// 스토어 end


//내부 변수
const showStopBtn = ref(false);
const btnStatus = ref('');

onMounted(async () => {
  await nextTick();
  // console.log('컴포넌트가 마운트되었습니다. embeddedStatusModule 상태:', store.state.embeddedStatusModule);
  const newObj = {...embeddedStatusJobCmd.value}
  const runInfoObj = {...runInfo.value};
  // console.log('isInit 값:', newObj.isInit);
  isInit.value = newObj.isInit;
  isPause.value = newObj.isPause;
  userStop.value = newObj.userStop;
  isRecoveryRun.value = newObj.isRecoveryRun;
  isRunningState.value = runInfoObj.isRunningState;
  showStopBtn.value = (isInit.value === 'N' || isInit.value === '') && !isRunningState.value;
  analysisType.value = '01';
  wbcCount.value = '100';
  stitchCount.value = '';
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
    btnStatus.value = 'start';
    showStopBtn.value = true;
  }
})


// 스토어 변경 감시
watch([embeddedStatusJobCmd.value, executeState.value], async (newVals) => {
  // console.log('감시시작')
  const [newEmbeddedStatusJobCmd, newExecuteState] = newVals;

  await nextTick();
  // analysisType.value = newExecuteState.analysisType;
  // wbcCount.value = newExecuteState.wbcDiffVal;
  // stitchCount.value = newExecuteState.stitchCount;


  // deep 옵션을 사용하여 객체 내부의 변경을 감지
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
const emitSocketData = (type: string, payload: object) => {
  instance?.appContext.config.globalProperties.$socket.emit('message', {type, payload});
};
const toggleStartStop = (action: 'start' | 'stop') => {
  if (action === 'start') {
    if (isPause.value) { // 일시정지인 상태일 경우 임베디드에게 상태값을 알려준다.

      tcpReq.embedStatus.restart.bfSelectFiles = bfSelectFiles.value;
      tcpReq.embedStatus.restart.reqUserId = userId;
      emitSocketData('SEND_DATA', tcpReq.embedStatus.restart);
      return;
    }
    // 실행 여부 체크
    if (isRunningState.value) {
      alert(messages.IDS_ERROR_ALREADY_RUNNING);
      return;
    } else if (userStop.value) {
      if (confirm(messages.IDS_RECOVER_GRIPPER_CONDITION) === true){
        tcpReq.embedStatus.recovery.reqUserId = userId;
        instance?.appContext.config.globalProperties.$socket.emit('message', {
          type: 'SEND_DATA',
          payload: tcpReq.embedStatus.recovery
        });
      }
      return;
    }

    const startAction = tcpReq.embedStatus.startAction;
    Object.assign(startAction, {
      testType: analysisType.value,
      wbcCount: wbcCount.value,
      stitchCount: stitchCount.value,
      reqUserId: userId,
    });

    if (isInit.value === 'Y') { // 초기화 여부 체크 초기화가 되어있는 상태이면 실행
      // 웹소켓으로 백엔드에 전송
      emitSocketData('SEND_DATA', startAction);
      console.log(startAction);
      const InfoData = {
        startEmbedded: true,
      }
      // 시작 버튼이 눌리면 연속적으로 실행정보, 장비정보를 요청한다.
      store.dispatch('commonModule/setCommonInfo', InfoData);
    }
  } else {
    // 장비 중단
    if (!isRunningState.value) {
      alert(messages.IDS_ERROR_STOP_PROCESS);
      return;
    }
    store.dispatch('embeddedStatusModule/setUserStop', {userStop: true});
    tcpReq.embedStatus.stop.reqUserId = userId;
    emitSocketData('SEND_DATA', tcpReq.embedStatus.stop);

  }

};

const sendInit = () => { // 장비 초기화 진행
  tcpReq.embedStatus.init.reqUserId = userId;
  emitSocketData('SEND_DATA', tcpReq.embedStatus.init);
}

</script>
