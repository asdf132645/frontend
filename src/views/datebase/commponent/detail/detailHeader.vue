<template>
  <div class="topClintInfo">
    <ul>
      <li
          class="pos-relative"
          @mouseenter="tooltipVisibleFunc('analysisType', true)"
          @mouseleave="tooltipVisibleFunc('analysisType', false)"
      >
        <span>{{ testType }}</span>
        <Tooltip :isVisible="tooltipVisible.analysisType" className="mb08" position="bottom" type="" message='Analysis Type' />
      </li>
      <li
          class="pos-relative"
          v-if="barcodeNo"
          @mouseenter="tooltipVisibleFunc('barcodeNo', true)"
          @mouseleave="tooltipVisibleFunc('barcodeNo', false)"
      >
        <span>{{ !isModalOpen ? localBarcodeNo : barcodeNo }}</span>
        <Tooltip :isVisible="tooltipVisible.barcodeNo" className="mb08" position="bottom" type="" message='Barcode ID' />
        <font-awesome-icon class="detailHeader-barcodeEdit-font" v-if="siteCd === HOSPITAL_SITE_CD_BY_NAME['인천길병원']" @click="handleModal" :icon="['fas', 'pen-to-square']" />
      </li>
      <li
          class="pos-relative"
          v-if="analyzedDttm"
          @mouseenter="tooltipVisibleFunc('analyzedDttm', true)"
          @mouseleave="tooltipVisibleFunc('analyzedDttm', false)"
      >
        <span>{{ getDateTimeYYYYMMDDHHmmss(analyzedDttm) }}</span>
        <Tooltip :isVisible="tooltipVisible.analyzedDttm" className="mb08" position="bottom" type="" message='Analyzed Date' />
      </li>
      <li
          class="pos-relative"
          v-if="cbcPatientNo"
          @mouseenter="tooltipVisibleFunc('patientNo', true)"
          @mouseleave="tooltipVisibleFunc('patientNo', false)"
      >
        <span>{{ cbcPatientNo }}</span>
        <Tooltip :isVisible="tooltipVisible.patientNo" className="mb08" position="bottom" type="" message='Patient ID' />
      </li>
      <template v-if="cbcPatientName || patientName">
        <li
            class="pos-relative"
            v-if="cbcPatientName"
            @mouseenter="tooltipVisibleFunc('patientName', true)"
            @mouseleave="tooltipVisibleFunc('patientName', false)"
        >
          {{ cbcPatientName }}
          <Tooltip :isVisible="tooltipVisible.patientName" className="mb08" position="bottom" type="" message='Patient Name' />
        </li>
        <li
            class="pos-relative"
            v-else-if="patientName"
            @mouseenter="tooltipVisibleFunc('patientName', true)"
            @mouseleave="tooltipVisibleFunc('patientName', false)"
        >
          {{ patientName }}
          <Tooltip :isVisible="tooltipVisible.patientName" className="mb08" position="bottom" type="" message='Patient Name' />
        </li>
      </template>
      <li
          class="pos-relative"
          v-if="cbcSex"
          @mouseenter="tooltipVisibleFunc('sex', true)"
          @mouseleave="tooltipVisibleFunc('sex', false)"
      >
        <span>{{ cbcSex }}</span>
        <Tooltip :isVisible="tooltipVisible.sex" className="mb08" position="bottom" type="" message='Sex' />
      </li>
      <li
          class="pos-relative"
          v-if="cbcAge"
          @mouseenter="tooltipVisibleFunc('age', true)"
          @mouseleave="tooltipVisibleFunc('age', false)"
      >
        <span>{{ cbcAge }}</span>
        <Tooltip :isVisible="tooltipVisible.age" className="mb08" position="bottom" type="" message='Age' />
      </li>
      <li
          class="pos-relative"
          v-if="hospitalName"
          @mouseenter="tooltipVisibleFunc('hospitalName', true)"
          @mouseleave="tooltipVisibleFunc('hospitalName', false)"
      >
        <span>{{ hospitalName }}</span>
        <Tooltip :isVisible="tooltipVisible.hospitalName" className="mb08" position="bottom" type="" message='Hospital name' />
      </li>
      <li v-if="slideStatus && siteCd === '9090'" class="slideStatus"
          @mouseenter="tooltipVisibleFunc('slideStatus', true)"
          @mouseleave="tooltipVisibleFunc('slideStatus', false)"
      >
        Slide Condition : {{ slideStatus }}
        <Tooltip :isVisible="tooltipVisible.slideStatus" className="mb08" position="bottom" type=""
                 :message="`${slideStatusDesc}`"/>
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
                v-model="localBarcodeNo"
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

  <ToastNotification
      v-if="toast.message"
      :message="toast.message"
      :messageType="toast.type"
      :duration="1500"
  />
