<template>
  <div class="crcPopUpDiv crcAdd">
    <div>
      <span>Code</span>
      <input type="text" class="codeInput" v-model="codeVal"/>
    </div>
    <div>
      <crc-compontent
          :items="crcSetArr"
          @updateSelect="updateSelect"
          moType="RBC"
          pageName="report"
      ></crc-compontent>

      <div class="moDivBox mt2">
        <div>
          <crc-compontent
              :items="crcSetArr"
              @updateSelect="updateSelect"
              moType="WBC"
              pageName="report"
          ></crc-compontent>
        </div>

        <div>
          <crc-compontent
              :items="crcSetArr"
              @updateSelect="updateSelect"
              moType="PLT"
              pageName="report"
          ></crc-compontent>
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
  </div>
  <Remark v-if="isRemark" @cancel="closeRemark" @listUpdated="updateRemarkList"/>

  <div class="mt1">
    <button type="button" @click="saveCrcData" v-if="addEditType === 'add'">Save</button>
    <button type="button" @click="saveEdit" v-else>Edit</button>
    <button type="button" @click="closeIsCrcAddChild">Close</button>
  </div>

  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />
</template>
<script setup lang="ts">
import Remark from "@/views/datebase/commponent/detail/report/component/remark.vue";

const props = defineProps({
  crcSetArrP: {
    type: Array,
    required: true,
  },
  addEditType: {
    type: String,
  },
  editItem: { // 새로운 prop 추가
    type: Object,
    default: () => ({}),
  },
});
import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import Alert from "@/components/commonUi/Alert.vue";

import {nextTick, onBeforeMount, onMounted, ref} from "vue";
import {
  crcDataGet,
  createCrcDataApi, updateCrcDataApi,
} from "@/common/api/service/setting/settingApi";

const emit = defineEmits(['closeIsCrcAdd', 'refresh']);

const crcDataArr = ref<any>({
  code: '',
  crcContent: {
    wbc: [],
    rbc: [],
    plt: [],
  },
  crcRemark: [],
});
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const codeVal = ref('');
const crcSetArr = ref<any>([]);
const isRemark = ref(false); // Remark 모달 창 열림/닫힘 상태
const remarkList = ref<any[]>([]); // Remark 리스트 상태


onBeforeMount(() => {
  // crcSetArr 초기화
  crcSetArr.value = JSON.parse(JSON.stringify(props.crcSetArrP));

  // Edit 모드일 경우 editItem의 값을 초기화
  if (props.addEditType === 'edit') {
    codeVal.value = props.editItem.code; // 코드 값 초기화

    // 각 유형에 대해 editItem의 crcContent 값을 설정
    const types = ['plt', 'rbc', 'wbc'];

    types.forEach(type => {
      props.editItem.crcContent[type].forEach(content => {
        const match = crcSetArr.value.find(item => item.crcTitle === content.crcTitle && item.crcType === content.crcType);
        if (match) {
          // crcType이 "select"인 경우 val에 값을 넣고, 아닌 경우 crcContent에 값을 매핑
          if (match.crcType === 'select') {
            match.val = content.crcContent; // select인 경우 val에 설정
          } else {
            match.crcContent = content.crcContent; // 나머지 경우 crcContent에 설정
          }
        }
      });
    });

    // 리마크 초기화
    remarkList.value = props.editItem.crcRemark || [];
  } else {
    crcSetArr.value = JSON.parse(JSON.stringify(props.crcSetArrP));
    for (const argument of crcSetArr.value) {
      if (argument.crcType === 'select') {
        if (!argument?.val) {
          argument.val = argument.crcContent.split(',')[0];
        }
      }
    }
  }
});


onMounted(async () => {
  await nextTick();

  // crcDataArr.value = (await crcDataGet()).data;
});
const hideAlert = () => {
  showAlert.value = false;
};
const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
  window.scrollTo({top: 0, behavior: 'smooth'});
};

// 데이터 저장 함수
const pushCrcData = (dataArray, type, title, content, percentText = null, id: any) => {
  const data = {crcTitle: title, crcContent: content, crcType: type, id: id};

  if (type === 'percent') {
    data.crcPercentText = percentText;
  }

  dataArray.push(data);
};

const saveCrcData = async () => {
  for (const argument of crcSetArr.value) {
    const {morphologyType, crcType, crcTitle, crcContent, crcPercentText, val, id} = argument;
    const targetArray = crcDataArr.value.crcContent[morphologyType.toLowerCase()] || [];

    if (crcType === 'select') {
      pushCrcData(targetArray, crcType, crcTitle, val, null, id);
    } else {
      pushCrcData(targetArray, crcType, crcTitle, crcContent, crcPercentText, id);
    }

    // targetArray를 다시 crcDataArr에 할당
    crcDataArr.value.crcContent[morphologyType.toLowerCase()] = targetArray;
  }
  crcDataArr.value.code = codeVal.value;
  crcDataArr.value.crcRemark = remarkList.value;
  await createCrcDataApi(crcDataArr.value);
  await showSuccessAlert('Success');
  emit('refresh');
  emit('closeIsCrcAdd');
};


const updateSelect = (val) => {
  const updatedItem = crcSetArr.value.find(item => item.id === val.id);
  updatedItem.val = val.val;
}

const closeIsCrcAddChild = () => {
  emit('closeIsCrcAdd')
}

const closeRemark = () => {
  isRemark.value = false;
};
const remarkSelect = () => {
  isRemark.value = true;
};
// 자식 컴포넌트로부터 업데이트된 리스트를 받음
const updateRemarkList = (newList: any[]) => {
  remarkList.value = newList; // 리스트를 부모 상태에 저장
  closeRemark();
};

// 항목 수정 저장
const saveEdit = async () => {
  for (const argument of crcSetArr.value) {
    const {morphologyType, crcType, crcTitle, crcContent, crcPercentText, val, id} = argument;
    const targetArray = crcDataArr.value.crcContent[morphologyType.toLowerCase()] || [];

    if (crcType === 'select') {
      pushCrcData(targetArray, crcType, crcTitle, val, null, id);
    } else {
      pushCrcData(targetArray, crcType, crcTitle, crcContent, crcPercentText, id);
    }

    // targetArray를 다시 crcDataArr에 할당
    crcDataArr.value.crcContent[morphologyType.toLowerCase()] = targetArray;
  }
  try {
    await updateCrcDataApi([{
      id: props.editItem.id,
      crcRemark: remarkList.value,
      crcContent: crcDataArr.value.crcContent,
      code: codeVal.value
    }]); // 수정된 데이터 서버로 전송
    emit('refresh');
    emit('closeIsCrcAdd');
  } catch (error) {
    console.error("Failed to update item:", error);
  }
};
</script>