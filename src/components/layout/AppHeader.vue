<template>
  <header class='header'>
    <nav>
      <div class='appHeaderLeft' :class="{ 'bmComponent': projectBm }" v-if="!appHeaderLeftHidden">
        <div class="borderLine">
          <img src="../../assets/images/celli.png" class="headerLogo"/>
          <p class="logoProjectTitle">{{ projectBm ? 'BM' : 'PB' }}</p>
        </div>

        <router-link :to="noRouterPush ? '#' : '/setting'"
                     :class='{ "leftActive": isActive("/setting"), "disabledLink": noRouterPush }'>
          <font-awesome-icon :icon="['fas', 'gear']" style="font-size: 1rem;"/>
          <span class='icoText'>Setting</span>
        </router-link>
        <router-link to="/" v-if="viewerCheck === 'main'" :class='{ "leftActive": isActive("/analysis") || route.path === "/" }'>
          <font-awesome-icon :icon="['fas', 'chart-pie']"
                             style="font-size: 1rem;"
          />
          <span class='icoText'>Analysis</span>
        </router-link>
        <router-link to="/dataBase"
                     :class='{ "leftActive": isActive("/dataBase") || isActive("/databaseDetail") || isActive("/databaseRbc") || isActive("/report") || isActive("/databaseWhole") }'>
          <font-awesome-icon :icon="['fas', 'server']"
                             style="font-size: 1rem;"
          />
          <span class='icoText'>Database</span>
        </router-link>

        <!-- 가운데 메뉴 -->
        <div v-if="machineVersion === '100a'" class="autoStart-container">
          <ProgressBar
              text="Auto Start"
              :value="autoStartTimer"
              gradientStart="#2196f3"
              gradientEnd="#03a9f4"
              :animationDuration="0.3"
              :showGlowEffect="true"
          />

        </div>

        <!--  좌측메뉴  -->
        <div class="small-icon-menu">
          <div class="lastMenu">
            <ul>
              <li>{{ formattedDate }} {{ formattedTime }}</li>
              <li class="lastLiM">
                <div class="cursorPointer userBox" @click="userSetOutToggle">
                  <font-awesome-icon :icon="['fas', 'circle-user']"/>
                  <p>{{ userModuleDataGet.userId }}</p>
                </div>
                <ul v-show="userSetOutUl" class="userSetOutUl" @click.stop>
                  <li @click="logout">LOGOUT</li>
                </ul>
                <div class="logOutBox" @click='fullScreen'>
