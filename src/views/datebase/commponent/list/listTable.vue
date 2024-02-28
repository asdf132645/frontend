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
    <tbody>
    <tr v-for="item in dbData" :key="item.id">
      <td>
        {{ item.id }}
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
    <div ref="loadMoreRef" style="height: 10px;"></div>
    </tbody>
  </table>
</template>

<script setup>
import { getTestTypeText } from "@/common/lib/utils/conversionDataUtils";
import { ref, onMounted, defineProps, defineEmits } from 'vue';

const props = defineProps(['dbData']);
const loadMoreRef = ref(null);
const emits = defineEmits();

onMounted(() => {
  const observer = new IntersectionObserver(handleIntersection, {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  });

  observer.observe(loadMoreRef.value);
});

const handleIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio !== 1) {
      emits('loadMoreData');
    }
  });
};

</script>

