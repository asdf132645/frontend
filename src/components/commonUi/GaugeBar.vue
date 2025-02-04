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
              :style="{
              background: `conic-gradient(#00c2ff ${step.progressPercent}%, #e0e0e0 ${step.progressPercent}% 100%)`
            }"
              :class="{
              completedStep: step.progressPercent === 100,
              active: step.progressPercent > 0 && step.progressPercent < 100,
              waitingStep: step.progressPercent === 0 && index > activeStepIndex,
              notStart: step.progressPercent === 0,
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
      <font-awesome-icon :icon="['fas', 'caret-left']"/>
    </button>
    <button
        class="gbArrowButton right"
        @click="moveStep('next')"
        :disabled="activeStepIndex === progressData.progressArr.length - 1"
    >
      <font-awesome-icon :icon="['fas', 'caret-right']"/>
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
import {reactive, watch, onMounted, defineProps, ref, onBeforeMount} from "vue";

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
const activeStepIndexPrev = ref(0);
const stepWidth = 80; // 각 Step의 넓이(px)
const viewerType = ref('');

// Props의 parsedData 변경 감지 및 progressData 업데이트
watch(
    () => props.parsedDataSysInfo,
    (newData) => {
      if (!newData || !newData.progressArr) return;



      // 새로운 데이터의 progress 배열
      const newProgressList = newData.progressArr || [];
      const validProgressList = newProgressList.filter((item: any) => item.progressName.trim() !== "");
      if(progressData.progressArr.length !== 0){
        if(newProgressList[0]?.progressName !== progressData.progressArr[0].progressName){
          progressData.progressArr = [];
        }
      }


      // 기존 데이터의 progressNo 리스트
      const existingProgressNos = progressData.progressArr.map((item: any) => item.progressNo);

      // 변경이 필요한 데이터만 필터링
      const updatedSteps = validProgressList.filter((newStep: any) => {
        const existingStep = progressData.progressArr.find(
            (step: any) => step.progressNo === newStep.progressNo
        );
        return (
            !existingStep ||
            existingStep.progressName !== newStep.progressName ||
            existingStep.progressPercent !== newStep.progressPercent
        );
      });


      // 기존 progressData.progressArr 업데이트
      updatedSteps.forEach((newStep: any) => {
        const existingIndex = progressData.progressArr.findIndex(
            (step: any) => step.progressNo === newStep.progressNo
        );

        if (existingIndex !== -1) {
          progressData.progressArr[existingIndex] = {...progressData.progressArr[existingIndex], ...newStep};
        } else {
          progressData.progressArr.push(newStep);
        }
      });

      // 정렬
      progressData.progressArr.sort((a: any, b: any) => a.progressNo - b.progressNo);
      // const pbpNum = Number(newData?.progressBarPercent);
      // if (pbpNum === 100 || pbpNum === 0) {
      //   return;
      // }

      // 진행 중인 단계 찾기
      const inProgressIndex = progressData.progressArr.findLastIndex(
          (step: any) => step.progressPercent < 100 && step.progressPercent > 0
      );
      const inPIdx = inProgressIndex;

      if(activeStepIndexPrev.value === inPIdx){
        return;
      }
      if (inProgressIndex !== -1) {
          activeStepIndex.value = inPIdx;
          activeStepIndexPrev.value = inPIdx;
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
      {progressNo: 1, progressName: "Initialize Axis1", progressPercent: 0},
      {progressNo: 2, progressName: "Unload Slide", progressPercent: 0},
      {progressNo: 3, progressName: "Unload Cassette", progressPercent: 0},
      {progressNo: 4, progressName: "Initialize Module", progressPercent: 0},
      {progressNo: 5, progressName: "Initialize Axis2", progressPercent: 0},
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

onBeforeMount(() => {
  viewerType.value = window.FORCE_VIEWER;
})

onMounted(() => {
  if (viewerType.value === 'exhibition') {
    // if (progressData.progressArr.length === 0) {
    //   progressData.progressArr.push(
    //       {progressNo: 1, progressName: "Initialize Axis1", progressPercent: 0},
    //       {progressNo: 2, progressName: "Unload Slide", progressPercent: 0},
    //       {progressNo: 3, progressName: "Unload Cassette", progressPercent: 0},
    //       {progressNo: 4, progressName: "Initialize Module", progressPercent: 0},
    //       {progressNo: 5, progressName: "Initialize Axis2", progressPercent: 0},
    //   );
    // }
    startFakeDataTest();
  }
});
</script>