<template>
  <div class="detailHeader-container">
    <ul class="detailHeader-info-container">
      <li
          class="pos-relative"
          @mouseover="tooltipVisibleFunc('analysisType', true)"
          @mouseout="tooltipVisibleFunc('analysisType', false)"
      >
        <span>{{ testType }}</span>
        <Tooltip :isVisible="tooltipVisible.analysisType" className="mb08" message='Analysis Type'/>
      </li>
      <li v-if="barcodeNo" class="flex-align-center gap8">
        <p
            class="pos-relative"
            @mouseover="tooltipVisibleFunc('barcodeNo', true)"
            @mouseout="tooltipVisibleFunc('barcodeNo', false)"
        >
          <span>{{ barcodeNo }}</span>
          <Tooltip :isVisible="tooltipVisible.barcodeNo" className="mb08" message='Barcode ID'/>
        </p>
        <!--        <Button-->
        <!--            @mouseover="tooltipVisibleFunc('barcodeCopy', true)"-->
        <!--            @mouseout="tooltipVisibleFunc('barcodeCopy', false)"-->
        <!--            size="sm"-->
        <!--        >-->
        <!--          <font-awesome-icon @click="barcodeCopy" :icon="['fas', 'copy']" class="hoverSizeAction" />-->
        <!--          <Tooltip :isVisible="tooltipVisible.barcodeCopy" className="mb08" message='Copy Barcode ID' />-->
        <!--        </Button>-->
        <p
            class="pos-relative cursorPointer"
            @mouseover="tooltipVisibleFunc('barcodeCopy', true)"
            @mouseout="tooltipVisibleFunc('barcodeCopy', false)"
        >
          <font-awesome-icon @click="barcodeCopy" :icon="['fas', 'copy']" class="hoverSizeAction"/>
          <Tooltip :isVisible="tooltipVisible.barcodeCopy" className="mb08" message='Copy Barcode ID'/>
        </p>
        <p
            class="pos-relative cursorPointer"
            @mouseover="tooltipVisibleFunc('barcodeEdit', true)"
            @mouseout="tooltipVisibleFunc('barcodeEdit', false)"
        >
          <font-awesome-icon class="detailHeader-barcodeEdit-font" v-if="isGilHospital()" @click="handleModal"
                             :icon="['fas', 'pen-to-square']"/>
          <Tooltip :isVisible="tooltipVisible.barcodeEdit" className="mb08" message='Edit Barcode ID'/>
        </p>
      </li>
      <li
          class="pos-relative"
          v-if="analyzedDttm"
          @mouseover="tooltipVisibleFunc('analyzedDttm', true)"
          @mouseout="tooltipVisibleFunc('analyzedDttm', false)"
      >
        <span>{{ getDateTimeYYYYMMDDHHmmss(analyzedDttm) }}</span>
        <Tooltip :isVisible="tooltipVisible.analyzedDttm" className="mb08" message='Analyzed Date'/>
      </li>
      <li
          class="pos-relative"
          v-if="cbcPatientNo"
          @mouseover="tooltipVisibleFunc('patientNo', true)"
          @mouseout="tooltipVisibleFunc('patientNo', false)"
      >
        <span>{{ cbcPatientNo }}</span>
        <Tooltip :isVisible="tooltipVisible.patientNo" className="mb08" message='Patient ID'/>
      </li>
      <template v-if="cbcPatientName || patientName">
        <li
            class="pos-relative"
            v-if="cbcPatientName"
            @mouseover="tooltipVisibleFunc('patientName', true)"
            @mouseout="tooltipVisibleFunc('patientName', false)"
        >
          {{ cbcPatientName }}
          <Tooltip :isVisible="tooltipVisible.patientName" className="mb08" message='Patient Name'/>
        </li>
        <li
            class="pos-relative"
            v-else-if="patientName"
            @mouseover="tooltipVisibleFunc('patientName', true)"
            @mouseout="tooltipVisibleFunc('patientName', false)"
        >
          {{ patientName }}
          <Tooltip :isVisible="tooltipVisible.patientName" className="mb08" message='Patient Name'/>
        </li>
      </template>
      <li
          class="pos-relative"
          v-if="cbcSex"
          @mouseover="tooltipVisibleFunc('sex', true)"
          @mouseout="tooltipVisibleFunc('sex', false)"
      >
        <span>{{ cbcSex }}</span>
        <Tooltip :isVisible="tooltipVisible.sex" className="mb08" type="" message='Sex'/>
      </li>
      <li
          class="pos-relative"
          v-if="cbcAge"
          @mouseover="tooltipVisibleFunc('age', true)"
          @mouseout="tooltipVisibleFunc('age', false)"
      >
        <span>{{ cbcAge }}</span>
        <Tooltip :isVisible="tooltipVisible.age" className="mb08" type="" message='Age'/>
      </li>
      <li
          class="pos-relative"
          v-if="hospitalName"
          @mouseover="tooltipVisibleFunc('hospitalName', true)"
          @mouseout="tooltipVisibleFunc('hospitalName', false)"
      >
        <span>{{ hospitalName }}</span>
        <Tooltip :isVisible="tooltipVisible.hospitalName" className="mb08" message='Hospital name'/>
      </li>
    </ul>

    <div class="detailHeader-tool-container">
      <h1 class="mr12 fs10">Tool bar</h1>
      <div class="detailHeader-tool-wrapper">
        <Button
            class="memoBoxRef pos-relative"
            @mouseover="tooltipVisibleFunc('memo', true)"
            @mouseout="tooltipVisibleFunc('memo', false)"
            size="sm"
            @click="memoOpen"
            :isActive="isMemoModalOpen"
            :icon="['fas', 'comment-dots']"
            :className="hasMemo() && 'blueText'"
        >
          Memo
          <Tooltip :isVisible="tooltipVisible.memo" className="mb08" position="top" type=""
                   :message="MSG.TOOLTIP.MEMO"/>
        </Button>
        <div v-if="isMemoModalOpen" class="memoModal shadowBox memoBoxRef">
          <div class="memoModal-header">
            <h1 class="fs12">Memo</h1>
            <font-awesome-icon @click="memoCancel" class="memoModal-cancel-btn" :icon="['fas', 'xmark']"/>
          </div>
          <div class="memoModal-main">
            <div class="memoModal-wrapper">
              <h2 class="memoModal-title">WBC</h2>
              <textarea v-model="memo.wbc"></textarea>
            </div>
            <div class="memoModal-wrapper">
              <h2 class="memoModal-title">RBC</h2>
              <textarea v-model="memo.rbc"></textarea>
            </div>
          </div>
          <div class="memoModal-btn-wrapper">
            <Button @click="memoChange" :icon="['fas', 'floppy-disk']" size="sm">
              Save
            </Button>
          </div>
        </div>

        <Button
            @mouseover="tooltipVisibleFunc('confirm', true)"
            @mouseout="tooltipVisibleFunc('confirm', false)"
            size="sm"
            @click="commitConfirmed"
            :icon="['fas', 'square-check']"
            :className="{'blueText': slideData?.submitState === 'Submit',}"
        >
          Confirm
          <Tooltip :isVisible="tooltipVisible.confirm" className="mb08" position="top" type=""
                   :message="MSG.TOOLTIP.CONFIRM"/>
        </Button>
        <Button
            v-if="!crcConnect && showLISUploadButton"
            size="sm"
            @click="lisModalOpen"
            :class="{'blueText': slideData?.submitState.includes('lis') || lisBtnColor,}"
            @mouseover="tooltipVisibleFunc('lisUpload', true)"
            @mouseout="tooltipVisibleFunc('lisUpload', false)"
            :icon="['fas', 'upload']"
        >
          LIS Upload
          <Tooltip :isVisible="tooltipVisible.lisUpload" className="mb08" position="top" type=""
                   :message="MSG.TOOLTIP.LIS_UPLOAD"/>
        </Button>
      </div>
    </div>
  </div>

  <Modal v-if="isModalOpen" @update:closeLayer="closeLayer" width="400">
    <!-- 헤더 슬롯에 들어갈 내용 -->
    <template #header>
      <h2>Edit Barcode ID</h2>
    </template>

    <!-- 컨텐츠 슬롯에 들어갈 내용 -->
    <template #content>
      <div>
        <ul class="editOrder">
          <li class="flex-column mr12">
            <label for="barcode">BARCODE ID</label>
            <input
                id="barcode"
                type="text"
                v-model="editingBarcodeNo"
                @keydown.enter="handleEditBarcodeNo"
                placeholder="BARCODE ID"
                ref="barcodeInput"
            />
          </li>
        </ul>
      </div>
      <div class="modalBottom">
        <button class="alertButton" @click="handleEditBarcodeNo">Save</button>
      </div>
    </template>
  </Modal>

  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />

  <ToastNotification
      v-if="toast.message"
      :message="toast.message"
      :messageType="toast.type"
      :duration="1500"
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
import {defineProps, watch, defineEmits, ref, computed, onBeforeMount, nextTick, onMounted, onUnmounted} from 'vue';
import {getDateTimeStr, getDateTimeYYYYMMDDHHmmss} from "@/common/lib/utils/dateUtils";
import {useStore} from "vuex";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import Modal from "@/components/commonUi/modal.vue";
import {
  barcodeNoUpdateMutation, cbcUpdateMutation,
  gqlGenericUpdate,
  memoUpdateMutation
} from "@/gql/mutation/slideData";
import {MESSAGES, MSG, MSG_GENERAL, TOAST} from "@/common/defines/constants/constantMessageText";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {DetailHeaderType} from "@/common/type/tooltipType";
import Alert from "@/components/commonUi/Alert.vue";
import Button from "@/components/commonUi/Button.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import moment from "moment/moment";
import {useRouter} from "vue-router";
import {
  getCbcCodeList,
  getCbcPathData,
  getLisPathData,
  getLisWbcRbcData,
  inhaCbc,
  inhaDataSend
} from "@/common/helpers/lisCbc/inhaCbcLis";
import {BUSINESS_ID, CbcWbcTestCdList_0002, EQMT_CD, INST_CD} from "@/common/defines/constants/lis";
import axios from "axios";
import {xml2json} from "xml-js";
import {createCbcFile, createDirectory, createFile} from "@/common/api/service/fileSys/fileSysApi";
import {incheonGilPercentChange} from "@/common/helpers/common/classPercent";
import {createH17, readH7Message, readNoFlagHl7Message} from "@/common/api/service/fileReader/fileReaderApi";
import {crcOptionGet} from "@/common/api/service/setting/settingApi";

