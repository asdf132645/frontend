<template>
  <div class="wbcClassScroll">
    <div
        v-for="(item, idx) in wbcInfoChangeVal"
        :key="item.id"
        class="wbcClassDbDiv"
        draggable="true"
        @dragstart="startDrag(idx, $event)"
        @dragover.prevent
        @drop="drop(idx, $event)"
    >
      <ul class="nth1Child" v-if="idx === 0">
        <li>Class</li>
        <li>Count</li>
        <li>%</li>
      </ul>
      <ul class="nth1Child">
        <li>{{ item?.name }}</li>
        <li>{{ item?.count }}</li>
        <li> {{ item?.percent || '-' }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">

import {ref} from "vue";

const wbcInfoChangeVal = ref<any>([]);

const dragIndex = ref(-1);
const dragOffsetY = ref(0);
const startDrag = (index: any, event: any) => {
  dragIndex.value = index;
  dragOffsetY.value = event.clientY - event.target.getBoundingClientRect().top;
};

const drop = (index: any, event: any) => {
  event.preventDefault();
  if (dragIndex.value !== -1) {
    const movedItem = wbcInfoChangeVal.value.splice(dragIndex.value, 1)[0];
    wbcInfoChangeVal.value.splice(index, 0, movedItem);
    dragIndex.value = -1;
    // updateOriginalDb();
  }
};
</script>
