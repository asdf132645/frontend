<template>
  <div class="loaderBackgroundForLogin" v-if="isPrintingExcel">
    <div class="loaderForLogin"></div>
    <p class="loadingTextLogin">Loading...</p>
  </div>

  <div>
    <h3 class="titleH3">
      Classification List
      <button @click.stop="classListToggleEvent" class="classificationListBtn">
        <font-awesome-icon v-if="!classListToggle" :icon="['fas', 'caret-up']" flip="vertical" />
        <font-awesome-icon v-else :icon="['fas', 'caret-up']" />
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
          <div class="search-container">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="search-icon" />
            <input type="text" v-model="searchText" placeholder="Search" class="searchInputBox" @keydown.enter="handleEnter" ref="barcodeInput" @input="handleInput"/>
          </div>          <div class="settingDatePickers">
            <Datepicker v-model="startDate" :week-starts-on="0"></Datepicker>
            <Datepicker v-model="endDate" :week-starts-on="0"></Datepicker>
          </div>
          <button class="searchClass" @click="setDateToday">Today</button>
          <button class="searchClass" @click="dateRefresh">Clear</button>
          <button type="button" class="searchClass" @click="search">Search</button>

          <div class="search-right-wrapper">
            <button v-if="HOSPITAL_SITE_CD_BY_NAME['SD의학연구소'] === siteCd" @click="openCheckList" class="search-btn">Patient List</button>
            <font-awesome-icon v-if="viewerCheck === 'main'" :icon="['fas', 'file-csv']" @click="exportToExcel" class="excelIcon" />
          </div>
        </div>


        <!-- Classification List Modal -->
        <div class="filterDivBox" v-if="classListToggle">
          <div class="nrCount" v-if="!bmClassIsBoolen">
            <span>NR Count</span>
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
              <label>
                <input type="checkbox" value="00" @change="changeTestType('00')" :checked="testType === '00'"/>
                <span>All</span>
              </label>
              <template v-if="!bmClassIsBoolen">
                <label>
                  <input type="checkbox" value="01" @change="changeTestType('01')" :checked="testType === '01'"/>
                  <span>Diff</span>
                </label>
                <label>
                  <input type="checkbox" value="04" @change="changeTestType('04')" :checked="testType === '04'"/>
                  <span>PBS</span>
                </label>
              </template>

              <template v-if="bmClassIsBoolen">
                <label>
                  <input type="checkbox" value="02" @change="changeTestType('02')" :checked="testType === '02'"/>
                  <span>Wedge</span>
                </label>
                <label>
                  <input type="checkbox" value="04" @change="changeTestType('04')" :checked="testType === '04'"/>
                  <span>Biopsy</span>
                </label>
                <label>
                  <input type="checkbox" value="06" @change="changeTestType('06')" :checked="testType === '06'"/>
                  <span>Squash</span>
                </label>
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
            @disableSelectItem="disableSelectItem"
            :selectedItemIdFalse="selectedItemIdFalse"
            :notStartLoading='notStartLoading'
        />
      </keep-alive>
    </div>
    <div class='listBox'>
      <ListInfo :dbData="dbGetData" :selectedItem="selectedItem"/>
      <template v-if="visibleBySite(siteCd, [
          HOSPITAL_SITE_CD_BY_NAME['UIMD'],
          HOSPITAL_SITE_CD_BY_NAME['TEST'],
          HOSPITAL_SITE_CD_BY_NAME['원자력병원'],
          HOSPITAL_SITE_CD_BY_NAME['인천길병원'],
      ], 'enable')">
        <NewListImg :dbData="dbGetData" :selectedItem="selectedItem"/>
      </template>
      <template v-else>
        <ListImg :dbData="dbGetData" :selectedItem="selectedItem"/>
      </template>

    </div>
  </div>

  <PopupTable v-model:isOpen="showPopupTable" :workList="workList" />


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
import NewListImg from "@/views/datebase/commponent/list/newListImg.vue";
import ListImg from "@/views/datebase/commponent/list/listImg.vue";
import {
  computed,
  getCurrentInstance,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import {
  detailRunningApi,
  getRunningApi,
  removePageAllDataApi,
} from "@/common/api/service/runningInfo/runningInfoApi";
import moment from "moment/moment";
import Datepicker from "vue3-datepicker";
import {formatDate} from "@/common/lib/utils/dateUtils";
import Alert from "@/components/commonUi/Alert.vue";
import {executeExcelCreate} from "@/common/api/service/excel/excelApi";
import {useStore} from "vuex";
import pako from "pako";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import {useRouter} from "vue-router";
import Button from "@/components/commonUi/Button.vue";
import PopupTable from "@/components/commonUi/PopupTable.vue";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import {RBC_CODE_CLASS_ID, SHOWING_RBC_SHAPE_CLASS_IDS} from "@/common/defines/constants/dataBase";
import { sdPatientNameGetAPI, sdWorklistsAPI } from "@/common/helpers/lisCbc/sdCbcLis";
import {isObjectEmpty} from "@/common/lib/utils/validators";
import { WbcInfo } from "@/store/modules/testPageCommon/ruuningInfo";
import { DIR_NAME } from "@/common/defines/constants/settings";
import {getDeviceIpApi} from "@/common/api/service/device/deviceApi";
import {visibleBySite} from "@/common/lib/utils/visibleBySite";


const store = useStore();
const router = useRouter();
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
const testType = ref('00');
const wbcCountOrder = ref('all');
const classListToggle = ref(false);
const bmClassIsBoolen = ref(false);
const instance = getCurrentInstance();
const prevDataPage = ref('');
const reqDataPrev = ref('');
const checkedSelectedItems = ref<any>([]);
const iaRootPath = ref<any>(store.state.commonModule.iaRootPath);
const viewerCheck = computed(() => store.state.commonModule.viewerCheck);
const apiBaseUrl = viewerCheck.value === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;
const siteCd = computed(() => store.state.commonModule.siteCd);
const eventTriggered = ref(false);
const loadingDelayParents = ref(false);
const selectedItemIdFalse = ref(false);
const notStartLoading = ref(false);
const barcodeInput = ref<HTMLInputElement | null>(null);
const isPrintingExcel = ref(false);
const rbcInfoPathAfter = ref<any>([]);
const shapeOthersCount = ref(0);

const maxRbcCount = ref(0);
const pltCount = ref(0);
const malariaCount = ref(0);
const rbcTotalVal = ref(0);
const sizeChromiaTotal = ref(0);
const chromiaTotalTwo = ref(0);
const shapeBodyTotal = ref(0);
const rbcDegreeStandard = ref<any>([]);
const rbcInfoAfterVal = ref<any>([]);
const rbcInfoBeforeVal = ref<any>([]);
const inputTimeout = ref<any>(null);
const bufferDelay = 100; // 입력 완료 감지 지연 시간 (ms)
const inputBuffer = ref('');
const showPopupTable = ref(false);
const workList = ref({});
const previousValue = ref('');
let lastInputTime = Date.now();
const isBarcodeScannerInput = { value: false };
const myip = ref('');


onBeforeMount(async () => {
  bmClassIsBoolen.value = window.PROJECT_TYPE === 'bm';
})

onMounted(async () => {
  if (!eventTriggered.value) {
    await initDbData();
    // loadingDelayParents.value = true;
  }

  document.addEventListener('click', closeClassListBox);
  if (barcodeInput.value) {
    barcodeInput.value.focus();
  }

  notStartLoading.value = true;
  instance?.appContext.config.globalProperties.$socket.on('stateVal', handleStateVal);
  document.addEventListener('keydown', handleGlobalKeydown);
  myip.value = await getDeviceIpApi();

});

async function handleStateVal(data: any) {
  if (data?.payload !== 'refreshDb') {
    const match = data.match(/(\d+\.\d+\.\d+\.\d+)/);

    const extractedIP = match ? match[1] : null;

    if (extractedIP && extractedIP === myip.value.data) {
      return;
    }
  }



  eventTriggered.value = true;
  notStartLoading.value = false;
  await removePageAllDataApi();
  await initDbData();
}

const setDateToday = () => {
  startDate.value = new Date();
  endDate.value = new Date();
  search();
}

// 이벤트 핸들러 함수
const handleInput = (event: any) => {
  if (!event.data) return;

  // 현재 입력 시간
  const currentTime = Date.now();

  // 현재 입력과 마지막 입력 사이의 시간 차이 계산
  const timeDiff = currentTime - lastInputTime;

  // 바코드 리더기에서 입력된 것인지 확인 (시간 차이가 50ms 이하이면 바코드 리더기에서 입력된 것으로 간주)
  if (timeDiff < 50) {
    isBarcodeScannerInput.value = true;
  } else {
    isBarcodeScannerInput.value = false;
  }

  // 마지막 입력 시간을 현재 시간으로 업데이트
  lastInputTime = currentTime;

  // 바코드 리더기 입력이 아니면 이벤트 종료
  if (!isBarcodeScannerInput.value) {
    return;
  }

  // 입력 버퍼에 추가된 문자
  inputBuffer.value += event.data;

  // 이전 타이머가 설정되어 있으면 클리어
  if (inputTimeout.value) {
    clearTimeout(inputTimeout.value);
  }

  // 새로운 타이머 설정
  inputTimeout.value = setTimeout(() => {
    // 입력 완료로 간주
    const trimmedValue = inputBuffer.value.trim();

    // 입력된 값과 이전 값이 다를 때만 업데이트
    if (trimmedValue !== previousValue.value) {
      searchText.value = trimmedValue;
      previousValue.value = trimmedValue;
    }

    // search버퍼 초기화
    inputBuffer.value = '';
    search();
  }, bufferDelay);
};

const openCheckList = async () => {
  const formattedDate = moment(today).format('YYYY-MM-DD');
  const { data, code } = await sdWorklistsAPI(formattedDate);
  if (Number(code) === 200) {
    workList.value = data;
    showPopupTable.value = true;
  } else {
    await showSuccessAlert('불러오기에 실패했습니다');
  }
}


const handleGlobalKeydown = (event: any) => {
  if (router.currentRoute.value.path === '/dataBase') {
    if (event.key === 'Enter' || event.key === 'Tab') {
      setTimeout(() => {
        if (barcodeInput.value) {
          barcodeInput.value.focus();
          searchText.value = searchText.value.trim();
          const trimmedValue = searchText.value.trim();
          if (trimmedValue !== previousValue.value) {
            // 입력된 값과 이전 값이 다를 때만 업데이트
            previousValue.value = trimmedValue;
          }
        }
      }, 10); // 아주 짧은 지연을 주어 바코드 리더기가 입력을 시작할 수 있도록 함

    }
  }
};

const handleEnter = () => {
  if (barcodeInput.value) {
    search();
  }
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
  titleItemArr.value = selectedItems ?? [];
}

const initDbData = async () => {
  // 이전 조회 결과 및 검색 조건 불러오기
  loadingDelayParents.value = true;
  // const lastQuery = loadLastQuery();
  const lastSearchParams = loadLastSearchParams();
  // 이전 검색 조건 적용
  if (!isObjectEmpty(lastSearchParams)) {
    page.value = lastSearchParams.page || 1;
    searchType.value = lastSearchParams.searchType || 'barcodeNo';
    searchText.value = lastSearchParams.searchText || '';
    startDate.value = new Date(lastSearchParams.startDate) || new Date();
    endDate.value = new Date(lastSearchParams.endDate) || new Date();
    nrCount.value = lastSearchParams.nrCount;
    wbcCountOrder.value = lastSearchParams.wbcTotal;
    testType.value = lastSearchParams.testType;
    titleItemArr.value = lastSearchParams.wbcInfo ?? [];
    titleItem.value = titleItem.value.map((item: WbcInfo) => {
      if (lastSearchParams.wbcInfo.includes(item.title)) {
        return {...item, checked: true }
      }
      return item;
    })
    await getDbData('search');
  } else {
    await getDbData('mounted', 1);
  }
}

const selectItem = async (item: any) => {
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
    nrCount: nrCount.value,
    wbcTotal: wbcCountOrder.value,
    wbcInfo: titleItemArr.value,
    testType: testType.value,
  };
  sessionStorage.setItem('lastSearchParams', JSON.stringify(lastSearchParams));
  localStorage.setItem('lastSearchParams', JSON.stringify(lastSearchParams));
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
  if (type === 'loadMoreData') {
    pageChange = page.value;
  } else if (type === 'loadPrevData') {
    pageChange = prevPage.value;
  } else {
    pageChange = page.value;
  }
  const requestData: any = {
    page: type !== 'mounted' ? pageChange : Number(pageNum),
    pageSize: 20,
    startDay: searchText.value === '' ? formatDate(startDate.value) : '',
    endDay: searchText.value === '' ? formatDate(endDate.value) : '',
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
    saveLastSearchParams();

    if (page.value === 1 && result.data.data.length === 0) {
      loadingDelayParents.value = false;
      dbGetData.value = [];
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
          newData.forEach((item: any) => {
            const index = dbGetData.value.findIndex(data => data.id === item.id);
            if (index !== -1) {
              dbGetData.value[index] = item;
            } else {
              dbGetData.value.push(item);
            }
          });
        }

        if (titleItem.value.length === 0) {
          const wbcInfoItems = dbGetData.value[0]?.wbcInfo?.wbcInfo[0];
          titleItem.value = wbcInfoItems.map((item: WbcInfo) => {
            if (titleItemArr.value.includes(item.title)) {
              return {...item, checked: true };
            }
            return { ...item, checked: false };
          });
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
        //
        } else {
          page.value -= 1;
        }

      }
    }

    await getDbDataAfterFunc();

    if (dbGetData.value.length > 0) {
      const {path} = router.currentRoute.value;

      if(path === '/dataBase'){
        await store.dispatch('commonModule/setCommonInfo', {dbListDataFirstNum: Number(dbGetData.value[0].id)})
        await store.dispatch('commonModule/setCommonInfo', {dbListDataLastNum: Number(dbGetData.value[dbGetData.value.length - 1].id)})
      }
    }

  } catch (e) {
    console.error(e);
  }
};

