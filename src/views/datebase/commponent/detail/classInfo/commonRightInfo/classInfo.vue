<template>
  <div class="classInfo-barcode-wrapper" v-if="type !== 'report'">
    <img v-if="siteCd !== HOSPITAL_SITE_CD_BY_NAME['고대구로병원'] && barcodeImg !== ''" @error="onImageError" :src="barcodeImg" />
    <p v-else>Barcode Image is missing</p>
  </div>


  <div class="mt10 mb10 flex-justify-between">
    <div class="flex-align-center-justify-between">
      <h3 class="wbcClassInfoLeft">{{ wbcClassTileChange() }}</h3>
      <p
          v-if="type !== 'report'"
          class="pos-relative cursorPointer"
          @mouseover="tooltipVisibleFunc('classMoveLock', true)"
          @mouseout="tooltipVisibleFunc('classMoveLock', false)"
      >
        <font-awesome-icon :icon="['fas', 'lock']" v-if="!toggleLock" @click="toggleLockEvent" class="hoverSizeAction" />
        <font-awesome-icon :icon="['fas', 'lock-open']" v-if="toggleLock" @click="toggleLockEvent" class="hoverSizeAction" />
        <Tooltip :isVisible="tooltipVisible.classMoveLock" className="mb08" position="top" type="" :message="MSG.TOOLTIP.CLASS_MOVE" />
      </p>
    </div>
  </div>
  <div class="wbcClassScroll">
    <ul class="nth1Child classAttribute">
      <li>Class</li>
      <li class="wbcTitleText">
        <p class="firstP">Before</p>
        <p>(Count | Percent)</p>
      </li>
      <li class="wbcTitleText">
        <p class="firstP">After</p>
        <p>(Count | Percent)</p>
      </li>
    </ul>
    <div
        v-for="(item, idx) in wbcInfoVal"
        :key="item.id"
        class="wbcClassDbDiv"
        draggable="true"
        @dragstart="startDrag(idx, $event)"
        @dragover.prevent
        @drop="drop(idx, $event)"
        :class="type === 'report' && 'dragNone'"
    >
      <ul :class="{'nth1Child': true, 'cursorMove': toggleLock}" v-if="shouldRenderCategory(item.title)"
          @click="goClass(item.id)" title="BLUE text: changed element">
        <li>{{ item?.name }}</li>
        <li style="display: flex; justify-content: space-evenly;">
          <span class="grayText w20 text-left">{{ Number(item.count.before) || 0 }}</span>
          <span class="grayText w50 text-left">{{
              Number(item?.percent.before) ? item?.percent.before + '%' : '0'
            }}</span>
        </li>
        <li style="display: flex; justify-content: space-evenly;">
          <span :class="['w20', 'text-left', item.isChanged && 'blueText']">{{ Number(item?.count.after) || 0 }}</span>
          <span :class="['w50', 'text-left', item.isChanged && 'blueText']">{{
              Number(item?.percent.after) ? item?.percent.after + '%' : '0%'
            }}</span>
        </li>
      </ul>
    </div>
    <div class="wbcClassDbDiv classTotalColor">
      <ul class="nth1Child">
        <li>Total</li>
        <li class="classInfoWbc">
          <span class="w20 text-left">{{ Number(totalBeforeCount) || 0 }}</span>
          <span class="w50 text-left">100%</span>
        </li>
        <li class="classInfoWbc">
          <span class="w20 text-left">{{ Number(totalAfterCount) || 0 }}</span>
          <span class="w50 text-left">100%</span>
        </li>
      </ul>
    </div>

    <div v-if="projectBm">
      <div
          v-for="(item, idx) in wbcInfoVal"
          :key="item.id"
          class="wbcClassDbDiv mb20"
          draggable="true"
          @dragstart="startDrag(idx, $event)"
          @dragover.prevent
          @drop="drop(idx, $event)"
      >
        <ul class="nth1Child" v-if="item?.title === 'OT'" @click="goClass(item.id)">
          <li>{{ item?.name }}</li>
          <li class="grayText">{{ Number(item?.count.before) || 0 }}</li>
          <li :class="item.isChanged && 'blueText'">{{ Number(item?.count.after) || 0 }}</li>
        </ul>
      </div>
    </div>

    <div v-if="!projectBm">
      <template v-for="(nWbcItem, outerIndex) in filterByTitle(wbcInfoVal, 'nonWbc')" :key="outerIndex">
        <div class="categories" v-show="siteCd !== '0006' && nWbcItem?.title !== 'SM'"
             @click="goClass(nWbcItem.id)">
          <ul class="categoryNm" style="cursor: default;">
            <li class="mb10 liTitle" v-if="outerIndex === 0" style="cursor: default;">non-WBC</li>
            <li class="w-fit" style="cursor: default;">{{ getStringValue(nWbcItem.name) }}</li>
          </ul>
          <ul style="width: 30%;">
            <li class="mb10 liTitle" v-if="outerIndex === 0"></li>
            <li class="grayText" style="cursor: default; padding-left: 10px;">{{
                Number(nWbcItem?.count.before) || 0
              }}
            </li>
          </ul>
          <ul class="degree" style="width: 27%">
            <li class="mb10 liTitle" v-if="outerIndex === 0"></li>
            <li :class="nWbcItem.isChanged && 'blueText'" style="cursor: default; padding-left: 2px;">{{
                Number(nWbcItem?.count.after) || 0
              }}
            </li>
          </ul>
        </div>
      </template>
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
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
  />
