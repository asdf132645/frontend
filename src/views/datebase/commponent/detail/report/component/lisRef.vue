<template>
  <div ref="lisRefHTMLContent" class="lisRef-container" style="position: absolute;">
    <div>
      <h2>[ PURPOSE OF PBS ]</h2>
      <p>{{ data?.code }}</p>
      <br>

      <h2>[ RED BLOOD CELLS ]</h2>
      <div v-for="crcItem of data?.crcContent?.rbc" :key="crcItem.id">
        <p>{{ crcItem.crcTitle }}: {{ crcItem.crcContent }}</p>
      </div>
      <br>

      <h2>[ WHITE BLOOD CELLS ]</h2>
      <div v-for="crcItem of data?.crcContent?.wbc" :key="crcItem.id">
        <p>{{ crcItem.crcTitle }}: {{ crcItem.crcContent }}</p>
      </div>
      <br>

      <h2>[ PLATELETS ]</h2>
      <div v-for="crcItem of data?.crcContent?.plt" :key="crcItem.id">
        <p>{{ crcItem.crcTitle }}: {{ crcItem.crcContent }}</p>
      </div>
      <br>

      <h2>[ SUMMARY OF FINDINGS ]</h2>
      <div v-for="crcItem of data?.crcRemark" :key="crcItem.id">
        <p v-html="convertNewLinesToBr(crcItem.remarkAllContent)"></p>
      </div>
      <br>

      <h2>[ OPINION & RECOMMENDATION ]</h2>
      <div v-for="crcItem of data?.crcRecommendation" :key="crcItem.id">
        <p v-html="convertNewLinesToBr(crcItem.remarkAllContent)"></p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, nextTick, onMounted, ref } from "vue";
import { kcch_0033LisSend, kcch_0033RTFConvert } from "@/common/helpers/lisCbc/kcch_0033";
import {isObjectEmpty} from "@/common/lib/utils/validators";

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
const props = defineProps(['nowCrcDataLis', 'selectItems']);

onMounted(async () => {
  data.value = props.nowCrcDataLis;

  if (data.value) {
    await convertHTMLToRTF();
  }

  if (rtfContent.value) {
    await sendRtf();
  }
})

const sendRtf = async () => {
  if (!rtfContent.value) {
    return;
  }

  try {
    await kcch_0033LisSend({ barcodeNo: props.selectItems.barcodeNo, rtfData: rtfContent.value });
  } catch (error) {
    console.error(error);
  }
}

const convertHTMLToRTF = async () => {
  await nextTick();
  try {
    const result = await kcch_0033RTFConvert(lisRefHTMLContent.value);
    if (!isObjectEmpty(result)) {
      rtfContent.value = result;
    } else {
      rtfContent.value = null;
    }
  } catch (error) {
    console.error(error);
    rtfContent.value = null;
  }
}

const convertNewLinesToBr = (text: string) => {
  if (text) {
    return text.replaceAll('\n', '<br>');
  }
  return '';
}

</script>