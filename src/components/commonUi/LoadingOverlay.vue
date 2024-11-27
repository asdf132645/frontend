<template>
  <div v-if="loading" class="loading-overlay-container">
    <div class="loadingOverlay-spinner"></div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps(['type', 'isLoading'])
const loading = ref(props.isLoading);

watch(() => props.isLoading, (newVal) => {
      loading.value = newVal;
});
</script>