</template>

<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps,
  onBeforeMount,
  onMounted,
  ref,
  watch
} from 'vue';
import {getBarcodeDetailImageUrl} from "@/common/lib/utils/conversionDataUtils";
import { getWbcCustomClassApi } from "@/common/api/service/setting/settingApi";
import { DIR_NAME } from "@/common/defines/constants/settings";
import {
  basicBmClassList,
  basicWbcArr,
  defaultBmClassList,
  defaultWbcClassList
} from "@/store/modules/analysis/wbcclassification";
import {useStore} from "vuex";
import {MESSAGES, MSG } from "@/common/defines/constants/constantMessageText";
import Alert from "@/components/commonUi/Alert.vue";
import {
  getOrderClassApi,
  putOrderClassApi
} from "@/common/api/service/setting/settingApi";

const props = defineProps(['wbcInfo', 'type', 'classCompareShow']);
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const emits = defineEmits();
import {removeDuplicatesById} from "@/common/lib/utils/removeDuplicateIds";
import {
  incheonGilPercentChange,
  incheonStMaryPercentChange,
  inhaPercentChange,
  seoulStMaryPercentChange
} from "@/common/helpers/common/classPercent";
import {
  getCbcCodeList,
  getCbcPathData, getLisPathData,
  getLisWbcRbcData,
  inhaCbc,
} from "@/common/helpers/lisCbc/inhaCbcLis";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import { TooltipClassInfoType } from "@/common/type/tooltipType";
import {
  gqlGenericUpdate,
  useUpdateRunningInfoMutation
} from '@/gql/mutation/slideData';

const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const siteCd = computed(() => store.state.commonModule.siteCd);
const slideData = computed(() => store.state.slideDataModule);
const selectItems = ref<any>([]);
const barcodeImg = ref('');
const userId = ref('');
const wbcInfoVal = ref<any>([]);
const wbcInfoAfterVal = ref<any>([]);
const wbcInfoBeforeVal = ref<any>([]);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);

const toggleLock = ref(false);
const dragIndex = ref(-1);
const dragOffsetY = ref(0);

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const orderClass = ref<any>([]);
const projectBm = ref(false);
const totalBeforeCount = ref(0);
const totalAfterCount = ref(0);
const lisFilePathSetArr = ref<any>([]);
const customClassArr = ref<any>([]);
const lisBtnColor = ref(false);
const cbcFilePathSetArr = ref('');
const cbcCodeList = ref<any>([]);
const lisCodeWbcArrApp = ref<any>([]);
const lisCodeRbcArrApp = ref<any>([]);
const lisHotKey = ref('');
const tooltipVisible = ref<TooltipClassInfoType>({
  classMoveLock: false,
  beforeCountPercent: false,
  afterCountPercent: false,
  lisUpload: false,
})

