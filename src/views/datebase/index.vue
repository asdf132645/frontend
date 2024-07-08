<template>
  <div>
    <h3 class="titleH3">
      Classification List
      <button @click="classListToggleEvent">
        <font-awesome-icon :icon="['fas', 'list-check']"/>
      </button>
    </h3>
    <div class='listBoxTable'>
      <div class="filterListDiv">
        <div>
          <select v-model="searchType" class="searchSelect">
            <option value="barcodeNo">Barcode No</option>
            <option value="patientId">Patient ID</option>
            <option value="patientNm">Patient Name</option>
          </select>
          <input type="text" v-model='searchText' class="searchInputBox"/>
          <div class="settingDatePickers">
            <Datepicker v-model="startDate"></Datepicker>
            <Datepicker v-model="endDate"></Datepicker>
          </div>
          <button type="button" class="searchClass" @click="search">Search</button>
          <div class="excelDivList">
            <font-awesome-icon :icon="['fas', 'file-csv']" @click="exportToExcel"/>
          </div>
          <!-- <button class="searchClass" @click="refresh">Refresh</button> -->
        </div>
        <div class="filterDivBox" v-if="classListToggle">
          <div class="nrCount" v-if="!bmClassIsBoolen">
            <span>NR count</span>
            <input type="text" v-model="nrCount"/>
          </div>
          <div class="wbcTotal">
            <span>WBC Total</span>
            <select v-model="wbcCountOrder">
              <option value="all">Do Not Select</option>
              <option>DESC</option>
              <option>ASC</option>
            </select>
          </div>
          <div class="wbcInfoFilter">
            <span>{{bmClassIsBoolen ? 'BM' : 'WBC'}} Info Filter</span>
            <ul class="wbcInfoFilter">
              <li v-for="(item, idx) in titleItem" :key="idx">
                <input type="checkbox" :id="'checkbox_' + idx" v-model="item.checked" @change="updateFilter">
                <label :for="'checkbox_' + idx">{{ item.title }}</label>
              </li>
            </ul>
          </div>
          <div class="lastTestType">
            <span>Test Type</span>
            <div>
              <label><input type="checkbox" value="00" @change="changeTestType('00')" :checked="testType === '00'"/>
                <span>ALL</span></label>
              <template v-if="!bmClassIsBoolen">
                <label><input type="checkbox" value="01" @change="changeTestType('01')" :checked="testType === '01'"/>
                  <span>Diff</span></label>
                <label><input type="checkbox" value="04" @change="changeTestType('04')" :checked="testType === '04'"/>
                  <span>PBS</span></label>
              </template>

              <template v-if="bmClassIsBoolen">
                <label><input type="checkbox" value="02" @change="changeTestType('02')" :checked="testType === '02'"/>
                  <span>Wedge</span></label>
                <label><input type="checkbox" value="04" @change="changeTestType('04')" :checked="testType === '04'"/>
                  <span>Squash</span></label>
              </template>
            </div>

          </div>
        </div>
      </div>
      <ListTable :dbData="dbGetData" @loadMoreData="loadMoreData" @initData="initDbData" @selectItem="selectItem" @refresh="refresh"/>
    </div>
    <div class='listBox'>
      <ListInfo :dbData="dbGetData" :selectedItem="selectedItem"/>
      <ListWbcImg v-if="!bmClassIsBoolen" :dbData="dbGetData" :selectedItem="selectedItem"/>
      <ListBmImg v-if="bmClassIsBoolen" :dbData="dbGetData" :selectedItem="selectedItem"/>
    </div>
  </div>
  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />
</template>

<script setup lang="ts">

import ListTable from "@/views/datebase/commponent/list/listTable.vue";
import ListInfo from "@/views/datebase/commponent/list/listInfo.vue";
import ListWbcImg from "@/views/datebase/commponent/list/listWbcImg.vue";
import {getCurrentInstance, onMounted, ref} from "vue";
import {getRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import moment from "moment/moment";
import Datepicker from "vue3-datepicker";
import {formatDate} from "@/common/lib/utils/dateUtils";
import ListBmImg from "@/views/datebase/commponent/list/listBmImg.vue";
import Alert from "@/components/commonUi/Alert.vue";
import * as XLSX from 'xlsx';


const dbGetData = ref<any[]>([]);
const showAlert = ref(false);
const alertMessage = ref('');

const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);

const startDate = ref(thirtyDaysAgo);
const endDate = ref(new Date());
const searchText = ref('');
const searchType = ref('barcodeNo');
const page = ref(1);
const selectedItem = ref({});
const titleItem = ref<any>([]);
const titleItemArr = ref([]);
const nrCount = ref(0);
const testType = ref('');
const wbcCountOrder = ref('');
const classListToggle = ref(false);
const bmClassIsBoolen = ref(false);
const instance = getCurrentInstance();

