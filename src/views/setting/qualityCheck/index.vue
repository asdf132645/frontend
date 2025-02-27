<template>
  <div>
    <ul class="customSettingContainer">
      <li class="mt20">
        <p class="mb10">Quality Check</p>
        <Button @click="qualityCheckOpen" size="lg" class="w120-min">OK</Button>
      </li>
      <li class="mt20">
        <p class="mb10">Gripper Open</p>
        <Button @click="onGripperOpen" size="lg" class="w120-min" :class="{'blinkGripper': isBlinkingGripper}" >OK</Button>
      </li>
      <li class="mt20">
        <p class="mb10">Camera Reset</p>
        <Button @click="onCameraReset" size="lg" class="w120-min" :class="{'blinkGripper': isBlinkCameraReset}">OK</Button>
      </li>
      <li class="mt20">
        <p class="mb10">Charge Remaining Count</p>
        <Button @click="onScan" size="lg" class="w120-min">Scan</Button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">

import {qualityCheck, remainingCount} from "@/common/api/service/setting/settingApi";
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {tcpReq} from "@/common/defines/constants/tcpRequest/tcpReq";
import {onCameraResetWebSocket, onGripperOpenWebSocket} from "@/common/helpers";
import EventBus from "@/eventBus/eventBus";
import {useStore} from "vuex";
import Button from "@/components/commonUi/Button.vue";

const store = useStore();
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const runInfo = computed(() => store.state.commonModule);
const isRunningState = ref(false);
const isBlinkingGripper = ref(false);
const isBlinkCameraReset = ref(false);
let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
let cameraResetTimeOut: ReturnType<typeof setTimeout> | null = null;

onMounted( () => {
  const newUserId = JSON.parse(JSON.stringify(userModuleDataGet.value));
  userId.value = newUserId.userId;
});

watch([runInfo.value], async (newVals) => {
  await nextTick();
  const [newRunInfo] = newVals;

  const {isRunningState: newIsRunningState} = newRunInfo || {};
  isRunningState.value = newIsRunningState;

})

const onScan = async () => {
  await remainingCount();
}

const onGripperOpen = () => {
  if (blinkTimeout !== null) {
    clearTimeout(blinkTimeout);
  }

  isBlinkingGripper.value = true;
  tcpReq().embedStatus.gripperOpen.reqUserId = userId.value;
  EventBus.publish('childEmitSocketData', tcpReq().embedStatus.gripperOpen);

  blinkTimeout = setTimeout(() => {
    isBlinkingGripper.value = false;
    blinkTimeout = null;
  }, 500);

}

const onCameraReset = () => {
  if (cameraResetTimeOut !== null) {
    clearTimeout(cameraResetTimeOut);
  }

  isBlinkCameraReset.value = true;
  tcpReq().embedStatus.gripperOpen.reqUserId = userId.value;
  EventBus.publish('childEmitSocketData', tcpReq().embedStatus.cameraReset);

  cameraResetTimeOut = setTimeout(() => {
    isBlinkCameraReset.value = false;
    cameraResetTimeOut = null;
  }, 500);
}

const qualityCheckOpen = async () => {
  await qualityCheck();
}

</script>
