<template>
  <div>
    <ul class="normalItems">
      <li v-for="item in normalItems" :key="item.id">
        <div>
          {{ item.abbreviation }} - {{ item.fullNm }}
        </div>
        <div class="mt1">
          <span>
            <input v-model="item.min"
                   type="text"
                   maxlength="25"
                   placeholder="class name"
                   @input="filterNumbersOnly($event, item, 'min')"
            />
          </span>
          <span>
            <input
                @input="filterNumbersOnly($event, item, 'max')"
                v-model="item.max" type="text" maxlength="25" placeholder="class name"
            />
          </span>
          <span>{{ item.unit }}</span>
        </div>
      </li>
    </ul>
    <button @click="saveNormalRange" class="saveBtn" type="button">Save</button>
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
import {
  createNormalRangeApi,
  updateNormalRangeApi,
  getNormalRangeApi,
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {normalRange, settingName} from "@/common/defines/constFile/settings";
import {messages} from '@/common/defines/constFile/constantMessageText';
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
  confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
}

const saveNormalRange = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createNormalRangeApi({normalRangeItems: normalItems.value});
    } else {
      const updateResult = await updateNormalRangeApi({normalRangeItems: normalItems.value});

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getNormalRange();
      } else {
        showErrorAlert('update failed');
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }
    if (result) {
      showSuccessAlert(messages.settingSaveSuccess);
      saveHttpType.value = 'put';
      await getNormalRange();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
    }
  } catch (e) {
    console.log(e);
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
    console.log(e);
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
