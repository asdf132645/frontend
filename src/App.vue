<!-- App.vue -->
<template>
  <div>
    <AppHeader/>
    <main class='content'>
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
// homeView 에 역할은 모든 페이지에서 던지는 웹소켓 응답 값을 처리 하는 곳입니다.
// startSys는 장비를 실행 시키는 tcp 응답 메세시입니다. runInfoGetTcpData 장비실행 여부에 대한 메서드입니다.

import {getCurrentInstance, ref, computed, watch, onMounted, nextTick, onBeforeUnmount} from 'vue';
import {useStore} from "vuex";
import {sysInfoStore, runningInfoStore, wbcInfoStore, rbcInfoStore} from '@/common/lib/storeSetData/common';
import {RunningInfo, SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {tcpReq} from '@/common/tcpRequest/tcpReq';
import {messages} from '@/common/defines/constFile/constant';
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

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const store = useStore();
const commonDataGet = computed(() => store.state.commonModule);
const dataBaseSetDataModule = computed(() => store.state.dataBaseSetDataModule);

const instance = getCurrentInstance();
const runningSlotId = computed(() => store.state.commonModule.runningSlotId);
const userId = ref('');
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const normalItems = ref<any>([]);
const userModuleDataGet = computed(() => store.state.userModule);
const reqArr = computed(() => store.state.commonModule);
const sendReqArr = ref([]);
const runningInfoBoolen = ref(false);
const resFlag = ref(true);
let countingInterval: any = null;
let countingInterStartval: any = null;
let countingInterRunval: any = null;


// 실제 배포시 사용해야함
// document.addEventListener('click', function (event: any) {
//   const storedUser = sessionStorage.getItem('user');
//   if((storedUser) && route.fullPath !== '/user/login'){
//     document.documentElement.requestFullscreen();
//   }
// });


watch(reqArr.value, async (newVal, oldVal) => {
  // 새 값이 특정 조건을 충족하는지 확인
  if (newVal.reqArr) {

    const uniqueReqArr = removeDuplicateJobCmd(newVal.reqArr); // 중복된 jobCmd를 제거하여 유니크한 배열 생성
    // 유니크한 reqArr 배열에 항목이 있는지 확인
    if (uniqueReqArr.length > 0) {
      // console.log(uniqueReqArr)
      if(uniqueReqArr.length > 1){
        const notSysRunInfo = uniqueReqArr.filter((item: any) => (item.jobCmd !== 'SYSINFO' && item.jobCmd !== 'RUNNING_INFO'));
        console.log(notSysRunInfo[0])
        await sendMessage(notSysRunInfo[0]);
      }else{
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

onMounted(async () => {
  await nextTick();
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
        if(!commonDataGet.value.runningInfoStop){
          await runInfoPostWebSocket();
        }
      }, 500);
      await store.dispatch('commonModule/setCommonInfo', {firstLoading: true});
    }
  }
  EventBus.subscribe('messageSent', emitSocketData);
});
// onBeforeUnmount(() => {
//   if (countingInterval) {
//     clearInterval(countingInterval);
//     countingInterval = null;
//   }
//   if (countingInterRunval) {
//     clearInterval(countingInterRunval);
//     countingInterRunval = null;
//   }
// });
instance?.appContext.config.globalProperties.$socket.on('chat', async (data) => {
  try {
    const parsedData = JSON.parse(data);
    if (parsedData.bufferData === 'err') {
      // alert('활성화된 TCP 클라이언트 연결 없음');
      instance?.appContext.config.globalProperties.$socket.emit('message', {
        type: 'SEND_DATA',
        payload: tcpReq().embedStatus.sysInfo
      });
      return
    }
    const parseDataWarp = JSON.parse(parsedData.bufferData); // 2번 json 으로 감싸는 이유는 잘못된 문자열이 들어와서 한번더 맵핑시키는 것임
    // await store.dispatch('commonModule/setCommonInfo', {resFlag: true});
    // 시스템정보 스토어에 담기
    switch (parseDataWarp.jobCmd) {
      case 'SYSINFO':
        await sysInfoStore(parseDataWarp);
        await store.dispatch('commonModule/setCommonInfo', {startInfoBoolen: true});
        break;
      case 'INIT':
        break;
      case 'START':
        await store.dispatch('commonModule/setCommonInfo', {startInfoBoolen: false});
        await store.dispatch('commonModule/setCommonInfo', {isRunningState: true});// 실행중이라는 여부를 보낸다
        await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'}); // 첫 슬라이드가 시작되었음을 알려준다.
        await store.dispatch('commonModule/setCommonInfo', {startEmbedded: 'start',});
        await store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
        await store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
        await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: false});
        await store.dispatch('commonModule/setCommonInfo',{slotIndex: 0})
        runningInfoBoolen.value = true;
        break;
      case 'RUNNING_INFO':
        if (!commonDataGet.value.runningInfoStop) {
          await store.dispatch('commonModule/setCommonInfo', {startInfoBoolen: false});
          // await runInfoPostWebSocket();
          await runningInfoCheckStore(parseDataWarp);
          await runningInfoStore(parseDataWarp);
          await wbcInfoStore(parseDataWarp);
          await rbcInfoStore(parseDataWarp);
        }
        break;
      case 'STOP':
        console.log('stop!=--------------------------')
        await store.dispatch('commonModule/setCommonInfo', {isRunningState: false});
        await store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
        await store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        runningInfoBoolen.value = false;
        break;
      case 'RUNNING_COMP':// 완료가 된 상태이므로 각 페이지에 완료가 되었다는 정보를 저장한다.
        await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: true});
        await store.dispatch('commonModule/setCommonInfo', {embeddedNumber: String(data?.iCasStat)});
        await store.dispatch('commonModule/setCommonInfo', {startEmbedded: false}); // 임베디드 상태가 죽음을 알려준다.
        await store.dispatch('commonModule/setCommonInfo', {isRunningState: false}); // 시스템이 돌아가는 상태를 알려준다.
        await store.dispatch('commonModule/setCommonInfo', {isAlarm: true}); // 알람을 킨다.
        await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'stop'});// 슬라이드가 끝났으므로 stop을 넣어서 끝낸다.
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        runningInfoBoolen.value = false;
        break;
      case 'PAUSE':
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {isPause: true}); // 일시정지 상태로 변경한다.
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        runningInfoBoolen.value = false;
        break;
      case 'RESTART':
        await runningInfoStore(parseDataWarp);
        await wbcInfoStore(parseDataWarp);
        await rbcInfoStore(parseDataWarp);
        await runningInfoCheckStore(parseDataWarp);
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {isPause: false}); // start 가 되면 false로 변경
        await store.dispatch('timeModule/setTimeInfo', {totalSlideTime: '00:00:00'});
        await store.dispatch('timeModule/setTimeInfo', {slideTime: '00:00:00'});
        runningInfoBoolen.value = true;
        // await runInfoPostWebSocket();
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        break;
      case 'RECOVERY':
        await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {userStop: false});
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: ''});
        break;
      case 'ERROR_CLEAR':
        console.log('err')
        await showSuccessAlert(messages.IDS_MSG_FAILED);
        break;
    }


  } catch (error) {
    console.error(error);
    // Handle error here
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

const runningInfoCheckStore = async (data: RunningInfo | undefined) => {
  if (String(data?.iCasStat) !== '999999999999') { // 스캔중일때는 pass + 완료상태일때도
    const currentSlot = data?.slotInfo.find(
        (item: SlotInfo) => item.stateCd === "03"
    );
    if (data?.iCasStat.indexOf("2") !== -1) {
      await store.dispatch('commonModule/setCommonInfo', {slideProceeding: data?.iCasStat.indexOf("2")});// 실행중이라는 여부를 보낸다

    }
    //슬라이드 변경시 데이터 저장
    await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: false})
    if (currentSlot?.isLowPowerScan === 'Y' && currentSlot?.testType === '03') {// running info 종료
      tcpReq().embedStatus.pause.reqUserId = userId.value;
      await store.dispatch('commonModule/setCommonInfo', {reqArr: tcpReq().embedStatus.pause});
      tcpReq().embedStatus.pause.reqUserId = userId.value;
      await store.dispatch('commonModule/setCommonInfo', {isRunningState: false});
    } else {
      if (currentSlot?.slotId !== runningSlotId.value && currentSlot?.slotId) { // 슬라이드 체인지 시
        await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'});
        await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: true});
        if (runningSlotId.value !== '') {
          if (!runningInfoBoolen.value) {
            return
          }
          await saveTestHistory(data);
        }
        await store.dispatch('commonModule/setCommonInfo', {runningSlotId: currentSlot?.slotId});
      }
    }
    const regex = /[1,2,9]/g;
    const dataICasStat = String(data?.iCasStat);
    // 주문 내역 및 처리 결과 저장 -start
    // iCasStat (0 - 없음, 1 - 있음, 2 - 진행중, 3 - 완료, 4 - 에러, 9 - 스캔)
    if ((dataICasStat.search(regex) < 0) || data?.oCasStat === '111111111111') {
      if (userId.value === '') {
        return;
      }
      tcpReq().embedStatus.runIngComp.reqUserId = userModuleDataGet.value.userId;
      await store.dispatch('commonModule/setCommonInfo', {reqArr: tcpReq().embedStatus.runIngComp});
      await store.dispatch('commonModule/setCommonInfo', {runningInfoStop: true});
      // console.log('save start')
      if (!runningInfoBoolen.value) {
        return
      }
      await saveTestHistory(data);
    }
  }

}

