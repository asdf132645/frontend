<template>
  <div v-if="isContent" class="crcReport">
    <div class="tabs">
      <button
          class="tab"
          :class="{ active: activeTab === 1 }"
          @click="activeTab = 1"
      >
        Result Codes
      </button>
      <button
          class="tab"
          :class="{ active: activeTab === 2 }"
          @click="adminPassword()"
      >
        Code Repository
      </button>
      <button
          class="tab"
          :class="{ active: activeTab === 3 }"
          @click="cellStatus()"
      >
        Dashboard
      </button>
    </div>
    <!-- 첫 번째 탭 콘텐츠 -->
    <div class="tab-content crcDiv reportCrcDiv" v-if="activeTab === 1">
      <div class="text-left crcMenu mb10">
        <button class="crcBtn" @click="lisClick">
          <font-awesome-icon :icon="['fas', 'upload']"/>
        </button>
        <span class="crcSpanMenu">List</span>
        <div class="autocomplete-container ml10">
          <!-- 검색 입력 필드 -->
          <input
              v-model="searchText"
              placeholder="code Search"
              class="autocomplete-input"
              @focus="showDropdown = true"
              @blur="hideDropdownWithDelay"
          />

          <!-- 검색어에 따라 필터링된 드롭다운 목록 -->
          <ul v-if="showDropdown && filteredOptions.length" class="autocomplete-list">
            <li
                v-for="(item, idx) in filteredOptions"
                :key="idx"
                @click="selectOption(item.code)"
                class="autocomplete-item"
            >
              {{ item.code }}
            </li>
          </ul>
        </div>
        <button class="crcBtn tempSave ml10" @click="tempSaveLocalStorage">Save</button>
        <button class="crcBtn tempSave ml10" @click="tempSaveDataEmpty">Clear</button>

      </div>

      <!-- RBC 결과 -->
      <crc-compontent v-if="trrur" :items="crcArr" moType="RBC" pageName="report"
                      @changeCrcData="changeCrcData"></crc-compontent>

      <!-- WBC, PLT 결과 -->
      <div class="moDivBox mt10">
        <div>
          <crc-compontent v-if="trrur" :items="crcArr" moType="WBC" pageName="report"
                          @changeCrcData="changeCrcData"></crc-compontent>
        </div>
        <div>
          <crc-compontent v-if="trrur" :items="crcArr" moType="PLT" pageName="report"
                          @changeCrcData="changeCrcData"></crc-compontent>
        </div>
      </div>

      <!-- Remark 관련 -->
      <div class="mt20" v-if="remarkCountReturnCode(0)">
        <div class="crcDivTitle">
          <span><font-awesome-icon :icon="['fas', 'message']"/> Remark</span>
          <button class="reSelect" @click="openSelect('remark')">Remark Select</button>
        </div>

        <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
        <div class="remarkUlList">
          <div v-for="(item, index) in remarkList" :key="index">
            <textarea maxlength="1000" v-model="item.remarkAllContent"></textarea>
          </div>
        </div>
      </div>

      <div class="mt20" v-if="remarkCountReturnCode(1)">
        <div class="crcDivTitle">
          <span><font-awesome-icon :icon="['fas', 'message']"/> Comment </span>
          <button class="reSelect" @click="openSelect('comment')">Comment Select</button>
        </div>

        <div class="remarkUlList">
          <div v-for="(item, index) in commentList" :key="index">
            <textarea maxlength="1000" v-model="item.remarkAllContent"></textarea>
          </div>
        </div>
      </div>

      <div class="mt20" v-if="remarkCountReturnCode(2)">
        <div class="crcDivTitle">
          <span><font-awesome-icon :icon="['fas', 'message']"/> Recommendation </span>
          <button class="reSelect" @click="openSelect('recommendation')">Recommendation Select</button>
        </div>

        <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
        <div class="remarkUlList">
          <div v-for="(item, index) in recoList" :key="index">
            <textarea v-model="item.remarkAllContent"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 두 번째 탭 콘텐츠 -->
    <div class="tab-content crcDiv reportCrcDiv" v-if="activeTab === 2">
      <CrcList :crcPassWord="crcPassWord" :crcArr="crcArr" @refresh="pageRefresh"/>
    </div>
    <div class="tab-content crcDiv reportCrcDiv dashboard" v-if="activeTab === 3">
      <cell-status-dash-board :autoNomarlCheck="autoNomarlCheck"/>
    </div>
  </div>

  <!-- 자식 컴포넌트 Remark -->
  <Remark v-if="isRemark" @cancel="closeSelect('remark')" @listUpdated="updateList" type="remark"
          :crcDefaultMode="crcDefaultMode" :crcPassWord="crcPassWord"/>
  <Remark v-if="isComment" @cancel="closeSelect('comment')" @listUpdated="updateList" type="comment"
          :crcDefaultMode="crcDefaultMode" :crcPassWord="crcPassWord"/>
  <Remark v-if="isRecommendation" @cancel="closeSelect('recommendation')" @listUpdated="updateList" type="reco"
          :crcDefaultMode="crcDefaultMode" :crcPassWord="crcPassWord"/>
  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
      position="bottom-right"
  />
  <PassWordCheck :type="passWordType" v-if="passLayout" :crcPassWord="crcPassWordVal"
                 @returnPassWordCheck="returnPassWordCheck"
                 @passWordClose="passWordClose"/>
  <ResultImage :nowCrcData="nowCrcDataRef" v-if="captureAndConvertOk"
               :captureAndConvertOk="captureAndConvertOk"
                @resetBool="resetBool"
  />
