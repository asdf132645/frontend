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
        <button class="crcBtn" @click="lisClick">LIS</button>
        <span class="crcSpanMenu">List</span>
        <select class="crcSelect" @change="changeCode" v-model="code">
          <option>select</option>
          <option v-for="(item, idx) in crcDataArr" :key="idx" :value="item.code">
            {{ item.code }}
          </option>
        </select>
        <button class="crcBtn tempSave ml1" @click="tempSaveLocalStorage">SAVE</button>
        <button class="crcBtn tempSave ml1" @click="tempSaveDataEmpty">SAVE DATA EMPTY</button>

      </div>

      <!-- RBC 결과 -->
      <crc-compontent v-if="trrur" :items="crcArr" moType="RBC" pageName="report"></crc-compontent>

      <!-- WBC, PLT 결과 -->
      <div class="moDivBox mt1">
        <div>
          <crc-compontent v-if="trrur" :items="crcArr" moType="WBC" pageName="report"></crc-compontent>
        </div>
        <div>
          <crc-compontent v-if="trrur" :items="crcArr" moType="PLT" pageName="report"></crc-compontent>
        </div>
      </div>

      <!-- Remark 관련 -->
      <div class="mt2">
        <div class="crcDivTitle">
          <span>{{ crcDefaultModeChangeText(crcDefaultMode) }} </span>
          <button class="reSelect" @click="remarkSelect">{{ crcDefaultModeChangeText(crcDefaultMode) }} Select</button>
        </div>

        <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
        <div class="remarkUlList">
          <div v-for="(item, index) in remarkList" :key="index">
            <textarea v-model="item.remarkAllContent"></textarea>
            <button @click="listDel(index, 'remark')">Del</button>
          </div>
        </div>
      </div>

      <div class="mt2" v-if="!crcDefaultMode">
        <div class="crcDivTitle">
          <span> Recommendation </span>
          <button class="reSelect" @click="recommendationSelect">Recommendation Select</button>
        </div>

        <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
        <div class="remarkUlList">
          <div v-for="(item, index) in recoList" :key="index">
            <textarea v-model="item.remarkAllContent"></textarea>
            <button @click="listDel(index, 'reco')">Del</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 두 번째 탭 콘텐츠 -->
    <div class="tab-content" v-if="activeTab === 2">
      <CrcList :crcArr="crcArr" @refresh="pageRefresh"/>
    </div>
  </div>

  <!-- 자식 컴포넌트 Remark -->
  <Remark v-if="isRemark" @cancel="closeRemark" @listUpdated="updateRemarkList" type="remark"
          :crcDefaultMode="crcDefaultMode"/>
  <Remark v-if="isRecommendation" @cancel="closeReco" @listUpdated="updateRecoList" type="reco"
          :crcDefaultMode="crcDefaultMode"/>
  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :duration="1500"
      position="bottom-right"
  />
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeMount, onMounted, ref, watch} from "vue";
import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import CrcList from "@/views/datebase/commponent/detail/report/component/crcList.vue";
import Remark from "@/views/datebase/commponent/detail/report/component/remark.vue";
import {crcDataGet, crcGet, crcOptionGet} from "@/common/api/service/setting/settingApi";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import Button from "@/components/commonUi/Button.vue";
import {createFile} from "@/common/api/service/fileSys/fileSysApi";
import {getLisPathData, getLisWbcRbcData} from "@/common/lib/commonfunction/inhaCbcLis";
import {useStore} from "vuex";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import {createH17, readCustomH7Message, readH7Message} from "@/common/api/service/fileReader/fileReaderApi";
import {messages} from "@/common/defines/constFile/constantMessageText";

const crcArr = ref<any>([]);
const props = defineProps({
  crcDataVal: {
    type: Array,
    required: true,
  },
  selectItems: {
    type: Array
  }
});
const toastMessage = ref('');
const isRemark = ref(false); // Remark 모달 창 열림/닫힘 상태
const isRecommendation = ref(false);
const activeTab = ref(1); // 현재 탭 상태
const remarkList = ref<any[]>([]); // Remark 리스트 상태
const recoList = ref<any[]>([]);
const isContent = ref(false);
const crcDataArr = ref<any[]>([]);
const code = ref('');
const crcDefaultMode = ref(false);
const trrur = ref(false);
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);

