<template>
  <div class="cbcDiv">
    <div class="loaderBackground cbc" v-if="loading">
      <div class="loader"></div>
      <p class="loadingText">Loading...</p>
    </div>
    <h1 class="titleCbc"><span>CBC + DIFF</span>
      <div class="flex-column-align-start ml10">
        <p class="fs08" v-if="cbcWorkList[0]?.day">exam_ymd_unit : {{ cbcWorkList[0]?.day }}</p>
        <p class="fs08" v-if="slip !== ''">slip : {{ slip }}</p>
      </div>

      <span class="ml10" v-if="siteCd === HOSPITAL_SITE_CD_BY_NAME['SD의학연구소'] || siteCd === ''" @click="cbcListOpen">
        <font-awesome-icon :icon="['fas', 'rectangle-list']" class="cursorPointer"/>
      </span>
      <div v-if="cbcPopup" class="cbcPopUpContainer">

        <div class="flex-justify-between">
          <p></p>
          <h3>List</h3>
          <!--          <button type="button" >-->
          <font-awesome-icon :icon="['fas', 'xmark']" style="color: #ffffff;" @click="cbcDataListClose"
                             class="cbcDataListCloseBtn"/>
          <!--          </button>-->
        </div>

        <ul class="cbcPopUpWrapper">
          <li v-for="(item, idx) in cbcDataList" :key="idx" @click="cbcDataChoice(item)" class="cbcPopUpItem">
            {{ item }}
          </li>
        </ul>

      </div>
    </h1>
    <div v-if="siteCd ==='0002' && cbcWorkList.length !== 0" class="cbcDivWarp">
      <table class="cbcTable">
        <colgroup>
          <col width="50%"/>
          <col width="50%"/>
        </colgroup>
        <tr v-for="(cbcItem) in cbcWorkList" :key="cbcItem.id">
          <td>{{ cbcItem.tclsscrnnm._cdata }}</td>
          <td>{{ cbcItem.inptrslt._cdata }}</td>
        </tr>
      </table>
    </div>
    <div v-else-if="siteCd ==='0007' && cbcWorkList.length !== 0" class="cbcDivWarp">
      <table class="cbcTable">
        <colgroup>
          <col width="50%"/>
          <col width="50%"/>
        </colgroup>
        <tr v-for="(cbcItem) in cbcWorkList" :key="cbcItem.id">
          <td>{{ cbcItem.classNm }}</td>
          <td>
            {{ cbcItem.count }}
            <span v-if="cbcItem.cham !==''">
              ({{ cbcItem.cham }})
            </span>
            {{ cbcItem.unit }}
          </td>
        </tr>
      </table>
    </div>
    <div v-else-if="cbcWorkListForShow.length !== 0 || siteCd === HOSPITAL_SITE_CD_BY_NAME['SD의학연구소']" class="cbcDivWarp">
      <table class="cbcShowTable">
        <colgroup>
          <col width="40%" />
          <col width="40%" />
          <col width="20%" />
        </colgroup>
        <tr v-for="(cbcItem) in cbcWorkListForShow" :key="cbcItem.id">
          <td>{{ cbcItem.classNm }}</td>
          <td>{{ cbcItem.absCount }} {{ cbcItem.absUnit }}</td>
          <td>{{ cbcItem.percentCount }} {{ cbcItem.unit }}</td>
        </tr>
      </table>
    </div>
    <div v-else-if="cbcWorkList.length !== 0" class="cbcDivWarp">
      <table class="cbcTable">
        <colgroup>
          <col width="50%"/>
          <col width="50%"/>
        </colgroup>
        <tr v-for="(cbcItem) in cbcWorkList" :key="cbcItem.id">
          <td>{{ cbcItem.classNm }}</td>
          <td>
            {{ cbcItem.count }} {{ cbcItem.unit }}
          </td>
        </tr>
      </table>
    </div>
    <div v-if="cbcWorkList.length === 0">
      No Data
    </div>
  </div>
</template>

