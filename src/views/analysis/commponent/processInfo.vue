<template>
  <div>
    <h3 class="titleText"><span class="greenColor">P</span>rocessing <span class="greenColor">I</span>nformation </h3>
    <ul class="processInfoUl">
      <li><span class="proSpan">Cassette No</span> <span class="proVal">{{ processInfoItem?.cassetteNo }}</span></li>
      <li><span class="proSpan">Barcode ID</span> <span class="proVal">{{ processInfoItem?.barcodeId }}</span></li>
      <li><span class="proSpan">Patient ID</span> <span class="proVal">{{ processInfoItem?.patientId }}</span></li>
      <li><span class="proSpan">Patient Name</span> <span class="proVal">{{ processInfoItem?.patientName }}</span></li>
      <li><span class="proSpan">WBC Count</span> <span class="proVal">{{ processInfoItem?.wbcCount }}</span></li>
      <li>
        <!--0019 길병원-->
        <span class="proSpan">
          {{ siteCd === '0019' ? 'Order Date' : 'Analyzed Date' }}
        </span>
        <span class="proVal">
          {{ siteCd === '0019' ? processInfoItem?.analyzedDttm : processInfoItem?.orderDate }}
        </span>
      </li>
      <li>
        <span class="proSpan">Oil Count</span>
        <span class="proVal">{{ prevOilCount }}</span>
      </li>
    </ul>
  </div>
</template>


<script setup lang="ts">
import {ref, computed, watch, onMounted, getCurrentInstance} from "vue";
import {useStore} from "vuex";
import {stringToDateTime} from "@/common/lib/utils/conversionDataUtils";
const processInfo = computed(() => store.state.commonModule.processInfo);

// 스토어
const store = useStore();
const runningInfoModule = computed(() => store.state.runningInfoModule);
const siteCd = ref('');

// 스토어 end

const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
// processInfoItem 초기화
const processInfoItem = ref<any>({});
const prevOilCount = ref<string | null>(null);
const instance = getCurrentInstance();


watch([embeddedStatusJobCmd.value], async (newVal) => {
  if (newVal.length > 0) {
    const sysInfo = newVal[0].sysInfo;
    if(sysInfo.oilCount !== prevOilCount.value){
      processInfoItem.value.oilCount = sysInfo.oilCount;
      prevOilCount.value = sysInfo.oilCount
    }
    siteCd.value = sysInfo.siteCd;
  }
})

onMounted(() => {
  prevOilCount.value = embeddedStatusJobCmd.value[0]?.sysInfo.oilCount;
});

instance?.appContext.config.globalProperties.$socket.on('chat', async (data) => {
  try {
    const textDecoder = new TextDecoder('utf-8');
    const stringData = textDecoder.decode(data);

    const parsedData = JSON.parse(stringData);
    if(parsedData.jobCmd === 'RUNNING_INFO'){
      const currentSlot = parsedData?.slotInfo;
      if (currentSlot) {
        processInfoItem.value = {
          cassetteNo: 1,
          barcodeId: currentSlot.barcodeNo,
          patientId: currentSlot.patientId,
          patientName: currentSlot.patientNm,
          // wbcCount: currentSlot.maxWbcCount,
          orderDate: stringToDateTime(currentSlot.orderDttm),
          analyzedDttm: stringToDateTime(currentSlot.analyzedDttm),
        };
        // processInfo
        const str: any = parsedData?.iCasStat ?? '';
        const iCasStatArr: any = [...str];
        if(iCasStatArr.lastIndexOf("2") !== -1){
          processInfo.value[iCasStatArr.lastIndexOf("2")] = {
            processInfo: processInfoItem.value,
            slotId: parsedData.slotInfo.slotId
          };
        }
        store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
          slotInfo: [
            {
              processInfo: processInfoItem.value,
            },
          ]
        });
      }
    }
  } catch (e) {
    // console.log(e)
  }
})


// 실행정보를 가지고 온다.

</script>
