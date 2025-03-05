<template>
  <div class="multiselect-container" ref="dropdownRef">
    <div
        class="multiselect-input-container"
        @click="toggleDropdown"
        :class="{ 'active': isOpen }"
    >
      <div class="multiselect-selected-options">
        <span v-if="selectedOptions.length === 0" class="placeholder">
          {{ placeholder }}
        </span>
        <div
            v-for="selected in selectedOptions"
            :key="selected.value"
            class="multiselect-selected-option"
        >
          {{ selected.label }}
        </div>
      </div>
      <div>
        <span v-if="isOpen" style="color: black">&#9650;</span>
        <span v-else style="color: black">&#9660;</span>
      </div>
    </div>

    <div v-if="isOpen" class="multiselect-dropdown-menu">
      <div
          v-for="option in props.options"
          :key="option.value"
          class="multiselect-dropdown-item"
          @click.stop="toggleOption(option)"
      >
        <input type="checkbox" :checked="isSelected(option)" />
        <span>{{ option.label }}</span>
      </div>
      <div v-if="props.options.length === 0" class="multiselect-no-results">
        {{ noResultsText }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

export interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  options: Option[];
  modelValue: (string | number)[];
  placeholder?: string;
  noResultsText?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '항목을 선택하세요',
  noResultsText: '선택할 항목이 없습니다',
  disabled: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void;
  (e: 'change', value: (string | number)[]): void;
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// 선택된 옵션 가져오기
const selectedOptions = computed(() => {
  return props.options.filter(option => props.modelValue.includes(option.value));
});

const isSelected = (option: Option): boolean => {
  return props.modelValue.includes(option.value);
};

// 드롭다운 토글
const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
};

// 옵션 선택/해제
const toggleOption = (option: Option) => {
  if (option.disabled) return;

  const newValue = [...props.modelValue];
  const index = newValue.indexOf(option.value);

  if (index === -1) {
    newValue.push(option.value);
  } else {
    newValue.splice(index, 1);
  }

  emit('update:modelValue', newValue);
  emit('change', newValue);
};

// 외부 클릭 감지하여 드롭다운 닫기
const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', closeDropdown);
});

// 드롭다운이 닫힐 때 초기화
watch(isOpen, (newValue) => {
  if (!newValue) {
    isOpen.value = false;
  }
});
</script>