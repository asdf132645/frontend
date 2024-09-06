<!-- App.vue -->
<template>
  <div>
    <AppHeader
        v-if="router.currentRoute.value.path !== '/user/login' && router.currentRoute.value.path !== '/user/join'"/>
    <main class="content" :class="{ bmComponent: projectBm }">
      <router-view/>
      <Analysis @classAppUpdateLast="classAppUpdateLast"
                @rbcAppUpdate="rbcAppUpdate"
                :parsedData="parsedDataProps"
                :isClass="router.currentRoute.value.path === '/'"
                :startStatus="startStatus"
                :pb100aCassette="pb100aCassette"
                :stataasdasd="stataasdasd"
      />
    </main>
    <Alert
        v-if="showAlert"
        :is-visible="showAlert"
        :type="alertType"
        :message="alertMessage"
        @hide="hideAlert"
        @update:hideAlert="hideAlert"
    />
  </div>
</template>

<script setup lang="ts">

import AppHeader from "@/components/layout/AppHeader.vue";

const router = useRouter();
import {
  getCurrentInstance,
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  onBeforeUnmount,
  onBeforeMount,
} from 'vue';
import {useStore} from "vuex";
import {sysInfoStore, runningInfoStore} from '@/common/lib/storeSetData/common';
import {tcpReq} from '@/common/tcpRequest/tcpReq';
import {messages} from '@/common/defines/constFile/constantMessageText';
import {
  getCellImgApi,
  getNormalRangeApi,
} from "@/common/api/service/setting/settingApi";
import {checkPbNormalCell} from "@/common/lib/utils/changeData";
import {ApiResponse} from "@/common/api/httpClient";
import {createRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import Alert from "@/components/commonUi/Alert.vue";
import {useRouter} from "vue-router";
import {createDeviceInfoApi, getDeviceInfoApi, getDeviceIpApi} from "@/common/api/service/device/deviceApi";
import EventBus from "@/eventBus/eventBus";
import {basicBmClassList, basicWbcArr} from "@/common/defines/constFile/classArr";
import Analysis from "@/views/analysis/index.vue";
import {logoutApi} from "@/common/api/service/user/userApi";
import {formatDate} from "@/common/lib/utils/dateUtils";
import {inhaPercentChange} from "@/common/lib/commonfunction/classFicationPercent";
import axios from "axios";

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const store = useStore();
const commonDataGet = computed(() => store.state.commonModule);
const instance = getCurrentInstance();
const userId = ref('');
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const normalItems = ref<any>([]);
const userModuleDataGet = computed(() => store.state.userModule);
const reqArr = computed(() => store.state.commonModule);
const runningInfoBoolen = ref(false);
let countingInterStartval: any = null;
let countingInterRunval: any = null;
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const slotIndex = computed(() => store.state.commonModule.slotIndex);
const siteCd = computed(() => store.state.commonModule.siteCd);
const isDownloadOrUploading = computed(() => store.state.commonModule.isDownloadOrUploading);

const isNsNbIntegrationLocal = ref('N');
const runningArr: any = ref<any>([]);
const classArr = ref<any>([]);
const rbcArr = ref<any>([]);
const viewerCheckApp = ref('');
const projectBm = ref(false);
const parsedDataProps = ref<any>({});
const startStatus = ref(false);
const pbVersion = ref<any>('');
const pb100aCassette = ref<any>('');
const deleteData = ref(false);
let socketTimeoutId: number | undefined = undefined; // 타이머 ID 저장
const isFullscreen = ref<boolean>(false);
let intervalId: any;
const stataasdasd = ref(false);
const ipMatches = ref(false);
const barcodeNum = ref('');

instance?.appContext.config.globalProperties.$socket.on('isTcpConnected', async (isTcpConnected) => {
  console.log('isTcpConnected', isTcpConnected);
  if (isTcpConnected) {
    setTimeout(async () => {
      await store.dispatch('commonModule/setCommonInfo', {isTcpConnected: true});
    }, 1500)
  }
})

instance?.appContext.config.globalProperties.$socket.on('viewerCheck', async (ip) => { // 뷰어인지 아닌지 체크하는곳
  await getIpAddress(ip)
});

const siteCdDvBarCode = ref(false);

const getIpAddress = async (ip: string) => {
  try {
    const result = await getDeviceIpApi();
    if (result.data === ip) {
      viewerCheckApp.value = result.data;
    } else {
      viewerCheckApp.value = result.data;
    }
  } catch (e) {
    console.log(e)
  }
}

function checkFullscreenStatus() {
  const {path} = router.currentRoute.value;
  if (path === '/user/login') {
    return;
  }
  isFullscreen.value = window.matchMedia('(display-mode: fullscreen)').matches;
  if (!isFullscreen.value) {
    showErrorAlert('Please click the full screen button.');
  } else {
    if (alertMessage.value === 'Please click the full screen button.') {
      hideAlert();
    }
  }
}

function startChecking() {
  // 화면 상태를 즉시 업데이트
  checkFullscreenStatus();
  // 1분(60000ms)마다 체크를 수행
  intervalId = setInterval(checkFullscreenStatus, 60000);
}


watch(reqArr.value, async (newVal, oldVal) => {
  if (!newVal.reqArr) return;
  const uniqueReqArr = removeDuplicateJobCmd(newVal.reqArr);
  const notSysRunInfo = uniqueReqArr.filter((item: any) => !['SYSINFO', 'RUNNING_INFO'].includes(item.jobCmd));

  if (isDownloadOrUploading.value) {
    await store.dispatch('commonModule/setCommonInfo', {reqArrPaste: []});
    return;
  }

  if (notSysRunInfo.length > 0) {
    await sendMessage(notSysRunInfo[0]);
    await store.dispatch('commonModule/setCommonInfo', {reqArrPaste: []});
    return;
  }

  if (deleteData.value) {
    deleteData.value = false;
    await store.dispatch('commonModule/setCommonInfo', {reqArrPaste: []});
    return
  }

  if (uniqueReqArr.length === 0) return;


  // `notSysRunInfo`와 `uniqueReqArr` 처리
  if (notSysRunInfo.length > 0) {
    await sendMessage(notSysRunInfo[0]);
  } else {
    await sendMessage(uniqueReqArr[0]);
  }

  // `reqArrPaste` 상태 초기화
  await store.dispatch('commonModule/setCommonInfo', {reqArrPaste: []});
});


watch(userModuleDataGet.value, (newUserId, oldUserId) => {
  if (newUserId.id === '') {
    return;
  }
  cellImgGet();
  userId.value = newUserId.id;
});


onBeforeMount(() => {
  instance?.appContext.config.globalProperties.$socket.emit('viewerCheck', {
    type: 'SEND_DATA',
    payload: window.APP_API_BASE_URL
  });
});

window.addEventListener('beforeunload', async function (event: any) {
  await logoutApi({userId: userId.value});
  await store.dispatch('commonModule/setCommonInfo', {firstLoading: false});
});

window.addEventListener('unload', async () => {
  if (!ipMatches.value) return;
  instance?.appContext.config.globalProperties.$socket.emit('message', {
    type: 'SEND_DATA',
    payload: {
      jobCmd: 'clientExit',
      reqUserId: '',
      reqDttm: '',
    }
  });
})

const leave = async (event: any) => {
  event.preventDefault();
  if (!ipMatches.value) {
    const result = await getDeviceIpApi();
    const ipAddress = `ip=${result.data}`
    const url = `http://${result.data}:3000/close?${ipAddress}`;
    await axios.get(url);
  }
};

onBeforeMount(() => {
  projectBm.value = window.PROJECT_TYPE === 'bm';
  pbVersion.value = window.PB_VERSION;
})
const isIpMatching = (url: any, ip: any) => {
  // URL에서 IP 주소 추출
  const urlPattern = /http:\/\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+):/;
  const match = url.match(urlPattern);
  if (match && match[1]) {
    // 추출된 IP 주소와 주어진 IP 주소 비교
    return match[1] === ip;
  }
  return false;
};

