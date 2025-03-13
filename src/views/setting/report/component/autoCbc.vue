<template>
  <button class="auto-cbc-update-all-button" @click="updateAllAutoCbcData" type="button">
    <font-awesome-icon :icon="['fas', 'floppy-disk']"/>
  </button>

  <label for="file-upload" class="file-upload-label">
    <div class="custom-file-input auto-cbc-update-all-button">
      <font-awesome-icon :icon="['fas', 'file-csv']"/>
    </div>
  </label>
  <div class="allConfirm">
    <label for="inputName">All Confirm :</label>
    <input type="checkbox" id="inputName" v-model="allConfirmed" @change="toggleAllConfirm" />
  </div>
  <input
      id="file-upload"
      type="file"
      @change="handleFileUpload"
      accept=".xlsx, .xls"
      class="file-input"
      v-show="false"
  />
  <div class="auto-cbc-container">
    <h2 class="auto-cbc-title">Auto Diagnostic Result Code Link</h2>

    <div class="auto-cbc-form">
      <div class="auto-cbc-form-row">
        <div v-for="(key, idx) in filteredKeys" :key="idx" class="auto-cbc-form-group">
          <label class="auto-cbc-label">{{ key === 'cbc_code' ? 'matchingCode' : key }}</label>


          <div v-if="key === 'matchingType'">
            <select v-model="newData.matchingType" class="auto-cbc-select"
                    @change="onChangeMatchingType(newData)">
              <option :value="'PBIA'">PBIA</option>
              <option :value="'CBC'">CBC</option>
            </select>
          </div>

          <div v-if="key === 'cbc_code'">
            <select v-model="newData.cbc_code" class="auto-cbc-select">
              <option v-for="(code, idx) in newData.pbiaCbcCodeArr" :key="idx" :value="code.classNm">
                {{ changName(code) }}
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
            <input v-model="newData.conditionalValue" type="text"
                   @input="validateInput($event, newData.conditionalValue, 'add')"
                   class="auto-cbc-input"/>
          </div>
          <!--          <div v-if="key ===  'unit'">-->
          <!--            <select v-model="newData[key]" class="auto-cbc-select">-->
          <!--              <option value="#">#</option>-->
          <!--              <option value="%">%</option>-->
          <!--            </select>-->
          <!--          </div>-->

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
        <th>matchingType</th>
        <th>matchingCode</th>
        <th>conditional</th>
        <th>age</th>
        <th>ageCategory</th>
        <th>sex</th>
        <th class="pos-relative">
          morphologyType
        </th>
        <th>title</th>
        <th>content</th>
        <th>confirm</th>
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
          :class="[draggingIndex === index ? 'dragging' : '', item.confirm ? 'confirmOk' : '']"
      >

        <td>
          <select v-model="item.matchingType" class="auto-cbc-table-select" @change="onChangeMatchingType(item)"
                  :disabled="item.confirm">
            <option :value="'PBIA'">PBIA</option>
            <option :value="'CBC'">CBC</option>
          </select>
        </td>

        <td>
          <select v-model="item.cbc_code" class="auto-cbc-table-select" :disabled="item.confirm">
            <option v-for="(code, idx) in item.pbiaCbcCodeArr" :key="idx" :value="code.classNm">
              {{ changName(code) }}
            </option>
          </select>
        </td>

        <td class="auto-cbc-conditionalArr">
          <div v-for="(itemChild, index) in item.conditionalArray" :key="index" class="contDiv">
            <select v-model="itemChild.operator" class="auto-cbc-table-select auto-cbc-conditional-select"
                    :disabled="item.confirm">
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
                :disabled="item.confirm"
            />
            <button @click="addCondition(item)" type="button" v-if="index === 0" class="plusMinusBtn"
                    :disabled="item.confirm">
              <font-awesome-icon :icon="['fas', 'plus']"/>
            </button>
            <button @click="removeCondition(item, index)" class="plusMinusBtn" type="button" v-if="index !== 0"
                    :disabled="item.confirm">
              <font-awesome-icon :icon="['fas', 'minus']"/>
            </button>
          </div>
        </td>
        <td>
          <input v-model="item.age" type="text" class="auto-cbc-table-input" :disabled="item.confirm"/>
        </td>
        <td>
          <select v-model="item.ageCategory" class="auto-cbc-table-select" :disabled="item.confirm">
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </td>
        <td>
          <select v-model="item.sex" class="auto-cbc-table-select" :disabled="item.confirm">
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="all">All</option>
          </select>
        </td>
        <!--        <td>-->
        <!--          <select v-model="item.unit" class="auto-cbc-table-select">-->
        <!--            <option :value="'%'">%</option>-->
        <!--            <option :value="'#'">#</option>-->
        <!--          </select>-->
        <!--        </td>-->

        <td>
          <select v-model="item.mo_type" class="auto-cbc-table-select" @change="onMoTypeChange(item)"
                  :disabled="item.confirm">
            <option :value="'RBC'">RBC</option>
            <option :value="'WBC'">WBC</option>
            <option :value="'PLT'">PLT</option>
          </select>
        </td>
        <td>
          <select v-model="item.title" class="auto-cbc-table-select" @change="onTitleChange(item)"
                  :disabled="item.confirm">
            <option v-for="(title, idx) in item.autoTitleArr" :key="idx" :value="title.crcTitle">
              {{ title.crcTitle }}
            </option>
          </select>
        </td>


        <td>
          <select v-model="item.content" class="auto-cbc-table-select" :disabled="item.confirm">
            <option v-for="(content, idx) in item.autoContentArr" :key="idx" :value="content">
              {{ content }}
            </option>
          </select>
        </td>
        <td class="auto-cbc-table-actions" @click="toggleConfirm(item)">
          <font-awesome-icon
              :icon="item.confirm ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
              class="iconSize confirm"
          />
        </td>
        <td class="auto-cbc-table-actions">
          <button @click="deleteAutoCbcData(item)" class="auto-cbc-delete-button" v-if="!item.confirm">
            <font-awesome-icon :icon="['fas', 'trash']"/>
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <ToastNotification
      v-if="toastInfo.message"
      :message="toastInfo.message"
      :messageType="toastInfo.messageType"
      :duration="1500"
  />
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from "vue";
import {
  autoCbcCreateApi,
  findAutoCbcApi,
  autoCbcDelApi,
  autoCbcUpdateAllApi
} from "@/common/api/service/autoCbc/autoCbc";
import * as XLSX from "xlsx";
import {crcGet, getCbcCodeRbcApi, getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import {getLisWbcRbcData} from "@/common/helpers/lisCbc/inhaCbcLis";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {CellImageAnalyzedType} from "@/common/type/tooltipType";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {useToast} from "@/common/lib/utils/toast";

const findAutoCbcDataArr = ref<any>([]);

interface NewData {
  pbiaCbcCodeArr: any[];
  autoTitleArr: any[];
  autoContentArr: any[];
  matchingType: string;
  cbc_code: string;
  conditional: string;
  conditionalValue: string;
  age: string;
  ageCategory: string;
  sex: string;
  mo_type: string;
  title: string;
  content: string;
  conditionalArray: any[];
  confirm: boolean;
}


const newData = ref<NewData>({
  pbiaCbcCodeArr: [],
  autoTitleArr: [],
  autoContentArr: [],
  matchingType: "",
  cbc_code: "",
  conditional: "",
  conditionalValue: "",
  age: "",
  ageCategory: "",
  sex: "",
  mo_type: "",
  title: "",
  content: "",
  conditionalArray: [],
  confirm: false,
});

const crcData = ref<any>([]);
const cbcArr = ref<any>([]);
const draggingIndex = ref<number | null>(null); // 드래그 중인 조건 인덱스
const newRbcData = ref<any>([]);
const newWbcData = ref<any>([]);
const newPltData = ref<any>([]);
const {toastInfo, showToast} = useToast();
const allConfirmed = ref(false);

// 제외 키 목록 - 화면에서 안 보여주기
const excludeKeys = new Set([
  "conditionalValue",
  "pbiaCbcCodeArr",
  "autoTitleArr",
  "autoContentArr",
  "conditionalArray",
  "confirm",
]);


const filteredKeys = computed(() =>
    Object.keys(newData.value).filter((key) => !excludeKeys.has(key))
);
const toggleAllConfirm = () => {
  findAutoCbcDataArr.value.forEach((item: any) => {
    item.confirm = allConfirmed.value; // 체크 상태에 맞게 confirm 값 설정
  });
};



const changName = (code: any): string => {
  const type = code.type ? `${code.type}_` : '';
  return `${type}${code.classNm}`;
}

const validateInput = (event: Event, itemChild: any, type?: string) => {
  // 입력 값에 소수점과 숫자만 허용
  const value = (event.target as HTMLInputElement).value;
  const regex = /^[0-9]*\.?[0-9]*$/;  // 숫자와 소수점만 허용
  if (!regex.test(value)) {
    // 유효하지 않은 값을 입력하면 현재 값을 유지
    if (type === 'add') {
      newData.value.conditionalValue = value.slice(0, -1);  // 마지막 문자 제거
    } else {
      itemChild.value = value.slice(0, -1);  // 마지막 문자 제거
    }
  }
}

const toggleConfirm = (item: any) => {
  item.confirm = !item.confirm;
  // console.log(item)
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const uploadButton = target; // 파일 업로드 버튼
  if (uploadButton) {
    uploadButton.disabled = true; // 파일 업로드 버튼을 비활성화
  }

  if (target.files && target.files[0]) {
    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      findAutoCbcDataArr.value = [];
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, {type: "array"});
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // jsonData를 findAutoCbcDataArr에 추가
      jsonData.forEach((row: any) => {
        // UIMD 변경될 속성 값을 mo_type에 추가
        const uimdValue = row['UIMD 변경될 속성 값'];
        let moType = ''; // 초기화

        // 조건에 따라 moType 결정
        if (uimdValue.includes('RBC')) {
          moType = 'RBC';
        } else if (uimdValue.includes('WBC')) {
          moType = 'WBC';
        } else if (uimdValue.includes('PLT')) {
          moType = 'PLT';
        } else {
          moType = uimdValue; // 해당 값이 없으면 원래 값을 사용
        }

        // 조건에서 수치, 성별, 나이 추출 함수
        const extractValues = (str: string) => {
          // ≤, ≥ 같은 기호를 일반 연산자로 변환
          str = str.replace(/≤/g, "<=").replace(/≥/g, ">=");

          const numberPattern = /(<=|>=|==|<|>)?\s*(\d+(?:\.\d+)?)/g; // 연산자 포함 숫자 매칭
          const sexPattern = /(남자|여자|M|F)/; // 성별 패턴
          const agePattern = /(\d+)\s*-\s*(\d+)\s*세|(\d+)\s*세/; // 나이 범주 패턴 (단일 나이와 범주 모두 처리)

          const conditionalArray = [];
          const groupedConditions = [];
          let match;

          // 괄호로 묶인 조건 추출
          const parenthesesPattern = /\(([^)]+)\)/g;
          let parenthesisMatch;

          // 괄호 안의 조건을 먼저 추출
          while ((parenthesisMatch = parenthesesPattern.exec(str)) !== null) {
            const innerConditions = parenthesisMatch[1].trim().split(',').map(item => item.trim());
            if (innerConditions.length === 2) {
              groupedConditions.push({sex: innerConditions[0], age: innerConditions[1]});
            }
          }


          // 괄호가 제거된 원본 문자열에서 조건 추출
          str = str.replace(parenthesesPattern, '').trim();

          // 숫자와 연산자 추출
          while ((match = numberPattern.exec(str)) !== null) {
            const operator = match[1] ? match[1].trim() : '>'; // 연산자 추출
            const value = match[2]; // 숫자 값 추출
            conditionalArray.push({operator, value});
          }

          // 조건이 없을 경우 기본값 추가
          if (conditionalArray.length === 0) {
            conditionalArray.push({operator: "==", value: "0"});
          }

          // 성별 처리 수정
          let sex = 'all';
          const sexMatch = str.match(sexPattern);
          if (sexMatch) {
            const matchedSex = sexMatch[0].trim();
            sex = (matchedSex === '남자' || matchedSex === 'M') ? 'M' : 'F';
          } else if (groupedConditions[0]?.sex) {
            sex = (groupedConditions[0]?.sex === '남자' || groupedConditions[0]?.sex === 'M') ? 'M' : 'F';
          }

          // 나이 처리 수정
          let age = '';
          let ageCategory = '';
          const ageMatch = str.match(agePattern);
          if (ageMatch) {
            // 나이 범주가 있을 경우
            if (ageMatch[1] && ageMatch[2]) {
              age = `${ageMatch[1]}-${ageMatch[2]}`; // 범주 형식
            } else if (ageMatch[3]) {
              age = ageMatch[3]; // 단일 나이 형식
            }
          } else if (groupedConditions[0]?.age) {
            age = groupedConditions[0]?.age
          }

          // age에서 숫자 기호 제거
          age = age.replace(/[^0-9-=<>\s]/g, ''); // 숫자, '-', '=', 부등호만 남기기

          return {sex, age, ageCategory, conditionalArray};
        };


        const extractValues2 = (str: string) => {
          str = str.replace(/≤/g, "<=").replace(/≥/g, ">=");

          const rows = str.split('\n'); // 여러 줄로 나누기
          const results: any = [];
          let currentSex = ''; // 현재 성별 저장

          rows.forEach(row => {
            const parts = row.trim().split(/\s+/);
            if (parts.length < 2) return;

            // 첫 번째 값이 성별인지 확인
            if (parts[0] === 'M' || parts[0] === 'F') {
              currentSex = parts[0]; // 새로운 성별 저장
              parts.shift(); // 성별 제거 후 나머지 처리
            }

            // 나이 정보
            const ageInfo = parts[0];
            const ageCategoryMatch = ageInfo.match(/[DMY]/g);
            const ageCategory = ageCategoryMatch ? ageCategoryMatch.map(char => {
              return char === 'D' ? 'day' : char === 'M' ? 'month' : 'year';
            }).join('') : '';

            const age = ageInfo.replace(/D|M|Y/g, '');

            // 조건 추출
            const condition = parts.slice(1).join(' ');
            const conditionalArray = [];
            const conditionPattern = /(<=|>=|==|<|>)\s*(\d+(?:\.\d+)?)/g;
            let match;

            while ((match = conditionPattern.exec(condition)) !== null) {
              conditionalArray.push({
                operator: match[1].trim(),
                value: match[2],
              });
            }

            // 조건이 없을 경우 기본값 추가
            if (conditionalArray.length === 0) {
              conditionalArray.push({operator: "==", value: "0"});
            }

            results.push({
              sex: currentSex || "all", // 성별이 없는 경우 기본값 "all"로 설정
              age,
              ageCategory,
              conditionalArray
            });
          });
          return results;
        };


        // row['조건']에서 수치, 성별, 나이 추출
        const results = /^[FMA]/.test(row['조건']) ? extractValues2(row['조건']) : [extractValues(row['조건'])];

        results.forEach(({sex, age, ageCategory, conditionalArray}) => {
          // title과 content 추출
          const titleParts = uimdValue.split('-');
          const title = titleParts[1]; // SIZE 부분
          const content = titleParts[2]; // Microcyte 부분
          const parts = row['matchingType'].split('_'); // '_'로 분리
          const cbcText = parts.length > 1 ? parts.slice(1).join('_') : '';


          // findAutoCbcDataArr에 데이터 추가
          const newItem = {
            mo_type: moType,
            title: title,
            content: content,
            sex: sex,
            age: age || 'All',
            ageCategory: ageCategory || 'year',
            conditionalArray: conditionalArray,
            matchingType: row['matchingType'].includes('CBC') ? 'CBC' : 'PBIA',
            cbc_code: cbcText,
            id: new Date(),
            excelData: true,
          };

          // mo_type 변경 시 이벤트 발생
          onChangeMatchingType(newItem)
          onMoTypeChange(newItem);
          onTitleChange(newItem);
          findAutoCbcDataArr.value.push(newItem);
        });
      });
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      }

      if (uploadButton) {
        uploadButton.disabled = false; // 업로드 완료 후 버튼을 다시 활성화
      }
    };

    reader.readAsArrayBuffer(file);
    (target as HTMLInputElement).value = '';

  }
};