</template>

<script setup lang="ts">
import {defineProps, watch, defineEmits, ref, onMounted, computed, onBeforeMount, reactive, nextTick} from 'vue';
import {getDateTimeYYYYMMDDHHmmss} from "@/common/lib/utils/dateUtils";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {useStore} from "vuex";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {DIR_NAME} from "@/common/defines/constants/settings";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import Modal from "@/components/commonUi/modal.vue";
import {barcodeNoUpdateMutation, gqlGenericUpdate, memoUpdateMutation} from "@/gql/mutation/slideData";
import {MESSAGES, MSG_GENERAL, TOAST} from "@/common/defines/constants/constantMessageText";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {DetailHeaderType} from "@/common/type/tooltipType";

const props = defineProps(['testType', 'barcodeNo', 'cbcPatientNo', 'patientName', 'hospitalName', 'cbcPatientName', 'cbcSex', 'cbcAge', 'analyzedDttm', 'slideData']);
const emits = defineEmits();
const store = useStore();
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const slideData = computed(() => store.state.slideDataModule);
const siteCd = computed(() => store.state.commonModule.siteCd);
const projectBm = ref(false);
const tooltipVisible = ref({
  analysisType: false,
  barcodeNo: false,
  analyzedDttm: false,
  patientNo: false,
  patientName: false,
  sex: false,
  age: false,
  hospitalName: false,
  slideStatus: false
})
const slideStatus = ref('');
const slideStatusDesc = ref('');
const isModalOpen = ref(false);
const barcodeInput = ref(null);
const localBarcodeNo = ref('');
const toast = ref({
  message: '',
  type: MESSAGES.TOAST_MSG_SUCCESS,
})

onBeforeMount(() => {
  projectBm.value = window.PROJECT_TYPE === 'bm';
})

onMounted(async () => {
  const path = pbiaRootDir.value;
  const folderPath = !projectBm.value ? DIR_NAME.WBC_CLASS : DIR_NAME.BM_CLASS;
  const url_new = `${path}/${slideData.value.slotId}/${folderPath}/Slide_Condition.json`;
  const response_new = await readJsonFile({fullPath: url_new});
  slideStatus.value = response_new?.data?.condition;
  slideStatusDesc.value = response_new?.data?.description;
  localBarcodeNo.value = props.barcodeNo;
})

watch(() => props.slideData, (newSlideData) => {
  localBarcodeNo.value = newSlideData.barcodeNo;
  if (!newSlideData.cbcPatientNm || newSlideData.cbcPatientNm === '' || newSlideData.cbcPatientNm !== newSlideData.patientNm) {
    emits('updateSlideDataByCBCData', newSlideData);
  }
});

const tooltipVisibleFunc = (type: keyof DetailHeaderType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}


const handleModal = async () => {
  isModalOpen.value = true;
  await nextTick();
  if (barcodeInput.value) {
    barcodeInput.value.focus();
  }

}

const closeLayer = (val: boolean) => {
  if (!val) {
    localBarcodeNo.value = props.barcodeNo;
  }
  isModalOpen.value = val;
  localBarcodeNo.value
};

const handleEditBarcodeNo = async () => {
  await nextTick();
  try {
    const updatedRuningInfo = { ...slideData.value, barcodeNo: localBarcodeNo.value };
    const res = await gqlGenericUpdate(barcodeNoUpdateMutation, {
      id: slideData.value.id,
      barcodeNo: localBarcodeNo.value,
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

</script>