const search = () => {
  dbGetData.value = [];

  // 전시회 갈 때 주석처리할 코드 START
  const diffInMs = endDate.value.getTime() - startDate.value.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  if (diffInDays > 31) {
    showSuccessAlert("You cannot select a period of more than 31 days.");
    return;
  }
  // 전시회 갈 때 주석처리할 코드 END

  getDbData('search');
};

const refresh = () => {
  getDbData('search');
}

const disableSelectItem = async () => {
  selectedItem.value = {};
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
    await showSuccessAlert('Select an Item')
    return;
  }
  isPrintingExcel.value = true;

  // RBC Print
  await convertRbcData(checkedSelectedItems.value);

  // WBC Print
  await excecuteExcel();
}

const excecuteExcel = async () => {
  const folderName = checkedSelectedItems.value[0].testType === '01' || checkedSelectedItems.value[0].testType === '04' ? DIR_NAME.WBC_CLASS : DIR_NAME.BM_CLASS;
  const path = selectedItem.value?.img_drive_root_path !== '' && selectedItem.value?.img_drive_root_path ? selectedItem.value?.img_drive_root_path : iaRootPath.value;
  const body = checkedSelectedItems.value.map((checkedItem: any) => {
    return `${path}\\${checkedItem.slotId}\\${folderName}`
  });

  try {
    const result: any = await executeExcelCreate(body);
    if (result.data.message === 'Application executed successfully') {
      await showSuccessAlert('Excel created');
    } else {
      await showSuccessAlert('Excel create failed');
    }
  } catch (e) {
    console.error(e);
    await showSuccessAlert('Excel create failed');
  } finally {
    isPrintingExcel.value = false;
  }
}

