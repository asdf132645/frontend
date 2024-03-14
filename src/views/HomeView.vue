<template>
  <Fragment>
    <Analysis/>
  </Fragment>
</template>

<script setup lang="ts">
import Analysis from "@/views/analysis/index.vue";

// homeView 에 역할은 모든 페이지에서 던지는 웹소켓 응답 값을 처리 하는 곳입니다.
// startSys는 장비를 실행 시키는 tcp 응답 메세시입니다. runInfoGetTcpData 장비실행 여부에 대한 메서드입니다.

import {getCurrentInstance, ref, computed, watch, onMounted, onUpdated, onUnmounted} from 'vue';
import {useStore} from "vuex";
import {sysInfoStore, runningInfoStore, wbcInfoStore, rbcInfoStore} from '@/common/lib/storeSetData/common';
import AppHeader from "@/components/layout/AppHeader.vue";
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


const store = useStore();
const commonDataGet = computed(() => store.state.commonModule);
const dataBaseSetDataModule = computed(() => store.state.dataBaseSetDataModule);
const isStartEmbeddedCalled = ref(false);
let isRequestInProgress = false;
const instance = getCurrentInstance();
const runningSlotId = ref('');
const userId = ref('');
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const normalItems = ref<any>([]);
const userModuleDataGet = computed(() => store.state.userModule);


// 실제 배포시 사용해야함
// document.addEventListener('click', function (event: any) {
//   const storedUser = sessionStorage.getItem('user');
//   if((storedUser) && route.fullPath !== '/user/login'){
//     document.documentElement.requestFullscreen();
//   }
// });


watch(userModuleDataGet.value, (newUserId, oldUserId) => {
  if (newUserId.id === '') {
    return;
  }
  cellImgGet(newUserId.id);
  userId.value = newUserId.id;
});

onMounted(async () => {
  if (userId.value === '') { // 사용자가 강제 초기화 시킬 시 유저 정보를 다시 세션스토리지에 담아준다.
    await store.dispatch('userModule/setUserAction', getStoredUser);
    userId.value = userModuleDataGet.value.id
  }
  if (!commonDataGet.value.isRunningState) {
    if (userId.value && userId.value !== '') {
      if (isStartEmbeddedCalled.value) {
        await runInfoPostWebSocket();
      }
      await startSysPostWebSocket();
      await getNormalRange();
    }
  }


});

watch([commonDataGet.value], async (newVals: any) => {
  const newValsObj = JSON.parse(JSON.stringify(newVals))
  isStartEmbeddedCalled.value = newValsObj[0].startEmbedded;
})


// 모든 tcp 통신으로 받은 응답값을 스토어에 저장하는 부분
// 무조건 응답을 받는곳은 app.vue에서 정의
// store에 저장하는 부분은 C:\workspace\frontend\src\common\lib\storeSetData\common.ts 여기에 무조건 정의하세요
// 변수명에 WebSocket 을 뒤에 붙이는 이유는 웹 백엔드로 소켓으로 전달을 나타내기 위함