const props = defineProps(['testType', 'barcodeNo', 'cbcPatientNo', 'patientName', 'hospitalName', 'cbcPatientName', 'cbcSex', 'cbcAge', 'analyzedDttm', 'checkedAllClass']);
const emits = defineEmits();
const router = useRouter();
const store = useStore();
const slideData = computed(() => store.state.slideDataModule);
const siteCd = computed(() => store.state.commonModule.siteCd);
const userModuleDataGet = computed(() => store.state.userModule);
const showLISUploadAfterCheckingAll = computed(() => store.state.commonModule.showLISUploadAfterCheckingAll);
const projectBm = ref(false);
const tooltipVisible = ref<DetailHeaderType>({
  analysisType: false,
  barcodeNo: false,
  barcodeEdit: false,
  analyzedDttm: false,
  patientNo: false,
  patientName: false,
  sex: false,
  age: false,
  hospitalName: false,
  barcodeCopy: false,
  memo: false,
  confirm: false,
  lisUpload: false,
})
const isModalOpen = ref(false);
const barcodeInput = ref(null);
const editingBarcodeNo = ref('');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const toast = ref({
  message: '',
  type: MESSAGES.TOAST_MSG_SUCCESS,
})
const isMemoModalOpen = ref(false);
const memo = ref({
  wbc: '',
  rbc: '',
})
const showConfirm = ref(false);
const confirmMessage = ref('');
const confirmType = ref('');
const okMessageType = ref('');
const showLISUploadButton = ref(true);
const isHotKeyPressed = ref(false);
const lisHotKey = ref('');
const lisFilePathSetArr = ref<any>([]);
const crcConnect = ref(false);
const lisCodeWbcArrApp = ref<any>([]);
const lisCodeRbcArrApp = ref<any>([]);
const cbcFilePathSetArr = ref('');
const cbcCodeList = ref<any>([]);
const lisBtnColor = ref(false);
const restrictedRoutes = ['/report', '/databaseRbc', '/databasePlt', '/databaseWhole'];
const deviceSerialNm = computed(() => store.state.commonModule.deviceSerialNm);

