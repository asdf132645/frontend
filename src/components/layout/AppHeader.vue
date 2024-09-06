<template>
  <header class='header'>
    <nav>
      <div class='appHeaderLeft' :class="{ 'bmComponent': projectBm }" v-if="!appHeaderLeftHidden">
        <div class="borderLine">
          <img src="@/assets/celli.png" class="headerLogo"/>
          <p class="logoProjectTitle">{{ projectBm ? 'BM' : 'PB' }}</p>
        </div>
        <router-link :to="noRouterPush ? '#' : '/setting'"
                     :class='{ "leftActive": isActive("/setting"), "disabledLink": noRouterPush }'>
          <font-awesome-icon :icon="['fas', 'gear']" style="font-size: 1rem;"/>
          <span class='icoText'>Setting</span>
        </router-link>
        <router-link to="/"
                     v-if="viewerCheck === 'main'"
                     :class='{ "leftActive": isActive("/analysis") || route.path === "/" }'>
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

        <!--  좌측메뉴  -->
        <div class="small-icon-menu">
          <div class="lastMenu">
            <ul>
              <li>{{ formattedDate }} {{ formattedTime }}</li>
              <li class="lastLiM">
                <div class="cursorPointer userBox" @click="userSetOutToggle">
                  <font-awesome-icon :icon="['fas', 'circle-user']"/>
                  {{ userModuleDataGet.userId }}
                </div>
                <ul v-show="userSetOutUl" class="userSetOutUl" @click.stop>
                  <li @click="logout">LOGOUT</li>
                </ul>
                <div class="logOutBox" @click="exit">
                  EXIT
                </div>
                <div class="logOutBox" @click='fullScreen'>FULL SCREEN</div>
              </li>
            </ul>
          </div>
          <div class="iconHeaderMenu">
            <ul>
              <li class="alarm">
                <font-awesome-icon :icon="['fas', 'bell']" :class="{ 'blinking': isAlarm }"/>
              </li>
              <li>
                <font-awesome-icon v-if="isDoorOpen !== 'Y'" :icon="['fas', 'door-closed']"></font-awesome-icon>
                <font-awesome-icon v-else :icon="['fas', 'door-open']"/>
              </li>
              <li>
                <font-awesome-icon :icon="eqStatCdData.icon" :class="eqStatCdData.class"/>
              </li>
              <li class="oliCount" @click="openLayer" :title="'oilCount: ' + (oilCountData || 0)">
                <font-awesome-icon :icon="['fas', 'droplet']"/>
              </li>
              <li class="storage" :title="'storage: ' + (storagePercentData || 0)">
                <font-awesome-icon :icon="['fas', 'database']"/>
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
        <h5 class="modalTitle mb1">Immersion Oil count Reset</h5>
        <span class="grayText">Reset Immersion Oil count after changing Oil pack</span>
        <div class="flexSpaceBetween alignItemsCenter mt1">
          <span>Estimated number of slides left</span>
          <span class="f18">{{ oilCount }}</span>
        </div>

        <div class="flexColumnAlignEnd">
          <div ref="statusBarWrapper" class="statusBarWrapper">
            <div ref="statusBar" class="statusBar"></div>
          </div>
          <div>
            <button @click='onReset' class="alertButton">Reset</button>
          </div>
        </div>
      </div>

      <div class='mt2'>
        <h5 class="modalTitle mb1">Prime Immersion Oil</h5>
        <span class="grayText mt1">Prime oil to remove air from the oil hose</span>
        <div class="flexColumnAlignEnd">
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
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router';
import {computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import router from "@/router";
import Modal from '@/components/commonUi/modal.vue';
import {messages} from "@/common/defines/constFile/constantMessageText";
import {getCellImgApi} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import {tcpReq} from "@/common/tcpRequest/tcpReq";
import Confirm from "@/components/commonUi/Confirm.vue";
import EventBus from "@/eventBus/eventBus";
import {getBrowserExit} from "@/common/api/service/browserExit/browserExitApi";
import Button from "@/components/commonUi/Button.vue";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";
import {logoutApi} from "@/common/api/service/user/userApi";
import {getDeviceIpApi} from "@/common/api/service/device/deviceApi";
import axios from "axios";

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
const runInfo = computed(() => store.state.commonModule);
const commonDataGet = computed(() => store.state.commonModule);

const eqStatCdData = ref({
  icon: ['fas', 'person'],
  class: ''
});
const oilCountData = ref('');
const storagePercentData = ref('');
const isAlarm = ref(false);
const oilVisible = ref(false);
const maxOilCount = ref(1000);
const statusBarWrapper = ref<HTMLDivElement | null>(null);
const statusBar = ref<HTMLDivElement | null>(null);
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const isNsNbIntegration = ref(sessionStorage.getItem('isNsNbIntegration') || '');
const analysisType = computed(() => store.state.commonModule.analysisType);
const alarmCount = ref(0);
const noRouterPush = ref(false);
const currentDate = ref<string>("");
const currentTime = ref<string>("");
let isAralrmInterver = null;
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const projectBm = ref(false);
const clickType = ref('');
const userSetOutUl = ref(false);
const isStartCountUpdated = ref(false);

const keydownHandler = (e: KeyboardEvent) => {
  if (e.ctrlKey && ['61', '107', '173', '109', '187', '189'].includes(String(e.which))) {
    e.preventDefault();
  }
}

const formattedDate = computed(() => {
  return currentDate.value;
});

const formattedTime = computed(() => {
  return currentTime.value;
});

const userSetOutToggle = () => {
  userSetOutUl.value = !userSetOutUl.value;
}

const userSetOutOff = () => {
  userSetOutUl.value = false;
}

const updateDateTime = () => {
  const now = new Date();
  currentDate.value = now.toLocaleDateString(undefined, {year: 'numeric', month: '2-digit', day: '2-digit'});
  currentTime.value = now.toLocaleTimeString('en-US');
};

const handleOkConfirm = async () => {
  showConfirm.value = false;
  await logoutApi({userId: userId.value});
  if (clickType.value === 'exit') {
    if (viewerCheck.value === 'main') {
      EventBus.publish('childEmitSocketData', tcpReq().embedStatus.exit);
    } else {
      const result = await getDeviceIpApi();
      const ipAddress = `ip=${result.data}`
      const url = `http://${result.data}:3000/close?${ipAddress}`;
      await axios.get(url);
    }
  } else {
    sessionStorage.clear();
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
  }
}

onMounted(async () => {
  // 현재 프로젝트가 bm인지 확인하고 클래스 부여
  projectBm.value = window.PROJECT_TYPE === 'bm' ? true : false;

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


watch(userModuleDataGet.value, (newUserId, oldUserId) => {
  cellImgGet();
  userId.value = newUserId.id;
});

watch([embeddedStatusJobCmd.value], async (newVals: any) => {
  await nextTick();
  oilCount.value = Number(newVals[0].sysInfo.oilCount);
  isDoorOpen.value = newVals[0].sysInfo.isDoorOpen;
  storagePercent.value = Number(newVals[0].sysInfo.storageSize);
  eqStatCd.value = newVals[0].sysInfo.eqStatCd;

  eqStatCdData.value = eqStatCdChangeVal(newVals[0].sysInfo.eqStatCd);
  oilCountData.value = oilCountChangeVal();
  storagePercentData.value = storagePercentChangeVal();

  if (!isStartCountUpdated.value) {
    searchCardCount();
  }

});

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

watch([runInfo.value], async (newVals: any) => {

  isAlarm.value = newVals[0].isAlarm;
  if (newVals[0].isAlarm) {
    isAralrmInterver = setTimeout(() => {
      store.dispatch('commonModule/setCommonInfo', {isAlarm: false});
    }, alarmCount.value);
  }

});

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
  confirmMessage.value = messages.Logout;
  showConfirm.value = true;
  localStorage.removeItem('user')
  userSetOutUl.value = false;
}

const exit = async () => {
  clickType.value = 'exit';
  confirmMessage.value = messages.exit;
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
    // uiVersion: 'uimd-pb-comm_v3',
    userId: '',
    isNsNbIntegration: isNsNbIntegration.value || '',
  });
  instance?.appContext.config.globalProperties.$socket.emit('message', {
    type: 'SEND_DATA',
    payload: settings
  });

  showSuccessAlert(messages.IDS_MSG_SUCCESS);
}

const getPercent = () => {
  if (!statusBarWrapper.value || !statusBar.value) {
    return;
  }
  const percent = Math.round((oilCount.value / maxOilCount.value) * 100);
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
        await store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
          isNsNbIntegration: data?.isNsNbIntegration ? 'Y' : 'N'
        });
        // 공통으로 사용되는 부분 세션스토리지 저장 새로고침시에도 가지고 있어야하는부분
        sessionStorage.setItem('isNsNbIntegration', data.isNsNbIntegration ? 'Y' : 'N');
        sessionStorage.setItem('wbcPositionMargin', data?.diffWbcPositionMargin);
        sessionStorage.setItem('rbcPositionMargin', data?.diffRbcPositionMargin);
        sessionStorage.setItem('pltPositionMargin', data?.diffPltPositionMargin);
        sessionStorage.setItem('edgeShotType', String(data?.edgeShotType));
        sessionStorage.setItem('iaRootPath', data?.iaRootPath);
        await store.dispatch('commonModule/setCommonInfo', {iaRootPath: String(data?.iaRootPath)});

      }
    }

  } catch (e) {
    console.log(e);
  }
}


</script>