onBeforeMount(async () => {
  projectBm.value = window.PROJECT_TYPE === 'bm';
})

onMounted(async () => {
  // await nextTick();
  await getOrderClass();
  await getCustomClass();

  if (!projectBm.value) {
    const {lisCodeWbcArr, lisCodeRbcArr} = await getLisWbcRbcData();
    lisCodeWbcArrApp.value = lisCodeWbcArr;
    lisCodeRbcArrApp.value = lisCodeRbcArr;
    const {lisFilePathSetArr: lisFilePathSetArrVar, lisHotKey: lisHotKeyVal} = await getLisPathData();
    lisFilePathSetArr.value = lisFilePathSetArrVar;
    lisHotKey.value = lisHotKeyVal;
    cbcFilePathSetArr.value = await getCbcPathData();
    cbcCodeList.value = await getCbcCodeList();
  }
  setBarCodeImage(slideData.value);
  await mountedMethod();
})

watch(userModuleDataGet.value, (newUserId) => {
  userId.value = newUserId.id;
});

watch(() => slideData.value.id, async () => {
  setBarCodeImage(slideData.value);
  await store.dispatch('commonModule/setCommonInfo', {testType: slideData.value?.testType});
})

watch(() => props.wbcInfo, async (newItem) => {
  if (Object.keys(newItem).length !== 0) {
    await beforeAfterChange(newItem)
  }
});

const setBarCodeImage = (currentSelectItems: any) => {
  const path = currentSelectItems.img_drive_root_path !== '' && currentSelectItems.img_drive_root_path ? currentSelectItems.img_drive_root_path : pbiaRootDir.value;
  barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, currentSelectItems.slotId, DIR_NAME.BARCODE);
}

const mountedMethod = async () => {
  if (!slideData.value) {
    return;
  }

  if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
    const { inhaTestCode } = await inhaCbc(cbcFilePathSetArr.value, slideData.value, cbcCodeList.value, 'lisUpload');
    await store.dispatch('commonModule/setCommonInfo', { inhaTestCode: inhaTestCode });
  }
  if (slideData.value?.submitState) {
    lisBtnColor.value = slideData.value?.submitState === 'lisCbc';
  }
}

const goClass = (id: any) => {
  emits('scrollEvent', id)
}

const wbcClassTileChange = (): string => {
  if (!projectBm.value) {
    return 'WBC Classification';
  } else {
    return 'BM Classification';
  }
}

const startDrag = (index: any, event: any) => {
  dragIndex.value = index;
  dragOffsetY.value = event.clientY - event.target.getBoundingClientRect().top;
};

const drop = (index: any, event: any) => {
  if (!toggleLock.value) return;

  event.preventDefault();
  if (dragIndex.value !== -1) {
    const movedItem = wbcInfoVal.value.splice(dragIndex.value, 1)[0];
    wbcInfoVal.value.splice(index, 0, movedItem);
    dragIndex.value = -1;
    updateOriginalDb();
  }
};


const toggleLockEvent = () => {
  toggleLock.value = !toggleLock.value;
}

const getStringValue = (title: string): string => {
  if (title === 'Artifact(Smudge)' && siteCd.value === HOSPITAL_SITE_CD_BY_NAME['고대안암병원']) {
    return "Artifact";
  } else {
    return title;
  }
};

