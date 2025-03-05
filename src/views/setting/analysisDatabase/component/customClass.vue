<template>
  <div class="setting-container">
    <div class="setting-customClass-container">
      <table class="setting-table">
        <colgroup>
          <col width="20%"/>
          <col width="40%"/>
          <col width="40%"/>
        </colgroup>
        <thead>
        <tr>
          <th>ID</th>
          <th>Abbreviation</th>
          <th>Class name</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in wbcCustomItems" :key="item.id" class="setting-customClass-wrapper">
          <td>{{ item.customNum }}</td>
          <td class="setting-customClassInput-wrapper">
            <input
                v-model="item.abbreviation"
                type="text"
                maxlength="3"
                placeholder="abbreviation"
                @input="filterEnglishAndNumbers($event, item, 'abbreviation')"
            />
          </td>
          <td class="setting-customClassInput-wrapper">
            <input
                v-model="item.fullNm"
                type="text"
                maxlength="25"
                placeholder="class name"
                @input="filterEnglishAndNumbers($event, item, 'fullNm')"
            />
          </td>
        </tr>
        </tbody>
      </table>

      <Button
          class="setting-saveBtn"
          @click="saveWbcCustomClass"
      >
        Save
      </Button>
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

  <ToastNotification
      v-if="toastInfo.message"
      :message="toastInfo.message"
      :messageType="toastInfo.messageType"
      :duration="1500"
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
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import { basicWbcArr, basicBmClassList } from "@/store/modules/analysis/wbcclassification";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {settingName, WBC_CUSTOM_CLASS} from "@/common/defines/constants/settings";
import Button from "@/components/commonUi/Button.vue";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useToast} from "@/common/lib/utils/toast";

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
const { toastInfo, showToast } = useToast();

onBeforeMount(() => {
  projectBm.value = window.PROJECT_TYPE === 'bm'
})

onMounted(async () => {
  await getWbcCustomClasses();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.customClass });
});

watch(() => wbcCustomItems.value, async (wbcCustomItemsAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(wbcCustomItemsAfterSettingObj)});
  if (settingType.value !== settingName.customClass) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.customClass });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.settingNotSaved;
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
        showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
        await getWbcCustomClasses();
      } else {
        showToast(MSG.TOAST.UPDATE_FAIL, MESSAGES.TOAST_MSG_ERROR);
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }
    if (result) {
      showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
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
      showToast("You should enter abbreviation", MESSAGES.TOAST_MSG_ERROR);
      return false;
    } else if (wbcCustomItem.fullNm !== '' && wbcCustomItem.abbreviation === '') {
      showToast("You should enter class name", MESSAGES.TOAST_MSG_ERROR);
      return false;
    }

    if (existingClassAbbreivationArr.includes(wbcCustomItem.abbreviation)) {
      showToast(`${wbcCustomItem.abbreviation} is existing abbreviation`, MESSAGES.TOAST_MSG_ERROR);
      return false;
    } else if (existingClassFullNmArr.includes(wbcCustomItem.fullNm)) {
      showToast(`${wbcCustomItem.fullNm} is existing class name`, MESSAGES.TOAST_MSG_ERROR);
      return false;
    } else if (wbcCustomItem.abbreviation === 'OT') {
      showToast("Can't use OT abbreviation!", MESSAGES.TOAST_MSG_ERROR);
      return false;
    }
  }

  return true;
}

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
