<template>
  <div class="loaderBackground" v-if="isClassInfoMenuLoading || isImageGalleryLoading">
    <div class="loader"></div>
    <p class="loadingText">Loading...</p>
  </div>

  <div class="wbcMenu">
    <ul>
      <template v-if="['bm', 'pb'].includes(projectType)">
        <template v-if="visibleBySite(siteCd, [HOSPITAL_SITE_CD_BY_NAME['원자력병원'], HOSPITAL_SITE_CD_BY_NAME['TEST']], 'enable')">
          <li
              v-if="((slideData?.slideCondition && slideData?.slideCondition?.condition === 'Bad') || slideData?.isNormal === 'N')"
              class="classInfoMenu-warning-container"
              @mouseover="showErrorContainer(true)"
              @mouseout="showErrorContainer(false)"
          >
            <p class="menuIco">
              <font-awesome-icon class="icon-red-color" :icon="['fas', 'triangle-exclamation']" v-if="slideData?.slideCondition && slideData?.slideCondition?.condition === 'Bad'" />
              <font-awesome-icon class="icon-yellow-color" :icon="['fas', 'triangle-exclamation']" v-else-if="slideData?.isNormal === 'N' && projectType === 'pb'" />
            </p>
            <div v-if="isErrorContainerOpen" class="classInfoMenu-error-container shadowBox">
              <div class="classInfoMenu-error-wrapper" v-if="slideCondition?.condition === 'Bad'">
                <h1 class="slideStatusPopup-title icon-red-color">Condition</h1>
                <p>{{ slideCondition?.desc }}</p>
              </div>

              <hr v-if="slideCondition?.condition === 'Bad'" class="slideStatusPopup-line" />

              <div v-if="Array.isArray(slideData?.abnormalClassInfo) && projectType === 'pb'" class="classInfoMenu-error-wrapper normalRange mt08">
                <h1 class="slideStatusPopup-title icon-yellow-color">Out of Normal Range</h1>
                <div class="slideStatusPopup-content" v-for="(abItem, abnormalIdx) in slideData?.abnormalClassInfo" :key="abnormalIdx">
                  <p v-if="abItem?.classNm" class="slideStatusPopup-normal-wrapper">
                    <span>{{ abItem?.classNm }}</span>
                    <span>{{ handleAbnormalValue(abItem?.val) }}</span>
                    <span>{{ handleAbnormalRange(abItem?.val, currentAbnormalRange[abnormalIdx]?.min, currentAbnormalRange[abnormalIdx]?.max, currentAbnormalRange[abnormalIdx]?.unit) }}</span>
                  </p>
                </div>
              </div>
            </div>
          </li>
          <li v-else class="classInfoMenu-noWarning-container"></li>
        </template>

        <li
            :class="{ onRight: isActive(projectType === 'bm' ? '/databaseWhole' : '/databaseRbc') }"
            @click="pageGo(projectType === 'bm' ? '/databaseWhole' : '/databaseRbc')"
            v-if="projectType !== 'pb' || (testType === '04' && projectType === 'pb')"
        >
          <p class="menuIco">
            <font-awesome-icon :icon="['fas', 'virus']"/>
          </p>
          <p>{{ projectType === 'bm' ? 'WHOLE' : 'RBC' }}</p>
        </li>
        <li :class='{ "onRight": isActive("/databaseDetail") }' @click="pageGo('/databaseDetail')">
          <p class="menuIco">
            <font-awesome-icon :icon="['fas', 'disease']"/>
          </p>
          <p>{{ projectType === 'bm' ? 'BM CELL' : 'WBC' }}</p>
        </li>
        <li
            :class="{ onRight: isActive('/databasePlt') }"
            @click="pageGo('/databasePlt')"
            v-if="projectType !== 'bm' && pltOnOff"
        >
          <p class="menuIco">
            <font-awesome-icon :icon="['fas', 'certificate']"/>
          </p>
          <p>PLT</p>
        </li>
        <li :class='{ "onRight": isActive("/report") }' @click="pageGo('/report')">
          <p class="menuIco">
            <font-awesome-icon :icon="['fas', 'clipboard']"/>
          </p>
          <p>REPORT</p>
        </li>
      </template>
    </ul>
    <div @click="lisCbcClick" :class='{ "onRight": cbcLayer, "cbcLi": true }' v-if="projectType !== 'bm'">
      <font-awesome-icon :icon="['fas', 'desktop']"/>
      <p>LIS-CBC</p>
    </div>
    <div class="wbcMenuBottom">
      <button @click="moveWbc('up')" :disabled="isButtonDisabled">
        <font-awesome-icon :icon="['fas', 'circle-up']"/>
      </button>
      <button @click="moveWbc('down')" :disabled="isButtonDisabled">
        <font-awesome-icon :icon="['fas', 'circle-down']"/>
      </button>
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
  getCurrentInstance, nextTick,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watch
} from "vue";
import router from "@/router";

