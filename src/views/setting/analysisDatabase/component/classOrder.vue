<template>
  <div class="wbcClassScroll">
    <h1 class="classTitle">Class</h1>
    <div
        v-for="(item, idx) in wbcInfoChangeVal"
        :key="item.id"
        class="wbcClassDbDiv"
        draggable="true"
        @dragstart="startDrag(idx, $event)"
        @dragover.prevent
        @drop="drop(idx, $event)"
    >

      <ul class="nth1ChildOrder">
        <li>{{ item?.fullNm }}</li>
      </ul>
    </div>
  </div>
  <button @click="saveOrderClassSave" class="saveBtn" type="button">Save</button>

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

import {computed, onMounted, ref, watch} from "vue";
import {defaultBmClassList, defaultWbcClassList} from "@/store/modules/analysis/wbcclassification";
import {
  createOrderClassApi,
  getOrderClassApi, putOrderClassApi,
} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {messages} from '@/common/defines/constFile/constantMessageText';
import Confirm from "@/components/commonUi/Confirm.vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import {settingName} from "@/common/defines/constFile/settings";

const store = useStore();
const router = useRouter();
const wbcInfoChangeVal = ref<any>([]);
const dragIndex = ref(-1);
const dragOffsetY = ref(0);
const saveHttpType = ref('');

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);

onMounted(async () => {
  wbcInfoChangeVal.value = window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.classOrder });
  await getOrderClass();
})

watch(() => wbcInfoChangeVal.value, async (classOrderAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(classOrderAfterSettingObj)});
  if (settingType.value !== settingName.classOrder) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.classOrder });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
}

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        saveHttpType.value = 'post';
      } else {
        saveHttpType.value = 'put';
        wbcInfoChangeVal.value = result.data.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
      }

      const classOrderBeforeSettingObj = wbcInfoChangeVal.value;
      await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(classOrderBeforeSettingObj)});
      await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(classOrderBeforeSettingObj)});
    }
  } catch (e) {
    console.log(e)
  }
}

const saveOrderClassSave = async () => {
  let orderList: any = wbcInfoChangeVal.value;
  for (const index in orderList) {
    orderList[index].orderIdx = index;
  }

  try {
    let result = {};
    if (saveHttpType.value === 'post') {
      result = await createOrderClassApi(orderList);
    }else {
      result = await putOrderClassApi(orderList);
    }
    if (result) {
      const text = saveHttpType.value === 'post' ? messages.settingSaveSuccess : messages.UPDATE_SUCCESSFULLY
      showSuccessAlert(text);
    }

    await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
    await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  } catch (e) {
    console.log(e);
  }
}

const startDrag = (index: any, event: any) => {
  dragIndex.value = index;
  dragOffsetY.value = event.clientY - event.target.getBoundingClientRect().top;
};

const drop = (index: any, event: any) => {
  event.preventDefault();
  if (dragIndex.value !== -1) {
    const movedItem = wbcInfoChangeVal.value.splice(dragIndex.value, 1)[0];
    wbcInfoChangeVal.value.splice(index, 0, movedItem);
    dragIndex.value = -1;
  }
};

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
  await saveOrderClassSave();
  showConfirm.value = false;
  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
}

</script>