<script setup lang="ts">
import {xml2json} from 'xml-js';
import {computed, defineProps, onMounted, ref, watch} from "vue";
import axios from "axios";
import { readFileTxt, readH7File } from "@/common/api/service/fileReader/fileReaderApi";
import {useStore} from "vuex";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {
  createCbcFile,
  fileSearchApi,
  fileSysClean,
  fileSysCopy, fileSysExistsFile,
  getFolders
} from "@/common/api/service/fileSys/fileSysApi";
import {getCbcCodeList, getCbcPathData, inhaCbc} from "@/common/helpers/lisCbc/inhaCbcLis";
import {MESSAGES} from "@/common/defines/constants/constantMessageText";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import {parseDateString} from "@/common/helpers/lisCbc";
import {ywmcCbcDataLoad} from "@/common/helpers/lisCbc/ywmcCbcLis";
import { sdCBC } from "@/common/helpers/lisCbc/sdCbcLis";

const store = useStore();
const props = defineProps(['selectItems']);
const cbcWorkList = ref<any>([]);
const cbcWorkListForShow = ref<any>([]);
const cbcPatientNo = ref('');
const cbcPatientNm = ref('');
const cbcSex = ref('');
const loading = ref(false);

const cbcAge = ref('');
const hosName = ref('');
const cbcFilePathSetArr: any = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const deviceSerialNm = computed(() => store.state.commonModule.deviceSerialNm);
const siteCd = computed(() => store.state.commonModule.siteCd);
const cbcCodeList = ref<any>([]);
const selectItemsVal = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const cbcPopup = ref(false);
const cbcDataList = ref<any>([]);
const firstCbcDatafilename = ref('');
const datachoice = ref(false);
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const slip = ref('');
const slideData = computed(() => store.state.slideDataModule);

watch(props.selectItems, async (newVal) => {
  selectItemsVal.value = newVal;
  cbcFilePathSetArr.value = await getCbcPathData();
  cbcCodeList.value = await getCbcCodeList();
  if (datachoice.value) {
    return
  }
  await initCbcData(selectItemsVal.value);
}, {deep: true});

onMounted(async () => {
  if (props.selectItems) {
    firstCbcDatafilename.value = props.selectItems.barcodeNo;
  }
  datachoice.value = false;
  selectItemsVal.value = props.selectItems;
  cbcFilePathSetArr.value = await getCbcPathData();
  cbcCodeList.value = await getCbcCodeList();
  if (cbcFilePathSetArr.value && cbcFilePathSetArr.value !== '') {
    await initCbcData(selectItemsVal.value);
  }
});

const crcCbcDataLoad = async () => {
  await cbcDataProcess();
  if (cbcDataList.value.length === 0) {
    return;
  }
  const latestFile = cbcDataList.value.reduce((latest: any, currentFile: any) => {
    const currentDate: any = parseDateString(currentFile);
    const latestDate: any = parseDateString(latest);

    // 현재 파일의 날짜가 더 최신이면 그 파일을 선택
    return currentDate > latestDate ? currentFile : latest;
  });
  firstCbcDatafilename.value = `${latestFile.split('.')[0]}`;
}

const cbcListOpen = async () => {
  cbcPopup.value = !cbcPopup.value;
  await cbcDataProcess();
}

const cbcDataChoice = async (item: string) => {
  datachoice.value = true;
  firstCbcDatafilename.value = `${item.split('.')[0]}`;
  await sdCbcLoad();
  await updateCbcData();
  cbcPopup.value = false;
}

const cbcDataListClose = () => {
  cbcPopup.value = false;
}

const cbcDataProcess = async () => {
  if (!props.selectItems) {
    return
  }
  const foldersPath = `folderPath=${cbcFilePathSetArr.value}`;
  const cbcDataArr = await getFolders(foldersPath);
  let filterCbcDataArr: any = [];
  if (Array.isArray(cbcDataArr)) {
    filterCbcDataArr = cbcDataArr.filter((item) => {
      return item.split('_')[0] === props.selectItems.barcodeNo
    });
  }
  cbcDataList.value = filterCbcDataArr;
}