<!--                  <font-awesome-icon :icon="['fas', 'window-restore']" />-->
                  FULL SCREEN
                </div>
                <div class="logOutBox" @click="exit">
                  EXIT
                </div>
              </li>
            </ul>
          </div>
          <div class="iconHeaderMenu">
            <ul>
              <li class="alarm" @click="errLogOn" @mouseover="openErrLogOver" @mouseout="closeErrLogLeave" >
                <font-awesome-icon class="cursorPointer" :icon="['fas', 'bell']" :class="{ 'blinking-red': isErrorAlarm, 'blinking-blue': isCompleteAlarm }"/>
                <ErrLog @click.stop  @closeErrLog='closeErrLog' v-if="ErrLogOpen" :ErrLogOpen="ErrLogOpen" :errArr="errArr" @errMouseSet="errMouseSet" />
              </li>
              <li class="pos-relative">
                <font-awesome-icon
                    v-if="isDoorOpen !== 'Y'"
                    :icon="['fas', 'door-closed']"
                    @mouseover="tooltipVisibleFunc('drawerStatus', true)"
                    @mouseout="tooltipVisibleFunc('drawerStatus', false)"
                />
                <font-awesome-icon
                    v-else
                    :icon="['fas', 'door-open']"
                    style="color: red;"
                    @mouseover="tooltipVisibleFunc('drawerStatus', true)"
                    @mouseout="tooltipVisibleFunc('drawerStatus', false)"
                />
                <Tooltip :isVisible="tooltipVisible.drawerStatus" position="bottom" type="" :message="MSG.TOOLTIP.DRAWER_STATUS" />
              </li>
              <li>
                <font-awesome-icon
                    :icon="eqStatCdData.icon"
                    :class="eqStatCdData.class"
                    @mouseover="tooltipVisibleFunc('runningStatus', true)"
                    @mouseout="tooltipVisibleFunc('runningStatus', false)"
                />
                <Tooltip :isVisible="tooltipVisible.runningStatus" position="bottom" type="" :message="MSG.TOOLTIP.RUNNING_STATUS" />
              </li>
              <li class="oliCount pos-relative" @click="openLayer">
                <font-awesome-icon
                    :icon="['fas', 'droplet']"
                    @mouseover="tooltipVisibleFunc('oilPrime', true)"
                    @mouseout="tooltipVisibleFunc('oilPrime', false)"
                />
                <Tooltip :isVisible="tooltipVisible.oilPrime" position="bottom" type="" :message="`OilCount: ${oilCountData || 0}`" />
              </li>
              <li class="storage pos-relative">
                <font-awesome-icon
                    :icon="['fas', 'database']"
                    @mouseover="tooltipVisibleFunc('storage', true)"
                    @mouseout="tooltipVisibleFunc('storage', false)"
                />
                <Tooltip :isVisible="tooltipVisible.storage" position="bottom" type="" :message="`Storage: ${storagePercentData || 0}`" />
              </li>

            </ul>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <Modal v-if="oilVisible" @update:closeLayer="closeLayer" @afterOpen="onModalOpen">
    <!-- 헤더 슬롯에 들어갈 내용 -->
    <template #header>
      <h2>Immersion Oil</h2>
    </template>

    <!-- 컨텐츠 슬롯에 들어갈 내용 -->
    <template #content>
      <div class="immersionOilContainer">
        <h5 class="modalTitle mb10">Immersion Oil count Reset</h5>
        <span class="grayText">Reset Immersion Oil count after changing Oil pack</span>
        <div class="flex-justify-between flex-align-center mt10">
          <span>Estimated number of slides left</span>
          <span class="f18">{{ oilCount }}</span>
        </div>

        <div class="flex-column-align-end">
          <div ref="statusBarWrapper" class="statusBarWrapper">
            <div ref="statusBar" class="statusBar"></div>
          </div>
          <div>
            <button @click='onReset' class="alertButton">Reset</button>
          </div>
        </div>
      </div>

      <div class='mt20'>
        <h5 class="modalTitle mb10">Prime Immersion Oil</h5>
        <span class="grayText mt10">Prime oil to remove air from the oil hose</span>
        <div class="flex-column-align-end">
          <div class="statusBarWrapper">
          </div>
          <button type="button" @click='onPrime' :class="{'alertButton': true, 'blinkGripper': isBlinkingPrime}">Prime
          </button>
        </div>
      </div>

    </template>
  </Modal>
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

  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
  />
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router';
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from "vue";
import {useStore} from "vuex";
import router from "@/router";
import Modal from '@/components/commonUi/modal.vue';
import {MESSAGES, MSG, TOAST} from "@/common/defines/constants/constantMessageText";
import {getCellImgAllApi, getCellImgApi} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {tcpReq} from "@/common/defines/constants/tcpRequest/tcpReq";
import Confirm from "@/components/commonUi/Confirm.vue";
import EventBus from "@/eventBus/eventBus";
import Button from "@/components/commonUi/Button.vue";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import {logoutApi} from "@/common/api/service/user/userApi";
import {getDeviceIpApi} from "@/common/api/service/device/deviceApi";
import axios from "axios";
import { SOUND_COMPLETE_ALARM, SOUND_ERROR_ALARM } from "@/common/lib/utils/assetUtils";
import ProgressBar from "@/components/commonUi/ProgressBar.vue";
import {errLogsReadApi, readAllErrorLogsApi} from "@/common/api/service/fileSys/fileSysApi";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import ErrLog from "@/components/commonUi/ErrLog.vue";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import moment from "moment/moment";
import {visibleBySite} from "@/common/lib/utils/visibleBySite";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";

const route = useRoute();
const appHeaderLeftHidden = ref(false);
const store = useStore();
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const isBlinkingPrime = ref(false);
let blinkTimeout: ReturnType<typeof setTimeout> | null = null;

const instance = getCurrentInstance();
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const oilCount = ref(0);
const isDoorOpen = ref('');
const storagePercent = ref(0);
const eqStatCd = ref('');
const commonDataGet = computed(() => store.state.commonModule);
const ErrLogOpen = ref(false);

