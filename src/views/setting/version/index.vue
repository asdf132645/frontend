<template>
  <div class="versionContainer">
    <h3 class="fs12 mb1">SW</h3>
    <ul>
      <li v-for="(item, index) in projectVersionArr" :key="index">
        <span>{{ item.key }}</span>
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
  <div class="versionContainer">
    <h3 class="fs12 mb1">Engine</h3>
    <ul>
      <li v-for="(item, index) in engineVersionArr" :key="index">
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
const engineVersionArr = ref<{key: string, name: string}[]>();
const deepNetVersion = ref('');
const coreVersion = ref('');
const bmSegEngineVersion = ref('');
const bmCellEngineVersion = ref('');
const pbSegEngineVersion = ref('');
const pbWbcEngineVersion = ref('');
const pbRbcEngineVersion = ref('');

onBeforeMount(() => {
  isProjectBm.value = window.PROJECT_TYPE === 'bm' ? true : false;
})

onMounted(async () => {
  await setVersions();
  getEngineVersion();
})

const getEngineVersion = () => {
  // Project Versions
  projectVersionArr.value = [
    { key: 'Core Version', name: coreVersion.value },
    { key: 'DeepNet Version', name: deepNetVersion.value },
    { key: 'Web Frontend Version', name: window.WEB_FRONTEND_VERSION as string},
    { key: 'Web Backend Version', name: window.WEB_BACKEND_VERSION as string},
    { key: 'PB Version', name: window.PB_VERSION as string}
  ];

  console.log(isProjectBm.value)
  // Engine Versions
  if (isProjectBm.value) {

    engineVersionArr.value = [
      { key: 'BM SEG Version', name: bmSegEngineVersion.value },
      { key: 'BM CELL Version', name: bmCellEngineVersion.value },
    ]
  } else {
    engineVersionArr.value = [
      { key: 'PB SEG Version', name: pbSegEngineVersion.value },
      { key: 'PB WBC Version', name: pbWbcEngineVersion.value },
      { key: 'PB RBC Version', name: pbRbcEngineVersion.value },
    ]
  }
}

const setVersions = async () => {
  const filePath = 'D:\\UIMD_Data\\Backend_INI'
  const fileName = 'SW_Config'
  try {
    const result: any = await readFileTxt(`path=${filePath}&filename=${fileName}`);
    const iniFileData = result.data.data;
    const tcpVersionPattern = /TCP_VERSION\s*=\s*(.+)/;
    const coreVersionPattern = /BACKEND\s*=\s*(.+)/;
    const bmSegPattern = /BM_SEG_ENGINE\s*=\s*(.+)/;
    const bmCellPattern = /BM_CELL_ENGINE\s*=\s*(.+)/;
    const pbSegPattern = /PB_SEG_ENGINE\s*=\s*(.+)/;
    const pbWbcPattern = /PB_WBC_ENGINE\s*=\s*(.+)/;
    const pbRbcPattern = /PB_RBC_SHAPE_ENGINE\s*=\s*(.+)/;

    deepNetVersion.value = iniFileData.match(tcpVersionPattern)[1] || '';
    coreVersion.value = iniFileData.match(coreVersionPattern)[1] || '';
    bmSegEngineVersion.value = iniFileData.match(bmSegPattern)[1] || '';
    bmCellEngineVersion.value = iniFileData.match(bmCellPattern)[1] || '';
    pbSegEngineVersion.value = iniFileData.match(pbSegPattern)[1] || '';
    pbWbcEngineVersion.value = iniFileData.match(pbWbcPattern)[1] || '';
    pbRbcEngineVersion.value = iniFileData.match(pbRbcPattern)[1] || '';
  } catch (e) {
    console.log(e);
    deepNetVersion.value = '';
    coreVersion.value = '';
  }
}

</script>
