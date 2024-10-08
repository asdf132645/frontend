<template>
  <div class="cbcDiv">
    <div class="loaderBackground cbc" v-if="loading">
      <div class="loader"></div>
      <p class="loadingText">Loading...</p>
    </div>
    <h1 class="titleCbc">CBC + DIFF</h1>
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
import { xml2json } from 'xml-js';
import { computed, defineProps, onMounted, ref, watch } from "vue";
import axios from "axios";
import { readFileTxt, readH7File } from "@/common/api/service/fileReader/fileReaderApi";
import { useStore } from "vuex";
import { detailRunningApi, updateRunningApi } from "@/common/api/service/runningInfo/runningInfoApi";
import { createCbcFile } from "@/common/api/service/fileSys/fileSysApi";
import { getCbcCodeList, getCbcPathData, inhaCbc } from "@/common/lib/commonfunction/inhaCbcLis";
import { messages } from "@/common/defines/constFile/constantMessageText";
import { HOSPITAL_SITE_CD_BY_NAME } from "@/common/defines/constFile/siteCd";

const store = useStore();
const props = defineProps(['selectItems']);
const cbcWorkList = ref<any>([]);
const cbcPatientNo = ref('');
const cbcPatientNm = ref('');
const cbcSex = ref('');
const loading = ref(false);

const cbcAge = ref('');
const cbcFilePathSetArr: any = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const deviceSerialNm = computed(() => store.state.commonModule.deviceSerialNm);
const siteCd = computed(() => store.state.commonModule.siteCd);
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const cbcCodeList = ref<any>([]);
const selectItemsVal = ref<any>([]);
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

watch(props.selectItems, async (newVal) => {
  selectItemsVal.value = newVal;
  cbcFilePathSetArr.value = await getCbcPathData();
  cbcCodeList.value = await getCbcCodeList();
  await initCbcData(selectItemsVal.value);
}, {deep: true});

onMounted(async () => {
  selectItemsVal.value = props.selectItems;
  cbcFilePathSetArr.value = await getCbcPathData();
  cbcCodeList.value = await getCbcCodeList();
  await initCbcData(selectItemsVal.value);
});


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
      await inhaCbcLoad();
      break;

    // CBC 공통
    default:
      await commonCbc();
      break;
  }

  selectItemsVal.value.cbcPatientNo = cbcPatientNo.value;
  selectItemsVal.value.cbcPatientNm = cbcPatientNm.value;
  selectItemsVal.value.cbcSex = cbcSex.value;
  selectItemsVal.value.cbcAge = cbcAge.value;
  const req = {
    cbcPatientNo: cbcPatientNo.value,
    cbcPatientNm: cbcPatientNm.value,
    cbcSex: cbcSex.value,
    cbcAge: cbcAge.value,
  };

  const result: any = await detailRunningApi(String(selectedSampleId.value));
  const updatedRuningInfo = {...result.data, ...req}
  await updateRunningApiPost([updatedRuningInfo]);

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
  if(errMessage !== ''){
    showSuccessAlert(errMessage);
  }
  cbcWorkList.value = cbcWorkListVal;
  cbcPatientNo.value = cbcPatientNoVal;
  cbcPatientNm.value = cbcPatientNmVal;
  cbcSex.value = cbcSexVal;
  cbcAge.value = cbcAgeVal;
  loading.value = loadingVal;
}

const commonCbc = async () => {
  if (cbcFilePathSetArr.value === '') {
    showErrorAlert(messages.UPLOAD_PLEASE_CBC);
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
            if (cbcCode.CBC_CD === cbcSegment.fields[3].value[0][0].value[0]) {
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
          cbcAge.value = cbcSegment.fields[7].value[0][0].value[0]
        }
      })
      loading.value = false;
    }).catch(function (err) {
      console.log(err.message)
      loading.value = false;
    })
  } else { // 파일
    const readFileTxtRes: any = await readFileTxt(`path=${cbcFilePathSetArr.value}&filename=${props.selectItems.barcodeNo}`);
    if (readFileTxtRes.data.success) {
      const msg: any = await readH7File(readFileTxtRes.data.data);
      cbcWorkList.value = [];
      msg?.data?.segments.forEach((cbcSegment: any) => {
        if (cbcSegment.name.trim() === 'OBX') {
          cbcCodeList.value.forEach((cbcCode: any) => {
            if (cbcCode.classCd === cbcSegment.fields[3].value[0][0].value[0]) {
              const obj = {
                classNm: cbcCode.fullNm,
                count: cbcSegment.fields[5].value[0][0].value[0],
                unit: cbcSegment.fields[6].value[0][0].value[0]
              }
              cbcWorkList.value.push(obj);
            }
          })
        }
      })
      loading.value = false;
    } else {
      console.error(readFileTxtRes.data.message);
      loading.value = false;
    }
  }
  const parms = {
    filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${props.selectItems?.barcodeNo}.txt`,
    data: cbcWorkList.value,
  };
  await createCbcFile(parms);
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
    console.log(err.message)
    loading.value = false;
  })
}

const kuahGilHosCbc = async () => {
  let readFileTxtRes: any;

  if (siteCd.value === HOSPITAL_SITE_CD_BY_NAME['UIMD'] || siteCd.value === HOSPITAL_SITE_CD_BY_NAME['NONE']) {
    readFileTxtRes = await readFileTxt(`path=${cbcFilePathSetArr.value}&filename=${props.selectItems.barcodeNo}`);
  } else {
    readFileTxtRes = await readFileTxt(`path=C:/Users/user/Desktop/IA_MSG/CBC&filename=${props.selectItems.barcodeNo}`);
  }
  if (readFileTxtRes.data.success) {
    const cbcDataArray = JSON.parse(readFileTxtRes.data.data.toString());
    // 검체번호, 검사일시, 환자번호, 환자명, 성별, 나이, 그래프 데이터 제외
    const excludedTitles = [
      'SPC_NO', 'BLCL_DT', 'PT_NO', 'PT_NM', 'SEX', 'AGE',
      'SCAT_WDF', 'SCAT_WNR', 'DIST_RBC', 'DIST_WDF(FSC)', 'DIST_PLT'
    ];
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
      data: cbcWorkList.value,
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
    const response = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: originalDb,
      dayQuery: dayQuery,
    })
    if (response) {
      // console.log('')
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

</script>
