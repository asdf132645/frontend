<template>
  <div class="tab-content crcDiv reportCrcDiv">
    <div class="text-right mb10">
      <Button @click="deleteRow('check')" :icon="['fas', 'trash']"></Button>
    </div>
    <ul class="crcListContentUl">
      <li class="crcListContentHeader">
        <div>
          <input type="checkbox" @change="selectAll($event)"/>
          <span class="ml5">Code</span>
        </div>
        <div>
          <span>Action</span>
          <span></span>
        </div>
      </li>
      <!-- 각 crcDataArr의 항목을 출력 -->
      <li v-for="(item, index) in crcDataArr" :key="index" class="crcListContent">
        <span class="crcListSpan" @click="toggleOpen(index, item.id)">
            <input type="checkbox" v-model="selectedItems" :value="item.id" @click.stop/>
            <span>{{ item.code }}</span>
            <div class="crcListDiv">
                <button @click.stop="startEdit(item)" class="hoverSizeAction">
                    <font-awesome-icon :icon="['fas', 'pen-to-square']"/>
                </button>
            </div>
          <!-- 아이콘 클릭 시 열림/닫힘 토글 -->
            <font-awesome-icon
                :icon="isOpen[index] ? ['fas', 'caret-up'] : ['fas', 'sort-down']"
                :class="isOpen[index] ? ['sortDownBig', 'caret-up'] : ['sortDownBig', 'sort-down']"
            />
        </span>


        <!-- 아래로 열림/닫힘 부분 -->
        <div v-if="isOpen[index]" class="crcListBottomLine">
          <!-- RBC Morphology 출력 -->
          <div v-if="item.crcContent.rbc && item.crcContent.rbc.length > 0" class="crcListRow">
            <span class="smCrcTitle">RBC Morphology</span>
            <p v-for="rbc in item.crcContent.rbc" :key="rbc.crcTitle">
              {{ rbc.crcTitle }}: {{ rbc.crcContent }}
            </p>
          </div>

          <!-- WBC Morphology 출력 -->
          <div v-if="item.crcContent.wbc && item.crcContent.wbc.length > 0" class="crcListRow">
            <span class="smCrcTitle">WBC Morphology</span>
            <p v-for="wbc in item.crcContent.wbc" :key="wbc.crcTitle">
              {{ wbc.crcTitle }}: {{ wbc.crcContent }}
            </p>
          </div>

          <!-- PLT Morphology 출력 -->
          <div v-if="item.crcContent.plt && item.crcContent.plt.length > 0" class="crcListRow">
            <span class="smCrcTitle">PLT Morphology</span>
            <p v-for="plt in item.crcContent.plt" :key="plt.crcTitle">
              {{ plt.crcTitle }}: {{ plt.crcContent }}
            </p>
          </div>

          <!-- Remark 출력 -->
          <div class="mt10 remarkDetailDiv" v-if="item.crcRemark && item.crcRemark.length > 0 && crcVisibleTitle.remark">
            <span class="smCrcTitle">{{ setCrcTitles(siteCd, crcRemarkCount[0]?.name) }}</span>
            <pre class="pre-wrap" v-for="remark in item.crcRemark" :key="remark.id"
                 v-html="remark?.remarkAllContent"></pre>
          </div>
          <div class="mt10 remarkDetailDiv" v-if="item.crcComment && item.crcComment.length > 0 && crcVisibleTitle.comment">
            <span class="smCrcTitle">{{ setCrcTitles(siteCd, crcRemarkCount[1]?.name) }}</span>
            <pre class="pre-wrap" v-for="remark in item.crcComment" :key="remark.id"
                 v-html="remark?.remarkAllContent"></pre>
          </div>
          <div class="mt10 remarkDetailDiv"
               v-if="item.crcRecommendation && item.crcRecommendation.length > 0 && crcVisibleTitle.recommendation">
            <span class="smCrcTitle">{{ setCrcTitles(siteCd, crcRemarkCount[2]?.name) }}</span>
            <pre class="pre-wrap" v-for="remark in item.crcRecommendation" :key="remark.id"
                 v-html="remark?.remarkAllContent"></pre>
          </div>
        </div>
      </li>
    </ul>
  </div>

  <!-- CrcAdd 컴포넌트 -->
  <Teleport to="body">
    <div class="reportDivAdd">
      <CrcAdd v-if="isCrcAdd" :crcSetArrP="crcArr" @closeIsCrcAdd="close" @refresh="pageRefresh"
              :addEditType="addEditType"
              :editItem="editItem"/>
    </div>
  </Teleport>
  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :message="confirmMessage"
      type="delete"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />

  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :duration="1500"
  />
  <PassWordCheck v-if="passLayout" :crcPassWord="crcPassWordVal" @returnPassWordCheck="returnPassWordCheck"
                 @passWordClose="passWordClose"/>

</template>

<script setup lang="ts">
import {crcDataGet, updateCrcDataApi, deleteCrcDataApi} from "@/common/api/service/setting/settingApi";
import {ref, onMounted, nextTick, onBeforeMount, computed, defineExpose } from "vue";
import CrcAdd from "@/views/datebase/commponent/detail/report/component/crcAdd.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import PassWordCheck from "@/components/commonUi/PassWordCheck.vue";
import {MESSAGES} from "@/common/defines/constants/constantMessageText";
import {setCrcTitles} from "../../../../../../common/helpers/crc/crcContent";
import {useStore} from "vuex";
import Button from "@/components/commonUi/Button.vue";

