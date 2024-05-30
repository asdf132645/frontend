<template>
  <div class="cbcDiv">
    <h1 class="titleCbc">CBC + DIFF</h1>
    <ul>
      <li></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { xml2json } from 'xml-js';
import {defineProps, onMounted, ref, watch} from "vue";
import axios from "axios";

const props = defineProps(['selectItems']);
const cbcWorkList = ref<any>(null);
watch(props.selectItems, (newVal) => {
  initCbcData(newVal);
},{deep: true});

onMounted(async () => {
  initCbcData(props.selectItems);
});

const initCbcData = (newVal: any) => {
  if(newVal.siteCd === '0002'){ // 서울 성모
    const realUrl = 'http://emr012.cmcnu.or.kr/cmcnu/.live';
    axios.get(realUrl, {
      params: {
        submit_id: 'TRLII00124',
        business_id: 'li',
        instcd: '012',
        bcno: newVal.barcodeNo
      }
    }).then(function (result) {
      const xml = result.data;
      const json = JSON.parse(xml2json(xml, { compact: true }));
      cbcWorkList.value = json.root.spcworklist.worklist;
    }).catch(function (err) {
      console.log(err)
    })
  }else if (newVal.siteCd === '0006' || newVal.siteCd === '0019'){
    //  C:/Users/user/Desktop/IA_MSG/CBC

    // if (}){
    //
    // }
  }
}

</script>
