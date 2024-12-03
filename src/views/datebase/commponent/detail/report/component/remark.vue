<template>
  <div class="crcPopUpDiv remark">
    <div style="position: relative; height: 100%; width: 100%">
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

      <table class="remarkDefaultTable">
        <colgroup>
          <col width="5%"/>
          <col width="20%"/>
          <col width="*"/>
          <col width="20%"/>
        </colgroup>
        <thead>
        <tr>
          <th></th>
          <th>Name</th>
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
          <td v-else class="text-left">{{ item?.code }}</td>

          <td v-if="editIndex === idx">
            <textarea class="remarkTextArea table" v-model="editedContent" maxlength="1000" />
          </td>
          <td v-else class="text-left" v-html="item?.remarkAllContent"></td>

          <td v-if="editIndex === idx">
            <!-- Save 버튼 -->
            <button class="crcDefaultBtn" @click="saveEdit(item.id)">Save</button>
            <button class="crcDefaultBtn ml10" @click="cancelEdit">Cancel</button>
          </td>
          <td v-else>
            <!-- Edit 버튼 -->
            <button @click="startEdit(idx, item)">
              <font-awesome-icon :icon="['fas', 'pen-to-square']"/>
            </button>
            <button @click="deleteRemark(item.id)" class="ml10">
              <font-awesome-icon :icon="['fas', 'trash']"/>
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <div class="mt20 remarkBottomFix">
        <p class="text-left fs10 fw-bold mb10">Add New {{ typeToText(type) }}</p>
        <div class="remarkBottomBtnGroup mb10">
          <div class="flex-justify-between">
            <input v-model="newRemarkCode" type="text" placeholder="code" class="firstInput"/>
            <button @click="addRemark" class="crcDefaultBtn ml10">Add</button>
          </div>
          <textarea v-model="newRemarkContent" placeholder="content" class="remarkTextArea" maxlength="1000"></textarea>
        </div>
        <div>
          <button class="crcDefaultBtn" @click="okSelect">OK</button>
          <button @click="cancelSelect" class="ml10 crcDefaultBtn">CANCEL</button>
        </div>

      </div>
    </div>
  </div>
  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
      position="bottom-right"
  />
  <PassWordCheck v-if="passLayout" :crcPassWord="crcPassWordVal" @returnPassWordCheck="returnPassWordCheck" @passWordClose="passWordClose"/>
</template>


<script setup lang="ts">
import {ref, defineEmits, onBeforeMount, nextTick, computed} from "vue";
import {
  crcRemarkGet,
  createCrcRemarkApi,
  deleteCrcRemarkApi,
  updateCrcRemarkApi,
  crcSearchGet,
  crcRecoGet,
  crcRecoSearchGet,
  createCrcRecoApi,
  deleteCrcRecoApi,
  updateCrcRecoApi,
  crcCommentGet, crcCommentSearchGet, createCrcCommentApi, deleteCrcCommentApi, updateCrcCommentApi // 서치 API 추가
} from "@/common/api/service/setting/settingApi";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import PassWordCheck from "@/components/commonUi/PassWordCheck.vue";
import {MESSAGES} from "@/common/defines/constants/constantMessageText";
import { useStore } from "vuex";

const props = defineProps({
  crcDefaultMode: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  crcPassWord: {
    type: String,
  }
});

const store = useStore();
const emit = defineEmits(['cancel', 'listUpdated']);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);
const remarkArr = ref<any>([]);
const selectedItems = ref<number[]>([]);
const newRemarkCode = ref("");
const newRemarkContent = ref("");
const searchType = ref("Code");
const editIndex = ref<number | null>(null);
const editedCode = ref("");
const editedContent = ref("");
const searchRemark = ref(''); // 검색 필드
const crcDefaultModeVal = ref(false);
const crcPassWordVal = ref('');
const passWordPass = ref(false);
const passLayout = ref(false);
const siteCd = computed(() => store.state.commonModule.siteCd);