const saveTestHistory = async (params: any) => {
  //
  const completeSlot = params.slotInfo.find(function (item: any) {
    return item.slotId === runningSlotId.value && item.stateCd === '04'
  });
  if (completeSlot) {
    completeSlot.userId = userId.value;
    completeSlot.cassetId = params.cassetId;
    // completeSlot.isNsNbIntegration = isNsNbIntegration

    // PB 비정상 클래스 체크
    completeSlot.isNormal = 'Y'

    if (completeSlot.analysisType === '01') {
      completeSlot.isNormal = checkPbNormalCell(completeSlot.wbcInfo, normalItems.value).isNormal;
    }

    const isNsNbIntegration = sessionStorage.getItem('isNsNbIntegration');
    const dbData = dataBaseSetDataModule.value.dataBaseSetData;
    const processBarcodeId = dbData?.slotInfo[0];
    const matchedWbcInfo = processBarcodeId.wbcInfo.wbcInfo;
    console.log(processBarcodeId)

    const newWbcInfo = {
      wbcInfo: [matchedWbcInfo.wbcInfo],
      nonRbcClassList: processBarcodeId.wbcInfo.nonRbcClassList,
      totalCount: processBarcodeId.wbcInfo.totalCount,
      maxWbcCount: processBarcodeId.wbcInfo.maxWbcCount,
    }

    const newObj = {
      slotNo: completeSlot.slotNo,
      state: false,
      submit: 'Ready',
      submitDate: '',
      traySlot: '1-' + completeSlot.slotNo,
      barcodeNo: completeSlot.barcodeNo,
      patientId: completeSlot.patientId,
      patientNm: completeSlot.patientNm,
      gender: completeSlot.gender,
      birthDay: completeSlot.birthDay,
      wbcCount: completeSlot.wbcCount,
      slotId: completeSlot.slotId,
      orderDttm: parseDateString(completeSlot.orderDttm),
      testType: completeSlot.testType,
      analyzedDttm: parseDateString(completeSlot.analyzedDttm),
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
      rbcInfo: dbData.slotInfo[0].rbcInfo,
      bminfo: completeSlot.bminfo,
      userId: userId.value,
      cassetId: completeSlot.cassetId,
      isNormal: completeSlot.isNormal,
      processInfo: dbData.slotInfo[0].processInfo,
      orderList: dbData.slotInfo[0].orderList.filter((order: any) => order.barcodeId === completeSlot.barcodeNo),
      signedState: '',
      signedOfDate: '',
      signedUserId: '',
      classificationResult: [],
      isNsNbIntegration: isNsNbIntegration,
      memo: '',
      rbcMemo: '',
    }
    await saveRunningInfo(newObj);
    await store.dispatch('commonModule/setCommonInfo',{slotIndex: commonDataGet.value.slotIndex + 1})

  }
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

const saveRunningInfo = async (runningInfo: RuningInfo) => {
  try {
    let result: ApiResponse<void>;
    result = await createRunningApi({userId: Number(userId.value), runingInfoDtoItems: runningInfo});

    if (result) {
      console.log('save successful');
      // alert('성공~')
    }
  } catch (e) {
    console.error(e);
  }
};

// 메시지를 보내는 함수
// 메시지를 보내는 함수
const sendMessage = async (payload: any) => {
  const executeAfterDelay = async () => {
    instance?.appContext.config.globalProperties.$socket.emit('message', {
      type: 'SEND_DATA',
      payload: payload
    });
    // await store.dispatch('commonModule/setCommonInfo', {resFlag: false});
  };
  // if (!reqArr.value.resFlag) {
  //   return;
  // }

  await executeAfterDelay();
};


const cellImgGet = async (newUserId: string) => {
  try {
    const result = await getCellImgApi(String(newUserId));
    if (result) {
      if (result?.data) {
        const data = result.data;
        sessionStorage.setItem('pbiaRootPath', data?.pbiaRootPath);
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
