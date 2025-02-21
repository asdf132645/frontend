<template>
  <button
      :type="btnType"
      :class="computedClass"
      :style="computedStyle"
      :disabled="disabled"
      @click="handleClick"
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
import {defineProps, defineEmits, computed} from "vue";
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
});
const emits = defineEmits(['click']);

const computedClass = computed(() => [
  'base-btn',
  props.className,
  `btn-${props.size}`,
  `btn-${props.size}`,
  `btn-${props.variant}`,
  {'btn-disabled': props.disabled},
]);

const handleClick = (event: Event) => {
  if (!props.disabled) {
    emits('click', event);
  }
}
</script>