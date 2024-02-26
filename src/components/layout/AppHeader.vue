<template>
  <header class='header'>
    <nav>
      <!-- 왼쪽 메인 메뉴 -->
      <div class='appHeaderLeft' v-if="!appHeaderLeftHidden">
        <div class="borderLine">
          <span class="greenColor">U</span>MID
        </div>
        <div class='toggleHeadBtn' @click="toggleAppHeaderLeft">
          <font-awesome-icon :icon="['fas', 'arrows-left-right-to-line']"/>
          <span> menu toggle</span>
        </div>
        <router-link to="/setting" :class='{ "leftActive": isActive("/setting") }'>
          <font-awesome-icon :icon="['fas', 'gear']"
                             style="font-size: 1rem;"
          />
          <span class='icoText'>Setting</span>
        </router-link>

        <router-link to="/analysis" :class='{ "leftActive": isActive("/analysis") || route.path === "/" }'>
          <font-awesome-icon :icon="['fas', 'chart-pie']"
                             style="font-size: 1rem;"
          />
          <span class='icoText'>Analysis</span>
        </router-link>

        <router-link to="/dataBase" :class='{ "leftActive": isActive("/dataBase") }'>
          <font-awesome-icon :icon="['fas', 'server']"
                             style="font-size: 1rem;"
          />
          <span class='icoText'>Data Base</span>
        </router-link>
      </div>
      <div v-else class="closeToggleBtn" @click="toggleAppHeaderLeft">
        열기
      </div>

      <!--  좌측메뉴  -->
      <div class="display-flex">
        <div class="leftMenu">
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
            <li class="oliCount" @click="openLayer">oliCount: {{ oilCountData || 0 }}</li>
            <li>storage: {{ storagePercentData || 0 }}</li>
          </ul>
        </div>
        <div class="lastMenu">
          <ul>
            <li>Logged: {{ formattedDate }}</li>
            <li class="lastLiM">
              <span class="userBox" @click='logOutBoxOn'>
                {{ formattedTime }}
                <font-awesome-icon :icon="['fas', 'circle-user']"/> {{ storedUser && getStoredUser?.userId }}
              </span>
              <div class='logOutBox' v-if='logOutBox' @click='logout'>
                LOGOUT
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
  <Modal v-if="visible" @update:closeLayer="closeLayer" @afterOpen="onModalOpen">
    <!-- 헤더 슬롯에 들어갈 내용 -->
    <template #header>
      <h2>Immersion Oil</h2>
    </template>

    <!-- 컨텐츠 슬롯에 들어갈 내용 -->
    <template #content>
      <div>
        <h5 class="modalTitle">Immersion Oil count Reset</h5>
        <span class="colorGray">Reset Immersion Oil count after changing Oil pack</span>
        <div class="smallTitle">
          <span>Estimated number of slides left</span>
          <div class="border ml-5" style="width: 80px;">{{ oilCount }}</div>
        </div>

        <div>
          <div ref="statusBarWrapper" class="statusBarWrapper">
            <div ref="statusBar" class="statusBar"></div>
          </div>
          <div>
            <button @click='onReset'>RESET</button>
          </div>
        </div>
      </div>

      <div class='mt2'>
        <h5 class="modalTitle">Prime Immersion Oil</h5>
        <span class="colorGray">Prime oil to remove air from the oil hose</span>
        <div>
          <div class="statusBarWrapper">
          </div>
          <button @click='onPrime'>PRIME</button>
        </div>
      </div>

    </template>
  </Modal>
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router';
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import router from "@/router";
import Modal from '@/components/commonUi/modal.vue';
import {messages} from "@/common/defines/constFile/constant";
import {sendOilPrimeWebSocket, sendSettingInfoWebSocket} from "@/common/lib/sendWebSocket/common";

const route = useRoute();
const appHeaderLeftHidden = ref(false);
const formattedDate = new Date().toLocaleDateString(undefined, {year: 'numeric', month: '2-digit', day: '2-digit'});
const formattedTime = new Date().toLocaleTimeString('en-US');
const store = useStore();
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const logOutBox = ref(false);

const embeddedStatusJobCmd = computed(() => store.state.embeddedStatusModule);
const oilCount = ref(0);
const isDoorOpen = ref('');
const storagePercent = ref(0);
const eqStatCd = ref('');
const runInfo = computed(() => store.state.commonModule);
const eqStatCdData = ref({
  icon: ['fas', 'person'],
  class: ''
});
const oilCountData = ref('');
const storagePercentData = ref('');
const isAlarm = ref(false);
const visible = ref(false);
const maxOilCount = ref(1000);
const statusBarWrapper = ref<HTMLDivElement | null>(null);
const statusBar = ref<HTMLDivElement | null>(null);
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);

onMounted(async () => {
  const newUserId = JSON.parse(JSON.stringify(userModuleDataGet.value));
  userId.value = newUserId.userId;
});

watch([embeddedStatusJobCmd.value], async (newVals: any) => {
  await nextTick();
  oilCount.value = Number(newVals[0].sysInfo.oilCount);
  isDoorOpen.value = newVals[0].sysInfo.isDoorOpen;
  storagePercent.value = Number(newVals[0].sysInfo.storagePercent);
  eqStatCd.value = newVals[0].sysInfo.eqStatCd;

  eqStatCdData.value = eqStatCdChangeVal(newVals[0].sysInfo.eqStatCd);
  oilCountData.value = oilCountChangeVal();
  storagePercentData.value = storagePercentChangeVal();
});

watch([runInfo.value], async (newVals: any) => {
  await nextTick();
  isAlarm.value = newVals[0].isAlarm;
  if (isAlarm.value) {
    setTimeout(() => {
      isAlarm.value = false;
    }, 5000);
  }
});



const toggleAppHeaderLeft = () => {
  appHeaderLeftHidden.value = !appHeaderLeftHidden.value;
};

const isActive = (path: string) => {
  return route.path === path;
};

const logOutBoxOn = () => {
  logOutBox.value = !logOutBox.value;
}
const logout = () => {
  sessionStorage.removeItem('user');
  router.push('user/login');
  store.commit('resetStore');
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
  logOutBox.value = false;
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
  visible.value = true;
};

const closeLayer = (val: boolean) => {
  visible.value = val;
};

const onReset = () => {
  alert(messages.IDS_MSG_SUCCESS);
  getPercent();
  sendSettingInfoWebSocket('Y', String(oilCount.value), userId.value);
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
  sendOilPrimeWebSocket(userId.value);
}

const onModalOpen = () => {
  // 모달이 열린 후에 실행되는 콜백 함수
  getPercent();
};

</script>