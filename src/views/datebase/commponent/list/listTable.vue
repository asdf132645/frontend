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
      <td>
        {{ idx + 1 }}
      </td>
      <td>
        <input type="checkbox"/>
      </td>
      <td>
        {{ getTestTypeText(item?.testType) }}
      </td>
      <td>
        <font-awesome-icon
            :icon="['fas', `${!item?.state ? 'lock-open' : 'lock' }`]"
        />
      </td>
      <td>
        {{ item?.traySlot }}
      </td>
      <td>
        {{ item?.barcodeNo }}
      </td>
      <td>
        {{ item?.patientId }}
      </td>
      <td>
        {{ item?.patientNm }}
      </td>
      <td>
        {{ item?.analyzedDttm }}
      </td>
      <td>
        {{ item?.tactTime }}
      </td>
      <td>
        {{ item?.submit }}
      </td>
      <td>
        {{ item?.submitDate }}
      </td>
      <td>
        edit
      </td>
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
    let id = '';
    if(dbBaseTrClickId === 0){
      id = dbBaseTrClickId;
    }else{
      id = dbBaseTrClickId - 1;
    }
    selectItem(props.dbData[id]);
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
  console.log(item)
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
  sessionStorage.setItem('selectItemWbc', JSON.stringify(sortedArray));
  sessionStorage.setItem('selectItems', JSON.stringify(item));
  router.push('/databaseWbc')
}

</script>

