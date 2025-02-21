<template>
  <div
      v-if="isVisible"
      :class="`tooltip-container ${positionClass(position)} ${className}`"
      :style="style"
  >
    <pre>{{ message }}</pre>
  </div>
</template>

<script setup lang="ts">
import {defineProps} from 'vue';

interface PropsType {
  isVisible: boolean;
  type?: string;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  style?: string;
}

const props = withDefaults(defineProps<PropsType>(), {
  position: 'top',
});

const positionClass = (position: string) => {
  if (position === 'top') return 'tooltip-pos-top';
  if (position === 'bottom') return 'tooltip-pos-bottom';
  if (position === 'left') return 'tooltip-pos-left';
  if (position === 'right') return 'tooltip-pos-right';
}

</script>