const onChangeMatchingType = async (item: any) => {
  if (item.matchingType === 'PBIA') {
    const {lisCodeWbcArr, lisCodeRbcArr} = await getLisWbcRbcData();

    item.pbiaCbcCodeArr = [];

    for (const el of lisCodeWbcArr) {
      item.pbiaCbcCodeArr.push({classNm: el.CD_NM, type: 'WBC'});
    }
    for (const el of lisCodeRbcArr) {
      item.pbiaCbcCodeArr.push({
        classNm: `${el.CATEGORY_NM}_${el.CLASS_NM}`,
        type: 'RBC',
        categoryId: el.IA_CATEGORY_CD,
        classId: el.IA_CLASS_CD
      });
    }
  } else {
    const neene = cbcArr.value.filter((el: any) => {
      return el.classCd !== ''
    });
    item.pbiaCbcCodeArr = neene.map((el: any) => ({classNm: el.fullNm}));
  }
};

const onTitleChange = (item: any) => {
  if (item.title) { // item.title이 정의되어 있는지 확인
    const selectedTitle = item.autoTitleArr.find((el: any) => el.crcTitle === item.title);
    item.autoContentArr = selectedTitle ? selectedTitle.crcContent.split(',') : [];
  } else {
    item.autoContentArr = [];
  }
};


