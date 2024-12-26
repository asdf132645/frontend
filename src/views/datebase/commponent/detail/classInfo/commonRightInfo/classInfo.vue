<template>
  <img class="mt10" v-if="type !== 'report' && !barCodeImageShowError && siteCd !== HOSPITAL_SITE_CD_BY_NAME['고대구로병원']" @error="onImageError" :src="barcodeImg"/>
  <div class="mt10" v-else-if="type !== 'report' && barCodeImageShowError" style="height: 209.5px;"></div>
  <div class="mt10" v-else-if="type !== 'report'" style="height: 209.5px;"></div>
  <div class="mt10 mb10 flex-justify-between">
    <h3 class="wbcClassInfoLeft">{{ wbcClassTileChange() }}</h3>

    <ul class="leftWbcInfo">
      <li
          class="pos-relative"
          @mouseenter="tooltipVisibleFunc('barcodeCopy', true)"
          @mouseleave="tooltipVisibleFunc('barcodeCopy', false)"
      >
        <font-awesome-icon @click="barcodeCopy" :icon="['fas', 'copy']" class="hoverSizeAction" />
        <Tooltip :isVisible="tooltipVisible.barcodeCopy" className="mb08" position="top" type="" :message="MSG.TOOLTIP.BARCODE_COPY" />
      </li>

      <li
          v-if="type !== 'report'"
          class="pos-relative"
          @mouseenter="tooltipVisibleFunc('memo', true)"
          @mouseleave="tooltipVisibleFunc('memo', false)"
      >
        <font-awesome-icon :icon="['fas', 'comment-dots']" @click="memoOpen" class="hoverSizeAction" />
        <Tooltip :isVisible="tooltipVisible.memo" className="mb08" position="top" type="" :message="MSG.TOOLTIP.MEMO" />
        <div v-if="memoModal" class="memoModal">
          <textarea v-model="wbcMemo"></textarea>
          <button class="memoModalBtn" @click="memoChange">OK</button>
          <button class="memoModalBtn" @click="memoCancel">CANCEL</button>
        </div>
      </li>
      <li
          @click="commitConfirmed"
          class="pos-relative"
          :class="{'submitted': selectItems?.submitState === 'Submit',}"
          @mouseenter="tooltipVisibleFunc('confirm', true)"
          @mouseleave="tooltipVisibleFunc('confirm', false)"
      >
        <font-awesome-icon :icon="['fas', 'square-check']" class="hoverSizeAction" />
        <Tooltip :isVisible="tooltipVisible.confirm" className="mb08" position="top" type="" :message="MSG.TOOLTIP.CONFIRM" />
      </li>
      <li
          v-if="!crcConnect && showLISUploadButton"
          @click="lisModalOpen"
          class="pos-relative"
          :class="{'submitted': selectItems?.submitState === 'lisCbc' || lisBtnColor,}"
          @mouseenter="tooltipVisibleFunc('lisUpload', true)"
          @mouseleave="tooltipVisibleFunc('lisUpload', false)"
      >
        <font-awesome-icon :icon="['fas', 'upload']" class="hoverSizeAction" />
        <Tooltip :isVisible="tooltipVisible.lisUpload" className="mb08" position="top" type="" :message="MSG.TOOLTIP.LIS_UPLOAD" />
      </li>
      <li
          class="pos-relative"
          @mouseenter="tooltipVisibleFunc('classMoveLock', true)"
          @mouseleave="tooltipVisibleFunc('classMoveLock', false)"
      >
        <font-awesome-icon :icon="['fas', 'lock']" v-if="!toggleLock" @click="toggleLockEvent" class="hoverSizeAction" />
        <font-awesome-icon :icon="['fas', 'lock-open']" v-if="toggleLock" @click="toggleLockEvent" class="hoverSizeAction" />
        <Tooltip :isVisible="tooltipVisible.classMoveLock" className="mb08" position="top" type="" :message="MSG.TOOLTIP.CLASS_MOVE" />
      </li>
    </ul>
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
              Number(item?.percent.after) ? item?.percent.after + '%' : '0'
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
        <div class="categories" v-show="selectItems?.siteCd !== '0006' && nWbcItem?.title !== 'SM'"
             @click="goClass(nWbcItem.id)">
          <ul class="categoryNm" style="cursor: default;">
            <li class="mb10 liTitle" v-if="outerIndex === 0" style="cursor: default;">non-WBC</li>
            <li class="w-fit" style="cursor: default;">{{ getStringValue(nWbcItem.name) }}</li>
          </ul>
          <ul style="width: 29%;">
            <li class="mb10 liTitle" v-if="outerIndex === 0"></li>
            <li class="grayText" style="cursor: default; padding-left: -20px;">{{
                Number(nWbcItem?.count.before) || 0
              }}
            </li>
          </ul>
          <ul class="degree" style="width: 27%">
            <li class="mb10 liTitle" v-if="outerIndex === 0"></li>
            <li :class="nWbcItem.isChanged && 'blueText'" style="cursor: default;">{{
                Number(nWbcItem?.count.after) || 0
              }}
            </li>
          </ul>
        </div>
      </template>
    </div>
    <div class="memoModal bottom text-left staticMemoModal" v-if="router.currentRoute.value.path === '/report'">
      <textarea class="staticTextArea" v-model="wbcMemo"></textarea>
      <button class="memoModalBtn" @click="memoChange">Save</button>
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
      :position="toastPosition(siteCd)"
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
  onUnmounted,
  ref,
  watch
} from 'vue';
import {getBarcodeDetailImageUrl} from "@/common/lib/utils/conversionDataUtils";
import {crcOptionGet, getWbcCustomClassApi} from "@/common/api/service/setting/settingApi";
import { DIR_NAME } from "@/common/defines/constants/settings";
import {
  basicBmClassList,
  basicWbcArr,
  defaultBmClassList,
  defaultWbcClassList
} from "@/store/modules/analysis/wbcclassification";
import {
  classInfoDetailSelectQueryApi,
  detailRunningApi,
  updateRunningApi
} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {MESSAGES, MSG } from "@/common/defines/constants/constantMessageText";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {
  getOrderClassApi,
  putOrderClassApi
} from "@/common/api/service/setting/settingApi";

