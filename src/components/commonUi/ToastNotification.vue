<template>
  <div v-if="visible" class="toast-notification" :class="[position, messageType]">
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineProps } from 'vue';

// Props 정의: 메시지, 위치, 표시 시간
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 3000, // 표시될 시간 (기본 3초)
  },
  position: {
    type: String,
    default: 'bottom-right', // 기본 위치: 우측 하단
  },
  messageType: {
    type: String,
  }
});

const visible = ref(true);

onMounted(() => {
  // duration 이후에 visible 값을 false로 변경하여 컴포넌트 숨김
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
});

watch(props, (newProps) => {
  // props 값이 변경되면 다시 표시 후 사라짐
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, newProps.duration);
});
</script>
