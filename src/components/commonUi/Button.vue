<template>
  <button
      :btnType="btnType"
      :class="computedClass"
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
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

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

const computedClass = computed(() => {
  return [
    'base-btn', // 기본 버튼 스타일
    `base-btn--${props.size}`, // 크기 스타일
    `base-btn--${props.variant}`, // primary, secondary 스타일
    {'base-btn--active': props.isActive}, // 활성화 상태
    {'base-btn--hover': isHovered.value}, // 호버 상태
    {'base-btn--disabled': props.disabled}, // 비활성화 상태
    props.className
  ]
})

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emits('click', event);
  }
}

const handleHoverStatus = (status: boolean) => {
  isHovered.value = status;
}

</script>