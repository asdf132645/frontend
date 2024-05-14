<template>
  <div class="wbcMenu">
    <ul>
      <template v-if="['bm', 'pb'].includes(projectType)">
        <li
            :class="{ onRight: isActive(projectType === 'bm' ? '/databaseWhole' : '/databaseRbc') }"
            @click="pageGo(projectType === 'bm' ? '/databaseWhole' : '/databaseRbc')"
        >
          {{ projectType === 'bm' ? 'WHOLE' : 'RBC' }}
        </li>
        <li :class='{ "onRight": isActive("/databaseDetail") }' @click="pageGo('/databaseDetail')">
          {{ projectType === 'bm' ? 'BM CELL' : 'WBC' }}
        </li>
        <li :class='{ "onRight": isActive("/report") }' @click="pageGo('/report')">REPORT</li>
      </template>
      <!--      <li>LIS-CBC</li>-->
    </ul>
    <div class="wbcMenuBottom">
      <button @click="moveWbc('up')">
        <font-awesome-icon :icon="['fas', 'circle-up']"/>
      </button>
      <button @click="moveWbc('down')">
        <font-awesome-icon :icon="['fas', 'circle-down']"/>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineEmits, getCurrentInstance, onMounted, onUnmounted, ref} from "vue";
import router from "@/router";

// const clickid = ref(sessionStorage.getItem('dbBaseTrClickId'));
import {ApiResponse} from "@/common/api/httpClient";
import {detailRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
// import {stateDeleteCommon, stateUpdateCommon} from "@/common/lib/commonfunction";
// import {getUserIpApi} from "@/common/api/service/user/userApi";
import {useRoute} from "vue-router";
import {getOrderClassApi} from "@/common/api/service/setting/settingApi";
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";

const emits = defineEmits();
const projectType = ref<any>('bm');
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const resData = ref<any>([]);
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);
const wbcInfo = ref<any>([]);
const instance = getCurrentInstance();
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const route = useRoute();
const orderClass = ref<any>([]);

onMounted(async () => {
  projectType.value = process.env.PROJECT_TYPE;
  await getRunningInfoDetail(selectItems.value.id);
});

onUnmounted(async () => {
  // await stateDeleteCommon(originalDb.value, selectItems.value, userModuleDataGet.value.id)
  //     .then(response => {
  //       instance?.appContext.config.globalProperties.$socket.emit('state', {
  //         type: 'SEND_DATA',
  //         payload: 'refreshDb'
  //       });
  //     }).catch(error => {
  //       console.error('Error:', error.response.data);
  //     });
})

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi(String(userModuleDataGet.value.id));
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
  router.push(path)
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
    }
  } catch (e) {
    console.error(e);
  }
  return resData.value;
}

const moveWbc = async (direction: any) => {
  await getOrderClass(); // 클래스 정보를 업데이트

  const currentDbIndex = originalDb.value.findIndex((item: any) => item.id === selectItems.value.id);
  const nextDbIndex = direction === 'up' ? originalDb.value[currentDbIndex - 1] : originalDb.value[currentDbIndex + 1];

  if (nextDbIndex) {
    await processNextDbIndex(nextDbIndex, direction, currentDbIndex);
  }
};

const processNextDbIndex = async (nextDbIndex: any, direction: any, currentDbIndex: number) => {
  const res = await getRunningInfoDetail(nextDbIndex.id);

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
  const wbcArr = orderClass.value.length !== 0 ? orderClass.value : process.env.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  const sortedWbcInfo = sortWbcInfo(resClassInfo, wbcArr);

  sessionStorage.setItem('selectItemWbc', JSON.stringify(sortedWbcInfo));
  sessionStorage.setItem('dbBaseTrClickId', String(dbIndex.id));

  await store.dispatch('commonModule/setCommonInfo', {clonedWbcInfo: sortedWbcInfo});
  await updateUpDown(resData.value?.wbcInfo.wbcInfo[0], resData.value);
};

const updateUpDown = async (selectWbc: any, selectItemsNewVal: any) => {
  console.log(selectItemsNewVal)
  emits('refreshClass', selectItemsNewVal);
};

const isActive = (path: string) => {
  return route.path === path;
};

</script>