onMounted(async () => {
  await nextTick();
  await cellImgGet();
  startChecking();
  const result = await getDeviceIpApi();
  ipMatches.value = isIpMatching(window.APP_API_BASE_URL, result.data);
  siteCdDvBarCode.value = false;
  window.addEventListener('beforeunload', leave);

  if (userId.value === '') { // 사용자가 강제 초기화 시킬 시 유저 정보를 다시 세션스토리지에 담아준다.
    await store.dispatch('userModule/setUserAction', getStoredUser);
    userId.value = userModuleDataGet.value.id
  }

  if (!commonDataGet.value.isRunningState) {
    if (userId.value && userId.value !== '') {
      await getNormalRange();
    }
    if (!commonDataGet.value.firstLoading && ipMatches.value && window.FORCE_VIEWER === 'main') {
      countingInterStartval = setInterval(async () => {
        await startSysPostWebSocket();
      }, 400);

      countingInterRunval = setInterval(async () => {
        if (!commonDataGet.value.runningInfoStop) {
          await runInfoPostWebSocket();
        }
      }, 500);
      await store.dispatch('commonModule/setCommonInfo', {firstLoading: true});
    }
  }
  EventBus.subscribe('childEmitSocketData', emitSocketData);

});

onBeforeUnmount(async () => {
  window.removeEventListener('beforeunload', leave);

  if (countingInterRunval) {
    clearInterval(countingInterRunval);
    countingInterRunval = null;
  }
  if (countingInterStartval) {
    clearInterval(countingInterRunval);
    countingInterRunval = null;
  }
});

