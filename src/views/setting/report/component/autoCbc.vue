<template>
  <div>
    <h2>Auto CBC</h2>

    <!-- 데이터 추가 폼 -->
    <div class="form-container">
      <div v-for="(value, key) in newData" :key="key">
        <label>{{ key }}</label>
        <input v-model="newData[key]" type="text"/>
      </div>
      <button @click="createdAutoCbcData">추가</button>
    </div>

    <!-- 데이터 리스트 -->
    <table class="defaultTable">
      <thead>
      <tr>
        <th>CBC Code</th>
        <th>Conditional</th>
        <th>Mo Type</th>
        <th>Title</th>
        <th>Content</th>
        <th>Sex</th>
        <th>Age</th>
        <th>Age Category</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody
          ref="tbody"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
      >
      <tr
          v-for="(item, index) in findAutoCbcDataArr"
          :key="item.id"
          :data-index="index"
          :class="draggingIndex === index ? 'dragging' : ''"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent
          @drop="onDrop(index)"
      >
        <td><input v-model="item.cbc_code"/></td>
        <td><input v-model="item.conditional"/></td>
        <td><input v-model="item.mo_type"/></td>
        <td><input v-model="item.title"/></td>
        <td><input v-model="item.content"/></td>
        <td><input v-model="item.sex"/></td>
        <td><input v-model="item.age"/></td>
        <td><input v-model="item.ageCategory"/></td>
        <td>
          <button @click="updateAutoCbcData(item)" type="button">수정</button>
          <button @click="deleteAutoCbcData(item.id)">삭제</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <button class="update-all-btn" @click="updateAllAutoCbcData">전체 수정</button>
</template>

<script setup lang="ts">
import {ref, onMounted} from "vue";
import {
  autoCbcCreateApi,
  findAutoCbcApi,
  autoCbcPutApi,
  autoCbcDelApi,
  autoCbcUpdateAllApi
} from "@/common/api/service/autoCbc/autoCbc";
import {getCbcCodeRbcApi} from "@/common/api/service/setting/settingApi";

const findAutoCbcDataArr = ref<any>([]);
const newData = ref({
  cbc_code: "",
  conditional: "",
  mo_type: "",
  title: "",
  content: "",
  sex: "",
  age: "",
  ageCategory: "",
});
const draggingIndex = ref<number | null>(null); // 드래그 중인 항목 인덱스

const loadAutoCbcData = async () => {
  try {
    const [autoCbcResponse, cbcResponse] = await Promise.all([
      findAutoCbcApi(),
      getCbcCodeRbcApi(),
    ]);

    findAutoCbcDataArr.value = autoCbcResponse.data;
    console.log(autoCbcResponse.data)

    // orderIdx를 기준으로 오름차순 정렬
    findAutoCbcDataArr.value.sort((a, b) => parseInt(a.orderIdx) - parseInt(b.orderIdx));

    // 기존 데이터가 없으면 기본값을 생성하여 서버에 저장
    if (!findAutoCbcDataArr.value.length) {
      const cbcArrDefault = cbcResponse?.data
          .filter((item: any) => item.classCd)
          .map((item: any) => ({
            cbc_code: item.classCd,
            conditional: "",
            mo_type: "",
            title: "",
            content: "",
            sex: "",
            age: "",
            ageCategory: "",
            orderIdx: "0", // 기본값으로 설정
          }));

      if (cbcArrDefault.length) {
        await Promise.all(cbcArrDefault.map((data) => autoCbcCreateApi(data)));
        findAutoCbcDataArr.value = await findAutoCbcApi(); // 다시 데이터 로드
        // orderIdx로 정렬
        findAutoCbcDataArr.value.sort((a, b) => parseInt(a.orderIdx) - parseInt(b.orderIdx));
      }
    }
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
};


const createdAutoCbcData = async () => {
  try {
    await autoCbcCreateApi(newData.value);
    Object.keys(newData.value).forEach((key) => (newData.value[key] = ""));
    await loadAutoCbcData();
  } catch (error) {
    console.error("데이터 추가 실패:", error);
  }
};

const updateAutoCbcData = async (item) => {
  console.log(item)
  try {
    await autoCbcPutApi(item);
    await loadAutoCbcData();
  } catch (error) {
    console.error("데이터 수정 실패:", error);
  }
};

const updateAllAutoCbcData = async () => {
  try {
    // 배열 전체를 서버에 한 번에 업데이트
    // 순서대로 update 하도록 orderIdx를 설정
    findAutoCbcDataArr.value.forEach((item, idx) => {
      item.orderIdx = (idx + 1).toString(); // 순서를 문자열로 변환하여 설정
    });

    await autoCbcUpdateAllApi(findAutoCbcDataArr.value);
    await loadAutoCbcData(); // 데이터 갱신
  } catch (error) {
    console.error("전체 데이터 수정 실패:", error);
  }
};



const deleteAutoCbcData = async (id) => {
  try {
    await autoCbcDelApi({id});
    await loadAutoCbcData();
  } catch (error) {
    console.error("데이터 삭제 실패:", error);
  }
};

// 드래그 관련 이벤트
const startDrag = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === "TR") {
    draggingIndex.value = Number(target.dataset.index);
  }
};

const onDragStart = (index: number, event: DragEvent) => {
  draggingIndex.value = index;
};

const onDrag = (event: MouseEvent) => {
//
};

const endDrag = (event: MouseEvent) => {
  draggingIndex.value = null;
};

const onDrop = async (index: number) => {
  if (draggingIndex.value === null || draggingIndex.value === index) return;

  // 항목 순서 변경
  const movedItem = findAutoCbcDataArr.value.splice(draggingIndex.value, 1)[0];
  findAutoCbcDataArr.value.splice(index, 0, movedItem);

  // 순서대로 orderIdx 업데이트
  findAutoCbcDataArr.value.forEach((item, idx) => {
    item.orderIdx = (idx + 1).toString(); // 새로운 순서를 문자열로 저장
  });

  // 변경된 배열을 서버에 저장
  try {
    await autoCbcUpdateAllApi(findAutoCbcDataArr.value); // 변경된 배열 전체를 넘김
  } catch (error) {
    console.error("순서 변경 실패:", error);
  }
};




onMounted(async () => {
  await loadAutoCbcData();
});
</script>