<!--  <ResultImage :nowCrcData="nowCrcDataRef" v-if="nowCrcDataRef.length !== 0"-->
<!--               :captureAndConvertOk="captureAndConvertOk"-->
<!--               @resetBool="resetBool"-->
<!--  />-->

</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeMount, onMounted, ref} from "vue";

import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import CrcList from "@/views/datebase/commponent/detail/report/component/crcList.vue";
import Remark from "@/views/datebase/commponent/detail/report/component/remark.vue";
import {crcDataGet, crcGet, crcOptionGet} from "@/common/api/service/setting/settingApi";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import Button from "@/components/commonUi/Button.vue";
import {getCbcCodeList, getCbcPathData, getLisPathData} from "@/common/lib/commonfunction/inhaCbcLis";
import {messages} from "@/common/defines/constFile/constantMessageText";
import PassWordCheck from "@/components/commonUi/PassWordCheck.vue";
import {detailRunningApi, updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {cbcDataGet, isAdultNormalCBC, lisSendSD, lisSendYwmc} from "@/common/lib/lisCbc";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constFile/siteCd";
import {ywmcLisCrcSendApi} from "@/common/api/service/lisSend/lisSend";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import moment from "moment";
import CellStatusDashBoard from "@/views/datebase/commponent/detail/report/component/cellStatusDashBoard.vue";
import ResultImage from "@/views/datebase/commponent/detail/report/component/resultImage.vue";

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
const store = useStore();
const toastMessage = ref('');
const toastMessageType = ref(messages.TOAST_MSG_SUCCESS)
const passWordType = ref('');
const isRemark = ref(false); // Remark 모달 창 열림/닫힘 상태
const isComment = ref(false);
const isRecommendation = ref(false);
const activeTab = ref(1); // 현재 탭 상태
const remarkList = ref<any[]>([]); // Remark 리스트 상태
const commentList = ref<any[]>([]);
const recoList = ref<any[]>([]);
const isContent = ref(false);
const crcDataArr = ref<any[]>([]);
const code = ref('');
const crcDefaultMode = ref(false);
const crcPassWord = ref('');
const trrur = ref(false);
const crcRemarkCount = ref<any>([]);
const passWordPass = ref(false);
const passWordPassLis = ref(false);
const passLayout = ref(false);
const crcPassWordVal = ref('');
const lisTwoMode = ref(false);
const userModuleDataGet = computed(() => store.state.userModule);
const searchText = ref('');
const showDropdown = ref(false);
const lisHotKey = ref('');
const lisFilePathSetArr = ref<any>([]);
const siteCd = computed(() => store.state.commonModule.siteCd);
const submitState = ref(false);
const morphologyMapping: any = ref({
  RBC: {},
  WBC: {},
  PLT: {},
});
const cbcCodeList = ref<any>([]);
const lastChnageInputCrcData = ref<any>([]);
const autoNomarlCheck = ref<any>([]);
const nowCrcDataRef = ref<any>([]);
const captureAndConvertOk = ref(false);

onBeforeMount(async () => {
  await nextTick();

  isContent.value = true;
  if (isContent.value) {
    const savedData = localStorage.getItem('crcSetData');
    const codeVal = localStorage.getItem('code') || '';
    const remarkListVal = localStorage.getItem('remarkList') || [];
    const commentListVal = localStorage.getItem('commentList') || [];
    const recoListVal = localStorage.getItem('recoList') || [];
    if (savedData) {
      crcArr.value = JSON.parse(savedData);
      code.value = JSON.parse(codeVal);
      searchText.value = JSON.parse(codeVal);

      if (typeof remarkListVal === "string") {
        remarkList.value = JSON.parse(remarkListVal);
      }

      if (typeof commentListVal === "string") {
        commentList.value = JSON.parse(commentListVal);
      }

      if (typeof recoListVal === 'string') {
        recoList.value = JSON.parse(recoListVal);
      }
      // 공통된 map 처리
      [remarkList, commentList, recoList].forEach(list => {
        list.value = list.value.map(item => ({
          ...item,
          remarkAllContent: convertToNewlines(item.remarkAllContent),
        }));
      });
      trrur.value = true;
    } else {
      crcArr.value = (await crcGet()).data;
      trrur.value = true;
      initializeList(recoList);
      initializeList(remarkList);
      initializeList(commentList);
    }

    crcDataArr.value = (await crcDataGet()).data;
  }
  const crcOptionApi = await crcOptionGet();
  if (crcOptionApi.data.length !== 0) {
    crcDefaultMode.value = crcOptionApi.data[0].crcMode;
    crcRemarkCount.value = crcOptionApi.data[0].crcRemarkCount;
    crcPassWord.value = crcOptionApi.data[0].crcPassWord;
    crcPassWordVal.value = crcOptionApi.data[0].crcPassWord;
    lisTwoMode.value = crcOptionApi.data[0].lisTwoMode;
  }
  const {lisFilePathSetArr: lisFilePathSetArrVar, lisHotKey: lisHotKeyVal} = await getLisPathData();
  lisHotKey.value = lisHotKeyVal;
  lisFilePathSetArr.value = lisFilePathSetArrVar;
  await newMorphMapSet();
});

onMounted(async () => {
  await nextTick()
  cbcCodeList.value = await getCbcCodeList();
  const cbcFilePathSetArr = await getCbcPathData();
  if (cbcFilePathSetArr && cbcFilePathSetArr !== '') {
    const {cbcData, cbcSex, cbcAge} = await cbcDataGet(props?.selectItems?.barcodeNo, cbcCodeList.value);
    autoNomarlCheck.value = await isAdultNormalCBC(cbcData, props?.selectItems?.wbcInfoAfter, props?.selectItems?.rbcInfoAfter, cbcSex, cbcAge);
    if (autoNomarlCheck.value.length === 0) {
      selectOption('Normal');
    }
  }
  submitState.value = props.selectItems?.submitState === 'lisCbc' || props.selectItems?.submitState === 'Submit';
});


const captureAndConvert = () => {
  captureAndConvertOk.value = true;
}
const resetBool = () => {
  captureAndConvertOk.value = false;

}

const selectOption = (selectedCode: string) => {
  code.value = selectedCode;   // 선택한 코드를 저장
  searchText.value = selectedCode;  // 검색창에 선택된 코드 표시
  showDropdown.value = false;  // 드롭다운 닫기
  changeCode(selectedCode);
};

const hideDropdownWithDelay = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200); // 작은 딜레이 추가
};
const filteredOptions = computed(() => {
  if (!searchText.value) {
    return crcDataArr.value; // 검색어가 없을 경우 전체 목록 표시
  }

  // 검색어와 일치하는 코드를 필터링
  return crcDataArr.value.filter(item =>
      item.code.toLowerCase().includes(searchText.value.toLowerCase())
  );
});
const convertToNewlines = (content: string) => {
  return content.replaceAll('<br>', '\r\n');
};

