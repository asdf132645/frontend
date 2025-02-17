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
          v-if="siteCd === HOSPITAL_SITE_CD_BY_NAME['NONE']"
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
              placeholder="Code Search"
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
        <button class="crcBtn tempSave ml10" @click="IsWbcImageSelect = true" v-if="siteCd === HOSPITAL_SITE_CD_BY_NAME['원주기독병원']">
          Image Select
        </button>
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
      <div class="mt20" v-if="remarkCountReturnCode(0) && ywmcSlip === 'H3'">
        <div class="crcDivTitle">
          <span>
            <font-awesome-icon :icon="['fas', 'message']"/>
            {{ setCrcTitles(siteCd, crcRemarkCount[0].name) }}
          </span>

          <button class="reSelect" @click="openSelect('remark')">
            {{ setCrcTitles(siteCd, crcRemarkCount[0].name) }}
            Select
          </button>
        </div>

        <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
        <div class="remarkUlList">
          <div v-for="(item, index) in remarkList" :key="index">
            <textarea maxlength="1000" v-model="item.remarkAllContent"></textarea>
          </div>
        </div>
      </div>

      <div class="mt20" v-if="remarkCountReturnCode(1) && ywmcSlip === 'H3'">
        <div class="crcDivTitle">
          <span><font-awesome-icon :icon="['fas', 'message']"/> {{ setCrcTitles(siteCd, crcRemarkCount[1].name) }} </span>
          <button class="reSelect" @click="openSelect('comment')">
            {{ setCrcTitles(siteCd, crcRemarkCount[1].name) }}
            Select
          </button>
        </div>

        <div class="remarkUlList">
          <div v-for="(item, index) in commentList" :key="index">
            <textarea maxlength="1000" v-model="item.remarkAllContent"></textarea>
          </div>
        </div>
      </div>

      <div class="mt20" v-if="remarkCountReturnCode(2) && ywmcSlip === 'H3'">
        <div class="crcDivTitle">
          <span>
            <font-awesome-icon :icon="['fas', 'message']"/>
            {{ setCrcTitles(siteCd, crcRemarkCount[2].name) }}
          </span>
          <button class="reSelect" @click="openSelect('recommendation')">
            {{ setCrcTitles(siteCd, crcRemarkCount[2].name) }}
            Select
          </button>
        </div>

        <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
        <div class="remarkUlList">
          <div v-for="(item, index) in recoList" :key="index">
            <textarea v-model="item.remarkAllContent"></textarea>
          </div>
        </div>
      </div>

      <div class="mt20" v-if="ywmcSlip === 'H1'">
        <div class="crcDivTitle">
          <span><font-awesome-icon :icon="['fas', 'message']"/> CBC flag </span>
        </div>

        <!-- 업데이트된 Remark 리스트를 보여주는 부분 -->
        <div class="remarkUlList">
          <div>
            <textarea v-model="cbcFlag" @input="checkTextAreaMaxLength()"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 두 번째 탭 콘텐츠 -->
    <CrcList :crcPassWord="crcPassWord" :crcRemarkCount="crcRemarkCount" :crcArr="crcArr" @refresh="pageRefresh" v-if="activeTab === 2"/>
    <div class="tab-content crcDiv reportCrcDiv dashboard" v-if="activeTab === 3">
      <cell-status-dash-board :autoNomarlCheck="autoNomarlCheck"/>
    </div>
    <AutoCBCMatching v-if="autoCBCMatchingShow" :isAutoCBCMatchingArr="isAutoCBCMatchingArr" @codeSelect="codeSelect"
                     @codeClose="codeClose"/>

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
  />
  <PassWordCheck :type="passWordType" v-if="passLayout" :crcPassWord="crcPassWordVal"
                 @returnPassWordCheck="returnPassWordCheck"
                 @passWordClose="passWordClose"/>
  <ResultImage :nowCrcData="nowCrcDataRef" v-if="captureAndConvertOk"
               :captureAndConvertOk="captureAndConvertOk"
               @resetBool="resetBool"
               :patientNm="selectItems?.cbcPatientNm"
               :barcodeNo="selectItems?.barcodeNo"
               :commentList="commentList"
               :recoList="recoList"
               :selectWbcImgArr="selectWbcImgArr"
               :slotId="selectItems?.slotId"
  />
  <WbcImageSelect v-if="IsWbcImageSelect" :selectItems="selectItems" @closeWbcSelect="closeWbcSelect"
                  @selectWbcImgSend="selectWbcImgSend"
  />
  <teleport to="body">
    <LisRef :nowCrcDataLis="nowCrcDataLis" v-if="kcchOnOff" :selectItems="selectItems" @resetLisRtf="resetLisRtf" />
  </teleport>
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeMount, onMounted, ref, watch} from "vue";

