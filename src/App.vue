<!-- App.vue -->
<template>
  <div>
    <AppHeader
        v-if="router.currentRoute.value.path !== '/user/login' && router.currentRoute.value.path !== '/user/join'"/>
    <main class='content' :class="{ 'bmComponent': projectBm }">
      <router-view/>
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
import {getCurrentInstance, ref, computed, watch, onMounted, nextTick, onBeforeUnmount, onBeforeMount} from 'vue';
import {useStore} from "vuex";
import {sysInfoStore, runningInfoStore, rbcInfoStore} from '@/common/lib/storeSetData/common';
import {RunningInfo, SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {tcpReq} from '@/common/tcpRequest/tcpReq';
import {messages} from '@/common/defines/constFile/constantMessageText';
import {
  getCellImgApi,
  getNormalRangeApi,
} from "@/common/api/service/setting/settingApi";
import {checkPbNormalCell} from "@/common/lib/utils/changeData";
import {ApiResponse} from "@/common/api/httpClient";
import {createRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {RuningInfo} from "@/common/api/service/runningInfo/dto/runningInfoDto";
import {parseDateString} from "@/common/lib/utils/dateUtils";
import Alert from "@/components/commonUi/Alert.vue";
import {useRouter} from "vue-router";
import EventBus from "@/eventBus/eventBus";
import {getAllUsersApi, getUserApi, getUserIpApi} from "@/common/api/service/user/userApi";
import * as process from "process";
import {faL} from "@fortawesome/free-solid-svg-icons";


const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const store = useStore();
const commonDataGet = computed(() => store.state.commonModule);
const embeddedStatus = computed(() => store.state.embeddedStatusModule);
const dataBaseSetDataModule = computed(() => store.state.dataBaseSetDataModule);

const instance = getCurrentInstance();
const runningSlotId = computed(() => store.state.commonModule.runningSlotId);
const userId = ref('');
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const normalItems = ref<any>([]);
const userModuleDataGet = computed(() => store.state.userModule);
const reqArr = computed(() => store.state.commonModule);
const runningInfoBoolen = ref(false);
let countingInterStartval: any = null;
let countingInterRunval: any = null;
const isNsNbIntegration = ref('');
const pbiaRootDir = computed(() => store.state.commonModule.pbiaRootPath);
const slotIndex = computed(() => store.state.commonModule.slotIndex);
const runningArr = computed(() => store.state.commonModule.runningArr);
const classArr = computed(() => store.state.commonModule.classArr);
const rbcArr = computed(() => store.state.commonModule.rbcArr);
const processInfo = computed(() => store.state.commonModule.processInfo);
const orderList = computed(() => store.state.commonModule.orderList);

const viewerCheckApp = ref('');
const projectBm = ref(false);

const worker = ref<Worker | null>(null);

// 웹 워커에서 수신한 메시지를 저장할 변수
const workerMessage = ref<string>('');


instance?.appContext.config.globalProperties.$socket.on('viewerCheck', async (ip) => { // 뷰어인지 아닌지 체크하는곳
  await getUserIp(ip)
})

const getUserIp = async (ip: string) => {
  try {
    const result = await getUserIpApi();
    if (result.data === ip) {
      viewerCheckApp.value = result.data;
    } else {
      viewerCheckApp.value = result.data;
    }
  } catch (e) {
    console.log(e)
  }
}

watch(reqArr.value, async (newVal, oldVal) => {
  // 새 값이 특정 조건을 충족하는지 확인
  if (newVal.reqArr) {
    const uniqueReqArr = removeDuplicateJobCmd(newVal.reqArr); // 중복된 jobCmd를 제거하여 유니크한 배열 생성
    // 유니크한 reqArr 배열에 항목이 있는지 확인
    if (uniqueReqArr.length > 0) {
      // console.log(uniqueReqArr)
      if (uniqueReqArr.length > 1) {
        const notSysRunInfo = uniqueReqArr.filter((item: any) => (item.jobCmd !== 'SYSINFO' && item.jobCmd !== 'RUNNING_INFO'));
        await sendMessage(notSysRunInfo[0]);
      } else {
        await sendMessage(uniqueReqArr[0]);
      }
      await store.dispatch('commonModule/setCommonInfo', {reqArrPaste: []});
    }
  }
});

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


watch(userModuleDataGet.value, (newUserId, oldUserId) => {
  if (newUserId.id === '') {
    return;
  }
  cellImgGet(newUserId.id);
  userId.value = newUserId.id;
});
onBeforeMount(() => {
  instance?.appContext.config.globalProperties.$socket.emit('viewerCheck', {
    type: 'SEND_DATA',
    payload: process.env.MAIN_API
  });
});
window.addEventListener('beforeunload', function (event: any) {
  store.dispatch('commonModule/setCommonInfo', {firstLoading: false});
});
const leave = (event: any) => {
  event.preventDefault();
};

onMounted(async () => {
  await nextTick();
  window.addEventListener('beforeunload', leave);
  // 현재 프로젝트가 bm인지 확인하고 클래스 부여
  projectBm.value = process.env.PROJECT_TYPE === 'bm';

  if (userId.value === '') { // 사용자가 강제 초기화 시킬 시 유저 정보를 다시 세션스토리지에 담아준다.
    await store.dispatch('userModule/setUserAction', getStoredUser);
    userId.value = userModuleDataGet.value.id
  }

  if (!commonDataGet.value.isRunningState) {
    if (userId.value && userId.value !== '') {
      await getNormalRange();
    }
    if (!commonDataGet.value.firstLoading) {
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
    isNsNbIntegration.value = sessionStorage.getItem('isNsNbIntegration') || '';
  }
  EventBus.subscribe('messageSent', emitSocketData);
  // 웹 워커 생성
  // worker.value = new Worker(new URL('./webWorker/index.ts', import.meta.url));
  //
  // // 웹 워커 이벤트 리스너 등록
  // worker.value.onmessage = function(event) {
  //   // 웹 워커에서 수신한 메시지 처리
  //   workerMessage.value = event.data;
  //   console.log(event)
  // };
  //
  // // 웹 워커로 메시지 보내기
  // const dataToSend = 'Hello, Worker!';
  // worker.value.postMessage(dataToSend);
});
onBeforeUnmount(() => {
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
  if(commonDataGet.value.viewerCheck !== 'main'){
    return;
  }
  try {
    if(typeof data === 'string'){
      await showSuccessAlert(messages.TCP_DiSCONNECTED);
      return
    }else{
      hideAlert();
    }
    await store.dispatch('commonModule/setCommonInfo', {chatRunningData: []});
    const textDecoder = new TextDecoder('utf-8');
    const stringData = textDecoder.decode(data);

    const parsedData = JSON.parse(stringData);
    const parseDataWarp = parsedData;
    // await store.dispatch('commonModule/setCommonInfo', {resFlag: true});
    // 시스템정보 스토어에 담기
    switch (parseDataWarp.jobCmd) {
      case 'SYSINFO':
        await sysInfoStore(parseDataWarp);
        await store.dispatch('commonModule/setCommonInfo', {startInfoBoolen: true});
        break;
      case 'INIT':
        // sendSettingInfo();
        break;
      case 'START':
        await store.dispatch('commonModule/setCommonInfo', {startInfoBoolen: false});
        await store.dispatch('commonModule/setCommonInfo', {isRunningState: true});// 실행중이라는 여부를 보낸다
        await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'}); // 첫 슬라이드가 시작되었음을 알려준다.
        await store.dispatch('commonModule/setCommonInfo', {startEmbedded: 'start',});
        await store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
        await store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
        await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: false});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: [{},{},{},{},{},{},{},{},{},{},{},{}]});
        runningInfoBoolen.value = true;
        break;
      case 'RUNNING_INFO':
        await store.dispatch('commonModule/setCommonInfo', {chatRunningData: parseDataWarp});
        runningInfoBoolen.value = true;
        await store.dispatch('commonModule/setCommonInfo', {startInfoBoolen: false});
        await runningInfoStore(parseDataWarp);
        await rbcInfoStore(parseDataWarp);
        await runningInfoCheckStore(parseDataWarp);
        break;
      case 'STOP':
        console.log('stop!=--------------------------')
        await store.dispatch('commonModule/setCommonInfo', {isRunningState: false});
        await store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
        await store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: [{},{},{},{},{},{},{},{},{},{},{},{}]});
        await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: false});
        runningInfoBoolen.value = false;
        break;
      case 'RUNNING_COMP':// 완료가 된 상태이므로 각 페이지에 완료가 되었다는 정보를 저장한다.
        await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: true});
        await store.dispatch('commonModule/setCommonInfo', {embeddedNumber: String(data?.iCasStat)});
        await store.dispatch('commonModule/setCommonInfo', {startEmbedded: false}); // 임베디드 상태가 죽음을 알려준다.
        await store.dispatch('commonModule/setCommonInfo', {isRunningState: false}); // 시스템이 돌아가는 상태를 알려준다.
        await store.dispatch('commonModule/setCommonInfo', {isAlarm: true}); // 알람을 킨다.
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: [{},{},{},{},{},{},{},{},{},{},{},{}]});
        await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'stop'});// 슬라이드가 끝났으므로 stop을 넣어서 끝낸다.
        await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: false});
        runningInfoBoolen.value = false;
        break;
      case 'PAUSE':
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {isPause: true}); // 일시정지 상태로 변경한다.
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: [{},{},{},{},{},{},{},{},{},{},{},{}]});
        await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: false});
        runningInfoBoolen.value = false;
        break;
      case 'RESTART':
        await runningInfoStore(parseDataWarp);
        await rbcInfoStore(parseDataWarp);
        await runningInfoCheckStore(parseDataWarp);
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {isPause: false}); // start 가 되면 false로 변경
        await store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
        await store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
        runningInfoBoolen.value = true;
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: [{},{},{},{},{},{},{},{},{},{},{},{}]});
        break;
      case 'RECOVERY':
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {userStop: false});
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        await store.dispatch('commonModule/setCommonInfo', {slotIndex: 0});
        await store.dispatch('commonModule/setCommonInfo', {runningArr: [{},{},{},{},{},{},{},{},{},{},{},{}]});
        break;
      case 'ERROR_CLEAR':
        console.log('err')
        await showSuccessAlert(messages.IDS_MSG_FAILED);
        break;
    }

    async function runningInfoCheckStore (data: any | undefined) {
      const regex = /[1,2,9]/g;
      if (String(data?.iCasStat) !== '999999999999') { // 스캔중일때는 pass + 완료상태일때도
        const dataICasStat = String(data?.iCasStat);
        const currentSlot = data?.slotInfo;
        const str: any = data?.iCasStat;
        const iCasStatArr: any = [...str];
        const lastCompleteIndex = iCasStatArr.lastIndexOf("3") === -1 ? 0 : iCasStatArr.lastIndexOf("3") + 1;
        // const existingIndex = runningArr.value.findIndex((item: any) => item?.slotInfo?.slotNo === data?.slotInfo?.slotNo);

        if (iCasStatArr.lastIndexOf("2") === 0) {
          await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: true});
        }
        // 데이터 넣는 부분
        if(iCasStatArr.lastIndexOf("2") !== -1){
          runningArr.value[iCasStatArr.lastIndexOf("2")] = data;
        }

        // iCasStat (0 - 없음, 1 - 있음, 2 - 진행중, 3 - 완료, 4 - 에러, 9 - 스캔)
        if ((dataICasStat.search(regex) < 0) || data?.oCasStat === '111111111111' && !commonDataGet.value.runningInfoStop) {
          tcpReq().embedStatus.runIngComp.reqUserId = userModuleDataGet.value.userId;
          await store.dispatch('commonModule/setCommonInfo', {reqArr: tcpReq().embedStatus.runIngComp});
          await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: true});
          await saveTestHistory(data,data?.slotInfo?.slotNo);
          return;
        }
        if (data?.iCasStat.indexOf("2") !== -1) {
          await store.dispatch('commonModule/setCommonInfo', {slideProceeding: data?.iCasStat.indexOf("2")});// 실행중이라는 여부를 보낸다
        }
        //슬라이드 변경시 데이터 저장
        if (currentSlot?.isLowPowerScan === 'Y' && currentSlot?.testType === '03') {// running info 종료
          tcpReq().embedStatus.pause.reqUserId = userId.value;
          await store.dispatch('commonModule/setCommonInfo', {reqArr: tcpReq().embedStatus.pause});
          tcpReq().embedStatus.pause.reqUserId = userId.value;
          await store.dispatch('commonModule/setCommonInfo', {isRunningState: false});
        } else {
          if (lastCompleteIndex !== slotIndex.value) {
            console.log('save')
            await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'});
            await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: true});
            await saveTestHistory(runningArr.value[iCasStatArr.lastIndexOf("3")],runningArr.value[iCasStatArr.lastIndexOf("3")]?.slotInfo?.slotNo);
            await store.dispatch('commonModule/setCommonInfo', {runningSlotId: currentSlot?.slotId});
            await store.dispatch('commonModule/setCommonInfo', {slotIndex: lastCompleteIndex})
          }
        }

      }

    }

    async function saveTestHistory (params: any, idx: any, slotId?: any, lastCompleteIndex?: any) {
      const completeSlot = params.slotInfo;
      if (completeSlot) {
        completeSlot.userId = userId.value;
        completeSlot.cassetId = params.cassetId;
        // PB 비정상 클래스 체크
        completeSlot.isNormal = 'Y'

        if (completeSlot.analysisType === '01') {
          completeSlot.isNormal = checkPbNormalCell(completeSlot.wbcInfo, normalItems.value).isNormal;
        }

        const isNsNbIntegration = sessionStorage.getItem('isNsNbIntegration');
        const classElements = classArr.value.filter((element: any) => element?.slotId === completeSlot.slotId);
        const rbcArrElements = rbcArr.value.filter((element: any) => element?.slotId === completeSlot.slotId);
        const processInfoElements = processInfo.value.filter((element: any) => element?.slotId === completeSlot.slotId);
        const orderListElements = orderList.value.filter((element: any) => element?.slotId === completeSlot.slotId);
        // rbcArr
        const matchedWbcInfo = classElements[0];
        const newWbcInfo = {
          wbcInfo: matchedWbcInfo?.wbcInfo,
          nonRbcClassList: matchedWbcInfo?.nonRbcClassList,
          totalCount: matchedWbcInfo?.totalCount,
          maxWbcCount: matchedWbcInfo?.maxWbcCount,
        }

        const newObj = {
          slotNo: completeSlot.slotNo,
          state: false,
          submit: 'Ready',
          submitDate: '',
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
          createDate: tcpReq().embedStatus.settings.reqDttm,
          pltCount: completeSlot.pltCount,
          malariaCount: completeSlot.malariaCount,
          maxRbcCount: completeSlot.maxRbcCount,
          stateCd: completeSlot.stateCd,
          tactTime: completeSlot.tactTime,
          maxWbcCount: completeSlot.maxWbcCount,
          lowPowerPath: completeSlot.lowPowerPath,
          runningPath: completeSlot.runningPath,
          wbcInfo: newWbcInfo,
          wbcInfoAfter: [],
          rbcInfo: rbcArrElements[0].rbcInfo,
          bminfo: completeSlot.bminfo,
          userId: userId.value,
          cassetId: completeSlot.cassetId,
          isNormal: completeSlot.isNormal,
          processInfo: processInfoElements[0].processInfo,
          orderList: orderListElements[0].orderList,
          signedState: '',
          signedOfDate: '',
          signedUserId: '',
          classificationResult: [],
          isNsNbIntegration: isNsNbIntegration,
          memo: '',
          rbcMemo: '',
          siteCd: embeddedStatus.value.sysInfo.siteCd,
          deviceBarcode: embeddedStatus.value.sysInfo.deviceBarcode,
        }
        await saveRunningInfo(newObj, slotId, lastCompleteIndex);


      }
    }
    async function saveRunningInfo (runningInfo: any, slotId: any, last: any) {
      try {
        let result: ApiResponse<void>;
        result = await createRunningApi({userId: Number(userId.value), runingInfoDtoItems: runningInfo});

        if (result) {
          if(slotId){
            console.log('save successful');
          }
          instance?.appContext.config.globalProperties.$socket.emit('state', {
            type: 'SEND_DATA',
            payload: 'refreshDb'
          });
          // alert('성공~')
        }
      } catch (e) {
        console.error(e);
      }
    }
  } catch (error) {
    console.error(error);
  }
});

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