const eqStatCdData = ref({
  icon: ['fas', 'person'],
  class: ''
});
const oilCountData = ref('');
const storagePercentData = ref('');
const oilVisible = ref(false);
const maxOilCount = ref(1000);
const statusBarWrapper = ref<HTMLDivElement | null>(null);
const statusBar = ref<HTMLDivElement | null>(null);
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const isNsNbIntegration = ref(sessionStorage.getItem('isNsNbIntegration') || '');
const analysisType = computed(() => store.state.commonModule.analysisType);
const isCompleteAlarm = computed(() => store.state.commonModule.isCompleteAlarm);
const isErrorAlarm = computed(() => store.state.commonModule.isErrorAlarm);
const rootDir = computed(() => store.state.commonModule.iaRootPath);
const siteCd = computed(() => store.state.commonModule.siteCd);

const isErrorAlarmRunning = ref(false);
const isCompleteAlarmRunning = ref(false);
const alarmCount = ref(0);
const noRouterPush = ref(false);
const currentDate = ref<string>("");
const currentTime = ref<string>("");
let isCompleteAlarmInterval = null;
let isErrorAlarmInterval = null;
const isPlayingCompleteAlarm = ref(false);
const isPlayingErrorAlarm = ref(false);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const projectBm = ref(false);
const machineVersion = ref('');
const clickType = ref('');
const userSetOutUl = ref(false);
const isStartCountUpdated = ref(false);
const autoStartTimer = ref(0);
const errArr = ref<any>([]);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);
const mouseClick = ref(false);
const mounseLeave = ref(false);
const tooltipVisible = reactive({
  drawerStatus: false,
  runningStatus: false,
  oilPrime: false,
  storage: false,
})

const formattedDate = computed(() => currentDate.value);
const formattedTime = computed(() => currentTime.value);
const isLoadingErrorLog = ref(false);

onBeforeMount(() => {
  projectBm.value = window.PROJECT_TYPE === 'bm' ? true : false;
  machineVersion.value = window.MACHINE_VERSION;
})

onMounted(async () => {
  await cellImgGet();
  await cellImgGetAll();
  updateDateTime(); // 초기 시간 설정
  const timerId = setInterval(updateDateTime, 1000); // 1초마다 현재 시간을 갱신

  // 컴포넌트가 해제되기 전에 타이머를 정리하여 메모리 누수를 방지
  onBeforeUnmount(() => {
    clearInterval(timerId);
  });
  if (userId.value === '') { // 사용자가 강제 초기화 시킬 시 유저 정보를 다시 세션스토리지에 담아준다.
    await store.dispatch('userModule/setUserAction', getStoredUser);
  }

  document.addEventListener('click', closeUserSetBox);
  window.addEventListener('wheel', preventScroll, {passive: false});
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeUserSetBox);
  window.removeEventListener('wheel', preventScroll);
})

watch(userModuleDataGet.value, async (newUserId, oldUserId) => {
  await cellImgGet();
  await cellImgGetAll();
  userId.value = newUserId.id;
});

watch([embeddedStatusJobCmd.value], async (newVals: any) => {
  await nextTick();
  oilCount.value = Number(newVals[0].sysInfo.oilCount);
  isDoorOpen.value = newVals[0].sysInfo.isDoorOpen;
  storagePercent.value = Number(newVals[0].sysInfo.storageSize);
  eqStatCd.value = newVals[0].sysInfo.eqStatCd;

  const autoStartTimerNumber = newVals[0].sysInfo?.autoStartTimer;
  if (machineVersion.value === '100a' && autoStartTimerNumber !== undefined) {
    autoStartTimer.value = (parseFloat(autoStartTimerNumber) / 5) * 100;
  }


  eqStatCdData.value = eqStatCdChangeVal(newVals[0].sysInfo.eqStatCd);
  oilCountData.value = oilCountChangeVal();
  storagePercentData.value = storagePercentChangeVal();

  // 2번 보내는지 확인
  if (!isStartCountUpdated.value) {
    await searchCardCount();
  }

});

const userSetOutToggle = () => {
  userSetOutUl.value = !userSetOutUl.value;
}

const updateDateTime = () => {
  const now = new Date();
  currentDate.value = now.toLocaleDateString(undefined, {year: 'numeric', month: '2-digit', day: '2-digit'});
  currentTime.value = now.toLocaleTimeString('en-US');
};