import CrcCompontent from "@/components/commonUi/crcCompontent.vue";
import CrcList from "@/views/datebase/commponent/detail/report/component/crcList.vue";
import Remark from "@/views/datebase/commponent/detail/report/component/remark.vue";
import {
  crcDataGet,
  crcGet,
  crcOptionGet,
  saveDataCreateApi, saveDataPutDataApi,
  saveDataSlotIdGetApi
} from "@/common/api/service/setting/settingApi";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import Button from "@/components/commonUi/Button.vue";
import {getCbcCodeList, getCbcPathData, getLisPathData} from "@/common/helpers/lisCbc/inhaCbcLis";
import {MESSAGES} from "@/common/defines/constants/constantMessageText";
import PassWordCheck from "@/components/commonUi/PassWordCheck.vue";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {cbcDataGet, isAdultNormalCBC, isAutoCBCMatching} from "@/common/helpers/lisCbc";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import moment from "moment";
import CellStatusDashBoard from "@/views/datebase/commponent/detail/report/component/cellStatusDashBoard.vue";
import ResultImage from "@/views/datebase/commponent/detail/report/component/resultImage.vue";
import { lisSendSD } from "@/common/helpers/lisCbc/sdCbcLis";
import AutoCBCMatching from "@/views/datebase/commponent/detail/report/component/autoCBCMatching.vue";
import WbcImageSelect from "@/views/datebase/commponent/detail/report/component/wbcImageSelect.vue";
import {ywmcCbcDataLoad} from "@/common/helpers/lisCbc/ywmcCbcLis";
import {ywmcSaveCommentPostSendApi} from "@/common/api/service/lisSend/lisSend";
import {RunningInfoCBCType} from "@/common/api/service/runningInfo/dto/runningInfoDto";
import LisRef from "@/views/datebase/commponent/detail/report/component/lisRef.vue";
import { changeRemark, kcch_0033GetCBCData } from "@/common/helpers/lisCbc/kcch_0033";
import {kcchCbcAutoMatching, KcchCbcAutoMatchingReturn} from "@/common/defines/constants/autoResultCodeMatching";
import {setCrcTitles} from "@/common/helpers/crc/crcContent";

const crcArr = ref<any>([]);
const props = defineProps({
  crcDataVal: {
    type: Array,
    required: true,
  },
  selectItems: {
    type: Array
  },
  triggerChangeCRCMorphology: {
    type: Boolean,
  }
});
const store = useStore();
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS)
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
const slideData = computed(() => store.state.slideDataModule);
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);

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
const isAutoCBCMatchingArr = ref<any>([]);
const autoCBCMatchingShow = ref(false);
const IsWbcImageSelect = ref(false);
const selectWbcImgArr = ref<any>([]);
const ywmcSlip = ref('H3');
const cbcFlag = ref('');
const kcchOnOff = ref(false);
const nowCrcDataLis = ref([]);
const createdSummary = ref<any>({
  RBC: [],
  WBC: [],
  PLT: [],
});

