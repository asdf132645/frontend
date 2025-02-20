<template>
  <div class="topClintInfo">
    <ul>
      <li
          class="pos-relative"
          @mouseover="tooltipVisibleFunc('analysisType', true)"
          @mouseout="tooltipVisibleFunc('analysisType', false)"
      >
        <span>{{ testType }}</span>
        <Tooltip :isVisible="tooltipVisible.analysisType" className="mb08" message='Analysis Type' />
      </li>
      <li v-if="barcodeNo" class="flex-align-center gap4">
        <p
            class="pos-relative"
            @mouseover="tooltipVisibleFunc('barcodeNo', true)"
            @mouseout="tooltipVisibleFunc('barcodeNo', false)"
        >
          <span>{{ barcodeNo }}</span>
          <Tooltip :isVisible="tooltipVisible.barcodeNo" className="mb08" message='Barcode ID' />
        </p>
        <p
            class="pos-relative cursorPointer"
            @mouseover="tooltipVisibleFunc('barcodeCopy', true)"
            @mouseout="tooltipVisibleFunc('barcodeCopy', false)"
        >
          <font-awesome-icon @click="barcodeCopy" :icon="['fas', 'copy']" class="hoverSizeAction" />
          <Tooltip :isVisible="tooltipVisible.barcodeCopy" className="mb08" message='Copy Barcode ID' />
        </p>
        <p
            class="pos-relative cursorPointer"
            @mouseover="tooltipVisibleFunc('barcodeEdit', true)"
            @mouseout="tooltipVisibleFunc('barcodeEdit', false)"
        >
          <font-awesome-icon class="detailHeader-barcodeEdit-font" v-if="isGilHospital()" @click="handleModal" :icon="['fas', 'pen-to-square']" />
          <Tooltip :isVisible="tooltipVisible.barcodeEdit" className="mb08" message='Edit Barcode ID' />
        </p>
      </li>
      <li
          class="pos-relative"
          v-if="analyzedDttm"
          @mouseover="tooltipVisibleFunc('analyzedDttm', true)"
          @mouseout="tooltipVisibleFunc('analyzedDttm', false)"
      >
        <span>{{ getDateTimeYYYYMMDDHHmmss(analyzedDttm) }}</span>
        <Tooltip :isVisible="tooltipVisible.analyzedDttm" className="mb08" message='Analyzed Date' />
      </li>
      <li
          class="pos-relative"
          v-if="cbcPatientNo"
          @mouseover="tooltipVisibleFunc('patientNo', true)"
          @mouseout="tooltipVisibleFunc('patientNo', false)"
      >
        <span>{{ cbcPatientNo }}</span>
        <Tooltip :isVisible="tooltipVisible.patientNo" className="mb08" message='Patient ID' />
      </li>
      <template v-if="cbcPatientName || patientName">
        <li
            class="pos-relative"
            v-if="cbcPatientName"
            @mouseover="tooltipVisibleFunc('patientName', true)"
            @mouseout="tooltipVisibleFunc('patientName', false)"
        >
          {{ cbcPatientName }}
          <Tooltip :isVisible="tooltipVisible.patientName" className="mb08" message='Patient Name' />
        </li>
        <li
            class="pos-relative"
            v-else-if="patientName"
            @mouseover="tooltipVisibleFunc('patientName', true)"
            @mouseout="tooltipVisibleFunc('patientName', false)"
        >
          {{ patientName }}
          <Tooltip :isVisible="tooltipVisible.patientName" className="mb08" message='Patient Name' />
        </li>
      </template>
      <li
          class="pos-relative"
          v-if="cbcSex"
          @mouseover="tooltipVisibleFunc('sex', true)"
          @mouseout="tooltipVisibleFunc('sex', false)"
      >
        <span>{{ cbcSex }}</span>
        <Tooltip :isVisible="tooltipVisible.sex" className="mb08" type="" message='Sex' />
      </li>
      <li
          class="pos-relative"
          v-if="cbcAge"
          @mouseover="tooltipVisibleFunc('age', true)"
          @mouseout="tooltipVisibleFunc('age', false)"
      >
        <span>{{ cbcAge }}</span>
        <Tooltip :isVisible="tooltipVisible.age" className="mb08" type="" message='Age' />
      </li>
      <li
          class="pos-relative"
          v-if="hospitalName"
          @mouseover="tooltipVisibleFunc('hospitalName', true)"
          @mouseout="tooltipVisibleFunc('hospitalName', false)"
      >
        <span>{{ hospitalName }}</span>
        <Tooltip :isVisible="tooltipVisible.hospitalName" className="mb08" message='Hospital name' />
      </li>

      <li class="detailHeader-tool-container">
        <div class="flex-align-center pos-relative">
          <h1 class="mr12 fs10">Tools</h1>
          <div class="pos-relative">
            <span
                class="pos-relative"
                @mouseover="tooltipVisibleFunc('memo', true)"
                @mouseout="tooltipVisibleFunc('memo', false)"
            >
            <font-awesome-icon :icon="['fas', 'comment-dots']" :class="hasMemo() && 'blueDarkText'" @click="memoOpen" class="hoverSizeAction cursorPointer" />
            <Tooltip :isVisible="tooltipVisible.memo" className="mb08" position="top" type="" :message="MSG.TOOLTIP.MEMO" />
          </span>
            <div v-if="isMemoModalOpen" class="memoModal shadowBox">
              <div class="memoModal-header">
                <h1 class="fs12">Memo</h1>
                <font-awesome-icon @click="memoCancel" class="commonBtn memoModal-cancel-btn" :icon="['fas', 'xmark']" />
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
                <button class="memoModalBtn" @click="memoChange">Save</button>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
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
</template>