// Props 받기
const props = defineProps({
  crcArr: {
    type: Array,
    required: true,
  },
  crcPassWord: {
    type: String,
  },
  crcRemarkCount: {
    type: Array,
  }
});

const store = useStore();
const emit = defineEmits(['refresh']);
const showConfirm = ref(false);
const confirmMessage = ref('');
const delType = ref('');
const itemId = ref(0);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);
const siteCd = computed(() => store.state.commonModule.siteCd);

// CrcAdd 열기/닫기 상태
const isCrcAdd = ref(false);
// 데이터 배열 초기화
const crcDataArr = ref<any>([]);
// 선택된 항목 관리
const selectedItems = ref<number[]>([]);
// 항목별 열림/닫힘 상태 관리
const isOpen = ref<boolean[]>([]);
// 편집 상태 관리
const editItem = ref<any>(null); // 현재 편집 중인 항목
const addEditType = ref('');
const crcPassWordVal = ref('');
const passWordPass = ref(false);
const passLayout = ref(false);
const crcVisibleTitle = ref({
  remark: true,
  comment: true,
  recommendation: true,
})

onBeforeMount(async () => {
  crcPassWordVal.value = props.crcPassWord || '';
  setRemarkTitleVisible();
})

// 컴포넌트가 마운트될 때 API 호출 후 데이터 설정
onMounted(async () => {
  await nextTick();
  await loadCrcData();
});

const hideConfirm = async () => {
  showConfirm.value = false;
}

const handleOkConfirm = async () => {
  if (delType.value === 'check') {
    await deleteSelectedItems();
  } else {
    await deleteCrcItem(itemId.value);
  }
  showConfirm.value = false;
}

// CRC 데이터를 로드하는 함수
const loadCrcData = async () => {
  const data = (await crcDataGet()).data;
  crcDataArr.value = data;
  // 항목 개수만큼 열림/닫힘 상태 초기화
  isOpen.value = new Array(data.length).fill(false);
};
const returnPassWordCheck = (val: boolean) => {
  if (val) {
    passWordPass.value = true;
    // 패스 체크 모달 닫기
    passLayout.value = false;
    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    showToast("Admin verification is complete. Please click the button again.");
  } else {
    passWordPass.value = false;
    // 패스 체크 모달 닫기
    passLayout.value = false;
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    showToast("The administrator password is incorrect.");
  }
}
const passWordClose = () => {
  passLayout.value = false;
}
// CrcAdd 열기 함수
const openCrcAdd = () => {
  isCrcAdd.value = true;
  addEditType.value = 'add';
};



// CrcAdd 닫기 함수
const close = () => {
  isCrcAdd.value = false;
};

// 항목 수정 시작
const startEdit = (item: any) => {
  isCrcAdd.value = true;
  addEditType.value = 'edit';
  editItem.value = {...item}; // 수정할 항목의 데이터를 editItem에 저장
};


// 항목 삭제 함수 (단일 항목 삭제)
const deleteCrcItem = async (id: number) => {
  try {
    await deleteCrcDataApi({id}); // 서버로 삭제 요청
    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    showToast('It s been deleted.')
    await loadCrcData(); // 데이터 새로고침
  } catch (error) {
    console.error("Failed to delete item:", error);
  }
};

const deleteRow = (type: string, id?: string | number) => {
  if (type === 'check') {
    if (selectedItems.value.length === 0) {
      toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
      showToast('Please select the item to delete.')
      return;
    }
    delType.value = 'check';
  } else {
    itemId.value = id;
    delType.value = '';
  }
  showConfirm.value = true;
  confirmMessage.value = 'Are you sure you want to delete it?';
}

// 체크된 항목 삭제
const deleteSelectedItems = async () => {
  try {
    // 선택된 항목들을 서버에서 삭제
    await Promise.all(selectedItems.value.map(id => deleteCrcDataApi({id})));
    await loadCrcData(); // 데이터 새로고침
    selectedItems.value = []; // 선택된 항목 초기화
    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    showToast('It s been deleted.')
  } catch (error) {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    showToast('Failed to delete selected items')
    // console.error("Failed to delete selected items:", error);
  }
};

// 전체 선택/해제
const selectAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  if (checked) {
    selectedItems.value = crcDataArr.value.map(item => item.id);
  } else {
    selectedItems.value = [];
  }
};

// 열림/닫힘 토글 함수
const toggleOpen = (index: number, id) => {
  const selectedIndex = selectedItems.value.indexOf(id);
  if (selectedIndex !== -1) {
    selectedItems.value.splice(selectedIndex, 1);
  } else {
    selectedItems.value.push(id);
  }

  isOpen.value[index] = !isOpen.value[index];
};

const pageRefresh = () => {
  emit('refresh');
  loadCrcData();
}

const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};

const setRemarkTitleVisible = () => {
  if (!props.crcRemarkCount) {
    return;
  }

  const remarkMap = props.crcRemarkCount.reduce((acc: Record<string, boolean>, item: any) => {
    if (["remark", "Comment", "Recommendation"].includes(item.name)) {
      acc[item.name.toLowerCase()] = item.checked;
    }
    return acc;
  }, {});

  crcVisibleTitle.value.remark = remarkMap?.remark || false;
  crcVisibleTitle.value.comment = remarkMap?.comment || false;
  crcVisibleTitle.value.recommendation = remarkMap?.recommendation || false;
}

defineExpose({
  openCrcAdd,
});
</script>
