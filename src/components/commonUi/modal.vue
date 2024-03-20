<!-- 자식 모달 컴포넌트 -->
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
import { ref, onMounted, defineEmits } from 'vue';

const visible = ref(false);
const emit = defineEmits(['update:closeLayer']);
const openLayer = () => {
  visible.value = true;
};

const closeLayer = () => {
  visible.value = false;
  emit('update:closeLayer', false);
};

onMounted(() => {
  emit('afterOpen'); // 모달이 열린 후에 이벤트를 부모 컴포넌트로 전달
});
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
  text-align: left;
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
  font-size: 1.2rem;
  font-weight: 600;
  border-bottom: 1px solid #dedede;
  padding-bottom: 15px;
  color: #4f4f4f;
}
</style>
