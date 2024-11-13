<template>
  <div v-if="isOpen" class="popup-modal-overlay">
    <div class="popup-modal-content">
      <div class="popup-modal-header">
        <Datepicker
          v-model="selectedDate"
          :format="dateFormat"
          class="date-picker"
          ref="datepicker"
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
          <tr v-for="(item, index) in workListShowValue" :key="index">
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
import { ref, watch } from 'vue';
import Datepicker from 'vue3-datepicker';
import {getDateTimeYYYYMMDD} from "@/common/lib/utils/dateUtils";
import {sdWorklistsAPI} from "@/common/helpers/lisCbc";

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
const workListShowValue = ref<any>([]);
const datepicker = ref(null);
const selectedDate = ref(new Date());
const showAlert = ref(false);
const alertMessage = ref('');
import moment from "moment/moment";

watch(() => props.workList, (newWorkList) => {
  workListValue.value = newWorkList;
})

watch(() => selectedDate.value, async (newVal: any, prevVal: any) => {
  const formattedDate = moment(newVal).format('YYYY-MM-DD');
  const { data, code } = await sdWorklistsAPI(formattedDate);

  if (Number(code) === 200) {
    workListValue.value = data;
  } else {
    await showSuccessAlert('불러오기에 실패했습니다');
  }
})
const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertMessage.value = message;
};
const dateFormat = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const handleClose = () => {
  emit('update:isOpen', false);
};
</script>