<template>

  <div class="setting-activeBtn-container flex-center">
    <Button @click="handleSettingMenu('filePath')" :isActive="activeTab === 'filePath'">File Path</Button>
    <Button @click="handleSettingMenu('code')" :isActive="activeTab === 'code'">Code</Button>
  </div>

  <FilePathSet v-if="activeTab === 'filePath'" type="cbc" />

  <div v-if="activeTab === 'code'" class="alignDiv" style="width: 660px;">
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

        <td class="pos-relative">
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
<!--    <label class="pos-relative" v-for="item in cbcCodeArr" :key="item.cd">-->
<!--      <p v-if="editingCBCCd !== item.cd" class="pt5">{{ item.fullNm }}</p>-->
<!--      <input v-else type="text" v-model="item.fullNm" />-->
<!--      <div class="pos-relative w220 flex-align-center">-->
<!--        <font-awesome-icon-->
<!--            v-show="editingCBCCd !== item.cd"-->
<!--            @click="editCBC(item.cd)"-->
<!--            class="cursorPointer hoverSizeAction cbc-setting-icon"-->
<!--            :icon="['fas', 'pen-to-square']"-->
<!--        />-->
<!--        <font-awesome-icon-->
<!--            v-show="editingCBCCd === item.cd"-->
<!--            @click="clearEditing"-->
<!--            class="cursorPointer hoverSizeAction cbc-setting-icon"-->
<!--            :icon="['fas', 'square-check']" />-->
<!--        <font-awesome-icon-->
<!--            @click="deleteCBCCode(item.cd)"-->
<!--            class="cursorPointer hoverSizeAction"-->
<!--            style="margin-right: 4px;"-->
<!--            :icon="['fas', 'trash']" />-->
<!--        <input type="text" v-model="item.classCd" />-->
<!--      </div>-->
<!--    </label>-->

    <button class="cursorPointer" @click="addCBCCode"><font-awesome-icon :icon="['fas', 'plus']" /></button>
    <div class="mt10">
      <button class="saveBtn" type="button" @click="saveCbcSetting">Save</button>
    </div>
  </div>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      type="setting"
      :message="confirmMessage"
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
import { MESSAGES } from '@/common/defines/constants/constantMessageText';
import { getDeviceInfoApi } from "@/common/api/service/device/deviceApi";
import Confirm from "@/components/commonUi/Confirm.vue";
import { useStore } from "vuex";
import { HOSPITAL_SITE_CD_BY_NAME } from "@/common/defines/constants/siteCd";
import {scrollToTop} from "@/common/lib/utils/scroll";
import {FilePathItem} from "@/common/api/service/setting/dto/filePathSetDto";
import FilePathSet from "@/views/setting/report/component/filePathSet.vue";
import Button from "@/components/commonUi/Button.vue";
import {CbcActiveSettingType} from "@/common/type/settings";

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
const showConfirm = ref(false);
const confirmMessage = ref('');
const activeTab = ref('filePath');
const movingTab = ref('');
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);
const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);
const isSettingChanged = computed(() => beforeSettingFormattedString.value !== afterSettingFormattedString.value);
const siteCd = ref('');
const editingCBCCd = ref('00');

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

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.settingNotSaved;
}

const saveCbcCode = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value.code === 'post') {
      result = await createCbcCodeRbcApi({ cbcCodeItems: cbcCodeArr.value });
    } else {
      const updateResult = await updateCbcCodeRbcApi({ cbcCodeItems: cbcCodeArr.value });

      if (updateResult?.data) {
        showSuccessAlert(MESSAGES.UPDATE_SUCCESSFULLY);
        await getImagePrintData();
      } else {
        showErrorAlert(MESSAGES.settingUpdateFailure);
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }

    if (result) {
      showSuccessAlert(MESSAGES.settingSaveSuccess);
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
        showSuccessAlert(MESSAGES.UPDATE_SUCCESSFULLY);
        await getFilePathSetData();
      } else {
        showErrorAlert(MESSAGES.settingUpdateFailure);
      }
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
      return;
    }

    if (result) {
      showSuccessAlert(MESSAGES.settingSaveSuccess);
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

const updateCbcFilePath = (event: any, index: number) => {
  filePathSetArr.value[index].cbcFilePath = event.target.value;
};

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
  scrollToTop();
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
  activeTab.value = movingTab.value;
}

const handleOkConfirm = async () => {
  await saveCbcCode();
  showConfirm.value = false;
}

const handleSettingMenu = (type: keyof CbcActiveSettingType) => {
  if (activeTab.value === type) {
    return;
  }

  movingTab.value = type;

  if (isSettingChanged.value) {
    showConfirm.value = true;
    confirmMessage.value = MESSAGES.settingNotSaved;
    return;
  }

  activeTab.value = type;
}

</script>

