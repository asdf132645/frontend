<template>
  <div @click="closeIsCrcAddChild" class="crcAddBack">
    <div class="crcPopUpDiv crcAdd"  @click.stop>
      <div class="codeDiv">
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

        <div class="moDivBox mt20">
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
        <div class="mt20" v-if="remarkCountReturnCode(0)">
          <div class="crcDivTitle">
            <span>Remark</span>
            <button class="reSelect" @click="openSelect('remark')">Remark Select</button>
          </div>

          <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
          <div class="remarkUlList">
            <div v-for="(item, index) in remarkList" :key="index">
              <textarea v-model="item.remarkAllContent"></textarea>
              <!--            <button @click="listDel(index, 'remark')">-->
              <!--              <font-awesome-icon :icon="['fas', 'trash']"/>-->
              <!--            </button>-->
            </div>
          </div>
        </div>

        <div class="mt20" v-if="remarkCountReturnCode(1)">
          <div class="crcDivTitle">
            <span> Comment </span>
            <button class="reSelect" @click="openSelect('comment')">Comment Select</button>
          </div>

          <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
          <div class="remarkUlList">
            <div v-for="(item, index) in commentList" :key="index">
              <textarea v-model="item.remarkAllContent"></textarea>
              <!--            <button @click="listDel(index, 'comment')">-->
              <!--              <font-awesome-icon :icon="['fas', 'trash']"/>-->
              <!--            </button>-->
            </div>
          </div>
        </div>

        <div class="mt20" v-if="remarkCountReturnCode(2)">
          <div class="crcDivTitle">
            <span> Recommendation </span>
            <button class="reSelect" @click="openSelect('recommendation')">Recommendation Select</button>
          </div>

          <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
          <div class="remarkUlList">
            <div v-for="(item, index) in recoList" :key="index">
              <textarea v-model="item.remarkAllContent"></textarea>
              <!--            <button @click="listDel(index, 'reco')">-->
              <!--              <font-awesome-icon :icon="['fas', 'trash']"/>-->
              <!--            </button>-->
            </div>
          </div>
        </div>
      </div>

      <div class="mt20">
        <button class="crcDefaultBtn" type="button" @click="saveCrcData" v-if="addEditType === 'add'">Save</button>
        <button class="crcDefaultBtn" type="button" @click="saveEdit" v-else>Edit</button>
        <button class="crcDefaultBtn ml10" type="button" @click="closeIsCrcAddChild">Close</button>
      </div>
    </div>
  </div>
  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
      position="bottom-right"
  />
  <Remark v-if="isRemark" @cancel="closeSelect('remark')" @listUpdated="updateList" type="remark"
          :crcDefaultMode="crcDefaultMode" :crcPassWord="crcPassWord"/>
  <Remark v-if="isComment" @cancel="closeSelect('comment')" @listUpdated="updateList" type="comment"
          :crcDefaultMode="crcDefaultMode" :crcPassWord="crcPassWord"/>
  <Remark v-if="isRecommendation" @cancel="closeSelect('recommendation')" @listUpdated="updateList" type="reco"
          :crcDefaultMode="crcDefaultMode" :crcPassWord="crcPassWord"/>


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

import {computed, nextTick, onBeforeMount, onMounted, ref} from "vue";
import {
  crcDataGet, crcGet, crcOptionGet,
  createCrcDataApi, updateCrcDataApi,
} from "@/common/api/service/setting/settingApi";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import Button from "@/components/commonUi/Button.vue";
import {MESSAGES} from "@/common/defines/constants/constantMessageText";

const emit = defineEmits(['closeIsCrcAdd', 'refresh']);

const crcDataArr = ref<any>({
  code: '',
  crcContent: {
    wbc: [],
    rbc: [],
    plt: [],
  },
  crcRemark: [],
  crcRecommendation: [],
});

const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const codeVal = ref('');
const crcSetArr = ref<any>([]);
const isRemark = ref(false); // Remark 모달 창 열림/닫힘 상태
const remarkList = ref<any[]>([]); // Remark 리스트 상태
const recoList = ref<any[]>([]);
const crcDefaultMode = ref(false);
const isRecommendation = ref(false);
const commentList = ref<any[]>([]);
const crcRemarkCount = ref<any>([]);
const crcPassWord = ref('');
const isComment = ref(false);