const sortWbcInfo = (wbcInfo: any, basicWbcArr: any) => {
  let newSortArr = JSON.parse(JSON.stringify(wbcInfo));

  newSortArr.sort((a: any, b: any) => {
    const nameA = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (a.title || a.abbreviation));
    const nameB = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (b.title || b.abbreviation));

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });

  return newSortArr;
};

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        orderClass.value = [];
      } else {
        orderClass.value = result.data.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const beforeAfterChange = async (newItem: any) => {
  await getOrderClass();
  const customClassItems = slideData.value.wbcInfoAfter.filter((item: any) => 90 <= Number(item.id) && Number(item.id) <= 95);
  selectItems.value = slideData.value;
  slideData.value.wbcInfoAfter = newItem;
  selectItems.value.wbcInfoAfter = newItem;

  const availableCustomClassArr = customClassArr.value.filter((item: any) => item.abbreviation !== '' && item.fullNm !== '')
  let wbcBeforeInfo = removeDuplicatesById(selectItems.value.wbcInfo.wbcInfo[0] || [])
  let wbcAfterInfo = removeDuplicatesById(selectItems.value?.wbcInfoAfter || selectItems.value.wbcInfo.wbcInfo[0] || []);

  wbcBeforeInfo = removeDuplicatesById(wbcBeforeInfo);
  wbcAfterInfo = removeDuplicatesById(wbcAfterInfo);


  // customClass가 있는 상태에서 첫 진입 시
  if (availableCustomClassArr.length > 0 && customClassItems.length === 0) {
    for (const customClassItem of availableCustomClassArr) {
      if (wbcAfterInfo.find((beforeItem: any) => beforeItem.id != customClassItem.customNum)) {
        const customItem = {
          id: String(customClassItem.customNum),
          name: customClassItem.fullNm,
          count: '0',
          title: customClassItem.abbreviation,
          images: [],
        }
        wbcBeforeInfo.push(customItem)
        wbcAfterInfo.push(customItem);
      }
    }
  } else if (availableCustomClassArr.length > 0 && customClassItems.length > 0) {
    for (const customClassItem of customClassItems) {
      if (wbcAfterInfo.find((item: any) => item.id != customClassItem.id)) {
        const customItem = {
          id: String(customClassItem.id),
          name: customClassItem.name,
          count: '0',
          title: customClassItem.title,
          images: [],
        }

        wbcBeforeInfo.push(customItem)
        wbcAfterInfo.push(customClassItem)
      }
    }
  }

  wbcBeforeInfo = wbcBeforeInfo.reduce((acc: any, current: any) => {
    if (!acc.some((item: any) => String(item.id) === String(current.id))) {
      acc.push(current);
    }
    return acc;
  }, []);

  wbcAfterInfo = wbcAfterInfo.reduce((acc: any, current: any) => {
    if (!acc.some((item: any) => String(item.id) === String(current.id))) {
      acc.push(current);
    }
    return acc;
  }, []);

  const wbcBeforeArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
  const wbcAfterArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;

  wbcInfoAfterVal.value = wbcAfterInfo;
  wbcInfoBeforeVal.value = wbcBeforeInfo;
  const wbcInfoAfterValForTotalCount = filterByTitle(wbcAfterInfo, 'wbc');
  const wbcInfoBeforeValForTotalCount = filterByTitle(wbcBeforeInfo, 'wbc');

  totalCountSet('before', wbcInfoBeforeValForTotalCount);
  totalCountSet('after', wbcInfoAfterValForTotalCount);

  // totalCount, percent - 따로
  for (const item of wbcInfoBeforeValForTotalCount) {
    createPercent(item, totalBeforeCount.value)
  }

  for (const item of wbcInfoAfterValForTotalCount) {
    createPercent(item, totalAfterCount.value)
  }

  const projectType = projectBm.value ? 'bm' : 'pb';

  if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['서울성모병원']) {
    wbcInfoBeforeVal.value = seoulStMaryPercentChange(wbcInfoBeforeValForTotalCount, wbcInfoBeforeVal.value);
    wbcInfoAfterVal.value = seoulStMaryPercentChange(wbcInfoAfterValForTotalCount, wbcInfoAfterVal.value);
  } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
    wbcInfoAfterVal.value = await inhaPercentChange(selectItems.value, wbcInfoAfterVal.value);
    wbcInfoBeforeVal.value = await inhaPercentChange(selectItems.value, wbcInfoBeforeVal.value);
  } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천성모병원']) {
    wbcInfoAfterVal.value = incheonStMaryPercentChange(projectType, wbcInfoAfterVal.value);
    wbcInfoBeforeVal.value = incheonStMaryPercentChange(selectItems.value, wbcInfoBeforeVal.value);
  } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천길병원']) {
    wbcInfoAfterVal.value = incheonGilPercentChange(wbcInfoAfterVal.value, selectItems.value?.wbcInfo.totalCount);
    wbcInfoBeforeVal.value = incheonGilPercentChange(wbcInfoBeforeVal.value, selectItems.value?.wbcInfo.totalCount);
  }

  wbcInfoVal.value = [];

  wbcInfoAfterVal.value = sortWbcInfo(wbcInfoAfterVal.value, wbcAfterArr);
  wbcInfoBeforeVal.value = sortWbcInfo(wbcInfoBeforeVal.value, wbcBeforeArr);

  for (const [index, beforeItem] of wbcInfoBeforeVal.value.entries()) {
    const afterItem = wbcInfoAfterVal.value[index]

    if (!afterItem) continue;
    const isChanged = isBeforeAfterChanged(beforeItem, afterItem);
    const item = {
      id: beforeItem.id,
      name: beforeItem.name,
      title: beforeItem.title,
      count: {before: beforeItem.count, after: afterItem.count},
      images: {before: beforeItem.images, after: afterItem.images},
      percent: {before: beforeItem.percent, after: afterItem.percent},
      isChanged
    }
    wbcInfoVal.value.push(item);
  }

}