const remarkCountReturnCode = (idx: any) => {
  if (crcRemarkCount.value.length === 0) {
    return;
  }
  return crcRemarkCount.value[idx].checked;
}

let isHotKeyPressed = false;

const handleKeyDown = (event: KeyboardEvent) => {
  const keyName = event.key;

  if (!isHotKeyPressed && keyName.toUpperCase() === lisHotKey.value.toUpperCase()) {
    event.preventDefault(); // 기본 동작 방지
    isHotKeyPressed = true; // 한 번만 실행되도록 설정
    lisClick();
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  const keyName = event.key;

  if (keyName.toUpperCase() === lisHotKey.value.toUpperCase()) {
    isHotKeyPressed = false; // 키를 떼면 다시 실행 가능
  }
};

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

const lisClick = async () => {
  passWordType.value = 'lisCbc'
  if (!passWordPassLis.value && submitState.value) {
    passLayout.value = true;
    return
  } else {
    await lisStart();
  }

}
const updateCrcDataWithCode = (crcSetData: any, nowCrcData: any) => {
  ['plt', 'rbc', 'wbc'].forEach(category => {
    nowCrcData.crcContent[category].forEach((nowItem: any) => {
      // crcSetData -> 셋팅페이지에서 셋팅한 배열들 단일 배열
      const matchingItem = crcSetData.find((setItem: any) => setItem.id === nowItem.id);
      if (matchingItem && matchingItem.crcCode) {
        nowItem.crcTitle = matchingItem.crcCode;
      }
    });
  });

  return nowCrcData;
};

const changeCrcData = (item: any) => {
  const nes = JSON.parse(JSON.stringify(crcArr.value));
  const margeData = nes.findIndex((el: any) => {
    return el.id === item.id
  });
  nes[margeData].val = item.val
  lastChnageInputCrcData.value = nes
}

const newMorphMapSet = async () => {
  morphologyMapping.value = {
    RBC: {},
    WBC: {},
    PLT: {},
  };

  for (const el of crcArr.value) {
    if (!el.crcCode || !el.crcCodeMatching || !el.crcContent) {
      continue;
    }

    const matchingKeys = el.crcCodeMatching.split(',').map(key => key.trim());
    const contents = el.crcContent.split(',').map(content => content.trim());

    if (el.morphologyType === 'RBC') {
      // RBC에 새로운 속성 추가
      morphologyMapping.value.RBC[el.crcCode] = {};
      for (let i = 0; i < matchingKeys.length; i++) {
        const key = matchingKeys[i];
        const value = contents[i] ? contents[i] : "";
        morphologyMapping.value.RBC[el.crcCode][value] = key;
      }
    } else if (el.morphologyType === 'WBC') {
      // WBC에 새로운 속성 추가
      morphologyMapping.value.WBC[el.crcCode] = {};
      for (let i = 0; i < matchingKeys.length; i++) {
        const key = matchingKeys[i];
        const value = contents[i] ? contents[i] : "";
        morphologyMapping.value.WBC[el.crcCode][value] = key;
      }
    } else if (el.morphologyType === 'PLT') {
      // PLT에 새로운 속성 추가
      morphologyMapping.value.PLT[el.crcCode] = {};
      for (let i = 0; i < matchingKeys.length; i++) {
        const key = matchingKeys[i];
        const value = contents[i] ? contents[i] : "";
        morphologyMapping.value.PLT[el.crcCode][value] = key;
      }
    }
  }
};


// crcContent 업데이트 함수
const updateCrcContent = (crcSetData: any, nowCrcData: any) => {
  ['plt', 'rbc', 'wbc'].forEach(category => {
    nowCrcData.crcContent[category].forEach((nowItem: any) => {
      // text 타입은 변경하지 않고 유지
      if (nowItem.crcType !== 'select' && nowItem.crcContent !== 'Etc') return;

      // id 기준으로 crcSetData에서 매칭 항목 찾기
      const matchingItem = crcSetData.find((setItem: any) => setItem.id === nowItem.id);
      if (matchingItem && matchingItem.crcCode) {
        const categoryMapping = morphologyMapping.value[matchingItem.morphologyType];

        // 매핑이 존재하고 crcContent의 값이 매핑에 있으면 crcContent 값으로 변경
        if (categoryMapping && categoryMapping[matchingItem.crcCode]) {
          nowItem.crcContent = categoryMapping[matchingItem.crcCode][nowItem.crcContent] || nowItem.crcContent;
        }
      }
    });
  });

  return nowCrcData;
};


const lisStart = async () => {
  if (searchText.value === '') {
    toastMessageType.value = messages.TOAST_MSG_ERROR;
    showToast('Please enter the code.');
    passWordPassLis.value = false;
    return;
  }
  if (lastChnageInputCrcData.value.length !== 0) {
    crcArr.value = lastChnageInputCrcData.value;
  }
  const crcSetData = crcArr.value;

  let nowCrcData: any = crcDataArr.value.find((item) => {
    return item.code === code.value
  });
  ['plt', 'rbc', 'wbc'].forEach(category => {
    nowCrcData.crcContent[category].forEach((nowItem: any) => {
      for (const el of crcSetData) {
        if (nowItem.id === el.id) {
          if (el.crcType === 'select') {
            nowItem.crcContent = el.val;
          } else {
            nowItem.crcContent = el.crcContent;
          }
        }
      }
    });
  });
  Object.assign(nowCrcData, {
    crcRemark: remarkList.value,
    crcComment: commentList.value,
    crcRecommendation: recoList.value
  });
  nowCrcData = updateCrcDataWithCode(crcSetData, nowCrcData);
  nowCrcData = updateCrcContent(crcSetData, nowCrcData);
  // console.log(nowCrcData)

  switch (siteCd.value) {
    case HOSPITAL_SITE_CD_BY_NAME['SD의학연구소']:
      await lisCommonDataWhether(lisSendSD(props.selectItems?.barcodeNo, nowCrcData, lisFilePathSetArr.value));
      break;
    case HOSPITAL_SITE_CD_BY_NAME['원주기독병원']:
      await yamcSendLisUpdate(nowCrcData);
      break;
    case HOSPITAL_SITE_CD_BY_NAME['UIMD']:
      await yamcSendLisUpdate(nowCrcData);
      break;
    case HOSPITAL_SITE_CD_BY_NAME['NONE']:
      await yamcSendLisUpdate(nowCrcData);
      break;
    default:
      await lisCommonDataWhether(lisSendSD(props.selectItems?.barcodeNo, nowCrcData, lisFilePathSetArr.value));
      break;
  }
}


const yamcSendLisUpdate = async (nowCrcData: any) => {
  nowCrcDataRef.value = nowCrcData;
  await nextTick();
  await captureAndConvert();
}

const lisCommonDataWhether = async (lisFunc: any) => {
  const resText = await lisFunc;
  if (resText === 'Success') {
    await commonSucessLis();
  } else {
    toastMessageType.value = messages.TOAST_MSG_ERROR;
    showToast('Lis Send Fail');
  }
}

const commonSucessLis = async () => {
  if (props.selectItems?.id) {
    const result: any = await detailRunningApi(String(props.selectItems?.id));
    const localTime = moment().local();
    const updatedItem = {
      submitState: 'lisCbc',
      submitOfDate: localTime.format(),
      submitUserId: userModuleDataGet.value.userId,
    };
    const updatedRuningInfo = {id: result.data.id, ...updatedItem}
    await resRunningItem(updatedRuningInfo, true);
    submitState.value = true;
  }
  toastMessageType.value = messages.TOAST_MSG_SUCCESS;
  showToast(messages.IDS_MSG_SUCCESS);
}

const resRunningItem = async (updatedRuningInfo: any, noAlert?: boolean) => {
  try {
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const response: any = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: [updatedRuningInfo],
      dayQuery: dayQuery,
    })
    if (response) {
      await store.dispatch('commonModule/setCommonInfo', {currentSelectItems: response?.data[0]});
      if (!noAlert) {
        toastMessageType.value = messages.TOAST_MSG_SUCCESS;
        showToast('Success');
      }
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// const listDel = (idx: any, type: string) => {
//   if (type === 'remark') {
//     remarkList.value.splice(idx, 1);
//   } else if (type === 'reco') {
//     recoList.value.splice(idx, 1);
//   } else if (type === 'comment') {
//     commentList.value.splice(idx, 1);
//   }
// }

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

// 자식 컴포넌트로부터 업데이트된 리스트를 받음
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

const updateList = (newList: any[], type: string) => {
  initializeList(recoList);
  initializeList(remarkList);
  initializeList(commentList);

  switch (type) {
    case 'remark':
      remarkallContentPush(newList, remarkList)
      closeSelect('remark');
      break;
    case 'comment':
      remarkallContentPush(newList, commentList)
      closeSelect('comment');
      break;
    case 'reco':
      remarkallContentPush(newList, recoList)
      closeSelect('recommendation');
      break;
  }
}
const remarkallContentPush = (newList: any, list) => {
  for (const el of newList) {
    list.value[0].remarkAllContent += convertToNewlines(el.remarkAllContent)
  }
  list.value[0].remarkAllContent += '\r'
}
const adminPassword = () => {
  passWordType.value = ''
  if (!passWordPass.value) {
    passLayout.value = true;
    return
  } else {
    activeTab.value = 2;
  }
}

const cellStatus = () => {
  activeTab.value = 3;
}

const returnPassWordCheck = (val: boolean) => {
  const isDefaultPassword = passWordType.value === '';

  const closePassModal = () => {
    passLayout.value = false;
  };

  const handleSuccess = () => {
    isDefaultPassword ? (passWordPass.value = true) : (passWordPassLis.value = true);
    closePassModal();

    isDefaultPassword ? (activeTab.value = 2) : (lisStart(), passWordPassLis.value = false);
  };

  const handleFailure = () => {
    isDefaultPassword ? (passWordPass.value = false) : (passWordPassLis.value = false);
    closePassModal();
    toastMessageType.value = messages.TOAST_MSG_ERROR;
    showToast("The administrator password is incorrect.");
  };

  val ? handleSuccess() : handleFailure();
};


const passWordClose = () => {
  passLayout.value = false;
}
// 코드 변경 시 로직 처리
const changeCode = async (codeVal: string) => {
  code.value = codeVal;
  searchText.value = codeVal;
  const filterArr = crcDataArr.value.filter((item) => item.code === codeVal);

  const types = ['plt', 'rbc', 'wbc'];

  types.forEach(type => {
    filterArr[0].crcContent[type].forEach((content: any) => {
      const match = crcArr.value.find((item: any) => item.id === content.id);
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
  commentList.value = filterArr[0].crcComment || [];
  recoList.value = filterArr[0].crcRecommendation || [];

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
};

// tempSave를 클릭 시 로컬 스토리지에 데이터 저장
const tempSaveLocalStorage = () => {
  localStorage.setItem('code', JSON.stringify(code.value))
  localStorage.setItem('crcDataArr', JSON.stringify(crcDataArr.value));
  localStorage.setItem('crcSetData', JSON.stringify(crcArr.value));
  localStorage.setItem('remarkList', JSON.stringify(remarkList.value));
  localStorage.setItem('commentList', JSON.stringify(commentList.value));
  localStorage.setItem('recoList', JSON.stringify(recoList.value));
  toastMessageType.value = messages.TOAST_MSG_SUCCESS;
  showToast('Data saved to temporary storage')
};

const tempSaveDataEmpty = async () => {
  localStorage.removeItem('code')
  localStorage.removeItem('crcDataArr');
  localStorage.removeItem('crcSetData');
  localStorage.removeItem('remarkList');
  localStorage.removeItem('commentList');
  localStorage.removeItem('recoList');

  crcArr.value = [];
  crcArr.value = (await crcGet()).data;
  recoList.value = [];
  remarkList.value = [];
  commentList.value = [];
  code.value = '';
  searchText.value = '';
  toastMessageType.value = messages.TOAST_MSG_SUCCESS;
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


</script>
