<template>
  <div class="leftImgList">
    <ul class="">
      <p>Partical Image</p>
      <li v-for="(image, index) in paImages" :key="index">
        <img :src="getImageUrls(image, 'particle')" alt="Partical Image" >
      </li>
    </ul>
    <ul class="">
      <p>Ideal Zone</p>
      <li v-for="(image, index) in idealZoneImages" :key="index" style="width:100px">
        <img :src="getImageUrls(image, 'idealZone')">
      </li>
    </ul>
    <ul class="">
      <div>
        <p>Ideal stitch</p>
        <li v-for="(image, index) in idealStitchImages" :key="index">
          <img :src="getImageUrls(image, 'idealStitch')">
        </li>
      </div>
      <div>
        <p>Megakaryocyte</p>
        <li v-for="(image, index) in megaImages" :key="index">
          <img :src="getImageUrls(image, 'mega')">
        </li>
      </div>
    </ul>
  </div>
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
const idealZoneImages = ref([]);
const idealStitchImages = ref([]);
const megaImages = ref([]);
const strArray = ['02_Particle_Image','03_Cell_Ideal_Image', '04_Cell_Ideal_Stitch_Image', '05_Mega_Image'];


onMounted(() => {
  getImgUrl();
})


const getImageUrls = (imageName: string, type: string) => {
  let folderName;
  switch (type) {
    case 'particle':
      folderName = '02_Particle_Image'
      break;
    case 'idealZone':
      folderName = '03_Cell_Ideal_Image'
      break;
    case 'idealStitch':
      folderName = '04_Cell_Ideal_Stitch_Image'
      break;
    case 'mega':
      folderName = '05_Mega_Image'
      break;
    default:
      break;
  }
  const slotId = selectItems.value?.slotId || "";
  const folderPath = `${sessionStorage.getItem('pbiaRootPath')}/${slotId}/${folderName}`;

  return `${apiBaseUrl}/folders?folderPath=${folderPath}/${imageName}`;
};

const getImgUrl = () => {
  const slotId = selectItems.value?.slotId || "";

  for (const item of strArray) {
    axios.get(`${apiBaseUrl}/folders?folderPath=${sessionStorage.getItem('pbiaRootPath')}/${slotId}/${item}`)
      .then(response => {
        switch (item) {
          case '02_Particle_Image':
            paImages.value = response.data.filter((resp: any) => resp !== 'Thumb');
            break;
          case '03_Cell_Ideal_Image':
            idealZoneImages.value = response.data.filter((resp: any) => resp !== 'Thumb');
            break;
          case '04_Cell_Ideal_Stitch_Image':
            idealStitchImages.value = response.data.filter((resp: any) => resp !== 'Thumb');
            break;
          case '05_Mega_Image':
            megaImages.value = response.data.filter((resp: any) => resp !== 'Thumb');
          default:
            break;
        }
      })
      .catch(error => {
        console.error('Error:', error.response.data);
      });
  }
}

</script>
