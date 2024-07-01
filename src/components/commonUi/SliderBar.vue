<template>
  <p>{{ leftText }}</p>
  <div class="slider-container">
    <input class="slider-range" type="range" v-model="value" :min="min" :max="max" @input="updateValue"/>
    <div class="value">{{ value }}</div>
  </div>
  <p>{{ rightText }}</p> 
</template>

<script setup lang="ts">
import {ref, defineProps, watch, defineEmits} from 'vue'

const props = defineProps<{
  min: number;
  max: number;
  modelValue: number;
  leftText: string;
  rightText: string;
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