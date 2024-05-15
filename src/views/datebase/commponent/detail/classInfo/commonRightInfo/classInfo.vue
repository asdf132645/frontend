<template>
  <img v-if="type !== 'report'"
       :src="barcodeImg"/>
  <div class="mt2 mb2">
    <h3 class="wbcClassInfoLeft">
      {{ wbcClassTileChange() }}
    </h3>
    <ul class="leftWbcInfo">
      <li style="position: relative">
        <font-awesome-icon :icon="['fas', 'comment-dots']" @click="memoOpen"/>
        <div v-if="memoModal" class="memoModal">
          <textarea v-model="memo"></textarea>
          <button @click="memoChange">ok</button>
          <button @click="memoCancel">cancel</button>
        </div>
      </li>
      <li @click="commitConfirmed">
        <font-awesome-icon :icon="['fas', 'square-check']"/>
      </li>
      <li>
        <font-awesome-icon :icon="['fas', 'upload']"/>
      </li>
      <li>
        <font-awesome-icon :icon="['fas', 'lock']" v-if="!toggleLock" @click="toggleLockEvent"/>
        <font-awesome-icon :icon="['fas', 'lock-open']" v-if="toggleLock" @click="toggleLockEvent"/>
      </li>
    </ul>
  </div>
  <div class="wbcClassScroll">
    <div
        v-for="(item, idx) in wbcInfoChangeVal"
        :key="item.id"
        class="wbcClassDbDiv"
        draggable="true"
        @dragstart="startDrag(idx, $event)"
        @dragover.prevent
        @drop="drop(idx, $event)"
    >
      <ul class="nth1Child classAttribute" v-if="idx === 0">
        <li>Class</li>
        <li>Count</li>
        <li>%</li>
      </ul>
      <ul class="nth1Child" v-if="shouldRenderCategory(item.title)" @click="goClass(item.id)">
        <li>{{ item?.name }}</li>
        <li>{{ item?.count }}</li>
        <li> {{ item?.percent || '-' }}</li>
      </ul>
    </div>
    <div class="categories classTotal">
      <ul class="categoryNm">
        <li>
          Total
        </li>
      </ul>
      <ul class="classNm">
        <li>
          {{ totalCount || 0 }}
        </li>
      </ul>
      <ul class="degree">
        <li>
          100.00
        </li>
      </ul>
    </div>

    <div v-if="projectBm">
      <div
          v-for="(item, idx) in wbcInfoChangeVal"
          :key="item.id"
          class="wbcClassDbDiv mb2"
          draggable="true"
          @dragstart="startDrag(idx, $event)"
          @dragover.prevent
          @drop="drop(idx, $event)"
      >
        <ul class="nth1Child" v-if="item?.title === 'OT'" @click="goClass(item.id)">
          <li>{{ item?.name }}</li>
          <li>{{ item?.count }}</li>
          <li> -</li>
        </ul>
      </div>
    </div>

    <div v-if="!projectBm">
      <template v-for="(nWbcItem, outerIndex) in nonRbcClassList" :key="outerIndex">
        <div class="categories">
          <ul class="categoryNm">
            <li class="mb1 liTitle" v-if="outerIndex === 0">non-WBC</li>
            <li>{{ getCategoryName(nWbcItem) }}</li>
          </ul>
          <ul class="classNm">
            <li class="mb1 liTitle" v-if="outerIndex === 0">.</li>
            <li>
              {{ nWbcItem?.count }}
              <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'"> /{{
                  selectItemsS?.wbcInfo?.maxWbcCount
                }} WBC</span>
            </li>
          </ul>
          <ul class="degree">
            <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
            <li>-</li>
          </ul>
        </div>
      </template>
    </div>
    <div v-if="type !== 'report'" class="beforeAfterBtn">
      <button @click="beforeChang" :class={isBeforeClicked:isBefore}>Before</button>
      <button @click="afterChang(clonedWbcInfoStore)" :class={isBeforeClicked:!isBefore}>After</button>
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
import {computed, defineEmits, defineProps, onMounted, ref, watch} from 'vue';
import {getBarcodeImageUrl} from "@/common/lib/utils/conversionDataUtils";
import {barcodeImgDir} from "@/common/defines/constFile/settings";
import {basicBmClassList, basicWbcArr, WbcInfo} from "@/store/modules/analysis/wbcclassification";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {messages} from "@/common/defines/constFile/constantMessageText";
import Button from "@/components/commonUi/Button.vue";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {getOrderClassApi, putOrderClassApi} from "@/common/api/service/setting/settingApi";
import process from "process";

const props = defineProps(['wbcInfo', 'selectItems', 'originalDb', 'type']);
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const emits = defineEmits();
import moment from 'moment';

