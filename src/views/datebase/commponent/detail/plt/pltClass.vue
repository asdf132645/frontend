<template>
  <div class="classInfo-barcode-container" v-if="type !== 'report'">
    <img v-if="!barCodeImageShowError && siteCd !== HOSPITAL_SITE_CD_BY_NAME['고대구로병원']" @error="onImageError" :src="barcodeImg"/>
    <p v-else>Barcode Image is missing</p>
  </div>


  <div class="mt10 mb10 flex-justify-between">
    <h3 class="wbcClassInfoLeft">PLT Classification</h3>

    <ul class="leftWbcInfo">
      <li
          @click="commitConfirmed"
          class="pos-relative"
          :class="{'submitted': selectItems?.submitState === 'Submit',}"
          @mouseover="tooltipVisibleFunc('confirm', true)"
          @mouseout="tooltipVisibleFunc('confirm', false)"
      >
        <font-awesome-icon :icon="['fas', 'square-check']" class="hoverSizeAction" />
        <Tooltip :isVisible="tooltipVisible.confirm" className="mb08" position="top" type="" :message="MSG.TOOLTIP.CONFIRM" />
      </li>
    </ul>
  </div>
  <div class="wbcClassScroll">
    <ul class="nth1Child classAttribute">
      <li>Class</li>
      <li class="wbcTitleText">
        <p class="firstP">Count</p>
      </li>
    </ul>
    <div
        v-for="(item, idx) in pltInfoVal"
        :key="idx"
        class="wbcClassDbDiv"
    >
      <ul :class="{ 'nth1Child': true }">
        <li>{{ item?.name }}</li>
        <li style="display: flex; justify-content: space-evenly;">
          <span class="w20 text-left">{{ Number(item?.count) || 0 }}</span>
        </li>
      </ul>
    </div>
    <div class="wbcClassDbDiv classTotalColor">
      <ul class="nth1Child">
        <li>Total</li>
        <li class="classInfoWbc">
          <span class="w20 text-left">{{ Number(0) || 0 }}</span>
        </li>
      </ul>
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
  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :type="confirmType"
      :message="confirmMessage"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />
</template>

<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  onBeforeMount,
  onMounted,
  ref,
  watch
} from 'vue';
import {getBarcodeDetailImageUrl} from "@/common/lib/utils/conversionDataUtils";
import { DIR_NAME } from "@/common/defines/constants/settings";
import {useStore} from "vuex";
import {MESSAGES, MSG } from "@/common/defines/constants/constantMessageText";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";

const props = defineProps(['type', 'selectItems']);
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const emits = defineEmits();
import moment from 'moment';
import { readJsonFile } from "@/common/api/service/fileReader/fileReaderApi";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import { TooltipClassInfoType } from "@/common/type/tooltipType";
import {
  cbcUpdateMutation,
  gqlGenericUpdate,
} from '@/gql/mutation/slideData';
import { RBC_CODE_CLASS_ID } from "@/common/defines/constants/dataBase";
import {fileSearchApi} from "@/common/api/service/fileSys/fileSysApi";

const selectItems = ref<any>(props.selectItems);
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const siteCd = computed(() => store.state.commonModule.siteCd);
const slideData = computed(() => store.state.slideDataModule);
const barcodeImg = ref('');
const userId = ref('');
const pltInfoVal = ref<any>([]);

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const okMessageType = ref('');
const barCodeImageShowError = ref(false);
const submittedScreen = ref(false);
const tooltipVisible = ref<TooltipClassInfoType>({
  confirm: false,
})
const rbcInfoForPlt = ref([]);
const rbcInfoPathAfter = ref<any>([]);
const rbcCount = ref({
  pltCount: 0,
  pltTotalCount: 0,
  maxRbcCount: 0,
});
const totalRBCImageNames = ref<string[]>([]);

onBeforeMount(async () => {
  barCodeImageShowError.value = false;
})

onMounted(async () => {
  await nextTick();
  barCodeImageShowError.value = false;
})

watch(userModuleDataGet.value, (newUserId) => {
  userId.value = newUserId.id;
});

watch(() => slideData.value, async (newSlideData) => {
  selectItems.value = slideData.value;
  setBarCodeImage(newSlideData);
  await beforeAfterChange(newSlideData)
  await checkRBCTotalImageNames();
  await rbcTotalAndReCountForReport();
  pltInfoVal.value.push({ count: rbcCount.value.pltCount, name: 'RBC - Platelet' });
  await store.dispatch('commonModule/setCommonInfo', {testType: selectItems.value?.testType});
}, { deep: true });

const setBarCodeImage = (currentSelectItems: any) => {
  const path = currentSelectItems.img_drive_root_path !== '' && currentSelectItems.img_drive_root_path ? currentSelectItems.img_drive_root_path : pbiaRootDir.value;
  barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, currentSelectItems.slotId, DIR_NAME.BARCODE);
}

const commitConfirmed = () => {
  if (slideData.value?.submitState === 'Submit') {
    return;
  }
  submittedScreen.value = true;
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.IDS_MSG_CONFIRM_SLIDE;
  okMessageType.value = 'commit';
}

