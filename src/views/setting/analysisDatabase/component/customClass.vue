<template>
  <div>
    <ul class="customClass customSettingContainer">
      <li v-for="item in wbcCustomItems" :key="item.id">
        <span>ID: {{ item.customNum }}</span>
        <span>
          <input
              v-model="item.abbreviation"
              type="text"
              maxlength="3"
              placeholder="abbreviation"
              @input="filterEnglishAndNumbers($event, item, 'abbreviation')"
          />
        </span>
        <span>
          <input
              v-model="item.fullNm"
              type="text"
              maxlength="25"
              placeholder="class name"
              @input="filterEnglishAndNumbers($event, item, 'fullNm')"
          />
        </span>
      </li>
    </ul>
    <button class="saveBtn" type="button" @click="saveWbcCustomClass">Save</button>
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
import {ref, onMounted, onBeforeMount, computed, watch} from 'vue';
import {
  createWbcCustomClassApi,
  updateWbcCustomClassApi,
  getWbcCustomClassApi, getOrderClassApi,
} from "@/common/api/service/setting/settingApi";
import { ApiResponse } from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES} from '@/common/defines/constants/constantMessageText';
import { basicWbcArr, basicBmClassList } from "@/store/modules/analysis/wbcclassification";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {settingName, WBC_CUSTOM_CLASS} from "@/common/defines/constants/settings";

const store = useStore();
const router = useRouter();
const saveHttpType = ref('');
const wbcCustomItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const projectBm = ref(false);
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);
const wbcClassOrder = ref<any>([]);

onBeforeMount(() => {
  projectBm.value = window.PROJECT_TYPE === 'bm'
})

onMounted(async () => {
  await getWbcCustomClasses();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.wbcCustomClass });
});

watch(() => wbcCustomItems.value, async (wbcCustomItemsAfterSettingObj) => {
  if (settingType.value !== settingName.wbcCustomClass) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.wbcCustomClass });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = `${settingType.value} ${MESSAGES.settingNotSaved}`;
}

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length > 0) {
        wbcClassOrder.value = result.data.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
      }

      const classOrderBeforeSettingObj = wbcClassOrder.value;
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(classOrderBeforeSettingObj)});
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(classOrderBeforeSettingObj)});
    }
  } catch (e) {
    console.error(e)
  }
}

const saveWbcCustomClass = async () => {
  if (!validateCustomClass()) {
    return;
  }

  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createWbcCustomClassApi({ classArr: wbcCustomItems.value });
    } else {
      const updateResult = await updateWbcCustomClassApi({ classArr: wbcCustomItems.value });

      if (updateResult.data) {
        showSuccessAlert(MESSAGES.UPDATE_SUCCESSFULLY);
        await getWbcCustomClasses();
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
      await getWbcCustomClasses();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
    }
  } catch (e) {
    console.error(e);
  }
};
const filterEnglishAndNumbers = (event: Event, item: any, field: 'abbreviation' | 'fullNm') => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^a-zA-Z0-9]/g, '');
  item[field] = filteredValue.trim();
};

const getWbcCustomClasses = async () => {
  try {
    const result = await getWbcCustomClassApi();
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        saveHttpType.value = 'post';
        wbcCustomItems.value = WBC_CUSTOM_CLASS;
      } else {
        saveHttpType.value = 'put';
        wbcCustomItems.value = result.data;
      }

      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(wbcCustomItems.value) });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(wbcCustomItems.value) });
    }
  } catch (e) {
    console.error(e);
  }
}

const validateCustomClass = () => {
  let existingClassFullNmArr, existingClassAbbreivationArr;

  if (projectBm.value ) {
    existingClassFullNmArr = basicBmClassList.map(item => item.fullNm);
    existingClassAbbreivationArr = basicBmClassList.map(item => item.abbreviation)
  } else {
    existingClassFullNmArr = basicWbcArr.map(item => item.fullNm)
    existingClassAbbreivationArr = basicWbcArr.map(item => item.abbreviation);
  }

  for (const wbcCustomItem of wbcCustomItems.value) {
    if (wbcCustomItem.fullNm === '' && wbcCustomItem.abbreviation !== '') {
      showErrorAlert("You should enter abbreviation")
      return false;
    } else if (wbcCustomItem.fullNm !== '' && wbcCustomItem.abbreviation === '') {
      showErrorAlert("You should enter class name")
      return false;
    }

    if (existingClassAbbreivationArr.includes(wbcCustomItem.abbreviation)) {
      showErrorAlert(`${wbcCustomItem.abbreviation} is existing abbreviation`)
      return false;
    } else if (existingClassFullNmArr.includes(wbcCustomItem.fullNm)) {
      showErrorAlert(`${wbcCustomItem.fullNm} is existing class name`)
      return false;
    } else if (wbcCustomItem.abbreviation === 'OT') {
      showErrorAlert("Can't use OT abbreviation!")
      return false;
    }
  }

  return true;
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

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  await saveWbcCustomClass();
  showConfirm.value = false;
}

</script>
