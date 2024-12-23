<template>
  <div class="alignDiv">
    <p class="mb40"> [ WBC ] </p>
    <label v-for="item in lisCodeWbcArr" :key="item.classId">
      <p class="mb10">{{ item.fullNm }}</p>
      <input type="text" v-model="item.key" />
    </label>
  </div>
  <div class="alignDiv">
    <p class="mt20 mb40"> [ RBC ] </p>
    <label v-for="item in lisCodeRbcArr" :key="item.fullNm">
      <p class="mb10">{{ item.categoryNm }} - {{ item.fullNm }}</p>
      <input type="text" v-model="item.key" />
    </label>
  </div>
  <div class="alignDiv">
    <p class="mb20"> [ Min Count ] </p>
    <ul>
      <li class="minCountWrapper" v-if="minCountArr.length > 0">
        <p class="mb10 mt10">Giant Platelet</p>
        <input type="text" v-model="minCountArr[0].minGPCount" @input="filterNumbersOnly($event, true)" class="form-control form-control-sm">
      </li>
      <li class="minCountWrapper" v-if="minCountArr.length > 0">
        <p class="mb10 mt10">Platelet Aggregation</p>
        <input type="text" v-model="minCountArr[0].minPACount" @input="filterNumbersOnly($event, false)" class="form-control form-control-sm">
      </li>
    </ul>
  </div>

  <div class="mt10">
    <button class="saveBtn" type="button" @click="saveLisCode()">Save</button>
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
import {ref, onMounted, computed, watch} from 'vue';
import {
  lisCodeWbcOption,
  LIS_CODE_RBC_OPTION,
  minRunCount,
  settingName,
  WBC_CUSTOM_CLASS
} from "@/common/defines/constants/settings";
import { ApiResponse } from "@/common/api/httpClient";
import {
  createLisCodeWbcApi, createLisCodeRbcApi, createMinCountApi,
  getLisCodeWbcApi, getLisCodeRbcApi, getMinCountApi,
  updateLisCodeWbcApi, updateLisCodeRbcApi, updateMinCountApi, getWbcCustomClassApi
} from "@/common/api/service/setting/settingApi";
import {LisCodeRbcItem, LisCodeWbcItem} from "@/common/api/service/setting/dto/lisCodeDto";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES} from '@/common/defines/constants/constantMessageText';
import {minCountItem} from "@/common/api/service/setting/dto/minCountDto";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {classArr} from "@/common/api/service/setting/dto/wbcCustomClassDto";
import {scrollToTop} from "@/common/lib/utils/scroll";

const store = useStore();
const router = useRouter();
const lisCodeWbcArr = ref<LisCodeWbcItem[] | any>([]);
const lisCodeRbcArr = ref<LisCodeRbcItem[] | any>([]);
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
const wbcCustomItems = ref<any>([]);

onMounted(async () => {
  await getImagePrintData();
  await getWbcCustomClasses();
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
  confirmMessage.value = `${settingType.value} ${MESSAGES.settingNotSaved}`;
}

const getWbcCustomClasses = async () => {
  try {
    const result: any = await getWbcCustomClassApi();
    if (result?.data) {
      wbcCustomItems.value = result.data.filter((item: any) => item.abbreviation && item.fullNm);
      setLisCodeWbcByCustomClass();
    }
  } catch (e) {
    console.error('Error fetching WBC custom classes:', e);
  }
}

const setLisCodeWbcByCustomClass = async () => {
  const wbcCustomItemClassIds = new Set(wbcCustomItems.value.map((item: any) => item.customNum));
  const lisCodeWbcClassIds = new Set(lisCodeWbcArr.value.map((item: any) => item.classId));
  const wbcCustomClassDefaultIds = new Set(WBC_CUSTOM_CLASS.map(item => String(item.customNum)));

  // lisCodeWbc에서 없는 Custom Class 삭제 및 Custom Class 추가
  lisCodeWbcArr.value = lisCodeWbcArr.value.filter((wbcInfo: LisCodeWbcItem) =>
      !(wbcCustomClassDefaultIds.has(wbcInfo.classId) && !wbcCustomItemClassIds.has(wbcInfo.classId))
  );

  const newItems = wbcCustomItems.value
      .filter((item: any) => !lisCodeWbcClassIds.has(item.customNum))
      .map((item: any) => ({
        fullNm: item.fullNm,
        classId: item.customNum,
        key: '',
      }));

  lisCodeWbcArr.value = [...lisCodeWbcArr.value, ...newItems];

  const settingObj = {
    lisCodeWbcArr: lisCodeWbcArr.value,
    lisCodeRbcArr: lisCodeRbcArr.value,
    minCountArr: minCountArr.value
  }
  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: settingObj });
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: settingObj });
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
        showSuccessAlert(MESSAGES.UPDATE_SUCCESSFULLY);
        scrollToTop();
        await getImagePrintData();
      } else {
        showErrorAlert(MESSAGES.settingUpdateFailure);
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }

    if (result && rbcResult && minCountResult) {
      showSuccessAlert(MESSAGES.settingSaveSuccess);
      scrollToTop();
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
        lisCodeRbcArr.value = LIS_CODE_RBC_OPTION;
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

