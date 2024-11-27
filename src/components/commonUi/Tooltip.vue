<template>
  <div v-show="isVisible" class="tooltip-container">
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface PropsType {
  isVisible: boolean;
  type: string;
  message: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const props = defineProps<PropsType>();

</script>