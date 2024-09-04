<template>
  <img class="mt1" v-if="type !== 'report' && !barCodeImageShowError" @error="onImageError" :src="barcodeImg"/>
  <div class="mt1" v-else-if="type !== 'report' && barCodeImageShowError" style="height: 209.5px;"></div>
  <div class="mt1 mb2 flexSpaceBetween">
    <h3 class="wbcClassInfoLeft">
      {{ wbcClassTileChange() }}
    </h3>

    <ul class="leftWbcInfo">
      <li @click="barcodeCopy">
        <font-awesome-icon :icon="['fas', 'copy']"/>
      </li>
      <li style="position: relative">
        <font-awesome-icon :icon="['fas', 'comment-dots']" class="memoOpenBtn" @click="memoOpen"/>
        <div v-if="memoModal" class="memoModal">
          <textarea v-model="wbcMemo"></textarea>
          <button class="memoModalBtn" @click="memoChange">OK</button>
          <button class="memoModalBtn" @click="memoCancel">CANCEL</button>
        </div>
      </li>
      <li
          @click="commitConfirmed"
          :class="{'submitted': selectItems?.submitState === 'Submit',}"
      >
        <font-awesome-icon :icon="['fas', 'square-check']"/>
      </li>
      <li
          @click="lisModalOpen"
          :class="{'submitted': selectItems?.submitState === 'lis' || lisBtnColor,}"
      >
        <font-awesome-icon :icon="['fas', 'upload']"/>
      </li>
      <li>
        <font-awesome-icon :icon="['fas', 'lock']" v-if="!toggleLock" @click="toggleLockEvent"/>
        <font-awesome-icon :icon="['fas', 'lock-open']" v-if="toggleLock" @click="toggleLockEvent"/>
      </li>
    </ul>
  </div>
  <div class="wbcClassScroll">
    <ul class="nth1Child classAttribute">
      <li>Class</li>
      <li class="wbcTitleText">
        <p class="firstP">Before</p>
        <p>(Count | Percent)</p>
      </li>
      <li class="wbcTitleText">
        <p class="firstP">After</p>
        <p>(Count | Percent)</p>
      </li>
    </ul>
    <div
        v-for="(item, idx) in wbcInfoVal"
        :key="item.id"
        class="wbcClassDbDiv"
        draggable="true"
        @dragstart="startDrag(idx, $event)"
        @dragover.prevent
        @drop="drop(idx, $event)"
    >
      <ul :class="{'nth1Child': true, 'cursorMove': toggleLock}" v-if="shouldRenderCategory(item.title)"
          @click="goClass(item.id)" title="BLUE text: changed element">
        <li>{{ item?.name }}</li>
        <li style="display: flex; justify-content: space-evenly;">
          <span class="grayText w20 textLeft">{{ Number(item.count.before) || 0 }}</span>
          <span class="grayText w50 textLeft">{{
              Number(item?.percent.before) ? item?.percent.before + '%' : '0'
            }}</span>
        </li>
        <li style="display: flex; justify-content: space-evenly;">
          <span :class="['w20', 'textLeft', item.isChanged && 'blueText']">{{ Number(item?.count.after) || 0 }}</span>
          <span :class="['w50', 'textLeft', item.isChanged && 'blueText']">{{
              Number(item?.percent.after) ? item?.percent.after + '%' : '0'
            }}</span>
        </li>
      </ul>
    </div>
    <div class="wbcClassDbDiv classTotalColor">
      <ul class="nth1Child">
        <li>Total</li>
        <li class="classInfoWbc">
          <span class="w20 textLeft">{{ Number(totalBeforeCount) || 0 }}</span>
          <span class="w50 textLeft">100%</span>
        </li>
        <li class="classInfoWbc">
          <span class="w20 textLeft">{{ Number(totalAfterCount) || 0 }}</span>
          <span class="w50 textLeft">100%</span>
        </li>
      </ul>
    </div>

    <div v-if="projectBm">
      <div
          v-for="(item, idx) in wbcInfoVal"
          :key="item.id"
          class="wbcClassDbDiv mb2"
          draggable="true"
          @dragstart="startDrag(idx, $event)"
          @dragover.prevent
          @drop="drop(idx, $event)"
      >
        <ul class="nth1Child" v-if="item?.title === 'OT'" @click="goClass(item.id)">
          <li>{{ item?.name }}</li>
          <li class="grayText">{{ Number(item?.count.before) || 0 }}</li>
          <li :class="item.isChanged && 'blueText'">{{ Number(item?.count.after) || 0 }}</li>
        </ul>
      </div>
    </div>

    <div v-if="!projectBm">
      <template v-for="(nWbcItem, outerIndex) in filterByTitle(wbcInfoVal, 'nonWbc')" :key="outerIndex">
        <div class="categories" v-show="selectItems?.siteCd !== '0006' && nWbcItem?.title !== 'SM'"
             @click="goClass(nWbcItem.id)">
          <ul class="categoryNm" style="cursor: default;">
            <li class="mb1 liTitle" v-if="outerIndex === 0" style="cursor: default;">non-WBC</li>
            <li class="wFit" style="cursor: default;">{{ getStringValue(nWbcItem.name) }}</li>
          </ul>
          <ul style="width: 29%;">
            <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
            <li class="grayText" style="cursor: default; padding-left: -20px;">
              {{ Number(nWbcItem?.count.before) || 0 }}
              <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'">
                / {{ Number(selectItems?.wbcInfo?.maxWbcCount) || 0 }} WBC</span>
            </li>
          </ul>
          <ul class="degree" style="width: 27%">
            <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
            <li :class="nWbcItem.isChanged && 'blueText'" style="cursor: default;">
              {{ Number(nWbcItem?.count.after) || 0 }}
              <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'">
                / {{ Number(selectItems?.wbcInfo?.maxWbcCount) || 0 }} WBC</span></li>
          </ul>
        </div>
      </template>
    </div>
  </div>
  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />
  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :type="confirmType"
      :message="confirmMessage"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, nextTick, onBeforeMount, onMounted, ref, watch} from 'vue';
import {getBarcodeDetailImageUrl} from "@/common/lib/utils/conversionDataUtils";
import {getWbcCustomClassApi} from "@/common/api/service/setting/settingApi";
import {barcodeImgDir} from "@/common/defines/constFile/settings";
import {
  basicBmClassList,
  basicWbcArr,
  defaultBmClassList,
  defaultWbcClassList
} from "@/store/modules/analysis/wbcclassification";
import {
  classInfoDetailSelectQueryApi,
  detailRunningApi,
  updateRunningApi
} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {messages} from "@/common/defines/constFile/constantMessageText";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {
  getFilePathSetApi,
  getLisCodeApi,
  getLisCodeRbcApi,
  getOrderClassApi,
  putOrderClassApi
} from "@/common/api/service/setting/settingApi";