onBeforeMount(async () => {
  projectBm.value = window.PROJECT_TYPE === 'bm';

  if (!projectBm.value) {
    const crcOptionApi = await crcOptionGet();
    if (crcOptionApi.data.length !== 0) {
      crcConnect.value = crcOptionApi.data[0].crcConnect;
    }
  }
})

onMounted(async () => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  memo.value.wbc = slideData.value?.wbcMemo;
  memo.value.rbc = slideData.value?.rbcMemo;

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

  setShowLISButton();
  await mountedMethod();
})

onUnmounted(async () => {
  document.addEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
})

watch(() => props.checkedAllClass, () => {
  showLISUploadButton.value = true;
})

watch(() => slideData.value, (newSlideData) => {
  setShowLISButton();
  memo.value.wbc = newSlideData?.wbcMemo;
  memo.value.rbc = newSlideData?.rbcMemo;
  if (!newSlideData.cbcPatientNm || newSlideData.cbcPatientNm === '' || newSlideData.cbcPatientNm !== newSlideData.patientNm) {
    emits('updateSlideDataByCBCData', newSlideData);
  }
}, {deep: true});

const tooltipVisibleFunc = (type: keyof DetailHeaderType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}


const handleModal = async () => {
  isModalOpen.value = true;
  editingBarcodeNo.value = props.barcodeNo;
  await nextTick();
  if (barcodeInput.value) {
    barcodeInput.value.focus();
  }

}