/** Before, After 이미지들이 같은지 비교 */
const isBeforeAfterChanged = (beforeItem: any, afterItem: any) => {
  if (Number(beforeItem.count) !== Number(afterItem.count)) return true;

  const sortedBeforeImages = beforeItem.images.slice().map((item: any) => item.fileName);
  const sortedAfterImages = afterItem.images.slice().map((item: any) => item.fileName);

  const beforeSet = new Set(sortedBeforeImages);
  const afterSet = new Set(sortedAfterImages);

  if (beforeSet.size !== afterSet.size) {
    return true;
  } else {
    const areEqual = [...beforeSet].every(fileName => afterSet.has(fileName));
    if (areEqual) {
      return false;
    } else {
      return true;
    }
  }

  return false;
}

const filterByTitle = (wbcInfoArr: any, isNonWbc: 'wbc' | 'nonWbc') => {
  const titleArr = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM'];
  if (isNonWbc === 'nonWbc') {
    return wbcInfoArr.filter((item: any) => titleArr.includes(item.title));
  }

  return wbcInfoArr.filter((item: any) => !titleArr.includes(item.title));
}

const createPercent = (item: any, totalCount: any) => {
  if (projectBm.value && item.title !== 'OT') {
    const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1);  // 소수점 0인경우 정수 표현
    item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
  } else {
    // 인하대일 경우 percent 재계산 X
    if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
      return;
    }

    const targetArray = getStringArrayBySiteCd(siteCd.value, slideData.value?.testType);
    if (!targetArray.includes(item.title)) {
      const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1); // 소수점 0인경우 정수 표현
      item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
    }
  }
}

const shouldRenderCategory = (title: string) => {
  // 제외할 클래스들 정의
  const targetArray = getStringArrayBySiteCd(siteCd.value, slideData.value?.testType);
  return !targetArray.includes(title);
};

