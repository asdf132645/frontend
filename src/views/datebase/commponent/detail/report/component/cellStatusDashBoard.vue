<template>
  <div>
    <canvas id="abnormalChart" width="400" height="200" class="abnormalChart"></canvas>

    <!-- 비정상 항목 리스트 -->
    <ul style="list-style: none; padding: 0;">
      <li v-for="(item, idx) in autoNomarlCheck" :key="idx" class="normalCheckList">
        <span style="font-weight: bold; color: #e63946;">{{ item.classNm }}</span> 값이 비정상입니다:
        <span style="color: #e76f51;">{{ item.value }}</span>
        <small style="color: #6c757d;">(정상 범위: {{ item.normalRangeFirst }} - {{ item.normalRangeLast }})</small>
      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted } from "vue";
import { Chart, BarController, LineController, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

// Chart.js 구성 요소 등록
Chart.register(BarController, LineController, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps(['autoNomarlCheck']);

onMounted(() => {
  // 그래프 데이터 설정
  const labels = props.autoNomarlCheck.map(item => item.classNm);
  const dataValues = props.autoNomarlCheck.map(item => item.value);
  const normalRanges = props.autoNomarlCheck.map(item => item.normalRangeLast);
  const normalRangeFirst = props.autoNomarlCheck.map(item => item.normalRangeFirst);

  const data = {
    labels: labels,
    datasets: [
      {
        label: '측정 값',
        data: dataValues,
        backgroundColor: 'rgba(233, 83, 83, 0.6)',
        borderColor: 'rgba(233, 83, 83, 1)',
        borderWidth: 1,
        borderRadius: 5, // 막대 끝부분 둥글게
        barThickness: 30, // 막대 두께
      },
      {
        label: '정상 범위 최대값',
        data: normalRanges,
        type: 'line',
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        tension: 0.3, // 선 부드럽게
        pointRadius: 5, // 데이터 포인트 크기
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      },
      {
        label: '정상 범위 최소값',
        data: normalRangeFirst,
        type: 'line',
        borderColor: 'rgb(230, 57, 70)',
        backgroundColor: 'rgb(231, 111, 81)',
        borderWidth: 2,
        tension: 0.3, // 선 부드럽게
        pointRadius: 5, // 데이터 포인트 크기
        pointBackgroundColor: 'rgb(231, 111, 81)',
      },
    ],
  };

  // 차트 생성
  new Chart(document.getElementById('abnormalChart') as HTMLCanvasElement, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 14,
            },
            color: '#333',
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false, // x축 그리드 숨기기
          },
          ticks: {
            color: '#333',
            font: {
              size: 12,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(200, 200, 200, 0.3)', // y축 그리드 투명도 조절
            borderDash: [5, 5], // 점선 스타일
          },
          ticks: {
            color: '#333',
            font: {
              size: 12,
            },
          },
        },
      },
    },
  });
});
</script>