const initCbcData = async (newVal: any) => {
  loading.value = true;
  switch (siteCd.value) {
      // 서울 성모 cbc - 외부 url 진행 - 파일 없음
    case HOSPITAL_SITE_CD_BY_NAME['서울성모병원']:
      await cmcSeoulCbc(newVal);
      break;
    case HOSPITAL_SITE_CD_BY_NAME['고대안암병원']:
      await kuahGilHosCbc();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['인천길병원']:
      await kuahGilHosCbc();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['삼광의료재단']:
      /** Todo 작업 필요 */
      break;
    case HOSPITAL_SITE_CD_BY_NAME['인하대병원']:
      await inhaCbcLoad(); // 병원 전산팀 url 사용
      break;
    case HOSPITAL_SITE_CD_BY_NAME['SD의학연구소']:
      await sdCbcLoad();
      break;
    case HOSPITAL_SITE_CD_BY_NAME['원주기독병원']:
      await cbcYwmcDataMatching();// 원주기독은 디비 접근해서 작업함
      break;
    case HOSPITAL_SITE_CD_BY_NAME['NONE']:
    case HOSPITAL_SITE_CD_BY_NAME['UIMD']:
      // await uimdTestUrlSend();
      await crcCbcDataLoad();
      await commonCBC(firstCbcDatafilename.value);
      break;
    default:
      await commonCBC(firstCbcDatafilename.value);
      break;
  }
  await updateCbcData();
}

const updateCbcData = async () => {
  if (selectItemsVal.value) {
    selectItemsVal.value.cbcPatientNo = cbcPatientNo.value;
    selectItemsVal.value.cbcPatientNm = cbcPatientNm.value;
    selectItemsVal.value.cbcSex = cbcSex.value;
    selectItemsVal.value.cbcAge = cbcAge.value;
    selectItemsVal.value.hosName = hosName.value;
    const req = {
      cbcPatientNo: cbcPatientNo.value,
      cbcPatientNm: cbcPatientNm.value,
      cbcSex: cbcSex.value,
      cbcAge: cbcAge.value,
      hosName: hosName.value
    };
    const updatedRuningInfo = {...slideData.value, ...req}
    await updateRunningApiPost([updatedRuningInfo]);
  }
}

const cbcYwmcDataMatching = async () => {
  const {data, cbcDataVal, slip: slipVal} = await ywmcCbcDataLoad(props?.selectItems?.barcodeNo, cbcCodeList.value);
  cbcWorkList.value = data;
  cbcPatientNo.value = cbcDataVal?.pt_no;
  cbcPatientNm.value = cbcDataVal?.pt_nm;
  cbcSex.value = cbcDataVal?.sex;
  cbcAge.value = cbcDataVal?.age;
  loading.value = false;
  slip.value = slipVal;
}

const sdCbcLoad = async () => {
  await crcCbcDataLoad();

  if (cbcFilePathSetArr.value === '') {
    showErrorAlert(MESSAGES.UPLOAD_PLEASE_CBC);
    return;
  }

  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : pbiaRootDir.value;

  const {
    loading: loadingVal,
    cbcPatientNm: cbcPatientNmVal,
    cbcSex: cbcSexVal,
    cbcAge: cbcAgeVal,
    cbcPatientNo: cbcPatientNoVal,
    hosName: hosNameVal,
    cbcWorkList: cbcWorkListVal,
    cbcWorkListForShow: cbcWorkListForShowVal
  } = await sdCBC({
    iaRootPath: path,
    cbcFilePathSetArr: cbcFilePathSetArr.value,
    slotId: props.selectItems?.slotId,
    barcodeNo: props.selectItems?.barcodeNo,
    firstCbcDatafilename: firstCbcDatafilename.value,
    cbcCodeList: cbcCodeList.value,
  });

  cbcWorkList.value = cbcWorkListVal;
  cbcWorkListForShow.value = cbcWorkListForShowVal;
  cbcPatientNo.value = cbcPatientNoVal;
  cbcPatientNm.value = cbcPatientNmVal;
  cbcSex.value = cbcSexVal;
  cbcAge.value = cbcAgeVal;
  hosName.value = hosNameVal;
  loading.value = loadingVal;
}

const inhaCbcLoad = async () => {
  const {
    cbcWorkList: cbcWorkListVal,
    errMessage,
    cbcPatientNo: cbcPatientNoVal,
    cbcPatientNm: cbcPatientNmVal,
    cbcSex: cbcSexVal,
    cbcAge: cbcAgeVal,
    loading: loadingVal,
  } = await inhaCbc(cbcFilePathSetArr.value, props.selectItems, cbcCodeList.value, 'cbcRead');
  if (errMessage !== '') {
    showSuccessAlert(errMessage);
  }
  cbcWorkList.value = cbcWorkListVal;
  cbcPatientNo.value = cbcPatientNoVal;
  cbcPatientNm.value = cbcPatientNmVal;
  cbcSex.value = cbcSexVal;
  cbcAge.value = cbcAgeVal;
  loading.value = loadingVal;
}

