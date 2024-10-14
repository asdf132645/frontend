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

    <!-- 첫 번째 탭 콘텐츠 -->
    <div class="tab-content" v-if="activeTab === 1">
      <div class="textLeft crcMenu">
        <button class="crcBtn">Lis</button>
        <span class="crcSpanMenu">List</span>
        <select class="crcSelect">
          <option>1</option>
        </select>
      </div>

      <!-- RBC 결과 -->
      <crc-compontent :items="crcArr" moType="RBC" pageName="report"></crc-compontent>

      <!-- WBC, PLT 결과 -->
      <div class="moDivBox mt2">
        <div>
          <crc-compontent :items="crcArr" moType="WBC" pageName="report"></crc-compontent>
        </div>
        <div>
          <crc-compontent :items="crcArr" moType="PLT" pageName="report"></crc-compontent>
        </div>
      </div>

      <!-- Remark 관련 -->
      <div class="mt4">
        <div class="crcDivTitle">
          <span>Remark</span>
          <button class="reSelect" @click="remarkSelect">Remark Select</button>
        </div>

        <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
        <ul class="remarkUlList">
          <li v-for="(item, index) in remarkList" :key="index">{{ item.code }} - {{ item.remarkAllContent }}</li>
        </ul>
      </div>
    </div>

    <!-- 두 번째 탭 콘텐츠 -->
    <div class="tab-content" v-if="activeTab === 2">
      <CrcList/>
    </div>
  </div>

  <!-- 자식 컴포넌트 Remark -->
  <Remark v-if="isRemark" @cancel="closeRemark" @listUpdated="updateRemarkList"/>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import CrcList from "@/views/datebase/commponent/detail/report/component/crcList.vue";
import Remark from "@/views/datebase/commponent/detail/report/component/remark.vue";

const crcArr = ref<any>([]);
const props = defineProps({
  crcDataVal: {
    type: Array,
    required: true,
  },
});
const isRemark = ref(false); // Remark 모달 창 열림/닫힘 상태
const activeTab = ref(1); // 현재 탭 상태
const remarkList = ref<any[]>([]); // Remark 리스트 상태

const isContent = ref(false);
onMounted(async () => {
  await nextTick();
  isContent.value = true;
  if (isContent.value) {
    crcArr.value = props.crcDataVal;
  }
});

const remarkSelect = () => {
  isRemark.value = true;
};

const closeRemark = () => {
  isRemark.value = false;
};

// 자식 컴포넌트로부터 업데이트된 리스트를 받음
const updateRemarkList = (newList: any[]) => {
  remarkList.value = newList; // 리스트를 부모 상태에 저장
  closeRemark();
};
</script>
