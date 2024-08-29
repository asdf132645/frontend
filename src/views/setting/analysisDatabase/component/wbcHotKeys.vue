<template>
  <div>
    <ul class="wbcHotKeysItems">
      <li v-for="item in wbcHotKeysItems" :key="item.id">
        <span>{{ item.abbreviation }}</span>
        <span>{{ item.fullNm }}</span>
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
    <button @click="saveWbcCustomClass" class="saveBtn" type="button">Save</button>
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
import {ref, onMounted, computed, onBeforeMount, watch} from 'vue';
import {createWbcHotKeysApi, updateWbcHotKeysApi, getWbcHotKeysApi} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {bmHotKeys, settingName, wbcHotKeys} from "@/common/defines/constFile/settings";
import {messages} from '@/common/defines/constFile/constantMessageText';
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import Confirm from "@/components/commonUi/Confirm.vue";

const store = useStore();
const router = useRouter();
const saveHttpType = ref('');
const wbcHotKeysItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const projectType = ref('pb');
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
})

onMounted(async () => {
  await getWbcHotKeyClasses();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.wbcHotKeys });
});

watch(() => wbcHotKeysItems.value, async (wbcHotKeysItemsAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(wbcHotKeysItemsAfterSettingObj) });
  if (settingType.value !== settingName.wbcHotKeys) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.wbcHotKeys });
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

const saveWbcCustomClass = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createWbcHotKeysApi({wbcHotKeysItems: wbcHotKeysItems.value});
    } else {
      const updateResult = await updateWbcHotKeysApi({wbcHotKeysItems: wbcHotKeysItems.value});

      if (updateResult.data) {
        showSuccessAlert(messages.UPDATE_SUCCESSFULLY);
        await getWbcHotKeyClasses();
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
      await getWbcHotKeyClasses();
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
    }
  } catch (e) {
    console.log(e);
  }
};

const getWbcHotKeyClasses = async () => {
  try {
    const result = await getWbcHotKeysApi();
    if (result) {
      if (!result?.data || (result?.data instanceof Array && result?.data.length === 0)) {
        saveHttpType.value = 'post';
        wbcHotKeysItems.value = projectType.value === 'bm' ? bmHotKeys : wbcHotKeys;
        // bmHotKeys
      } else {
        saveHttpType.value = 'put';
        wbcHotKeysItems.value = result.data;
      }

      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(wbcHotKeysItems.value) });
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(wbcHotKeysItems.value) });
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
  await saveWbcCustomClass();
  showConfirm.value = false;
}

</script>
