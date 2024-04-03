<template>
  <div>
      <div>
        <img :src="getImageUrl()">
      </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {useStore} from "vuex";

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const store = useStore();
const pbiaRootPath = computed(() => store.state.commonModule.pbiaRootPath);
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';

function getImageUrl(): string {
  // 이미지 정보가 없다면 빈 문자열 반환

  const slotId = selectItems.value.slotId || "";
  const folderPath = `${pbiaRootPath.value}/${slotId}/01_Stitching_Image`;
  return `${apiBaseUrl}/images?folder=${folderPath}&imageName=PMC_Result.jpg`;

}

</script>