<script setup lang="ts">
import { defineProps, watch, defineEmits, ref, computed, onBeforeMount, nextTick, onMounted } from 'vue';
import { getDateTimeYYYYMMDDHHmmss } from "@/common/lib/utils/dateUtils";
import {useStore} from "vuex";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import Modal from "@/components/commonUi/modal.vue";
import {
  barcodeNoUpdateMutation,
  gqlGenericUpdate,
  memoUpdateMutation
} from "@/gql/mutation/slideData";
import {MESSAGES, MSG, MSG_GENERAL, TOAST} from "@/common/defines/constants/constantMessageText";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {DetailHeaderType} from "@/common/type/tooltipType";
import Alert from "@/components/commonUi/Alert.vue";

const props = defineProps(['testType', 'barcodeNo', 'cbcPatientNo', 'patientName', 'hospitalName', 'cbcPatientName', 'cbcSex', 'cbcAge', 'analyzedDttm', 'slideData', 'crcConnect', 'checkedAllClass']);
const emits = defineEmits();
const store = useStore();
const slideData = computed(() => store.state.slideDataModule);
const siteCd = computed(() => store.state.commonModule.siteCd);
const projectBm = ref(false);
const tooltipVisible = ref({
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

onBeforeMount(() => {
  projectBm.value = window.PROJECT_TYPE === 'bm';
})

onMounted(async () => {
  if (props?.slideData) {
    memo.value.wbc = props.slideData?.wbcMemo;
    memo.value.rbc = props.slideData?.rbcMemo;
  }

})

watch(() => slideData.value, (newSlideData) => {
  memo.value.wbc = newSlideData?.wbcMemo;
  memo.value.rbc = newSlideData?.rbcMemo;
  if (!newSlideData.cbcPatientNm || newSlideData.cbcPatientNm === '' || newSlideData.cbcPatientNm !== newSlideData.patientNm) {
    emits('updateSlideDataByCBCData', newSlideData);
  }
}, { deep: true });

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
    const updatedRuningInfo = { ...slideData.value, barcodeNo: editingBarcodeNo.value };
    const res = await gqlGenericUpdate(barcodeNoUpdateMutation, {
      id: slideData.value.id,
      barcodeNo: editingBarcodeNo.value,
    });

    if (res && res?.data?.updateRunningInfoGQL[0].length !== 0) {
      toast.value.message = MESSAGES.TOAST_MSG_SUCCESS;
      showToast(MSG_GENERAL.SUCCESS);
    }
    await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
  } catch (error) {
    toast.value.message = MESSAGES.TOAST_MSG_ERROR;
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
  toast.value.message = MESSAGES.TOAST_MSG_SUCCESS;
  showToast(MESSAGES.TOAST_MSG_BAR_CODE_SUCCESS);
}

const memoChange = async () => {
  const enterAppliedWbcMemo = memo.value.wbc.replaceAll('\r\n', '<br>');
  const enterAppliedRbcMemo = memo.value.rbc.replaceAll('\r\n', '<br>');
  const updatedItem = {
    wbcMemo: enterAppliedWbcMemo,
    rbcMemo: enterAppliedRbcMemo,
  }
  const updatedRuningInfo = {...props.slideData, ...updatedItem};
  const res = await gqlGenericUpdate(memoUpdateMutation, {
    id: updatedRuningInfo.id,
    wbcMemo: updatedRuningInfo.wbcMemo,
    rbcMemo: updatedRuningInfo.rbcMemo,
  });

  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);


  if (res && res?.data?.updateRunningInfoGQL[0].length !== 0) {
    toast.value.message = MESSAGES.TOAST_MSG_SUCCESS;
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
  return props.slideData?.wbcMemo || props.slideData?.rbcMemo;
}

</script>