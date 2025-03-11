<template>
  <div class="setting-container">
    <table class="setting-table">
      <colgroup>
        <col width="80%"/>
        <col width="20%"/>
      </colgroup>
      <thead>
      <tr>
        <th class="text-left">Class name</th>
        <th>
          <input type="checkbox" @click="toggleAllChecks"/>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in imagePrintAndWbcArr" :key="item.id" class="setting-customClass-wrapper">
        <td class="text-left">{{ item.fullNm }}</td>
        <td>
          <input type="checkbox" :value="item.classId" v-model="selectedItems"/>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <Button @click='saveImagePrint' class="setting-saveBtn mt10">Save</Button>

  <ConfirmThreeBtn
      v-if="showConfirm"
      :is-visible="showConfirm"
      :message="confirmMessage"
      :confirmFirstText="MESSAGES.SAVE"
      :confirmSecondText="MESSAGES.LEAVE"
      :closeText="MESSAGES.CANCEL"
      @hide="closeConfirm"
      @okConfirm="handleOkConfirm"
      @okConfirm2="hideConfirm"
  />

<!--  <Confirm-->
<!--      v-if="showConfirm"-->
<!--      :is-visible="showConfirm"-->
<!--      type="setting"-->
<!--      :message="confirmMessage"-->
<!--      @hide="hideConfirm"-->
<!--      @okConfirm="handleOkConfirm"-->
<!--  />-->

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
import {imagePrintAndBm, imagePrintAndWbc, settingName} from "@/common/defines/constants/settings";
import {ApiResponse} from "@/common/api/httpClient";
import {
  createImagePrintApi,
  getImagePrintApi,
  updateImagePrintApi
} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import Button from "@/components/commonUi/Button.vue";
import {useToast} from "@/common/lib/utils/toast";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import ConfirmThreeBtn from "@/components/commonUi/ConfirmThreeBtn.vue";

const store = useStore();
const router = useRouter();
const imagePrintAndWbcArr = ref<any[]>([]);
const selectedItems = ref<string[]>([]);
const saveHttpType = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);
const allChecked = ref(false);
const {toastInfo, showToast} = useToast();

onMounted(async () => {
  await getImagePrintData();
  await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.imagePrint});
});

watch(() => selectedItems.value, async (newItem) => {

  imagePrintAndWbcArr.value.forEach((item) => {
    item.checked = newItem.includes(item.classId);
  });

  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(imagePrintAndWbcArr.value)});
  if (settingType.value !== settingName.imagePrint) {
    await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.imagePrint});
  }
}, {deep: true});

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.settingNotSaved;
}

const saveImagePrint = async () => {
  try {
    let result: ApiResponse<void>;

    imagePrintAndWbcArr.value.forEach((item) => {
      item.checked = selectedItems.value.includes(item.classId);
    });

    if (saveHttpType.value === 'post') {
      result = await createImagePrintApi({imagePrintItems: imagePrintAndWbcArr.value});
    } else {
      const updateResult = await updateImagePrintApi({imagePrintItems: imagePrintAndWbcArr.value});

      if (updateResult.data) {
        showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
        await getImagePrintData();
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
      await getImagePrintData();
      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
    }
  } catch (e) {
    console.error(e);
  }
};

const getImagePrintData = async () => {
  try {
    const result = await getImagePrintApi();

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        saveHttpType.value = 'post';
        imagePrintAndWbcArr.value = window.PROJECT_TYPE === 'bm' ? imagePrintAndBm : imagePrintAndWbc;
      } else {
        saveHttpType.value = 'put';
        const withoutRbcPrint = data.filter((item) => item.fullNm !== 'rbcPrintModel');
        imagePrintAndWbcArr.value = withoutRbcPrint;
        selectedItems.value = withoutRbcPrint.filter((item) => item.checked).map((item) => item.classId);
        allChecked.value = selectedItems.value.length === imagePrintAndWbcArr.value.length;
      }

      await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: JSON.stringify(imagePrintAndWbcArr.value) });
      await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(imagePrintAndWbcArr.value) });
    }
  } catch (e) {
    console.error(e);
  }
};

const hideAlert = () => {
  showAlert.value = false;
};

const toggleAllChecks = () => {
  allChecked.value = !allChecked.value;
  if (allChecked.value) {
    selectedItems.value = imagePrintAndWbcArr.value.map(item => item.classId);
  } else {
    selectedItems.value = [];
  }
};

const closeConfirm = () => {
  showConfirm.value = false;
}

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  await saveImagePrint();
  showConfirm.value = false;
}

</script>
