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
import {computed, ref, onMounted, onBeforeMount} from "vue";
import LeftImgList from "@/views/datebase/commponent/detail/databaseWhole/leftImgList.vue";
import TilingViewer from './tilingViewer.vue';
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import {useStore} from "vuex";
import {detailRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";

const store = useStore()
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const selectItems = ref(null);


const imgRef = ref<HTMLElement | null>(null);
const imageContainer = ref<HTMLElement | null>(null);

onBeforeMount(async () => {
  await getDetailRunningInfo()
})

onMounted(() => {
  imgRef.value = document.querySelector('.img'); // Assign imgRef ref
});

const getDetailRunningInfo = async () => {
  try {
    const result = await detailRunningApi(String(selectedSampleId.value));
    selectItems.value = result.data;
  } catch (e) {
    console.log(e);
    selectItems.value = null;
  }
}

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