import {
  clearPcIpState,
  pageUpDownRunnIngApi,
  updatePcIpStateApi
} from "@/common/api/service/runningInfo/runningInfoApi";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { getNormalRangeApi, getOrderClassApi } from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import { getDeviceIpApi } from "@/common/api/service/device/deviceApi";
import { useGetRunningInfoByIdQuery } from "@/gql/useQueries";
import { DIR_NAME } from "@/common/defines/constants/settings";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import { gqlGenericUpdate, slideConditionUpdateMutation } from "@/gql/mutation/slideData";
import { isObjectEmpty } from "@/common/lib/utils/validators";
import {visibleBySite} from "@/common/lib/utils/visibleBySite";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";

const emits = defineEmits();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const projectType = ref<string>('bm');
const selectItems = ref<any>(null);
const resData = ref<any>([]);
const instance = getCurrentInstance();
const store = useStore();
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const siteCd = computed(() => store.state.commonModule.siteCd);
const currentAbnormalRange = ref([]);
const normalItems = ref([]);
const route = useRoute();
const orderClass = ref([]);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const isButtonDisabled = ref(false);
let timeoutId: number | undefined = undefined;
const pageMoveDeleteStop = ref(false);
const props = defineProps(['isNext', 'changeSlideByLisUpload']);
const ipAddress = ref<any>('');
const keepPage = ref('');
let socketTimeoutId: number | undefined = undefined; // 타이머 ID 저장
const testType = computed(() => store.state.commonModule.testType);
const isClassInfoMenuLoading = computed(() => store.state.commonModule.isClassInfoMenuLoading);
const isImageGalleryLoading = computed(() => store.state.commonModule.isImageGalleryLoading);
const dbListDataFirstNum = computed(() => store.state.commonModule.dbListDataFirstNum);
const dbListDataLastNum = computed(() => store.state.commonModule.dbListDataLastNum);
const apiBaseUrl = window.LINUX_SERVER_SET ? window.EQUIPMENTPCIP : window.APP_API_BASE_URL;
const slideData = computed(() => store.state.slideDataModule);
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const pltOnOff = ref(false);
const isErrorContainerOpen = ref(false);
const slideCondition = ref({
  condition: '',
  desc: '',
})

watch(props.isNext, (newVal) => {
  if (newVal) {
    moveWbc('down')
  }
});

watch(() => props.changeSlideByLisUpload, (newVal) => {
  moveWbc('up');
})

onBeforeMount(async () => {
  projectType.value = window.PROJECT_TYPE;
  await getDetailRunningInfo();
  await getNormalRange();
  await store.dispatch('commonModule/setCommonInfo', { isClassInfoMenuLoading: false });
  const keepPageType = projectType.value === 'bm' ? 'bmKeepPage' : 'keepPage';
  keepPage.value = JSON.parse(JSON.stringify(sessionStorage.getItem(keepPageType)));
  await checkHasPltInfo();
})

