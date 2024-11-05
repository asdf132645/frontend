<template>
  <div>
    <div>
      <Datepicker v-model="date"></Datepicker>
    </div>
    <table>
      <thead>
      <tr>
        <th>순번</th>
        <th>접수일자</th>
        <th>검사일자</th>
        <th>작업번호</th>
        <th>으뢰번호</th>
        <th>검사코드</th>
        <th>검사명</th>
        <th>환자명</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, idx) in workList" :key="idx">
        <td>{{ item?.no }}</td>
        <td>{{ item?.reqDate }}</td>
        <td>{{ item?.workDate }}</td>
        <td>{{ item?.workNo }}</td>
        <td>{{ item?.reqNo }}</td>
        <td>{{ item?.itemCode }}</td>
        <td>{{ item?.itemName }}</td>
        <td>{{ item?.patName }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import Datepicker from "vue3-datepicker";
import {defineProps, ref} from "vue";
const props = defineProps(['workList']);


const date = ref(new Date());

</script>