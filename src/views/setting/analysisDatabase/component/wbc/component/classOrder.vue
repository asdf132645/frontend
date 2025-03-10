<template>
  <div class="setting-container">
    <div class="wbcClassScroll">
      <h1 class="classTitle">Class</h1>
      <div
          v-for="(item, idx) in wbcInfoChangeVal"
          :key="item.fullNm"
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
    <Button @click="saveOrderClassSave" class="setting-saveBtn">
      Save
    </Button>
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

import {computed, onBeforeMount, onMounted, ref, watch} from "vue";
import {defaultBmClassList, defaultWbcClassList} from "@/store/modules/analysis/wbcclassification";
import {
  createOrderClassApi,
  getOrderClassApi, getWbcCustomClassApi, putOrderClassApi,
} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {MESSAGES, MSG} from '@/common/defines/constants/constantMessageText';
import { useStore } from "vuex";
import {settingName, WBC_CUSTOM_CLASS} from "@/common/defines/constants/settings";
import { ClassOrderRequest } from "@/common/api/service/setting/dto/classOrder";
import Button from "@/components/commonUi/Button.vue";
import {useToast} from "@/common/lib/utils/toast";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";

const store = useStore();
const wbcInfoChangeVal = ref<ClassOrderRequest[]>([]);
const dragIndex = ref(-1);
const dragOffsetY = ref(0);
const saveHttpType = ref('');

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const settingType = computed(() => store.state.commonModule.settingType);
const wbcCustomItems = ref<any>([]);
const projectType = ref('');
const { toastInfo, showToast } = useToast();

onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

onMounted(async () => {
  wbcInfoChangeVal.value = projectType.value === 'bm' ? defaultBmClassList : defaultWbcClassList;
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.classOrder });
  await getOrderClass();
  await getWbcCustomClasses();
})

watch(() => wbcInfoChangeVal.value, async (classOrderAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(classOrderAfterSettingObj)});
  if (settingType.value !== settingName.classOrder) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.classOrder });
  }
}, { deep: true });


const getWbcCustomClasses = async () => {
  try {
    const result: any = await getWbcCustomClassApi();
    if (result?.data) {
      wbcCustomItems.value = result.data.filter((item: any) => item.abbreviation && item.fullNm);

      const wbcCustomItemClassIds = new Set(wbcCustomItems.value.map((item: any) => String(item.customNum)));
      const wbcCustomClassDefaultIds = new Set(WBC_CUSTOM_CLASS.map(item => String(item.customNum)));

      // ClassOrder에서 없는 Custom Class 제거
      wbcInfoChangeVal.value = wbcInfoChangeVal.value.filter((wbcInfo: any) =>
          !(wbcCustomClassDefaultIds.has(String(wbcInfo.classId)) && !wbcCustomItemClassIds.has(String(wbcInfo.classId)))
      );

      // Custom Class => Class Order 추가 또는 업데이트
      const classIds = new Set(wbcInfoChangeVal.value.map((item: any) => item.classId));
      let maxOrderIdx = Math.max(...wbcInfoChangeVal.value.map((item: any) => item.orderIdx), 0);


      for (const wbcCustomItem of wbcCustomItems.value) {
        if (!classIds.has(String(wbcCustomItem.customNum))) {
          wbcInfoChangeVal.value.push({
            abbreviation: wbcCustomItem.abbreviation,
            classId: wbcCustomItem.customNum,
            fullNm: wbcCustomItem.fullNm,
            orderIdx: ++maxOrderIdx
          });
        } else {
          wbcInfoChangeVal.value = wbcInfoChangeVal.value.map((obj: any) =>
              String(obj.classId) === String(wbcCustomItem.customNum)
                  ? { ...obj, fullNm: wbcCustomItem.fullNm, abbreviation: wbcCustomItem.abbreviation }
                  : obj
          );
        }
      }
    }

    wbcInfoChangeVal.value = wbcInfoChangeVal.value.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));

    await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(wbcInfoChangeVal.value)});
    await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(wbcInfoChangeVal.value)});
  } catch (e) {
    console.error('Error fetching WBC custom classes:', e);
  }
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
    }
  } catch (e) {
    console.error(e)
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
      showToast(MSG.TOAST.UPDATE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
    }

    await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
    await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  } catch (e) {
    console.error(e);
    showToast(MSG.TOAST.UPDATE_FAIL, MESSAGES.TOAST_MSG_ERROR);
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

const hideAlert = () => {
  showAlert.value = false;
};

</script>
