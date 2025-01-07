<template>
  <div class="progress-bar-guage">
    <div
        class="steps-container"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
    >
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
let isDragging = false;
let dragStartX = 0;
let dragDeltaX = 0;
const stepWidth = 80; // 각 Step의 넓이(px)
const dragSpeed = 0.3; // 드래그 속도 조절 (0.1 ~ 1.0 사이)

// Props의 parsedData 변경 감지 및 progressData 업데이트
watch(
    () => props.parsedDataSysInfo,
    (newData) => {
      if (newData) {

        const newArr = newData.progressArr || [];
        // console.log(JSON.stringify(newArr));

        // 유효한 데이터 필터링 (progressName이 빈 값이 아닌 경우만)
        const validArr = newArr.filter((step: any) => step.progressName.trim() !== "");

        // 기존 progressNo와 새로운 progressNo 비교
        const existingNos = progressData.progressArr.map((step: any) => step.progressNo);

        // `newData.progressArr`가 undefined가 아닐 때만 필터링을 수행
        const sameDataArr = newData?.progressArr?.filter((el: any) => el.progressName !== '') || [];
        const sameDataArrNo = sameDataArr[0]?.progressNo;

        // `progressData.progressArr`가 undefined가 아닐 때만 필터링을 수행
        const newArr2 = progressData?.progressArr?.filter((el: any) => el.progressNo >= sameDataArrNo) || [];
        const newNos = validArr.map((step: any) => step.progressNo);

        console.log(sameDataArr);
        console.log(validArr);

        // 직전에 들어온 배열과 새로운 배열이 동일한지 비교
        const isSame = JSON.stringify(sameDataArr) === JSON.stringify(newArr2);
        if (isSame) {
          return; // 동일하면 더 이상 진행하지 않음
        }

        // 새로운 progressNo가 들어오면 이전 데이터 완료 처리
        if (newNos.map((no) => !existingNos.includes(no))) {
          progressData.progressArr.forEach((step: any) => {
            if (step.progressNo === 0 || step.progressName === '') {
              return;
            }
            if (existingNos.includes(step.progressNo)) {
              step.progressPercent = 100; // 이전 단계 완료 처리
            }
          });
        }

        // 새 데이터 병합 및 업데이트
        validArr.forEach((step: any) => {
          if (step.progressNo === 0 || step.progressName === '') {
            return;
          }
          const existingStepIndex = progressData.progressArr.findIndex(
              (existing: any) => existing.progressNo === step.progressNo
          );

          if (existingStepIndex !== -1) {
            // 이미 있는 데이터 업데이트
            progressData.progressArr[existingStepIndex].progressName = step.progressName;
            progressData.progressArr[existingStepIndex].progressPercent = step.progressPercent;
          } else {
            // 없는 데이터 Push
            progressData.progressArr.push({
              progressNo: step.progressNo,
              progressName: step.progressName,
              progressPercent: step.progressPercent,
            });
          }
        });

        // progressArr 정렬 (progressNo 기준)
        progressData.progressArr.sort((a: any, b: any) => a.progressNo - b.progressNo);

        // 새 데이터 중 진행 중인 단계 찾기
        const inProgressIndex = progressData.progressArr.findIndex(
            (step: any) => step.progressPercent > 0 && step.progressPercent < 100
        );

        // 진행 중인 단계가 있으면 활성화
        if (inProgressIndex !== -1) {
          activeStepIndex.value = inProgressIndex;
        } else {
          // 진행 중인 단계가 없으면 마지막 단계로 이동
          activeStepIndex.value = progressData.progressArr.length - 1;
        }
      }
    },
    {immediate: true, deep: true}
);


// 드래그 이벤트
const startDrag = (event: MouseEvent) => {
  isDragging = true;
  dragStartX = event.clientX;
  dragDeltaX = 0;

  // 드래그 시 애니메이션 제거
  const container = document.querySelector(".steps");
  if (container) {
    container.style.transition = "none"; // 드래그 시 애니메이션 없애기
  }
};

const onDrag = (event: MouseEvent) => {
  if (!isDragging) return;

  // 드래그 이동량을 속도 조절 값으로 제한
  dragDeltaX = (event.clientX - dragStartX) * dragSpeed;

  const newIndex =
      activeStepIndex.value -
      Math.round(dragDeltaX / stepWidth); // 드래그된 거리로 새 인덱스 계산

  activeStepIndex.value = Math.max(
      0,
      Math.min(progressData.progressArr.length - 1, newIndex)
  );
};

const endDrag = () => {
  isDragging = false;
  dragDeltaX = 0;

  // 드래그 종료 시 스냅 효과
  const container = document.querySelector(".steps");
  if (container) {
    container.style.transition = "transform 1.5s cubic-bezier(0.25, 0.8, 0.5, 1)"; // 부드러운 애니메이션 추가
  }
};

// 테스트용 데이터 생성 함수
const startFakeDataTest = () => {
  // 데이터 초기화
  progressData.progressArr = [];

  // 임시 테스트 데이터 Push
  progressData.progressArr.push(
      {progressNo: 1, progressName: "Step 1", progressPercent: 0},
      {progressNo: 2, progressName: "Step 2", progressPercent: 0},
      {progressNo: 3, progressName: "Step 3", progressPercent: 0},
      {progressNo: 4, progressName: "Step 4", progressPercent: 0},
      {progressNo: 5, progressName: "Step 5", progressPercent: 0},
  );

  let fakePercent = 0;
  const interval = setInterval(() => {
    if (fakePercent > 100) {
      clearInterval(interval); // 100%에 도달하면 테스트 종료
    } else {
      progressData.progressBarText = `테스트 진행 중 (${fakePercent}%)`;
      progressData.progressBarPercent = fakePercent;

      progressData.progressArr.forEach((step: any, index: any) => {
        const stepStart = index * 33.33;
        const stepEnd = (index + 1) * 33.33;

        if (fakePercent >= stepEnd) {
          step.progressPercent = 100;
          activeStepIndex.value = Math.min(
              index + 1,
              progressData.progressArr.length - 1
          );
        } else if (fakePercent > stepStart) {
          step.progressPercent =
              ((fakePercent - stepStart) / (stepEnd - stepStart)) * 100;
          activeStepIndex.value = index;
        } else {
          step.progressPercent = 0;
        }
      });

      fakePercent += 5;
    }
  }, 500);
};

// 컴포넌트가 마운트되면 테스트 모드 실행
onMounted(() => {
  if (progressData.progressArr.length === 0) {
    progressData.progressArr.push(
        {progressNo: 1, progressName: "Step 1", progressPercent: 0},
        {progressNo: 2, progressName: "Step 2", progressPercent: 0},
        {progressNo: 3, progressName: "Step 3", progressPercent: 0},
    );
  }
  startFakeDataTest();
});
</script>