onMounted(async () => {
  pageMoveDeleteStop.value = true;
  const ip = await getDeviceIpApi();
  ipAddress.value = ip.data;
});

onUnmounted(async () => {
  if (pageMoveDeleteStop.value) {
    await deleteConnectionStatus();
  }
  await store.dispatch('commonModule/setCommonInfo', {cbcLayer: false});
})

watch(() => slideData.value?.id, async (newSlideDataId, oldSlideDataId) => {
  if (newSlideDataId !== oldSlideDataId) {
    await checkHasPltInfo();
  }
})

const getDetailRunningInfo = async () => {
  try {
    const {result, loading, error} = useGetRunningInfoByIdQuery(
        {id: Number(selectedSampleId.value)},
        {fetchPolicy: 'no-cache'}
    );

    watch(result, (newValue) => {
      if (newValue) {

        // newValue가 존재하면 해당 데이터를 처리
        store.dispatch('slideDataModule/updateSlideData', newValue?.getRunningInfoByIdGQL);

        const result = newValue?.getRunningInfoByIdGQL;
        selectItems.value = result;

        store.dispatch('commonModule/setCommonInfo', { testType: selectItems.value.testType});

        resData.value = result;
      } else {
        console.log('No result');
      }
    });


  } catch (e) {
    console.error(e);
    selectItems.value = null;
    resData.value = null;
  }
}

const hideAlert = () => {
  showAlert.value = false;
};

const deleteConnectionStatus = async () => {
  const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
  const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
  const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
  const req = `oldPcIp=${ipAddress.value}&dayQuery=${dayQuery}`
  await clearPcIpState(req)
      .then(response => {
        delayedEmit('SEND_DATA', 'refreshDb', 300);
      }).catch(error => {
        console.error('2 err', error)
      });
}

const upDownBlockAccess = async (selectItems: any) => {
  try {
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const req = `oldPcIp=${ipAddress.value}&newEntityId=${resData.value?.id}&newPcIp=${ipAddress.value}&dayQuery=${dayQuery}`;

    await updatePcIpStateApi(req).then(response => {
      delayedEmit('SEND_DATA', 'refreshDb', 300);
    }).catch(error => {
      console.error('3 err', error)
    });
  } catch (e) {
    console.error(e)
  }
}

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

const delayedEmit = (type: string, payload: string, delay: number) => {
  if (socketTimeoutId !== undefined) {
    clearTimeout(socketTimeoutId); // 이전 타이머 클리어
  }

  socketTimeoutId = window.setTimeout(() => {
    instance?.appContext.config.globalProperties.$socket.emit('state', {
      type: 'SEND_DATA',
      payload: 'refreshDb'
    });
  }, delay);
};

const pageGo = (path: string) => {
  router.push(path);
  pageMoveDeleteStop.value = false;
}

async function pageUpDownRunnIng(id: number, step: string, type: string) {
  try {
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal, searchType} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const startDay = searchText === '' ? startDate : '';
    const endDay = searchText === '' ? endDate : '';
    const barcodeNo = searchType === 'barcodeNo' ? searchText : undefined;
    const reqParams = [
      `id=${id}`,
      `type=${type}`,
      `dayQuery=${dayQuery}`,
      `title=${wbcInfo}`,
      `startDay=${startDay}`,
      `endDay=${endDay}`
    ];

    if (barcodeNo) {
      reqParams.push(`barcodeNo=${barcodeNo}`);
    }

    if (nrCount) {
      reqParams.push(`nrCount=${nrCount}`);
    }

    if (testType && testType !== '00') {
      reqParams.push(`testType=${testType}`);
    }

    const req = reqParams.join('&');
    const res = await pageUpDownRunnIngApi(req);

    if (res.data !== null) {
      selectItems.value = res.data;
      resData.value = res.data;
      const result = await getDeviceIpApi();
      if (res.data.pcIp !== result.data && res.data.lock_status) {
        return;
      }
      await store.dispatch('slideDataModule/updateSlideData', res.data);
      await store.dispatch('commonModule/setCommonInfo', {selectedSampleId: String(res.data?.id)});

    }
  } catch (e) {
    console.error(e)
  }
}