const errLogOn = async () => {
  if (
      !visibleBySite(siteCd.value, [
      HOSPITAL_SITE_CD_BY_NAME['TEST'],
      HOSPITAL_SITE_CD_BY_NAME['원자력병원'],
        HOSPITAL_SITE_CD_BY_NAME['UIMD'],
      ], 'enable')) {
    return;
  }
  mouseClick.value = !mouseClick.value;
  if(mounseLeave.value){
    return
  }
  ErrLogOpen.value = !ErrLogOpen.value;
  await errLogLoad();

}

const errLogLoad = async () => {
  if (errArr.value.length !== 0) {
    return;
  }

  if (isLoadingErrorLog.value) {
    return;
  }

  isLoadingErrorLog.value = true;
  const folderPath = `folderPath=${rootDir.value.replace('PBIA_proc','')}UIMD_Data/Backend_Log`;
  let res = await errLogsReadApi(folderPath);

  if(res.code === 200){
    if(res?.data?.status === 400){
      toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
      showToast(res?.data?.response.error);
      return;
    }

    const totalLogLength = Object.values(res?.data || {}).reduce((sum, items) => sum + items.length, 0);
    if (Number(totalLogLength) < 10) {
      const nextResult = await errorLogLoadMore();
      if (nextResult) {
        res = nextResult;
      }
    }

    errArr.value = processLogData(res?.data);
  }
  isLoadingErrorLog.value = false;
}

const processLogData = (data: any) => {
  const newArr = [];
  const now = moment();
  const formattedDate = now.format('YYYY-MM-DD');

  if (isObjectEmpty(data)) {
    return;
  }

  for (const date in data) {
    const entries = data[date];

    if (!Array.isArray(entries)) {
      console.error(`Invalid entries for date: ${date}`);
      continue;
    }

    for (const el of entries) {
      if (formattedDate !== date && newArr.length > 10) break;
      if (el.E_TYPE !== 'DEV_INFO') {
        newArr.push({
          timestamp: `${date} ${el.timestamp}`, // Full timestamp
          code: el?.E_CODE,
          type: el?.E_TYPE,
          desc: el?.E_DESC,
          soln: el?.E_SOLN,
          name: el?.E_NAME,
        });
      }
    }
  }

  return newArr;
};

const errorLogLoadMore = async () => {
  if (errArr.value.length !== 0) {
    return
  }
  const folderPath = `folderPath=${rootDir.value.replace('PBIA_proc', '')}UIMD_Data/Backend_Log`;
  const res = await readAllErrorLogsApi(folderPath);

  if (res.code === 200) {
    if (res?.data?.status === 400) {
      toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
      showToast(res?.data?.response.error);
      return;
    }

    return res;
  }
}

