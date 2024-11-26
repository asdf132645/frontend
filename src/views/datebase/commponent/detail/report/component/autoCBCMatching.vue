<template>
  <div class="isAutoCBCMatchingDiv">
   <p>Choose the code, please. </p>
    <ul v-if="isAutoCBCMatchingArr.length !== 0">
      <li v-for="(item, idx) in isAutoCBCMatchingArr" :key="idx" @click="selectCode(item.code)">
        {{ item.code }}
      </li>
    </ul>
    <div v-else class="chooseDiv">
      There are no matching values.
    </div>
    <button class="chooseBtn" @click="codeCloseChild">Close</button>
  </div>
</template>
<script setup lang="ts">
import {defineProps} from "vue";

const props = defineProps(['isAutoCBCMatchingArr']);
const emit = defineEmits(['codeSelect', 'codeClose']);

const selectCode = (code: string) => {
  emit('codeSelect', code)
//
}

const codeCloseChild = () => {
  emit('codeClose')
}

</script>