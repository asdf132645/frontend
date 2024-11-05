<template>
  <div v-if="isOpen" class="popup-modal-overlay">
    <div class="popup-modal-content">
      <div class="popup-modal-header">
        <Datepicker
            v-model="selectedDate"
            :format="dateFormat"
            class="date-picker"
        />
      </div>

      <div class="popup-modal-body">
        <table class="popup-data-table">
          <thead>
          <tr style="position: sticky; top:0;">
            <th>No.</th>
            <th>접수일자</th>
            <th>검사일자</th>
            <th>접수번호</th>
            <th>결과코드</th>
            <th>환자명</th>
            <th>검사여부</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in workListValue" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.reqDate }}</td>
            <td>{{ item.testDate }}</td>
            <td>{{ item.receiptNo }}</td>
            <td>{{ item.resultCode }}</td>
            <td>{{ item.patientName }}</td>
            <td>{{ item.testYn }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="popup-modal-footer">
        <button
            class="popup-btn-close"
            @click="handleClose"
        >
          CLOSE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import Datepicker from 'vue3-datepicker';
import {getDateTimeYYYYMMDD} from "@/common/lib/utils/dateUtils";

interface Props {
  isOpen: boolean;
  workList: any[];
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const workListValue = ref<any>([]);

const selectedDate = ref(new Date());

onMounted(() => {
  workListValue.value = [
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
    { reqDate: getDateTimeYYYYMMDD(new Date()), testDate: getDateTimeYYYYMMDD(new Date()), receiptNo: '00414', resultCode: 30010, patientName: '백종호', testYn: 'N' },
  ]
})

watch(() => selectedDate.value, () => {
  console.log('workListValue', workListValue.value);
  console.log('getDateTimeYYYYMMDD(selectedDate.value)', getDateTimeYYYYMMDD(selectedDate.value));
  workListValue.value = workListValue.value.filter((item) => {
    return item.testDate === getDateTimeYYYYMMDD(selectedDate.value)
  });
  console.log('workListValue', workListValue.value);
})

const dateFormat = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const handleClose = () => {
  emit('update:isOpen', false);
};
</script>