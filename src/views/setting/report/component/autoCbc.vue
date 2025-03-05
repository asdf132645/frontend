<template>
  <button class="auto-cbc-update-all-button" @click="updateAllAutoCbcData">
    <font-awesome-icon :icon="['fas', 'floppy-disk']"/>
  </button>
  <div class="auto-cbc-container">
    <h2 class="auto-cbc-title">Auto CBC Matching</h2>

    <div class="auto-cbc-form">
      <div class="auto-cbc-form-row">
        <div v-for="(value, key) in newData" :key="key" class="auto-cbc-form-group"
             v-show="key !== 'conditionalValue' && key !== 'pbiaCbcCodeArr' && key !== 'autoTitleArr' && key !== 'autoContentArr'">
          <label class="auto-cbc-label">{{ key }}</label>


          <div v-if="key === 'matchingType'">
            <select v-model="newData.matchingType" class="auto-cbc-table-select"
                    @change="onChangeMatchingType(newData)">
              <option :value="'PBIA'">PBIA</option>
              <option :value="'CBC'">CBC</option>
            </select>
          </div>

          <div v-if="key === 'cbc_code'">
            <select v-model="newData.cbc_code" class="auto-cbc-table-select">
              <option v-for="(code, idx) in newData.pbiaCbcCodeArr" :key="idx" :value="code.classNm">
                {{ code.classNm }}
              </option>
            </select>
          </div>

          <div v-if="key === 'conditional'" class="auto-cbc-conditional-group">
            <select v-model="newData[key]" class="auto-cbc-select auto-cbc-conditional-select">
              <option value="&gt;">&gt;</option>
              <option value="&lt;">&lt;</option>
              <option value="&gt;=">&gt;=</option>
              <option value="&lt;=">&lt;=</option>
              <option value="==">==</option>
            </select>
            <input v-model="newData.conditionalValue" type="text" @input="validateInput($event, itemChild)"
                   class="auto-cbc-input"/>
          </div>

          <div v-else-if="key === 'mo_type'">
            <select v-model="newData[key]" class="auto-cbc-select" @change="onMoTypeChange(newData)">
              <option :value="'RBC'">RBC</option>
              <option :value="'WBC'">WBC</option>
              <option :value="'PLT'">PLT</option>
            </select>
          </div>

          <div v-if="key === 'title'">
            <select v-model="newData.title" class="auto-cbc-table-select" @change="onTitleChange(newData)">
              <option v-for="(title, idx) in newData.autoTitleArr" :key="idx" :value="title.crcTitle">
                {{ title.crcTitle }}
              </option>
            </select>
          </div>

          <div v-if="key === 'content'">
            <select v-model="newData.content" class="auto-cbc-table-select">
              <option v-for="(content, idx) in newData.autoContentArr" :key="idx" :value="content">
                {{ content }}
              </option>
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
            <input v-model="newData[key]" type="text" min="0" max="100" class="auto-cbc-input"/>
          </div>

          <div v-else-if="key === 'ageCategory'">
            <select v-model="newData[key]" class="auto-cbc-select">
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>
      </div>
      <button class="auto-cbc-add-button" @click="createdAutoCbcData">
        <font-awesome-icon :icon="['fas', 'plus']"/>
      </button>
    </div>

    <!-- 데이터 리스트 -->
    <table class="auto-cbc-table">
      <thead>
      <tr>
        <th class="pos-relative">
          mo_Type
