<template>
  <div class="versionContainer">
    <h3 class="fs12 mb10">SW</h3>
    <ul>
      <li v-for="(item, index) in projectVersionArr" :key="index">
        <span>{{ item.key }}</span>
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
  <div class="versionContainer">
    <h3 class="fs12 mb10">Engine</h3>
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
const swVersion = ref({
  core: '',
  deepNet: '',
})
const bmEngineVersion = ref({
  seg: '',
  cell: '',
})
const pbEngineVersion = ref({
  seg: '',
  wbc: '',
  rbcClassify: '',
  rbcPltCrop: '',
  singleSeg: ''
})

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
    { key: 'Core Version', name: swVersion.value.core },
    { key: 'DeepNet Version', name: swVersion.value.deepNet },
    { key: 'Web Version', name: window.PROJECT_VERSION },
  ];

  // Engine Versions
  if (isProjectBm.value) {

    engineVersionArr.value = [
      { key: 'BM SEG Version', name: bmEngineVersion.value.seg },
      { key: 'BM CELL Version', name: bmEngineVersion.value.cell },
    ]
  } else {
    engineVersionArr.value = [
      { key: 'PB SEG Version', name: pbEngineVersion.value.seg },
      { key: 'PB WBC Version', name: pbEngineVersion.value.wbc },
      { key: 'PB RBC CLASSIFY Version', name: pbEngineVersion.value.rbcClassify },
      { key: 'PB RBC PLT CROP Version', name: pbEngineVersion.value.rbcPltCrop },
      { key: 'PB SINGLE SEG Version', name: pbEngineVersion.value.singleSeg },
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
    const pbRbcPattern = /PB_RBC_CLASSIFY\s*=\s*(.+)/;
    const pbRbcPltCropPattern = /PB_RBC_PLT_CROP\s*=\s*(.+)/;
    const pbSingleSegPattern = /PB_RBC_SINGLE_SEG\s*=\s*(.+)/;


    swVersion.value.deepNet = iniFileData.match(tcpVersionPattern)[1] || '';
    swVersion.value.core = iniFileData.match(coreVersionPattern)[1] || '';
    bmEngineVersion.value.seg = iniFileData.match(bmSegPattern)[1] || '';
    bmEngineVersion.value.cell = iniFileData.match(bmCellPattern)[1] || '';
    pbEngineVersion.value.seg = iniFileData.match(pbSegPattern)[1] || '';
    pbEngineVersion.value.wbc = iniFileData.match(pbWbcPattern)[1] || '';
    pbEngineVersion.value.rbcClassify = iniFileData.match(pbRbcPattern)[1] || '';
    pbEngineVersion.value.rbcPltCrop = iniFileData.match(pbRbcPltCropPattern)[1] || '';
    pbEngineVersion.value.singleSeg = iniFileData.match(pbSingleSegPattern)[1] || '';
  } catch (e) {
    console.error(e);
  }
}

</script>
