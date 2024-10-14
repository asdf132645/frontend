<template>
  <div v-if="isContent">
    <div>
      <ul>
        <li>
          <p>종합결과코드</p>
        </li>
      </ul>
    </div>
    <crc-compontent
        :items="crcArr"
        moType="RBC"
        pageName="report"
    ></crc-compontent>

    <div class="moDivBox mt2">
      <div>
        <crc-compontent
            :items="crcArr"
            moType="WBC"
            pageName="report"
        ></crc-compontent>
      </div>

      <div>
        <crc-compontent
            :items="crcArr"
            moType="PLT"
            pageName="report"
        ></crc-compontent>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import {nextTick, onMounted, ref, watch} from "vue";
const crcArr = ref<any>([]);
const props = defineProps({
  crcDataVal: {
    type: Array,
    required: true,
  },
});
const isContent = ref(false);
onMounted(async () => {
  await nextTick();
  isContent.value = true;
  if (isContent.value) {
    crcArr.value = props.crcDataVal;
    console.log(crcArr.value)
  }
});
</script>