const getCategoryName = (category: WbcInfo) => category?.name;
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItemsS = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const pbiaRootDir = computed(() => store.state.commonModule.pbiaRootPath);
const clonedWbcInfoStore = computed(() => store.state.commonModule.clonedWbcInfo);
const barcodeImg = ref('');
const userId = ref('');
const memo = ref('');
const memoModal = ref(false);
const wbcInfoChangeVal = ref<any>([]);
const nonRbcClassList = ref<any>([]);
const titleArr = ['NR', 'GP', 'PA', 'AR', 'MA'];
const toggleLock = ref(false);
const dragIndex = ref(-1);
const dragOffsetY = ref(0);
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const orderClass = ref<any>([]);
const projectBm = ref(false);
const isBefore = ref(false);
const totalCount = ref(0);

onMounted(async () => {
  await getOrderClass();
  memo.value = props.selectItems.memo;
  await afterChang(clonedWbcInfoStore.value);
  barcodeImg.value = getBarcodeImageUrl('barcode_image.jpg', pbiaRootDir.value, props.selectItems.slotId, barcodeImgDir.barcodeDirName);
  projectBm.value = process.env.PROJECT_TYPE === 'bm';
})
// basicWbcArr

watch(userModuleDataGet.value, (newUserId) => {
  userId.value = newUserId.id;
});

watch(() => props.wbcInfo, (newItem) => {
  memo.value = props.selectItems.memo;
  barcodeImg.value = getBarcodeImageUrl('barcode_image.jpg', pbiaRootDir.value, props.selectItems.slotId, barcodeImgDir.barcodeDirName);
  // console.log('classinfo_props.selectItems' , props.selectItems);

});

watch(() => clonedWbcInfoStore.value, (newItem) => {
  afterChang(newItem);
}, {deep: true});

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
  store.dispatch('commonModule/setCommonInfo', {classInfoSort: wbcInfoChangeVal.value});
  event.preventDefault();
  if (dragIndex.value !== -1) {
    const movedItem = wbcInfoChangeVal.value.splice(dragIndex.value, 1)[0];
    wbcInfoChangeVal.value.splice(index, 0, movedItem);
    dragIndex.value = -1;
    updateOriginalDb();
  }
};


const toggleLockEvent = () => {
  toggleLock.value = !toggleLock.value;
}

const commitConfirmed = () => {
  showConfirm.value = true;
  confirmMessage.value = messages.IDS_MSG_CONFIRM_SLIDE;
}

const handleOkConfirm = () => {
  onCommit();
  showConfirm.value = false;
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const onCommit = async () => {
  const localTime = moment.utc("2024-05-15T21:32:00.728Z").local();
  const updatedRuningInfo = props.originalDb
      .filter((item: any) => item.id === props.selectItems.id)
      .map((item: any) => {
        // id가 일치하는 경우 해당 항목의 submit 값을 변경
        const updatedItem = {...item, signedState: 'Submit', signedOfDate: localTime.format(), signedUserId: item.id, submitDate: localTime.format()};
        // updatedItem의 내용을 변경
        updatedItem.submit = 'Submit'; // 예시로 필드를 추가하거나 변경
        return updatedItem;
      });

  await resRunningItem(updatedRuningInfo);
}


const memoChange = async () => {
  const updatedRuningInfo = props.originalDb.map((item: any) => {
    if (item.id === props.selectItems.id) {
      // id가 일치하는 경우 해당 항목의 submit 값을 변경
      // updatedItem의 내용을 변경
      return {...item, memo: memo.value};
    }
    return item;
  });
  await resRunningItem(updatedRuningInfo);
  memoModal.value = false;
}

const memoOpen = () => {
  memo.value = memo.value !== '' ? memo.value : props.selectItems.memo;
  memoModal.value = !memoModal.value;
}

const memoCancel = () => {
  memoModal.value = false;
}

const resRunningItem = async (updatedRuningInfo: any) => {
  try {
    const response = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: updatedRuningInfo
    })
    if (response) {
      showSuccessAlert('success');
      const filteredItems = updatedRuningInfo.filter((item: any) => item.id === selectItemsS.value.id);
      sessionStorage.setItem('selectItems', JSON.stringify(filteredItems[0]));
      sessionStorage.setItem('originalDbData', JSON.stringify(updatedRuningInfo));
      memo.value = filteredItems[0].memo;
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
    const nameA = basicWbcArr.findIndex((item: any) => item.title === a.title);
    const nameB = basicWbcArr.findIndex((item: any) => item.title === b.title);

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });

  return newSortArr;
};

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

const beforeChang = async () => {
  isBefore.value = true;
  await getOrderClass();
  const filteredItems = originalDb.value.filter((item: any) => item.id === selectItemsS.value.id);
  const wbcInfo = filteredItems[0].wbcInfo.wbcInfo[0]
  let wbcArr = orderClass.value.length !== 0 ? orderClass.value : process.env.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  const sortedWbcInfo = sortWbcInfo(wbcInfo, wbcArr);
  wbcInfoChangeVal.value = sortedWbcInfo.filter((item: any) => !titleArr.includes(item.title));
  nonRbcClassList.value = sortedWbcInfo.filter((item: any) => titleArr.includes(item.title));
  console.log(wbcInfoChangeVal.value);
  totalCountSet(wbcInfoChangeVal.value);

}

