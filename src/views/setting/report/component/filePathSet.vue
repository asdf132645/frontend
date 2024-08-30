<template>
  <div class="alignDiv" style="text-align: center">
    <ul>
      <li>
        <p class="mb2">LIS Hot Key</p>
        <input type="text" :value="filePathSetArr[0] ? filePathSetArr[0].lisHotKey : ''"
               @input="updateHotKey($event, 0)">
      </li>
      <li>
        <p class="mb2 mt2">LIS File Path</p>
        <input type="text" :value="filePathSetArr[0] ? filePathSetArr[0].lisFilePath : ''"
               @input="updateFilePath($event, 0)">
      </li>
      <li>
        <p class="mb2 mt2">CBC File Path</p>
        <input type="text" :value="filePathSetArr[0] ? filePathSetArr[0].cbcFilePath : ''"
               @input="updateCbcFilePath($event, 0)">
      </li>
    </ul>
  </div>
  <div class="mt1">
    <button class="saveBtn" type="button" @click="saveFilePathSet()">Save</button>
  </div>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :message="confirmMessage"
      :confirmText="messages.SAVE"
      :closeText="messages.LEAVE"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />

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
import {ref, onMounted, computed, watch} from 'vue';
import {lisHotKeyAndLisFilePathAndUrl, settingName} from "@/common/defines/constFile/settings";
import {ApiResponse} from "@/common/api/httpClient";
import { createFilePathSetApi, getFilePathSetApi, updateFilePathSetApi } from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {FilePathItem} from "@/common/api/service/setting/dto/filePathSetDto";
import {messages} from '@/common/defines/constFile/constantMessageText';
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const store = useStore();
const router = useRouter();
const filePathSetArr = ref<FilePathItem[]>([]);
const saveHttpType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);

onMounted(async () => {
  await getFilePathSetData();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.filePathSet });
});

watch(() => filePathSetArr.value, async (filePathSetArr) => {
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(filePathSetArr)});
  if (settingType.value !== settingName.filePathSet) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.filePathSet });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
}

const saveFilePathSet = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createFilePathSetApi({filePathSetItems: filePathSetArr.value });
    } else {
      const updateResult = await updateFilePathSetApi({ filePathSetItems: filePathSetArr.value });

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getFilePathSetData();
      } else {
        showErrorAlert(messages.settingUpdateFailure);
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }

    if (result) {
      showSuccessAlert(messages.settingSaveSuccess);
      saveHttpType.value = 'put';
      await getFilePathSetData();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
    }
  } catch (e) {
    console.error(e);
  }
};

const getFilePathSetData = async () => {
  try {
    const result = await getFilePathSetApi();

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        saveHttpType.value = 'post';
        filePathSetArr.value = lisHotKeyAndLisFilePathAndUrl;
      } else {
        saveHttpType.value = 'put';
        filePathSetArr.value = data;
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(filePathSetArr.value) });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(filePathSetArr.value) });
    }
  } catch (e) {
    console.error(e);
  }
};

const updateHotKey = (event: any, index: number) => {
  filePathSetArr.value[index].lisHotKey = event.target.value;
};

const updateFilePath = (event: any, index: number) => {
  filePathSetArr.value[index].lisFilePath = event.target.value;
};

const updateCbcFilePath = (event: any, index: number) => {
  filePathSetArr.value[index].cbcFilePath = event.target.value;
};


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

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  await saveFilePathSet();
  showConfirm.value = false;
}

</script>

