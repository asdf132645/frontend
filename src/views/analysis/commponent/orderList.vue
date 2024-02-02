<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Barcode ID</th>
          <th>Patient Name</th>
          <th>Order Date</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
      <tr v-for="(item, index) in dspOrderList" :key="index">
        <td>{{ item.barcodeId }}</td>
        <td>{{ item.patientName }}</td>
        <td>{{ item.orderDate }}</td>
        <td>{{ getCommonCode('14',item.state) }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getCommonCode } from "@/common/lib/utils/conversionDataUtils";
import { useStore } from "vuex";

interface OrderItem {
  barcodeId: string;
  patientName: string;
  orderDate: string;
  state: string;
}

// 스토어
const store = useStore();
const orderList = computed(() => store.state.slotInfoModule);
const { slotInfo } = orderList.value ?? {};
// end 스토어
const dspOrderList = ref<OrderItem[]>([]);

watch(() => slotInfo, (newSlotInfo) => {
  updateDspOrderList(newSlotInfo);
});

const updateDspOrderList = (newSlotInfo: any[]) => {
  dspOrderList.value = newSlotInfo.map((item) => ({
    barcodeId: item.barcodeNo,
    patientName: item.patientNm,
    orderDate: item.orderDttm,
    state: item.stateCd,
  }));
};
</script>