<!--          <font-awesome-icon :icon="['fas', 'circle-info']"-->
<!--                             @mouseover="tooltipVisibleFunc('moType', true)"-->
<!--                             @mouseout="tooltipVisibleFunc('moType', false)"-->
<!--          />-->
<!--          <Tooltip :isVisible="true" className="mb08" position="top" type="" :message="MSG.TOOLTIP.MO_TYPE" />-->
        </th>
        <th>title</th>
        <th>content</th>
        <th>age</th>
        <th>sex</th>
        <th>ageCategory</th>
        <th>matchingType</th>
        <th>cbc_code</th>
        <th>conditional</th>
        <th>actions</th>
      </tr>
      </thead>
      <tbody
          ref="tbody"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
      >
      <!--

      draggable="true"
                @dragstart="onDragStart(index, $event)"
                @dragover.prevent
                @drop="onDrop(index)"
      -->
      <tr
          v-for="(item, index) in findAutoCbcDataArr"
          :key="index"
          :data-index="index"
          :class="draggingIndex === index ? 'dragging' : ''"
      >


        <td>
          <select v-model="item.mo_type" class="auto-cbc-table-select" @change="onMoTypeChange(item)">
            <option :value="'RBC'">RBC</option>
            <option :value="'WBC'">WBC</option>
            <option :value="'PLT'">PLT</option>
          </select>
        </td>
        <td>
          <select v-model="item.title" class="auto-cbc-table-select" @change="onTitleChange(item)">
            <option v-for="(title, idx) in item.autoTitleArr" :key="idx" :value="title.crcTitle">
              {{ title.crcTitle }}
            </option>
          </select>
        </td>

        <td>
          <select v-model="item.content" class="auto-cbc-table-select">
            <option v-for="(content, idx) in item.autoContentArr" :key="idx" :value="content">
              {{ content }}
            </option>
          </select>
        </td>
        <td>
          <input v-model="item.age" type="text" class="auto-cbc-table-input"/>
        </td>
        <td>
          <select v-model="item.sex" class="auto-cbc-table-select">
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="all">All</option>
          </select>
        </td>

        <td>
          <select v-model="item.ageCategory" class="auto-cbc-table-select">
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </td>

        <td>
          <select v-model="item.matchingType" class="auto-cbc-table-select" @change="onChangeMatchingType(item)">
            <option :value="'PBIA'">PBIA</option>
            <option :value="'CBC'">CBC</option>
          </select>
        </td>

        <td>
          <select v-model="item.cbc_code" class="auto-cbc-table-select">
            <option v-for="(code, idx) in item.pbiaCbcCodeArr" :key="idx" :value="code.classNm">
              {{ code.classNm }}
            </option>
          </select>
        </td>

        <td class="auto-cbc-conditionalArr">
          <div v-for="(itemChild, index) in item.conditionalArray" :key="index" class="contDiv">
            <select v-model="itemChild.operator" class="auto-cbc-select auto-cbc-conditional-select">
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="==">==</option>
            </select>
            <input
                v-model="itemChild.value"
                type="text"
                class="auto-cbc-table-input"
                @input="validateInput($event, itemChild)"
                style="width: 50px;"
            />
            <button @click="addCondition(item)" type="button" v-if="index === 0" class="plusMinusBtn">
              <font-awesome-icon :icon="['fas', 'plus']"/>
            </button>
            <button @click="removeCondition(item, index)" class="plusMinusBtn" type="button">
              <font-awesome-icon :icon="['fas', 'minus']"/>
            </button>
          </div>
        </td>
        <td class="auto-cbc-table-actions">
          <button @click="deleteAutoCbcData(item.id)" class="auto-cbc-delete-button">
            <font-awesome-icon :icon="['fas', 'trash']"/>
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from "vue";
import {
  autoCbcCreateApi,
  findAutoCbcApi,
  autoCbcDelApi,
  autoCbcUpdateAllApi
} from "@/common/api/service/autoCbc/autoCbc";
import {crcGet, getCbcCodeRbcApi} from "@/common/api/service/setting/settingApi";
import {getLisWbcRbcData} from "@/common/helpers/lisCbc/inhaCbcLis";
import {MSG} from "@/common/defines/constants/constantMessageText";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {CellImageAnalyzedType} from "@/common/type/tooltipType";

