<template>
  <div class="wbcMenu">
    <ul>

      <template v-if="['bm', 'pb'].includes(projectType)">
        <li
            :class="{ onRight: isActive(projectType === 'bm' ? '/databaseWhole' : '/databaseRbc') }"
            @click="pageGo(projectType === 'bm' ? '/databaseWhole' : '/databaseRbc')"
            v-if="projectType !== 'pb' || (selectItems?.testType !== '01' && projectType === 'pb')"
        >
          <p class="menuIco">
            <font-awesome-icon :icon="['fas', 'virus']"/>
          </p>
          <p>{{ projectType === 'bm' ? 'WHOLE' : 'RBC' }}</p>
        </li>
        <li :class='{ "onRight": isActive("/databaseDetail") }' @click="pageGo('/databaseDetail')">
          <p class="menuIco">
            <font-awesome-icon :icon="['fas', 'disease']"/>
          </p>
          <p>{{ projectType === 'bm' ? 'BM CELL' : 'WBC' }}</p>
        </li>
        <li :class='{ "onRight": isActive("/report") }' @click="pageGo('/report')">
          <p class="menuIco">
            <font-awesome-icon :icon="['fas', 'clipboard']"/>
          </p>
          <p>REPORT</p>
        </li>
      </template>

    </ul>
    <div @click="lisCbcClick" :class='{ "onRight": cbcLayer, "cbcLi": true }' v-if="projectType !== 'bm'">
      <font-awesome-icon :icon="['fas', 'desktop']"/>
      <p>LIS-CBC</p>
    </div>
    <div class="wbcMenuBottom">
      <button @click="moveWbc('up')" :disabled="isButtonDisabled">
        <font-awesome-icon :icon="['fas', 'circle-up']"/>
      </button>
      <button @click="moveWbc('down')" :disabled="isButtonDisabled">
        <font-awesome-icon :icon="['fas', 'circle-down']"/>
      </button>
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
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, getCurrentInstance, onMounted, onUnmounted, ref, watch} from "vue";
import router from "@/router";

import {ApiResponse} from "@/common/api/httpClient";
import {detailRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {useRoute} from "vue-router";
import {getOrderClassApi} from "@/common/api/service/setting/settingApi";
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";
import {stateDeleteCommon, stateUpdateCommon} from "@/common/lib/commonfunction";
import {getUserIpApi} from "@/common/api/service/user/userApi";
import Alert from "@/components/commonUi/Alert.vue";

const emits = defineEmits();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const projectType = ref<any>('bm');
const selectItemsData = ref(sessionStorage.getItem("selectItems"));
const selectItems = ref(selectItemsData.value ? JSON.parse(selectItemsData.value) : null);
const resData = ref<any>([]);
const originalDbData = ref(sessionStorage.getItem("originalDbData"));
const originalDb = ref(originalDbData.value ? JSON.parse(originalDbData.value) : null);
const wbcInfo = ref<any>([]);
const instance = getCurrentInstance();
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const route = useRoute();
const orderClass = ref<any>([]);
const cbcLayer = computed(() => store.state.commonModule.cbcLayer);
const isButtonDisabled = ref(false);
let timeoutId: number | undefined = undefined;
const pageMoveDeleteStop = ref(false);
const props = defineProps(['isNext']);

watch(props.isNext, (newVal) => {
  if(newVal){
    moveWbc('down')
  }
});

onMounted(async () => {
  projectType.value = window.PROJECT_TYPE;
  await getRunningInfoDetail(selectItems.value.id);
  pageMoveDeleteStop.value = true;
});

onUnmounted(async () => {
  if(pageMoveDeleteStop.value){
    await deleteConnectionStatus();
  }
  await store.dispatch('commonModule/setCommonInfo', {cbcLayer: false});
})
const hideAlert = () => {
  showAlert.value = false;
};
const deleteConnectionStatus = async ()  => {
  const selectItemsData = ref(sessionStorage.getItem("selectItems"));
  const selectItems = selectItemsData.value ? JSON.parse(selectItemsData.value) : null;
  const originalDbData = ref(sessionStorage.getItem("originalDbData"));
  const originalDb = originalDbData.value ? JSON.parse(originalDbData.value) : null;
  await stateDeleteCommon(originalDb, selectItems.id, userModuleDataGet.value.id)
      .then(response => {
        instance?.appContext.config.globalProperties.$socket.emit('state', {
          type: 'SEND_DATA',
          payload: 'refreshDb'
        });
      }).catch(error => {
        console.log('2 err')
      });
}

const upDownBlockAccess = async (selectItems: any) => {
  try {
    const result = await getUserIpApi();
    await stateUpdateCommon(selectItems, result.data, [...originalDb.value], userModuleDataGet.value.id).then(response => {
      emits('initData');
      instance?.appContext.config.globalProperties.$socket.emit('state', {
        type: 'SEND_DATA',
        payload: 'refreshDb'
      });
    }).catch(error => {
      console.log('3 err')
    });
  } catch (e) {
    console.log(e)
  }
}

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        orderClass.value = [];
      } else {
        orderClass.value = result.data.sort((a: any, b: any) => Number(a.orderText) - Number(b.orderText));
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const pageGo = (path: string) => {
  router.push(path);
  pageMoveDeleteStop.value = false;
}

const sortWbcInfo = (wbcInfo: any, basicWbcArr: any) => {
  let newSortArr = JSON.parse(JSON.stringify(wbcInfo));

  newSortArr.sort((a: any, b: any) => {
    const nameA = basicWbcArr.findIndex((item: any) => item.title === a.title);
    const nameB = basicWbcArr.findIndex((item: any) => item.title === b.title);

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });

  return newSortArr;
};

async function getRunningInfoDetail(id: any) {
  try {
    let result: ApiResponse<void>;
    result = await detailRunningApi(String(id));

    if (result) {
      // console.log(result);
      resData.value = result.data;
      console.log(resData.value.state);
    }
  } catch (e) {
    console.error(e);
  }
  return resData.value;
}

const moveWbc = async (direction: any) => {

  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
  }
  isButtonDisabled.value = true; // 버튼 비활성화
  await getOrderClass(); // 클래스 정보를 업데이트

  const currentDbIndex = originalDb.value.findIndex((item: any) => item.id === selectItems.value.id);
  const nextDbIndex = direction === 'up' ? originalDb.value[currentDbIndex - 1] : originalDb.value[currentDbIndex + 1];

  if (nextDbIndex) {
    await processNextDbIndex(nextDbIndex, direction, currentDbIndex);
  }

  timeoutId = window.setTimeout(() => {
    isButtonDisabled.value = false;
  }, 700);

};