onBeforeMount(async () => {
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
    recoList.value = props.editItem.crcRecommendation || [];
    commentList.value = props.editItem.crcComment || [];
    remarkList.value = remarkList.value.map(item => {
      return {
        ...item,
        remarkAllContent: convertToNewlines(item.remarkAllContent),
      };
    });

    commentList.value = commentList.value.map(item => {
      return {
        ...item,
        remarkAllContent: convertToNewlines(item.remarkAllContent),
      };
    });

    recoList.value = recoList.value.map(item => {
      return {
        ...item,
        remarkAllContent: convertToNewlines(item.remarkAllContent),
      };
    });


  } else {
    crcSetArr.value = (await crcGet()).data;
    console.log(crcSetArr.value)
    for (const argument of crcSetArr.value) {
      if (argument.crcType === 'select') {
        if (!argument?.val) {
          argument.val = argument.crcContent.split(',')[0];
        }
      }
    }
  }
  const crcOptionApi = await crcOptionGet();
  if (crcOptionApi.data.length !== 0) {
    crcDefaultMode.value = crcOptionApi.data[0].crcMode;
    crcRemarkCount.value = crcOptionApi.data[0].crcRemarkCount;
    crcPassWord.value = crcOptionApi.data[0].crcPassWord;
  }
});


const hideAlert = () => {
  showAlert.value = false;
};

// 데이터 저장 함수
const pushCrcData = (dataArray: any, type: any, title: any, content: any, percentText = null, id: any) => {
  const data = {crcTitle: title, crcContent: content, crcType: type, id: id};

  if (type === 'percent') {
    data.crcPercentText = percentText;
  }

  dataArray.push(data);
};
const convertToNewlines = (content: string) => {
  return content.replaceAll('<br>', '\r\n');
};


const saveCrcData = async () => {
  if (codeVal.value === '') {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    await showToast('Please enter the code.');
    return;
  }
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
  crcDataArr.value.crcComment = commentList.value;
  crcDataArr.value.crcRecommendation = recoList.value;
  toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
  await showToast('Success');
  await createCrcDataApi(crcDataArr.value);
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
      crcRecommendation: recoList.value,
      crcComment: commentList.value,
      crcContent: crcDataArr.value.crcContent,
      code: codeVal.value
    }]); // 수정된 데이터 서버로 전송
    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    await showToast('Edit completed.');
    emit('refresh');
    emit('closeIsCrcAdd');
  } catch (error) {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    await showToast('Failed to update item');
  }
};

const showToast = async (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};


const listDel = (idx: any, type: string) => {
  if (type === 'remark') {
    remarkList.value.splice(idx, 1);
  } else if (type === 'reco') {
    recoList.value.splice(idx, 1);
  } else if (type === 'comment') {
    commentList.value.splice(idx, 1);
  }
}

const openSelect = (type: string) => {
  switch (type) {
    case 'remark':
      isRemark.value = true;
      break;
    case 'comment':
      isComment.value = true;
      break;
    case 'recommendation':
      isRecommendation.value = true;
      break;
  }
}

const closeSelect = (type: string) => {
  switch (type) {
    case 'remark':
      isRemark.value = false;
      break;
    case 'comment':
      isComment.value = false;
      break;
    case 'recommendation':
      isRecommendation.value = false;
      break;
  }
}

const initializeList = (list: any) => {
  if (list.value.length === 0) {
    list.value.push({
      code: '',
      id: 0,
      remarkAllContent: '',
      remarkContent: '',
    });
  }
};
const remarkallContentPush = (newList: any, list) => {
  for (const el of newList) {
    list.value[0].remarkAllContent += convertToNewlines(el.remarkAllContent)
  }
  list.value[0].remarkAllContent += '\r'
}

const updateList = (newList: any[], type: string) => {
  initializeList(recoList);
  initializeList(remarkList);
  initializeList(commentList);

  switch (type) {
    case 'remark':
      remarkallContentPush(newList,remarkList)
      closeSelect('remark');
      break;
    case 'comment':
      remarkallContentPush(newList,commentList)
      closeSelect('comment');
      break;
    case 'reco':
      remarkallContentPush(newList,recoList)
      closeSelect('recommendation');
      break;
  }
}
const remarkCountReturnCode = (idx: any) => {
  if (crcRemarkCount.value.length === 0) {
    return;
  }
  return crcRemarkCount.value[idx].checked;
}

</script>