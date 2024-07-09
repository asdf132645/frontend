<template>
  <div v-if="loading" class="overlay">
    <div class="spinner"></div>
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

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>