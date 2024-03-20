<template>
  <div>
    <h3 style="text-align:left">RBC Classification</h3>
    <div>
        <font-awesome-icon :icon="['fas', 'comment-dots']" @click="memoOpen"/>
        <div v-if="memoModal">
          <textarea v-model="memo"></textarea>
          <button @click="memoChange">ok</button>
          <button @click="memoCancel">cancel</button>
        </div>
    </div>
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
            <div v-for="item in rbcVal.classInfo" :key="item.classId">
                <font-awesome-icon
                    v-if="item.classNm === 'Normal'"
                    :icon="['fas', 'circle']"
                    :class="{
                        'degreeActive': Number(item.degree) >= 1,
                        'degree0-img': Number(item.degree) === 0
                    }"
                />
                <!-- For other classNm, render 4 circles -->
                <font-awesome-icon
                    v-else
                    :icon="['fas', 'circle']"
                    v-for="degreeIndex in 4" :key="degreeIndex"
                    :class="{
                        'degreeActive': degreeIndex < Number(item?.degree) + 2 || 0,
                        'degree0-img': degreeIndex >= Number(item?.degree) + 1 || 0
                    }"
                />
            </div>
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
const memo = ref('');
const memoModal = ref(false);

onMounted(() => {
    pltCount.value = props.selectItems?.pltCount;
    malariaCount.value = props.selectItems?.malariaCount;
    memo.value = props.selectItems.rbcMemo;
});

watch(() => props.rbcInfo, (newItem) => {
    rbcInfoChangeVal.value = newItem;
    // console.log('rbcInfoChangeVal')
    // console.log(rbcInfoChangeVal.value)
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
