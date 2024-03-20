<template>
  <img v-if="type !== 'report'"
       :src="getBarcodeImageUrl('barcode_image.jpg',pbiaRootPath, selectItems.slotId, barcodeImgDir.barcodeDirName)"/>
  <div class="mt2 mb2">
    <h3 class="wbcClassInfoLeft">WBC Classification</h3>
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
      <ul class="nth1Child" v-if="idx === 0">
        <li>Class</li>
        <li>Count</li>
        <li>%</li>
      </ul>
      <ul class="nth1Child">
        <li>{{ item?.name }}</li>
        <li>{{ item?.count }}</li>
        <li> {{ item?.percent || '-' }}</li>
      </ul>
    </div>
    <template v-for="(nWbcItem, outerIndex) in nonRbcClassList" :key="outerIndex">
      <div class="categories">
        <ul class="categoryNm">
          <li class="mb1 liTitle" v-if="outerIndex === 0">non-WBC</li>
          <li>{{ getCategoryName(nWbcItem) }}</li>
        </ul>
        <ul class="classNm">
          <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
          <li>
            {{ nWbcItem?.count }}
            <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'"> /{{ selectItems?.wbcInfo?.maxWbcCount }} WBC</span>
          </li>
        </ul>
        <ul class="degree">
          <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
          <li>-</li>
        </ul>
      </div>
    </template>
    <div v-if="type !== 'report'" class="beforeAfterBtn">
      <button @click="beforeChang">Before</button>
      <button @click="afterChang">After</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, ref, watch} from 'vue';
import {getBarcodeImageUrl} from "@/common/lib/utils/conversionDataUtils";
import {barcodeImgDir} from "@/common/defines/constFile/settings";
import {WbcInfo} from "@/store/modules/analysis/wbcclassification";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {messages} from "@/common/defines/constFile/constant";
import Button from "@/components/commonUi/Button.vue";

const props = defineProps(['wbcInfo', 'selectItems', 'originalDb', 'type']);
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const getCategoryName = (category: WbcInfo) => category?.name;
const selectItemsData = sessionStorage.getItem("selectItems");
const selectItems = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const pbiaRootPath = sessionStorage.getItem("pbiaRootPath");
const userId = ref('');
const memo = ref('');
const memoModal = ref(false);
const wbcInfoChangeVal = ref<any>([]);
const nonRbcClassList = ref<any>([]);
const titleArr = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM', 'LR', 'LA', 'NS', 'NB'];
const toggleLock = ref(false);
const dragIndex = ref(-1);
const dragOffsetY = ref(0);
const originalDbData = sessionStorage.getItem("originalDbData");
const originalDb = ref(originalDbData ? JSON.parse(originalDbData) : null);

onMounted(() => {
  memo.value = props.selectItems.memo;
  nonRbcClassList.value = props.selectItems?.wbcInfo?.nonRbcClassList;
})


watch(userModuleDataGet.value, (newUserId) => {
  userId.value = newUserId.id;
});

watch(() => props.wbcInfo, (newItem) => {
  wbcInfoChangeVal.value = newItem;
});

const startDrag = (index: any, event: any) => {
  dragIndex.value = index;
  dragOffsetY.value = event.clientY - event.target.getBoundingClientRect().top;
};

const drop = (index: any, event: any) => {
  if(!toggleLock.value){
    return;
  }
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
  const userConfirmed = confirm(messages.IDS_MSG_CONFIRM_SLIDE);

  if (userConfirmed) {
    onCommit()
  }
}

const onCommit = async () => {
  const updatedRuningInfo = props.originalDb
      .filter((item: any) => item.id === props.selectItems.id)
      .map((item: any) => {
        // id가 일치하는 경우 해당 항목의 submit 값을 변경
        const updatedItem = {...item, signedState: 'Submit', signedOfDate: new Date(), signedUserId: item.id};
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
      alert('success');
      const filteredItems = updatedRuningInfo.filter((item: any) => item.id === selectItems.value.id);
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

const beforeChang = () => {
  wbcInfoChangeVal.value = props.selectItems?.wbcInfo.wbcInfo[0];
  nonRbcClassList.value = props.selectItems?.wbcInfo?.nonRbcClassList;
}

const afterChang = () => {
  wbcInfoChangeVal.value = props.selectItems.wbcInfoAfter;
  nonRbcClassList.value = props.selectItems?.wbcInfoAfter.filter((item: any) => titleArr.includes(item.title));
}

async function updateOriginalDb() {
  // wbcInfo.value를 깊은 복제(clone)하여 새로운 배열을 생성
  let clonedWbcInfo = JSON.parse(JSON.stringify(wbcInfoChangeVal.value));

  // 각 이미지 객체에서 width와 height 속성은 저장 안해도되는 부분이라서 디비에 저장 안함
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      delete image.width;
      delete image.height;
      delete image.filter;
      delete image.changed;
    });
    item.percent = selectItems.value.wbcInfo.totalCount && selectItems.value.wbcInfo.totalCount !== '0' ? ((Number(item.count) / Number(selectItems.value.wbcInfo.totalCount)) * 100).toFixed(0) : '0'
  });

  // wbcInfoAfter 업데이트 및 sessionStorage에 저장
  selectItems.value.wbcInfoAfter = clonedWbcInfo;
  sessionStorage.setItem("selectItems", JSON.stringify(selectItems.value));
  sessionStorage.setItem("selectItemWbc", JSON.stringify(clonedWbcInfo));

  // originalDb 업데이트
  const filteredItems = originalDb.value.filter((item: any) => item.id === selectItems.value.id);
  if (filteredItems.length > 0) {
    filteredItems.forEach((filteredItem: any) => {
      filteredItem.wbcInfoAfter = clonedWbcInfo;
    });
  }
  originalDb.value = filteredItems;

  //updateRunningApi 호출
  await updateRunningApiPost(clonedWbcInfo, originalDb.value);
}

async function updateRunningApiPost(wbcInfo: any, originalDb: any) {
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

</script>