<template>
  <div class="slider-container">
    <input type="range" v-model="value" :min="min" :max="max" @input="updateValue"/>
    <div class="value">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
import {ref, defineProps, watch, defineEmits} from 'vue'

const props = defineProps<{
  min: number;
  max: number;
  modelValue: number;
}>();

const emits = defineEmits(['update:modelValue']);

const value = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  value.value = newValue;
});

const updateValue = () => {
  emits('update:modelValue', value.value);
};
</script>

<style scoped>
.slider-container {
  display: flex;
  align-items: center;

}

input[type="range"] {
  margin-right: 10px;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
  -webkit-appearance: none;
  appearance: none;
  height: 2px;
  border: 1px solid #3498db;
  background: #ffffff;
}

input[type="range"]:hover {
  opacity: 1;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #3498db;
  cursor: pointer;
  border-radius: 100%;
}

input[type="range"]::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background: #3498db;
  cursor: pointer;
  border-radius: 50%;
}

input[type="range"]::-ms-thumb {
  width: 15px;
  height: 15px;
  background: #3498db;
  cursor: pointer;
  border-radius: 50%;
}

.value {
  font-size: 14px;
}
</style>