const handleOkConfirm = () => {
  if (okMessageType.value === 'commit') {
    onCommit();
  } else {
    uploadLis();
  }
  showConfirm.value = false;
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const onCommit = async () => {
  const localTime = moment().local();
  const updatedItem = {
    submitState: 'Submit',
    submitOfDate: localTime.format(),
    submitUserId: userModuleDataGet.value.userId,
  };

  const updatedRuningInfo = {...slideData.value, ...updatedItem};
  await gqlGenericUpdate(cbcUpdateMutation,{
    id: updatedRuningInfo.id,
    submitState: updatedRuningInfo.submitState,
    submitOfDate: updatedRuningInfo.submitOfDate,
    submitUserId: updatedRuningInfo.submitUserId,
  });

  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
  selectItems.value.submitState = 'Submit';
  emits('submitStateChanged', 'Submit');
}

const beforeAfterChange = async (newItem: any) => {
  const wbcPltValue = newItem.wbcInfoAfter.filter((item) => item.id === '13' || item.id === '14');
  if (!isObjectEmpty(wbcPltValue)) {
    pltInfoVal.value = wbcPltValue.map((item) => {
      return { count: item.count, name: item.name };
    })
  }
  console.log('pltInfoVal', pltInfoVal.value);
  rbcInfoForPlt.value = newItem?.rbcInfo.rbcClass;
}

const rbcTotalAndReCountForReport = async () => {
  const path = slideData.value?.img_drive_root_path !== '' && slideData.value?.img_drive_root_path ? slideData.value?.img_drive_root_path : iaRootPath.value;
  const slotId = slideData.value?.slotId;
  const basePath = `${path}/${slotId}/${DIR_NAME.RBC_CLASS}`;
  const urlOld = `${basePath}/${slotId}.json`;

  resetTotalCounts();
  for (const rbcImageName of totalRBCImageNames.value) {
    const urlNew = `${basePath}/${slotId}_new_${rbcImageName}.json`;

    const responseNew = await readJsonFile({fullPath: urlNew });
    const responseOld = await readJsonFile({fullPath: urlOld });

    const oldData = responseOld?.data?.[Number(rbcImageName)]?.rbcClassList || [];
    const newData = responseNew.data !== 'not file' ? responseNew.data : [];

    for (const rbcItem of oldData) {
      for (const newRbcData of newData) {
        // 기존 요소 제거
        const foundIndex = rbcItem.classInfo.findIndex((el: any) => el.index === newRbcData.index);
        if (foundIndex !== -1) {
          rbcItem.classInfo.splice(foundIndex, 1);
        }

        // 새 요소 추가
        if (rbcItem.categoryId === newRbcData.categoryId) {
          rbcItem.classInfo.push({
            classNm: newRbcData.classNm,
            classId: newRbcData.classId,
            posX: String(newRbcData.posX),
            posY: String(newRbcData.posY),
            width: newRbcData.width,
            height: newRbcData.height,
            index: newRbcData.index,
          });
        }
      }
    }

    rbcInfoPathAfter.value = oldData;

    if (!Array.isArray(rbcInfoPathAfter.value)) {
      return;
    }

    // 마지막 이미지를 처리할 때만 countReAddForReport 호출
    const isLastImage = totalRBCImageNames.value[totalRBCImageNames.value.length - 1] === rbcImageName;
    await countReAddForReport(isLastImage ? 'last' : undefined);
  }
};

const checkRBCTotalImageNames = async () => {
  const rootPath = slideData.value?.img_drive_root_path !== '' && slideData.value?.img_drive_root_path ? slideData.value?.img_drive_root_path : iaRootPath.value;
  const fileSearchApiParam = `directoryPath=${rootPath}\\${slideData.value?.slotId}\\${DIR_NAME.RBC_IMAGE}&searchString=RBC_Image`;
  try {
    const response = await fileSearchApi(fileSearchApiParam);

    if (response.data) {
      const rbcImageFileNames = response.data.filter((item) => item.endsWith('_files'));
      totalRBCImageNames.value = rbcImageFileNames.map((item) => {
        const splitedItem = item.split('_');
        return splitedItem[splitedItem.length - 2];
      })
    } else {
      totalRBCImageNames.value = [];
    }
  } catch (error) {
    totalRBCImageNames.value = [];
    console.error(error);
  }
}

const countReAddForReport = async (type?: 'last') => {
  if (!rbcInfoForPlt.value || !Array.isArray(rbcInfoForPlt.value)) {
    return;
  }

  if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
    return;
  }

  let totalPLT = 0;
  for (const el of rbcInfoPathAfter.value) {
    if (el.categoryId === RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID || el.categoryId === RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) {
      rbcCount.value.maxRbcCount += Number(el.classInfo.length);
    }
    if (el.categoryId === RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID) {
      for (const xel of el.classInfo) {
        if (xel.classId === RBC_CODE_CLASS_ID.OTHERS.PLATELET) {
          totalPLT += 1;
        }
      }
    }
  }
  rbcCount.value.pltTotalCount += totalPLT;

  if (type === 'last') {
    rbcCount.value.pltCount += Math.floor((rbcCount.value.pltTotalCount / parseFloat(rbcCount.value.maxRbcCount)) * 1000);
  }
};

const resetTotalCounts = () => {
  rbcCount.value.maxRbcCount = 0;
  rbcCount.value.pltCount = 0;
  rbcCount.value.pltTotalCount = 0;
}

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

const onImageError = () => {
  barCodeImageShowError.value = true;
}
const tooltipVisibleFunc = (type: keyof TooltipClassInfoType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}

</script>