instance?.appContext.config.globalProperties.$socket.on('stateVal', async (data) => { // 동시 접속자 제어 하는 곳
  await initDbData();
})
onMounted(async () => {
  await initDbData();
  bmClassIsBoolen.value = window.PROJECT_TYPE === 'bm';
});

const classListToggleEvent = () => {
  classListToggle.value = !classListToggle.value;
}
const changeTestType = (value: any) => {
  testType.value = testType.value === value ? '' : value;
}

const updateFilter = () => {
  const selectedItems = titleItem.value?.filter((item: any) => item.checked).map((item: any) => item.title);
  titleItemArr.value = selectedItems;
}

const initDbData = async () => {
  titleItem.value = [];
  // 이전 조회 결과 및 검색 조건 불러오기
  // const lastQuery = loadLastQuery();
  const lastSearchParams = loadLastSearchParams();
  // 이전 검색 조건 적용
  if (Object.keys(lastSearchParams).length !== 0) {
    searchType.value = lastSearchParams.searchType || 'barcodeNo';
    searchText.value = lastSearchParams.searchText || '';
    startDate.value = new Date(lastSearchParams.startDate) || new Date();
    endDate.value = new Date(lastSearchParams.endDate) || new Date();
    page.value = lastSearchParams.page || 1;

    const numberOfCalls = Number(lastSearchParams.page) || 1;
    for (let i = 1; i <= numberOfCalls; i++) {
      await getDbData('mounted', i);
    }
  } else {
    await getDbData('mounted', 1);
  }
}

const selectItem = (item: any) => {
  selectedItem.value = item;
};

const saveLastSearchParams = () => {
  const lastSearchParams = {
    page: page.value,
    searchType: searchType.value,
    searchText: searchText.value,
    startDate: formatDate(startDate.value),
    endDate: formatDate(endDate.value),
  };
  sessionStorage.setItem('lastSearchParams', JSON.stringify(lastSearchParams));
};

const loadLastSearchParams = () => {
  const storedSearchParams = sessionStorage.getItem('lastSearchParams');
  return storedSearchParams ? JSON.parse(storedSearchParams) : {};
};


