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
import {messages} from "@/common/defines/constFile/constantMessageText";
const props = defineProps(['isVisible', 'type', 'message']);
const typeClass = computed(() => `confirm-${props.type}`);
const emit = defineEmits(['okConfirm']);

const typeConvertConfirmText = (type) => {
  switch (type) {
    case 'setting':
      return messages.SAVE;
    case 'delete':
      return messages.DELETE;
    default:
      return 'OK';
  }
}

const typeConvertCloseText = (type) => {
  switch (type) {
    case 'setting':
      return messages.LEAVE;
    case 'delete':
      return messages.CLOSE;
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