const closeLayer = (val: boolean) => {
  if (!val) {
    editingBarcodeNo.value = props.barcodeNo;
  }
  isModalOpen.value = val;
};

const handleEditBarcodeNo = async () => {
  await nextTick();
  try {
    const updatedRuningInfo = {...slideData.value, barcodeNo: editingBarcodeNo.value};
    const res = await gqlGenericUpdate(barcodeNoUpdateMutation, {
      id: slideData.value.id,
      barcodeNo: editingBarcodeNo.value,
    });

    if (res && res?.data?.updateRunningInfoGQL[0].length !== 0) {
      toast.value.type = MESSAGES.TOAST_MSG_SUCCESS;
      showToast(MSG_GENERAL.SUCCESS);
    }
    await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
  } catch (error) {
    toast.value.type = MESSAGES.TOAST_MSG_ERROR;
    showToast(TOAST.ERROR_BARCODE_UPDATE);
    console.error(error);
  }
  isModalOpen.value = false;
}

const showToast = (message: string) => {
  toast.value.message = message;
  setTimeout(() => {
    toast.value.message = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};

const isGilHospital = () => {
  return siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인천길병원']
}

const barcodeCopy = async () => {
  const textarea = document.createElement('textarea');
  textarea.value = props.barcodeNo;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  toast.value.type = MESSAGES.TOAST_MSG_SUCCESS;
  showToast(MESSAGES.TOAST_MSG_BAR_CODE_SUCCESS);
}

const memoChange = async () => {
  const enterAppliedWbcMemo = memo.value.wbc.replaceAll('\r\n', '<br>');
  const enterAppliedRbcMemo = memo.value.rbc.replaceAll('\r\n', '<br>');
  const updatedItem = {
    wbcMemo: enterAppliedWbcMemo,
    rbcMemo: enterAppliedRbcMemo,
  }
  const updatedRuningInfo = {...slideData.value, ...updatedItem};
  const res = await gqlGenericUpdate(memoUpdateMutation, {
    id: updatedRuningInfo.id,
    wbcMemo: updatedRuningInfo.wbcMemo,
    rbcMemo: updatedRuningInfo.rbcMemo,
  });

  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);


  if (res && res?.data?.updateRunningInfoGQL[0].length !== 0) {
    toast.value.type = MESSAGES.TOAST_MSG_SUCCESS;
    showToast('Success');
    memo.value.wbc = updatedRuningInfo.wbcMemo;
    memo.value.rbc = updatedRuningInfo.rbcMemo;
  }
  isMemoModalOpen.value = false;
}

const memoOpen = () => {
  isMemoModalOpen.value = !isMemoModalOpen.value;
}

const memoCancel = () => {
  isMemoModalOpen.value = false;
}

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

const hasMemo = () => {
  return slideData.value?.wbcMemo || slideData.value?.rbcMemo;
}

const mountedMethod = async () => {
  if (!slideData.value) {
    return;
  }

  if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['인하대병원']) {
    const {inhaTestCode} = await inhaCbc(cbcFilePathSetArr.value, slideData.value, cbcCodeList.value, 'lisUpload');
    await store.dispatch('commonModule/setCommonInfo', {inhaTestCode: inhaTestCode});
  }
  if (slideData.value?.submitState) {
    lisBtnColor.value = slideData.value?.submitState === 'lisCbc';
  }
}

