<template>
  <div>
    <h3 class="titleText"><span class="greenColor">O</span>rder <span class="greenColor">L</span>ist</h3>
    <table class="orderListTable">
      <thead>
      <tr>
        <th>Barcode ID</th>
        <th>Patient Name</th>
        <th>Order Date</th>
        <th>State</th>
      </tr>
      </thead>
      <tbody v-if="dspOrderList.length > 0">
      <tr v-for="(item, index) in dspOrderList" :key="index">
        <td>{{ item.barcodeId }}</td>
        <td>{{ item.patientName }}</td>
        <!--    0019는 길병원(검사 끝나는 시간으로 해달라는 길병원 요구)    -->
        <td v-if="siteCd === '0019'">{{ item.analyzedDttm }}</td>
        <td v-else>{{ item.orderDate }}</td>
        <td>{{ getCommonCode('14', item.state) }}</td>
      </tr>
      </tbody>
      <tbody v-else>
      <tr>
        <td colspan="4">Data is empty.</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, ref, watch} from "vue";
import {getCommonCode, stringToDateTime} from "@/common/lib/utils/conversionDataUtils";
import {useStore} from "vuex";
import {SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";

interface OrderItem {
  barcodeId: string;
  patientName: string;
  orderDate: string;
  analyzedDttm?: string;
  state: string;
}

// 스토어
const store = useStore();
const orderList = computed(() => store.state.slotInfoModule);
const runningInfoModule = computed(() => store.state.runningInfoModule);
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);


// end 스토어
const dspOrderList = ref<OrderItem[]>([]);
const siteCd = ref('');


watch([runningInfoModule.value], (newVal: any) => {
  // console.log(newVal)
  if (newVal.length > 0) {
    const firstItem = newVal[0].runningInfo;
    if (firstItem) {
      if (firstItem.jobCmd === 'RUNNING_INFO') {
        const currentSlot = firstItem?.slotInfo.find(
            (item: SlotInfo) => item.stateCd === "03"
        );
        if (currentSlot) {
          dspOrderList.value = firstItem?.slotInfo.map((item: any) => ({
            barcodeId: item.barcodeNo,
            patientName: item.patientNm,
            orderDate: stringToDateTime(item.orderDttm),
            analyzedDttm: stringToDateTime(item.analyzedDttm),
            state: item.stateCd,
          }));

          store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
            slotInfo: [
              {
                orderList: dspOrderList.value,
              },
            ]
          });
        }

      }
    }
  }
});

watch([embeddedStatusJobCmd.value], async (newVals) => {
  // console.log('감시시작')
  const [newEmbeddedStatusJobCmd] = newVals;

  await nextTick();
  const {
    siteCd: siteCdCode,
  } = newEmbeddedStatusJobCmd || {};
  siteCd.value = siteCdCode;

});

</script>