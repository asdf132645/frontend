<template>
  <ul class="">
    <p>Partical Image</p>
    <li v-for="(image, index) in paImages" :key="index">
      <img :src="getPaImageUrl(image)" alt="Partical Image">
    </li>
  </ul>
  <ul class="">
    <p>Partical Image</p>
    <li v-for="(image, index) in paImages" :key="index">
      <img :src="getPaImageUrl(image)">
    </li>
  </ul>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {useStore} from "vuex";
import axios from "axios";

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const store = useStore();
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';
const paImages = ref([]);



onMounted(() => {
  getImgUrl();
})


const getPaImageUrl = (imageName: string) => {
  const slotId = selectItems.value?.slotId || "";
  console.log(sessionStorage.getItem('pbiaRootPath'))
  const folderPath = `${sessionStorage.getItem('pbiaRootPath')}/${slotId}/03_Cell_Ideal_Image`;
  return `${apiBaseUrl}/folders?folderPath=${folderPath}/${imageName}`;
};

const getImgUrl = () => {
  const slotId = selectItems.value?.slotId || "";
  console.log(sessionStorage.getItem('pbiaRootPath'))
  axios.get(`${apiBaseUrl}/folders?folderPath=${sessionStorage.getItem('pbiaRootPath')}/${slotId}/03_Cell_Ideal_Image`)
      .then(response => {
        // 서버에서 받은 응답을 처리합니다.
        paImages.value = response.data;
      })
      .catch(error => {
        // 오류 처리
        console.error('Error:', error.response.data);
      });

}

</script>
