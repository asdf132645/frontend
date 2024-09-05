<template>
  <div class="versionContainer">
    <ul>
      <li v-for="(item, index) in projectVersionArr" :key="index">
        <span>{{ item.key }}</span>
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {ref, onMounted, onBeforeMount} from "vue";
import {readFileTxt} from "@/common/api/service/fileReader/fileReaderApi";

const isProjectBm = ref(false);
const projectVersionArr = ref<{key: string, name: string}[]>();
const engineVersion = ref<{key: string, name: string}[]>();
const deepNetVersion = ref('');
const coreVersion = ref('');

onBeforeMount(() => {
  isProjectBm.value = window.PROJECT_VERSION === 'bm' ? true : false;
})

onMounted(async () => {
  await setVersions();
  projectVersionArr.value = [
    { key: 'Core Version', name: coreVersion.value },
    { key: 'DeepNet Version', name: deepNetVersion.value },
    { key: 'Web Frontend Version', name: window.WEB_FRONTEND_VERSION as string},
    { key: 'Web Backend Version', name: window.WEB_BACKEND_VERSION as string},
    { key: 'PB Version', name: window.PB_VERSION as string}
  ];
})

const getEngineVersion = () => {
  if (isProjectBm.value) {
    engineVersion.value = [
      { key: 'BM SEG', name: '' },
      { key: 'BM CELL', name: '' },
    ]
  } else {
    engineVersion.value = [
      { key: 'PB SEG', name: '' },
      { key: 'PB WBC', name: '' },
      { key: 'PB RBC', name: '' },
    ]
  }
}

const setVersions = async () => {
  const filePath = 'D:\\UIMD_Data\\Backend_INI'
  const fileName = 'SW_Config'
  try {
    const result: any = await readFileTxt(`path=${filePath}&filename=${fileName}`);
    const iniFileData = result.data.data;
    const coreVersionPattern = /BACKEND\s*=\s*V([\d.]+)/;
    const deepNetVersionPattern = /TCP_VERSION\s*=\s*V([\d.]+)/;
    deepNetVersion.value = iniFileData.match(coreVersionPattern)[1] || '';
    coreVersion.value = iniFileData.match(deepNetVersionPattern)[1] || '';
  } catch (e) {
    console.log(e);
    deepNetVersion.value = '';
    coreVersion.value = '';
  }
}

</script>