const commonCBC = async (firstCbcDatafilename: string) => {
  if (cbcFilePathSetArr.value === '') {
    showErrorAlert(MESSAGES.UPLOAD_PLEASE_CBC);
    return;
  }

  if (cbcFilePathSetArr.value.includes("http")) { // url
    const params = {
      url: cbcFilePathSetArr.value,
      barcodeNo: props.selectItems.barcodeNo,
      userId: userModuleDataGet.value.userId,
      deviceBarcode: deviceSerialNm.value
    }
    const url = params.url + '?' +
        'barcodeNo=' + params.barcodeNo + '&' +
        'deviceBarcode=' + deviceSerialNm.value + '&' +
        'userid=' + params.userId

    await axios.get(url).then(async function (result) {
      const msg: any = await readH7File(result.data);
      cbcWorkList.value = [];
      msg.data?.segments.forEach(function (cbcSegment: any) {
        if (cbcSegment.name.trim() === 'OBX') {
          cbcCodeList.value.forEach(function (cbcCode: any) {
            if (cbcCode.classCd === cbcSegment.fields[3].value[0][0].value[0]) {
              var obj = {
                classNm: cbcCode.cd,
                count: cbcSegment.fields[5].value[0][0].value[0],
                unit: cbcSegment.fields[6].value[0][0].value[0]
              }
              cbcWorkList.value.push(obj)
            }
          })

        } else if (cbcSegment.name.trim() === 'PID') {
          cbcPatientNo.value = cbcSegment.fields[1].value[0][0].value[0]
          cbcPatientNm.value = cbcSegment.fields[4].value[0][0].value[0]
          cbcSex.value = cbcSegment.fields[6].value[0][0].value[0]
          cbcAge.value = cbcSegment.fields[7].value[0][0].value[0];
        }
      })
      loading.value = false;
    }).catch(function (err) {
      console.error(err.message)
      loading.value = false;
    })
  }
  else { // 파일
    await commonFileData(firstCbcDatafilename);
  }

  const parms = {
    filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${props.selectItems?.barcodeNo}.txt`,
    data: cbcWorkList.value,
  };
  await createCbcFile(parms);
}

const commonFileData = async (firstCbcDatafilename: string) => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : pbiaRootDir.value;

  const fileSysExistsFileParms = {
    directoryPath: `${cbcFilePathSetArr.value}`,
    keyword: props.selectItems?.barcodeNo
  };
  let fileListName = '';
  let filePath = '';
  const isExistsFile = await fileSysExistsFile(fileSysExistsFileParms);
  if (isExistsFile.data === "NoFile") {
    const fileSearchApiPram = `directoryPath=${path}\\${props.selectItems?.slotId}&searchString=${props.selectItems?.barcodeNo}`
    try {
      const response = await fileSearchApi(fileSearchApiPram);
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        fileListName = response.data[0].split('.')[0];
      }
    } catch (error) {
      console.error('Error fetching file list:', error);
    }
    filePath = `${path}\\${props.selectItems?.slotId}`;
  } else {
    fileListName = firstCbcDatafilename;
    filePath = cbcFilePathSetArr.value
  }
  const readFileTxtRes: any = await readFileTxt(`path=${filePath}&filename=${fileListName}`);

  if (readFileTxtRes.data.success) {
    const fileParams = {
      source: `${cbcFilePathSetArr.value}\\${firstCbcDatafilename}.hl7`,
      destination: `${path}\\${props.selectItems?.slotId}`,
    };
    const fileSysCleanParams = {
      directoryPath: `${cbcFilePathSetArr.value}`,
      keyword: props.selectItems?.barcodeNo
    }
    await fileSysCopy(fileParams);
    await fileSysClean(fileSysCleanParams);
    const msg: any = await readH7File(readFileTxtRes.data.data);
    getCBCWorkListFromFileData(msg);

    loading.value = false;  // 로딩 상태 종료
  } else {
    console.error(readFileTxtRes.data.message);
    loading.value = false;
  }
}

const getCBCWorkListFromFileData = (msg: any) => {
  cbcWorkList.value = [];

  msg?.data?.segments?.forEach((cbcSegment: any) => {
    const segmentName = cbcSegment.name.trim();

    if (segmentName === 'OBX') {
      cbcCodeList.value.forEach((cbcCode: any) => {
        const classCd = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0];
        const count = cbcSegment?.fields?.[4]?.value?.[0]?.[0]?.value?.[0] || "0";
        const unit = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0].match(/%/g)?.[0] || "";

        // 클래스 코드가 일치하는 경우
        if (cbcCode.classCd === classCd) {
          // 중복 확인: 이미 동일한 classNm이 있는지 확인
          const isDuplicate = cbcWorkList.value.some(
              (item: any) => item.classNm === cbcCode.fullNm
          );

          // 중복이 아닐 경우에만 추가
          if (!isDuplicate) {
            const obj = {
              classNm: cbcCode.fullNm,
              count: count,
              unit
            };
            cbcWorkList.value.push(obj);
          }
        }
      });
    }
    else if(cbcSegment.name.trim() === 'FLG'){
      const flgNm = cbcSegment?.fields?.[2]?.value?.[0]?.[0]?.value?.[0];
      const obj = {
        classNm: 'FLG',
        count: flgNm,
        unit: '',
      };
      cbcWorkList.value.push(obj);
    }
    else if (cbcSegment.name.trim() === 'PID') {
      cbcPatientNo.value = cbcSegment.fields[1].value[0][0].value[0]
      cbcPatientNm.value = cbcSegment.fields[4].value[0][0].value[0]
      cbcSex.value = cbcSegment.fields[6].value[0][0].value[0]
      cbcAge.value = cbcSegment.fields[7].value[0][0].value[0];
      hosName.value = cbcSegment?.fields[10]?.value[0][0]?.value[0];
    }
  });
}

const uimdTestUrlSend = async () => {
  await axios.get(cbcFilePathSetArr.value).then(async function (result) {
    cbcWorkList.value = result.data.data.data;
    loading.value = false;
  });
}

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const cmcSeoulCbc = async (newVal: any) => {
  let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';

  axios.get(`${apiBaseUrl}/cbc/lisCbcMarys`, {
    params: {
      submit_id: 'TRLII00124',
      business_id: 'li',
      instcd: '012',
      bcno: newVal.barcodeNo
    },
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(function (result) {
    const xml = result.data?.data;
    const json = JSON.parse(xml2json(xml, {compact: true}));
    cbcWorkList.value = json.root.spcworklist.worklist;
    const parms = {
      filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${props.selectItems?.barcodeNo}.txt`,
      data: cbcWorkList.value,
    };
    createCbcFile(parms);
    loading.value = false;
  }).catch(function (err) {
    console.error(err.message)
    loading.value = false;
  })
}

