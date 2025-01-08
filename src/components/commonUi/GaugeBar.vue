<template>
  <div class="progress-bar-guage">
    <div class="steps-container">
      <div
          class="steps"
          :style="{
          transform: `translateX(calc(-${activeStepIndex * stepWidth}px + 50% - ${stepWidth / 2}px))`
        }"
      >
        <div
            v-for="(step, index) in progressData.progressArr"
            :key="index"
            class="step-container"
        >
          <!-- 동그라미 -->
          <div
              class="circleGuage"
              :class="{
              completedStep: step.progressPercent === 100,
              active: step.progressPercent > 0 && step.progressPercent < 100,
              waitingStep: step.progressPercent === 0 && index > activeStepIndex,
            }"
          >
            <div class="circleChild">
              <span v-if="step.progressPercent === 100">✔</span>
              <span v-else>{{ step.progressNo }}</span>
            </div>
          </div>
          <div class="newProgressNm">
            {{ step.progressName }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="arrow-buttons" v-if="progressData.progressArr.length !== 0">
    <button
        class="gbArrowButton left"
        @click="moveStep('prev')"
        :disabled="activeStepIndex === 0"
    >
      <font-awesome-icon :icon="['fas', 'caret-left']" />
    </button>
    <button
        class="gbArrowButton right"
        @click="moveStep('next')"
        :disabled="activeStepIndex === progressData.progressArr.length - 1"
    >
      <font-awesome-icon :icon="['fas', 'caret-right']" />
    </button>
  </div>
  <div class="bottomDot">
    <font-awesome-icon
        :icon="['fas', idx === activeStepIndex ? 'circle' : 'circle']"
        v-for="(item, idx) in progressData.progressArr"
        :key="idx"
        @click="setStep(idx)"
        class="dot"
        :class="{ active: idx === activeStepIndex }"
    />
  </div>
</template>

<script setup lang="ts">
import {reactive, watch, onMounted, defineProps, ref} from "vue";

// Props 정의
const props = defineProps(["parsedDataSysInfo"]);

// 내부 상태: parsedData를 복사하여 관리
const progressData: any = reactive({
  progressBarText: "",
  progressBarPercent: 0,
  progressArr: [],
});

// 활성화된 단계 및 스크롤 상태
const activeStepIndex = ref(0);
const stepWidth = 80; // 각 Step의 넓이(px)

// Props의 parsedData 변경 감지 및 progressData 업데이트
watch(
    () => props.parsedDataSysInfo,
    (newData) => {
      if (newData) {
        const newArr = newData.progressArr || [];
        console.log(JSON.stringify(newArr))
        const validArr = newArr.filter((step: any) => step.progressName.trim() !== "");

        const existingNos = progressData.progressArr.map((step: any) => step.progressNo);

        const sameDataArr = newData?.progressArr?.filter((el: any) => el.progressName !== '') || [];
        const sameDataArrNo = sameDataArr[0]?.progressNo;

        const newArr2 = progressData?.progressArr?.filter((el: any) => el.progressNo >= sameDataArrNo) || [];
        const newNos = validArr.map((step: any) => step.progressNo);

        const isSame = JSON.stringify(sameDataArr) === JSON.stringify(newArr2);
        if (isSame) {
          console.log('same')
          return;
        }

        if (newNos.map((no) => !existingNos.includes(no))) {
          progressData.progressArr.forEach((step: any) => {
            if (step.progressNo === 0 || step.progressName === '') {
              return;
            }
            if (existingNos.includes(step.progressNo)) {
              step.progressPercent = 100;
            }
          });
        }

        validArr.forEach((step: any) => {
          if (step.progressNo === 0 || step.progressName === '') {
            return;
          }
          const existingStepIndex = progressData.progressArr.findIndex(
              (existing: any) => existing.progressNo === step.progressNo
          );

          if (existingStepIndex !== -1) {
            progressData.progressArr[existingStepIndex].progressName = step.progressName;
            progressData.progressArr[existingStepIndex].progressPercent = step.progressPercent;
          } else {
            progressData.progressArr.push({
              progressNo: step.progressNo,
              progressName: step.progressName,
              progressPercent: step.progressPercent,
            });
          }
        });

        progressData.progressArr.sort((a: any, b: any) => a.progressNo - b.progressNo);

        const inProgressIndex = progressData.progressArr.findIndex(
            (step: any) => step.progressPercent > 0 && step.progressPercent < 100
        );

        const inProgressNum = progressData.progressArr.find(
            (step: any) => step.progressPercent > 0 && step.progressPercent < 100
        );
        if (inProgressNum?.progressNo === (inProgressIndex + 1)) {
          return;
        }

        if (inProgressIndex !== -1) {
          activeStepIndex.value = inProgressIndex;
        } else {
          activeStepIndex.value = progressData.progressArr.length - 1;
        }
      }
    },
    {immediate: true, deep: true}
);

// Step 이동 함수
const moveStep = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && activeStepIndex.value > 0) {
    activeStepIndex.value--;
  } else if (direction === 'next' && activeStepIndex.value < progressData.progressArr.length - 1) {
    activeStepIndex.value++;
  }
};
const setStep = (stepIndex: number) => {
  if (stepIndex >= 0 && stepIndex < progressData.progressArr.length) {
    activeStepIndex.value = stepIndex;
  }
};

// 테스트용 데이터 생성 함수
const startFakeDataTest = () => {
  progressData.progressArr = [];
  progressData.progressArr.push(
      {progressNo: 1, progressName: "Step 1", progressPercent: 0},
      {progressNo: 2, progressName: "Step 2", progressPercent: 0},
      {progressNo: 3, progressName: "Step 3", progressPercent: 0},
      {progressNo: 4, progressName: "Step 4", progressPercent: 0},
      {progressNo: 5, progressName: "Step 5", progressPercent: 0}
  );

  let fakePercent = 0;
  const interval = setInterval(() => {
    if (fakePercent > 100) {
      clearInterval(interval);
    } else {
      progressData.progressBarText = `테스트 진행 중 (${fakePercent}%)`;
      progressData.progressBarPercent = fakePercent;

      progressData.progressArr.forEach((step: any, index: any) => {
        const stepStart = index * 33.33;
        const stepEnd = (index + 1) * 33.33;

        if (fakePercent >= stepEnd) {
          step.progressPercent = 100;
          activeStepIndex.value = Math.min(index + 1, progressData.progressArr.length - 1);
        } else if (fakePercent > stepStart) {
          step.progressPercent = ((fakePercent - stepStart) / (stepEnd - stepStart)) * 100;
          activeStepIndex.value = index;
        } else {
          step.progressPercent = 0;
        }
      });

      fakePercent += 5;
    }
  }, 500);
};

onMounted(() => {
  // if (progressData.progressArr.length === 0) {
  //   progressData.progressArr.push(
  //       {progressNo: 1, progressName: "Step 1", progressPercent: 0},
  //       {progressNo: 2, progressName: "Step 2", progressPercent: 0},
  //       {progressNo: 3, progressName: "Step 3", progressPercent: 0},
  //       {progressNo: 1, progressName: "Step 1", progressPercent: 0},
  //       {progressNo: 2, progressName: "Step 2", progressPercent: 0},
  //   );
  // }
  // startFakeDataTest();
});
</script>