const handleOkConfirm = async () => {
  showConfirm.value = false;

  await logoutApi({userId: userId.value});
  if (clickType.value === 'exit') {
    if (viewerCheck.value === 'main') {
      await EventBus.publish('childEmitSocketData', tcpReq().embedStatus.exit);
    } else {
      const result = await getDeviceIpApi();
      const ipAddress = `ip=${result.data}`
      const url = `http://${result.data}:3000/close?${ipAddress}`;
      await axios.get(url);
    }
  } else {
    await router.push('user/login');
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const fullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

const preventScroll = (event: any) => {
  if (event.ctrlKey) {
    event.preventDefault();
  }
};

const searchCardCount = async () => {
  const reqDttm = getDateTimeStr(); // 현재 날짜와 시간을 가져오는 함수
  const payload = {
    jobCmd: 'SEARCH_CARD_COUNT',
    reqUserId: userId.value,
    reqDttm: reqDttm,
    testType: analysisType.value,
  };
  EventBus.publish('childEmitSocketData', payload);
  isStartCountUpdated.value = true;
}


watch([commonDataGet.value], async (newVals: any) => {
  const newValsObj = JSON.parse(JSON.stringify(newVals));
  if (newValsObj[0].isRunningState) {
    noRouterPush.value = true;
  } else {
    noRouterPush.value = false;
  }
});

watch(() => isErrorAlarm.value, async (newIsErrorAlarm: boolean) => {
  if (newIsErrorAlarm && !isErrorAlarmRunning.value) {
    if (!isPlayingErrorAlarm.value) {
      isErrorAlarmRunning.value = true;
      isPlayingErrorAlarm.value = true;
      try {
        await SOUND_ERROR_ALARM.play();
      } catch (e) {
        console.error(e);
      } finally {
        isPlayingErrorAlarm.value = false;
      }
    }
    isErrorAlarmInterval = setTimeout(() => {
      store.dispatch('commonModule/setCommonInfo', { isErrorAlarm: false });
      isErrorAlarmRunning.value = false;
    }, alarmCount.value);
  }
})

watch(() => isCompleteAlarm.value, async (newIsCompleteAlarm: boolean) => {
  if (newIsCompleteAlarm && !isCompleteAlarmRunning.value) {
    if (!isPlayingCompleteAlarm.value) {
      isCompleteAlarmRunning.value = true;
      isPlayingCompleteAlarm.value = true;
      try {
        await SOUND_COMPLETE_ALARM.play();
      } catch (e) {
        console.error(e);
      } finally {
        isPlayingCompleteAlarm.value = false;
      }
    }

    isCompleteAlarmInterval = setTimeout(() => {
      isCompleteAlarmRunning.value = false;
      store.dispatch('commonModule/setCommonInfo', { isCompleteAlarm: false });
    }, alarmCount.value);
  }
})

const closeUserSetBox = (event: any) => {
  const selectBox = document.querySelector('.userSetOutUl');
  const selectButton = document.querySelector('.cursorPointer');
  if (selectButton && selectButton.contains(event.target as Node)) return;
  if (selectBox && !selectBox.contains(event.target as Node)) {
    userSetOutUl.value = false;
  }
}

const showSuccessAlert = (message: string) => {
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

const isActive = (path: string) => {
  return route.path === path;
};

const logout = () => {
  clickType.value = 'logout';
  confirmMessage.value = MESSAGES.LOGOUT;
  showConfirm.value = true;
  localStorage.removeItem('user')
  userSetOutUl.value = false;
}

const exit = async () => {
  clickType.value = 'exit';
  confirmMessage.value = MESSAGES.exit;
  showConfirm.value = true;
  userSetOutUl.value = false;
}

const oilCountChangeVal = (): string => {
  if (oilCount.value >= 0 && oilCount.value <= 100) {
    return '10%';
  } else if (oilCount.value > 100 && oilCount.value <= 250) {
    return '25%';
  } else if (oilCount.value > 250 && oilCount.value <= 500) {
    return '50%';
  } else if (oilCount.value > 500 && oilCount.value <= 750) {
    return '75%';
  } else {
    return '100%';
  }
}

const storagePercentChangeVal = () => {
  if (storagePercent.value >= 0 && storagePercent.value <= 30) {
    return '30%';
  } else if (storagePercent.value > 30 && storagePercent.value <= 60) {
    return '60%';
  } else if (storagePercent.value > 60 && storagePercent.value <= 90) {
    return '90%';
  } else {
    return '100%';
  }
}
const eqStatCdChangeVal = (eqStatCdVal: string) => {
  if (eqStatCdVal === '01') {
    return {
      icon: ['fas', 'person'],
      class: ''
    };
  } else if (eqStatCdVal === '02') {
    return {
      icon: ['fas', 'person-walking'],
      class: ''
    };
  } else if (eqStatCdVal === '03') {
    return {
      icon: ['fas', 'person-running'],
      class: 'runRed'
    };
  } else if (eqStatCdVal === '04' || eqStatCdVal === '05') {
    return {
      icon: ['fas', 'person-running'],
      class: 'runBlue'
    };
  }

  return {
    icon: ['fas', 'person'],
    class: ''
  };
}

const openLayer = () => {
  if (viewerCheck.value === 'viewer') {
    showErrorAlert('Access is only available from the main PC.');
    return;
  }

  oilVisible.value = true;
};

const closeLayer = (val: boolean) => {
  oilVisible.value = val;
};

const onReset = () => {

  getPercent();
  const settings = tcpReq().embedStatus.settings;
  settings.reqUserId = userId;

  Object.assign(settings, {
    oilCount,
    isOilReset: 'Y',
    pbiaRootDir: rootDir.value,
    // uiVersion: 'uimd-pb-comm_v3',
    userId: '',
    isNsNbIntegration: isNsNbIntegration.value || '',
  });
  EventBus.publish('childEmitSocketData', settings);

  showSuccessAlert(MESSAGES.IDS_MSG_SUCCESS);
}

const getPercent = () => {
  if (!statusBarWrapper.value || !statusBar.value) {
    return;
  }
  const percent = Math.min(Math.round((oilCount.value / maxOilCount.value) * 100), 100);
  const progressBarWidth = `${(percent / 100) * statusBarWrapper.value.offsetWidth}px`;
  statusBar.value.style.width = progressBarWidth;
}

const onPrime = () => {
  if (blinkTimeout !== null) {
    clearTimeout(blinkTimeout);
  }

  isBlinkingPrime.value = true;
  tcpReq().embedStatus.oilPrime.reqUserId = userId;
  EventBus.publish('childEmitSocketData', tcpReq().embedStatus.oilPrime);

  blinkTimeout = setTimeout(() => {
    isBlinkingPrime.value = false;
    blinkTimeout = null;
  }, 1500);
}

const onModalOpen = () => {
  // 모달이 열린 후에 실행되는 콜백 함수
  getPercent();
};

const cellImgGet = async () => {
  try {
    const result = await getCellImgApi();
    if (result) {
      if (result?.data) {
        const data = result.data;
        await store.dispatch('commonModule/setCommonInfo', {isNsNbIntegration: data.isNsNbIntegration ? 'Y' : 'N'});
        alarmCount.value = data?.isAlarm ? Number(data.alarmCount) * 1000 : 5000;
        await store.dispatch('dataBaseSetDataModule/setDataBaseSetData', { isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N' });
        // 공통으로 사용되는 부분 세션스토리지 저장 새로고침시에도 가지고 있어야하는부분
        sessionStorage.setItem('isNsNbIntegration', data.isNsNbIntegration ? 'Y' : 'N');
        sessionStorage.setItem('wbcPositionMargin', data?.diffWbcPositionMargin);
        sessionStorage.setItem('rbcPositionMargin', data?.diffRbcPositionMargin);
        sessionStorage.setItem('pltPositionMargin', data?.diffPltPositionMargin);
        sessionStorage.setItem('edgeShotType', String(data?.edgeShotType));
        sessionStorage.setItem('edgeShotLPCount', String(data?.edgeShotLPCount));
        sessionStorage.setItem('edgeShotHPCount', String(data?.edgeShotHPCount));
        sessionStorage.setItem('iaRootPath', data?.iaRootPath);
        await store.dispatch('commonModule/setCommonInfo', {iaRootPath: String(data?.iaRootPath)});
        await store.dispatch('commonModule/setCommonInfo', { showLISUploadAfterCheckingAll: data?.lisUploadCheckAll });

      }
    }

  } catch (e) {
    console.error(e);
  }
}

const cellImgGetAll = async () => {
  try {
    const result = await getCellImgAllApi();
    if (result?.data && !isObjectEmpty(result?.data)) {
      await store.dispatch('commonModule/setCommonInfo', { cellImageAnalyzedData: result.data });
    }
  } catch (error) {
    console.error(error);
  }
}

const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};

const closeErrLog = () => {
  ErrLogOpen.value = false;
  errArr.value = [];
}

const openErrLogOver = async () => {
  if (
      !visibleBySite(siteCd.value, [
        HOSPITAL_SITE_CD_BY_NAME['TEST'],
        HOSPITAL_SITE_CD_BY_NAME['원자력병원'],
        HOSPITAL_SITE_CD_BY_NAME['UIMD'],
      ], 'enable')) {
    return;
  }
  ErrLogOpen.value = true;
  mounseLeave.value = true;
  await errLogLoad();
}

const closeErrLogLeave = () => {
  if (
      !visibleBySite(siteCd.value, [
        HOSPITAL_SITE_CD_BY_NAME['TEST'],
        HOSPITAL_SITE_CD_BY_NAME['원자력병원'],
        HOSPITAL_SITE_CD_BY_NAME['UIMD'],
      ], 'enable')) {
    return;
  }

  if (mouseClick.value){
    return;
  }
  errArr.value = [];
  mounseLeave.value = false;
  ErrLogOpen.value = false;
}

const errMouseSet = () => {
  mounseLeave.value = false;
  ErrLogOpen.value = false;
  mouseClick.value = false;
}

const tooltipVisibleFunc = (type: 'oilPrime' | 'storage' | 'drawerStatus' | 'runningStatus', visible: boolean) => {
  tooltipVisible[type] = visible;
}

</script>