const commitConfirmed = () => {
  if (slideData.value?.submitState === 'Submit') {
    return;
  }
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.IDS_MSG_CONFIRM_SLIDE;
  okMessageType.value = 'commit';
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const handleOkConfirm = () => {
  if (okMessageType.value === 'commit') {
    onCommit();
  } else {
    uploadLis();
  }
  showConfirm.value = false;
}

const lisModalOpen = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.IDS_MSG_UPLOAD_LIS;
  okMessageType.value = 'lisCbc';
}

const onCommit = async () => {
  const localTime = moment().local();
  const updatedItem = {
    submitState: 'Submit',
    submitOfDate: localTime.format(),
    submitUserId: userModuleDataGet.value.userId,
  };

  const updatedRuningInfo = {...slideData.value, ...updatedItem};
  await gqlGenericUpdate(cbcUpdateMutation, {
    id: updatedRuningInfo.id,
    submitState: updatedRuningInfo.submitState,
    submitOfDate: updatedRuningInfo.submitOfDate,
    submitUserId: updatedRuningInfo.submitUserId,
  });

  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
  slideData.value.submitState = 'Submit';
  toast.value.type = MESSAGES.TOAST_MSG_SUCCESS;
  showToast(MSG_GENERAL.SUCCESS);
}

const handleClickOutside = (event: any) => {
  if (!event.target.closest('.memoBoxRef')) {
    isMemoModalOpen.value = false;
  }
};

const setShowLISButton = () => {
  if (!showLISUploadAfterCheckingAll.value) {
    showLISUploadButton.value = true;
  } else {
    showLISUploadButton.value = slideData.value.submitState.includes('lis') || slideData.value.isAllClassesChecked;
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  const keyPressed = event.key.toUpperCase();
  const hotkey = lisHotKey.value.toUpperCase();
  if (keyPressed !== hotkey) {
    return;
  }

  if (restrictedRoutes.includes(router.currentRoute.value.path)) {
    toast.value.type = MESSAGES.TOAST_MSG_ERROR;
    showToast(MSG.TOAST.LIS_UPLOAD_ONLY_WBC);
    return;
  }

  if (!isHotKeyPressed.value) {
    event.preventDefault();
    isHotKeyPressed.value = true; // 한 번만 실행되도록 설정
    if (showLISUploadButton.value) {
      uploadLis();
    } else {
      toast.value.type = MESSAGES.TOAST_MSG_ERROR;
      showToast(MESSAGES.TOAST_MSG_LIS_UPLOAD_SCROLL);
    }
  }
};

const handleKeyUp = () => {
  if (restrictedRoutes.includes(router.currentRoute.value.path)) {
    return;
  }
  if (isHotKeyPressed.value) {
    isHotKeyPressed.value = false; // 키를 떼면 다시 실행 가능
  }
};

const uploadLis = async () => {
  console.log(siteCd.value)
  switch (siteCd.value) {
    case HOSPITAL_SITE_CD_BY_NAME['서울성모병원']:
      cmcSeoulLisAndCbcDataGet();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['인하대병원']:
      await inhaDataSendLoad();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['인천길병원']:
      await gilDataSendLoad();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['고대안암병원']:
      godaeAnamDataSendLoad();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['NONE']:
    case HOSPITAL_SITE_CD_BY_NAME['UIMD']:
    case HOSPITAL_SITE_CD_BY_NAME['TEST']:
      // await uimdTestCbcLisDataGet();
      await otherDataSend();
      break;
    default:
      await otherDataSend();
      break;
  }
}

const uimdTestCbcLisDataGet = async () => {
  // 서울 성모 테스트 코드
  const codeList = CbcWbcTestCdList_0002;
  const {wbcInfoAfter} = slideData.value ?? {};
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

    await updateSubmitState();
  }).catch(function (err) {
    console.error('error.config', err.config)
    showErrorAlert(err.message);
  });
}