const emitSocketData = async (payload: object) => {
  // console.log('sss')
  await store.dispatch('commonModule/setCommonInfo', {reqArr: payload});
};



const sendSettingInfo = () => {
  const isNsNbIntegration = sessionStorage.getItem('isNsNbIntegration');

  const req = {
    jobCmd: 'SETTINGS',
    reqUserId: '',
    reqDttm: tcpReq().embedStatus.settings.reqDttm,
    pbiaRootDir: pbiaRootDir.value || '',
    oilCount: '1000',
    isOilReset: 'N',
    deviceType: '01',
    // uiVersion: 'uimd-pb-comm_v2.0.102',
    isNsNbIntegration: isNsNbIntegration || 'N',
  };
  store.dispatch('commonModule/setCommonInfo', {reqArr: req});
}

const getNormalRange = async () => {
  try {
    const result = await getNormalRangeApi(String(userId.value));
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
// 메시지를 보내는 함수
const sendMessage = async (payload: any) => {
  const executeAfterDelay = async () => {
    instance?.appContext.config.globalProperties.$socket.emit('message', {
      type: 'SEND_DATA',
      payload: payload
    });
  };

  await executeAfterDelay();
};


const cellImgGet = async (newUserId: string) => {
  try {
    const result = await getCellImgApi(String(newUserId));
    if (result) {
      if (result?.data) {
        const data = result.data;
        sessionStorage.setItem('pbiaRootPath', data?.pbiaRootPath);
        await store.dispatch('commonModule/setCommonInfo', {pbiaRootPath: String(data?.pbiaRootPath)});
        await store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
          isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N'
        });
        // 공통으로 사용되는 부분 세션스토리지 저장 새로고침시에도 가지고 있어야하는부분
        sessionStorage.setItem('isNsNbIntegration', isNsNbIntegration.value);
        sessionStorage.setItem('wbcPositionMargin', data?.wbcPositionMargin);
        sessionStorage.setItem('rbcPositionMargin', data?.rbcPositionMargin);
        sessionStorage.setItem('pltPositionMargin', data?.pltPositionMargin);
        sessionStorage.setItem('keepPage',String(data?.keepPage));
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