const selectWbcImgSend = (arr: any) => {
  selectWbcImgArr.value = [];
  selectWbcImgArr.value = arr;
  toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
  showToast('Success');
  IsWbcImageSelect.value = false;
}
onBeforeMount(async () => {
  await nextTick();

  isContent.value = true;
  if (isContent.value) {
    const saveDataGet: any = await saveDataSlotIdGetApi(props?.selectItems?.slotId);
    const crcSettingData = saveDataGet.data.crcArr;
    const codeVal = saveDataGet.data.code || '';
    const remarkListVal = saveDataGet.data.remarkList || [];
    const commentListVal = saveDataGet.data.commentList || [];
    const recoListVal = saveDataGet.data.recoList || [];
    if (crcSettingData) {
      crcArr.value = crcSettingData;
      code.value = codeVal;
      searchText.value = codeVal;
      remarkList.value = remarkListVal;
      commentList.value = commentListVal;
      recoList.value = recoListVal;

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
  await nextTick();
  await dataAutoComputeLoad();
  submitState.value =  props.selectItems?.submitState.includes('lis') || props.selectItems?.submitState === 'Submit';
  if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['원주기독병원']) {
    const {data, cbcDataVal, slip} = await ywmcCbcDataLoad(props.selectItems?.barcodeNo, await getCbcCodeList());
    ywmcSlip.value = slip;
    cbcFlag.value = '';

    await updateCbcDataToDatabase({
      cbcPatientNo: cbcDataVal?.pt_no,
      cbcPatientNm: cbcDataVal?.pt_nm,
      cbcSex: cbcDataVal?.sex,
      cbcAge: cbcDataVal?.age,
    })

    for (const el of data) {
      switch (el.classNm.trim()) {
        case '8HN109GBL_F':
          cbcFlag.value += 'Blasts Flag\n'
          break;
        case '8HN109G_NRBC_F':
          cbcFlag.value += 'Nucleated RBC Flag\n'
          break;
        case '8HN109G_ATYP_FRAG':
          cbcFlag.value += 'Atypical Lymphocyte Flag\n'
          break;
        case '8HN109GIG_F':
          cbcFlag.value += 'Immature Granulocytes Flag\n'
          break;
      }
    }
  } else {
    ywmcSlip.value = 'H3'; // 원주기독에 독단적인 커스텀마이징 때문에 강제적으로 H3 pbs 기준으로 맞춤..
  }
});

watch(() => props.triggerChangeCRCMorphology, async () => {
  await initCbcData0033();
})

const initCbcData0033 = async () => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const cbcFilePathSetArr = await getCbcPathData();
  cbcCodeList.value = await getCbcCodeList();

  try {
    const cbcResult = await kcch_0033GetCBCData({
      iaRootPath: path,
      barcodeNo: props.selectItems?.barcodeNo,
      slotId: props.selectItems?.slotId,
      cbcFilePathSetArr,
      cbcCodeList: cbcCodeList.value,
    }); // 원자력 병원 CRC 받아온 데이터


    if (cbcResult?.resultCBCCode) {
      const autoChangeCodes = await Promise.all(cbcResult.resultCBCCode.map(async (cbcItem) => {
        return kcchCbcAutoMatching({ data: cbcItem, sex: cbcResult?.cbcSex, age: cbcResult?.cbcAge });
      }));

      const flattedAutoChangeCodes = autoChangeCodes.flat();

      for (const item of flattedAutoChangeCodes) {
        createdSummary.value[item.moType].push({
          moType: item.moType,
          title: item.title,
          content: item.content,
        });
      }

      mapResultToCrcArr(autoChangeCodes.flat(), crcArr.value);
    }

    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    showToast('Successfully Applied');
  } catch (err) {
    console.error(err);
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    showToast('Failed to Apply');
  }
}

const mapResultToCrcArr = (result: KcchCbcAutoMatchingReturn[], crcArr: any) => {
  crcArr.forEach((crcItem) => {
    const matchingItem = result.find(
        (item) =>
            item.moType.toUpperCase() === crcItem.morphologyType.toUpperCase() && item.title.toUpperCase() === crcItem.crcTitle.toUpperCase()
    );
    if (matchingItem) {
      crcItem.val = matchingItem.content;
    }
  });
}

const closeWbcSelect = () => {
  IsWbcImageSelect.value = false;
}
const dataAutoComputeLoad = async () => {
  cbcCodeList.value = await getCbcCodeList();
  const cbcFilePathSetArr = await getCbcPathData();
  if (cbcFilePathSetArr && cbcFilePathSetArr !== '' && siteCd.value === HOSPITAL_SITE_CD_BY_NAME['SD의학연구소']) {
    const {cbcData, cbcSex, cbcAge} = await cbcDataGet(props?.selectItems?.barcodeNo, cbcCodeList.value);
    autoNomarlCheck.value = await isAdultNormalCBC(cbcData, props?.selectItems?.wbcInfoAfter, props?.selectItems?.rbcInfoAfter, cbcSex, cbcAge);
    const saveDataGet = await saveDataSlotIdGetApi(props?.selectItems?.slotId);
    const crcSettingData = saveDataGet?.data?.crcArr;
    if (!crcSettingData) {
      if (autoNomarlCheck.value.length === 0) {
        selectOption('Normal');
      } else {
        const res = await isAutoCBCMatching(cbcData, cbcSex, cbcAge);
        isAutoCBCMatchingArr.value = res;
        if (isAutoCBCMatchingArr.value.length !== 0) {
          autoCBCMatchingShow.value = true;
        } else {
          autoCBCMatchingShow.value = true;
        }
      }
    }
  }
}

