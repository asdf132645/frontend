<template>
  <div>
    <ul class="customSettingContainer">
      <li>
        <p class="mb1">Gripper Open</p>
        <button @click="onGripperOpen" :class="{'defaultBtn': true, 'blinkGripper': isBlinkingGripper}">OK</button>
      </li>
      <li class="mt2">
        <p class="mb1">Camera Reset</p>
        <button type="button" class="defaultBtn" :class="{'defaultBtn': true, 'blinkGripper': isBlinkCameraReset}"
                @click="onCameraReset">OK
        </button>
      </li>
      <li class="mt2">
        <p class="mb1">Charge Remaining Count</p>
        <button type="button" class="defaultBtn" @click="onScan">Scan</button>
      </li>
    </ul>
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
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import Alert from "@/components/commonUi/Alert.vue";
import {messages} from "@/common/defines/constFile/constantMessageText";
import {onCameraResetWebSocket, onGripperOpenWebSocket} from "@/common/lib/sendWebSocket/common";
import EventBus from "@/eventBus/eventBus";
import {tcpReq} from "@/common/tcpRequest/tcpReq";
import {remainingCount} from "@/common/api/service/setting/settingApi";

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const store = useStore();

const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const runInfo = computed(() => store.state.commonModule);
const isRunningState = ref(false);
const isBlinkingGripper = ref(false);
const isBlinkCameraReset = ref(false);
let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
let cameraResetTimeOut: ReturnType<typeof setTimeout> | null = null;


onMounted(async () => {
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

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};
const hideAlert = () => {
  showAlert.value = false;
};


</script>
