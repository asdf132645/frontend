<template>
  <div>
    <ul>
      <li>
        <p>Gripper open</p>
        <button @click="onGripperOpen">OK</button>
      </li>
      <li>
        <p>Camera reset</p>
        <button @click="onCameraReset">OK</button>
      </li>
      <li>
        <p>Charge remaining count</p>
        <button>Scan</button>
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
import {messages} from "@/common/defines/constFile/constant";
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
    alert(messages.IDS_ERROR_ALREADY_RUNNING);
    return;
  }
  onGripperOpenWebSocket(userId.value);
}

const onCameraReset = () => {
  if(isRunningState.value){
    alert(messages.IDS_ERROR_ALREADY_RUNNING);
    return;
  }
  onCameraResetWebSocket(userId.value);
}

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};


</script>
