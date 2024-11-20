<template>
  <div class="progress-component-container">
    <p>{{ text }}</p>
    <div class="progress-component-bar">
      <div
          class="progress-component-fill"
          :style="{
          width: `${percentage}%`,
          backgroundColor: color,
          transition: `width ${animationDuration}s ease-in-out`
        }"
      >
        <div v-if="showGlowEffect" class="progress-component-glow"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  gradientStart: {
    type: String,
    default: '#42b883'
  },
  gradientEnd: {
    type: String,
    default: '#3b8070'
  },
  color: {
    type: String,
    default: '#00c2ff'
  },
  animationDuration: {
    type: Number,
    default: 0.3
  },
  showGlowEffect: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
  }
})

const percentage = computed(() => Math.round(props.value))
const gradient = computed(() =>
    `linear-gradient(90deg, ${props.gradientStart}, ${props.gradientEnd})`
)
</script>