<template>
  <div class="isAutoCBCMatchingDiv">
   <p>Choose the code, please. </p>
    <ul>
      <li v-for="(item, idx) in isAutoCBCMatchingArr" :key="idx" @click="selectCode(item.code)">
        {{ item.code }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {defineProps} from "vue";

const props = defineProps(['isAutoCBCMatchingArr']);
const emit = defineEmits(['codeSelect']);

const selectCode = (code: string) => {
  emit('codeSelect', code)
//
}

</script>