const convertRbcData = async (dataList: any) => {
  if (bmClassIsBoolen.value) {
    return;
  }

  let beforeRbcData = {};
  let afterRbcData = {};

  for (const item of dataList) {
    // PB & RBC일 경우
    if (item.testType !== '04') {
      continue;
    }

    const result: any = await detailRunningApi(String(item.id));
    await getRbcDegreeData();
    const data = result.data;
    rbcInfoBeforeVal.value = data.rbcInfo.rbcClass;
    rbcInfoAfterVal.value = data.rbcInfoAfter;
    await rbcTotalAndReCount(data);
    await countReAdd();
    await reDegree(rbcInfoBeforeVal.value);
    if (areDegreesIdentical(rbcInfoBeforeVal.value, rbcInfoAfterVal.value)) {
      await reDegree(rbcInfoAfterVal.value);
    }

    const sendingItem = {before: {}, after: {}};

    // Before
    for (const classItem of rbcInfoBeforeVal.value) {
      let beforeItem = {}

      const beforeCategoryId = classItem.categoryId;

      const rbcInfoItem = rbcInfoAfterVal.value.filter((item: any) => item.categoryId === beforeCategoryId)[0];


      for (const classInfoItem of classItem.classInfo) {
        const beforeClassId = classInfoItem.classId;

        const rbcDetailItem = rbcInfoItem.classInfo.filter((item: any) => item.classId === beforeClassId)[0];

        const classInfoDetailItem = {
          [classInfoItem.classNm]: {
            degree: classInfoItem.degree,
            count: Number(rbcDetailItem.originalDegree)
          }
        }
        beforeItem = {...beforeItem, ...classInfoDetailItem}

        // Add Malaria
        if (classInfoItem.classNm === 'Basophilic Stippling') {
          beforeItem = {...beforeItem, ...{Malaria: {degree: '-', count: Number(data.rbcInfo.malariaCount)}}}
        }
      }

      if (classItem.categoryNm === 'Shape') {
        beforeItem = {
          ...beforeItem, ...{
            Others: {
              degree: '-',
              count: Number(shapeOthersCount.value)
            }
          }
        }
      }

      beforeRbcData = {...beforeRbcData, ...{[classItem.categoryNm]: beforeItem}}

      // Add Others
      if (classItem.categoryNm === 'Inclusion Body') {
        beforeRbcData = {...beforeRbcData, ...{Others: {Platelet: {degree: '-', count: Number(data.rbcInfo.pltCount)}}}}
      }

    }

    // After
    for (const classItem of rbcInfoAfterVal.value) {
      let afterItem = {}
      for (const classInfoItem of classItem.classInfo) {
        const classInfoDetailItem = {
          [classInfoItem.classNm]: {
            degree: classInfoItem.degree,
            count: Number(classInfoItem.originalDegree)
          }
        }
        afterItem = {...afterItem, ...classInfoDetailItem}

        // Add Malaria
        if (classInfoItem.classNm === 'Basophilic Stippling') {
          afterItem = {...afterItem, ...{Malaria: {degree: '-', count: Number(data.rbcInfo.malariaCount)}}}
        }
      }

      if (classItem.categoryNm === 'Shape') {
        afterItem = {
          ...afterItem, ...{
            Others: {
              degree: '-',
              count: Number(shapeOthersCount.value)
            }
          }
        }
      }

      afterRbcData = {...afterRbcData, ...{[classItem.categoryNm]: afterItem}}

      // Add Others
      if (classItem.categoryNm === 'Inclusion Body') {
        afterRbcData = {...afterRbcData, ...{Others: {Platelet: {degree: '-', count: Number(data.rbcInfo.pltCount)}}}}
      }
    }
    sendingItem.before = beforeRbcData;
    sendingItem.after = afterRbcData;

    await createRbcJson(data.slotId, sendingItem);
  }
}

