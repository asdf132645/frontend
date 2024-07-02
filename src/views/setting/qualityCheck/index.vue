<template>
  <div>
    <ul class="customSettingContainer">
      <li class="mt2">
        <p class="mb1">QualityCheck</p>
        <button type="button" class="defaultBtn" @click="qualityCheckOpen">Ok</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">

import {qualityCheck} from "@/common/api/service/setting/settingApi";

const qualityCheckOpen = async () => {
  await qualityCheck();
}

</script>
