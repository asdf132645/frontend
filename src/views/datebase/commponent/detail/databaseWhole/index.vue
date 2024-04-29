<template>
  <ClassInfoMenu @refreshClass="refreshClass"/>
  <div class="imgContent">
    <div class="wrap-whole">
    <div ref="imageContainer" class="image-container" >
      <TilingViewer :selectItems="selectItems"/>
    </div>
    <div class="leftWhole">
      <LeftImgList :selectItems="selectItems"/>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, onMounted, getCurrentInstance} from "vue";
import LeftImgList from "@/views/datebase/commponent/detail/databaseWhole/leftImgList.vue";
import TilingViewer from './tilingViewer.vue';
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);


const imgRef = ref<HTMLElement | null>(null);
const imageContainer = ref<HTMLElement | null>(null);
onMounted(() => {
  imgRef.value = document.querySelector('.img'); // Assign imgRef ref
});

const refreshClass = async (data: any) => {
  selectItems.value = data;
}


</script>

<style scoped>
.resize-overlay {
  position: absolute;
  border: 2px solid red;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: black;
}

.top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

</style>