const areDegreesIdentical = (arr1: any[], arr2: any[]): boolean => {

  // 배열 항목 비교
  for (let i = 0; i < arr1.length; i++) {
    const item1 = arr1[i];
    const item2 = arr2[i];

    for (let j = 0; j < item1.classInfo.length; j++) {
      const classInfo1 = item1.classInfo[j];
      const classInfo2 = item2.classInfo[j];

      // degree 값 비교
      if (String(classInfo1.degree) !== String(classInfo2.degree)) {
        return false;
      }
    }
  }

  return true;
};

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
    showSuccessAlert('Excel print failed');
    isPrintingExcel.value = false;
  }
}

const rbcTotalAndReCount = async (selectItem: any) => {
  const path = selectItem?.img_drive_root_path !== '' && selectItem?.img_drive_root_path ? selectItem?.img_drive_root_path : iaRootPath.value;
  const url_new = `${path}/${selectItem?.slotId}/${DIR_NAME.RBC_CLASS}/${selectItem?.slotId}_new.json`;
  const response_new = await readJsonFile({fullPath: url_new});
  const url_Old = `${path}/${selectItem?.slotId}/${DIR_NAME.RBC_CLASS}/${selectItem?.slotId}.json`;
  const response_old = await readJsonFile({fullPath: url_Old});
  if (response_new.data !== 'not file') { // 비포 , 애프터에 따른 json 파일 불러오는 부분
    const newJsonData = response_new?.data;
    for (const rbcItem of response_old.data[0].rbcClassList) {
      for (const newRbcData of newJsonData) {
        // 기존 부분 삭제 // 여기서 index 찾아서 새로 생성된 json 부분을 추가해야함
        const foundElementIndex = rbcItem.classInfo.findIndex((el: any) =>
            Number(el.index) === Number(newRbcData.index)
        );
        if (foundElementIndex !== -1) {
          rbcItem.classInfo.splice(foundElementIndex, 1);
        }
        if (rbcItem.categoryId === newRbcData.categoryId) {
          let newRbcDataObj = {
            classNm: newRbcData.classNm,
            classId: newRbcData.classId,
            posX: String(newRbcData.posX),
            posY: String(newRbcData.posY),
            width: newRbcData.width,
            height: newRbcData.height,
            index: newRbcData.index,
          }
          rbcItem.classInfo.push(newRbcDataObj);
        }
      }
    }
    rbcInfoPathAfter.value = response_old.data[0].rbcClassList;
  } else {
    rbcInfoPathAfter.value = response_old?.data[0].rbcClassList;
  }
  if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
    console.error('rbcInfoPathAfter.value is not iterable');
    return;
  }
  let total = 0;
  let chromiaTotalval = 0;
  let shapeTotalVal = 0;
  let inclusionBody = 0;
  shapeOthersCount.value = 0;
  rbcInfoPathAfter.value.forEach(el => {
    switch (el.categoryId) {
      case RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID:
        total = el.classInfo.length;
        break;
      case RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID:
        chromiaTotalval = el.classInfo.length;
        break;
      case RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID:
        shapeTotalVal = el.classInfo.length;

        for (const classItem of el.classInfo) {
          if (!SHOWING_RBC_SHAPE_CLASS_IDS.includes(classItem.classId)) {
            shapeOthersCount.value += 1;
          }
        }
        break;
      case RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID:
        inclusionBody = el.classInfo.length;
        break;
      default:
        break;
    }
  });

  rbcTotalVal.value = Number(total);
  sizeChromiaTotal.value = Number(total);
  chromiaTotalTwo.value = chromiaTotalval;
  shapeBodyTotal.value = Number(shapeTotalVal) + Number(inclusionBody);
}

