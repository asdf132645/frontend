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
import { Chart, BarController, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from "chart.js";

// Chart.js 구성 요소 등록
Chart.register(BarController, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const props = defineProps(['autoNomarlCheck']);

onMounted(() => {
  // 데이터 설정
  const labels = props.autoNomarlCheck.map(item => item.classNm);
  const normalRangeData = props.autoNomarlCheck.map(item => ({
    x: item.classNm,
    y: [item.normalRangeFirst, item.normalRangeLast] // Floating Bars 범위 설정
  }));
  const dataValues = props.autoNomarlCheck.map(item => item.value);

  const data = {
    labels: labels,
    datasets: [
      {
        label: '정상 범위',
        data: normalRangeData,
        backgroundColor: '#ff5700',
        borderColor: 'rgba(102, 187, 106, 1)',
        borderWidth: 1,
        barThickness: 30, // 막대 두께 설정
      },
      {
        label: '측정 값',
        data: dataValues,
        type: 'line',
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderWidth: 0,
        pointRadius: 3, // 데이터 포인트 크기
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  // 차트 설정 객체
  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
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
  };

  // 차트 생성
  new Chart(document.getElementById('abnormalChart') as HTMLCanvasElement, config);
});
</script>
