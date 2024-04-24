<!-- Alert.vue -->
<template>
  <div v-if="isVisible" class="alert" :class="typeClass">
    <p class="mb1">
      {{ message }}
    </p>
    <button class="alertButton" @click="okConfirm">OK</button>
    <button class="alertButton" @click="hideConfirm">CLOSE</button>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps(['isVisible', 'type', 'message']);
const typeClass = computed(() => `confirm-${props.type}`);
const emit = defineEmits(['okConfirm']);

const hideConfirm = () => {
    emit('hide');
};

const okConfirm = () => {
    emit('okConfirm');
}
</script>

<style scoped>

.confirmBtn {
  padding: 10px 20px;
  margin-right: 3px;
  cursor: pointer;
  border: none;
  border-radius: 3px;
  color: white;
}


</style>