const countReAdd = async () => {
  // rbcInfoBeforeVal.value와 rbcInfoPathAfter.value가 정의되어 있는지 확인
  if (!rbcInfoAfterVal.value || !Array.isArray(rbcInfoAfterVal.value)) {
    return;
  }

  if (!rbcInfoBeforeVal.value || !Array.isArray(rbcInfoBeforeVal.value)) {
    return;
  }

  if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
    return;
  }


  for (const category of rbcInfoAfterVal.value) {
    for (const classItem of category.classInfo) {
      let count = 0;

      for (const afterCategory of rbcInfoPathAfter.value) {
        for (const afterClassItem of afterCategory.classInfo) {
          if (afterClassItem.classNm.replace(/\s+/g, '') === classItem.classNm.replace(/\s+/g, '') && afterCategory.categoryId === category.categoryId) {
            count++;
          }
        }
      }

      classItem.originalDegree = count;
    }
  }

  let totalPLT = 0;
  let malariaTotal = 0;
  for (const el of rbcInfoPathAfter.value) {
    if (el.categoryId === '01') {
      const lastElement = el.classInfo[el.classInfo.length - 1].index; // 마지막 요소 가져오기
      maxRbcCount.value = Number(lastElement.replace('S', '')) + 1;
    }
    if (el.categoryId === '04') {
      for (const xel of el.classInfo) {
        if (xel.classNm === 'Platelet') {
          totalPLT += 1;
        }
      }
    } else if (el.categoryId === '05') {
      for (const xel of el.classInfo) {
        if (xel.classNm === 'Malaria') {
          malariaTotal += 1;
        }
      }
    }
  }

  pltCount.value = Math.floor((totalPLT / parseFloat(maxRbcCount.value)) * 1000);
  malariaCount.value = malariaTotal;
};

