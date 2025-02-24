<template>
  <button
      :btnType="btnType"
      class="base-btn"
      :style="computedStyle"
      :disabled="disabled"
      @click="handleClick"
      @mouseenter="handleHoverStatus(true)"
      @mouseleave="handleHoverStatus(false)"
  >
  <font-awesome-icon
      v-if="icon"
      :icon="icon"
      class="btn-icon"
  />
  <slot/>
  </button>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, computed, ref, watch} from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps({
  className: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',  // sm, md, lg
  },
  btnType: {
    type: String,
    default: 'button',  // button, submit, reset
  },
  disabled: {
    type: Boolean,
    default: false,  // true, false
  },
  variant: {
    type: String,
    default: 'primary',  // primary, secondary
  },
  icon: {
    type: [String, Array],
    default: null,
  },
  isActive: {
    type: Boolean,
    default: false,
  }
});

const emits = defineEmits(['click']);
const isHovered = ref(false);

// 해당 style 코드는 vue production 모드일 때 동적 Class 적용 시 style이 적용되지 않는 문제로 style 바인딩을 사용했습니다.
const computedStyle = computed(() => {
  const styles: { [key: string]: string | number } = {
    opacity: props.disabled ? 0.6 : 1,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.3s, color 0.3s', // 부드러운 전환 효과
  };

  // 크기 스타일
  switch (props.size) {
    case 'sm':
      styles.fontSize = '12px';
      styles.padding = '6px 12px';
      break;
    case 'md':
      styles.fontSize = '14px';
      styles.padding = '8px 16px';
      break;
    case 'lg':
      styles.fontSize = '16px';
      styles.padding = '10px 20px';
      break;
  }

  // 타입 스타일
  if (props.variant === 'primary') {
    styles.background = props.isActive ? 'var(--white-bg-0-color)' : (isHovered.value ? 'rgba(255, 255, 255, 0.2)' : 'transparent');
    styles.color = props.isActive ? 'black' : 'white';
    styles.border = '1px solid white';
  } else if (props.variant === 'secondary') {
    styles.background = props.isActive ? 'var(--white-bg-0-color)' : (isHovered.value ? 'rgba(255, 255, 255, 0.2)' : 'var(--main-bg-9-color)');
    styles.color = props.isActive ? 'black' : 'white';
    styles.border = 'none';
  }

  return styles;
});

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emits('click', event);
  }
}

const handleHoverStatus = (status: boolean) => {
  isHovered.value = status;
}

</script>
