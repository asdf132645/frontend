<!-- Alert.vue -->
<template>
  <div v-if="isVisible" class="confirm" :class="typeClass">
    <p class="mb1">
      {{ message }}
    </p>
    <button class="tab-btn" @click="okConfirm">OK</button>
    <button class="tab-btn" @click="hideConfirm">Close</button>
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
.confirm {
  position: absolute;
  top: 10%;
  left: 40%;
  z-index: 999;
  padding: 25px;
  border: 1px solid #414141;
  border-radius: 5px;
  color: whitesmoke;
  background:#2a2a2a;
}

.tab-btn {
  padding: 10px 20px;
  margin-right: 3px;
  cursor: pointer;
  border: none;
  border-radius: 3px;
  color: white;
  background-color: #282959;
}


</style>