const kuahGilHosCbc = async () => {
  const readFileTxtRes: any = await readFileTxt(`path=${cbcFilePathSetArr.value}&filename=${props.selectItems.barcodeNo}`);

  if (readFileTxtRes.data.success) {
    let cbcDataArray = JSON.parse(JSON.stringify(readFileTxtRes.data.data));
    // 검체번호, 검사일시, 환자번호, 환자명, 성별, 나이, 그래프 데이터 제외
    const excludedTitles = [
      'SPC_NO', 'BLCL_DT', 'PT_NO', 'PT_NM', 'SEX', 'AGE',
      'SCAT_WDF', 'SCAT_WNR', 'DIST_RBC', 'DIST_WDF(FSC)', 'DIST_PLT'
    ];
    cbcDataArray = cbcDataArray.split('\n');

    cbcDataArray.forEach((cbcData: any) => {
      const [title, value] = cbcData.split('\t').map((item: any) => item.trim());

      if (!excludedTitles.includes(title.trim())) {
        const unit = title.includes('%') ? '%' : '';
        cbcWorkList.value.push({classNm: title, count: value, unit: unit});
      } else {
        switch (title) {
          case 'PT_NO':
            cbcPatientNo.value = value;
            break;
          case 'PT_NM':
            cbcPatientNm.value = value;
            break;
          case 'SEX':
            cbcSex.value = value;
            break;
          case 'AGE':
            cbcAge.value = value;
            break;
        }
      }
    });

    const parms = {
      filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${props.selectItems?.barcodeNo}.txt`,
      data: cbcWorkList,
    };
    await createCbcFile(parms);
  }
  loading.value = false;
}

async function updateRunningApiPost(originalDb: any) {
  try {
    const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate, page, searchText, nrCount, testType, wbcInfo, wbcTotal} = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const response: any = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: originalDb,
      dayQuery: dayQuery,
    })
    if (response) {
      //
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

</script>