const props = defineProps(['wbcInfo', 'selectItems', 'type', 'isCommitChanged', 'classCompareShow']);
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const emits = defineEmits();
import moment from 'moment';
import {business_id, CbcWbcTestCdList_0002, eqmtcd, instcd} from "@/common/defines/constFile/lis";
import axios from "axios";
import {xml2json} from "xml-js";
import {createCbcFile, createDirectory, createFile} from "@/common/api/service/fileSys/fileSysApi";
import {createH17, readH7Message} from "@/common/api/service/fileReader/fileReaderApi";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import {removeDuplicatesById} from "@/common/lib/utils/removeDuplicateIds";
import EventBus from "@/eventBus/eventBus";
import {tcpReq} from "@/common/tcpRequest/tcpReq";

const selectItems = ref(props.selectItems);
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const inhaTestCode: any = computed(() => store.state.commonModule.inhaTestCode);
const deviceSerialNm = computed(() => store.state.commonModule.deviceSerialNm);
const siteCd = computed(() => store.state.commonModule.siteCd);
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const barcodeImg = ref('');
const userId = ref('');
const wbcMemo = ref('');
const memoModal = ref(false);
const wbcInfoVal = ref<any>([]);
const wbcInfoAfterVal = ref<any>([]);
const wbcInfoBeforeVal = ref<any>([]);

const toggleLock = ref(false);
const dragIndex = ref(-1);
const dragOffsetY = ref(0);

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const orderClass = ref<any>([]);
const projectBm = ref(false);
const totalBeforeCount = ref(0);
const totalAfterCount = ref(0);
const okMessageType = ref('');
const lisCodeWbcArr = ref<any>([]);
const lisCodeRbcArr = ref<any>([]);
const lisFilePathSetArr = ref<any>([]);
const customClassArr = ref<any>([]);
const barCodeImageShowError = ref(false);
const submittedScreen = ref(false);
const lisBtnColor = ref(false);

onBeforeMount(async () => {
  barCodeImageShowError.value = false;
  projectBm.value = window.PROJECT_TYPE === 'bm';
})


onMounted(async () => {
  await nextTick();
  await getOrderClass();
  await getCustomClass();
  if (inhaTestCode.value === '' && siteCd.value === '0011') {
    EventBus.publish('classInfoCbcDataGet', true);
  }
  if (inhaTestCode.value === '' && siteCd.value === '0000' && siteCd.value === '') {
    EventBus.publish('classInfoCbcDataGet', true);
  }
  EventBus.subscribe('appVueSlideDataSaveLisSave', lisInhaDataSend);
  wbcMemo.value = props.selectItems?.wbcMemo;
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : pbiaRootDir.value;
  barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, props.selectItems?.slotId, barcodeImgDir.barcodeDirName);
  if (props.selectItems?.submitState) {
    lisBtnColor.value = props.selectItems.submitState === 'lis';
  }
  // 첫 진입시
  if (props.selectItems?.submitState === "" || !props.selectItems?.submitState) {
    const result: any = await detailRunningApi(String(props.selectItems?.id));
    const updatedItem = {
      submitState: 'checkFirst',
    };
    const updatedRuningInfo = {...result.data, ...updatedItem}
    await resRunningItem(updatedRuningInfo, true);
  }
  await getLisWbcRbcData();
  await getLisPathData();
  barCodeImageShowError.value = false;
})

watch(() => props.isCommitChanged, () => {
  selectItems.value.submitState = 'Submit';
})

watch(userModuleDataGet.value, (newUserId) => {
  userId.value = newUserId.id;
});

watch(() => props.wbcInfo, (newItem) => {
  if (Object.keys(newItem).length !== 0) {
    beforeAfterChange(newItem)
    wbcMemo.value = props.selectItems?.wbcMemo;
    const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : pbiaRootDir.value;
    barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, props.selectItems?.slotId, barcodeImgDir.barcodeDirName);
    store.dispatch('commonModule/setCommonInfo', {testType: props.selectItems.testType});
    if (props.selectItems?.submitState === "") {
      const result: any = detailRunningApi(String(props.selectItems?.id));
      const updatedItem = {
        submitState: 'checkFirst',
      };
      const updatedRuningInfo = {...result.data, ...updatedItem}
      resRunningItem(updatedRuningInfo, true);
    }
  }
});

const lisModalOpen = () => {
  showConfirm.value = true;
  confirmMessage.value = messages.IDS_MSG_UPLOAD_LIS;
  okMessageType.value = 'lis';
}

const goClass = (id: any) => {
  emits('scrollEvent', id)
}

const wbcClassTileChange = (): string => {
  if (!projectBm.value) {
    return 'WBC Classification';
  } else {
    return 'BM Classification';
  }
}

const startDrag = (index: any, event: any) => {
  dragIndex.value = index;
  dragOffsetY.value = event.clientY - event.target.getBoundingClientRect().top;
};

const drop = (index: any, event: any) => {
  if (!toggleLock.value) {
    return;
  }
  event.preventDefault();
  if (dragIndex.value !== -1) {
    const movedItem = wbcInfoVal.value.splice(dragIndex.value, 1)[0];
    wbcInfoVal.value.splice(index, 0, movedItem);
    dragIndex.value = -1;
    updateOriginalDb();
  }
};


const toggleLockEvent = () => {
  toggleLock.value = !toggleLock.value;
}