onBeforeMount(async () => {
  await nextTick();
  isContent.value = true;
  if (isContent.value) {
    const savedData = localStorage.getItem('crcSetData');
    const codeVal = localStorage.getItem('code') || '';
    const remarkListVal = localStorage.getItem('remarkList') || [];
    const recoListVal = localStorage.getItem('recoList') || [];
    if (savedData) {
      crcArr.value = JSON.parse(savedData);
      code.value = JSON.parse(codeVal);

      if (typeof remarkListVal === "string") {
        remarkList.value = JSON.parse(remarkListVal);
      }

      if (typeof recoListVal === 'string') {
        recoList.value = JSON.parse(recoListVal);
      }
      trrur.value = true;
    } else {
      crcArr.value = (await crcGet()).data;
      trrur.value = true;
    }

    const data = (await crcDataGet()).data;
    crcDataArr.value = data;
  }
  const crcOptionApi = await crcOptionGet();
  if (crcOptionApi.data.length !== 0) {
    crcDefaultMode.value = crcOptionApi.data[0].crcMode;

  }
});
const lisClick = async () => {
  const nowCrcData = crcDataArr.value.find((item) => { return item.code === code.value})
  nowCrcData.crcRemark = remarkList.value;
  nowCrcData.crcRecommendation = recoList.value;
  const {lisFilePathSetArr} = await getLisPathData();
  const {lisCodeWbcArr, lisCodeRbcArr} = await getLisWbcRbcData();
  const data = {
    sendingApp: 'PBIA',
    sendingFacility: 'PBIA',
    receivingApp: 'LIS',
    receivingFacility: 'LIS',
    dateTime: getDateTimeStr(),
    security: '',
    messageType: ['ADT', 'R02'],
    messageControlId: props.selectItems?.barcodeNo,
    processingId: 'P',
    hl7VersionId: '2.5',
    selectedItem: { /* selectedItem 데이터 */},
    wbcInfo: props.selectItems?.wbcInfoAfter,
    result: lisCodeWbcArr,
    customData: nowCrcData,
  };
  const res = await readCustomH7Message(data);
  if (res) {
    const data = {
      filepath: `${lisFilePathSetArr}\\${props.selectItems?.barcodeNo}.hl7`,
      msg: res,
    }
    try {
      await createH17(data);
      showToast(messages.IDS_MSG_SUCCESS);
    } catch (error: any) {
      showToast(error.response.data.message);
    }
  }
}
const listDel = (idx: any, type: string) => {
  if (type === 'remark') {
    remarkList.value.splice(idx, 1);
  } else if (type === 'reco') {
    recoList.value.splice(idx, 1);
  }
}

const remarkSelect = () => {
  isRemark.value = true;
};

const recommendationSelect = () => {
  isRecommendation.value = true;
}

const closeRemark = () => {
  isRemark.value = false;
};

const closeReco = () => {
  isRecommendation.value = false;
}

// 자식 컴포넌트로부터 업데이트된 리스트를 받음
const updateRemarkList = (newList: any[]) => {
  remarkList.value = [...remarkList.value, ...newList];
  closeRemark();
};

const updateRecoList = (newList: any[]) => {
  recoList.value = [...recoList.value, ...newList];
  closeReco();
};

// 코드 변경 시 로직 처리
const changeCode = async (event: Event) => {
  if (event.target?.value === 'select') {
    return;
  }
  code.value = event.target?.value;
  const filterArr = crcDataArr.value.filter((item) => item.code === event.target?.value);

  const types = ['plt', 'rbc', 'wbc'];

  types.forEach(type => {
    filterArr[0].crcContent[type].forEach(content => {
      const match = crcArr.value.find(item => item.crcTitle === content.crcTitle && item.crcType === content.crcType);
      if (match) {
        if (match.crcType === 'select') {
          match.val = content.crcContent;
        } else {
          match.crcContent = content.crcContent;
        }
      }
    });
  });

  remarkList.value = filterArr[0].crcRemark || [];
  recoList.value = filterArr[0].crcRecommendation || [];
};

// tempSave를 클릭 시 로컬 스토리지에 데이터 저장
const tempSaveLocalStorage = () => {
  localStorage.setItem('code', JSON.stringify(code.value))
  localStorage.setItem('crcDataArr', JSON.stringify(crcDataArr.value));
  localStorage.setItem('crcSetData', JSON.stringify(crcArr.value));
  localStorage.setItem('remarkList', JSON.stringify(remarkList.value));
  localStorage.setItem('recoList', JSON.stringify(recoList.value));
  showToast('Data saved to temporary storage')
};

const tempSaveDataEmpty = async () => {
  localStorage.removeItem('code')
  localStorage.removeItem('crcDataArr');
  localStorage.removeItem('crcSetData');
  localStorage.removeItem('remarkList');
  localStorage.removeItem('recoList');

  crcArr.value = [];
  crcArr.value = (await crcGet()).data;
  recoList.value = [];
  remarkList.value = [];
  code.value = '';
  showToast('Data empty to storage')
}

// 페이지 새로고침
const pageRefresh = async () => {
  const data = (await crcDataGet()).data;
  crcDataArr.value = data;
};

const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};


const crcDefaultModeChangeText = (crcDefaultModeType: boolean) => {
  if (crcDefaultModeType) {
    return 'Remark';
  } else {
    return 'Comment';
  }
}
</script>
