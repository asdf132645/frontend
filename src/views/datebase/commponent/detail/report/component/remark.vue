<template>
  <div class="remarkDiv">
    <div>
      <span>Search Type</span>
      <select v-model="searchType">
        <option>Code</option>
        <option>Content</option>
      </select>
    </div>
    <table>
      <thead>
      <tr>
        <th>선택</th>
        <th>Code</th>
        <th>Content</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, idx) in remarkArr" :key="idx">
        <td>
          <input type="checkbox" v-model="selectedItems" :value="item.id" />
        </td>

        <!-- 편집 모드인지 확인 -->
        <td v-if="editIndex === idx">
          <input v-model="editedCode" type="text" />
        </td>
        <td v-else>{{ item?.code }}</td>

        <td v-if="editIndex === idx">
          <input v-model="editedContent" type="text" />
        </td>
        <td v-else>{{ item?.remarkAllContent }}</td>

        <td v-if="editIndex === idx">
          <!-- Save 버튼 -->
          <button @click="saveEdit(item.id)">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </td>
        <td v-else>
          <!-- Edit 버튼 -->
          <button @click="startEdit(idx, item)">Edit</button>
          <button @click="deleteRemark(item.id)">
            <font-awesome-icon :icon="['fas', 'trash']" />
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <div>
      <input v-model="newRemarkCode" type="text" placeholder="remark code" />
      <input v-model="newRemarkContent" type="text" placeholder="content" />
      <button @click="addRemark">Add</button>
    </div>

    <div>
      <button @click="okSelect">OK</button>
      <button @click="cancelSelect">CANCEL</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, defineEmits } from "vue";
import {
  crcRemarkGet,
  createCrcRemarkApi,
  deleteCrcRemarkApi,
  updateCrcRemarkApi,
} from "@/common/api/service/setting/settingApi";

// 이벤트 정의 (부모에게 이벤트를 전달)
const emit = defineEmits(["cancel"]);

const remarkArr = ref<any>([]);
const selectedItems = ref<number[]>([]);
const newRemarkCode = ref("");
const newRemarkContent = ref("");
const searchType = ref("Code");

// 편집 상태 관리용 변수
const editIndex = ref<number | null>(null); // 편집 중인 항목의 인덱스
const editedCode = ref(""); // 편집 중인 Remark 코드
const editedContent = ref(""); // 편집 중인 Remark 내용

onMounted(async () => {
  await nextTick();
  await loadRemarks();
});

const loadRemarks = async () => {
  const response = await crcRemarkGet();
  remarkArr.value = response?.data || [];
};

// Remark 추가
const addRemark = async () => {
  if (!newRemarkCode.value || !newRemarkContent.value) {
    alert("Remark code와 content를 입력해주세요.");
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
    console.error("Failed to add remark:", error);
  }
};

// Remark 삭제
const deleteRemark = async (id: number) => {
  try {
    await deleteCrcRemarkApi({id});
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

// 편집 저장 (수정된 내용 서버에 전송)
const saveEdit = async (id: number) => {
  if (!editedCode.value || !editedContent.value) {
    alert("코드와 내용을 입력해주세요.");
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
    editIndex.value = null; // 편집 모드 해제
    await loadRemarks(); // 수정 후 목록 새로고침
  } catch (error) {
    console.error("Failed to update remark:", error);
  }
};

// 편집 취소
const cancelEdit = () => {
  editIndex.value = null; // 편집 모드 해제
};

// OK 버튼 클릭 시 처리
const okSelect = async () => {
  emit("listUpdated", remarkArr.value); // 현재 remarkArr를 부모에게 전달
};

// CANCEL 버튼 클릭 시 부모에게 cancel 이벤트 emit
const cancelSelect = () => {
  emit("cancel");
};
</script>