const getDbData = async (type: string, pageNum?: number) => {
  if (type === 'search') {
    page.value = 1;
  }
  const requestData: any = {
    page: type !== 'mounted' ? page.value : Number(pageNum),
    pageSize: 20,
    startDay: formatDate(startDate.value),
    endDay: formatDate(endDate.value),
    barcodeNo: searchType.value === 'barcodeNo' ? searchText.value : undefined,
    patientId: searchType.value === 'patientId' ? searchText.value : undefined,
    patientNm: searchType.value === 'patientNm' ? searchText.value : undefined,
    nrCount: nrCount.value,
  };
  if (titleItemArr.value.length !== 0) {
    requestData.title = titleItemArr.value;
  }

  if (testType.value !== '00' && testType.value !== '') {
    requestData.testType = testType.value;
  }

  if (wbcCountOrder.value !== '' && wbcCountOrder.value !== 'all') {
    requestData.wbcCountOrder = wbcCountOrder.value;
  }

  try {
    const result = await getRunningApi(requestData);
    if (result && result.data) {

      const newData = result.data.data;
      if (newData.length === 0) {
        if (page.value === 1) {
          page.value = 1;
        } else {
          page.value -= 1;
        }
        if (newData.length === 0 && String(result.data?.page) === '1') {
          dbGetData.value = newData;
        }
      } else {
        if (type === 'search') {
          dbGetData.value = newData;
        } else {
          // dbGetData.value = [...dbGetData.value, ...newData];
          newData.forEach((item: any) => {
            const index = dbGetData.value.findIndex(data => data.id === item.id);
            if (index !== -1) {
              dbGetData.value[index] = item;
            } else {
              dbGetData.value.push(item);
            }
          });
        }

        // dbGetData.value = Array.from(new Set(dbGetData.value.map(item => item.id))).map(id => dbGetData.value.find(item => item.id === id));
        titleItem.value = dbGetData.value[0]?.wbcInfo?.wbcInfo[0];
        if (wbcCountOrder.value === '' || wbcCountOrder.value === 'all') {
          dbGetData.value = dbGetData.value.sort((a, b) => {
            const dateA = moment(a.analyzedDttm, 'YYYYMMDDHHmmssSSS');
            const dateB = moment(b.analyzedDttm, 'YYYYMMDDHHmmssSSS');

            // Moment.js의 diff 메서드를 사용하여 날짜 차이 계산
            return dateB.diff(dateA);
          });
        }
        // 마지막 조회 결과 저장
        saveLastSearchParams();
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const search = () => {
  const diffInMs = endDate.value.getTime() - startDate.value.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  if (diffInDays > 30) {
    showSuccessAlert("You cannot select a period of more than 30 days.");
    return;
  }
  getDbData('search');
};

const refresh = () => {
  getDbData('search');
}

const loadMoreData = async () => {
  page.value += 1;
  await getDbData('loadMoreData');
};

const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

const exportToExcel = () => {
  const filteredData = dbGetData.value.map(item => {
    const getImageCount = (wbcInfo: any, name: any) => {
      const wbc = wbcInfo?.find((wbc: any) => wbc.name === name);
      return wbc ? wbc.images.length : 0;
    };

    const getImageCountFromBoth = (wbcInfo: any, name: any) => {
      const wbc = wbcInfo?.wbcInfo[0].find((wbc: any) => wbc.name === name);
      return wbc ? wbc.images.length : 0;
    };

    return {
      SERIAL_NO: item?.slotId,
      barcodeNo: item?.barcodeNo,
      patientId: item?.patientId,
      patientNm: item?.patientNm,
      ANALYZE_DTTM: item?.analyzedDttm,
      TACT_TIME: item?.tactTime,
      BIRTHDAY: item?.birthDay,
      GENDER: item?.gender,
      WBC_COMMENT: item?.wbcMemo,
      A_Neutrophil_Segmented: getImageCount(item?.wbcInfoAfter, 'Neutrophil-Segmented'),
      B_Neutrophil_Segmented: getImageCountFromBoth(item?.wbcInfo, 'Neutrophil-Segmented'),
      A_Neutrophil_Band: getImageCount(item?.wbcInfoAfter, 'Neutrophil-Band'),
      B_Neutrophil_Band: getImageCountFromBoth(item?.wbcInfo, 'Neutrophil-Band'),
      A_Metamyelocyte: getImageCount(item?.wbcInfoAfter, 'Metamyelocyte'),
      B_Metamyelocyte: getImageCountFromBoth(item?.wbcInfo, 'Metamyelocyte'),
      A_Myelocyte: getImageCount(item?.wbcInfoAfter, 'Myelocyte'),
      B_Myelocyte: getImageCountFromBoth(item?.wbcInfo, 'Myelocyte'),
      A_Promyelocyte: getImageCount(item?.wbcInfoAfter, 'Promyelocyte'),
      B_Promyelocyte: getImageCountFromBoth(item?.wbcInfo, 'Promyelocyte'),
      A_Lymphocyte: getImageCount(item?.wbcInfoAfter, 'Lymphocyte'),
      B_Lymphocyte: getImageCountFromBoth(item?.wbcInfo, 'Lymphocyte'),
      A_Reactive_lymphocyte: getImageCount(item?.wbcInfoAfter, 'Reactive lymphocyte'),
      B_Reactive_lymphocyte: getImageCountFromBoth(item?.wbcInfo, 'Reactive lymphocyte'),
      A_Abnormal_lymphocyte: getImageCount(item?.wbcInfoAfter, 'Abnormal lymphocyte'),
      B_Abnormal_lymphocyte: getImageCountFromBoth(item?.wbcInfo, 'Abnormal lymphocyte'),
      A_Eosinophil: getImageCount(item?.wbcInfoAfter, 'Eosinophil'),
      B_Eosinophil: getImageCountFromBoth(item?.wbcInfo, 'Eosinophil'),
      A_Basophil: getImageCount(item?.wbcInfoAfter, 'Basophil'),
      B_Basophil: getImageCountFromBoth(item?.wbcInfo, 'Basophil'),
      A_Blast: getImageCount(item?.wbcInfoAfter, 'Blast'),
      B_Blast: getImageCountFromBoth(item?.wbcInfo, 'Blast'),
      A_Plasma_cell: getImageCount(item?.wbcInfoAfter, 'Plasma cell'),
      B_Plasma_cell: getImageCountFromBoth(item?.wbcInfo, 'Plasma cell'),
      A_nRBC: getImageCount(item?.wbcInfoAfter, 'nRBC'),
      B_nRBC: getImageCountFromBoth(item?.wbcInfo, 'nRBC'),
      A_Giant_platelet: getImageCount(item?.wbcInfoAfter, 'Giant platelet'),
      B_Giant_platelet: getImageCountFromBoth(item?.wbcInfo, 'Giant platelet'),
      A_Platelet_aggregation: getImageCount(item?.wbcInfoAfter, 'Platelet aggregation'),
      B_Platelet_aggregation: getImageCountFromBoth(item?.wbcInfo, 'Platelet aggregation'),
      A_Smudge: getImageCount(item?.wbcInfoAfter, 'Smudge'),
      B_Smudge: getImageCountFromBoth(item?.wbcInfo, 'Smudge'),
      A_Malaria: getImageCount(item?.wbcInfoAfter, 'Malaria'),
      B_Malaria: getImageCountFromBoth(item?.wbcInfo, 'Malaria'),
      // 필요한 필드 추가
    };
  });


  const ws = XLSX.utils.json_to_sheet(filteredData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  // 현재 날짜와 시간을 기반으로 파일 이름 생성
  const now = moment().format("YYYYMMDDHHmmss");
  const fileName = `${now}_resultData.xlsx`;

  XLSX.writeFile(wb, fileName);
};


</script>
