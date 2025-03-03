<template>
  <button class="auto-cbc-update-all-button" @click="updateAllAutoCbcData">
    <font-awesome-icon :icon="['fas', 'floppy-disk']" />
  </button>
  <div class="auto-cbc-container">
    <h2 class="auto-cbc-title">Auto CBC Matching</h2>

    <div class="auto-cbc-form">
      <div class="auto-cbc-form-row">
        <div v-for="(value, key) in newData" :key="key" class="auto-cbc-form-group" v-show="key !== 'conditionalValue' && key !== 'birthdate'">
          <label class="auto-cbc-label" >{{ key }}</label>
          <div v-if="key === 'title'">
            <input v-model="newData.title" type="text" placeholder=""
                   class="auto-cbc-input" :class="{'error': titleError}" />
            <p v-if="titleError" class="auto-cbc-error-message">Title is required</p>
          </div>

          <div v-if="key === 'content'">
            <input v-model="newData.content" placeholder=""
                   class="auto-cbc-input" :class="{'error': contentError}" />
            <p v-if="contentError" class="auto-cbc-error-message">Content is required</p>
          </div>

          <div v-if="key === 'cbc_code'">
            <input v-model="newData.cbc_code" type="text" placeholder="" class="auto-cbc-input" />
          </div>

          <div v-if="key === 'conditional'" class="auto-cbc-conditional-group">
            <select v-model="newData[key]" class="auto-cbc-select auto-cbc-conditional-select">
              <option value="&gt;">&gt;</option>
              <option value="&lt;">&lt;</option>
              <option value="&gt;=">&gt;=</option>
              <option value="&lt;=">&lt;=</option>
            </select>
            <input v-model="newData.conditionalValue" type="number" class="auto-cbc-input" />
          </div>

          <div v-else-if="key === 'mo_type'">
            <select v-model="newData[key]" class="auto-cbc-select">
              <option value="RBC">RBC</option>
              <option value="WBC">WBC</option>
              <option value="PLT">PLT</option>
            </select>
          </div>

          <div v-else-if="key === 'sex'">
            <select v-model="newData[key]" class="auto-cbc-select">
              <option value="F">F</option>
              <option value="M">M</option>
              <option value="all">All</option>
            </select>
          </div>

          <div v-else-if="key === 'age'">
            <div v-if="newData.ageCategory === 'kidDate'">
              <Datepicker
                  v-model="newData.birthdate"
                  :format="dateFormat"
                  class="auto-cbc-datepicker"
                  ref="datepicker"
                  :week-starts-on="0"
              />
            </div>
            <input v-else v-model="newData[key]" type="text" min="0" max="100" class="auto-cbc-input" />
          </div>

          <div v-else-if="key === 'ageCategory'">
            <select v-model="newData[key]" @change="onAgeCategoryChange" class="auto-cbc-select">
              <option value="adult">Adult</option>
              <option value="kidDate">Kid-date</option>
              <option value="kidYear">Kid-year</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>
      <button class="auto-cbc-add-button" @click="createdAutoCbcData">
        <font-awesome-icon :icon="['fas', 'plus']" />
      </button>
    </div>

    <!-- 데이터 리스트 -->
    <table class="auto-cbc-table">
      <thead>
      <tr>
        <th>cbc_code</th>
        <th style="min-width: 125px;">conditional</th>
        <th>mo_Type</th>
        <th>title</th>
        <th>content</th>
        <th>sex</th>
        <th>age</th>
        <th>ageCategory</th>
        <th>actions</th>
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
          :key="index"
          :data-index="index"
          :class="draggingIndex === index ? 'dragging' : ''"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent
          @drop="onDrop(index)"
      >
        <td><input v-model="item.cbc_code" class="auto-cbc-table-input" /></td>
        <td class="auto-cbc-conditional-group">
          <select v-model="item.conditional" class="auto-cbc-table-select auto-cbc-conditional-select">
            <option value="&gt;">&gt;</option>
            <option value="&lt;">&lt;</option>
            <option value="&gt;=">&gt;=</option>
            <option value="&lt;=">&lt;=</option>
          </select>
          <input v-model="item.conditionalValue" type="number" class="auto-cbc-table-input" />
        </td>
        <td>
          <select v-model="item.mo_type" class="auto-cbc-table-select">
            <option value="RBC">RBC</option>
            <option value="WBC">WBC</option>
            <option value="PLT">PLT</option>
          </select>
        </td>
        <td><input v-model="item.title" class="auto-cbc-table-input" /></td>
        <td><input v-model="item.content" class="auto-cbc-table-input" /></td>
        <td>
          <select v-model="item.sex" class="auto-cbc-table-select">
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="all">All</option>
          </select>
        </td>
        <td>
          <div v-if="item.ageCategory === 'kidDate'">
            <Datepicker
                v-model="item.birthdate"
                :format="dateFormat"
                class="auto-cbc-table-input"
                ref="datepicker"
                :week-starts-on="0"
            />
          </div>
          <input v-else v-model="item.age" type="text" class="auto-cbc-table-input" />
        </td>
        <td>
          <select v-model="item.ageCategory" @change="onAgeCategoryChange" class="auto-cbc-table-select">
            <option value="adult">Adult</option>
            <option value="kidDate">Kid-date</option>
            <option value="kidYear">Kid-year</option>
            <option value="all">All</option>
          </select>
        </td>
        <td class="auto-cbc-table-actions">
