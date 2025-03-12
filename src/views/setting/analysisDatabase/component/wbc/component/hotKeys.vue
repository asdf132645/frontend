<template>
  <div class="setting-container">
    <!--    추후 BF 개발을 할 때 살릴 코드-->
    <!--    <div class="setting-activeBtn-container">-->
    <!--      <Button @click="handleSettingMenu('wbc')" :isActive="activeSetting.wbc">WBC</Button>-->
    <!--      <Button @click="handleSettingMenu('bf')" :isActive="activeSetting.bf">BF</Button>-->
    <!--    </div>-->
    <div class="setting-hotkey-container setting-hotkey-title-wrapper">
      <p>Abbreviation</p>
      <p class="text-left">Class name</p>
      <p>Hotkey</p>
    </div>
    <ul class="setting-hotkey-overflow-container">
      <li class="setting-hotkey-container" v-for="item in activeSetting.wbc ? wbcHotKeysItems : bfHotKeysItems" :key="item.id">
        <span>{{ item.abbreviation }}</span>
        <span class="text-left">{{ item.fullNm }}</span>
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
  </div>
  <Button class="setting-saveBtn mt10" @click="saveCustomClass">Save</Button>

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
import {ref, onMounted, computed, onBeforeMount, watch} from 'vue';
import {
  createWbcHotKeysApi,
  updateWbcHotKeysApi,
  getWbcHotKeysApi,
  getBfHotKeysApi, createBfHotKeysApi, updateBfHotKeysApi
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {bfHotKeys, bmHotKeys, settingName, wbcHotKeys} from "@/common/defines/constants/settings";
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import {useStore} from "vuex";
import Button from "@/components/commonUi/Button.vue";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useToast} from "@/common/lib/utils/toast";

const store = useStore();
const saveHttpType = ref('');
const wbcHotKeysItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const projectType = ref('pb');
const settingType = computed(() => store.state.commonModule.settingType);
const bfHotKeysItems = ref<any>([]);
const activeHotkeyItems = ref<any>([]);
const activeSetting = ref({
  'wbc': true,
  'bf': false,
})
const {toastInfo, showToast} = useToast();

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE === 'bm' ? 'bm' : 'pb';
})

onMounted(async () => {
  await getWbcHotKeyClasses();
  await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.wbcHotKeys});
});

watch(() => wbcHotKeysItems.value, async (wbcHotKeysItemsAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(wbcHotKeysItemsAfterSettingObj)});
  if (settingType.value !== settingName.wbcHotKeys) {
    await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.wbcHotKeys});
  }
}, {deep: true});

const filterEnglishAndNumbers = (event: Event, item: any, field: 'key' | 'fullNm') => {
  const input = event.target as HTMLInputElement;
  const filteredValue = input.value.replace(/[^a-zA-Z0-9!@#$%^&*()\\/*\-+,.?":\[\]`{}|<> ]/g, '');
  item[field] = filteredValue.trim();
};

const saveCustomClass = async () => {
  if (activeSetting.value.wbc) {
    await saveWbcCustomClass();
  } else if (activeSetting.value.bf) {
    await saveBfCustomClass();
  }
}

const saveWbcCustomClass = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createWbcHotKeysApi({wbcHotKeysItems: wbcHotKeysItems.value});
    } else {
      const updateResult = await updateWbcHotKeysApi({wbcHotKeysItems: wbcHotKeysItems.value});

      if (updateResult.data) {
        showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
        await getWbcHotKeyClasses();
      } else {
        showToast(MSG.TOAST.UPDATE_FAIL, MESSAGES.TOAST_MSG_ERROR);
      }
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
      return;
    }
    if (result) {
      showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
      saveHttpType.value = 'put';
      await getWbcHotKeyClasses();
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
    }
  } catch (e) {
    console.error(e);
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

      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: JSON.stringify(wbcHotKeysItems.value)});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(wbcHotKeysItems.value)});
    }
  } catch (e) {
    console.error(e);
  }
}

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
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: JSON.stringify(bfHotKeysItems.value)});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(bfHotKeysItems.value)});
    }
  } catch (e) {
    console.error(e);
  }
}

const hideAlert = () => {
  showAlert.value = false;
};

const saveBfCustomClass = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createBfHotKeysApi({bfHotKeysItems: bfHotKeysItems.value});
    } else {
      const updateResult = await updateBfHotKeysApi({bfHotKeysItems: bfHotKeysItems.value});

      if (updateResult.data) {
        showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
        await getBfHotKeyClasses();
      } else {
        showToast(MSG.TOAST.UPDATE_FAIL, MESSAGES.TOAST_MSG_ERROR);
      }
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
      return;
    }
    if (result) {
      showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
      saveHttpType.value = 'put';
      await getBfHotKeyClasses();
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
    }
  } catch (e) {
    console.error(e);
  }
};

</script>
