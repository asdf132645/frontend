<template>
  <div class="execute">
    <div class='startDiv'>
      <select v-model="analysisType">
        <option v-for="option in analysisOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <p class="startStopP" v-if="!showStopBtn">
        <font-awesome-icon :icon="['fas', 'circle-play']" class='startBtn' @click="toggleStartStop('start')"/>
      </p>
      <p class="startStopP" v-else>
        <font-awesome-icon :icon="['fas', 'circle-stop']" class='stopBtn' @click="toggleStartStop('stop')"/>
      </p>
    </div>

    <div class="stopDiv">
      <select v-model="wbcCount">
        <option v-for="option in wbcCountOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <select v-model="stitchCount">
        <option v-for="option in stitchCountOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
      </select>
      <div class="initBtn">
        <font-awesome-icon :icon="['fas', 'rotate-right']" style="font-size: 0.9rem;"/>
        <span> INITIALIZING</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import { useStore } from "vuex";
import {analysisOptions, wbcCountOptions, stitchCountOptions} from '@/common/defines/constFile/analysis';
const store = useStore();

const analysisType = ref(store.state.executeModule.analysisType);
const wbcCount = ref(store.state.executeModule.wbcDiffVal);
const stitchCount = ref(store.state.executeModule.stitchCount);

const showStopBtn = ref(false);

const toggleStartStop = (action: 'start' | 'stop') => {
  if (action === 'start') {
    showStopBtn.value = true;
  } else {
    showStopBtn.value = false;
  }
};



</script>
