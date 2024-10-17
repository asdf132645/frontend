<template>
  <div>
    <div class="textLeft mb1">
      <button class="crcBtn" @click="openCrcAdd">
        Add
      </button>
      <button class="crcBtn ml1" @click="deleteRow('check')">
        Check Delete
      </button>
    </div>
    <ul class="crcListContentUl">
      <li class="crcListContentHeader">
        <input type="checkbox" @change="selectAll($event)"/>
      </li>

      <!-- 각 crcDataArr의 항목을 출력 -->
      <li v-for="(item, index) in crcDataArr" :key="index" class="crcListContent">
        <span class="crcListSpan">
          <input type="checkbox" v-model="selectedItems" :value="item.id"/>
          <span>{{ item.code }}</span>
          <div class="crcListDiv">
            <button @click="deleteRow('', item.id)"><font-awesome-icon :icon="['fas', 'trash']"/></button>
            <button @click="startEdit(item)"><font-awesome-icon :icon="['fas', 'pen-to-square']"/></button>
          </div>
          <!-- 아이콘 클릭 시 열림/닫힘 토글 -->
          <font-awesome-icon
              :icon="isOpen[index] ? ['fas', 'caret-up'] : ['fas', 'sort-down']"
              :class="isOpen[index] ? ['sortDownBig', 'caret-up'] : ['sortDownBig', 'sort-down']"
              @click="toggleOpen(index)"
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
          <div class="mt1" v-if="item.crcRemark && item.crcRemark.length > 0">
            <span class="smCrcTitle">Remark</span>
            <p v-for="remark in item.crcRemark" :key="remark.id">
              {{ remark.remarkAllContent }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </div>

  <!-- CrcAdd 컴포넌트 -->
  <CrcAdd v-if="isCrcAdd" :crcSetArrP="crcArr" @closeIsCrcAdd="close" @refresh="pageRefresh" :addEditType="addEditType"
          :editItem="editItem"/>
  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :message="confirmMessage"
      type=""
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />

  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :duration="1500"
      position="bottom-right"
  />
</template>

<script setup lang="ts">
import {crcDataGet, updateCrcDataApi, deleteCrcDataApi} from "@/common/api/service/setting/settingApi";
import {ref, onMounted, nextTick} from "vue";
import CrcAdd from "@/views/datebase/commponent/detail/report/component/crcAdd.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";

// Props 받기
const props = defineProps({
  crcArr: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['refresh']);
const showConfirm = ref(false);
const confirmMessage = ref('');
const delType = ref('');
const itemId = ref(0);
const toastMessage = ref('');

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
    showToast('It s been deleted.')
    await loadCrcData(); // 데이터 새로고침
  } catch (error) {
    console.error("Failed to delete item:", error);
  }
};

const deleteRow = (type: string, id?: string | number) => {
  console.log(type)
  if (type === 'check') {
    if (selectedItems.value.length === 0) {
      showToast('Please select the item to delete.')
      return;
    }
    delType.value = 'check';
  } else {
    itemId.value = id;
    delType.value = '';
  }
  showConfirm.value = true;
  confirmMessage.value = 'are you sure you want to delete it?';
}

// 체크된 항목 삭제
const deleteSelectedItems = async () => {
  try {
    // 선택된 항목들을 서버에서 삭제
    await Promise.all(selectedItems.value.map(id => deleteCrcDataApi({id})));
    await loadCrcData(); // 데이터 새로고침
    selectedItems.value = []; // 선택된 항목 초기화
    showToast('It s been deleted.')
  } catch (error) {
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
const toggleOpen = (index: number) => {
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

</script>
