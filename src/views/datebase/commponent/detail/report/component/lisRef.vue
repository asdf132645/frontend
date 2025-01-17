<template>
  <div ref="lisRefHTMLContent">
    <div style="position: absolute; background-color: white; width: 800px; height: 800px; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; padding: 24px; border: 1px solid black;">
      <h2 style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">[ PURPOSE OF PBS ]</h2>
      <p>{{ data?.code }}</p>
      <br/>

      <h2 style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">[ RED BLOOD CELLS ]</h2>
      <div style="display: flex; align-items: center; margin-bottom: 4px;" v-for="crcItem of data?.crcContent?.rbc" :key="crcItem.id">
        <p style="width: 200px;">{{ crcItem.crcTitle }}</p>
        <p>{{ crcItem.crcContent }}</p>
      </div>
      <br/>

      <h2 style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">[ WHITE BLOOD CELLS ]</h2>
      <div style="display: flex; align-items: center; margin-bottom: 4px;" v-for="crcItem of data?.crcContent?.wbc" :key="crcItem.id">
        <p style="width: 200px;">{{ crcItem.crcTitle }}</p>
        <p>{{ crcItem.crcContent }}</p>
      </div>
      <br/>

      <h2 style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">[ PLATELETS ]</h2>
      <div style="display: flex; align-items: center; margin-bottom: 4px;" v-for="crcItem of data?.crcContent?.plt" :key="crcItem.id">
        <p style="width: 200px;">{{ crcItem.crcTitle }}</p>
        <p>{{ crcItem.crcContent }}</p>
      </div>
      <br/>

      <h2 style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">[ SUMMARY OF FINDINGS ]</h2>
      <div style="display: flex; align-items: center; margin-bottom: 4px;" v-for="crcItem of data?.crcRemark" :key="crcItem.id">
        <p>{{ crcItem.remarkAllContent }}</p>
      </div>
      <br/>

      <h2 style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">[ OPINION & RECOMMENDATION ]</h2>
      <div style="display: flex; align-items: center; margin-bottom: 4px;" v-for="(crcItem, index) of data?.crcRecommendation" :key="crcItem.id">
        <p>{{ index + 1 }}. {{ crcItem.remarkAllContent }}</p>
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, nextTick, onMounted, ref } from "vue";
import {kcch_0033LisSend, kcch_0033RTFConvert} from "@/common/helpers/lisCbc/kcch_0033";

interface CRCContentType {
  crcContent: string;
  crcTitle: string;
  crcType: string;
  id: number;
}

interface CRCCommentType {
  code: string;
  id: number;
  remarkAllContent: string;
  remarkContent: string;
}

interface CRCDataType {
  code: string;
  crcComment: CRCCommentType[];
  crcContent: { plt: CRCContentType[], rbc: CRCContentType[], wbc: CRCContentType[] };
  crcRecommendation: CRCCommentType[];
  crcRemark: CRCCommentType[];
  id: number;
}
const data = ref<CRCDataType>();
const lisRefHTMLContent = ref();
const rtfContent = ref<any>();
const props = defineProps(['nowCrcDataLis']);

onMounted(async () => {
  await nextTick();
  data.value = props.nowCrcDataLis;

  if (data.value) {
    await convertHTMLToRTF();
  }

  if (rtfContent.value) {
    sendRtf();
  }
})

const sendRtf = async () => {
  if (!rtfContent.value) {
    return;
  }

  try {
    await kcch_0033LisSend(rtfContent.value);
  } catch (error) {
    console.error(error);
  }
}

const convertHTMLToRTF = async () => {
  try {
    const result = await kcch_0033RTFConvert(lisRefHTMLContent.value);
    rtfContent.value = result;
  } catch (error) {
    console.error(error);
    rtfContent.value = null;
  }
}

</script>