const moveWbc = async (direction: any) => {
  if (isClassInfoMenuLoading.value || isImageGalleryLoading.value) {
    return;
  }

  await store.dispatch('commonModule/setCommonInfo', { isClassInfoMenuLoading: true });
  if (direction === 'up') {
    if (dbListDataFirstNum.value === selectItems.value?.id) {
      showAlert.value = true;
      alertType.value = 'success';
      alertMessage.value = 'This is the first page. Navigation to other pages is not possible.';
      await store.dispatch('commonModule/setCommonInfo', { isClassInfoMenuLoading: false });
      return;
    }
  } else {
    if (dbListDataLastNum.value === selectItems.value?.id) {
      showAlert.value = true;
      alertType.value = 'success';
      alertMessage.value = 'This is the last page. Navigation to other pages is not possible.';
      await store.dispatch('commonModule/setCommonInfo', { isClassInfoMenuLoading: false });
      return;
    }
  }

  await store.dispatch('commonModule/setCommonInfo', {cbcLayer: false});
  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
  }
  isButtonDisabled.value = true; // 버튼 비활성화
  await getOrderClass(); // 클래스 정보를 업데이트
  await processNextDbIndex(direction, resData.value?.id);

  timeoutId = window.setTimeout(() => {
    isButtonDisabled.value = false;
  }, 700);

};

const processNextDbIndex = async (direction: any, id: number) => {
  const res: any = await pageUpDownRunnIng(id, '1', direction);
  if (resData.value?.lock_status) {
    showAlert.value = true;
    alertType.value = 'success';
    alertMessage.value = 'Someone else is editing.';
    await store.dispatch('commonModule/setCommonInfo', { isClassInfoMenuLoading: false });
    return;
  } else {
    await handleDataResponse(res?.id, res);
    await store.dispatch('commonModule/setCommonInfo', { isClassInfoMenuLoading: false });
  }
};

const handleDataResponse = async (dbId: any, res: any) => {
  if (!resData.value || Object.keys(resData.value).length === 0) return;
  selectItems.value = resData.value;

  const resClassInfo = resData.value?.wbcInfoAfter.length === 0 ? resData.value?.wbcInfo?.wbcInfo[0] : resData.value?.wbcInfoAfter;
  await updateUpDown(resClassInfo, resData.value);
};

const updateUpDown = async (selectWbc: any, selectItemsNewVal: any) => {
  if ((projectType.value === 'pb' && selectItems.value?.testType === '01' && isActive("/databaseRbc")) || (!keepPage.value || keepPage.value === "false")) {
    pageGo('/databaseDetail');
  }
  emits('refreshClass', selectItemsNewVal);
  pageMoveDeleteStop.value = true;
  await upDownBlockAccess(selectItemsNewVal);
  await store.dispatch('commonModule/setCommonInfo', { isClassInfoMenuLoading: false });
};

const isActive = (path: string) => {
  return route.path === path;
};

const lisCbcClick = () => {
  //
  store.dispatch('commonModule/setCommonInfo', {cbcLayer: !cbcLayer.value});
}

