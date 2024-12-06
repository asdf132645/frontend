<template>
  <div class="progress-bar-guage">
    <div class="steps">
      <div
          v-for="(step, index) in testData"
          :key="index"
          class="step-container"
      >
        <!-- 동그라미 -->
        <div
            class="circleGuage"
            :class="{
            completed: step.percent === 100,
            active: step.percent > 0 && step.percent < 100,
            waiting: step.percent === 0 && index === testData.length - 1,
          }"
        >
          <span v-if="step.percent === 100">✔</span>
          <span v-else>{{ index + 1 }}</span>
        </div>

        <!-- 선 -->
        <div
            v-if="index < testData.length - 1"
            class="lineGuasge"
        >
          <div
              class="line-fill"
              :style="{
              width: step.percent + '%',
              transition: 'width 0.5s ease',
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 플러스 아이콘 -->
    <div v-if="isLoading" class="plus-icon">
      <span>+</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';

// 테스트 데이터
const testData = reactive([
  { name: 'Step 1', percent: 0 },
  { name: 'Step 2', percent: 0 },
  { name: 'Step 3', percent: 0 },
]);

// 추가 데이터 로딩 상태
const isLoading = ref(true);

// 퍼센트 업데이트 함수 (애니메이션용)
const updateProgress = () => {
  let progressIntervals = [1000, 3000, 5000]; // 각 단계에 대한 딜레이 시간 (밀리초)
  testData.forEach((step, index) => {
    setTimeout(() => {
      let currentPercent = 0;
      const interval = setInterval(() => {
        if (currentPercent < 100) {
          currentPercent += 5; // 5%씩 증가
          step.percent = currentPercent; // 실시간으로 percent 값 업데이트
        } else {
          clearInterval(interval); // 100%에 도달하면 애니메이션 종료
          if (index === 2) {
            // 마지막 단계 완료 후 다음 상태 추가 (예시)
            // testData.value = [
            //   { name: 'Step 1', percent: 0 },
            //   { name: 'Step 2', percent: 0 },
            //   { name: 'Step 3', percent: 0 },
            // ];
          }
        }
      }, 100); // 매 100ms마다 업데이트
    }, progressIntervals[index]); // 각 단계 시작 딜레이
  });

  // 데이터 로딩 완료 후 "뒤에 더 많은 데이터" 표시 해제
  setTimeout(() => {
    isLoading.value = false;
  }, progressIntervals[progressIntervals.length - 1] + 1000); // 마지막 단계가 끝난 후
};

// 컴포넌트가 마운트되면 애니메이션 실행
onMounted(() => {
  updateProgress();
});
</script>

<style scoped>
/* 전체 프로그레스바 */
.progress-bar-guage {
  width: 100%;
  max-width: 600px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
}

/* 각 단계 컨테이너 */
.steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.step-container {
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
}

/* 동그라미 */
.circleGuage {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid lightgray;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: lightgray;
}

.circleGuage.completed {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

.circleGuage.active {
  background-color: #ffeb3b;
  color: black;
  border-color: #ffeb3b;
}

.circleGuage.waiting {
  background-color: lightgray;
  color: white;
  border-color: lightgray;
}

/* 선 */
.lineGuasge {
  flex: 1;
  height: 4px;
  background-color: lightgray;
}

.line-fill {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.5s ease;
}

/* 플러스 아이콘 */
.plus-icon {
  font-size: 24px;
  font-weight: bold;
  color: gray;
  margin-top: 10px;
  animation: bounce 1s infinite alternate;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-10px);
  }
}
</style>
