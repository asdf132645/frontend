<template>
  <div class='mt3'>
    <h3>WBC Images</h3>
    <div>
      {{ dbData[0].wbcInfo }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, onMounted} from 'vue';

const props = defineProps(['dbData']);

</script>