instance?.appContext.config.globalProperties.$socket.on('chat', async (data) => {

  const parsedData = JSON.parse(data);
  if (parsedData.bufferData === 'err') {
    // alert('활성화된 TCP 클라이언트 연결 없음');
    return
  }
  const parseDataWarp = JSON.parse(parsedData.bufferData); // 2번 json 으로 감싸는 이유는 잘못된 문자열이 들어와서 한번더 맵핑시키는 것임
  // 시스템정보 스토어에 담기
  switch (parseDataWarp.jobCmd) {
    case 'SYSINFO':
      await sysInfoStore(parseDataWarp);
      break;
    case 'INIT':
      await startSysPostWebSocket();
      break;
    case 'START':
      runInfoPostWebSocket();
      await store.dispatch('commonModule/setCommonInfo', {isRunningState: true});// 실행중이라는 여부를 보낸다
      await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'}); // 첫 슬라이드가 시작되었음을 알려준다.
      await store.dispatch('commonModule/setCommonInfo', {startEmbedded: 'start',}); // 임베디드 상태가 죽음을 알려준다.
      break;
    case 'RUNNING_INFO':
      await runningInfoStore(parseDataWarp);
      await wbcInfoStore(parseDataWarp);
      await rbcInfoStore(parseDataWarp);
      await runningInfoCheckStore(parseDataWarp);
      break;
    case 'STOP':
      await store.dispatch('commonModule/setCommonInfo', {isRunningState: false});
      isStartEmbeddedCalled.value = false;
      break;
    case 'RUNNING_COMP':// 완료가 된 상태이므로 각 페이지에 완료가 되었다는 정보를 저장한다.
      await store.dispatch('commonModule/setCommonInfo', {embeddedNumber: String(data?.iCasStat)});
      await store.dispatch('commonModule/setCommonInfo', {startEmbedded: false,}); // 임베디드 상태가 죽음을 알려준다.
      await store.dispatch('commonModule/setCommonInfo', {isRunningState: false}); // 시스템이 돌아가는 상태를 알려준다.
      await store.dispatch('commonModule/setCommonInfo', {isAlarm: true}); // 알람을 킨다.
      await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'stop'});// 슬라이드가 끝났으므로 stop을 넣어서 끝낸다.
      break;
    case 'PAUSE':
      await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {isPause: true}); // 일시정지 상태로 변경한다.
      break;
    case 'RESTART':
      await runningInfoStore(parseDataWarp);
      await wbcInfoStore(parseDataWarp);
      await rbcInfoStore(parseDataWarp);
      await runningInfoCheckStore(parseDataWarp);
      await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {isPause: false}); // start 가 되면 false로 변경
      break;
    case 'RECOVERY':
      await store.dispatch('embeddedStatusModule/setEmbeddedStatusInfo', {userStop: false});
      break;
    case 'ERROR_CLEAR':
      alert(messages.IDS_MSG_FAILED);
      break;
  }

});
const startSysPostWebSocket = async () => {
  isRequestInProgress = true;
  if (userId.value === '') {

  }
  tcpReq.embedStatus.sysInfo.reqUserId = userId.value;
  await sendMessage(tcpReq.embedStatus.sysInfo);
};

const runInfoPostWebSocket = async () => {
  if (!isRequestInProgress) {
    isRequestInProgress = true;
    tcpReq.embedStatus.runningInfo.reqUserId = userId.value;
    await sendMessage(tcpReq.embedStatus.runningInfo);
  }
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
      tcpReq.embedStatus.pause.reqUserId = userId.value;
      isRequestInProgress = true;
      await sendMessage(tcpReq.embedStatus.pause);
    } else {
      if (currentSlot?.slotId !== runningSlotId.value) { // 슬라이드 체인지 시
        await store.dispatch('runningInfoModule/setChangeSlide', {key: 'changeSlide', value: 'start'});
        await store.dispatch('runningInfoModule/setSlideBoolean', {key: 'slideBoolean', value: true});
        // console.log(runningSlotId.value !== '')
        if (runningSlotId.value !== '') {
          await saveTestHistory(data);
        }
        runningSlotId.value = String(currentSlot?.slotId);
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
      tcpReq.embedStatus.runIngComp.reqUserId = userId.value;
      isRequestInProgress = true;
      await sendMessage(tcpReq.embedStatus.runIngComp);
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
    const newWbcInfo = {
      wbcInfo: [completeSlot?.wbcInfo],
      nonRbcClassList: dbData.slotInfo[0].wbcInfo.nonRbcClassList,
      totalCount: dbData.slotInfo[0].wbcInfo.totalCount,
      maxWbcCount: dbData.slotInfo[0].wbcInfo.maxWbcCount,
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
    }
    saveRunningInfo(newObj);

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
      // console.log(result);
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

const sendMessage = async (payload: object) => {
  instance?.appContext.config.globalProperties.$socket.emit('message', {
    type: 'SEND_DATA',
    payload: payload
  });
  isRequestInProgress = false;  // 요청 완료 후 플래그 업데이트
}


setInterval(async () => {
  if (userId.value && userId.value !== '') {
    if (isStartEmbeddedCalled.value) {
      await runInfoPostWebSocket();
    }
    await startSysPostWebSocket();
  }
}, 800);


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
</script>
