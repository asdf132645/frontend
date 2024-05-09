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
          <button class="searchClass" @click="search">Search</button>
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
          <div class="wbcInfoFilter" v-if="!bmClassIsBoolen">
            <span>WBC Info Filter</span>
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
              <label><input type="checkbox" value="00" @change="changeTestType('00')" :checked="testType === '00'"/><span>ALL</span></label>
              <label><input type="checkbox" value="01" @change="changeTestType('01')" :checked="testType === '01'"/>
                <span>Diff</span></label>
              <label><input type="checkbox" value="02" @change="changeTestType('02')" :checked="testType === '02'"/>
                <span>PBS</span></label>
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

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const dbGetData = ref<any[]>([]);
const emits = defineEmits();


const startDate = ref(new Date());
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
  bmClassIsBoolen.value = process.env.PROJECT_TYPE === 'bm';
});

const classListToggleEvent = () => {
  classListToggle.value = !classListToggle.value;
}
const changeTestType = (value: any) => {
  testType.value = testType.value === value ? '' : value;
}

const updateFilter = () => {
  const selectedItems = titleItem.value?.filter(item => item.checked).map(item => item.title);
  titleItemArr.value = selectedItems;
}

const initDbData = async () => {
  userId.value = getStoredUser.id;
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
  // console.log(startDate.value);
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
          newData.forEach(item => {
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
            const dateA = moment(a.createDate, 'YYYYMMDDHHmmssSSS');
            const dateB = moment(b.createDate, 'YYYYMMDDHHmmssSSS');

            // Moment.js의 diff 메서드를 사용하여 날짜 차이 계산
            return dateB.diff(dateA);
          });

          console.log(dbGetData.value);
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
  getDbData('search');
};

const refresh = () => {
  getDbData('search');
}

const loadMoreData = async () => {
  page.value += 1;
  await getDbData('loadMoreData');
};

</script>