const findAutoCbcDataArr = ref<any>([]);
const newData = ref({
  pbiaCbcCodeArr: [],
  autoTitleArr: [],
  autoContentArr: [],
  mo_type: "",
  title: "",
  content: "",
  age: "",
  sex: "all",
  ageCategory: "",
  matchingType: "",
  cbc_code: "",
  conditional: ">",
  conditionalValue: "",
});

const tooltipVisible = ref({
  moType: false,
  title: false,
  content: false,
  age: false,
  sex: false,
  ageCategory: false,
  cbcCode: false,
  conditional: false,
  actions: false,
})

const crcData = ref<any>([]);
const cbcArr = ref<any>([]);
const draggingIndex = ref<number | null>(null); // 드래그 중인 항목 인덱스
const newRbcData = ref<any>([]);
const newWbcData = ref<any>([]);
const newPltData = ref<any>([]);
const validateInput = (event: Event, itemChild: any) => {
  // 입력 값에 소수점과 숫자만 허용
  const value = (event.target as HTMLInputElement).value;
  const regex = /^[0-9]*\.?[0-9]*$/;  // 숫자와 소수점만 허용
  if (!regex.test(value)) {
    // 유효하지 않은 값을 입력하면 현재 값을 유지
    itemChild.value = value.slice(0, -1);  // 마지막 문자 제거
  }
}

const tooltipVisibleFunc = (type: keyof CellImageAnalyzedType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}

const onChangeMatchingType = async (item) => {
  if (item.matchingType === 'PBIA') {
    const {lisCodeWbcArr, lisCodeRbcArr} = await getLisWbcRbcData();
    item.pbiaCbcCodeArr = [];

    console.log('lisCodeRbcArr', lisCodeRbcArr);
    console.log('lisCodeWbcArr', lisCodeWbcArr);

    for (const el of lisCodeWbcArr) {
      if (el.LIS_CD !== '') {
        item.pbiaCbcCodeArr.push({classNm: el.CD_NM});
      }
    }
    for (const el of lisCodeRbcArr) {
      if (el.LIS_CD !== '') {
        item.pbiaCbcCodeArr.push({classNm: el.CLASS_NM});
      }
    }
  } else {
    const neene = cbcArr.value.filter((el) => {
      return el.classCd !== ''
    });
    item.pbiaCbcCodeArr = neene.map((el) => ({classNm: el.fullNm}));
  }
};

const onTitleChange = (item) => {
  const selectedTitle = item.autoTitleArr.find((el) => el.crcTitle === item.title);
  item.autoContentArr = selectedTitle ? selectedTitle.crcContent.split(',') : [];
};

const onMoTypeChange = (item) => {
  if (item.mo_type === 'RBC') {
    item.autoTitleArr = newRbcData.value;
  } else if (item.mo_type === 'WBC') {
    item.autoTitleArr = newWbcData.value;
  } else {
    item.autoTitleArr = newPltData.value;
  }
};
const addCondition = (item) => {
  item.conditionalArray.push({operator: ">", value: ""});
};

