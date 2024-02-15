<template>
  <div class="layer">
    <div class="layer-content">
      <div class="layer-header">
        <slot name="header"></slot>
        <button @click="closeLayer">Close</button>
      </div>
      <div class="layer-body">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const visible = ref(false);
const emit = defineEmits(['update:closeLayer']);
const openLayer = () => {
  visible.value = true;
};

const closeLayer = () => {
  visible.value = false;
  emit('update:closeLayer', false);
};
</script>

<style scoped>
.layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.layer-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.layer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

</style>
