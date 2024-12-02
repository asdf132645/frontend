<template>
  <div v-if="isVisible" class="alert" :class="typeClass">
    <p class="mb10 fs10">
      {{ message }}
    </p>
    <button class="alertButton" @click="okConfirm">{{ typeConvertConfirmText(type) || 'OK' }}</button>
    <button class="alertCloseButton" @click="hideConfirm">{{ typeConvertCloseText(type) || 'CLOSE' }}</button>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import {MESSAGES} from "@/common/defines/constants/constantMessageText";
const props = defineProps(['isVisible', 'type', 'message']);
const typeClass = computed(() => `confirm-${props.type}`);
const emit = defineEmits(['okConfirm']);

const typeConvertConfirmText = (type) => {
  switch (type) {
    case 'setting':
      return MESSAGES.SAVE;
    case 'delete':
      return MESSAGES.DELETE;
    default:
      return 'OK';
  }
}

const typeConvertCloseText = (type) => {
  switch (type) {
    case 'setting':
      return MESSAGES.LEAVE;
    case 'delete':
      return MESSAGES.CLOSE;
    default:
      return 'CLOSE';
  }
}

const hideConfirm = () => {
  emit('hide');
};

const okConfirm = () => {
  emit('okConfirm');
}
</script>