const getStringArrayBySiteCd = (siteCd: string, testType: string): string[] => {
  if (!siteCd && siteCd === '') {
    siteCd = '0000';
    testType = '01';
  }
  const arraysBySiteCd: any = { // 0006 -> 고대
    '0006': {
      includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
      includesStr2: ["NR", "AR", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
    },
  };

  // 지정된 siteCd에 대한 배열을 가져오거나, 기본 배열을 반환
  const arraysForSiteCd = arraysBySiteCd[siteCd] || {
    includesStr: ["AR", "NR", "GP", "PA", "MC", "SM", "MA", 'GP', 'PA', 'OT'],
    includesStr2: ["NR", "AR", "MC", "MA", "SM", 'GP', 'PA', 'OT'],
  };

  // testType에 따라 제외할 부분 정의
  return (testType === '01' || testType === '04') ? arraysForSiteCd.includesStr : arraysForSiteCd.includesStr2;
};

const totalCountSet = (showType: string, wbcInfoChangeVal: any) => {
  if (showType === 'before') {
    totalBeforeCount.value = 0;
  } else if (showType === 'after') {
    totalAfterCount.value = 0;
  }

  wbcInfoChangeVal.forEach((item: any) => {
    if (projectBm.value) {
      if (item.title !== 'OT') {
        showType === 'before' ? totalBeforeCount.value += Number(item.count) : totalAfterCount.value += Number(item.count);
      }
    } else {
      const targetArray = getStringArrayBySiteCd(siteCd.value, slideData.value?.testType);
      const titleInArray = targetArray.includes(item.title);
      if (!titleInArray) {
        showType === 'before' ? totalBeforeCount.value += Number(item.count) : totalAfterCount.value += Number(item.count);
      }
    }
  });
}

async function updateOriginalDb() {
  // wbcInfo.value를 깊은 복제(clone)하여 새로운 배열을 생성
  let clonedWbcInfo = JSON.parse(JSON.stringify([...wbcInfoAfterVal.value]));
  let totalCount = 0;
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      if (projectBm.value) {
        if (image.title !== 'OT') {
          totalCount += 1
        }
      } else {
        const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
        if (!targetArray.includes(image.title)) {
          totalCount += 1;
        }
      }
    });
  });
  // 각 이미지 객체에서 width와 height 속성은 저장 안해도되는 부분이라서 디비에 저장 안함
  clonedWbcInfo.forEach((item: any) => {

    createPercent(item, totalCount);
    const projectType = projectBm.value ? 'bm' : 'pb';

    if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['서울성모병원']) {
      wbcInfoAfterVal.value = seoulStMaryPercentChange(clonedWbcInfo, wbcInfoAfterVal.value);
    } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
      wbcInfoAfterVal.value = inhaPercentChange(selectItems.value, wbcInfoAfterVal.value);
    } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천성모병원']) {
      wbcInfoAfterVal.value = incheonStMaryPercentChange(projectType, wbcInfoAfterVal.value);
    } else if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천길병원']) {
      wbcInfoAfterVal.value = incheonGilPercentChange(wbcInfoAfterVal.value, selectItems.value?.wbcInfo.totalCount);
    }
  });

  // wbcInfoAfter 업데이트 및 sessionStorage에 저장
  selectItems.value.wbcInfoAfter = clonedWbcInfo;
  await store.dispatch('commonModule/setCommonInfo', {classInfoSort: [...wbcInfoAfterVal.value]});


  const sortArr = sortWbcInfo(orderClass.value, wbcInfoVal.value);
  sortArr.forEach((item: any, index: any) => {
    item.orderIdx = index;
  });

  // originalDb 업데이트

  if (slideData.value) {
    selectItems.value.wbcInfoAfter = clonedWbcInfo;
  }

  await putOrderClassApi(sortArr);

  //updateRunningApi 호출
  await updateRunningApiPost(slideData.value);

  emits('classOrderChanged')
  await store.dispatch('commonModule/setCommonInfo', {classInfoSort: []});
}

async function updateRunningApiPost(originalDb: any) {
  try {
    await gqlGenericUpdate(useUpdateRunningInfoMutation, {
      id: originalDb.id,
      isNormal: originalDb.isNormal,
      abnormalClassInfo: originalDb.abnormalClassInfo,
      pcIp: originalDb.pcIp,
      lock_status: originalDb.lock_status,
      wbcInfoAfter: originalDb.wbcInfoAfter,
      submitState: originalDb.submitState,
    });
    await store.dispatch('slideDataModule/updateSlideData', originalDb);
  } catch (error) {
    console.error('Error:', error);
  }
}

const getCustomClass = async () => {
  try {
    const result = await getWbcCustomClassApi();
    customClassArr.value = result.data;
  } catch (e) {
    console.error(e);
  }
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

const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};

const tooltipVisibleFunc = (type: keyof TooltipClassInfoType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}

</script>