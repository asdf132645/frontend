<template>
  <div class="execute">
    <div class='startDiv'>
      <select>
        <option>WBC Diff(standard)</option>
      </select>
      <p class="startStopP">
        <font-awesome-icon :icon="['fas', 'circle-play']" class='startBtn'/>
      </p>
      <p class="startStopP">
        <font-awesome-icon :icon="['fas', 'circle-stop']" class='stopBtn' />
      </p>
    </div>

    <div class="stopDiv">
      <select>
        <option>100 WBC</option>
      </select>
      <select>
        <option>1 stitch</option>
      </select>
      <div class="initBtn">
        <font-awesome-icon :icon="['fas', 'rotate-right']" style="font-size: 0.9rem;"/>
        <span> INITIALLiZING</span>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">

</script>