const barcodeCopy = async () => {
  const textarea = document.createElement('textarea');
  textarea.value = props.selectItems.barcodeNo;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

const commitConfirmed = () => {
  // if (props.selectItems?.submitState === 'Submit' || submittedScreen.value) {
  //   return;
  // }
  submittedScreen.value = true;
  showConfirm.value = true;
  confirmMessage.value = messages.IDS_MSG_CONFIRM_SLIDE;
  okMessageType.value = 'commit';
}

const handleOkConfirm = () => {
  if (okMessageType.value === 'commit') {
    onCommit();
  } else {
    uploadLis();
  }
  showConfirm.value = false;
}

const uploadLis = () => {
  if (siteCd.value === '0002') {
    cmcseoulLisAndCbcDataGet();
  } else if (siteCd.value === '' || siteCd.value === '0000') {
    uimdTestCbcLisDataGet();
  } else {
    // lis 최종호출
    lisLastStep();
  }
}

const uimdTestCbcLisDataGet = () => {
  const codeList = CbcWbcTestCdList_0002;
  const {wbcInfoAfter} = props.selectItems ?? {};
  let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
  // cbc 결과 조회
  axios.get(`${apiBaseUrl}/cbc/liveTest`, {   // UIMD 백엔드 xml 테스트 코드 : http://192.168.0.131:3002/api/cbc/liveTest
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(async function (resultCbc) {
    // 결과 처리 코드
    const xml = resultCbc.data.trim(); // 불필요한 공백 제거
    const cbcJson = JSON.parse(xml2json(xml, {compact: true}));
    const cbcWorkList = cbcJson.root.spcworklist.worklist;
    const fiveDiffWorkList = ['LHR10501', 'LHR10502', 'LHR10503', 'LHR10504', 'LHR10505', 'LHR10506'];

    // LHR100는 WBC를 뜻함 -> 평화이즈 데이터를 WBC로 변경하는 과정
    const wbcDiffCountItem = cbcWorkList.filter(function (item: any) {
      return item.testcd._cdata === 'LHR100'
    })
    wbcInfoAfter.forEach(function (wbcItem: any) {
      wbcItem.testcd = ''
      // testcd 없음 필드 자체에 추가 하는 로직
      codeList.forEach(function (code) {
        if (String(wbcItem.id) === String(code.id)) {
          wbcItem.testcd = code.cd
        }
      })
    })
    // five diff push
    let wbcTemp: any = [];
    wbcInfoAfter.forEach(function (wbcItem: any) {
      fiveDiffWorkList.forEach(function (fiveDiffItem) {
        if (wbcItem.testcd === fiveDiffItem) {
          wbcTemp.push({
            testcd: wbcItem.testcd,
            percent: wbcItem.percent,
            name: wbcItem.name,
          })
        } else {
          if ((Number(wbcItem.count) > 0) && wbcItem.testcd !== '') {
            wbcTemp.push({
              testcd: wbcItem.testcd,
              percent: wbcItem.percent,
              name: wbcItem.name,
            })
          }
        }
      })
    })

    // 중복제거
    const uniqueItems = new Set(wbcTemp.map((item: any) => item.testcd));
    wbcTemp = Array.from(uniqueItems).map(testcd => wbcTemp.find((item: any) => item.testcd === testcd));

    const totalPercentRounded = wbcTemp
        .filter((item: any) => item.name !== "Neutrophil")
        .map((item: any) => Math.round(parseFloat(item.percent)))
        .reduce((sum: any, percent: any) => sum + percent, 0);
    const updatedWbcTemp = wbcTemp.map((item: any) =>
        item.name === "Neutrophil"
            ? {...item, percent: 100 - totalPercentRounded}
            : {...item, percent: Math.round(parseFloat(item.percent))}
    );
    wbcTemp = updatedWbcTemp;

    // neutrophil-seg
    const nsPercentItem = wbcTemp.filter((item: any) => item.testcd === 'LHR10501');

    // ANC insert LHR10599=> ANC 계산
    if ((nsPercentItem.length > 0) && (wbcDiffCountItem.length > 0)) {
      const ancResult = ((Number(wbcDiffCountItem[0].inptrslt._cdata) * nsPercentItem[0].percent) / 100).toFixed(2);
      wbcTemp.push({
        testcd: 'LHR10599',
        percent: ancResult,
        name: 'ANC 계산'
      })
    }

    const result: any = await detailRunningApi(String(props.selectItems?.id));
    const updatedItem = {
      submitState: 'lis',
    };
    lisBtnColor.value = true;
    const updatedRuningInfo = {id: result.data.id, ...updatedItem}
    await resRunningItem(updatedRuningInfo, true);

  }).catch(function (err) {
    console.log('error.config', err.config)
    showErrorAlert(err.message);
  });
}

const cmcseoulLisAndCbcDataGet = () => {
  const codeList = CbcWbcTestCdList_0002;
  const {barcodeNo, wbcInfoAfter} = props.selectItems ?? {};
  let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
  // cbc 결과 조회
  axios.get(`${apiBaseUrl}/cbc/lisCbcMarys`, {
    params: {
      submit_id: 'TRLII00124',
      business_id: 'li',
      instcd: '012', // 병원 코드
      bcno: barcodeNo,
    },
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(async function (resultCbc) {
    // 결과 처리 코드
    const xml = resultCbc.data.data.trim(); // 불필요한 공백 제거
    const cbcJson = JSON.parse(xml2json(xml, {compact: true}));
    const cbcWorkList = cbcJson.root.spcworklist.worklist;
    const fiveDiffWorkList = ['LHR10501', 'LHR10502', 'LHR10503', 'LHR10504', 'LHR10505', 'LHR10506'];
    // LHR100는 WBC를 뜻함 -> 평화이즈 데이터를 WBC로 변경하는 과정
    const wbcDiffCountItem = cbcWorkList.filter(function (item: any) {
      return item.testcd._cdata === 'LHR100'
    })

    wbcInfoAfter.forEach(function (wbcItem: any) {
      wbcItem.testcd = ''
      // testcd 없음 필드 자체에 추가 하는 로직
      codeList.forEach(function (code) {
        if (String(wbcItem.id) === String(code.id)) {
          wbcItem.testcd = code.cd
        }
      })
    })

    // five diff push
    let wbcTemp: any = [];
    wbcInfoAfter.forEach(function (wbcItem: any) {
      fiveDiffWorkList.forEach(function (fiveDiffItem) {
        if (wbcItem.testcd === fiveDiffItem) {
          wbcTemp.push({
            testcd: wbcItem.testcd,
            percent: wbcItem.percent,
          })
        } else {
          if ((Number(wbcItem.count) > 0) && wbcItem.testcd !== '') {
            wbcTemp.push({
              testcd: wbcItem.testcd,
              percent: wbcItem.percent,
            })
          }
        }
      })
    })
    // 중복제거
    const uniqueItems = new Set(wbcTemp.map((item: any) => item.testcd));
    wbcTemp = Array.from(uniqueItems).map(testcd => wbcTemp.find((item: any) => item.testcd === testcd));
    // 뉴트로필 외 반올림 뉴트로필 100기준 정수로 재 계산
    const totalPercentRounded = wbcTemp
        .filter((item: any) => item.name !== "Neutrophil")
        .map((item: any) => Math.round(parseFloat(item.percent)))
        .reduce((sum: any, percent: any) => sum + percent, 0);
    const updatedWbcTemp = wbcTemp.map((item: any) =>
        item.name === "Neutrophil"
            ? {...item, percent: 100 - totalPercentRounded}
            : {...item, percent: Math.round(parseFloat(item.percent))}
    );
    wbcTemp = updatedWbcTemp;

    // neutrophil-seg ANC 계산을 위해서 전체 다 뉴트로필로 변경 전체 개수를 측정 하기 위해서
    const nsPercentItem = wbcTemp.filter((item: any) => item.testcd === 'LHR10501');


    // ANC insert LHR10599=> ANC 계산
    if ((nsPercentItem.length > 0) && (wbcDiffCountItem.length > 0)) {
      const ancResult = ((Number(wbcDiffCountItem[0].inptrslt._cdata) * nsPercentItem[0].percent) / 100).toFixed(2);
      wbcTemp.push({
        testcd: 'LHR10599',
        percent: ancResult,
        name: 'ANC 계산'
      })
    }

    // 반올림 계산법
    // if (nsPercentItem.length > 0 && wbcDiffCountItem.length > 0) {
    //   const wbcDiffCountValue = parseInt(wbcDiffCountItem[0].inptrslt._cdata, 10);
    //   const nsPercent = nsPercentItem[0].percent;
    //
    //   // 버림 처리 예시
    //   const ancResult = calculateWithRounding(wbcDiffCountValue, nsPercent, 'round');
    //
    //   wbcTemp.push({
    //     testcd: 'LHR10599',
    //     percent: ancResult,
    //     name: 'ANC 계산'
    //   });
    // }


    const filePath = `D:\\UIMD_Data\\UI_Log\\CBCLookUP\\${barcodeNo}.txt`;
    const paramsLisCopyLogData = {
      filePath,
      data: {
        cbcJson,
        cbcWorkList
      },
    };
    await createCbcFile(paramsLisCopyLogData);
    // 유저 체크
    checkUserAuth(userModuleDataGet.value.employeeNo).then(function (isUserAuth) {
      if (isUserAuth === 'succ') {
        const params = {
          empNo: userModuleDataGet.value.employeeNo,
          barcodeNo: barcodeNo,
          wbcInfo: wbcTemp
        }
        const now = new Date();
        const year = `${now.getFullYear()}`;
        let month = `${now.getMonth() + 1}`;
        if (month.length === 1) {
          month = `0${month}`;
        }
        let day = `${now.getDate()}`;
        if (day.length === 1) {
          day = `0${day}`;
        }

        const separator1 = String.fromCharCode(23); // '\u0017'
        const separator2 = String.fromCharCode(23, 23); // '\u0017\u0017'
        const terminator = String.fromCharCode(3); // '\u0003'
        const paramsResult = params.wbcInfo
            .filter((wbcItem: any) => wbcItem.testcd !== null && wbcItem.testcd !== '')
            .map((wbcItem: any) => `${wbcItem.testcd}${separator1}${wbcItem.percent}${separator2}${year}${month}${day}${terminator}`)
            .join('');

        // LIS 최종 업로드 Report
        const newparams = {
          submit_id: 'TXLII00101',
          business_id: business_id,
          ex_interface: `${params.empNo}|${instcd}`,
          instcd: instcd,
          userid: params.empNo,
          eqmtcd: eqmtcd,
          bcno: params.barcodeNo,
          result: paramsResult,
          testcont: 'MANUAL DIFFERENTIAL COUNT RESULT',
          testcontcd: '01',
          execdeptcd: 'H1',
        }
        axios.get(`${apiBaseUrl}/cbc/lisCbcMarys`, {
          params: newparams,
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(async function (result) {
          const xml = result.data.data;
          const json = JSON.parse(xml2json(xml, {compact: true}));
          const resultFlag = json.root.ResultFlag.resultflag._text;
          const paramsDataCbcLisLog = {
            empNo: userModuleDataGet.value.employeeNo,
            barcodeNo,
            wbcTemp,
            frontendSendData: newparams,
            processSendData: paramsResult,
            uimdDefaultData: wbcInfoAfter,
            nsPercentItem,
            cbcJson,
            cbcWorkList,
          };
          const filePath = `D:\\UIMD_Data\\UI_Log\\LISFinalReport\\${barcodeNo}.txt`;
          const paramsLisCopyLogData = {
            filePath,
            data: {
              frontendData: paramsDataCbcLisLog,
              lisLastReportVal: result,
            },
          };
          await createCbcFile(paramsLisCopyLogData);
          if (resultFlag === 'Y') {
            // lis 등록 후 list 테이블에서 로우 색상 변경 코드
            const result: any = await detailRunningApi(String(props.selectItems?.id));
            const updatedItem = {
              submitState: 'lis',
            };
            lisBtnColor.value = true;
            const updatedRuningInfo = {...result.data, ...updatedItem}
            await resRunningItem(updatedRuningInfo, true);
            showSuccessAlert(messages.IDS_MSG_SUCCESS);
          } else {
            const index = json.root.ResultFlag.error2._text.indexOf('!');  // '!'의 위치를 찾음
            const result = index !== -1 ? json.root.ResultFlag.error2._text.substring(0, index + 1) : json.root.ResultFlag.error2._text;
            const errText = json.root.ResultFlag.error2._text === '1' ? 'LIS 전송이 실패 했습니다.' : result;
            showErrorAlert(errText);
          }
        }).catch(function (err) {
          showErrorAlert(err.message);
        })
      } else {
        showErrorAlert(messages.IDS_ERROR_PLEASE_CONFIRM_YOUR_USER_ID);
      }
    })
  }).catch(function (err) {
    console.log('error.config', err.config)
    showErrorAlert(err.message);
  });
}

function calculateWithRounding(value: any, percent: any, roundingMethod: any) {
  const result = (value * percent) / 100;

  switch (roundingMethod) {
    case 'round':
      return Math.round(result); // 반올림
    case 'floor':
      return Math.floor(result); // 버림
    case 'ceil':
      return Math.ceil(result);  // 올림
    default:
      throw new Error('Invalid rounding method');
  }
}

const lisLastStep = () => {
  if (siteCd.value === '0019') {
    let data = 'H|\^&||||||||||P||' + props.selectItems?.barcodeNo + '\n';
    let seq = 0;

    lisCodeWbcArr.value.forEach(function (lisCode: any) {
      if (lisCode.LIS_CD !== '') {
        props.selectItems?.wbcInfoAfter.forEach(function (wbcItem: any) {
          if (lisCode.IA_CD === wbcItem.id) {
            if (Number(wbcItem.percent) > 0 || Number(wbcItem.count)) {
              // count
              data += 'R|' + (++seq) + '|^^^^' + lisCode.LIS_CD + '|' + wbcItem.count + '|||||||^' + userModuleDataGet.value.name + '\n'
              // percent
              data += 'R|' + (++seq) + '|^^^^' + lisCode.LIS_CD + '%|' + wbcItem.percent + '|%||||||^' + userModuleDataGet.value.name + '\n'
            }

          }

        })
      }
    })
    data += 'L|1|N'
    lisFileUrlCreate(data);
  } else if (siteCd.value === '0006') { // 고대 안암
    const data = godae();
    lisFileUrlCreate(data);

  } else if (siteCd.value === '0011') { // 인하대
    inhaDataSend(props.selectItems?.wbcInfoAfter, props.selectItems?.rbcInfoAfter, props.selectItems?.barcodeNo);
  } else {
    otherDataSend();
  }
}

const otherDataSend = async () => {
  const url = lisFilePathSetArr.value;
  const fileCreateRes = await createDirectory(url);
  let msg: any;

  if (fileCreateRes) {
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
      result: lisCodeWbcArr.value,
    };
    const res = await readH7Message(data);
    if (res) {
      if (!lisFilePathSetArr.value.includes("http")) { // file
        const data = {
          filepath: `${lisFilePathSetArr.value}\\${props.selectItems.barcodeNo}.hl7`,
          msg: res,
        }
        try {
          const createH17Res: any = await createH17(data);
          showSuccessAlert(messages.IDS_MSG_SUCCESS);
        } catch (error: any) {
          showErrorAlert(error.response.data.message);
        }
      } else { // url
        sendLisMessage(res);
      }
    }
  }
}
const lisInhaDataSend = async (wbcInfoAfter: any, rbcInfoAfter: any, barcodeNo: any) => {
  // console.log(wbcInfoAfter)
  // console.log(rbcInfoAfter)
  // console.log(barcodeNo)
  await getLisWbcRbcData();
  await inhaDataSend(wbcInfoAfter[0], rbcInfoAfter, barcodeNo);
}

const inhaDataSend = async (wbcInfoAfter: any, rbcInfoAfter: any, barcodeNo: any) => {
  let resultStr = '';

  const testCodeList = inhaTestCode.value.split(',');
  let tmpList: any = [];
  testCodeList.forEach(function (codes: any) {
    if (codes.length > 0) {
      const codeArray = codes.split('|')
      let code = codeArray[0]
      let value = codeArray[1]
      let unit = codeArray[2]
      let type = codeArray[3]
      let tmpStr = ''

      if (code === 'L0210') {
        value = value + '5'
      }

      if (code === 'H1151') {
        tmpStr += 'H9511' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1152') {
        tmpStr += 'H9512' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1153') {
        tmpStr += 'H9513' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1154') {
        tmpStr += 'H9514' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1155') {
        tmpStr += 'H9515' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1165') {
        tmpStr += 'H9510' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1162') {
        tmpStr += 'H9570' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1101' || code === 'H1102' || code === 'H1103' ||
          code === 'H1104' || code === 'H1105' || code === 'H1106' ||
          code === 'H1121' || code === 'H1122' || code === 'H1123') {
        tmpStr += code + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      }

    }
  })

  inhaTestCode.value = '';
  tmpList.forEach(function (item: any) {
    inhaTestCode.value += item + ','
  })
  resultStr += inhaTestCode.value;
  let rbcTmp = '';
  //wbc
  lisCodeWbcArr.value.forEach(function (lisCode: any, index: any) {
    wbcInfoAfter.forEach(function (wbcItem: any) {
      if (lisCode.IA_CD === wbcItem.id) {
        if (lisCode.LIS_CD === 'H9600' || lisCode.LIS_CD === 'H9365' ||
            lisCode.LIS_CD === 'H9366') {
          if (Number(wbcItem.count) > 0) {
            resultStr += lisCode.LIS_CD + '|' + '1' + '|' + ','
          } else {
            resultStr += lisCode.LIS_CD + '|' + ' ' + '|' + ','
          }
        } else {
          // GP, PA
          if (lisCode.IA_CD === '13' || lisCode.IA_CD === '14') {
            if (Number(wbcItem.count) > Number(lisCode.MIN_COUNT)) {
              resultStr += lisCode.LIS_CD + '|' + wbcItem.percent + '|' + ','
            } else {
              resultStr += lisCode.LIS_CD + '|' + ' ' + '|' + ','
            }
          } else {
            if (Number(wbcItem.percent) > 0) {
              resultStr += lisCode.LIS_CD + '|' + wbcItem.percent + '|' + ','
            } else {
              resultStr += lisCode.LIS_CD + '|' + ' ' + '|' + ','
            }
          }

        }
      }
    })
  })
  // RBC
  const specialCodes = ['H9531', 'H9535', 'H9594', 'H9571', 'H9574', 'H9595'];

  lisCodeRbcArr.value.forEach(function (lisCode: any) {
    if (lisCode.LIS_CD !== '') {
      rbcInfoAfter.forEach(function (rbcItem: any) {
        if (lisCode.IA_CATEGORY_CD === rbcItem.IA_CATEGORY_CD) {
          for (const rbcItemElement of rbcItem.classInfo) {
            if (lisCode.IA_CLASS_CD === rbcItemElement.IA_CLASS_CD) {
              const degree = Number(rbcItemElement.degree) === 0 ? ' ' : specialCodes.includes(lisCode.LIS_CD) ? '0' : rbcItemElement.degree;
              rbcTmp += `${lisCode.LIS_CD}|${degree}|,`;
              resultStr += `${lisCode.LIS_CD}|${degree}|,`;
            }
          }

        }
      })

    }
  })

  const replacements: any = {
    'H9531': 'H9571',
    'H9532': 'H9572',
    'H9533': 'H9573',
    'H9535': 'H9574',
    'H9536': 'H9575',
    'H9537': 'H9576',
    'H9534': 'H9577',
    'H9538': 'H9578',
    'H9542': 'H9518',
    'H9544': 'H9520',
    'H9546': 'H9517',
    'H9548': 'H9519',
    'H9550': 'H9522',
    'H9552': 'H9521',
    'H9554': 'H9525',
    'H9556': 'H9524',
    'H9558': 'H9526',
    'H9560': 'H9523',
    'H9562': 'H9528',
    'H9564': 'H9530',
    'H9594': 'H9595'
  };

  let rbcTmp2: any = rbcTmp.replace(/H9531|H9532|H9533|H9535|H9536|H9537|H9534|H9538|H9542|H9544|H9546|H9548|H9550|H9552|H9554|H9556|H9558|H9560|H9562|H9564|H9594/g, match => replacements[match]);

  resultStr += rbcTmp;
  resultStr += rbcTmp2;


  var params = {
    url: lisFilePathSetArr.value,
    machine: 'ADUIMD',
    episode: barcodeNo,
    result: resultStr
  }

  axios.post(params.url + '/api/MifMain/File', {
    machine: params.machine,
    episode: params.episode,
    result: params.result
  }).then(function (result) {
    const res = result.data[0];
    if (res.returnCode === '0') {
      showSuccessAlert(messages.IDS_MSG_SUCCESS);
    } else {
      showSuccessAlert('return code : ' + res.returnCode);
    }

  }).catch(function (err) {
    showSuccessAlert(err.message);
  })
}

const godae = (): string => {
  let data = 'H|\^&||||||||||P||' + props.selectItems?.barcodeNo + '\n';
  let seq = 0;
  let kumcMergePercent = 0;
  let kumcBandPercent = 0;

  props.selectItems?.wbcInfoAfter.forEach(function (wbcItem: any) {
    if (wbcItem.id === '02' || wbcItem.id === '03' ||
        wbcItem.id === '04' || wbcItem.id === '10') {
      kumcMergePercent += Number(wbcItem.percent)
    }

    if (wbcItem.id === '72') {
      kumcBandPercent = Number(wbcItem.percent)
    }
  })

  if (kumcMergePercent > 0 && kumcBandPercent < 6) {
    // seg
    const segItem = props.selectItems?.wbcInfoAfter.filter(function (item: any) {
      return item.id === '71'
    })

    // band
    const bandItem = props.selectItems?.wbcInfoAfter.filter(function (item: any) {
      return item.id === '72'
    })

    segItem[0].percent = (Number(segItem[0].percent) + Number(kumcBandPercent)) + ''
    bandItem[0].percent = '0'
  }
  lisCodeWbcArr.value.forEach(function (lisCode: any) {
    if (lisCode.LIS_CD !== '') {
      props.selectItems?.wbcInfoAfter.forEach(function (wbcItem: any) {
        if (lisCode.IA_CD === wbcItem.id) {
          // 5diff는 0이어도 데이터 올림
          if (wbcItem.id === '01' || wbcItem.id === '71' || wbcItem.id === '05' ||
              wbcItem.id === '07' || wbcItem.id === '08' || wbcItem.id === '09') {
            // count
            data += 'R|' + (++seq) + '|^^^^' + lisCode.LIS_CD + '|' + wbcItem.count + '|||||||^' + userModuleDataGet.value.name + '\n'

            // percent
            data += 'R|' + (++seq) + '|^^^^' + lisCode.LIS_CD + '%|' + wbcItem.percent + '|%||||||^' + userModuleDataGet.value.name + '\n'

          } else {
            if (Number(wbcItem.percent) > 0) {
              // count
              data += 'R|' + (++seq) + '|^^^^' + lisCode.LIS_CD + '|' + wbcItem.count + '|||||||^' + userModuleDataGet.value.name + '\n'

              // percent
              data += 'R|' + (++seq) + '|^^^^' + lisCode.LIS_CD + '%|' + wbcItem.percent + '|%||||||^' + userModuleDataGet.value.name + '\n'
            }
          }
        }
      })
    }
  })

  return data += 'L|1|N'
}

const lisFileUrlCreate = async (data: any) => {
  const parmsLisCopy = {
    filePath: `D:\\UIMD_Data\\UI_Log\\LIS_IA\\${props.selectItems?.barcodeNo}.txt`,
    data: data,
  };
  await createCbcFile(parmsLisCopy);
  if (!lisFilePathSetArr.value.includes("http")) {
    const url = lisFilePathSetArr.value;
    const fileCreateRes = await createDirectory(url);
    if (fileCreateRes) {
      const parms = {
        path: lisFilePathSetArr.value,
        filename: `${lisFilePathSetArr.value}/${props.selectItems?.barcodeNo}.lst2msg`,
        content: data,
      };
      const res = await createFile(parms);
      if (res) {
        const result: any = await detailRunningApi(String(props.selectItems?.id));
        const updatedItem = {
          submitState: 'lis',
        };
        const updatedRuningInfo = {...result.data, ...updatedItem}
        await resRunningItem(updatedRuningInfo, true);
        showSuccessAlert(messages.IDS_MSG_SUCCESS);
        if (!showAlert.value) {
          emits('nextPage')
        }
      } else {
        showErrorAlert('lis file err');
      }
    }
  } else {// url 로 셋팅한 경우
    sendLisMessage(data);
  }
}

const sendLisMessage = (data: any) => {
  const params = {
    url: lisFilePathSetArr.value,
    barcodeNo: props.selectItems?.barcodeNo,
    userId: userModuleDataGet.value.name,
    deviceBarcode: deviceSerialNm.value,
    resultMsg: data
  }
  axios.post(params.url, {
    barcodeNo: params.barcodeNo,
    userid: params.userId,
    deviceBarcode: deviceSerialNm.value,
    resultMsg: params.resultMsg
  }).then(function (result) {
    if (result.data.errorCode === 'E000') {
      showSuccessAlert(messages.IDS_MSG_SUCCESS);
    } else {
      showErrorAlert(result.data.errorMessage);
    }
  }).catch(function (err) {
    showErrorAlert(err.message);
  })
}

const getLisWbcRbcData = async () => {
  try {
    const wbcResult = await getLisCodeApi();
    const rbcResult = await getLisCodeRbcApi();
    if (wbcResult && wbcResult.data && rbcResult && rbcResult.data) {
      const wbcData = wbcResult.data;
      const rbcData = rbcResult.data;

      if (wbcData) {
        let newWbcDataArr = [];
        for (const wbcDataItem of wbcData) {
          newWbcDataArr.push({
            CD_NM: wbcDataItem.fullNm,
            IA_CD: wbcDataItem?.id,
            LIS_CD: wbcDataItem?.key,
            MIN_COUNT: 0,
          })
        }
        lisCodeWbcArr.value = newWbcDataArr;
      }
      if (rbcData) {
        let newRbcDataArr = [];
        for (const rbcDataItem of rbcData) {
          newRbcDataArr.push({
            CATEGORY_NM: rbcDataItem.categoryNm,
            CLASS_NM: rbcDataItem?.fullNm,
            IA_CATEGORY_CD: rbcDataItem?.categoryId,
            IA_CLASS_CD: rbcDataItem?.id,
            LIS_CD: rbcDataItem?.key,
          })
        }
        lisCodeRbcArr.value = newRbcDataArr;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
const getLisPathData = async () => {
  try {
    const result = await getFilePathSetApi();
    if (result && result.data && result.data.length !== 0) {
      lisFilePathSetArr.value = result.data[0].lisFilePath;
    }
  } catch (e) {
    console.error(e);
  }
};

const checkUserAuth = async (empNo: any) => {
  return new Promise((succ, fail) => {
    if (siteCd.value === '0002') {
      let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
      axios.get(`${apiBaseUrl}/cbc/lisCbcMarys`, {
        params: {
          submit_id: 'TRLII00104',
          business_id: 'li',
          instcd: '012', // 병원 코드
          userid: empNo
        },
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(function (result) {
        const xml = result.data.data;
        const json = JSON.parse(xml2json(xml, {compact: true}));
        const userNm = json.root.getUsernm.usernm._text;
        if (userNm === null || userNm === '') {
          succ('fail')
        } else {
          succ('succ')
        }

      }).catch(function (err) {
        console.log('checkUserAuth :' + err.message)
        fail(new Error(err.message))
      })

    }
  })
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const onCommit = async () => {
  const localTime = moment().local();
  const result: any = await detailRunningApi(String(props.selectItems?.id));
  const updatedItem = {
    submitState: 'Submit',
    submitOfDate: localTime.format(),
    submitUserId: userModuleDataGet.value.name,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem}
  await resRunningItem(updatedRuningInfo);

  selectItems.value.submitState = 'Submit';
  emits('submitStateChanged', 'Submit');
}


const memoChange = async () => {
  const enterAppliedWbcMemo = wbcMemo.value.replaceAll('\r\n', '<br>');
  const updatedItem = {
    wbcMemo: enterAppliedWbcMemo
  };
  const result: any = await detailRunningApi(String(props.selectItems?.id));
  const updatedRuningInfo = {...result.data, ...updatedItem}

  await resRunningItem(updatedRuningInfo);
  memoModal.value = false;
}

const memoOpen = () => {
  // wbcMemo.value = wbcMemo.value !== '' ? wbcMemo.value : props.selectItems?.wbcMemo;
  memoModal.value = !memoModal.value;
}

const memoCancel = () => {
  memoModal.value = false;
}

const getStringValue = (title: string): string => {
  if (title === 'Artifact(Smudge)' && siteCd.value === '0006') {
    return "Artifact";
  } else {
    return title;
  }
};

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
        showSuccessAlert('success');
      }
      const filteredItems = updatedRuningInfo;
      wbcMemo.value = filteredItems.wbcMemo;
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const sortWbcInfo = (wbcInfo: any, basicWbcArr: any) => {
  let newSortArr = JSON.parse(JSON.stringify(wbcInfo));

  newSortArr.sort((a: any, b: any) => {
    const nameA = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (a.title || a.abbreviation));
    const nameB = basicWbcArr.findIndex((item: any) => (item.title || item.abbreviation) === (b.title || b.abbreviation));

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });

  return newSortArr;
};

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        orderClass.value = [];
      } else {
        orderClass.value = result.data.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const beforeAfterChange = async (newItem: any) => {
  await getOrderClass();
  const filteredItems: any = await classInfoDetailSelectQueryApi(String(selectedSampleId.value));
  await store.dispatch('commonModule/setCommonInfo', {selectedSampleId: String(filteredItems?.data?.id)});
  selectItems.value = filteredItems.data;
  const customClassItems = selectItems.value.wbcInfoAfter.filter((item: any) => 90 <= Number(item.id) && Number(item.id) <= 95);
  selectItems.value.wbcInfoAfter = newItem;

  const availableCustomClassArr = customClassArr.value.filter((item: any) => item.abbreviation !== '' && item.fullNm !== '')
  let wbcBeforeInfo = removeDuplicatesById(selectItems.value.wbcInfo.wbcInfo[0] || [])
  let wbcAfterInfo = removeDuplicatesById(selectItems.value?.wbcInfoAfter || filteredItems.data.wbcInfo.wbcInfo[0] || []);

  wbcBeforeInfo = removeDuplicatesById(wbcBeforeInfo);
  wbcAfterInfo = removeDuplicatesById(wbcAfterInfo);


  // customClass가 있는 상태에서 첫 진입 시
  if (availableCustomClassArr.length > 0 && customClassItems.length === 0) {
    for (const customClassItem of availableCustomClassArr) {
      if (wbcAfterInfo.find((beforeItem: any) => beforeItem.id != customClassItem.customNum)) {
        const customItem = {
          id: String(customClassItem.customNum),
          name: customClassItem.fullNm,
          count: '0',
          title: customClassItem.abbreviation,
          images: [],
        }
        wbcBeforeInfo.push(customItem)
        wbcAfterInfo.push(customItem);
      }
    }
  }
  if (availableCustomClassArr.length > 0 && customClassItems.length > 0) {
    for (const customClassItem of customClassItems) {
      if (wbcAfterInfo.find((item: any) => item.id != customClassItem.id)) {
        const customItem = {
          id: String(customClassItem.id),
          name: customClassItem.name,
          count: '0',
          title: customClassItem.title,
          images: [],
        }
        wbcBeforeInfo.push(customItem)
        wbcAfterInfo.push(customClassItem)
      }
    }
  }

  const wbcBeforeArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? defaultBmClassList : defaultWbcClassList;
  const wbcAfterArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;

  wbcInfoAfterVal.value = wbcAfterInfo;
  wbcInfoBeforeVal.value = wbcBeforeInfo;
  const wbcInfoAfterValForTotalCount = filterByTitle(wbcAfterInfo, 'wbc');
  const wbcInfoBeforeValForTotalCount = filterByTitle(wbcBeforeInfo, 'wbc');

  totalCountSet('before', wbcInfoBeforeValForTotalCount);
  totalCountSet('after', wbcInfoAfterValForTotalCount);

  // totalCount, percent - 따로
  for (const item of wbcInfoBeforeValForTotalCount) {
    createPercent(item, totalBeforeCount.value)
  }

  for (const item of wbcInfoAfterValForTotalCount) {
    createPercent(item, totalAfterCount.value)
  }

  wbcInfoVal.value = [];

  wbcInfoAfterVal.value = sortWbcInfo(wbcInfoAfterVal.value, wbcAfterArr);
  wbcInfoBeforeVal.value = sortWbcInfo(wbcInfoBeforeVal.value, wbcBeforeArr);

  for (const [index, beforeItem] of wbcInfoBeforeVal.value.entries()) {
    const afterItem = wbcInfoAfterVal.value[index]

    if (!afterItem) continue;
    const isChanged = isBeforeAfterChanged(beforeItem, afterItem);
    const item = {
      id: beforeItem.id,
      name: beforeItem.name,
      title: beforeItem.title,
      count: {before: beforeItem.count, after: afterItem.count},
      images: {before: beforeItem.images, after: afterItem.images},
      percent: {before: beforeItem.percent, after: afterItem.percent},
      isChanged
    }
    wbcInfoVal.value.push(item);
  }

  if (props.selectItems?.submitState === "" || !props.selectItems?.submitState) {
    const result: any = await detailRunningApi(String(props.selectItems?.id));
    const updatedItem = {
      submitState: 'checkFirst',
    };

    const updatedRuningInfo = {...result.data, ...updatedItem}
    await resRunningItem(updatedRuningInfo, true);
  }
}

async function inhaDataChangeSave(runningInfoData, wbcInfo) {
  if (runningInfoData.testType !== '04') {
    const excludedTitles = ['NR', 'AR', 'GP', 'PA', 'MC', 'MA'];

    // wbcTotal 계산
    let wbcTotal = 0;
    wbcInfo.forEach((wbcItem) => {
      if (Number(wbcItem.count) > 0 && !excludedTitles.includes(wbcItem.title)) {
        wbcTotal += Number(wbcItem.count);
      }
    });

    let maxItem = null;
    let percentTotal = 0;

    // 퍼센트 계산 및 maxItem 결정
    wbcInfo.forEach((wbcItem, index) => {
      let percent = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(0));
      let percentN2 = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(2));

      // 특정 조건에 따라 퍼센트 조정
      if ((wbcItem.title === 'BL' || ['LA', 'IM', 'MB', 'AM'].includes(wbcItem.title)) &&
          Number(wbcItem.count) > 0 &&
          percentN2 >= 0 &&
          percentN2 <= 1) {
        percent = 1;
      }

      wbcItem.percent = percent;

      // 제외할 타이틀이 아닌 경우 percentTotal 및 maxItem 갱신
      if (!excludedTitles.includes(wbcItem.title)) {
        percentTotal += Number(wbcItem.percent);
        if (maxItem === null || Number(maxItem.count) < Number(wbcItem.count)) {
          maxItem = wbcItem;
        }
      }

      // 마지막 항목일 때 백분율 오차 보정
      if (maxItem !== null && (index + 1) === wbcInfo.length) {
        maxItem.percent = Number(maxItem.percent) + (100 - percentTotal);
      }
    });

    return wbcInfo;
  }
}

/** Before, After 이미지들이 같은지 비교 */
const isBeforeAfterChanged = (beforeItem: any, afterItem: any) => {
  if (Number(beforeItem.count) !== Number(afterItem.count)) return true;

  const sortedBeforeImages = beforeItem.images.slice().map((item: any) => item.fileName);
  const sortedAfterImages = afterItem.images.slice().map((item: any) => item.fileName);

  const beforeSet = new Set(sortedBeforeImages);
  const afterSet = new Set(sortedAfterImages);

  if (beforeSet.size !== afterSet.size) {
    return true;
  } else {
    const areEqual = [...beforeSet].every(fileName => afterSet.has(fileName));
    if (areEqual) {
      return false;
    } else {
      return true;
    }
  }

  return false;
}

const filterByTitle = (wbcInfoArr: any, isNonWbc: 'wbc' | 'nonWbc') => {
  const titleArr = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM'];
  if (isNonWbc === 'nonWbc') {
    return wbcInfoArr.filter((item: any) => titleArr.includes(item.title));
  }

  return wbcInfoArr.filter((item: any) => !titleArr.includes(item.title));
}

const createPercent = (item: any, totalCount: any) => {
  if (projectBm.value && item.title !== 'OT') {
    const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1);  // 소수점 0인경우 정수 표현
    item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
  } else {
    if (siteCd.value !== '0011') {
      const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
      if (!targetArray.includes(item.title)) {
        const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1); // 소수점 0인경우 정수 표현
        item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
      }
    }
  }
}

const shouldRenderCategory = (title: string) => {
  // 제외할 클래스들 정의
  const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
  return !targetArray.includes(title);
};

const getStringArrayBySiteCd = (siteCd: string, testType: string): string[] => {
  if (!siteCd && siteCd === '') {
    siteCd = '0000';
    testType = '01';
  }
  const arraysBySiteCd: any = { // 0006 -> 고대
    '0006': {
      includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
      includesStr2: ["NR", "AR", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
    },
  };

  // 지정된 siteCd에 대한 배열을 가져오거나, 기본 배열을 반환
  const arraysForSiteCd = arraysBySiteCd[siteCd] || {
    includesStr: ["AR", "NR", "GP", "PA", "MC", "SM", "MA", 'GP', 'PA', 'OT'],
    includesStr2: ["NR", "AR", "MC", "MA", "SM", 'GP', 'PA', 'OT'],
  };

  // testType에 따라 제외할 부분 정의
  return (testType === '01' || testType === '04') ? arraysForSiteCd.includesStr : arraysForSiteCd.includesStr2;
};

const totalCountSet = (showType: string, wbcInfoChangeVal: any) => {
  if (showType === 'before') {
    totalBeforeCount.value = 0;
  } else if (showType === 'after') {
    totalAfterCount.value = 0;
  }

  wbcInfoChangeVal.forEach((item: any) => {
    if (projectBm.value) {
      if (item.title !== 'OT') {
        showType === 'before' ? totalBeforeCount.value += Number(item.count) : totalAfterCount.value += Number(item.count);
      }
    } else {
      const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
      const titleInArray = targetArray.includes(item.title);
      if (!titleInArray) {
        showType === 'before' ? totalBeforeCount.value += Number(item.count) : totalAfterCount.value += Number(item.count);
      }
    }
  });
}

async function updateOriginalDb() {
  // wbcInfo.value를 깊은 복제(clone)하여 새로운 배열을 생성
  let clonedWbcInfo = JSON.parse(JSON.stringify([...wbcInfoAfterVal.value]));
  let totalCount = 0;
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      if (projectBm.value) {
        if (image.title !== 'OT') {
          totalCount += 1
        }
      } else {
        const targetArray = getStringArrayBySiteCd(siteCd.value, selectItems.value?.testType);
        if (!targetArray.includes(image.title)) {
          totalCount += 1;
        }
      }
    });
  });
  // 각 이미지 객체에서 width와 height 속성은 저장 안해도되는 부분이라서 디비에 저장 안함
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      delete image.width;
      delete image.height;
      delete image.filter;
    });

    createPercent(item, totalCount);
  });

  // wbcInfoAfter 업데이트 및 sessionStorage에 저장
  selectItems.value.wbcInfoAfter = clonedWbcInfo;
  await store.dispatch('commonModule/setCommonInfo', {classInfoSort: [...wbcInfoAfterVal.value]});


  const sortArr = sortWbcInfo(orderClass.value, wbcInfoVal.value);
  sortArr.forEach((item: any, index: any) => {
    item.orderIdx = index;
  });

  // originalDb 업데이트
  const res: any = await detailRunningApi(String(selectedSampleId.value));
  if (res) {
    res.data.wbcInfoAfter = clonedWbcInfo;
  }

  await putOrderClassApi(sortArr);

  //updateRunningApi 호출
  await updateRunningApiPost(clonedWbcInfo, [res.data]);

  emits('classOrderChanged')
  await store.dispatch('commonModule/setCommonInfo', {classInfoSort: []});
}

async function updateRunningApiPost(wbcInfo: any, originalDb: any) {
  // 러닝 인포 디비에 다시 재저장
  try {
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const response = await updateRunningApi({
      userId: Number(userId.value),
      runingInfoDtoItems: originalDb,
      dayQuery: dayQuery
    })
    if (response) {

    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const getCustomClass = async () => {
  try {
    const result = await getWbcCustomClassApi();
    customClassArr.value = result.data;
  } catch (e) {
    console.log(e);
  }
}

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
  window.scrollTo({top: 0, behavior: 'smooth'});
};
const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

const onImageError = () => {
  barCodeImageShowError.value = true;
}

</script>