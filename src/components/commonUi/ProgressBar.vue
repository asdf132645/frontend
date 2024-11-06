<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div
          class="progress-fill"
          :style="{
          width: `${percentage}%`,
          backgroundColor: color,
          transition: `width ${animationDuration}s ease-in-out`
        }"
      >
        <div v-if="showGlowEffect" class="progress-glow"></div>
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
  }
})

const percentage = computed(() => Math.round(props.value))
const gradient = computed(() =>
    `linear-gradient(90deg, ${props.gradientStart}, ${props.gradientEnd})`
)
</script>

<style scoped>
.progress-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 200px;
  max-width: 800px; /* 프로그레스 바 최대 길이 설정 */
  margin: 1rem auto;
}

.progress-bar {
  flex-grow: 1;
  height: 20px; /* 높이 증가 */
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  position: relative;
  transform-origin: left;
  animation: shimmer 2s infinite linear;
  background-size: 200% 100%;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
  );
  animation: glow 2s infinite;
}

/* 호버 효과 추가 */
.progress-bar:hover .progress-fill {
  filter: brightness(1.1);
  box-shadow: 0 0 10px rgba(66, 184, 131, 0.5);
}

@keyframes glow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>