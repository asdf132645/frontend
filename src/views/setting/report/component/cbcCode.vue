<template>
  <div class="alignDiv" style="width: 660px;">
    <label class="pos-relative" v-for="item in cbcCodeArr" :key="item.cd">
      <p v-if="editingCBCCd !== item.cd" class="pt5">{{ item.fullNm }}</p>
      <input v-else type="text" v-model="item.fullNm" />
      <div class="pos-relative w220 flex-align-center">
        <font-awesome-icon
            v-show="editingCBCCd !== item.cd"
            @click="editCBC(item.cd)"
            class="cursorPointer hoverSizeAction cbc-setting-icon"
            :icon="['fas', 'pen-to-square']"
        />
        <font-awesome-icon
            v-show="editingCBCCd === item.cd"
            @click="clearEditing"
            class="cursorPointer hoverSizeAction cbc-setting-icon"
            :icon="['fas', 'square-check']" />
        <font-awesome-icon
            @click="deleteCBCCode(item.cd)"
            class="cursorPointer hoverSizeAction"
            style="margin-right: 4px;"
            :icon="['fas', 'trash']" />
        <input type="text" v-model="item.classCd" />
      </div>
    </label>
  </div>

  <button class="cursorPointer" @click="addCBCCode"><font-awesome-icon :icon="['fas', 'plus']" /></button>
  <div class="mt10">
    <button class="saveBtn" type="button" @click="saveCbcCode()">Save</button>
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
import { defaultCbcList, defaultCbcList_0011, settingName } from "@/common/defines/constants/settings";
import { ApiResponse } from "@/common/api/httpClient";
import { createCbcCodeRbcApi, getCbcCodeRbcApi, updateCbcCodeRbcApi } from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import { CbcCodeItem } from "@/common/api/service/setting/dto/lisCodeDto";
import { MESSAGES } from '@/common/defines/constants/constantMessageText';
import { getDeviceInfoApi } from "@/common/api/service/device/deviceApi";
import Confirm from "@/components/commonUi/Confirm.vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { HOSPITAL_SITE_CD_BY_NAME } from "@/common/defines/constants/siteCd";
import {scrollToTop} from "@/common/lib/utils/scroll";

const store = useStore();
const router = useRouter();
const cbcCodeArr = ref<CbcCodeItem[]>([]);
const saveHttpType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);
const siteCd = ref('');
const editingCBCCd = ref('00');

onMounted(async () => {
  await getDeviceInfo();
  await getImagePrintData();
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
  confirmMessage.value = `${settingType.value} ${MESSAGES.settingNotSaved}`;
}

const saveCbcCode = async () => {
  try {
    let result: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
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
      saveHttpType.value = 'put';
      await getImagePrintData();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
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
        saveHttpType.value = 'post';

        if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
          cbcCodeArr.value = defaultCbcList_0011;
        } else {
          cbcCodeArr.value = defaultCbcList;
        }

      } else {
        saveHttpType.value = 'put';
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
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  await saveCbcCode();
  showConfirm.value = false;
}

</script>

