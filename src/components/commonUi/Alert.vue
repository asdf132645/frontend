<!-- Alert.vue -->
<template>
  <div v-if="isVisible" class="alert" :class="typeClass">
    <p class="mb1">
      {{ message }}
    </p>
    <button @click="hideAlert">Close</button>
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

<style scoped>
.alert {
  position: absolute;
  top: 5%;
  left: 50%;
  padding: 25px;
  border: 1px solid #414141;
  border-radius: 5px;
}

.alert-success {
  background-color: #ffffff;
  border-color: #ccc;
  color: #155724;
}

.alert-error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}
</style>
