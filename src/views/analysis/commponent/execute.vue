<template>
  <div class="execute">
    <div class='startDiv'>
      <select v-model="analysisType">
        <option v-for="option in analysisOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <p class="startStopP" v-if="!showStopBtn">
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
      <select v-model="wbcCount">
        <option v-for="option in wbcCountOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <select v-model="stitchCount">
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
import {ref, onMounted, getCurrentInstance} from "vue";

import {useStore} from "vuex";
import {analysisOptions, wbcCountOptions, stitchCountOptions} from '@/common/defines/constFile/analysis';
import {messages} from '@/common/defines/constFile/constant';
import {tcpReq} from '@/common/tcpRequest/tcpReq';

const instance = getCurrentInstance();

// 스토어
const store = useStore();
const embeddedStatusJobCmd = ref(store.state.embeddedStatusJobCmd)
const {isPause, isRunningState, userStop, isRecoveryRun, isInit} = embeddedStatusJobCmd.value ?? {};
// 스토어 end

//내부 변수
const analysisType = ref(store.state.executeModule.analysisType);
const wbcCount = ref(store.state.executeModule.wbcDiffVal);
const stitchCount = ref(store.state.executeModule.stitchCount);
const showStopBtn = ref(false);
const btnStatus = ref('');
//내부 변수

//웹소켓으로 백엔드에 전송
const emitSocketData = (type: string, payload: object) => {
  instance?.appContext.config.globalProperties.$socket.emit('message', {type, payload});
};

onMounted(() => {
  if (isPause) {
    btnStatus.value = 'isPause';
  } else if (isRunningState) {
    btnStatus.value = 'isRunning';
  } else if (userStop && !isRecoveryRun) {
    btnStatus.value = 'start';
  } else if (isInit === 'N') {
    btnStatus.value = 'isInit';
  } else {
    btnStatus.value = 'start';
  }
});


const toggleStartStop = (action: 'start' | 'stop') => {
  // 실행 여부 체크
  if (btnStatus.value === 'isRunning') {
    alert(messages.IDS_ERROR_ALREADY_RUNNING);
    return;
  } else if (userStop) {
    alert(messages.IDS_RECOVER_GRIPPER_CONDITION);
    return;
  }

  if (action === 'start') {
    if (isPause) { // 일시정지인 상태일 경우 임베디드에게 상태값을 알려준다.
      emitSocketData('SEND_DATA', tcpReq.embedStatus.restart);
      return;
    }
    const startAction = tcpReq.embedStatus.startAction;
    if (isInit) { // 초기화 여부 체크 초기화가 되어있는 상태이면 실행
      // 웹소켓으로 백엔드에 전송
      emitSocketData('SEND_DATA', {
        ...startAction,
        stitchCount: stitchCount.value,
        wbcCount: wbcCount.value,
        testType: analysisType.value
      });

    }
  } else {
    // 장비 중단
    if (!isRunningState) {
      alert(messages.IDS_ERROR_STOP_PROCESS);
      return;
    }
    emitSocketData('SEND_DATA', tcpReq.embedStatus.stop);
  }
  // 버튼 모양 바꾸는 조건문
  if (isPause || userStop && !isRecoveryRun || userStop && isRecoveryRun || isInit === 'N') {
    showStopBtn.value = true;
  } else if (isRunningState) {
    showStopBtn.value = false;
  }
};

const sendInit = () => { // 초기화진행
  emitSocketData('SEND_DATA', tcpReq.embedStatus.init);
}

</script>