const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi();
    const data = result.data;
    rbcDegreeStandard.value = data;
  } catch (e) {
    console.error(e);
  }
};

const reDegree = async (rbcInfoArray: any) => {
  if (bmClassIsBoolen.value) return;

  let totalCount = rbcTotalVal.value;
  let sizeTotal = sizeChromiaTotal.value;
  let chromiaTotal = chromiaTotalTwo.value;
  if (!Array.isArray(rbcInfoBeforeVal.value)) {
    return;
  }

  rbcInfoArray.forEach((rbcCategory: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.originalDegree);
          let percent = 0;

          if (degreeStandard.categoryId === '01') { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));

          } else if (degreeStandard.categoryId === '02') { // chromia total
            percent = Number(((degreeCount / chromiaTotal) * 100).toFixed(2));
          } else { // shape, inclusion body total
            percent = Number(((degreeCount / totalCount) * 100).toFixed(2));
          }
          if (isNaN(percent)) {
            percent = 0;
          }
          const setDegree = (value: any) => (rbcClass.degree = value);
          // 0
          if (percent < Number(degreeStandard.degree1)) {
            setDegree('0');
            return;
          }
          // 1
          else if (percent < Number(degreeStandard.degree2)) {
            setDegree('1');
            return;
          }
          // 2
          else if (percent < Number(degreeStandard.degree3)) {
            setDegree('2');
            return;
          }
          // 3
          else {
            setDegree('3');
            return;
          }
        }
      });
    });
  });

  rbcInfoArray.forEach((rbcCategory) => {
    rbcCategory.classInfo.forEach((rbcClass) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.originalDegree);
          let percent = 0;

          if (degreeStandard.categoryId === '01') { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));

          } else if (degreeStandard.categoryId === '02') { // chromia total
            percent = Number(((degreeCount / chromiaTotal) * 100).toFixed(2));
          } else { // shape, inclusion body total
            percent = Number(((degreeCount / totalCount) * 100).toFixed(2));
          }

          if (isNaN(percent)) {
            percent = 0;
          }

          const setDegree = (value: any) => (rbcClass.degree = value);

          // 0
          if (percent < Number(degreeStandard.degree1)) setDegree('0');
          // 1
          else if (percent < Number(degreeStandard.degree2)) setDegree('1');
          // 2
          else if (percent < Number(degreeStandard.degree3)) setDegree('2');
          // 3
          else setDegree('3');
        }
      });
    });
  });

  rbcInfoArray.forEach((rbcCategory) => {
    rbcCategory.classInfo.forEach((rbcClass) => {
      // size
      if (rbcCategory.categoryId === '01') {
        if (rbcClass.classId === '01') rbcCategory.classInfo[0].degree = '1';
        if (['02', '03'].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // chromia
      if (rbcCategory.categoryId === '02') {
        if (rbcClass.classId === '01') rbcCategory.classInfo[0].degree = '1';
        if (['02', '03'].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // Poikilocytosis
      if (rbcCategory.categoryId === '03') {
        if (rbcClass.classId === '01') {
          // normal
          rbcCategory.classInfo[0].degree = '1'
          // poikilo
          rbcCategory.classInfo[1].degree = '0'
        }

        if (rbcClass.classId !== '01' && rbcClass.classId !== '02') {
          var poikiloDegree = Number(rbcCategory.classInfo[1].degree)

          if (Number(rbcClass.degree) > poikiloDegree) {
            rbcCategory.classInfo[0].degree = '0'
            rbcCategory.classInfo[1].degree = rbcClass.degree
          }
        }
      }
    });
  });
};

const dateRefresh = () => {
  startDate.value = thirtyDaysAgo
  endDate.value = new Date();
  searchText.value = '';
  nrCount.value = 0;
  wbcCountOrder.value = 'all';
  testType.value = '00';
  titleItemArr.value = [];
  titleItem.value = [];
  sessionStorage.removeItem('lastSearchParams');
  localStorage.removeItem('lastSearchParams');
  search();
}

const checkListItem = (items: any) => {
  checkedSelectedItems.value = items;
}

const getDbDataAfterFunc = async () => {
  if (HOSPITAL_SITE_CD_BY_NAME['SD의학연구소'] === siteCd.value) {
    if (dbGetData.value.length > 0) {
      const barcodeNoList = dbGetData.value.map((item: any) => item.barcodeNo) ?? [];
      const formatedStartDate = moment(startDate.value).format('YYYY-MM-DD');
      const formatedEndDate = moment(endDate.value).format('YYYY-MM-DD');
      try {
        const { data: patientDataResult, code } = await sdPatientNameGetAPI(barcodeNoList, formatedStartDate, formatedEndDate);
        if (code === 200 && !isObjectEmpty(patientDataResult.data)) {
          dbGetData.value = dbGetData.value.map((item: any) => {
            const equalBarcodeData = patientDataResult.data.find((patItem: { no: number; reqNo: string; patName: string }) => patItem.reqNo === item.barcodeNo)
            if (!isObjectEmpty(equalBarcodeData)) {
              const updatedItem = { ...item, patientNm: equalBarcodeData.patName };
              return updatedItem;
            } else {
              return item;
            }
          })
        }
      } catch (error) {
        console.error(`SD 환자정보 조회 실패: ${error}`);
      }
    }
  }
}

</script>