instance?.appContext.config.globalProperties.$socket.on('chat', async (data) => {
  await socketData(data);
});

async function socketData(data: any) {
  if (commonDataGet.value.viewerCheck !== 'main') {
    return;
  }
  deleteData.value = false;
  try {
    if (typeof data === 'string') {
      await showSuccessAlert(messages.TCP_DiSCONNECTED);
      return
    }
    const textDecoder = new TextDecoder('utf-8');
    const stringData = textDecoder.decode(data);

    const parsedData = JSON.parse(stringData);
    const parseDataWarp = parsedData;

    if (alertMessage.value === messages.TCP_DiSCONNECTED) {
      hideAlert();
    }

    // 시스템정보 스토어에 담기
    switch (parseDataWarp.jobCmd) {
      case 'RBC_RE_CLASSIFICATION':
        await store.dispatch('commonModule/setCommonInfo', {rbcReDataClass: true});
        await store.dispatch('commonModule/setCommonInfo', {rbcReData: true});
        await store.dispatch('commonModule/setCommonInfo', {rbcReDataCheck: false});
        break;
      case 'SYSINFO':
        const res = await sysInfoStore(parseDataWarp);
        if (res !== null) {
          showErrorAlert(res);
        }
        const deviceInfoObj = {
          siteCd: parseDataWarp.siteCd,
          deviceSerialNm: parseDataWarp.deviceSerialNm
        }
        if (!siteCdDvBarCode.value) {
          await saveDeviceInfo(deviceInfoObj);
        }
        break;
      case 'INIT':
        barcodeNum.value = '';
        await store.dispatch('commonModule/setCommonInfo', {initValData: false});
        sendSettingInfo();
        break;
      case 'START':
        barcodeNum.value = '';
        await runnStart();
        break;
      case 'RUNNING_INFO':
        parsedDataProps.value = parseDataWarp;
        runningInfoBoolen.value = true;
        await runningInfoStore(parseDataWarp);
        await runningInfoCheckStore(parseDataWarp);
        break;
      case 'STOP':
        console.log('stop!=--------------------------')
        barcodeNum.value = '';
        await store.dispatch('commonModule/setCommonInfo', {isRunningState: false});
        await store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
        await store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: []});
        await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: false});
        startStatus.value = false;
        runningInfoBoolen.value = false;
        break;
      case 'RUNNING_COMP':// 완료가 된 상태이므로 각 페이지에 완료가 되었다는 정보를 저장한다.
        barcodeNum.value = '';
        await runnComp();
        break;
      case 'PAUSE':
        barcodeNum.value = '';
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {isPause: true}); // 일시정지 상태로 변경한다.
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: []});
        await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: false});
        startStatus.value = false;
        runningInfoBoolen.value = false;
        break;
      case 'RESTART':
        barcodeNum.value = '';
        await runningInfoStore(parseDataWarp);
        await runningInfoCheckStore(parseDataWarp);
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {isPause: false}); // start 가 되면 false로 변경
        await store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
        await store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
        runningInfoBoolen.value = true;
        startStatus.value = true;
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: []});
        classArr.value = [];
        rbcArr.value = [];
        break;
      case 'RECOVERY':
        barcodeNum.value = '';
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {userStop: false});
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: []});
        break;
      case 'ERROR_CLEAR':
        console.log('err')
        await showSuccessAlert(messages.IDS_MSG_FAILED);
        break;
      case 'SEARCH_CARD_COUNT':
        break;
    }

    async function runnComp() {
      await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: true});
      await store.dispatch('commonModule/setCommonInfo', {embeddedNumber: String(data?.iCasStat)});
      await store.dispatch('commonModule/setCommonInfo', {startEmbedded: false});
      await store.dispatch('commonModule/setCommonInfo', {isRunningState: false}); // 시스템이 돌아가는 상태를 알려준다.
      await store.dispatch('commonModule/setCommonInfo', {isAlarm: true}); // 알람을 킨다.
      await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
      await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
      await store.dispatch('commonModule/setCommonInfo', {runningArr: []});
      await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'stop'});// 슬라이드가 끝났으므로 stop을 넣어서 끝낸다.
      await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: false});
      runningInfoBoolen.value = false;
      startStatus.value = false;
    }

    async function runnStart() {
      await store.dispatch('commonModule/setCommonInfo', {isRunningState: true});// 실행중이라는 여부를 보낸다
      await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'}); // 첫 슬라이드가 시작되었음을 알려준다.
      await store.dispatch('commonModule/setCommonInfo', {startEmbedded: 'start',});
      await store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
      await store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
      await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: false});
      await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
      await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
      await store.dispatch('commonModule/setCommonInfo', {runningArr: []});
      startStatus.value = true;
      classArr.value = [];
      rbcArr.value = [];
      runningInfoBoolen.value = true;
    }

    async function runningInfoCheckStore(data: any | undefined) {
      const regex = /[1,2,9]/g;
      if (String(data?.iCasStat) !== '999999999999') { // 스캔중일때는 pass + 완료상태일때도
        const dataICasStat = String(data?.iCasStat);
        const currentSlot = data?.slotInfo;
        const str: any = data?.iCasStat;
        const iCasStatArr: any = [...str];
        const lastCompleteIndex = iCasStatArr.lastIndexOf("3") === -1 ? 0 : iCasStatArr.lastIndexOf("3") + 1;

        if (iCasStatArr.lastIndexOf("2") === 0) {
          await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: true});
        }
        if (data?.iCasStat.indexOf("2") !== -1) {
          await store.dispatch('commonModule/setCommonInfo', {slideProceeding: data?.iCasStat.indexOf("2")});
        }

        if (pbVersion.value === '100a') {
          if (data?.iCasChange === '1') {
            pb100aCassette.value = 'reset';
          } else {
            pb100aCassette.value = '';
          }
        }

        // iCasStat (0 - 없음, 1 - 있음, 2 - 진행중, 3 - 완료, 4 - 에러, 9 - 스캔)
        if ((dataICasStat.search(regex) < 0) || data?.oCasStat === '111111111111' && !commonDataGet.value.runningInfoStop) {
          tcpReq().embedStatus.runIngComp.reqUserId = userModuleDataGet.value.userId;
          if (pbVersion.value !== '100a') {
            await store.dispatch('commonModule/setCommonInfo', {reqArr: tcpReq().embedStatus.runIngComp});
            await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: true});
          } else {
            if (data?.workingDone === 'Y') {
              await store.dispatch('commonModule/setCommonInfo', {reqArr: tcpReq().embedStatus.runIngComp});
              await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: true});
            }
          }
          await saveTestHistory(data, data?.slotInfo?.slotNo);
          return;
        }

        await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'});
        //슬라이드 변경시 데이터 저장
        if (currentSlot?.isLowPowerScan === 'Y' && currentSlot?.testType === '03') {// running info 종료
          tcpReq().embedStatus.pause.reqUserId = userId.value;
          await store.dispatch('commonModule/setCommonInfo', {reqArr: tcpReq().embedStatus.pause});
          tcpReq().embedStatus.pause.reqUserId = userId.value;
          await store.dispatch('commonModule/setCommonInfo', {isRunningState: false});
        } else {
          if (lastCompleteIndex !== slotIndex.value) {
            await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'afterChange'});
            await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: true});
            await saveTestHistory(runningArr.value, runningArr.value?.slotInfo?.slotNo);
            await store.dispatch('commonModule/setCommonInfo', {runningSlotId: currentSlot?.slotId});
            await store.dispatch('commonModule/setCommonInfo', {slotIndex: lastCompleteIndex})
          }
        }
        // 데이터 넣는 부분
        if (iCasStatArr.lastIndexOf("2") !== -1) {
          runningArr.value = data;
        }

      }

    }

    async function saveTestHistory(params: any, idx: any, slotId?: any, lastCompleteIndex?: any) {
      const completeSlot = params.slotInfo;
      if (completeSlot) {

        completeSlot.userId = userId.value;
        completeSlot.cassetId = params.cassetId;
        completeSlot.isNormal = 'Y' // PB 비정상 클래스 체크

        if (completeSlot.analysisType === '01') {
          completeSlot.isNormal = checkPbNormalCell(completeSlot.wbcInfo, normalItems.value).isNormal;
        }

        const classElements = classArr.value.filter((element: any) => element?.slotId === completeSlot.slotId);
        const rbcArrElements = rbcArr.value.filter((element: any) => element?.slotId === completeSlot.slotId);

        const matchedWbcInfo = classElements[0];
        const newWbcInfo = {
          wbcInfo: matchedWbcInfo?.wbcInfo,
          nonRbcClassList: matchedWbcInfo?.nonRbcClassList,
          totalCount: matchedWbcInfo?.totalCount,
          maxWbcCount: matchedWbcInfo?.maxWbcCount,
        }
        let wbcInfoAfter: any = [];
        let wbcInfoNewVal: any = [];
        const getDefaultWbcInfo = () => !projectBm.value ? { wbcInfo: [basicWbcArr] } : { wbcInfo: [basicBmClassList] };
        const getDefaultWbcInfoAfter = () => !projectBm.value ? [basicWbcArr] : [basicBmClassList];
        const updateWbcInfo = () => Object.keys(newWbcInfo).length === 0 ? getDefaultWbcInfo() : newWbcInfo;
        const updateWbcInfoAfter = () => Object.keys(newWbcInfo).length === 0 ? getDefaultWbcInfoAfter() : newWbcInfo?.wbcInfo[0];

        if (siteCd.value === '0011') {
          // 인하대 WBC 정보를 저장
          if(completeSlot.testType !== '04'){
            newWbcInfo.wbcInfo[0] = await inhaDataChangeSave(completeSlot, matchedWbcInfo?.wbcInfo);
          }

          // WBC 정보 업데이트
          wbcInfoNewVal = updateWbcInfo();
          wbcInfoAfter = updateWbcInfoAfter();
          // 바코드 번호가 다를 경우 이벤트 버스에 저장
          if (barcodeNum.value !== completeSlot.barcodeNo) {
            EventBus.publish('appVueSlideDataSaveLisSave', newWbcInfo.wbcInfo[0], rbcArrElements[0].rbcInfo, completeSlot.barcodeNo);
            barcodeNum.value = completeSlot?.barcodeNo;
          }
        } else {
          // 기본 WBC 정보로 업데이트
          wbcInfoNewVal = updateWbcInfo();
          wbcInfoAfter = updateWbcInfoAfter();
        }


        const newObj = {
          slotNo: completeSlot.slotNo,
          lock_status: false,
          traySlot: '1-' + idx,
          barcodeNo: completeSlot.barcodeNo,
          patientId: completeSlot.patientId,
          patientNm: completeSlot.patientNm,
          gender: completeSlot.gender,
          birthDay: completeSlot.birthDay,
          wbcCount: completeSlot.wbcCount,
          slotId: completeSlot.slotId,
          orderDttm: completeSlot.orderDttm,
          testType: completeSlot.testType,
          analyzedDttm: tcpReq().embedStatus.settings.reqDttm,
          tactTime: completeSlot.tactTime,
          maxWbcCount: completeSlot.maxWbcCount,
          bf_lowPowerPath: completeSlot.bf_lowPowerPath,
          wbcInfo: wbcInfoNewVal,
          wbcInfoAfter: wbcInfoAfter,
          rbcInfo: !projectBm.value ? {
            pltCount: completeSlot.pltCount,
            malariaCount: completeSlot.malariaCount,
            maxRbcCount: completeSlot.maxRbcCount,
            rbcClass: rbcArrElements[0].rbcInfo,
          } : [],
          rbcInfoAfter: !projectBm.value ? rbcArrElements[0].rbcInfo : [],
          bminfo: completeSlot.bminfo,
          cassetId: completeSlot.cassetId,
          isNormal: completeSlot.isNormal,
          submitState: '',
          submitOfDate: '',
          submitUserId: '',
          isNsNbIntegration: isNsNbIntegrationLocal.value || '',
          wbcMemo: '',
          rbcMemo: '',
        }

        await saveRunningInfo(newObj, slotId, lastCompleteIndex);
      }
    }

    async function inhaDataChangeSave(runningInfoData: any, wbcInfo: any) {
      if (runningInfoData.testType !== '04') {
        const excludedTitles = ['NR', 'AR', 'GP', 'PA', 'MC', 'MA'];

        // wbcTotal 계산
        let wbcTotal = 0;
        wbcInfo.forEach((wbcItem: any) => {
          if (Number(wbcItem.count) > 0 && !excludedTitles.includes(wbcItem.title)) {
            wbcTotal += Number(wbcItem.count);
          }
        });
        // console.log('wbcTotal : ' + wbcTotal);

        let maxItem: any = null;
        let percentTotal = 0;

        // 퍼센트 계산 및 maxItem 결정
        wbcInfo.forEach((wbcItem: any, index: any) => {
          let percent = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(0));
          let percentN2 = Number(((Number(wbcItem.count) / wbcTotal) * 100).toFixed(2));

          // console.log(percentN2);

          // 특정 조건에 따라 퍼센트 조정
          if ((wbcItem.title === 'BL' || ['LA', 'IM', 'MB', 'AM'].includes(wbcItem.title)) &&
              Number(wbcItem.count) > 0 &&
              percentN2 >= 0 &&
              percentN2 <= 1) {
            percent = 1;
          }

          wbcItem.percent = percent;
          // console.log(wbcItem.title + ':' + wbcItem.percent);

          // 제외할 타이틀이 아닌 경우 percentTotal 및 maxItem 갱신
          if (!excludedTitles.includes(wbcItem.title)) {
            percentTotal += Number(wbcItem.percent);
            if (maxItem === null || Number(maxItem.count) < Number(wbcItem.count)) {
              maxItem = wbcItem;
            }
          }

          // console.log('maxItem : ' + (maxItem ? maxItem.title : 'null'));
          // console.log(percentTotal);

          // 마지막 항목일 때 백분율 오차 보정
          if (maxItem !== null && (index + 1) === wbcInfo.length) {
            // console.log(Number(maxItem.percent));
            // console.log(100 - percentTotal);
            maxItem.percent = Number(maxItem.percent) + (100 - percentTotal);
            // console.log(maxItem.percent);
          }
        });

        return wbcInfo;
      }
    }


    async function saveDeviceInfo(deviceInfo: any) {
      try {
        const deviceData = await getDeviceInfoApi();
        if (deviceData.data.length === 0 || !deviceData.data) {
          await createDeviceInfoApi({deviceItem: deviceInfo});
          siteCdDvBarCode.value = true;
        } else {
          siteCdDvBarCode.value = true;
        }

        await store.dispatch('commonModule/setCommonInfo', {siteCd: parseDataWarp.siteCd})
        localStorage.setItem('siteCd', parseDataWarp.siteCd);
      } catch (err) {
        console.error("Error handling device information", err);
        siteCdDvBarCode.value = true;
      }
    }

    async function saveRunningInfo(runningInfo: any, slotId: any, last: any) {
      try {
        let result: ApiResponse<void>;
        console.log('저장 전 runingInfoDtoItems', runningInfo);
        result = await createRunningApi({userId: Number(userId.value), runingInfoDtoItems: runningInfo});

        if (result) {
          if (slotId) {
            console.log('save successful');
          }
          delayedEmit('SEND_DATA', 'refreshDb', 300);
        }
      } catch (e) {
        console.error(e);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const delayedEmit = (type: string, payload: string, delay: number) => {
  if (socketTimeoutId !== undefined) {
    clearTimeout(socketTimeoutId); // 이전 타이머 클리어
  }

  socketTimeoutId = window.setTimeout(() => {
    instance?.appContext.config.globalProperties.$socket.emit('state', {
      type: 'SEND_DATA',
      payload: 'refreshDb'
    });
  }, delay);
};
const rbcAppUpdate = (data: any) => {
  rbcArr.value[data.iCasStatArr] = data.rbc;
}

const classAppUpdateLast = (data: any) => {
  classArr.value[data.iCasStatArr] = data.classInfo;
}

// jobCmd가 중복되지 않도록 배열 필터링
const removeDuplicateJobCmd = (reqArr: any) => {
  const uniqueJobCmds = new Set(); // 중복을 체크하기 위한 Set 생성
  const uniqueReqArr: any = []; // 중복되지 않은 jobCmd를 담을 배열
  reqArr.forEach((req: any) => {
    if (!uniqueJobCmds.has(req.jobCmd)) {
      uniqueJobCmds.add(req.jobCmd); // Set에 jobCmd 추가
      uniqueReqArr.push(req); // 유니크한 jobCmd인 경우 배열에 추가
    }
  });
  return uniqueReqArr;
};

const startSysPostWebSocket = async () => {
  tcpReq().embedStatus.sysInfo.reqUserId = userId.value;
  const req = tcpReq().embedStatus.sysInfo;
  await store.dispatch('commonModule/setCommonInfo', {reqArr: req});
};

const runInfoPostWebSocket = async () => {
  if (!runningInfoBoolen.value) {
    return;
  }
  tcpReq().embedStatus.runningInfo.reqUserId = userId.value;
  const req = tcpReq().embedStatus.runningInfo;
  await store.dispatch('commonModule/setCommonInfo', {reqArr: req});
};

const emitSocketData = async (payload: any) => {
  await store.dispatch('commonModule/setCommonInfo', {reqArr: payload});
  await store.dispatch('commonModule/setCommonInfo', {rbcReDataCheck: true});
};

const sendSettingInfo = () => {
  const req = {
    jobCmd: 'SETTINGS',
    reqUserId: '',
    reqDttm: tcpReq().embedStatus.settings.reqDttm,
    pbiaRootDir: pbiaRootDir.value || '',
    oilCount: '1000',
    isOilReset: 'N',
    deviceType: '01',
    // uiVersion: 'uimd-pb-comm_v2.0.102',
    isNsNbIntegration: isNsNbIntegrationLocal.value,
  };
  store.dispatch('commonModule/setCommonInfo', {reqArr: req});
}

const getNormalRange = async () => {
  try {
    const result = await getNormalRangeApi();
    if (result) {
      if (result?.data) {
        const data = result.data;
        normalItems.value = data;
      }
    }
  } catch (e) {
    console.log(e);
  }
}


// 메시지를 보내는 함수
const sendMessage = async (payload: any) => {
  const executeAfterDelay = async () => {
    instance?.appContext.config.globalProperties.$socket.emit('message', {
      type: 'SEND_DATA',
      payload: payload
    });
  };
  await executeAfterDelay();
  deleteData.value = true;
};


const cellImgGet = async () => {
  try {
    const result = await getCellImgApi();
    if (result) {
      if (result?.data) {
        const data = result.data;
        sessionStorage.setItem('iaRootPath', data?.iaRootPath);
        await store.dispatch('commonModule/setCommonInfo', {iaRootPath: String(data?.iaRootPath)});
        await store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
          isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N'
        });
        isNsNbIntegrationLocal.value = data?.isNsNbIntegration ? 'Y' : 'N';
        await store.dispatch('commonModule/setCommonInfo', {isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N'});
        sessionStorage.setItem('isNsNbIntegration', data?.isNsNbIntegration ? 'Y' : 'N');
        sessionStorage.setItem('wbcPositionMargin', data?.diffWbcPositionMargin);
        sessionStorage.setItem('rbcPositionMargin', data?.diffRbcPositionMargin);
        sessionStorage.setItem('pltPositionMargin', data?.diffPltPositionMargin);
        const keepPageType = window.PROJECT_TYPE === 'pb' ? 'keepPage' : 'bmKeepPage';
        sessionStorage.setItem(keepPageType, String(data?.keepPage));
        sessionStorage.setItem('edgeShotType', String(data?.edgeShotType));
        sessionStorage.setItem('keepPage', String(data?.keepPage));
      }
    }
  } catch (e) {
    console.log(e);
  }
}

const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};


</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  width: 100%;
}
</style>
