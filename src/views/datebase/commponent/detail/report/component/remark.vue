<template>
  <div class="crcPopUpDiv remark">
    <div class="headerRemark topLine">
      <span>Search Type</span>
      <select v-model="searchType">
        <option value="Code">Code</option>
        <option value="Content">Content</option>
      </select>
      <input type="text" v-model="searchRemark"/>
      <!-- Search 버튼에 searchRemark 함수 연결 -->
      <button type="button" @click="searchRemarkData">Search</button>
    </div>
    <div class="remarkBottomBtnGroup mb1">
      <input v-model="newRemarkCode" type="text" placeholder="remark code" class="firstInput"/>
      <input v-model="newRemarkContent" type="text" placeholder="content"/>
      <button @click="addRemark" class="crcDefaultBtn ml1">Add</button>
    </div>
    <table class="remarkDefaultTable">
      <thead>
      <tr>
        <th></th>
        <th>Code</th>
        <th>Content</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, idx) in remarkArr" :key="idx">
        <td>
          <input type="checkbox" v-model="selectedItems" :value="item.id"/>
        </td>

        <!-- 편집 모드인지 확인 -->
        <td v-if="editIndex === idx">
          <input v-model="editedCode" type="text"/>
        </td>
        <td v-else>{{ item?.code }}</td>

        <td v-if="editIndex === idx">
          <input v-model="editedContent" type="text"/>
        </td>
        <td v-else>{{ item?.remarkAllContent }}</td>

        <td v-if="editIndex === idx">
          <!-- Save 버튼 -->
          <button class="crcDefaultBtn" @click="saveEdit(item.id)">Save</button>
          <button class="crcDefaultBtn ml1" @click="cancelEdit">Cancel</button>
        </td>
        <td v-else>
          <!-- Edit 버튼 -->
          <button @click="startEdit(idx, item)">
            <font-awesome-icon :icon="['fas', 'pen-to-square']"/>
          </button>
          <button @click="deleteRemark(item.id)" class="ml1">
            <font-awesome-icon :icon="['fas', 'trash']"/>
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <div class="mt2">
      <button class="crcDefaultBtn" @click="okSelect">OK</button>
      <button  @click="cancelSelect" class="ml1 crcDefaultBtn">CANCEL</button>
    </div>
  </div>
  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :duration="1500"
      position="bottom-right"
  />
</template>


<script setup lang="ts">
import {nextTick, onMounted, ref, defineEmits} from "vue";
import {
  crcRemarkGet,
  createCrcRemarkApi,
  deleteCrcRemarkApi,
  updateCrcRemarkApi,
  crcSearchGet // 서치 API 추가
} from "@/common/api/service/setting/settingApi";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";

const emit = defineEmits(["cancel", "listUpdated"]);
const toastMessage = ref('');
const remarkArr = ref<any>([]);
const selectedItems = ref<number[]>([]);
const newRemarkCode = ref("");
const newRemarkContent = ref("");
const searchType = ref("Code");

// 편집 상태 관리용 변수
const editIndex = ref<number | null>(null);
const editedCode = ref("");
const editedContent = ref("");
const searchRemark = ref(''); // 검색 필드

onMounted(async () => {
  await nextTick();
  await loadRemarks();
});

// 서버로부터 Remark 데이터 로드
const loadRemarks = async () => {
  const response = await crcRemarkGet();
  remarkArr.value = response?.data || [];
  showToast("Search completed.");
};

// 검색 기능
const searchRemarkData = async () => {
  try {
    if (searchRemark.value === '') {
      await loadRemarks();
      return
    }
    let searchParam: any = {};
    if (searchType.value === "Code") {
      searchParam.code = searchRemark.value;
    } else if (searchType.value === "Content") {
      searchParam.remarkAllContent = searchRemark.value;
    }

    const response = await crcSearchGet(searchParam);
    remarkArr.value = response?.data || [];

    if (remarkArr.value.length === 0) {
      showToast("No results found.");
    } else {
      showToast("Search completed.");
    }
  } catch (error) {
    showToast('Search failed.');
    console.error("Error during search:", error);
  }
};

// Remark 추가
const addRemark = async () => {
  if (!newRemarkCode.value || !newRemarkContent.value) {
    showToast("Remark code와 content를 입력해주세요.");
    return;
  }

  try {
    await createCrcRemarkApi({
      code: newRemarkCode.value,
      remarkAllContent: newRemarkContent.value,
    });
    newRemarkCode.value = "";
    newRemarkContent.value = "";
    await loadRemarks();
  } catch (error) {
    showToast('Failed to add remark')
  }
};

// Remark 삭제
const deleteRemark = async (id: number) => {
  try {
    await deleteCrcRemarkApi({id});
    showToast('delete Success')
    await loadRemarks();
  } catch (error) {
    console.error("Failed to delete remark:", error);
  }
};

// 편집 시작
const startEdit = (index: number, item: any) => {
  editIndex.value = index;
  editedCode.value = item.code;
  editedContent.value = item.remarkAllContent;
};

// 편집 저장
const saveEdit = async (id: number) => {
  if (!editedCode.value || !editedContent.value) {
    showToast("코드와 내용을 입력해주세요.");
    return;
  }

  try {
    await updateCrcRemarkApi([
      {
        id: id,
        code: editedCode.value,
        remarkAllContent: editedContent.value,
      },
    ]);
    editIndex.value = null;
    await loadRemarks();
    showToast('save Success')
  } catch (error) {
    console.error("Failed to update remark:", error);
  }
};

// 편집 취소
const cancelEdit = () => {
  editIndex.value = null;
};

// OK 버튼 클릭 시 처리
const okSelect = () => {
  const selectedRemarks = remarkArr.value.filter(item => selectedItems.value.includes(item.id));
  showToast('Remark Add Success');
  emit("listUpdated", selectedRemarks);
};

// CANCEL 버튼 클릭 시 처리
const cancelSelect = () => {
  emit("cancel");
};

// 토스트 메시지 표시
const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500);
};
</script>

