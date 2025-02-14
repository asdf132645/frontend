<template>
  <div class="flex-column-center">
    <ul class="normalItems">
      <li v-for="item in normalItems" :key="item.id" class="flex-justify-start-align-center normalItems-wrapper">
        <span>{{ item.abbreviation }}</span>
        <span class="text-left">{{ item?.fullNm }}</span>
        <div class="flex-justify-start-align-center gap14" style="width: 250px;">
          <input v-model="item.min"
                 class="w50"
                 type="number"
                 maxlength="25"
                 placeholder="class name"
                 @input="filterNumbersOnly($event, item, 'min')"
          />
          <span>-</span>
          <input
              class="w50"
              @input="filterNumbersOnly($event, item, 'max')"
              v-model="item.max" type="number" maxlength="25" placeholder="class name"
          />
          <span>{{ item.unit }}</span>
        </div>
      </li>
    </ul>
    <button @click="saveNormalRange" class="saveBtn" type="button">Save</button>
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
  createNormalRangeApi,
  updateNormalRangeApi,
  getNormalRangeApi,
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {normalRange, settingName} from "@/common/defines/constants/settings";
import {MESSAGES} from '@/common/defines/constants/constantMessageText';
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const store = useStore();
const router = useRouter();
const saveHttpType = ref('');
const normalItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);

onMounted(async () => {
  await getNormalRange();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.normalRange });
});

watch(() => normalItems.value, async (normalItemsAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(normalItemsAfterSettingObj) });
  if (settingType.value !== settingName.normalRange) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.normalRange });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.settingNotSaved;
}

const saveNormalRange = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createNormalRangeApi({normalRangeItems: normalItems.value});
    } else {
      const updateResult = await updateNormalRangeApi({normalRangeItems: normalItems.value});

      if (updateResult.data) {
        showSuccessAlert(MESSAGES.UPDATE_SUCCESSFULLY);
        await getNormalRange();
      } else {
        showErrorAlert('update failed');
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }
    if (result) {
      showSuccessAlert(MESSAGES.settingSaveSuccess);
      saveHttpType.value = 'put';
      await getNormalRange();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
    }
  } catch (e) {
    console.error(e);
  }
};

const filterNumbersOnly = (event: Event, item: any, field: 'min' | 'max') => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^0-9]/g, '');
  item[field] = filteredValue.trim();
};

const getNormalRange = async () => {
  try {
    const result = await getNormalRangeApi();
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        saveHttpType.value = 'post';
        normalItems.value = normalRange;
      } else {
        saveHttpType.value = 'put';
        normalItems.value = result.data;
      }

      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(normalItems.value) });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(normalItems.value) });
    }
  } catch (e) {
    console.error(e);
  }
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
  await saveNormalRange();
  showConfirm.value = false;
}

</script>
