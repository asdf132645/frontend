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
          @click="adminPassword()"
      >
        종합결과코드 LIST
      </button>
    </div>
    <!-- 첫 번째 탭 콘텐츠 -->
    <div class="tab-content crcDiv" v-if="activeTab === 1">
      <div class="textLeft crcMenu mb1">
        <button class="crcBtn" @click="lisClick">
          <font-awesome-icon :icon="['fas', 'upload']"/>
        </button>
        <span class="crcSpanMenu">List</span>
        <div class="autocomplete-container ml1">
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
        <button class="crcBtn tempSave ml1" @click="tempSaveLocalStorage">Save</button>
        <button class="crcBtn tempSave ml1" @click="tempSaveDataEmpty">Clear</button>

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
      <div class="mt2" v-if="remarkCountReturnCode(0)">
        <div class="crcDivTitle">
          <span><font-awesome-icon :icon="['fas', 'message']" /> Remark</span>
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

      <div class="mt2" v-if="remarkCountReturnCode(1)">
        <div class="crcDivTitle">
          <span><font-awesome-icon :icon="['fas', 'message']" /> Comment </span>
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

      <div class="mt2" v-if="remarkCountReturnCode(2)">
        <div class="crcDivTitle">
          <span><font-awesome-icon :icon="['fas', 'message']" /> Recommendation </span>
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

    <!-- 두 번째 탭 콘텐츠 -->
    <div class="tab-content crcDiv" v-if="activeTab === 2">
      <CrcList :crcPassWord="crcPassWord" :crcArr="crcArr" @refresh="pageRefresh"/>
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
      :duration="1500"
      position="bottom-right"
  />
  <PassWordCheck :type="passWordType" v-if="passLayout" :crcPassWord="crcPassWordVal" @returnPassWordCheck="returnPassWordCheck"
                 @passWordClose="passWordClose"/>

</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeMount , ref } from "vue";
import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import CrcList from "@/views/datebase/commponent/detail/report/component/crcList.vue";
import Remark from "@/views/datebase/commponent/detail/report/component/remark.vue";
import {crcDataGet, crcGet, crcOptionGet} from "@/common/api/service/setting/settingApi";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import Button from "@/components/commonUi/Button.vue";
import {getLisPathData, getLisWbcRbcData} from "@/common/lib/commonfunction/inhaCbcLis";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import {createH17, readCustomH7Message} from "@/common/api/service/fileReader/fileReaderApi";
import {messages} from "@/common/defines/constFile/constantMessageText";
import PassWordCheck from "@/components/commonUi/PassWordCheck.vue";
import {detailRunningApi, updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";

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
const passLayout = ref(false);
const crcPassWordVal = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const searchText = ref('');
const showDropdown = ref(false);
const lisHotKey = ref('');

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
      trrur.value = true;
    } else {
      crcArr.value = (await crcGet()).data;
      trrur.value = true;
    }

    crcDataArr.value = (await crcDataGet()).data;
  }
  const crcOptionApi = await crcOptionGet();
  if (crcOptionApi.data.length !== 0) {
    crcDefaultMode.value = crcOptionApi.data[0].crcMode;
    crcRemarkCount.value = crcOptionApi.data[0].crcRemarkCount;
    crcPassWord.value = crcOptionApi.data[0].crcPassWord;
    crcPassWordVal.value = crcOptionApi.data[0].crcPassWord;
  }
  const {lisFilePathSetArr: lisFilePathSetArrVar, lisHotKey: lisHotKeyVal} = await getLisPathData();
  lisHotKey.value = lisHotKeyVal;

});
// 옵션 선택 시 호출되는 함수
const selectOption = (selectedCode: string) => {
  code.value = selectedCode;   // 선택한 코드를 저장
  searchText.value = selectedCode;  // 검색창에 선택된 코드 표시
  showDropdown.value = false;  // 드롭다운 닫기
  changeCode(selectedCode);
};

// 입력 필드가 포커스를 잃을 때 드롭다운을 닫는 함수 (딜레이로 클릭을 허용)
const hideDropdownWithDelay = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200); // 작은 딜레이 추가
};
// 검색어에 따라 필터링된 옵션을 계산하는 computed
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
  passWordType.value = 'lis'
  if (!passWordPass.value) {
    passLayout.value = true;
    return
  }

}
const lisStart = async () => {
  if(searchText.value === ''){
    showToast('Please enter the code.');
    passWordPass.value = false;
    return;
  }
  const nowCrcData = crcDataArr.value.find((item) => {
    return item.code === code.value
  })
  nowCrcData.crcRemark = remarkList.value;
  nowCrcData.crcComment = commentList.value;
  nowCrcData.crcRecommendation = recoList.value;
  const {lisFilePathSetArr} = await getLisPathData();
  const {lisCodeWbcArr} = await getLisWbcRbcData();
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
      if (props.selectItems?.id) {
        const result: any = await detailRunningApi(String(props.selectItems?.id));
        const updatedItem = {
          submitState: 'lis',
        };
        const updatedRuningInfo = {id: result.data.id, ...updatedItem}
        await resRunningItem(updatedRuningInfo, true);
      }
      showToast(messages.IDS_MSG_SUCCESS);
    } catch (error: any) {
      showToast(error);
    }
  }
}
const resRunningItem = async (updatedRuningInfo: any, noAlert?: boolean) => {
  try {
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const response = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: [updatedRuningInfo],
      dayQuery: dayQuery,
    })
    if (response) {
      if (!noAlert) {
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

const updateList = (newList: any[], type: string) => {
  console.log(newList)
  switch (type) {
    case 'remark':
      remarkList.value[0].remarkAllContent += convertToNewlines(newList[0].remarkAllContent);
      closeSelect('remark');
      break;
    case 'comment':
      commentList.value[0].remarkAllContent += convertToNewlines(newList[0].remarkAllContent);
      closeSelect('comment');
      break;
    case 'reco':
      recoList.value[0].remarkAllContent += convertToNewlines(newList[0].remarkAllContent);
      closeSelect('recommendation');
      break;
  }
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

const returnPassWordCheck = (val: boolean) => {
  if (val) {
    passWordPass.value = true;
    // 패스 체크 모달 닫기
    passLayout.value = false;
    if(passWordType.value === ''){
      activeTab.value = 2;
    }else{
      lisStart();
      passWordPass.value = false;
    }
  } else {
    passWordPass.value = false;
    // 패스 체크 모달 닫기
    passLayout.value = false;
    showToast("The administrator password is incorrect.");
  }
}

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