const codeSelect = (code: string) => {
  selectOption(code);
  autoCBCMatchingShow.value = false;
}

const codeClose = () => {
  autoCBCMatchingShow.value = false;
}

const captureAndConvert = async () => {
  captureAndConvertOk.value = true;
}
const resetBool = () => {
  captureAndConvertOk.value = false;
}

const resetLisRtf = () => {
  kcchOnOff.value = false;
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

const updateCrcContent0031 = (crcSetData: any, nowCrcData: any) => {
  const rbcSixTypes = ['Spheocyte', 'Elliptocyte', 'Tear drop cell', 'Schistocyte', 'Acanthocyte', 'Target cell'];
  ['plt', 'rbc', 'wbc'].forEach(category => {
    nowCrcData.crcContent[category].forEach((nowItem: any) => {
      // text 타입은 변경하지 않고 유지
      if (nowItem.crcType !== 'select' && nowItem.crcContent !== 'Etc') return;
      if (nowItem.crcTitle === 'RBC_POIK' && !rbcSixTypes.includes(nowItem.crcContent)) {
        nowCrcData.crcContent[category].push({
          crcTitle: 'RBC_POIK_ETC',
          crcType: 'text',
          crcContent: nowItem.crcContent,
        })
        nowItem.crcContent = '000000';
      } else {
        // id 기준으로 crcSetData에서 매칭 항목 찾기
        const matchingItem = crcSetData.find((setItem: any) => setItem.id === nowItem.id);
        if (matchingItem && matchingItem.crcCode) {
          const categoryMapping = morphologyMapping.value[matchingItem.morphologyType];
          // 매핑이 존재하고 crcContent의 값이 매핑에 있으면 crcContent 값으로 변경
          if (categoryMapping && categoryMapping[matchingItem.crcCode]) {
            nowItem.crcContent = categoryMapping[matchingItem.crcCode][nowItem.crcContent] || nowItem.crcContent;
          }
        }
      }
    });
  });

  return nowCrcData;
};


const lisStart = async () => {
  if (searchText.value === '') {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
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
  typeof remarkList.value[0]?.remarkAllContent === "string"
      ? remarkList.value[0].remarkAllContent.replace(/\n/g, "\r")
      : "";
  typeof commentList.value[0]?.remarkAllContent === "string"
      ? commentList.value[0].remarkAllContent.replace(/\n/g, "\r")
      : "";

  typeof recoList.value[0]?.remarkAllContent === "string"
      ? recoList.value[0].remarkAllContent.replace(/\n/g, "\r")
      : "";

  Object.assign(nowCrcData, {
    crcRemark: remarkList.value,
    crcComment: commentList.value,
    crcRecommendation: recoList.value
  });
  nowCrcData = updateCrcDataWithCode(crcSetData, nowCrcData);
  nowCrcData = updateCrcContent(crcSetData, nowCrcData);
  switch (siteCd.value) {
    case HOSPITAL_SITE_CD_BY_NAME['SD의학연구소']:
      await lisCommonDataWhether(lisSendSD(props.selectItems?.barcodeNo, nowCrcData, lisFilePathSetArr.value, props?.selectItems?.patientNm));
      break;
    case HOSPITAL_SITE_CD_BY_NAME['원주기독병원']:
      await yamcSendLisUpdate(nowCrcData);
      break;
    case HOSPITAL_SITE_CD_BY_NAME['원자력병원']:
      kcchOnOff.value = true;
      nowCrcDataLis.value = nowCrcData;
      break;
    case HOSPITAL_SITE_CD_BY_NAME['UIMD']:
      break;
    case HOSPITAL_SITE_CD_BY_NAME['NONE']:
      break;
    default:
      nowCrcDataLis.value = nowCrcData;
      break;
  }
}


const yamcSendLisUpdate = async (nowCrcData: any) => {
  nowCrcDataRef.value = nowCrcData;
  await nextTick();
  if (ywmcSlip.value.trim() === 'H3') {
    await captureAndConvert();
  } else {

    if (cbcFlag.value.length > 60) {
      toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
      showToast('Text is too long');
      return;
    }

    if (cbcFlag.value.length === 0) {
      toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
      showToast('Please enter CBC flag.');
      return;
    }

    //props.barcodeNo
    const saveData = {
      tsmp_no: props.selectItems?.barcodeNo,
      text_rslt: cbcFlag.value
    }
    const setDataYWmc = await ywmcSaveCommentPostSendApi(saveData);
    if (setDataYWmc?.code === 201) {
      toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
      showToast('Success');
    } else {
      toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
      showToast('Lis fail');
    }

  }
}

const lisCommonDataWhether = async (lisFunc: any) => {
  const resText = await lisFunc;
  if (resText === 'Success') {
    await commonSucessLis();
  } else {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    showToast('Lis Send Fail');
  }
}

const commonSucessLis = async () => {
  if (props.selectItems?.id) {
    const localTime = moment().local();
    const updatedItem = {
      submitState: 'lisCbc',
      submitOfDate: localTime.format(),
      submitUserId: userModuleDataGet.value.userId,
    };
    const updatedRuningInfo = { id: props.selectItems?.id, ...updatedItem };
    await resRunningItem(updatedRuningInfo, true);
    submitState.value = true;
  }
  toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
  showToast(MESSAGES.IDS_MSG_SUCCESS);
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
      if (!noAlert) {
        toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
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
      if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['원자력병원']) {
        createSummary();
      } else {
        isRemark.value = true;
      }
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
    if (list.value[0].remarkAllContent.length === 0) {
      list.value[0].remarkAllContent += convertToNewlines(el.remarkAllContent);
    } else {
      list.value[0].remarkAllContent += '\r\r'
      list.value[0].remarkAllContent += convertToNewlines(el.remarkAllContent);
    }
  }
  // list.value[0].remarkAllContent += '\r'
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
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
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
const tempSaveLocalStorage = async () => {
  const saveDataGet: any = await saveDataSlotIdGetApi(props.selectItems.slotId);
  const data = {
    slotId: props.selectItems.slotId,
    code: code.value,
    crcDataArr: crcDataArr.value,
    crcArr: crcArr.value,
    remarkList: remarkList.value,
    commentList: commentList.value,
    recoList: recoList.value
  }
  if (saveDataGet?.data.length === 0) {
    await saveDataCreateApi(data);
  } else {
    await saveDataPutDataApi(data);
  }

  toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
  showToast('Data saved to temporary storage')
};

const tempSaveDataEmpty = async () => {
  // await saveDataDeleteApi({slotId: props.selectItems.slotId});
  crcArr.value = [];
  crcArr.value = (await crcGet()).data;
  cbcFlag.value = '';
  recoList.value = [{ id: 0, code: '', remarkContent: '', remarkAllContent: '' }];
  remarkList.value = [{ id: 0, code: '', remarkContent: '', remarkAllContent: '' }];
  commentList.value = [{ id: 0, code: '', remarkContent: '', remarkAllContent: '' }];
  code.value = '';
  searchText.value = '';
  createdSummary.value = { RBC: [], WBC: [], PLT: [] };
  toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
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

const checkTextAreaMaxLength = () => {
  switch (siteCd.value) {
    case HOSPITAL_SITE_CD_BY_NAME['원주기독병원']:
      const cbcFlagLength = cbcFlag.value.length;
      if (cbcFlagLength > 60) {
        cbcFlag.value = cbcFlag.value.substring(0, 60);
        toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
        showToast('Text is too long');
      }
      break;
    default:
      break;
  }
}

const updateCbcDataToDatabase = async ({ cbcPatientNo, cbcPatientNm, cbcSex, cbcAge }: RunningInfoCBCType) => {
  const updatedItem = { cbcPatientNo, cbcPatientNm, cbcSex, cbcAge };
  const updatedRuningInfo = { id: slideData.value.id, ...updatedItem };
  await resRunningItem(updatedRuningInfo, true);
}

const createSummary = () => {
  changeRemark(crcArr.value, createdSummary.value, remarkList.value)

}

</script>