const props = defineProps(['wbcInfo', 'selectItems', 'type', 'isCommitChanged', 'classCompareShow', 'isAllClassesChecked']);
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const emits = defineEmits();
import moment from 'moment';
import {BUSINESS_ID, CbcWbcTestCdList_0002, EQMT_CD, INST_CD} from "@/common/defines/constants/lis";
import axios from "axios";
import {xml2json} from "xml-js";
import {createCbcFile, createDirectory, createFile} from "@/common/api/service/fileSys/fileSysApi";
import {
  createH17,
  readH7Message,
  readNoFlagHl7Message
} from "@/common/api/service/fileReader/fileReaderApi";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
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
  inhaDataSend,
} from "@/common/helpers/lisCbc/inhaCbcLis";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useRouter} from "vue-router";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import { TooltipClassInfoType } from "@/common/type/tooltipType";
import {gqlCBCUpdate, gqlMemoMenuUpdate, gqlUpdate} from "@/gql/mutation";

const router = useRouter();
const showLISUploadButton = ref(true);
const selectItems = ref(props.selectItems);
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const inhaTestCode: any = computed(() => store.state.commonModule.inhaTestCode);
const deviceSerialNm = computed(() => store.state.commonModule.deviceSerialNm);
const siteCd = computed(() => store.state.commonModule.siteCd);
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const slideData = computed(() => store.state.slideDataModule);
const showLISUploadAfterCheckingAll = computed(() => store.state.commonModule.showLISUploadAfterCheckingAll);

const barcodeImg = ref('');
const userId = ref('');
const wbcMemo = ref('');
const memoModal = ref(false);
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
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const orderClass = ref<any>([]);
const projectBm = ref(false);
const totalBeforeCount = ref(0);
const totalAfterCount = ref(0);
const okMessageType = ref('');
const lisCodeWbcArr = ref<any>([]);
const lisFilePathSetArr = ref<any>([]);
const customClassArr = ref<any>([]);
const barCodeImageShowError = ref(false);
const submittedScreen = ref(false);
const lisBtnColor = ref(false);
const cbcFilePathSetArr = ref('');
const cbcCodeList = ref<any>([]);
const lisCodeWbcArrApp = ref<any>([]);
const lisCodeRbcArrApp = ref<any>([]);
const lisHotKey = ref('');
const crcConnect = ref(false);
const isHotKeyPressed = ref(false);
const tooltipVisible = ref<TooltipClassInfoType>({
  barcodeCopy: false,
  memo: false,
  confirm: false,
  classMoveLock: false,
  beforeCountPercent: false,
  afterCountPercent: false,
  lisUpload: false,
})

onBeforeMount(async () => {
  barCodeImageShowError.value = false;
  projectBm.value = window.PROJECT_TYPE === 'bm';
  const crcOptionApi = await crcOptionGet();
  if (crcOptionApi.data.length !== 0) {
    crcConnect.value = crcOptionApi.data[0].crcConnect;
  }

})

onMounted(async () => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  await nextTick();
  await getOrderClass();
  await getCustomClass();
  await mountedMethod();

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
  barCodeImageShowError.value = false;

  // if (!showLISUploadAfterCheckingAll.value) {
  //   showLISUploadButton.value = true;
  // } else {
  //   showLISUploadButton.value = props.isAllClassesChecked;
  // }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
})