const removeCondition = (item, index) => {
  item.conditionalArray.splice(index, 1);
};
const loadAutoCbcData = async () => {
  try {
    const [autoCbcResponse, cbcResponse, crcGetApi] = await Promise.all([
      findAutoCbcApi(),
      getCbcCodeRbcApi(),
      crcGet(),
    ]);
    const {lisCodeWbcArr, lisCodeRbcArr} = await getLisWbcRbcData();

    // Morphology 데이터 분류
    crcData.value = crcGetApi.data;
    newRbcData.value = crcData.value.filter(el => el.morphologyType === 'RBC');
    newWbcData.value = crcData.value.filter(el => el.morphologyType === 'WBC');
    newPltData.value = crcData.value.filter(el => el.morphologyType === 'PLT');

    cbcArr.value = cbcResponse?.data;

    // 기존 데이터 불러오기
    findAutoCbcDataArr.value = autoCbcResponse.data.map((item) => {

      // mo_type에 따라 autoTitleArr 설정
      if (item.mo_type === "RBC") {
        item.autoTitleArr = [...newRbcData.value];
      } else if (item.mo_type === "WBC") {
        item.autoTitleArr = [...newWbcData.value];
      } else {
        item.autoTitleArr = [...newPltData.value];
      }


      // title 값이 있으면 content 자동 설정
      const selectedTitle = item.autoTitleArr.find((el) => el.crcTitle === item.title);
      item.autoContentArr = selectedTitle ? selectedTitle.crcContent.split(",") : [];

      // matchingType에 따른 cbc_code 목록 설정
      if (item.matchingType === "PBIA") {
        item.pbiaCbcCodeArr = [];

        for (const el of lisCodeWbcArr) {
          if (el.LIS_CD !== '') {
            item.pbiaCbcCodeArr.push({classNm: el.CD_NM});
          }
        }
        for (const el of lisCodeRbcArr) {
          if (el.LIS_CD !== '') {
            item.pbiaCbcCodeArr.push({classNm: el.CLASS_NM});
          }
        }
      } else {
        const neene = cbcArr.value.filter((el) => {
          return el.classCd !== ''
        });
        item.pbiaCbcCodeArr = neene.map((el) => ({classNm: el.fullNm}));
      }
      item.conditionalArray = item.conditional
          ? item.conditional.split(",").map((cond) => {
            const match = cond.match(/([<>]=?|==)(\d+)/);
            return match ? {operator: match[1], value: match[2]} : {operator: ">", value: ""};
          })
          : [];

      return item;
    });

    // orderIdx를 기준으로 정렬
    findAutoCbcDataArr.value.sort((a, b) => parseInt(a.orderIdx) - parseInt(b.orderIdx));

  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
};


const createdAutoCbcData = async () => {
  try {
    const dataToSend = {...newData.value};
    dataToSend.conditional = `${dataToSend.conditional}${dataToSend.conditionalValue}`; // 조건 부호와 값을 결합

    delete dataToSend.conditionalValue; // 불필요한 conditionalValue 삭제

    // 새로운 데이터를 생성할 때 orderIdx를 추가
    dataToSend.orderIdx = (findAutoCbcDataArr.value.length + 1).toString(); // 마지막 데이터 뒤에 추가되는 순서대로 설정

    Object.keys(dataToSend).forEach((key) => {
      if (dataToSend[key] !== undefined && dataToSend[key] !== null) {
        dataToSend[key] = String(dataToSend[key]);
      }
    });
    // for (const item of cbcArr.value) {
    //   if (dataToSend.cbc_code === item.fullNm) {
    //     dataToSend.cbc_code = item.classCd;
    //   }
    // }
    await autoCbcCreateApi(dataToSend);
    Object.keys(newData.value).forEach((key) => (newData.value[key] = "")); // 새로 추가된 데이터 비우기
    await loadAutoCbcData(); // 데이터 로드
  } catch (error) {
    console.error("데이터 추가 실패:", error);
  }
};


const updateAllAutoCbcData = async () => {
  try {
    // 배열 전체를 서버에 한 번에 업데이트
    // 순서대로 update 하도록 orderIdx를 설정
    findAutoCbcDataArr.value.forEach((item, idx) => {
      item.conditional = item.conditionalArray
          .map((cond) => `${cond.operator}${cond.value}`)
          .join(",");
      delete item.conditionalArray; // 배열 속성 제거
      item.orderIdx = (idx + 1).toString(); // 순서를 문자열로 변환하여 설정
    });

    // for (const el of findAutoCbcDataArr.value) {
    //   for (const item of cbcArr.value) {
    //     if (el.cbc_code === item.fullNm) {
    //       el.cbc_code = item.classCd;
    //     }
    //   }
    // }
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