<!--          <button @click="updateAutoCbcData(item)" class="auto-cbc-edit-button">-->
<!--            <font-awesome-icon :icon="['fas', 'pen-to-square']" />-->
<!--          </button>-->
          <button @click="deleteAutoCbcData(item.id)" class="auto-cbc-delete-button">
            <font-awesome-icon :icon="['fas', 'trash']" />
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  autoCbcCreateApi,
  findAutoCbcApi,
  autoCbcPutApi,
  autoCbcDelApi,
  autoCbcUpdateAllApi
} from "@/common/api/service/autoCbc/autoCbc";
import { getCbcCodeRbcApi } from "@/common/api/service/setting/settingApi";
import Datepicker from "vue3-datepicker";

const findAutoCbcDataArr = ref<any>([]);
const newData = ref({
  cbc_code: "",
  conditional: ">",
  conditionalValue: "",
  mo_type: "",
  title: "",
  content: "",
  sex: "all",
  age: "",
  ageCategory: "all",
  birthdate: "",
});
const cbcArr = ref<any>([]);
const draggingIndex = ref<number | null>(null); // 드래그 중인 항목 인덱스

const loadAutoCbcData = async () => {
  try {
    const [autoCbcResponse, cbcResponse] = await Promise.all([
      findAutoCbcApi(),
      getCbcCodeRbcApi(),
    ]);
    cbcArr.value = cbcResponse?.data;
    for (const item of autoCbcResponse.data) {
        if (item.ageCategory === "kidDate"){
          item.birthdate = new Date(item.age);
        }
    }

    findAutoCbcDataArr.value = autoCbcResponse.data;

    // orderIdx를 기준으로 오름차순 정렬
    findAutoCbcDataArr.value.sort((a, b) => parseInt(a.orderIdx) - parseInt(b.orderIdx));

    // 기존 데이터가 없으면 기본값을 생성하여 서버에 저장
    if (!findAutoCbcDataArr?.value.length) {
      const cbcArrDefault = cbcResponse?.data
          .filter((item: any) => item.fullNm)
          .map((item: any) => ({
            cbc_code: item.fullNm,
            conditional: ">",
            conditionalValue: "",
            mo_type: "",
            title: "",
            content: "",
            sex: "all",
            age: "",
            ageCategory: "all",
            orderIdx: "0", // 기본값으로 설정
          }));

      if (cbcArrDefault.length) {
        await Promise.all(cbcArrDefault.map((data) => autoCbcCreateApi(data)));
        findAutoCbcDataArr.value = await findAutoCbcApi(); // 다시 데이터 로드
        // orderIdx로 정렬
        findAutoCbcDataArr.value.sort((a, b) => parseInt(a.orderIdx) - parseInt(b.orderIdx));
      }
    }

    for (const el of findAutoCbcDataArr.value) {
      for (const item of cbcArr.value) {
        if(el.cbc_code === item.classCd){
          el.cbc_code = item.fullNm;
        }
      }
    }

  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
};

const createdAutoCbcData = async () => {
  try {
    const dataToSend = { ...newData.value };
    dataToSend.conditional = `${dataToSend.conditional}${dataToSend.conditionalValue}`; // 조건 부호와 값을 결합

    if(dataToSend.ageCategory === 'kidDate'){
      dataToSend.age = dataToSend.birthdate.toISOString().split('T')[0];
    }

    delete dataToSend.conditionalValue; // 불필요한 conditionalValue 삭제
    delete dataToSend.birthdate; // 서버로 보내지 않기 위해 birthdate 삭제

    // 새로운 데이터를 생성할 때 orderIdx를 추가
    dataToSend.orderIdx = (findAutoCbcDataArr.value.length + 1).toString(); // 마지막 데이터 뒤에 추가되는 순서대로 설정

    Object.keys(dataToSend).forEach((key) => {
      if (dataToSend[key] !== undefined && dataToSend[key] !== null) {
        dataToSend[key] = String(dataToSend[key]);
      }
    });
    for (const item of cbcArr.value) {
      if(dataToSend.cbc_code === item.fullNm){
        dataToSend.cbc_code = item.classCd;
      }
    }
    await autoCbcCreateApi(dataToSend);
    Object.keys(newData.value).forEach((key) => (newData.value[key] = "")); // 새로 추가된 데이터 비우기
    await loadAutoCbcData(); // 데이터 로드
  } catch (error) {
    console.error("데이터 추가 실패:", error);
  }
};


const updateAutoCbcData = async (item) => {
  try {
    const dataToSend = { ...item };
    dataToSend.conditional = `${dataToSend.conditional}${dataToSend.conditionalValue}`; // 조건 부호와 값을 결합
    Object.keys(dataToSend).forEach((key) => {
      if (dataToSend[key] !== undefined && dataToSend[key] !== null) {
        dataToSend[key] = String(dataToSend[key]);
      }
    });

    delete dataToSend.conditionalValue; // 불필요한 conditionalValue 삭제
    delete dataToSend.birthdate; // 서버로 보내지 않기 위해 birthdate 삭제
    for (const item of cbcArr.value) {
      if(dataToSend.cbc_code === item.fullNm){
        dataToSend.cbc_code = item.classCd;
      }
    }
    await autoCbcPutApi(dataToSend);
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
    for (const el of findAutoCbcDataArr.value) {
      for (const item of cbcArr.value) {
        if(el.cbc_code === item.fullNm){
          el.cbc_code = item.classCd;
        }
      }
    }
    await autoCbcUpdateAllApi(findAutoCbcDataArr.value);
    await loadAutoCbcData(); // 데이터 갱신
  } catch (error) {
    console.error("전체 데이터 수정 실패:", error);
  }
};

const deleteAutoCbcData = async (id) => {
  try {
    await autoCbcDelApi({ id });
    await loadAutoCbcData();
  } catch (error) {
    console.error("데이터 삭제 실패:", error);
  }
};

const onAgeCategoryChange = () => {
  if (newData.value.ageCategory === "kidDate") {
    newData.value.birthdate = ""; // kidDate일 경우 생년월일 입력 필드 추가
  }
};
const dateFormat = (date: Date): string => {
  return date.toISOString().split('T')[0];
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
