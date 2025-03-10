<template>
  <div class="setting-container">
    <div class="setting-normalRange-container">
      <table class="setting-table">
        <colgroup>
          <col width="40%"/>
          <col width="10%"/>
          <col width="15%"/>
          <col width="10%"/>
          <col width="15%"/>
          <col width="10%"/>
        </colgroup>
        <thead>
        <tr>
          <th class="text-left">Class</th>
          <th>Abbreviation</th>
          <th>Min</th>
          <th></th>
          <th>Max</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in normalItems" :key="item.id" class="setting-customClass-wrapper">
          <td class="text-left">{{ item?.fullNm }}</td>
          <td class="text-center">{{ item.abbreviation }}</td>
          <td>
            <input v-model="item.min"
                   class="w50"
                   type="number"
                   maxlength="25"
                   placeholder="class name"
                   @input="filterNumbersOnly($event, item, 'min')"
            />
          </td>
          <td>-</td>
          <td>
            <input
                class="w50"
                @input="filterNumbersOnly($event, item, 'max')"
                v-model="item.max" type="number" maxlength="25" placeholder="class name"
            />
          </td>
          <td>{{ item.unit }}</td>
        </tr>
        </tbody>
      </table>

      <Button class="setting-saveBtn" @click="saveNormalRange">
        Save
      </Button>
    </div>
  </div>

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
import {ref, onMounted, computed, watch, onBeforeMount} from 'vue';
import {
  createNormalRangeApi,
  updateNormalRangeApi,
  getNormalRangeApi,
} from "@/common/api/service/setting/settingApi";
import {ApiResponse} from "@/common/api/httpClient";
import Alert from "@/components/commonUi/Alert.vue";
import {defaultPBNormalRange, defaultBMNormalRange, settingName} from "@/common/defines/constants/settings";
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import {useStore} from "vuex";
import Button from "@/components/commonUi/Button.vue";
import {useToast} from "@/common/lib/utils/toast";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";

const store = useStore();
const saveHttpType = ref('');
const normalItems = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const settingType = computed(() => store.state.commonModule.settingType);
const projectType = ref('');
const { toastInfo, showToast } = useToast();

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

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

const saveNormalRange = async () => {
  try {
    let result: ApiResponse<void>;
    if (saveHttpType.value === 'post') {
      result = await createNormalRangeApi({normalRangeItems: normalItems.value});
    } else {
      const updateResult = await updateNormalRangeApi({normalRangeItems: normalItems.value});

      if (updateResult.data) {
        showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
        await getNormalRange();
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
        normalItems.value = projectType.value === 'pb' ? defaultPBNormalRange : defaultBMNormalRange;
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

const hideAlert = () => {
  showAlert.value = false;
};

</script>
