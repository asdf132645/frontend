<template>
  <div class="progress-bar-guage">
    <div class="steps">
      <div
          v-for="(step, index) in progressData.progressArr"
          :key="index"
          class="step-container"
      >
        <!-- 동그라미 -->
        <div
            class="circleGuage"
            :class="{
            completed: step.progressPercent === 100,
            active: step.progressPercent > 0 && step.progressPercent < 100,
            waiting: step.progressPercent === 0 && index === progressData.progressArr.length - 1,
          }"
        >
          <span v-if="step.progressPercent === 100">✔</span>
          <span v-else>{{ index + 1 }}</span>
        </div>

        <!-- 선 -->
        <div v-if="index < progressData.progressArr.length - 1" class="lineGuasge">
          <div
              class="line-fill"
              :style="{
              width: step.progressPercent + '%',
              transition: 'width 0.5s ease',
            }"
          ></div>
        </div>
        <div class="newProgressNm">
          {{ step.progressName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, watch, onMounted, defineProps} from 'vue';

// Props 정의
const props = defineProps(['parsedData']);

// 내부 상태: parsedData를 복사하여 관리
const progressData = reactive({
  progressBarText: '',
  progressBarPercent: 0,
  progressArr: [],
});

// Props의 parsedData 변경 감지 및 progressData 업데이트
watch(
    () => props.parsedData,
    (newData) => {
      if (newData) {
        progressData.progressBarText = newData.progressBarText || '';
        progressData.progressBarPercent = newData.progressBarPercent || 0;
        progressData.progressArr = (newData.progressArr || []).map((step) => ({
          progressNo: step.progressNo,
          progressName: step.progressName,
          progressPercent: step.progressPercent,
        }));
      }
    },
    {immediate: true}
);

// 테스트용 데이터 생성 함수
const startFakeDataTest = () => {
  let fakePercent = 0;
  const interval = setInterval(() => {
    if (fakePercent > 100) {
      clearInterval(interval); // 100%에 도달하면 테스트 종료
    } else {
      // progressData 값 업데이트
      progressData.progressBarText = `테스트 진행 중 (${fakePercent}%)`;
      progressData.progressBarPercent = fakePercent;

      // 단계별 진행도 계산
      progressData.progressArr.forEach((step, index) => {
        const stepStart = index * 33.33; // 각 단계는 33.33%씩 차지
        const stepEnd = (index + 1) * 33.33;

        if (fakePercent >= stepEnd) {
          step.progressPercent = 100; // 단계 완료
        } else if (fakePercent > stepStart) {
          step.progressPercent = ((fakePercent - stepStart) / (stepEnd - stepStart)) * 100;
        } else {
          step.progressPercent = 0;
        }
      });

      fakePercent += 5; // 5%씩 증가
    }
  }, 500); // 0.5초 간격으로 업데이트
};

// 컴포넌트가 마운트되면 테스트 모드 실행 (옵션)
onMounted(() => {
  if (progressData.progressArr.length === 0) {
    progressData.progressArr = [
      {progressNo: 1, progressName: "Step 1", progressPercent: 0},
      {progressNo: 2, progressName: "Step 2", progressPercent: 0},
      {progressNo: 3, progressName: "Step 3", progressPercent: 0},
    ];
  }
  startFakeDataTest();
});

</script>

<style scoped>
.newProgressNm {
  font-size: 0.8rem;
  position: absolute;
  left: 5px;
  top: 50px;
}

/* 전체 프로그레스바 */
.progress-bar-guage {
  width: 100%;
  max-width: 600px;
  margin: 30px 0px 15px 25px;
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
  background-color: #2e2e2e;
  color: white;
  border-color: #00c2ff;
}

.circleGuage.active {
  background-color: #ffffff;
  color: black;
  border-color: #00c2ff;
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
  background-color: #00c2ff;
  transition: width 0.5s ease;
}
</style>
