<template>
  <div>
    <h3 class="titleH3">
      Classification List
      <button @click="classListToggleEvent" class="classificationListBtn">
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
          <input type="text" v-model='searchText' class="searchInputBox" @keydown.enter="handleEnter" ref="barcodeInput"   @focus="handleFocus"/>
          <button class="searchClass" @click="dateRefresh">
            <font-awesome-icon :icon="['fas', 'calendar-days']"/>
            Refresh
          </button>
          <div class="settingDatePickers">
            <Datepicker v-model="startDate"></Datepicker>
            <Datepicker v-model="endDate"></Datepicker>
          </div>

          <button type="button" class="searchClass" @click="search">Search</button>
          <div v-if="viewerCheck !== 'viewer'" class="excelDivList">
            <font-awesome-icon :icon="['fas', 'file-csv']" @click="exportToExcel"/>
          </div>
        </div>


        <!-- Classification List Modal -->
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
            <span>{{ bmClassIsBoolen ? 'BM' : 'WBC' }} Info Filter</span>
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
                  <span>Biopsy</span></label>
                <label><input type="checkbox" value="06" @change="changeTestType('06')" :checked="testType === '06'"/>
                  <span>Squash</span></label>
              </template>
            </div>

          </div>
        </div>


      </div>
      <keep-alive>
        <ListTable
            :loadingDelayParents="loadingDelayParents"
            :dbData="dbGetData"
            @loadMoreData="loadMoreData"
            @loadPrevData="loadPrevData"
            @initData="initDbData"
            @selectItem="selectItem"
            @refresh="refresh"
            @checkListItem="checkListItem"
            :selectedItemIdFalse="selectedItemIdFalse"
            :notStartLoading='notStartLoading'
        />
      </keep-alive>
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
import {computed, getCurrentInstance, onBeforeMount, onBeforeUnmount, onMounted, ref, watch, watchEffect} from "vue";
import {getRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import moment from "moment/moment";
import Datepicker from "vue3-datepicker";
import {formatDate} from "@/common/lib/utils/dateUtils";
import ListBmImg from "@/views/datebase/commponent/list/listBmImg.vue";
import Alert from "@/components/commonUi/Alert.vue";
import * as XLSX from 'xlsx';
import {executeExcelCreate} from "@/common/api/service/excel/excelApi";
import {useStore} from "vuex";
import pako from "pako";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";


const store = useStore();
const dbGetData = ref<any[]>([]);
const showAlert = ref(false);
const alertMessage = ref('');

const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 29);

const startDate = ref(thirtyDaysAgo);
const endDate = ref(new Date());
const searchText = ref('');
const searchType = ref('barcodeNo');
const page = ref(1);
const prevPage = ref(1);
const selectedItem = ref<any>({});
const titleItem = ref<any>([]);
const titleItemArr = ref([]);
const nrCount = ref(0);
const testType = ref('');
const wbcCountOrder = ref('');
const classListToggle = ref(false);
const bmClassIsBoolen = ref(false);
const instance = getCurrentInstance();
const prevDataPage = ref('');
const reqDataPrev = ref('');
const checkedSelectedItems = ref<any>([]);
const iaRootPath = ref<any>(store.state.commonModule.iaRootPath);
const dataBaseOneCall = ref<any>(store.state.commonModule.dataBaseOneCall);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const apiBaseUrl = viewerCheck.value === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;
const nonWbcTitles = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM'];
const eventTriggered = ref(false);
const loadingDelayParents = ref(false);
const selectedItemIdFalse = ref(false);
const notStartLoading = ref(false);
const barcodeInput = ref<any>(null); // 입력 필드에 대한 ref

function handleStateVal(data: any) {
  eventTriggered.value = true;
  notStartLoading.value = false;
  initDbData().then(() => {
    // loadingDelayParents.value = false;
  });
}

onBeforeMount(async () => {
  bmClassIsBoolen.value = window.PROJECT_TYPE === 'bm';
})

