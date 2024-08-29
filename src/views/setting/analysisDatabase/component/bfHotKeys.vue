<template>
  <div>
<!--        {{ bfHotKeysItems }}-->
    <ul class="wbcHotKeysItems">
      <li v-for="item in bfHotKeysItems" :key="item.id">
        <span>{{ item?.abbreviation }}</span>
        <span>{{ item?.fullNm }}</span>
        <span>
          <input
              v-model="item.key"
              type="text"
              maxlength="1"
              placeholder="hot key"
              @input="filterEnglishAndNumbers($event, item, 'key')"
          />
        </span>
      </li>
    </ul>
    <button @click="saveBfCustomClass" class="saveBtn" type="button">Save</button>
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
  createBfHotKeysApi, updateBfHotKeysApi, getBfHotKeysApi,
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {bfHotKeys, settingName} from "@/common/defines/constFile/settings";
import {messages} from '@/common/defines/constFile/constantMessageText';
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const store = useStore();
const router = useRouter();
const saveHttpType = ref('');
const bfHotKeysItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);

onMounted(async () => {
  await getBfHotKeyClasses();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.bfHotKeys });
});

watch(() => bfHotKeysItems.value, async (bfHotKeysAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(bfHotKeysAfterSettingObj)});
  if (settingType.value !== settingName.bfHotKeys) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.bfHotKeys });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
}

const filterEnglishAndNumbers = (event: Event, item: any, field: 'key' | 'fullNm') => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^a-zA-Z0-9]/g, '');
  item[field] = filteredValue.trim();
};

const saveBfCustomClass = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createBfHotKeysApi({bfHotKeysItems: bfHotKeysItems.value });
    } else {
      const updateResult = await updateBfHotKeysApi({bfHotKeysItems: bfHotKeysItems.value });

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getBfHotKeyClasses();
      } else {
        showErrorAlert(messages.settingUpdateFailure);
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
      return;
    }
    if (result) {

      showSuccessAlert(messages.settingSaveSuccess);
      saveHttpType.value = 'put';
      await getBfHotKeyClasses();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
    }
  } catch (e) {
    console.log(e);
  }
};

const getBfHotKeyClasses = async () => {
  try {
    const result = await getBfHotKeysApi();
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        saveHttpType.value = 'post';
        bfHotKeysItems.value = bfHotKeys;
      } else {
        saveHttpType.value = 'put';
        bfHotKeysItems.value = result.data;
      }
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(bfHotKeysItems.value) });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(bfHotKeysItems.value) });
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
  await saveBfCustomClass();
  showConfirm.value = false;
}

</script>