const afterChang = async (newItem: any) => {
  await getOrderClass();
  isBefore.value = false;
  const filteredItems = originalDb.value.filter((item: any) => item.id === selectItemsS.value.id);
  const wbcInfo = selectItemsS.value.wbcInfoAfter.length !== 0 ? selectItemsS.value.wbcInfoAfter : filteredItems[0].wbcInfo.wbcInfo[0];
  const wbcInfoAfter = newItem.length === 0 ? wbcInfo : newItem;
  let wbcArr = orderClass.value.length !== 0 ? orderClass.value : process.env.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  const sortedWbcInfoAfter = sortWbcInfo(wbcInfoAfter, wbcArr);
  wbcInfoChangeVal.value = sortedWbcInfoAfter.filter((item: any) => !titleArr.includes(item.title));
  nonRbcClassList.value = sortedWbcInfoAfter.filter((item: any) => titleArr.includes(item.title));
  totalCountSet(wbcInfoChangeVal.value);
}
const shouldRenderCategory = (title: string) => {
  // 제외할 클래스들 정의
  const targetArray = getStringArrayBySiteCd(selectItemsS.value?.siteCd, selectItemsS.value.siteCd?.testType);
  return !targetArray.includes(title);
};

const getStringArrayBySiteCd = (siteCd: string, testType: string): string[] => {
  if (!siteCd && siteCd === '') {
    siteCd = '0000';
    testType = '01';
  }
  const arraysBySiteCd: any = { // 0006 -> 삼광
    '0006': {
      includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
      includesStr2: ["NR", "AR", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
    },
  };

  // 지정된 siteCd에 대한 배열을 가져오거나, 기본 배열을 반환
  const arraysForSiteCd = arraysBySiteCd[siteCd] || {
    includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
    includesStr2: ["NR", "AR", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
  };

  // testType에 따라 제외할 부분 정의
  return (testType === '01' || testType === '04') ? arraysForSiteCd.includesStr : arraysForSiteCd.includesStr2;
};

const totalCountSet = (wbcInfoChangeVal: any) => {
  totalCount.value = 0;
  wbcInfoChangeVal.forEach((item: any) => {
    if (projectBm.value) {
      if (item.title !== 'OT') {
        totalCount.value += Number(item.count);
      }
    } else {
      const targetArray = getStringArrayBySiteCd(selectItemsS.value?.siteCd, selectItemsS.value?.testType);


      const titleInArray = targetArray.includes(item.title);
      if (!titleInArray) {
        totalCount.value += Number(item.count);
      }
    }
  });
}

async function updateOriginalDb() {
  // wbcInfo.value를 깊은 복제(clone)하여 새로운 배열을 생성
  let clonedWbcInfo = JSON.parse(JSON.stringify(wbcInfoChangeVal.value));
  let totalCount = 0;
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      if (projectBm.value) {
        if (image.title !== 'OT') {
          totalCount += 1
        }
      } else {
        const targetArray = getStringArrayBySiteCd(selectItemsS.value?.siteCd, selectItemsS.value?.testType);
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
    if (projectBm.value) {
      if (item.title !== 'OT') {
        const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1);  // 소수점 0인경우 정수 표현
        item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
      }
    } else {
      const targetArray = getStringArrayBySiteCd(selectItemsS.value?.siteCd, selectItemsS.value?.testType);
      if (!targetArray.includes(item.title)) {
        const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1); // 소수점 0인경우 정수 표현
        item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
      }
    }

  });

  // wbcInfoAfter 업데이트 및 sessionStorage에 저장
  selectItemsS.value.wbcInfoAfter = clonedWbcInfo;
  sessionStorage.setItem("selectItems", JSON.stringify(selectItemsS.value));
  sessionStorage.setItem("selectItemWbc", JSON.stringify(clonedWbcInfo));

  const sortArr = sortWbcInfo(orderClass.value, wbcInfoChangeVal.value);
  sortArr.forEach((item: any, index: any) => {
    item.orderText = index;
  });

  // originalDb 업데이트
  const filteredItems = originalDb.value.filter((item: any) => item.id === selectItemsS.value.id);
  if (filteredItems.length > 0) {
    filteredItems.forEach((filteredItem: any) => {
      filteredItem.wbcInfoAfter = clonedWbcInfo;
    });
  }
  originalDb.value = filteredItems;
  await putOrderClassApi(sortArr, userModuleDataGet.value.id);
  //updateRunningApi 호출
  await updateRunningApiPost(clonedWbcInfo, originalDb.value);

  store.dispatch('commonModule/setCommonInfo', {classInfoSort: []});
}

async function updateRunningApiPost(wbcInfo: any, originalDb: any) {
  // 러닝 인포 디비에 다시 재저장
  try {
    const response = await updateRunningApi({userId: Number(userId.value), runingInfoDtoItems: originalDb})
    if (response) {

    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
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
</script>