onMounted(async () => {
  if (!eventTriggered.value) {
    await initDbData();
    // loadingDelayParents.value = true;
  }

  document.addEventListener('click', closeClassListBox);
  barcodeInput.value.focus();

  notStartLoading.value = true;
  instance?.appContext.config.globalProperties.$socket.on('stateVal', handleStateVal);
  document.addEventListener('keydown', handleGlobalKeydown);

});
const handleGlobalKeydown = (event: any) => {
  if (event.key === 'Enter' || event.key === 'Tab') {
    // Enter 키가 눌리면 입력 필드에 포커스를 설정
    barcodeInput.value.focus();
  }
};


const handleFocus = () => {
  // 포커스가 되어 있지 않을 때 포커스를 강제로 설정
  barcodeInput.value.focus();
};


const handleEnter = () => {
  // Enter 키가 눌렸을 때 처리할 로직
  // console.log('바코드 입력:', searchText.value);
  searchText.value = ''; // 입력 필드를 비우거나 다른 처리를 할 수 있음

  // 포커스를 다시 입력 필드로 이동
  barcodeInput.value.focus();
};

onBeforeUnmount(() => {
  // instance?.appContext.config.globalProperties.$socket.off('stateVal', handleStateVal);
  document.removeEventListener('click', closeClassListBox);
});

const closeClassListBox = (event: MouseEvent) => {
  const selectBox = document.querySelector('.filterDivBox');
  const selectButton = document.querySelector('.classificationListBtn');
  if (selectButton && selectButton.contains(event.target as Node)) return;
  if (selectBox && !selectBox.contains(event.target as Node)) {
    classListToggle.value = false; // 셀렉트 박스 닫기
  }
};

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
  // titleItem.value = [];
  // 이전 조회 결과 및 검색 조건 불러오기
  loadingDelayParents.value = true;
  // const lastQuery = loadLastQuery();
  const lastSearchParams = loadLastSearchParams();
  // 이전 검색 조건 적용
  if (Object.keys(lastSearchParams).length !== 0) {
    searchType.value = lastSearchParams.searchType || 'barcodeNo';
    searchText.value = lastSearchParams.searchText || '';
    startDate.value = new Date(lastSearchParams.startDate) || new Date();
    endDate.value = new Date(lastSearchParams.endDate) || new Date();
    page.value = lastSearchParams.page || 1;
    // if (Number(lastSearchParams.page) !== 1) {
    //   const numberOfCalls = Number(lastSearchParams.page) || 1;
    //   if (numberOfCalls >= 4) {
    //     await getDbData('mounted', numberOfCalls - 3);
    //     await getDbData('mounted', numberOfCalls - 2);
    //     await getDbData('mounted', numberOfCalls - 1);
    //     prevPage.value = numberOfCalls - 3
    //   } else {
    //     await getDbData('mounted', numberOfCalls - 1);
    //     prevPage.value = numberOfCalls - 1
    //   }
    //   await getDbData('mounted', numberOfCalls);
    // } else {
    //   await getDbData('mounted', 1);
    // }
    // const numberOfCalls = Number(lastSearchParams.page) || 1;
    // for (let i = 1; i <= numberOfCalls; i++) {
    //   await getDbData('mounted', i);
    // }
    await getDbData('search') ;
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
    prevPage: prevPage.value,
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
    checkedSelectedItems.value = [];
    selectedItemIdFalse.value = true;
    notStartLoading.value = true;
    page.value = 1;
  } else {
    selectedItemIdFalse.value = false;
    notStartLoading.value = false;
  }
  let pageChange = 0;
  if(type === 'loadMoreData'){
    pageChange = page.value;
  }else if(type === 'loadPrevData'){
    pageChange = prevPage.value;
  }else{
    pageChange = page.value;
  }
  const requestData: any = {
    page: type !== 'mounted' ? pageChange : Number(pageNum),
    pageSize: 20,
    startDay: formatDate(startDate.value),
    endDay: formatDate(endDate.value),
    barcodeNo: searchType.value === 'barcodeNo' ? searchText.value : undefined,
    patientId: searchType.value === 'patientId' ? searchText.value : undefined,
    patientNm: searchType.value === 'patientNm' ? searchText.value : undefined,
    nrCount: nrCount.value,
  };
  if (prevDataPage.value === '') {
    prevDataPage.value = requestData.page;
  }
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
    if(page.value === 1 && result.data.data.length === 0){
      loadingDelayParents.value = false;
      return;
    }
    if (result && result.data) {
      prevDataPage.value = requestData.page;
      reqDataPrev.value = requestData;
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

        if(titleItem.value.length === 0){
          titleItem.value = dbGetData.value[0]?.wbcInfo?.wbcInfo[0];
        }

        if (wbcCountOrder.value === '' || wbcCountOrder.value === 'all') {
          dbGetData.value = dbGetData.value.sort((a, b) => {
            const dateA = moment(a.analyzedDttm, 'YYYYMMDDHHmmssSSS');
            const dateB = moment(b.analyzedDttm, 'YYYYMMDDHHmmssSSS');

            // Moment.js의 diff 메서드를 사용하여 날짜 차이 계산
            return dateB.diff(dateA);
          });
        }
        // 마지막 조회 결과 저장
        if (dbGetData.value.length !== 0) {
          saveLastSearchParams();
        }else{
          page.value -= 1;
        }

      }
    }
    if(dbGetData.value.length > 0){
      await store.dispatch('commonModule/setCommonInfo', { dbListDataFirstNum: Number(dbGetData.value[0].id) })
      await store.dispatch('commonModule/setCommonInfo', { dbListDataLastNum: Number(dbGetData.value[dbGetData.value.length - 1].id)})
    }


  } catch (e) {
    console.error(e);
  }
};

