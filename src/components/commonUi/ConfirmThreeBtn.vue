<template>
  <div v-if="isVisible" class="alert" :class="typeClass">
    <p class="mb10">
      {{ message }}
    </p>
    <button class="alertButton" @click="okConfirm">{{ confirmFirstText || 'OK' }}</button>
    <button class="alertButton" @click="okConfirm2">{{ confirmSecondText || 'OK' }}</button>
    <button class="alertCloseButton" @click="hideConfirm">{{ closeText || 'CLOSE' }}</button>
  </div>
</template>

<script setup>
import {defineProps, computed} from 'vue';

const props = defineProps(['isVisible', 'type', 'message', 'confirmFirstText', 'confirmSecondText', 'closeText']);
const typeClass = computed(() => `confirm-${props.type}`);
const emit = defineEmits(['okConfirm, okConfirm2']);

const hideConfirm = () => {
  emit('hide');
};

const okConfirm = () => {
  emit('okConfirm');
}

const okConfirm2 = () => {
  emit('okConfirm2');
}

</script>
