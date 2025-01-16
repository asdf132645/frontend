<template>
  <div>
    <p>
      [PURPOSE OF PBS]
    </p>
    <p>
      [RED BLOOD CELLS]
    </p>
    <div>
      {{ data?.crcContent?.rbc }}
    </div>

    <p>
      [WHITE BLOOD CELLS]
    </p>
    <div>
      {{ data?.crcContent?.wbc }}
    </div>

    <p>
      [PLATELETS]
    </p>
    <div>
      {{ data?.crcContent?.plt }}
    </div>

    <p>
      [SUMMARY OF FINDINGS]
    </p>
    <div>
      {{ data?.crcRemark[0] }}
    </div>

    <p>
      [OPINION & RECOMMENDATION]
    </p>
    <div>
      {{ data?.crcRecommendation[0]}}
    </div>

  </div>
</template>
<script setup lang="ts">
import {defineProps, nextTick, onMounted, ref} from "vue";
// import { htmlToRtf } from 'html-to-rtf';
const data = ref([]);
const props = defineProps(['nowCrcDataLis']);
onMounted(() => {
  nextTick();
  data.value = props.nowCrcDataLis;
})
</script>