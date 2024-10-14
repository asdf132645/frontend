<template>
  <div v-if="isContent" class="crcReport">
    <div class="tabs">
      <button
          class="tab"
          :class="{ active: activeTab === 1 }"
          @click="activeTab = 1"
      >
        종합결과코드
      </button>
      <button
          class="tab"
          :class="{ active: activeTab === 2 }"
          @click="activeTab = 2"
      >
        종합결과코드 LIST
      </button>
    </div>
    <div class="tab-content" v-if="activeTab === 1">
      <div class="textLeft crcMenu">
        <button class="crcBtn">
          Lis
        </button>
        <span class="crcSpanMenu">
          List
        </span>
        <select class="crcSelect">
          <option>1</option>
        </select>
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
      <div class="mt4">
        <div class="crcDivTitle">
          <span>Remark</span>
          <button class="reSelect">Remark Select</button>
        </div>
      </div>
    </div>
    <div class="tab-content" v-if="activeTab === 2">
      <CrcList/>
    </div>
  </div>
</template>
<script setup lang="ts">
import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import {nextTick, onMounted, ref, watch} from "vue";
import Button from "@/components/commonUi/Button.vue";
import CrcList from "@/views/datebase/commponent/detail/report/component/crcList.vue";

const crcArr = ref<any>([]);
const props = defineProps({
  crcDataVal: {
    type: Array,
    required: true,
  },
});
const activeTab = ref(1);  // 탭 상태를 관리하는 변수

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