const cmcSeoulLisAndCbcDataGet = () => {
  const codeList = CbcWbcTestCdList_0002;
  const {barcodeNo, wbcInfoAfter} = slideData.value ?? {};
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
            await updateSubmitState();

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
      messageControlId: slideData.value?.barcodeNo,
      processingId: 'P',
      hl7VersionId: '2.5',
      selectedItem: { /* selectedItem 데이터 */},
      wbcInfo: incheonGilPercentChange(slideData.value?.wbcInfoAfter, slideData.value?.wbcInfo.totalCount),
      result: lisCodeWbcArrApp.value,
    };
    const res = await readNoFlagHl7Message(data);
    if (res) {
      if (!lisFilePathSetArr.value.includes("http")) { // file
        const data = {
          filepath: `${lisFilePathSetArr.value}\\${slideData.value.barcodeNo}.hl7`,
          msg: res,
        }
        try {
          await createH17(data);
          toast.value.type = MESSAGES.TOAST_MSG_SUCCESS;
          showToast(MESSAGES.IDS_MSG_SUCCESS);
          await updateSubmitState();
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
  const {inhaTestCode: localInhaTestCode} = await inhaCbc(cbcFilePathSetArr.value, slideData.value, cbcCodeList.value, 'lisUpload');
  await store.dispatch('commonModule/setCommonInfo', {inhaTestCode: localInhaTestCode});
  const {
    errMessage,
    lisBtnColor: lisBtnColorVal
  } = await inhaDataSend(slideData.value?.wbcInfoAfter, slideData.value?.rbcInfoAfter, slideData.value?.barcodeNo, lisFilePathSetArr.value, localInhaTestCode, lisCodeWbcArrApp.value, lisCodeRbcArrApp.value, slideData.value, userModuleDataGet.value.id)
  if (errMessage !== '') {
    if (errMessage.toLowerCase() === 'success') {
      toast.value.type = MESSAGES.TOAST_MSG_SUCCESS;
    } else {
      toast.value.type = MESSAGES.TOAST_MSG_ERROR;
    }
    showToast(errMessage);
  }
  lisBtnColor.value = lisBtnColorVal || false;
}

const otherDataSend = async () => {
  const url = lisFilePathSetArr.value;
  const data = {
    sendingApp: 'PBIA',
    sendingFacility: 'PBIA',
    receivingApp: 'LIS',
    receivingFacility: 'LIS',
    dateTime: getDateTimeStr(),
    security: '',
    messageType: ['ADT', 'R02'],
    messageControlId: slideData.value?.barcodeNo,
    processingId: 'P',
    hl7VersionId: '2.5',
    selectedItem: { /* selectedItem 데이터 */},
    wbcInfo: slideData.value?.wbcInfoAfter,
    rbcInfo: slideData.value?.rbcInfoAfter,
    result: lisCodeWbcArrApp.value,
    rbcFfiltering: lisCodeRbcArrApp.value,
    pidData: {patientId: slideData.value?.barcodeNo, patientName: slideData.value.cbcPatientNm || 'No Name'},
  };

  const res = await readH7Message(data);
  if (url.includes("http")) { // HTTP 통신 시 사용
    await sendLisMessage(res);
  } else { // 공유 폴더 사용 시
    const data = {
      filepath: `${lisFilePathSetArr.value}\\${slideData.value.barcodeNo}.hl7`,
      msg: res,
    }
    try {
      await createH17(data);
      toast.value.type = MESSAGES.TOAST_MSG_SUCCESS;
      showToast(MESSAGES.IDS_MSG_SUCCESS);

      await updateSubmitState();
    } catch (error: any) {
      showErrorAlert(error.response.data.message);
    }

  }
}

const goDae = async (): Promise<string> => {
  let data = `H|\\^&||||||||||P||${slideData.value?.barcodeNo}\n`;
  let seq = 0;
  let kumcMergePercent = 0;
  let kumcBandPercent = 0;
  // 누적 백분율 계산
  slideData.value?.wbcInfoAfter.forEach((wbcItem: any) => {
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
      const item = slideData.value?.wbcInfoAfter.find((item: any) => item.id === id);
      if (item) {
        item.percent = newPercent;
      }
    };

    updateItem('71', (Number(slideData.value?.wbcInfoAfter.find((item: any) => item.id === '71')?.percent) + kumcBandPercent).toString());
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
  const {lisCodeWbcArr} = await getLisWbcRbcData();

  lisCodeWbcArr.value.forEach((lisCode: any) => {
    slideData.value?.wbcInfoAfter.forEach((wbcItem: any) => {
      if (lisCode.IA_CD === wbcItem.id) {
        appendData(lisCode, wbcItem);
      }
    });
  });

  return data += 'L|1|N';
};


const lisFileUrlCreate = async (data: any) => {
  const filePath = `D:\\UIMD_Data\\UI_Log\\LIS_IA\\${slideData.value?.barcodeNo}.txt`;
  const parmsLisCopy = {filePath, data: data};
  await createCbcFile(parmsLisCopy);

  // URL이 아닌 경우, 로컬 파일 작업 수행
  if (!lisFilePathSetArr.value.includes("http")) {
    const url = lisFilePathSetArr.value;

    const fileCreateRes = await createDirectory(`path=${url}`);
    if (fileCreateRes) {
      const fileParams = {
        path: url,
        filename: `${slideData.value?.barcodeNo}.lst2msg`,
        content: data,
      };

      // 파일 생성
      const fileRes = await createFile(fileParams);
      if (fileRes) {
        await updateSubmitState();
        toast.value.type = MESSAGES.TOAST_MSG_SUCCESS;
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
    barcodeNo: slideData.value?.barcodeNo,
    userId: userModuleDataGet.value.name,
    deviceBarcode: deviceSerialNm.value,
    resultMsg: data,
    baseUrl: lisFilePathSetArr.value,
  };
  try {
    let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
    const result = await axios.post(`${apiBaseUrl}/cbc/executePostCurl`, body);
    if (result.data.errorCode === 'E000') {
      toast.value.type = MESSAGES.TOAST_MSG_SUCCESS;
      showToast(MESSAGES.IDS_MSG_SUCCESS);
      await updateSubmitState();
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

const updateSubmitState = async () => {
  const localTime = moment().local();
  const updatedItem = {
    submitState: 'lisCbc',
    submitOfDate: localTime.format(),
    submitUserId: userModuleDataGet.value.userId,
  };
  lisBtnColor.value = true;

  const updatedRuningInfo = {...slideData.value, ...updatedItem};
  await gqlGenericUpdate(cbcUpdateMutation, {
    id: updatedRuningInfo.id,
    submitState: updatedRuningInfo.submitState,
    submitOfDate: updatedRuningInfo.submitOfDate,
    submitUserId: updatedRuningInfo.submitUserId,
  });
  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
}

</script>