onBeforeMount(async () => {
  crcDefaultModeVal.value = props.crcDefaultMode;
  crcPassWordVal.value = props.crcPassWord || '';
  passWordPass.value = false;
  await loadRemarks('mounted');
})
// 서버로부터 Remark 데이터 로드
const loadRemarks = async (type?: string) => {
  let response: any = [];
  if (props.type === 'remark') {
    response = await crcRemarkGet();
  } else if (props.type === 'comment') {
    response = await crcCommentGet();
  } else {
    response = await crcRecoGet();
  }

  remarkArr.value = response?.data || [];
  if (type !== 'mounted') {
    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    showToast("Search completed.");
  }
};
const passWordClose= () => {
  passLayout.value = false;
}

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

    // const response = await crcSearchGet(searchParam);
    let response: any = [];
    if (props.type === 'remark') {
      response = await crcSearchGet(searchParam);
    } else if (props.type === 'comment') {
      response = await crcCommentSearchGet(searchParam);
    } else {
      response = await crcRecoSearchGet(searchParam);
    }
    remarkArr.value = response?.data || [];

    if (remarkArr.value.length === 0) {
      toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
      showToast("No results found.");
    } else {
      toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
      showToast("Search completed.");
    }
  } catch (error) {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    showToast('Search failed.');
    console.error("Error during search:", error);
  }
};


// Remark 추가
const addRemark = async () => {
  if (!newRemarkCode.value || !newRemarkContent.value) {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    showToast("code와 content를 입력해주세요.");
    return;
  }

  try {
    if (props.type === 'remark') {
      await createCrcRemarkApi({
        code: newRemarkCode.value,
        remarkAllContent: newRemarkContent.value.replace(/(?:\r\n|\r|\n)/g, '<br>'),
      });
    } else if (props.type === 'comment') {
      await createCrcCommentApi({
        code: newRemarkCode.value,
        remarkAllContent: newRemarkContent.value.replace(/(?:\r\n|\r|\n)/g, '<br>'),
      });
    } else {
      await createCrcRecoApi({
        code: newRemarkCode.value,
        remarkAllContent: newRemarkContent.value.replace(/(?:\r\n|\r|\n)/g, '<br>'),
      });
    }

    newRemarkCode.value = "";
    newRemarkContent.value = "";
    await loadRemarks();
    await scrollToBottom();
  } catch (error) {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    showToast('Failed to add remark')
  }
};

// Remark 삭제
const deleteRemark = async (id: number) => {

  try {
    if (props.type === 'remark') {
      await deleteCrcRemarkApi({id});
    } else if (props.type === 'comment') {
      await deleteCrcCommentApi({id});
    } else {
      await deleteCrcRecoApi({id});
    }
    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    showToast('delete Success')
    await loadRemarks();
  } catch (error) {
    console.error("Failed to delete remark:", error);
  }
};

const scrollToBottom = async () => {
  await nextTick();
  const scrollContainer = document.querySelector('.crcPopUpDiv.remark');
  if (scrollContainer) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }
}

// 편집 시작
const startEdit = (index: number, item: any) => {
  editIndex.value = index;
  editedCode.value = item.code;
  editedContent.value = item.remarkAllContent.replaceAll('<br>', '\r\n');
};

// 편집 저장
const saveEdit = async (id: number) => {
  if (!editedCode.value || !editedContent.value) {
    toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
    showToast("코드와 내용을 입력해주세요.");
    return;
  }

  try {

    if (props.type === 'remark') {
      await updateCrcRemarkApi([
        {
          id: id,
          code: editedCode.value,
          remarkAllContent: editedContent.value.replace(/(?:\r\n|\r|\n)/g, '<br>'),
        },
      ]);
    } else if (props.type === 'comment') {
      await updateCrcCommentApi([
        {
          id: id,
          code: editedCode.value,
          remarkAllContent: editedContent.value.replace(/(?:\r\n|\r|\n)/g, '<br>'),
        },
      ]);
    } else {
      await updateCrcRecoApi([
        {
          id: id,
          code: editedCode.value,
          remarkAllContent: editedContent.value.replace(/(?:\r\n|\r|\n)/g, '<br>'),
        },
      ]);
    }
    editIndex.value = null;
    await loadRemarks();
    toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
    showToast('save Success')
  } catch (error) {
    console.error("Failed to update remark:", error);
  }
};

// 편집 취소
const cancelEdit = () => {
  editIndex.value = null;
};

const typeToText = (type: string) => {
  switch (type) {
    case 'reco':
      return 'Recommendation';
    case 'comment':
      return 'Comment';
    case 'remark':
      return 'Remark';
  }
}

// OK 버튼 클릭 시 처리
const okSelect = () => {
  const selectedRemarks = remarkArr.value.filter(item => selectedItems.value.includes(item.id));

  toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
  showToast('Remark Add Success');
  emit("listUpdated", selectedRemarks, props.type);
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
  }, 2000);
};

</script>
