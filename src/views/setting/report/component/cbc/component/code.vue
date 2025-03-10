<template>
  <div class="alignDiv" style="width: 660px;">
    <table class="setting-table">
      <colgroup>
        <col width="60%"/>
        <col width="30%"/>
        <col width="10%"/>
      </colgroup>
      <thead>
      <tr>
        <th class="text-left">Class name</th>
        <th>CBC Code</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody>
      <tr class="pos-relative" v-for="item in cbcCodeArr" :key="item.cd">
        <td v-if="editingCBCCd !== item.cd" class="text-left">{{ item.fullNm }}</td>
        <td v-else>
          <input type="text" v-model="item.fullNm" />
        </td>

        <td>
          <input class="w140" type="text" v-model="item.classCd" />
        </td>

        <td class="pos-relative flex-center gap14">
          <font-awesome-icon
              v-show="editingCBCCd !== item.cd"
              @click="editCBC(item.cd)"
              class="cursorPointer hoverSizeAction"
              :icon="['fas', 'pen-to-square']"
          />
          <font-awesome-icon
              v-show="editingCBCCd === item.cd"
              @click="clearEditing"
              class="cursorPointer hoverSizeAction "
              :icon="['fas', 'square-check']" />
          <font-awesome-icon
              @click="deleteCBCCode(item.cd)"
              class="cursorPointer hoverSizeAction"
              style="margin-right: 4px;"
              :icon="['fas', 'trash']" />
        </td>
      </tr>
      </tbody>
    </table>
    <div>
      <Button
          @click="addCBCCode"
          :icon="['fas', 'plus']"
          class="setting-saveBtn"
      >
      </Button>
    </div>

    <Button @click="saveCbcSetting" class="setting-saveBtn mt10">
      Save
    </Button>
  </div>

  <ToastNotification
      v-if="toastInfo.message"
      :message="toastInfo.message"
      :messageType="toastInfo.messageType"
      :duration="1500"
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
import { ref, onMounted, computed, watch } from 'vue';
import {
  defaultCbcList,
  defaultCbcList_0011,
  lisHotKeyAndLisFilePathAndUrl,
  settingName
} from "@/common/defines/constants/settings";
import { ApiResponse } from "@/common/api/httpClient";
import {
  createCbcCodeRbcApi, createFilePathSetApi,
  getCbcCodeRbcApi,
  getFilePathSetApi,
  updateCbcCodeRbcApi, updateFilePathSetApi
} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import { CbcCodeItem } from "@/common/api/service/setting/dto/lisCodeDto";
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import { getDeviceInfoApi } from "@/common/api/service/device/deviceApi";
import { useStore } from "vuex";
import { HOSPITAL_SITE_CD_BY_NAME } from "@/common/defines/constants/siteCd";
import {FilePathItem} from "@/common/api/service/setting/dto/filePathSetDto";
import Button from "@/components/commonUi/Button.vue";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useToast} from "@/common/lib/utils/toast";

const store = useStore();
const cbcCodeArr = ref<CbcCodeItem[]>([]);
const filePathSetArr = ref<FilePathItem[]>([]);
const saveHttpType = ref({
  code: '',
  filePath: '',
})
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const settingType = computed(() => store.state.commonModule.settingType);
const siteCd = ref('');
const editingCBCCd = ref('00');
const { toastInfo, showToast } = useToast();

onMounted(async () => {
  await getDeviceInfo();
  await getImagePrintData();
  await getFilePathSetData();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.cbcCode });
});

watch(() => cbcCodeArr.value, async (cbcCodeArrAfterSetting) => {
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(cbcCodeArrAfterSetting) });
  if (settingType.value !== settingName.cbcCode) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.cbcCode });
  }
}, { deep: true });

const saveCbcCode = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value.code === 'post') {
      result = await createCbcCodeRbcApi({ cbcCodeItems: cbcCodeArr.value });
    } else {
      const updateResult = await updateCbcCodeRbcApi({ cbcCodeItems: cbcCodeArr.value });

      if (updateResult?.data) {
        showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
        await getImagePrintData();
      } else {
        showToast(MSG.TOAST.UPDATE_FAIL, MESSAGES.TOAST_MSG_ERROR);
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }

    if (result) {
      showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
      saveHttpType.value.code = 'put';
      await getImagePrintData();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
    }
  } catch (e) {
    console.error(e);
  }
};

const saveCbcSetting = async () => {
  await saveCbcCode();
  await saveFilePathSet();
}

const saveFilePathSet = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createFilePathSetApi({filePathSetItems: filePathSetArr.value});
    } else {
      const updateResult = await updateFilePathSetApi({filePathSetItems: filePathSetArr.value});

      if (updateResult.data) {
        showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
        await getFilePathSetData();
      } else {
        showToast(MSG.TOAST.UPDATE_FAIL, MESSAGES.TOAST_MSG_ERROR);
      }
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
      return;
    }

    if (result) {
      showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
      saveHttpType.value = 'put';
      await getFilePathSetData();
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
    }
  } catch (e) {
    console.error(e);
  }
};

const getImagePrintData = async () => {
  try {
    const result = await getCbcCodeRbcApi();

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        saveHttpType.value.code = 'post';

        if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
          cbcCodeArr.value = defaultCbcList_0011;
        } else {
          cbcCodeArr.value = defaultCbcList;
        }

      } else {
        saveHttpType.value.code = 'put';
        cbcCodeArr.value = data;
      }

      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(cbcCodeArr.value) });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(cbcCodeArr.value) });
    }
  }
  catch (e) {
    console.error(e);
  }
};

const getDeviceInfo = async () => {
  try {
    const deviceData = await getDeviceInfoApi();
    siteCd.value = deviceData.data.siteCd;
  } catch (e) {
    console.error(e);
  }
}

const addCBCCode = () => {
  let maxCBCCode = Math.max(...cbcCodeArr.value.map(item => Number(item.cd))) + 1;
  const cbcCodeCd = maxCBCCode.toString().padStart(2, '0');
  const defaultCBCCode = { cd: cbcCodeCd, classCd: '', fullNm: 'Edit CBC Code', isSelected: true };
  cbcCodeArr.value.push(defaultCBCCode);
}

const deleteCBCCode = (cbcCd: string) => {
  cbcCodeArr.value = cbcCodeArr.value.filter(item => Number(item.cd) !== Number(cbcCd));
}

const editCBC = (CBCCd: string) => editingCBCCd.value = CBCCd;

const clearEditing = () => {
  editingCBCCd.value = '00';
}

const getFilePathSetData = async () => {
  try {
    const result = await getFilePathSetApi();

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        saveHttpType.value.filePath = 'post';
        filePathSetArr.value = lisHotKeyAndLisFilePathAndUrl;
      } else {
        saveHttpType.value.filePath = 'put';
        filePathSetArr.value = data;
      }
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: JSON.stringify(filePathSetArr.value)});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(filePathSetArr.value)});
    }
  } catch (e) {
    console.error(e);
  }
};

const hideAlert = () => {
  showAlert.value = false;
};

</script>

