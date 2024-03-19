<template>
  <div>
    <h3 style="text-align:left">RBC Classification</h3>
    <table class="table-container">
      <thead>
        <tr>
          <th class="rbc-head">Category</th>
          <th class="rbc-head">Class</th>
          <th class="rbc-head">Degree</th>
        </tr>
      </thead>
      <tbody>
        <!-- Loop through rbcInfoChangeVal -->
        <tr v-for="rbcVal in rbcInfoChangeVal" :key="rbcVal.categoryId">
          <td class="rbc-container">{{ rbcVal.categoryNm }}</td>
          <td class="rbc-container">
            <!-- Loop through classInfo -->
            <div v-for="item in rbcVal.classInfo" :key="item.classId">{{ item.classNm }}</div>
          </td>
          <td class="rbc-container">
            <!-- Loop through classInfo and display degrees -->
            <div v-for="item in rbcVal.classInfo" :key="item.classId">{{ item.degree }}</div>
          </td>
        </tr>
        <!-- Add a row for other details -->
        <tr>
          <td class="rbc-container">Others</td>
          <td class="rbc-container">
            <!-- Display pltLabel and malariaLabel -->
            <div>{{ pltLabel }}</div>
            <div>{{ malariaLabel }}</div>
          </td>
          <td class="rbc-container">
            <!-- Display pltCount and malariaCount -->
            <div>{{ pltCount || 0 }} PLT / 1000 RBC</div>
            <div>{{ malariaCount || 0 }} / {{ maxRbcCount || 0 }} RBC</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch, onMounted } from 'vue';

const props = defineProps(['rbcInfo', 'selectItems', 'originalDb']);
const rbcInfoChangeVal = ref([]);
const pltCount = ref('');
const malariaCount = ref('');
const pltLabel = 'Platelets';
const malariaLabel = 'Malaria';

onMounted(() => {
  pltCount.value = props.selectItems?.pltCount;
  malariaCount.value = props.selectItems?.malariaCount;
});

watch(() => props.rbcInfo, (newItem) => {
  rbcInfoChangeVal.value = newItem;
});

watch(() => props.selectItems, (newItem) => {
  pltCount.value = props.selectItems?.pltCount;
  malariaCount.value = props.selectItems?.malariaCount;
});
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
}

.rbc-head,
.rbc-container {
  flex: 1;
  padding-right: 20px;
  text-align: left;
}
</style>