// watch(() => props.isAllClassesChecked, () => {
//
//   if (!showLISUploadAfterCheckingAll.value) {
//     showLISUploadButton.value = true;
//   } else {
//     showLISUploadButton.value = props.isAllClassesChecked;
//   }
// })

watch(() => props.isCommitChanged, () => {
  selectItems.value.submitState = 'Submit';
})

watch(userModuleDataGet.value, (newUserId) => {
  userId.value = newUserId.id;
});

watch(() => props.wbcInfo, (newItem) => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  if (Object.keys(newItem).length !== 0) {
    beforeAfterChange(newItem)
    wbcMemo.value = props.selectItems?.wbcMemo;
    const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : pbiaRootDir.value;
    barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, props.selectItems?.slotId, DIR_NAME.BARCODE);
    store.dispatch('commonModule/setCommonInfo', {testType: props.selectItems.testType});
    // if (props.selectItems?.submitState === "") {
    //   const result: any = detailRunningApi(String(props.selectItems?.id));
    //   const updatedItem = {
    //     submitState: 'checkFirst',
    //   };
    //   const updatedRuningInfo = {...result.data, ...updatedItem}
    //   resRunningItem(updatedRuningInfo, true);
    // }
  }
});

const handleKeyDown = (event: KeyboardEvent) => {
  if (router.currentRoute.value.path === '/report') return;
  const keyName = event.key;

  if (!isHotKeyPressed.value && keyName.toUpperCase() === lisHotKey.value.toUpperCase()) {
    event.preventDefault(); // 기본 동작 방지
    isHotKeyPressed.value = true; // 한 번만 실행되도록 설정
    uploadLis();
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  if (router.currentRoute.value.path === '/report') return;
  if (isHotKeyPressed.value) {
    isHotKeyPressed.value = false; // 키를 떼면 다시 실행 가능
  }
};

const mountedMethod = async () => {
  if (isObjectEmpty(props.selectItems)) return;

  if ((inhaTestCode.value === '' && siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원'])) {
    await inhaCbc(cbcFilePathSetArr.value, props.selectItems, cbcCodeList.value, 'lisUpload');
  }
  wbcMemo.value = props.selectItems?.wbcMemo;
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : pbiaRootDir.value;
  barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, props.selectItems?.slotId, DIR_NAME.BARCODE);
  if (props.selectItems?.submitState) {
    lisBtnColor.value = props.selectItems.submitState === 'lisCbc';
  }

  // 첫 진입시
  // if (props.selectItems?.submitState === "" || !props.selectItems?.submitState) {
  //   const result: any = await detailRunningApi(String(props.selectItems?.id));
  //   const updatedItem = {
  //     submitState: 'checkFirst',
  //   };
  //   const updatedRuningInfo = {...result.data, ...updatedItem}
  //   await resRunningItem(updatedRuningInfo, true);
  // }
}

const lisModalOpen = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.IDS_MSG_UPLOAD_LIS;
  okMessageType.value = 'lisCbc';
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

const barcodeCopy = async () => {
  const textarea = document.createElement('textarea');
  textarea.value = props.selectItems.barcodeNo;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
  showToast(MESSAGES.TOAST_MSG_BAR_CODE_SUCCESS);
}

const commitConfirmed = () => {
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

const uploadLis = async () => {
  switch (siteCd.value) {
    case HOSPITAL_SITE_CD_BY_NAME['서울성모병원']:
      cmcSeoulLisAndCbcDataGet();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['인하대병원']:
      inhaDataSendLoad();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['인천길병원']:
      gilDataSendLoad();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['고대안암병원']:
      godaeAnamDataSendLoad();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['NONE']:
    case HOSPITAL_SITE_CD_BY_NAME['UIMD']:
      lisLastStep();
      break;
  }
}

const uimdTestCbcLisDataGet = () => {
  // 서울 성모 테스트 코드
  const codeList = CbcWbcTestCdList_0002;
  const {wbcInfoAfter} = props.selectItems ?? {};
  let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
  // cbc 결과 조회
  axios.get(`${apiBaseUrl}/cbc/liveTest`, {   // UIMD 백엔드 xml 테스트 코드 : http://192.168.0.131:3002/api/cbc/liveTest
    params: {
      baseUrl: 'http://emr012.cmcnu.or.kr/cmcnu/.live',
      submit_id: 'TRLII00124',
      business_id: 'li',
      instcd: '012', // 병원 코드
    },
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(async function (resultCbc) {
    // 결과 처리 코드
    const xml = resultCbc.data.trim(); // 불필요한 공백 제거
    const cbcJson = JSON.parse(xml2json(xml, {compact: true}));
    const cbcWorkList = cbcJson.root.spcworklist.worklist;
    const fiveDiffWorkList = ['LHR10501', 'LHR10502', 'LHR10503', 'LHR10504', 'LHR10505', 'LHR10506'];

    // LHR100는 WBC를 뜻함 -> 평화이즈 데이터를 WBC로 변경하는 과정
    const wbcDiffCountItem = cbcWorkList.filter(function (item: any) {
      return item.testcd._cdata === 'LHR100'
    })
    wbcInfoAfter.forEach(function (wbcItem: any) {
      wbcItem.testcd = ''
      // testcd 없음 필드 자체에 추가 하는 로직
      codeList.forEach(function (code) {
        if (String(wbcItem.id) === String(code.id)) {
          wbcItem.testcd = code.cd
        }
      })
    })
    // five diff push
    let wbcTemp: any = [];
    wbcInfoAfter.forEach(function (wbcItem: any) {
      fiveDiffWorkList.forEach(function (fiveDiffItem) {
        if (wbcItem.testcd === fiveDiffItem) {
          wbcTemp.push({
            testcd: wbcItem.testcd,
            percent: wbcItem.percent,
            name: wbcItem.name,
          })
        } else {
          if ((Number(wbcItem.count) > 0) && wbcItem.testcd !== '') {
            wbcTemp.push({
              testcd: wbcItem.testcd,
              percent: wbcItem.percent,
              name: wbcItem.name,
            })
          }
        }
      })
    })

    // 중복제거
    const uniqueItems = new Set(wbcTemp.map((item: any) => item.testcd));
    wbcTemp = Array.from(uniqueItems).map(testcd => wbcTemp.find((item: any) => item.testcd === testcd));

    const totalPercentRounded = wbcTemp
        .filter((item: any) => item.name !== "Neutrophil")
        .map((item: any) => Math.round(parseFloat(item.percent)))
        .reduce((sum: any, percent: any) => sum + percent, 0);
    const updatedWbcTemp = wbcTemp.map((item: any) =>
        item.name === "Neutrophil"
            ? {...item, percent: 100 - totalPercentRounded}
            : {...item, percent: Math.round(parseFloat(item.percent))}
    );
    wbcTemp = updatedWbcTemp;

    // neutrophil-seg
    const nsPercentItem = wbcTemp.filter((item: any) => item.testcd === 'LHR10501');

    // ANC insert LHR10599=> ANC 계산
    if ((nsPercentItem.length > 0) && (wbcDiffCountItem.length > 0)) {
      const ancResult = ((Number(wbcDiffCountItem[0].inptrslt._cdata) * nsPercentItem[0].percent) / 100).toFixed(2);
      wbcTemp.push({
        testcd: 'LHR10599',
        percent: ancResult,
        name: 'ANC 계산'
      })
    }

    const localTime = moment().local();
    const updatedItem = {
      submitState: 'lisCbc',
      submitOfDate: localTime.format(),
      submitUserId: userModuleDataGet.value.userId,
    };
    lisBtnColor.value = true;
    const updatedRuningInfo = {...slideData.value, ...updatedItem};
    await gqlCBCUpdate(updatedRuningInfo);
    await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);

  }).catch(function (err) {
    console.error('error.config', err.config)
    showErrorAlert(err.message);
  });
}

const cmcSeoulLisAndCbcDataGet = () => {
  const codeList = CbcWbcTestCdList_0002;
  const {barcodeNo, wbcInfoAfter} = props.selectItems ?? {};
  let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
  // cbc 결과 조회
  axios.get(`${apiBaseUrl}/cbc/lisCbcMarys`, {
    params: {
      submit_id: 'TRLII00124',
      business_id: 'li',
      instcd: '012', // 병원 코드
      bcno: barcodeNo,
      baseUrl: 'http://emr012.cmcnu.or.kr/cmcnu/.live'
    },
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(async function (resultCbc) {
    // 결과 처리 코드
    const xml = resultCbc.data.data.trim(); // 불필요한 공백 제거
    const cbcJson = JSON.parse(xml2json(xml, {compact: true}));
    const cbcWorkList = cbcJson.root.spcworklist.worklist;
    const fiveDiffWorkList = ['LHR10501', 'LHR10502', 'LHR10503', 'LHR10504', 'LHR10505', 'LHR10506'];
    // LHR100는 WBC를 뜻함 -> 평화이즈 데이터를 WBC로 변경하는 과정
    const wbcDiffCountItem = cbcWorkList.filter(function (item: any) {
      return item.testcd._cdata === 'LHR100'
    })

    wbcInfoAfter.forEach(function (wbcItem: any) {
      wbcItem.testcd = ''
      // testcd 없음 필드 자체에 추가 하는 로직
      codeList.forEach(function (code) {
        if (String(wbcItem.id) === String(code.id)) {
          wbcItem.testcd = code.cd
        }
      })
    })

    // five diff push
    let wbcTemp: any = [];
    wbcInfoAfter.forEach(function (wbcItem: any) {
      fiveDiffWorkList.forEach(function (fiveDiffItem) {
        if (wbcItem.testcd === fiveDiffItem) {
          wbcTemp.push({
            testcd: wbcItem.testcd,
            percent: wbcItem.percent,
          })
        } else {
          if ((Number(wbcItem.count) > 0) && wbcItem.testcd !== '') {
            wbcTemp.push({
              testcd: wbcItem.testcd,
              percent: wbcItem.percent,
            })
          }
        }
      })
    })
    // 중복제거
    const uniqueItems = new Set(wbcTemp.map((item: any) => item.testcd));
    wbcTemp = Array.from(uniqueItems).map(testcd => wbcTemp.find((item: any) => item.testcd === testcd));
    // 뉴트로필 외 반올림 뉴트로필 100기준 정수로 재 계산
    const totalPercentRounded = wbcTemp
        .filter((item: any) => item.name !== "Neutrophil")
        .map((item: any) => Math.round(parseFloat(item.percent)))
        .reduce((sum: any, percent: any) => sum + percent, 0);
    const updatedWbcTemp = wbcTemp.map((item: any) =>
        item.name === "Neutrophil"
            ? {...item, percent: 100 - totalPercentRounded}
            : {...item, percent: Math.round(parseFloat(item.percent))}
    );
    wbcTemp = updatedWbcTemp;

    // neutrophil-seg ANC 계산을 위해서 전체 다 뉴트로필로 변경 전체 개수를 측정 하기 위해서
    const nsPercentItem = wbcTemp.filter((item: any) => item.testcd === 'LHR10501');

    // ANC insert LHR10599=> ANC 계산
    if ((nsPercentItem.length > 0) && (wbcDiffCountItem.length > 0)) {
      const ancResult = ((Number(wbcDiffCountItem[0].inptrslt._cdata) * nsPercentItem[0].percent) / 100).toFixed(2);
      wbcTemp.push({
        testcd: 'LHR10599',
        percent: ancResult,
        name: 'ANC 계산'
      })
    }
    const filePath = `D:\\UIMD_Data\\UI_Log\\CBCLookUP\\${barcodeNo}.txt`;
    const paramsLisCopyLogData = {
      filePath,
      data: {
        cbcJson,
        cbcWorkList
      },
    };
    await createCbcFile(paramsLisCopyLogData);
    // 유저 체크
    checkUserAuth(userModuleDataGet.value.employeeNo).then(function (isUserAuth) {
      if (isUserAuth === 'succ') {
        const params = {
          empNo: userModuleDataGet.value.employeeNo,
          barcodeNo: barcodeNo,
          wbcInfo: wbcTemp
        }
        const now = new Date();
        const year = `${now.getFullYear()}`;
        let month = `${now.getMonth() + 1}`;
        if (month.length === 1) {
          month = `0${month}`;
        }
        let day = `${now.getDate()}`;
        if (day.length === 1) {
          day = `0${day}`;
        }

        const separator1 = String.fromCharCode(23); // '\u0017'
        const separator2 = String.fromCharCode(23, 23); // '\u0017\u0017'
        const terminator = String.fromCharCode(3); // '\u0003'
        const paramsResult = params.wbcInfo
            .filter((wbcItem: any) => wbcItem.testcd !== null && wbcItem.testcd !== '')
            .map((wbcItem: any) => `${wbcItem.testcd}${separator1}${wbcItem.percent}${separator2}${year}${month}${day}${terminator}`)
            .join('');

        // LIS 최종 업로드 Report
        const newparams = {
          submit_id: 'TXLII00101',
          business_id: BUSINESS_ID,
          ex_interface: `${params.empNo}|${INST_CD}`,
          instcd: INST_CD,
          userid: params.empNo,
          eqmtcd: EQMT_CD,
          bcno: params.barcodeNo,
          result: paramsResult,
          testcont: 'MANUAL DIFFERENTIAL COUNT RESULT',
          testcontcd: '01',
          execdeptcd: 'H1',
          baseUrl: 'http://emr012.cmcnu.or.kr/cmcnu/.live'
        }
        axios.get(`${apiBaseUrl}/cbc/lisCbcMarys`, {
          params: newparams,
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(async function (result) {
          const xml = result.data.data;
          const json = JSON.parse(xml2json(xml, {compact: true}));
          const resultFlag = json.root.ResultFlag.resultflag._text;
          const paramsDataCbcLisLog = {
            empNo: userModuleDataGet.value.employeeNo,
            barcodeNo,
            wbcTemp,
            frontendSendData: newparams,
            processSendData: paramsResult,
            uimdDefaultData: wbcInfoAfter,
            nsPercentItem,
            cbcJson,
            cbcWorkList,
          };
          const filePath = `D:\\UIMD_Data\\UI_Log\\LISFinalReport\\${barcodeNo}.txt`;
          const paramsLisCopyLogData = {
            filePath,
            data: {
              frontendData: paramsDataCbcLisLog,
              lisLastReportVal: result,
            },
          };
          await createCbcFile(paramsLisCopyLogData);
          if (resultFlag === 'Y') {
            const localTime = moment().local();
            // lisCbc 등록 후 list 테이블에서 로우 색상 변경 코드
            const updatedItem = {
              submitState: 'lisCbc',
              submitOfDate: localTime.format(),
              submitUserId: userModuleDataGet.value.userId,
            };
            lisBtnColor.value = true;
            const updatedRuningInfo = {...slideData.value, ...updatedItem};
            await gqlCBCUpdate(updatedRuningInfo);
            await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);

          } else {
            const index = json.root.ResultFlag.error2._text.indexOf('!');  // '!'의 위치를 찾음
            const result = index !== -1 ? json.root.ResultFlag.error2._text.substring(0, index + 1) : json.root.ResultFlag.error2._text;
            const errText = json.root.ResultFlag.error2._text === '1' ? 'LIS 전송이 실패 했습니다.' : result;
            showErrorAlert(errText);
          }
        }).catch(function (err) {
          showErrorAlert(err.message);
        })
      } else {
        showErrorAlert(MESSAGES.IDS_ERROR_PLEASE_CONFIRM_YOUR_USER_ID);
      }
    })
  }).catch(function (err) {
    console.error('error.config', err.config)
    showErrorAlert(err.message);
  });
}

const lisLastStep = () => {
  otherDataSend();
}

const godaeAnamDataSendLoad = () => {
  const goDaeData = goDae();
  lisFileUrlCreate(goDaeData);
}

const gilDataSendLoad = async () => {
  const url = lisFilePathSetArr.value;
  const fileCreateRes = await createDirectory(`path=${url}`);

  if (fileCreateRes) {
    const data = {
      sendingApp: 'PBIA',
      sendingFacility: 'PBIA',
      receivingApp: 'LIS',
      receivingFacility: 'LIS',
      dateTime: getDateTimeStr(),
      security: '',
      messageType: ['ADT', 'R02'],
      messageControlId: props.selectItems?.barcodeNo,
      processingId: 'P',
      hl7VersionId: '2.5',
      selectedItem: { /* selectedItem 데이터 */},
      wbcInfo: incheonGilPercentChange(props.selectItems?.wbcInfoAfter, props.selectItems?.wbcInfo.totalCount),
      result: lisCodeWbcArrApp.value,
    };
    const res = await readNoFlagHl7Message(data);
    if (res) {
      if (!lisFilePathSetArr.value.includes("http")) { // file
        const data = {
          filepath: `${lisFilePathSetArr.value}\\${props.selectItems.barcodeNo}.hl7`,
          msg: res,
        }
        try {
          await createH17(data);
          toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
          showToast(MESSAGES.IDS_MSG_SUCCESS);
          const localTime = moment().local();
          const updatedItem = {
            submitState: 'lisCbc',
            submitOfDate: localTime.format(),
            submitUserId: userModuleDataGet.value.userId,
          };
          lisBtnColor.value = true;

          const updatedRuningInfo = {...slideData.value, ...updatedItem};
          await gqlCBCUpdate(updatedRuningInfo);
          await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
          emits('uploadLisChangeSlide', HOSPITAL_SITE_CD_BY_NAME['인천길병원']);

        } catch (error: any) {
          showErrorAlert(error.response.data.message);
        }
      } else { // url
        await sendLisMessage(res);
      }
    }
  }
}

const inhaDataSendLoad = async () => {
  await inhaCbc(cbcFilePathSetArr.value, props.selectItems, cbcCodeList.value, 'lisUpload');
  const {
    errMessage,
    lisBtnColor: lisBtnColorVal
  } = await inhaDataSend(props.selectItems?.wbcInfoAfter, props.selectItems?.rbcInfoAfter, props.selectItems?.barcodeNo, lisFilePathSetArr.value, inhaTestCode.value, lisCodeWbcArrApp.value, lisCodeRbcArrApp.value, props.selectItems, userModuleDataGet.value.id)
  if (errMessage !== '') {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    showToast(errMessage);
  }
  lisBtnColor.value = lisBtnColorVal || false;
}

const otherDataSend = async () => {
  const url = lisFilePathSetArr.value;
  const fileCreateRes = await createDirectory(`path=${url}`);

  if (fileCreateRes) {
    const data = {
      sendingApp: 'PBIA',
      sendingFacility: 'PBIA',
      receivingApp: 'LIS',
      receivingFacility: 'LIS',
      dateTime: getDateTimeStr(),
      security: '',
      messageType: ['ADT', 'R02'],
      messageControlId: props.selectItems?.barcodeNo,
      processingId: 'P',
      hl7VersionId: '2.5',
      selectedItem: { /* selectedItem 데이터 */},
      wbcInfo: props.selectItems?.wbcInfoAfter,
      result: lisCodeWbcArrApp.value,
    };
    const res = await readH7Message(data);
    if (res) {
      if (!lisFilePathSetArr.value.includes("http")) { // file
        const data = {
          filepath: `${lisFilePathSetArr.value}\\${props.selectItems.barcodeNo}.hl7`,
          msg: res,
        }
        try {
          await createH17(data);
          toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
          showToast(MESSAGES.IDS_MSG_SUCCESS);
        } catch (error: any) {
          showErrorAlert(error.response.data.message);
        }
      } else { // url
        await sendLisMessage(res);
      }
    }
  }
}


const goDae = (): string => {
  let data = `H|\\^&||||||||||P||${props.selectItems?.barcodeNo}\n`;
  let seq = 0;
  let kumcMergePercent = 0;
  let kumcBandPercent = 0;
  // 누적 백분율 계산
  props.selectItems?.wbcInfoAfter.forEach((wbcItem: any) => {
    if (['02', '03', '04', '10'].includes(wbcItem.id)) {
      kumcMergePercent += Number(wbcItem.percent);
    }
    if (wbcItem.id === '72') {
      kumcBandPercent = Number(wbcItem.percent);
    }
  });

  // 백분율 조정
  if (kumcMergePercent > 0 && kumcBandPercent < 6) {
    const updateItem = (id: string, newPercent: string) => {
      const item = props.selectItems?.wbcInfoAfter.find((item: any) => item.id === id);
      if (item) {
        item.percent = newPercent;
      }
    };

    updateItem('71', (Number(props.selectItems?.wbcInfoAfter.find((item: any) => item.id === '71')?.percent) + kumcBandPercent).toString());
    updateItem('72', '0');
  }

  // 데이터 생성
  const appendData = (lisCode: any, wbcItem: any) => {
    if (lisCode.LIS_CD !== '') {
      if (['01', '71', '05', '07', '08', '09'].includes(wbcItem.id) || Number(wbcItem.percent) > 0) {
        data += `R|${++seq}|^^^^${lisCode.LIS_CD}|${wbcItem.count}|||||||^${userModuleDataGet.value.name}\n`;
        data += `R|${++seq}|^^^^${lisCode.LIS_CD}%|${wbcItem.percent}|%||||||^${userModuleDataGet.value.name}\n`;
      }
    }
  };

  lisCodeWbcArr.value.forEach((lisCode: any) => {
    props.selectItems?.wbcInfoAfter.forEach((wbcItem: any) => {
      if (lisCode.IA_CD === wbcItem.id) {
        appendData(lisCode, wbcItem);
      }
    });
  });

  return data += 'L|1|N';
};


const lisFileUrlCreate = async (data: any) => {
  // 파일 경로와 파라미터 설정
  const filePath = `D:\\UIMD_Data\\UI_Log\\LIS_IA\\${props.selectItems?.barcodeNo}.txt`;
  const parmsLisCopy = {filePath, data};

  // CBC 파일 생성
  await createCbcFile(parmsLisCopy);

  // URL이 아닌 경우, 로컬 파일 작업 수행
  if (!lisFilePathSetArr.value.includes("http")) {
    const url = lisFilePathSetArr.value;

    const fileCreateRes = await createDirectory(`path=${url}`);
    if (fileCreateRes) {
      const fileParams = {
        path: url,
        filename: `${props.selectItems?.barcodeNo}.lst2msg`,
        content: data,
      };

      // 파일 생성
      const fileRes = await createFile(fileParams);
      if (fileRes) {
        // 실행 정보 업데이트
        const localTime = moment().local();
        const updatedItem = {
          submitState: 'lisCbc',
          submitOfDate: localTime.format(),
          submitUserId: userModuleDataGet.value.userId,
        };
        const updatedRuningInfo = {...slideData.value, ...updatedItem};
        await gqlCBCUpdate(updatedRuningInfo);
        await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
        toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
        showToast(MESSAGES.IDS_MSG_SUCCESS);

        // 알림이 없을 경우 다음 페이지로 이동
        if (!showAlert.value) {
          emits('nextPage');
        }
      } else {
        // 파일 생성 오류 시 알림 표시
        showErrorAlert('lisCbc file err');
      }
    }
  } else {
    // URL로 설정된 경우 메시지 전송
    await sendLisMessage(data);
  }
};

const sendLisMessage = async (data: any) => {
  const body = {
    barcodeNo: props.selectItems?.barcodeNo,
    userId: userModuleDataGet.value.name,
    deviceBarcode: deviceSerialNm.value,
    resultMsg: data,
    baseUrl: lisFilePathSetArr.value,
  };
  try {
    let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
    const result = await axios.post(`${apiBaseUrl}/cbc/executePostCurl`, body);
    if (result.data.errorCode === 'E000') {
      toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
      showToast(MESSAGES.IDS_MSG_SUCCESS);

    } else {
      showErrorAlert(result.data.errorMessage);
    }
  } catch (err: any) {
    showErrorAlert(err.message);
  }
};


const checkUserAuth = async (empNo: any) => {
  return new Promise((succ, fail) => {
    if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['서울성모병원']) {
      let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
      axios.get(`${apiBaseUrl}/cbc/lisCbcMarys`, {
        params: {
          submit_id: 'TRLII00104',
          business_id: 'li',
          instcd: '012', // 병원 코드
          userid: empNo,
          baseUrl: 'http://emr012.cmcnu.or.kr/cmcnu/.live'
        },
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(function (result) {
        const xml = result.data.data;
        const json = JSON.parse(xml2json(xml, {compact: true}));
        const userNm = json.root.getUsernm.usernm._text;
        if (userNm === null || userNm === '') {
          succ('fail')
        } else {
          succ('succ')
        }

      }).catch(function (err) {
        console.error('checkUserAuth :' + err.message)
        fail(new Error(err.message))
      })

    }
  })
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
  await gqlCBCUpdate(updatedRuningInfo);
  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
  selectItems.value.submitState = 'Submit';
  emits('submitStateChanged', 'Submit');
}


const memoChange = async () => {
  const enterAppliedWbcMemo = wbcMemo.value.replaceAll('\r\n', '<br>');
  const updatedItem = {
    wbcMemo: enterAppliedWbcMemo
  }
  const updatedRuningInfo = {...slideData.value, ...updatedItem};
  const res = await gqlMemoMenuUpdate(updatedRuningInfo);
  if (res && res?.data?.updateRunningInfoGQL[0].length !== 0) {
    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    showToast('Success');
    wbcMemo.value = updatedRuningInfo.wbcMemo;
  }
  memoModal.value = false;
}

const memoOpen = () => {
  memoModal.value = !memoModal.value;
}

const memoCancel = () => {
  memoModal.value = false;
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
  const filteredItems: any = slideData.value;
  // await store.dispatch('commonModule/setCommonInfo', {selectedSampleId: String(filteredItems?.id)});
  selectItems.value = filteredItems;
  const customClassItems = selectItems.value.wbcInfoAfter.filter((item: any) => 90 <= Number(item.id) && Number(item.id) <= 95);
  selectItems.value.wbcInfoAfter = newItem;

  const availableCustomClassArr = customClassArr.value.filter((item: any) => item.abbreviation !== '' && item.fullNm !== '')
  let wbcBeforeInfo = removeDuplicatesById(selectItems.value.wbcInfo.wbcInfo[0] || [])
  let wbcAfterInfo = removeDuplicatesById(selectItems.value?.wbcInfoAfter || filteredItems.wbcInfo.wbcInfo[0] || []);

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
    wbcInfoAfterVal.value = incheonGilPercentChange(wbcInfoAfterVal.value, props.selectItems?.wbcInfo.totalCount);
    wbcInfoBeforeVal.value = incheonGilPercentChange(wbcInfoBeforeVal.value, props.selectItems?.wbcInfo.totalCount);
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

  // if (props.selectItems?.submitState === "" || !props.selectItems?.submitState) {
  //   const result: any = await detailRunningApi(String(props.selectItems?.id));
  //   const updatedItem = {
  //     submitState: '`checkFirst`',
  //   };
  //
  //   const updatedRuningInfo = {...result.data, ...updatedItem}
  //   await resRunningItem(updatedRuningInfo, true);
  // }
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

    const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
    if (!targetArray.includes(item.title)) {
      const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1); // 소수점 0인경우 정수 표현
      item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
    }
  }
}

const shouldRenderCategory = (title: string) => {
  // 제외할 클래스들 정의
  const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
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
      const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
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
      wbcInfoAfterVal.value = incheonGilPercentChange(wbcInfoAfterVal.value, props.selectItems?.wbcInfo.totalCount);
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
  const res: any = await detailRunningApi(String(selectedSampleId.value));
  if (res) {
    res.data.wbcInfoAfter = clonedWbcInfo;
  }

  await putOrderClassApi(sortArr);

  //updateRunningApi 호출
  await updateRunningApiPost(clonedWbcInfo, [res.data]);

  emits('classOrderChanged')
  await store.dispatch('commonModule/setCommonInfo', {classInfoSort: []});
}

async function updateRunningApiPost(wbcInfo: any, originalDb: any) {
  // 러닝 인포 디비에 다시 재저장
  try {
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const response: any = await updateRunningApi({
      userId: Number(userId.value),
      runingInfoDtoItems: originalDb,
      dayQuery: dayQuery
    })
    if (response) {
      //
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
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
  barCodeImageShowError.value = true;
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

const toastPosition = (siteCd: string) => {
  if (siteCd === '0019') return 'center';
  return 'top';
}

</script>