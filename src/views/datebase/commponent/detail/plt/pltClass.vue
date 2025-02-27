<template>
  <div class="classInfo-barcode-wrapper" v-if="type !== 'report'">
    <img v-if="siteCd !== HOSPITAL_SITE_CD_BY_NAME['고대구로병원']" @error="onImageError" :src="barcodeImg"/>
    <p v-else>Barcode Image is missing</p>
  </div>


  <div class="mt10 mb10 flex-justify-between">
    <h3 class="wbcClassInfoLeft">PLT Classification</h3>
  </div>
  <div class="wbcClassScroll">
    <ul class="nth1Child classAttribute text">
      <li>Class</li>
      <li class="wbcTitleText">Count</li>
    </ul>
    <div
        v-for="(item, idx) in pltInfoVal"
        :key="idx"
        class="wbcClassDbDiv"
    >
      <ul :class="{ 'nth1Child': true }">
        <li>{{ item?.name }}</li>
        <li class="flex-align-center-justify-evenly">
          <span v-if="item?.name !== 'Platelet'" class="w20">{{ Number(item?.count) || 0 }}</span>
          <span v-else>{{ Number(item?.count) || 0 }} PLT / 1000 RBC</span>
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
</template>

<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
  ref,
  watch
} from 'vue';
import {getBarcodeDetailImageUrl} from "@/common/lib/utils/conversionDataUtils";
import {DIR_NAME} from "@/common/defines/constants/settings";
import {useStore} from "vuex";
import Alert from "@/components/commonUi/Alert.vue";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import {RBC_CODE_CLASS_ID} from "@/common/defines/constants/dataBase";
import {fileSearchApi} from "@/common/api/service/fileSys/fileSysApi";

const props = defineProps(['type']);
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const emits = defineEmits();

const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const siteCd = computed(() => store.state.commonModule.siteCd);
const slideData = computed(() => store.state.slideDataModule);
const barcodeImg = ref('');
const userId = ref('');
const pltInfoVal = ref<any>([]);

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const rbcInfoForPlt = ref([]);
const rbcInfoPathAfter = ref<any>([]);
const rbcCount = ref({
  pltCount: 0,
  pltTotalCount: 0,
  maxRbcCount: 0,
});
const totalRBCImageNames = ref<string[]>([]);

onMounted(async () => {
  // await nextTick();
  setBarCodeImage(slideData.value);
  pltInfoVal.value = [];
  await getWbcInfoForPlt(slideData.value)
  await getRbcInfoForPlt(slideData.value);
})

watch(userModuleDataGet.value, (newUserId) => {
  userId.value = newUserId.id;
});

watch(() => slideData.value?.id, async () => {
  setBarCodeImage(slideData.value);
  pltInfoVal.value = [];
  await getWbcInfoForPlt(slideData.value)
  await getRbcInfoForPlt(slideData.value);
  await store.dispatch('commonModule/setCommonInfo', {testType: slideData.value?.testType});
})

const setBarCodeImage = (currentSelectItems: any) => {
  const path = currentSelectItems.img_drive_root_path !== '' && currentSelectItems.img_drive_root_path ? currentSelectItems.img_drive_root_path : pbiaRootDir.value;
  barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, currentSelectItems.slotId, DIR_NAME.BARCODE);
}

const getWbcInfoForPlt = async (newItem: any) => {
  if (!isObjectEmpty(newItem.wbcInfoAfter)) {
    const wbcPltValue = newItem.wbcInfoAfter.filter((item) => item?.id === '13' || item?.id === '14');
    if (wbcPltValue.length) {
      pltInfoVal.value = wbcPltValue.map(({count, name}) => ({count, name}));
    }
  }
}

const getRbcInfoForPlt = async (newSlideData) => {
  rbcInfoForPlt.value = newSlideData?.rbcInfo.rbcClass;

  await checkRBCTotalImageNames();
  await rbcTotalAndReCountForReport();
  pltInfoVal.value.push({count: rbcCount.value.pltCount, name: 'Platelet'});
}

const rbcTotalAndReCountForReport = async () => {
  const path = slideData.value?.img_drive_root_path !== '' && slideData.value?.img_drive_root_path ? slideData.value?.img_drive_root_path : pbiaRootDir.value;
  const slotId = slideData.value?.slotId;
  const basePath = `${path}/${slotId}/${DIR_NAME.RBC_CLASS}`;
  const urlOld = `${basePath}/${slotId}.json`;

  resetTotalCounts();
  for (const rbcImageName of totalRBCImageNames.value) {
    const urlNew = `${basePath}/${slotId}_new_${rbcImageName}.json`;

    const responseNew = await readJsonFile({fullPath: urlNew});
    const responseOld = await readJsonFile({fullPath: urlOld});

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
  const rootPath = slideData.value?.img_drive_root_path !== '' && slideData.value?.img_drive_root_path ? slideData.value?.img_drive_root_path : pbiaRootDir.value;
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
  barcodeImg.value = '';
}

</script>