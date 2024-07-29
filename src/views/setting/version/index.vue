<template>
  <div class="versionContainer">
    <ul>
      <li v-for="(item, index) in projectVersion" :key="index">
        <span>{{ item.key }}</span>
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import {readFileTxt} from "@/common/api/service/fileReader/fileReaderApi";

const projectVersion = ref<{key: string, name: string}[]>()
const coreVersion = ref('');
const aiVersion = ref('');

onMounted(async () => {
  await setAIVersions();
  projectVersion.value = [
    { key: 'AI Version', name: aiVersion.value },
    { key: 'Core Version', name: coreVersion.value },
    { key: 'Web Frontend Version', name: window.WEB_FRONTEND_VERSION as string},
    { key: 'Web Backend Version', name: window.WEB_BACKEND_VERSION as string},
    { key: 'PB Version', name: window.PB_VERSION as string}
  ];
})

const setAIVersions = async () => {
  const filePath = 'D:\\UIMD_Data\\Backend_INI'
  const fileName = 'SW_Config'
  try {
    const result: any = await readFileTxt(`path=${filePath}&filename=${fileName}`);
    const iniFileData = result.data.data;
    const aiVersionPattern = /BACKEND\s*=\s*V([\d.]+)/;
    const tcpVersionPattern = /TCP_VERSION\s*=\s*V([\d.]+)/;
    aiVersion.value = iniFileData.match(aiVersionPattern)[1] || '';
    coreVersion.value = iniFileData.match(tcpVersionPattern)[1] || '';
  } catch (e) {
    console.log(e);
    aiVersion.value = '';
    coreVersion.value = '';
  }
}

</script>
