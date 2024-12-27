<template>
  <ClassInfoMenu @refreshClass="refreshClass"/>
  <div class="imgContent">
    <div class="wrap-whole">
    <div ref="imageContainer" class="image-container" >
      <TilingViewer v-if="!isLoading" :selectItems="selectItems"/>
    </div>
    <div class="leftWhole">
      <LeftImgList v-if="!isLoading" :selectItems="selectItems"/>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeMount } from "vue";
import LeftImgList from "@/views/datebase/commponent/detail/databaseWhole/leftImgList.vue";
import TilingViewer from './tilingViewer.vue';
import ClassInfoMenu from "@/views/datebase/commponent/detail/classInfoMenu.vue";
import { useStore } from "vuex";

const store = useStore();
const slideData = computed(() => store.state.slideDataModule);

const selectItems = ref<any>(null);
const isLoading = ref(false);

const imgRef = ref<HTMLElement | null>(null);
const imageContainer = ref<HTMLElement | null>(null);

onBeforeMount(async () => {
  await getDetailRunningInfo()
})

onMounted(async () => {
  imgRef.value = document.querySelector('.img'); // Assign imgRef ref
});

const getDetailRunningInfo = async () => {

  try {
    isLoading.value = true;
    selectItems.value = slideData.value;
    isLoading.value = false;
  } catch (e) {
    console.error(e);
    selectItems.value = [];
    isLoading.value = false;
  }
}

const refreshClass = async (data: any) => {
  selectItems.value = data;
}


</script>

