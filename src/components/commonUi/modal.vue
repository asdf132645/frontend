<!-- 자식 모달 컴포넌트 -->
<template>
  <div class="layer">
    <div class="layer-content oil" :style="width ? `width: ${width}px; max-width: none;` : ''">
      <div class="layer-header">
        <slot name="header"></slot>
        <Button
            @click="closeLayer"
            :icon="['fas', 'xmark']"
            size="sm"
        ></Button>
      </div>
      <div class="layer-body">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import Button from "@/components/commonUi/Button.vue";

const visible = ref(false);
const props = defineProps(['width'])
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