<template>
  <table class='defaultTable mt2'>
    <thead>
    <tr>
      <th>NO</th>
      <th><input type="checkbox"/></th>
      <th>Type</th>
      <th>State</th>
      <th>Tray Slot</th>
      <th>Barcode NO</th>
      <th>Patient ID</th>
      <th>Patient Name</th>
      <th>Analyzed Date</th>
      <th>Tact Time(S)</th>
      <th>Submit</th>
      <th>Submit Date</th>
      <th>Edit</th>
    </tr>
    </thead>
    <tbody v-if="dbData.length !== 0">
    <tr
        v-for="(item, idx) in dbData"
        :key="item.id"
        :class="{ selectedTr: selectedItemId === item.id }"
        @click="selectItem(item)"
        @dblclick='rowDbClick(item)'
        ref="firstRow"
    >
      <td> {{ idx + 1 }}</td>
      <td>
        <input type="checkbox"/>
      </td>
      <td> {{ getTestTypeText(item?.testType) }} </td>
      <td>
        <font-awesome-icon
            :icon="['fas', `${!item?.state ? 'lock-open' : 'lock' }`]"
        />
      </td>
      <td> {{ item?.traySlot }} </td>
      <td> {{ item?.barcodeNo }} </td>
      <td> {{ item?.patientId }} </td>
      <td> {{ item?.patientNm }} </td>
      <td> {{ item?.analyzedDttm }} </td>
      <td> {{ item?.tactTime }} </td>
      <td> {{ item?.submit }} </td>
      <td> {{ item?.signedOfDate }} </td>
      <td> edit </td>
    </tr>
    <tr>
      <div ref="loadMoreRef" style="height: 10px;"></div>
    </tr>
    </tbody>
    <tbody v-else>
    <tr class="text-center">
      <td colspan="13"> NO Data</td>
    </tr>
    </tbody>
  </table>
</template>

<script setup>
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {ref, onMounted, watchEffect, defineProps, defineEmits} from 'vue';
import router from "@/router";

const props = defineProps(['dbData']);
const loadMoreRef = ref(null);
const emits = defineEmits();
const selectedItemId = ref('');
onMounted(() => {
  if (props.dbData.length === 0) {
    console.log(props.dbData)
    return;
  }
  const observer = new IntersectionObserver(handleIntersection, {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  });
  observer.observe(loadMoreRef.value);
});

watchEffect(() => {
  if (props.dbData.length > 0) {
    // 첫 번째 행을 클릭
    const dbBaseTrClickId = sessionStorage.getItem('dbBaseTrClickId') || 0;
    const filteredItems = props.dbData.filter(item => item.id === Number(dbBaseTrClickId));
    selectItem(filteredItems[0]);
  }
});



const handleIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio !== 1) {
      emits('loadMoreData');
    }
  });
};

const selectItem = (item) => {
  // 부모로 전달
  if(!item){
    return;
  }
  emits('selectItem', item);
  selectedItemId.value = item.id;
  sessionStorage.setItem('dbBaseTrClickId',item.id);
};

const rowDbClick = (item) => {
  const wbcInfoData = item?.wbcInfo?.wbcInfo[0];
  console.log(wbcInfoData)
  const sortedArray = wbcInfoData.sort((a, b) => a.id - b.id);
  // 스토어 사용 못하는 이유 -> 새로고침 등 여러가지 행동에 데이터가 날라가면 안되서 세션스토리지 사용
  sessionStorage.setItem('selectItemWbc', JSON.stringify(sortedArray));
  sessionStorage.setItem('selectItems', JSON.stringify(item));
  sessionStorage.setItem('originalDbData', JSON.stringify(props.dbData));
  router.push('/databaseWbc')
}

</script>