const processNextDbIndex = async (nextDbIndex: any, direction: any, currentDbIndex: number) => {
  const res = await getRunningInfoDetail(nextDbIndex.id);
  if (resData.value.state){
    showAlert.value = true;
    alertType.value = 'success';
    alertMessage.value = 'Someone else is editing.';
    return;
  }
  if (res && Object.keys(resData.value?.wbcInfo).length !== 0) {
    await handleDataResponse(nextDbIndex, res);
  } else {
    const newNextDbIndex = direction === 'up' ? originalDb.value[currentDbIndex - 2] : originalDb.value[currentDbIndex + 2];
    if (newNextDbIndex) {
      const fallbackRes = await getRunningInfoDetail(newNextDbIndex.id);
      if (fallbackRes && Object.keys(resData.value?.wbcInfo).length !== 0) {
        await handleDataResponse(newNextDbIndex, fallbackRes);
      }
    }
  }
};

const handleDataResponse = async (dbIndex: any, res: any) => {
  selectItems.value = resData.value;
  sessionStorage.setItem('selectItems', JSON.stringify(resData.value));

  const resClassInfo = resData.value?.wbcInfoAfter.length === 0 ? resData.value?.wbcInfo?.wbcInfo[0] : resData.value?.wbcInfoAfter;
  const wbcArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  const sortedWbcInfo = sortWbcInfo(resClassInfo, wbcArr);
  sessionStorage.setItem('selectItemWbc', JSON.stringify(sortedWbcInfo));
  sessionStorage.setItem('dbBaseTrClickId', String(dbIndex.id));
  await store.dispatch('commonModule/setCommonInfo', {clonedWbcInfo: sortedWbcInfo});
  await updateUpDown(resClassInfo, resData.value);
};

const updateUpDown = async (selectWbc: any, selectItemsNewVal: any) => {
  if(projectType.value === 'pb' && selectItems.value?.testType === '01'){
    pageGo('/databaseDetail');
  }
  emits('refreshClass', selectItemsNewVal);
  pageMoveDeleteStop.value = true;
  await deleteConnectionStatus();
  await upDownBlockAccess(selectItemsNewVal);
};

const isActive = (path: string) => {
  return route.path === path;
};

const lisCbcClick = () => {
  //
  store.dispatch('commonModule/setCommonInfo', {cbcLayer: !cbcLayer.value});
}

</script>