const showErrorContainer = async (show: boolean) => {
  if (!show) {
    isErrorContainerOpen.value = show;
    return;
  }

  updateAbnormalRanges(slideData.value);

  if (!slideData.value?.slideCondition?.desc) {
    const slideInfo = await getSlideCondition(slideData.value?.slotId);
    const slideInfoObj = {
      condition: slideInfo?.slideCondition,
      desc: slideInfo?.slideDescription
    };

    const updatedRuningInfo = { ...slideData.value, slideCondition: slideInfoObj };
    await gqlGenericUpdate(slideConditionUpdateMutation, {
      id: slideData.value?.id,
      slideCondition: slideInfoObj
    });
    slideCondition.value.condition = slideInfoObj.condition;
    slideCondition.value.desc = slideInfoObj.desc;
    await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
  } else {
    slideCondition.value.condition = slideData.value?.slideCondition?.condition;
    slideCondition.value.desc = slideData.value?.slideCondition?.desc;
  }
  isErrorContainerOpen.value = show;
}

const getSlideCondition = async (slotId: string) => {
  const folderPath = projectType.value !== 'bm' ? DIR_NAME.WBC_CLASS : DIR_NAME.BM_CLASS;
  const url_new = `${iaRootPath.value}/${slotId}/${folderPath}/Slide_Condition.json`;
  let slideCondition = '';
  let slideDescription = '';
  try {
    const response_new = await readJsonFile({fullPath: url_new});
    slideCondition = response_new?.data?.condition;
    slideDescription = response_new?.data?.description;
  } catch (err) {
    console.error(err);
  }

  return { slideCondition, slideDescription };
}

const getNormalRange = async () => {
  try {
    const result = await getNormalRangeApi();
    if (result) {
      if (result?.data) {
        const data = result.data;
        normalItems.value = data;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const updateAbnormalRanges = (data: any) => {
  if (isObjectEmpty(data?.abnormalClassInfo) || (!Array.isArray(data?.abnormalClassInfo) && !data.abnormalClassInfo?.classNm)) {
    return;
  }

  currentAbnormalRange.value = data.abnormalClassInfo
      .map((abnormalItem: any) => normalItems.value.find(normalRange => normalRange?.abbreviation === abnormalItem.classNm))
      .filter(Boolean)
      .map((normalRange: any) => ({
        title: normalRange.abbreviation,
        min: normalRange.min,
        max: normalRange.max,
        unit: normalRange.unit,
      }));

};

const handleAbnormalRange = (countVal: string, min: number, max: number, unit: string) => {
  const numericValue = parseFloat(countVal.match(/[\d.]+/)?.[0] || "0");
  const formattedMin = unit === "%" ? min.toFixed(2) : min;
  const formattedMax = unit === "%" ? max.toFixed(2) : max;

  if (numericValue < min) return `< ${formattedMin} ${unit}`;
  if (numericValue > max) return `> ${formattedMax} ${unit}`;
  return '';
}

const handleAbnormalValue = (value: string) => {
  return value.replace('[', '').replace(']', '').replaceAll('Count', '');
}

const checkHasPltInfo = async () => {
  // 인하대 업데이트로 잠시 막아놓음 (PLT 분리 Version 사용 X)
  if (projectType.value !== 'pb' || siteCd.value === '0011') {
    return;
  }

  if (isActive('/databasePlt')) {
    pltOnOff.value = true;
    return;
  }

  pltOnOff.value = false;
  const path = slideData.value?.img_drive_root_path !== '' && slideData.value?.img_drive_root_path ? slideData.value?.img_drive_root_path : iaRootPath.value;
  const folderPath = `${path}/${slideData.value?.slotId}/${DIR_NAME.RBC_IMAGE}`;
  const url = `${apiBaseUrl}/folders?folderPath=${folderPath}`;

  try {
    const response = await fetch(url);
    const fileNames = await response.json();
    if (fileNames?.code === 400) {
      pltOnOff.value = false;
      return;
    }
    if (fileNames && fileNames.length > 0) {
      const hasPlt = fileNames.find((item) => item.includes('zPLT_Image'));
      if (hasPlt) {
        pltOnOff.value = true;
      } else {
        pltOnOff.value = false;
      }
    } else {
      pltOnOff.value = false;
    }
  } catch (err) {
    console.error(err);
    pltOnOff.value = false;
  }
}

</script>