const search = () => {
  dbGetData.value = [];
  sessionStorage.removeItem('lastSearchParams');
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

const loadPrevData = async () => {

  prevPage.value = loadLastSearchParams().prevPage;
  prevPage.value -= 1;
  if (prevPage.value <= 0) {
    return;
  }
  await getDbData('loadPrevData');
};

const showSuccessAlert = async (message: string) => {
  showAlert.value = true;
  alertMessage.value = message;

};

const hideAlert = () => {
  showAlert.value = false;
};

const exportToExcel = async () => {
  if (checkedSelectedItems.value.length === 0) {
    showSuccessAlert('Select an Item')
    return;
  }

  /** RBC Excel Print */
  await convertRbcData(checkedSelectedItems.value);

  // WBC Print
  await excecuteExcel()
}

const excecuteExcel = async () => {
  const folderName = checkedSelectedItems.value[0].testType === '01' || checkedSelectedItems.value[0].testType === '04' ? '01_WBC_Classification' : '05_BF_Classification';
  const path = selectedItem.value?.img_drive_root_path !== '' && selectedItem.value?.img_drive_root_path ? selectedItem.value?.img_drive_root_path : iaRootPath.value;
  const body = checkedSelectedItems.value.map((checkedItem: any) => {
    return `${path}\\${checkedItem.slotId}\\${folderName}`
  });

  try {
    await executeExcelCreate(body);
  } catch (e) {
    console.log(e);
  }
}

const convertRbcData = async (dataList: any) => {
  let beforeRbcData = {};
  let afterRbcData = {};
  for (const data of dataList) {
    const sendingItem = { before: {}, after: {} };
    const shapeOthersCount: any = await getShapeOthers(data);

    // Before
    for (const classItem of data.rbcInfo.rbcClass) {
      let beforeItem = {}
      for (const classInfoItem of classItem.classInfo) {
        const classInfoDetailItem = {[classInfoItem.classNm]: { degree: classInfoItem.degree, count: Number(classInfoItem.originalDegree) }}
        beforeItem = { ...beforeItem, ...classInfoDetailItem }

        // Add Malaria
        if (classInfoItem.classNm === 'Basophilic Stippling') {
          beforeItem = { ...beforeItem, ...{ Malaria: { degree: '-', count: Number(data.rbcInfo.malariaCount) }} }
        }
      }

      if (classItem.categoryNm === 'Shape') {
        beforeItem = { ...beforeItem, ...{ Others: { degree: '-', count: Number(shapeOthersCount.doubleNormal + shapeOthersCount.artifact) } } }
      }

      beforeRbcData = { ...beforeRbcData, ...{ [classItem.categoryNm]: beforeItem } }

      // Add Others
      if (classItem.categoryNm === 'Inclusion Body') {
        beforeRbcData = { ...beforeRbcData, ...{ Others: { Platelet: { degree: '-', count: Number(data.rbcInfo.pltCount) }}}}
      }

    }

    // After
    for (const classItem of data.rbcInfoAfter) {
      let afterItem = {}
      for (const classInfoItem of classItem.classInfo) {
        const classInfoDetailItem = {[classInfoItem.classNm]: { degree: classInfoItem.degree, count: Number(classInfoItem.originalDegree) }}
        afterItem = {...afterItem, ...classInfoDetailItem}

        // Add Malaria
        if (classInfoItem.classNm === 'Basophilic Stippling') {
          afterItem = { ...afterItem, ...{ Malaria: { degree: '-', count: Number(data.rbcInfo.malariaCount) }} }
        }
      }

      if (classItem.categoryNm === 'Shape') {
        afterItem = { ...afterItem, ...{ Others: { degree: '-', count: Number(shapeOthersCount.doubleNormal + shapeOthersCount.artifact) } } }
      }

      afterRbcData = { ...afterRbcData, ...{ [classItem.categoryNm]: afterItem } }

      // Add Others
      if (classItem.categoryNm === 'Inclusion Body') {
        afterRbcData = { ...afterRbcData, ...{ Others: { Platelet: { degree: '-', count: Number(data.rbcInfo.pltCount) }}}}
      }
    }
    sendingItem.before = beforeRbcData;
    sendingItem.after = afterRbcData;

    await createRbcJson(data.slotId, sendingItem);
  }


}

const createRbcJson = async (slotId: string, sendingData: any) => {
  const jsonString = JSON.stringify(sendingData);
  const utf8Data = new TextEncoder().encode(jsonString);
  const compressedData = pako.deflate(utf8Data);
  const blob = new Blob([compressedData], {type: 'application/octet-stream'});
  const formData = new FormData();
  formData.append('file', blob, `RBC.json`);
  const path = selectedItem.value?.img_drive_root_path !== '' && selectedItem.value?.img_drive_root_path ? selectedItem.value?.img_drive_root_path : iaRootPath.value;
  const filePath = `${path}/${slotId}/RBC_Analysis.json`
  try {
    await fetch(`${apiBaseUrl}/jsonReader/upload?filePath=${filePath}`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

const getShapeOthers = async (selectItems: any) => {
  const path = selectItems.img_drive_root_path !== '' && selectItems.img_drive_root_path ? selectItems?.img_drive_root_path : iaRootPath.value;
  const url_Old = `${path}/${selectItems.slotId}/03_RBC_Classification/${selectItems.slotId}.json`;
  const response_old = await readJsonFile({fullPath: url_Old});
  const rbcInfoPathAfter = response_old.data[0].rbcClassList;
  const otherCount = { artifact: 0, doubleNormal: 0 };
  if(!rbcInfoPathAfter){
    return;
  }
  rbcInfoPathAfter.forEach((item: any) => {
    if (item.categoryId === '03') {
      for (const classItem of item.classInfo) {
        if (classItem.classNm === 'Artifact') {
          otherCount.artifact += 1
        } else if (classItem.classNm === 'DoubleNormal') {
          otherCount.doubleNormal += 1
        }
      }
    }
  })

  return otherCount;
}

const dateRefresh = () => {
  startDate.value = thirtyDaysAgo
  endDate.value = new Date();
  search();
}

const checkListItem = (items: any) => {
  checkedSelectedItems.value = items;
}


</script>
