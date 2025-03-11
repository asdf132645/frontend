<template>
  <div class="setting-report-container">
    <div class="setting-report-code-container">
      <h2> [ WBC ] </h2>
      <div class="setting-reportCode-title-wrapper">
        <p class="text-left">IA Class name</p>
        <p class="text-left">LIS(HIS) Class name</p>
      </div>
      <div class="setting-report-code-wrapper">
        <template v-for="item in lisCodeWbcArr" :key="item.classId">
          <p class="text-left">{{ item.fullNm }}</p>
          <input type="text" class="w-fit" v-model="item.key"/>
        </template>
      </div>
    </div>

    <div class="setting-report-code-container">
      <h2> [ RBC ] </h2>
      <div class="setting-reportCode-title-wrapper">
        <p class="text-left">IA Class name</p>
        <p class="text-left">LIS(HIS) Class name</p>
      </div>
      <div class="setting-report-code-wrapper">
        <template v-for="item in lisCodeRbcArr" :key="item.classId">
          <p class="text-left">{{ item.categoryNm }} - {{ item.fullNm }}</p>
          <input type="text" class="w-fit" v-model="item.key"/>
        </template>
      </div>
    </div>

    <div class="setting-report-code-container">
      <h2> [ Min Count ] </h2>

      <div class="setting-reportCode-title-wrapper">
        <p class="text-left">Class name</p>
        <p class="text-left">Count</p>
      </div>
      <div class="setting-report-code-wrapper" v-if="minCountArr.length > 0 && minCountArr.length > 0">
        <p class="text-left">Giant Platelet</p>
        <input type="text" v-model="minCountArr[0].minGPCount" @input="filterNumbersOnly($event, true)"
               class="form-control form-control-sm w-fit">

        <p class="text-left">Platelet Aggregation</p>
          <input type="text" v-model="minCountArr[0].minPACount" @input="filterNumbersOnly($event, false)"
                 class="form-control form-control-sm w-fit">
      </div>
    </div>
  </div>

  <Button @click="saveLis" class="setting-saveBtn mt20">Save</Button>

  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />

  <ToastNotification
      v-if="toastInfo.message"
      :message="toastInfo.message"
      :messageType="toastInfo.messageType"
      :duration="1500"
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
import {ApiResponse} from "@/common/api/httpClient";
import {
  createLisCodeWbcApi,
  createLisCodeRbcApi,
  createMinCountApi,
  getLisCodeWbcApi,
  getLisCodeRbcApi,
  getMinCountApi,
  updateLisCodeWbcApi,
  updateLisCodeRbcApi,
  updateMinCountApi,
  getWbcCustomClassApi,
} from "@/common/api/service/setting/settingApi";
import {LisCodeRbcItem, LisCodeWbcItem} from "@/common/api/service/setting/dto/lisCodeDto";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import {minCountItem} from "@/common/api/service/setting/dto/minCountDto";
import {useStore} from "vuex";
import {scrollToTop} from "@/common/lib/utils/scroll";
import Button from "@/components/commonUi/Button.vue";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useToast} from "@/common/lib/utils/toast";

const store = useStore();
const lisCodeWbcArr = ref<LisCodeWbcItem[] | any>([]);
const lisCodeRbcArr = ref<LisCodeRbcItem[] | any>([]);
const minCountArr = ref<minCountItem[]>([]);
const saveHttpType = ref({
  filePath: '',
  code: '',
})
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const settingType = computed(() => store.state.commonModule.settingType);
const wbcCustomItems = ref<any>([]);
const {toastInfo, showToast} = useToast();

onMounted(async () => {
  await getImagePrintData();
  await getWbcCustomClasses();
  await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.lisCode});
});

watch(() => [lisCodeWbcArr.value, lisCodeRbcArr.value, minCountArr.value], async () => {
  const afterSetting = {
    lisCodeWbcArr: lisCodeWbcArr.value,
    lisCodeRbcArr: lisCodeRbcArr.value,
    minCountArr: minCountArr.value
  }

  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(afterSetting)});
  if (settingType.value !== settingName.lisCode) {
    await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.lisCode});
  }
}, {deep: true});

const getWbcCustomClasses = async () => {
  try {
    const result: any = await getWbcCustomClassApi();
    if (result?.data) {
      wbcCustomItems.value = result.data.filter((item: any) => item.abbreviation && item.fullNm);
      await setLisCodeWbcByCustomClass();
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
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: settingObj});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: settingObj});
}

const saveLisCode = async () => {
  try {
    let result: ApiResponse<void>;
    let rbcResult: ApiResponse<void>;
    let minCountResult: ApiResponse<void>;

    if (saveHttpType.value.code === 'post') {
      result = await createLisCodeWbcApi({lisCodeItems: lisCodeWbcArr.value});
      rbcResult = await createLisCodeRbcApi({lisCodeItems: lisCodeRbcArr.value});
      minCountResult = await createMinCountApi({minCountItems: minCountArr.value});

    } else {
      const updateResult = await updateLisCodeWbcApi({lisCodeItems: lisCodeWbcArr.value});
      const updateRbcResult = await updateLisCodeRbcApi({lisCodeItems: lisCodeRbcArr.value});
      const updateMinCountResult = await updateMinCountApi({minCountItems: minCountArr.value});

      if (updateResult.data && updateRbcResult.data && updateMinCountResult.data) {
        showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
        scrollToTop();
        await getImagePrintData();
      } else {
        showToast(MSG.TOAST.UPDATE_FAIL, MESSAGES.TOAST_MSG_ERROR);
      }
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
      return;
    }

    if (result && rbcResult && minCountResult) {
      showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
      scrollToTop();
      saveHttpType.value.code = 'put';
      await getImagePrintData();
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
    }
  } catch (e) {
    console.error(e);
  }
};

const filterNumbersOnly = (event: Event, is: boolean) => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^0-9]/g, '');
  if (is) {
    minCountArr.value[0].minGPCount = Number(filteredValue.trim());
  } else {
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
        saveHttpType.value.code = 'post';
        lisCodeWbcArr.value = lisCodeWbcOption;
      } else {
        saveHttpType.value.code = 'put';
        lisCodeWbcArr.value = wbcData;
      }

      if (!rbcData || (rbcData instanceof Array && rbcData.length === 0)) {
        saveHttpType.value.code = 'post';
        lisCodeRbcArr.value = LIS_CODE_RBC_OPTION;
      } else {
        saveHttpType.value.code = 'put';
        lisCodeRbcArr.value = rbcData;
      }

      if (!minCountData || (minCountData instanceof Array && minCountData.length === 0)) {
        saveHttpType.value.code = 'post';
        minCountArr.value = minRunCount;
      } else {
        saveHttpType.value.code = 'put';
        minCountArr.value = minCountData;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const hideAlert = () => {
  showAlert.value = false;
};

const saveLis = async () => {
  await saveLisCode();
}

</script>

