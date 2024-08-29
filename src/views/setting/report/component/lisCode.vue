<template>
  <div class="alignDiv">
    <p class="mb4"> [ WBC ] </p>
    <label v-for="item in lisCodeWbcArr" :key="item.classId">
      <p class="mb1">{{ item.fullNm }}</p>
      <input type="text" v-model="item.key" />
    </label>
  </div>
  <div class="alignDiv">
    <p class="mt2 mb4"> [ RBC ] </p>
    <label v-for="item in lisCodeRbcArr" :key="item.fullNm">
      <p class="mb1">{{ item.categoryNm }} - {{ item.fullNm }}</p>
      <input type="text" v-model="item.key" />
    </label>
  </div>
  <div class="alignDiv">
    <p class="mb2"> [ Min Count ] </p>
    <ul>
      <li class="minCountWrapper" v-if="minCountArr.length > 0">
        <p class="mb1 mt1">Giant Platelet</p>
        <input type="text" v-model="minCountArr[0].minGPCount" @input="filterNumbersOnly($event, true)" class="form-control form-control-sm">
      </li>
      <li class="minCountWrapper" v-if="minCountArr.length > 0">
        <p class="mb1 mt1">Platelet Aggregation</p>
        <input type="text" v-model="minCountArr[0].minPACount" @input="filterNumbersOnly($event, false)" class="form-control form-control-sm">
      </li>
    </ul>
  </div>

  <div class="mt1">
    <button class="saveBtn" type="button" @click="saveLisCode()">Save</button>
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
import {lisCodeWbcOption, lisCodeRbcOption, minRunCount, settingName} from "@/common/defines/constFile/settings";
import { ApiResponse } from "@/common/api/httpClient";
import {
  createLisCodeWbcApi, createLisCodeRbcApi, createMinCountApi,
  getLisCodeWbcApi, getLisCodeRbcApi, getMinCountApi,
  updateLisCodeWbcApi, updateLisCodeRbcApi, updateMinCountApi
} from "@/common/api/service/setting/settingApi";
import {LisCodeRbcItem, LisCodeWbcItem} from "@/common/api/service/setting/dto/lisCodeDto";
import Alert from "@/components/commonUi/Alert.vue";
import {messages} from '@/common/defines/constFile/constantMessageText';
import {minCountItem} from "@/common/api/service/setting/dto/minCountDto";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const store = useStore();
const router = useRouter();
const lisCodeWbcArr = ref<LisCodeWbcItem[]>([]);
const lisCodeRbcArr = ref<LisCodeRbcItem[]>([]);
const minCountArr = ref<minCountItem[]>([]);
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
  await getImagePrintData();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.lisCode });
});

watch(() => [lisCodeWbcArr.value, lisCodeRbcArr.value, minCountArr.value], async () => {
  const afterSetting = {
    lisCodeWbcArr: lisCodeWbcArr.value,
    lisCodeRbcArr: lisCodeRbcArr.value,
    minCountArr: minCountArr.value
  }

  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(afterSetting) });
  if (settingType.value !== settingName.lisCode) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.lisCode });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
}

const saveLisCode = async () => {
  try {
    let result: ApiResponse<void>;
    let rbcResult: ApiResponse<void>;
    let minCountResult: ApiResponse<void>;

    if (saveHttpType.value === 'post') {
      result = await createLisCodeWbcApi({ lisCodeItems: lisCodeWbcArr.value });
      rbcResult = await createLisCodeRbcApi({ lisCodeItems: lisCodeRbcArr.value });
      minCountResult = await createMinCountApi({ minCountItems: minCountArr.value });

    } else {
      const updateResult = await updateLisCodeWbcApi({ lisCodeItems: lisCodeWbcArr.value });
      const updateRbcResult = await updateLisCodeRbcApi({ lisCodeItems: lisCodeRbcArr.value });
      const updateMinCountResult = await updateMinCountApi({ minCountItems: minCountArr.value });

      if (updateResult.data && updateRbcResult.data && updateMinCountResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getImagePrintData();
      } else {
        showErrorAlert(messages.settingUpdateFailure);
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }

    if (result && rbcResult && minCountResult) {
      showSuccessAlert(messages.settingSaveSuccess);
      saveHttpType.value = 'put';
      await getImagePrintData();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
    }
  } catch (e) {
    console.error(e);
  }
};
const filterNumbersOnly = (event: Event, is: boolean) => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^0-9]/g, '');
  if (is){
    minCountArr.value[0].minGPCount = Number(filteredValue.trim());
  }else {
    minCountArr.value[0].minPACount = Number(filteredValue.trim());
  }
};

const getImagePrintData = async () => {
  try {
    const wbcResult = await getLisCodeWbcApi();
    const rbcResult = await getLisCodeRbcApi();
    const minCountResult = await getMinCountApi();

    if (wbcResult && wbcResult.data && rbcResult && rbcResult.data && minCountResult && minCountResult.data) {
      const wbcData = wbcResult.data;
      const rbcData = rbcResult.data;
      const minCountData = minCountResult.data;

      if (!wbcData || (wbcData instanceof Array && wbcData.length === 0)) {
        saveHttpType.value = 'post';
        lisCodeWbcArr.value = lisCodeWbcOption;
      } else {
        saveHttpType.value = 'put';
        lisCodeWbcArr.value = wbcData;
      }

      if (!rbcData || (rbcData instanceof Array && rbcData.length === 0)) {
        saveHttpType.value = 'post';
        lisCodeRbcArr.value = lisCodeRbcOption;
      } else {
        saveHttpType.value = 'put';
        lisCodeRbcArr.value = rbcData;
      }

      if (!minCountData || (minCountData instanceof  Array && minCountData.length === 0)) {
        saveHttpType.value = 'post';
        minCountArr.value = minRunCount;
      } else {
        saveHttpType.value = 'put';
        minCountArr.value = minCountData;
      }

      const settingObj = {
        lisCodeWbcArr: lisCodeWbcArr.value,
        lisCodeRbcArr: lisCodeRbcArr.value,
        minCountArr: minCountArr.value
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: settingObj });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: settingObj });
    }
  } catch (e) {
    console.error(e);
  }
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
  await saveLisCode();
  showConfirm.value = false;
}

</script>

