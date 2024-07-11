<template>
  <div v-if="isVisible" class="alert" :class="typeClass">
    <p class="mb1">
      {{ message }}
    </p>
    <button class="alertButton" @click="okConfirm">OK</button>
    <button class="alertCloseButton" @click="hideConfirm">CLOSE</button>
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
