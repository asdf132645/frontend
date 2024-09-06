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
import {readFileTxt, readH7File} from "@/common/api/service/fileReader/fileReaderApi";
import {getCbcCodeRbcApi, getFilePathSetApi} from "@/common/api/service/setting/settingApi";
import {useStore} from "vuex";
import {detailRunningApi, updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {hospitalSiteCd} from "@/common/siteCd/siteCd";
import {createCbcFile} from "@/common/api/service/fileSys/fileSysApi";
import EventBus from "@/eventBus/eventBus";
import {messages} from "@/common/defines/constFile/constantMessageText";

const store = useStore();
const props = defineProps(['selectItems']);
const cbcWorkList = ref<any>([]);
const cbcPatientNo = ref('');
const cbcPatientNm = ref('');
const cbcSex = ref('');
const loading = ref(false);

const cbcAge = ref('');
const inhaTestCode = ref('');
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
  await getCbcPathData();
  await getCbcCodeList();
  await initCbcData(selectItemsVal.value);
}, {deep: true});

onMounted(async () => {
  selectItemsVal.value = props.selectItems;
  await getCbcPathData();
  await getCbcCodeList();
  await initCbcData(selectItemsVal.value);
  EventBus.subscribe('classInfoCbcDataGet', inhaCbc);
});

const initCbcData = async (newVal: any) => {
  loading.value = true;
  let hospitalName = hospitalSiteCd.find(hospital => hospital.siteCd === siteCd.value)?.hospitalNm;
  if (siteCd.value === '') {
    hospitalName = '0000';
  }
  switch (hospitalName) {
      // 서울 성모 cbc - 외부 url 진행 - 파일 없음
    case '서울성모병원':
      await cmcSeoulCbc(newVal);
      break;
    case '고대안암병원':
      await kuahGilHosCbc();
      break;
    case '인천길병원':
      await kuahGilHosCbc();
      break;
    case '0000':
      await kuahGilHosCbc();
      break;
    case '삼광의료재단':
      /** Todo 작업 필요 */
      break;
    case '인하대병원':
      await inhaCbc();
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

const commonCbc = async () => {
  if(cbcFilePathSetArr.value === ''){
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
    const readFileTxtRes: any = await readFileTxt(`path=${cbcFilePathSetArr.value}&filename=${props.selectItems.barcodeNo}.hl7`);
    if (readFileTxtRes.data.success) {
      const msg: any = await readH7File(readFileTxtRes.data.data);
      cbcWorkList.value = [];
      msg?.data?.segments.forEach((cbcSegment: any) => {
        if (cbcSegment.name.trim() === 'OBX') {
          cbcCodeList.value.forEach((cbcCode: any) => {
            //CBC_CD = > cbcCode.cd, CD_NM => cbcCode.testCd
            if (cbcCode.cd === cbcSegment.fields[3].value[0][0].value[0]) {
              const obj = {
                classNm: cbcCode.cd,
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

const inhaCbc = async () => {
  if(cbcFilePathSetArr.value === ''){
    showErrorAlert(messages.UPLOAD_PLEASE_CBC);
    return;
  }
  if (cbcFilePathSetArr.value.includes("http")) { // url 설정인 경우
    try {
      let apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';

      const body = {
        machine: 'ADUIMD',
        episode: props.selectItems.barcodeNo,
        baseUrl: cbcFilePathSetArr.value + '/api/MifMain/File',
        // baseUrl: `${apiBaseUrl}/cbc/executePostCurltest`,
      };
      const response: any = await axios.post(`${apiBaseUrl}/cbc/executePostCurl`, body);
      // 상태 초기화
      cbcWorkList.value = [];
      // 응답 데이터 가져오기
      const res: any = response.data[0];

      // 응답 코드가 '0'일 때만 처리
      if (res?.returnCode === '0') {
        // 환자 정보 설정
        cbcPatientNo.value = res?.regNo;
        cbcPatientNm.value = res?.name;
        cbcSex.value = res?.sex;
        cbcAge.value = res?.age;
        inhaTestCode.value = res?.testCode;

        // 공통 정보 설정
        await store.dispatch('commonModule/setCommonInfo', {inhaTestCode: res?.testCode});

        // 테스트 코드 리스트 처리
        const testCodeList = res.testCode.split(',');
        testCodeList.forEach((codes: any) => {
          const [code, value, unit] = codes.split('|');

          // cbcCodeList에서 매칭되는 코드 찾기
          const cbcCode = cbcCodeList.value.find((cbcCode: any) => cbcCode.cd === code);
          if (cbcCode) {
            // 작업 리스트에 추가
            const obj = {
              classNm: cbcCode.classCd,
              count: value,
              unit: unit || '' // unit이 없으면 빈 문자열로 설정
            };
            cbcWorkList.value.push(obj);
          }
        });
      }else{
        showErrorAlert(res?.returnCode);
      }

      const parms = {
        filePath: `D:\\UIMD_Data\\UI_Log\\CBC_IA\\${props.selectItems?.barcodeNo}.txt`,
        data: cbcWorkList.value,
      };
      await createCbcFile(parms);
      loading.value = false;
      console.log('Response:', response.data);
    } catch (error: any) {
      console.log(error.message + ' : no CBC result');
      loading.value = false;
      showErrorAlert(error.message);
    }
  }

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
  if (siteCd.value === '0000' || siteCd.value === '') {
    readFileTxtRes = await readFileTxt(`path=${cbcFilePathSetArr.value}&filename=${props.selectItems.barcodeNo}`);
  } else {
    readFileTxtRes = await readFileTxt(`path=C:/Users/user/Desktop/IA_MSG/CBC&filename=${props.selectItems.barcodeNo}`);
  }
  if (readFileTxtRes.data.success) {
    const cbcData = readFileTxtRes.data.data.toString();
    const cbcDataArray = cbcData.split('\n');
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

const getCbcPathData = async () => {
  try {
    const result = await getFilePathSetApi();

    if (result && result.data) {
      const data = result.data;
      cbcFilePathSetArr.value = data[0].cbcFilePath;
    }
  } catch (e) {
    console.error(e);
  }
};

const getCbcCodeList = async () => {
  try {
    const result = await getCbcCodeRbcApi();
    if (result && result.data) {
      cbcCodeList.value = result.data;
    }
  } catch (e) {
    console.error(e);
  }
};

async function updateRunningApiPost(originalDb: any) {
  try {
            const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
    const {startDate, endDate , page, searchText, nrCount, testType, wbcInfo, wbcTotal}  = JSON.parse(day);
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
