<template>
  <div class="cbcDiv">
    <h1 class="titleCbc">CBC + DIFF</h1>
    <div v-if="siteCd ==='0002'" class="cbcDivWarp">
      <table class="cbcTable">
        <tr v-for="(cbcItem) in cbcWorkList" :key="cbcItem.id">
          <td>{{ cbcItem?.tclsscrnnm._cdata }}</td>
          <td>{{ cbcItem.tclsscrnnm._cdata }}</td>
          <td>{{ cbcItem.inptrslt._cdata }}</td>
        </tr>
      </table>
    </div>
    <div v-if="siteCd ==='0007'" class="cbcDivWarp">
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
    <div v-else class="cbcDivWarp">
      <table class="cbcTable">
        <tr v-for="(cbcItem) in cbcWorkList" :key="cbcItem.id">
          <td>{{ cbcItem.classNm }}</td>
          <td>
            {{ cbcItem.count }} {{ cbcItem.unit }}
          </td>
        </tr>
      </table>
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

const store = useStore();
const props = defineProps(['selectItems']);
const cbcWorkList = ref<any>([]);
const cbcPatientNo = ref('');
const cbcPatientNm = ref('');
const cbcSex = ref('');
const cbcAge = ref('');
const inhaTestCode = ref('');
const cbcFilePathSetArr: any = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const deviceSerialNm = computed(() => store.state.commonModule.deviceSerialNm);
const siteCd = computed(() => store.state.commonModule.siteCd);
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const cbcCodeList = ref<any>([]);
const selectItemsVal = ref<any>([]);

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
});

const initCbcData = async (newVal: any) => {
  let hospitalName = hospitalSiteCd.find(hospital => hospital.siteCd === siteCd.value)?.hospitalNm;
  if(siteCd.value === ''){
    hospitalName = '0000';
  }
  switch (hospitalName) {
    case '서울성모병원':
      const realUrl = 'http://emr012.cmcnu.or.kr/cmcnu/.live';
      axios.get(realUrl, {
        params: {
          submit_id: 'TRLII00124',
          business_id: 'li',
          instcd: '012',
          bcno: newVal.barcodeNo
        }
      }).then(function (result) {
        const xml = result.data;
        const json = JSON.parse(xml2json(xml, {compact: true}));
        cbcWorkList.value = json.root.spcworklist.worklist;
      }).catch(function (err) {
        console.log(err.message)
      })

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
      if (cbcFilePathSetArr.value.includes("http")) { // url 설정인 경우
        const params = {
          url: cbcFilePathSetArr.value,
          machine: 'ADUIMD',
          episode: props.selectItems.barcodeNo
        }
        console.log(params.url, params.machine, params.episode);
        await axios.post(params.url + '/api/MifMain/Order', {
          machine: params.machine,
          episode: params.episode
        }).then(function (result) {
          cbcWorkList.value = [];
          const res = result.data[0];
          if (res?.returnCode === '0') {
            cbcPatientNo.value = res?.regNo;
            cbcPatientNm.value = res.name;
            cbcSex.value = res.sex;
            cbcAge.value = res.age;
            inhaTestCode.value = res.testCode;
            store.dispatch('commonModule/setCommonInfo', {inhaTestCode: res.testCode}); // lis 에서 사용함

            const testCodeList = res.testCode.split(',');
            testCodeList.forEach(function (codes: any) {
              const codeArray = codes.split('|');
              const code = codeArray[0];
              const value = codeArray[1];
              const unit = codeArray[2];
              cbcCodeList.value.forEach(function (cbcCode: any) {
                if (cbcCode.cd === code) {
                  const obj = {
                    classNm: cbcCode.classCd,
                    count: value,
                    unit: unit
                  }
                  cbcWorkList.value.push(obj);
                }
              })

            })

          }
        }).catch(function (err) {
          console.log(err.message + ' : no CBC result');
        })
      }

      break;

    // CBC 공통
    default:
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

        await axios.get(url).then(async function  (result) {
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
        }).catch(function (err) {
          console.log(err.message)
        })
      }
      else { // 파일
        const readFileTxtRes: any = await readFileTxt(`path=${cbcFilePathSetArr.value}&filename=${props.selectItems.barcodeNo}.hl7`);
        // const readFileTxtRes: any = await readFileTxt(`path=D:\\cbc&filename=1240459652.txt`);
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

        }else{
          console.error(readFileTxtRes.data.message);
        }
      }

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
  const updatedRuningInfo ={...result.data,...req }
  await updateRunningApiPost([updatedRuningInfo]);

}

const kuahGilHosCbc = async () => {
  let readFileTxtRes: any;
  if(siteCd.value === '0000' || siteCd.value === ''){
    readFileTxtRes = await readFileTxt(`path=${cbcFilePathSetArr.value}&filename=${props.selectItems.barcodeNo}`);
  }else{
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
  }
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
    const response = await updateRunningApi({userId: Number(userModuleDataGet.value.id), runingInfoDtoItems: originalDb})
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
