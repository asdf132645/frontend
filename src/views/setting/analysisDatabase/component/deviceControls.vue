<template>
  <div>
    <ul class="customSettingContainer">
      <li>
        <p class="mb1">Gripper Open</p>
        <button @click="onGripperOpen" type="button" class="defaultBtn">OK</button>
      </li>
      <li class="mt2">
        <p class="mb1">Camera Reset</p>
        <button type="button" class="defaultBtn" @click="onCameraReset">OK</button>
      </li>
      <li class="mt2">
        <p class="mb1">Charge Remaining Count</p>
        <button type="button" class="defaultBtn">Scan</button>
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

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const store = useStore();

const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const runInfo = computed(() => store.state.commonModule);
const isRunningState = ref(false);


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


const onGripperOpen = () => {
  if(isRunningState.value){
    showSuccessAlert(messages.IDS_ERROR_ALREADY_RUNNING);
    return;
  }
  onGripperOpenWebSocket(userId.value);
}

const onCameraReset = () => {
  if(isRunningState.value){
    showSuccessAlert(messages.IDS_ERROR_ALREADY_RUNNING);
    return;
  }
  onCameraResetWebSocket(userId.value);
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
