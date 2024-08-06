<!-- Alert.vue -->
<template>
  <div v-if="isVisible" class="alert" :class="typeClass">
    <p v-if="props.type === 'error'">
      <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="bigFont" />
    </p>
    <p class="mb1 alertMessage">
      {{ message }}
    </p>
    <button class="alertButton" @click="hideAlert">Close</button>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps(['isVisible', 'type', 'message']);
const typeClass = computed(() => `alert-${props.type}`);
const emit = defineEmits(['update:hideAlert']);

const hideAlert = () => {
  emit('hide');
};
</script>