const onMoTypeChange = (item: any) => {
  if (item.mo_type === 'RBC') {
    item.autoTitleArr = newRbcData.value;
  } else if (item.mo_type === 'WBC') {
    item.autoTitleArr = newWbcData.value;
  } else {
    item.autoTitleArr = newPltData.value;
  }
};
const addCondition = (item: any) => {
  item.conditionalArray.push({operator: ">", value: ""});
};

const removeCondition = (item: any, index: any) => {
  item.conditionalArray.splice(index, 1);
};
const loadAutoCbcData = async () => {
  findAutoCbcDataArr.value = [];
  try {
    await setData();
    // orderIdx를 기준으로 정렬
    findAutoCbcDataArr.value.sort((a: any, b: any) => parseInt(a.orderIdx) - parseInt(b.orderIdx));

  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
};

const setData = async () => {
  const [autoCbcResponse, cbcResponse, crcGetApi] = await Promise.all([
    findAutoCbcApi(),
    getCbcCodeRbcApi(),
    crcGet(),
  ]);
  const {lisCodeWbcArr, lisCodeRbcArr} = await getLisWbcRbcData();

  // Morphology 데이터 분류
  crcData.value = crcGetApi.data;
  newRbcData.value = crcData.value.filter((el: any) => el.morphologyType === 'RBC');
  newWbcData.value = crcData.value.filter((el: any) => el.morphologyType === 'WBC');
  newPltData.value = crcData.value.filter((el: any) => el.morphologyType === 'PLT');

  cbcArr.value = cbcResponse?.data;

  // 기존 데이터 불러오기
  findAutoCbcDataArr.value = autoCbcResponse.data.map((item: any) => {

    // mo_type에 따라 autoTitleArr 설정
    if (item.mo_type === "RBC") {
      item.autoTitleArr = [...newRbcData.value];
    } else if (item.mo_type === "WBC") {
      item.autoTitleArr = [...newWbcData.value];
    } else {
      item.autoTitleArr = [...newPltData.value];
    }


    // title 값이 있으면 content 자동 설정
    const selectedTitle = item.autoTitleArr.find((el: any) => el.crcTitle === item.title);
    item.autoContentArr = selectedTitle ? selectedTitle.crcContent.split(",") : [];

    // matchingType에 따른 cbc_code 목록 설정
    if (item.matchingType === "PBIA") {
      item.pbiaCbcCodeArr = [];
      for (const el of lisCodeWbcArr) {
        item.pbiaCbcCodeArr.push({classNm: el.CD_NM, type: 'WBC'});
      }
      for (const el of lisCodeRbcArr) {
        item.pbiaCbcCodeArr.push({
          classNm: `${el.CATEGORY_NM}_${el.CLASS_NM}`,
          type: 'RBC',
          categoryId: el.IA_CATEGORY_CD,
          classId: el.IA_CLASS_CD
        });
      }
    } else {
      const neene = cbcArr.value.filter((el: any) => {
        return el.classCd !== ''
      });
      item.pbiaCbcCodeArr = neene.map((el: any) => ({classNm: el.fullNm}));
    }
    item.conditionalArray = item.conditional
        ? [...item.conditional.matchAll(/([<>]=?|==)\s*(-?\d+(?:\.\d+)?)/g)].map(match => {
          return {operator: match[1], value: match[2]};
        })
        : [];


    return item;
  });

}

const valCheckReturn = (val: string): boolean => {
  return val === ''
}
const createdAutoCbcData = async () => {
  try {
    // 새로운 데이터 복사
    const dataToSend = {...newData.value};
    const fieldsToCheck = [
      'age', 'cbc_code', 'conditional', 'content',
      'matchingType', 'mo_type', 'sex', 'title'
    ];
    let allFillErrBool = false;

    fieldsToCheck.forEach(field => {
      if (valCheckReturn(dataToSend[field])) {
        allFillErrBool = true;
      }
    });

    if (allFillErrBool) {
      showToast(MSG.TOAST.AUTO_CBC_ALL_VAL, MESSAGES.TOAST_MSG_ERROR);
      return;
    }

    // conditional과 conditionalValue 결합 (값이 존재할 경우에만)
    if (dataToSend.conditional) {
      dataToSend.conditionalArray.push({
        operator: dataToSend.conditional || '',
        value: dataToSend.conditionalValue || ''
      })
    }

    delete dataToSend.conditionalValue; // 불필요한 값 삭제

    // 임시 ID 생성 (UUID 또는 timestamp 사용 가능)
    dataToSend.tempId = `temp-${Date.now()}`;

    // orderIdx를 findAutoCbcDataArr 길이에 따라 설정 (가장 앞에 추가하므로 +1)
    dataToSend.orderIdx = (findAutoCbcDataArr.value.length + 1).toString();

    // 모든 값 문자열로 변환
    Object.keys(dataToSend).forEach((key: any) => {
      if (dataToSend[key] !== undefined && dataToSend[key] !== null && key !== 'conditionalArray' && key !== 'autoTitleArr' && key !== 'autoContentArr' && key !== 'pbiaCbcCodeArr' && key !== 'confirm') {
        dataToSend[key] = String(dataToSend[key]);
      }
    });
    // 새로운 데이터를 배열의 맨 앞에 추가
    findAutoCbcDataArr.value.unshift({...dataToSend});
    // 폼 초기화
    Object.keys(newData.value).forEach((key) => {
      newData.value[key] = ''; // 폼 초기화
    });

  } catch (error) {
    console.error("데이터 추가 실패:", error);
  }
};


const updateAllAutoCbcData = async () => {
  try {
    // findAutoCbcDataArr.value가 undefined가 아닌지 확인
    if (!Array.isArray(findAutoCbcDataArr.value)) {
      throw new Error('findAutoCbcDataArr.value is not an array');
    }

    findAutoCbcDataArr.value = findAutoCbcDataArr.value.map((item, idx) => {
      // item.conditionalArray가 undefined일 경우 빈 배열로 처리
      const {id, ...rest} = item;
      const conditionalArray = item.conditionalArray || [];

      return {
        ...rest,
        conditional: conditionalArray
            .map((cond) => `${cond.operator}${cond.value}`)
            .join(","), // 조건 문자열 변환
        orderIdx: (idx + 1).toString(), // 순서 업데이트
      };
    });


    // 서버에 한 번에 업데이트 요청
    await autoCbcUpdateAllApi(findAutoCbcDataArr.value);
    showToast(MSG.TOAST.SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);


  } catch (error) {
    console.error("전체 데이터 수정 실패:", error);
  }
};


const deleteAutoCbcData = async (item) => {
  console.log(item.id)
  if (item.excelData || item.tempId) {
    if (item.tempId) {
      findAutoCbcDataArr.value = findAutoCbcDataArr.value.filter(items => items.tempId !== item.tempId);
    } else {
      findAutoCbcDataArr.value = findAutoCbcDataArr.value.filter(items => items.id !== item.id);
    }
  } else {
    try {
      await autoCbcDelApi({id: item.id});
      findAutoCbcDataArr.value = findAutoCbcDataArr.value.filter(items => items.id !== item.id);
      // await loadAutoCbcData();
    } catch (error) {
      console.error("데이터 삭제 실패:", error);
    }
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

  // 조건 순서 변경
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
