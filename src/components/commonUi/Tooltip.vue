<template>
  <div
      v-if="isVisible"
      :class="`tooltip-container tooltip-pos-${position} ${className}`"
  >
    <pre>{{ message }}</pre>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface PropsType {
  isVisible: boolean;
  type?: string;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const props = withDefaults(defineProps<PropsType>(), {
  position: 'top',
});

</script>