<template>
  <img v-if="type !== 'report'"
       :src="barcodeImg"/>
  <div class="mt2 mb2">
    <h3 class="wbcClassInfoLeft">
      {{ wbcClassTileChange() }}
    </h3>
    <ul class="leftWbcInfo">
      <li style="position: relative">
        <font-awesome-icon :icon="['fas', 'comment-dots']" @click="memoOpen"/>
        <div v-if="memoModal" class="memoModal">
          <textarea v-model="wbcMemo"></textarea>
          <button @click="memoChange">ok</button>
          <button @click="memoCancel">cancel</button>
        </div>
      </li>
      <li @click="commitConfirmed" :class="{
    'submitted': selectItems.submitState === 'Submit',
  }">
        <font-awesome-icon :icon="['fas', 'square-check']"/>
      </li>
      <li @click="lisModalOpen">
        <font-awesome-icon :icon="['fas', 'upload']"/>
      </li>
      <li>
        <font-awesome-icon :icon="['fas', 'lock']" v-if="!toggleLock" @click="toggleLockEvent"/>
        <font-awesome-icon :icon="['fas', 'lock-open']" v-if="toggleLock" @click="toggleLockEvent"/>
      </li>
    </ul>
  </div>
  <div class="wbcClassScroll">
    <div
        v-for="(item, idx) in wbcInfoChangeVal"
        :key="item.id"
        class="wbcClassDbDiv"
        draggable="true"
        @dragstart="startDrag(idx, $event)"
        @dragover.prevent
        @drop="drop(idx, $event)"
    >
      <ul class="nth1Child classAttribute" v-if="idx === 0">
        <li>Class</li>
        <li>Count</li>
        <li>%</li>
      </ul>
      <ul class="nth1Child" v-if="shouldRenderCategory(item.title)" @click="goClass(item.id)">
        <li>{{ item?.name }}</li>
        <li>{{ item?.count }}</li>
        <li> {{ item?.percent || '-' }}</li>
      </ul>
    </div>
    <div class="categories classTotal">
      <ul class="categoryNm">
        <li>
          Total
        </li>
      </ul>
      <ul class="classNm">
        <li>
          {{ totalCount || 0 }}
        </li>
      </ul>
      <ul class="degree">
        <li>
          100.00
        </li>
      </ul>
    </div>

    <div v-if="projectBm">
      <div
          v-for="(item, idx) in wbcInfoChangeVal"
          :key="item.id"
          class="wbcClassDbDiv mb2"
          draggable="true"
          @dragstart="startDrag(idx, $event)"
          @dragover.prevent
          @drop="drop(idx, $event)"
      >
        <ul class="nth1Child" v-if="item?.title === 'OT'" @click="goClass(item.id)">
          <li>{{ item?.name }}</li>
          <li>{{ item?.count }}</li>
          <li> -</li>
        </ul>
      </div>
    </div>

    <div v-if="!projectBm">
      <template v-for="(nWbcItem, outerIndex) in nonRbcClassList" :key="outerIndex">
        <div class="categories" v-show="selectItems.siteCd !== '0006' && nWbcItem?.title !== 'SM'">
          <ul class="categoryNm">
            <li class="mb1 liTitle" v-if="outerIndex === 0">non-WBC</li>
            <li>{{ getStringValue(nWbcItem.name) }}</li>
          </ul>
          <ul class="classNm">
            <li class="mb1 liTitle" v-if="outerIndex === 0">.</li>
            <li>
              {{ nWbcItem?.count }}
              <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'">
                / {{ selectItemsSessionStorageData?.wbcInfo?.maxWbcCount }} WBC</span>
            </li>
          </ul>
          <ul class="degree">
            <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
            <li>-</li>
          </ul>
        </div>
      </template>
    </div>
    <div v-if="type !== 'report'" class="beforeAfterBtn">
      <button @click="beforeChang" :class={isBeforeClicked:isBefore}>Before</button>
      <button @click="afterChang(clonedWbcInfoStore)" :class={isBeforeClicked:!isBefore}>After</button>
    </div>
  </div>
  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />
  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :type="confirmType"
      :message="confirmMessage"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, onMounted, ref, watch} from 'vue';
import {getBarcodeDetailImageUrl} from "@/common/lib/utils/conversionDataUtils";
import {barcodeImgDir} from "@/common/defines/constFile/settings";
import {basicBmClassList, basicWbcArr} from "@/store/modules/analysis/wbcclassification";
import {detailRunningApi, updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {messages} from "@/common/defines/constFile/constantMessageText";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {
  getFilePathSetApi,
  getLisCodeApi,
  getLisCodeRbcApi,
  getOrderClassApi,
  putOrderClassApi
} from "@/common/api/service/setting/settingApi";

const props = defineProps(['wbcInfo', 'selectItems', 'type']);
const store = useStore();
const userModuleDataGet = computed(() => store.state.userModule);
const emits = defineEmits();
import moment from 'moment';
import {business_id, CbcWbcTestCdList_0002, eqmtcd, instcd, realUrl, spcParams} from "@/common/defines/constFile/lis";
import axios from "axios";
import {xml2json} from "xml-js";
import {createDirectory, createFile} from "@/common/api/service/fileSys/fileSysApi";
import {createH17, readH7Message} from "@/common/api/service/fileReader/fileReaderApi";
import {getDateTimeStr} from "@/common/lib/utils/dateUtils";

const selectItemsData = sessionStorage.getItem("selectItems");
const selectItemsSessionStorageData = ref(selectItemsData ? JSON.parse(selectItemsData) : null);
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const clonedWbcInfoStore = computed(() => store.state.commonModule.clonedWbcInfo);
const inhaTestCode: any = computed(() => store.state.commonModule.inhaTestCode);
const deviceSerialNm = computed(() => store.state.commonModule.deviceSerialNm);
const siteCd = computed(() => store.state.commonModule.siteCd);
const barcodeImg = ref('');
const userId = ref('');
const wbcMemo = ref('');
const memoModal = ref(false);
const wbcInfoChangeVal: any = ref<any>([]);
const nonRbcClassList = ref<any>([]);
const titleArr = ['NR', 'GP', 'PA', 'AR', 'MA', 'SM'];
const toggleLock = ref(false);
const dragIndex = ref(-1);
const dragOffsetY = ref(0);

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const orderClass = ref<any>([]);
const projectBm = ref(false);
const isBefore = ref(false);
const totalCount = ref(0);
const okMessageType = ref('');
const lisCodeWbcArr = ref<any>([]);
const lisCodeRbcArr = ref<any>([]);
const lisFilePathSetArr = ref<any>([]);
onMounted(async () => {
  await getOrderClass();
  wbcMemo.value = props.selectItems.wbcMemo;
  await afterChang(clonedWbcInfoStore.value);
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : pbiaRootDir.value;
  barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, props.selectItems.slotId, barcodeImgDir.barcodeDirName);
  projectBm.value = window.PROJECT_TYPE === 'bm';
  // 첫 진입시
  if (props.selectItems.submitState === "") {
    const result: any = await detailRunningApi(String(props.selectItems.id));
    const updatedItem = {
      submitState: 'checkFirst',
    };
    const updatedRuningInfo ={...result.data,...updatedItem }
    await resRunningItem(updatedRuningInfo, true);
  }
  await getLisWbcRbcData();
  await getLisPathData();
})

watch(userModuleDataGet.value, (newUserId) => {
  userId.value = newUserId.id;
});

watch(() => props.wbcInfo, (newItem) => {
  wbcMemo.value = props.selectItems.wbcMemo;
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : pbiaRootDir.value;
  barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, props.selectItems.slotId, barcodeImgDir.barcodeDirName);
});

watch(() => clonedWbcInfoStore.value, (newItem) => {
  afterChang(newItem);
}, {deep: true});


const lisModalOpen = () => {
  showConfirm.value = true;
  confirmMessage.value = messages.IDS_MSG_UPLOAD_LIS;
  okMessageType.value = 'lis';
}

const goClass = (id: any) => {
  emits('scrollEvent', id)
}

const wbcClassTileChange = (): string => {
  if (!projectBm.value) {
    return 'WBC Classification';
  } else {
    return 'BM Classification';
  }
}

const startDrag = (index: any, event: any) => {
  dragIndex.value = index;
  dragOffsetY.value = event.clientY - event.target.getBoundingClientRect().top;
};

const drop = (index: any, event: any) => {
  if (!toggleLock.value) {
    return;
  }
  store.dispatch('commonModule/setCommonInfo', {classInfoSort: wbcInfoChangeVal.value});
  event.preventDefault();
  if (dragIndex.value !== -1) {
    const movedItem = wbcInfoChangeVal.value.splice(dragIndex.value, 1)[0];
    wbcInfoChangeVal.value.splice(index, 0, movedItem);
    dragIndex.value = -1;
    updateOriginalDb();
  }
};


const toggleLockEvent = () => {
  toggleLock.value = !toggleLock.value;
}

const commitConfirmed = () => {
  showConfirm.value = true;
  confirmMessage.value = messages.IDS_MSG_CONFIRM_SLIDE;
  okMessageType.value = 'commit';
}

const handleOkConfirm = () => {
  if (okMessageType.value === 'commit') {
    onCommit();
  } else {
    uploadLis();
  }
  showConfirm.value = false;
}

const uploadLis = () => {
  if (siteCd.value === '0002') {
    const codeList = CbcWbcTestCdList_0002;
    axios.get('http://emr012.cmcnu.or.kr/cmcnu/.live', {
      params: spcParams
    }).then(function (result) {
      // 결과 처리 코드
      const xml = result.data;
      const json = JSON.parse(xml2json(xml, {compact: true}));
      const cbcWorkList = json.root.spcworklist.worklist;
      const fiveDiffWorkList = ['LHR10501', 'LHR10502', 'LHR10503', 'LHR10504', 'LHR10505', 'LHR10506'];

      const wbcDiffCountItem = cbcWorkList.filter(function (item: any) {
        return item.classCd._cdata === 'LHR100'
      })

      props.selectItems.wbcInfoAfter.forEach(function (wbcItem: any) {
        wbcItem.classCd = ''

        codeList.forEach(function (code) {
          if (wbcItem.id === code.id) {
            wbcItem.classCd = code.cd
          }
        })
      })

      let wbcTemp: any = [];

      // five diff push
      props.selectItems.wbcInfoAfter.forEach(function (wbcItem: any) {
        fiveDiffWorkList.forEach(function (fiveDiffItem) {
          if (wbcItem.classCd === fiveDiffItem) {
            wbcTemp.push(wbcItem)
          } else {
            if ((wbcItem.count > 0) && wbcItem.classCd !== '') {
              wbcTemp.push(wbcItem)
            }
          }
        })
      })

      // neutrophil-seg
      const nsPercentItem = wbcTemp.filter(function (item: any) {
        return item.classCd === 'LHR10501'
      })

      // ANC insert
      if ((nsPercentItem.length > 0) && (wbcDiffCountItem.length > 0)) {
        const ancResult = ((Number(wbcDiffCountItem[0].inptrslt._cdata) * nsPercentItem[0].percent) / 100).toFixed(2)

        wbcTemp.push({
          classCd: 'LHR10599',
          percent: ancResult
        })
      }
      // 유저 체크
      checkUserAuth(userModuleDataGet.value.userId).then(function (isUserAuth) {
        if (isUserAuth === 'succ') {
          const params = {
            empNo: userModuleDataGet.value.userId,
            barcodeNo: props.selectItems.barcodeNo,
            wbcInfo: wbcTemp
          }

          const now = new Date();
          const year = `${now.getFullYear()}`;
          let month = `${now.getMonth() + 1}`;
          if (month.length === 1) {
            month = `0${month}`;
          }
          let day = `${now.getDate()}`;
          if (day.length === 1) {
            day = `0${day}`;
          }

          const separator1 = encodeURIComponent(String.fromCharCode(23)); // '\u0017'
          const separator2 = encodeURIComponent(String.fromCharCode(23, 23)); // '\u0017\u0017'
          const terminator = encodeURIComponent(String.fromCharCode(3)); // '\u0003'

          const result = params.wbcInfo
              .filter((wbcItem: any) => wbcItem.classCd !== null && wbcItem.classCd !== '')
              .map((wbcItem: any) => `${wbcItem.classCd}${separator1}${wbcItem.percent}${separator2}${year}${month}${day}${terminator}`)
              .join('');

          const url = `${realUrl}?submit_id=TXLII00101&business_id=${business_id}&ex_interface=${params.empNo}|${instcd}&instcd=${instcd}&userid=${params.empNo}&eqmtcd=${eqmtcd}&bcno=${params.barcodeNo}&result=${result}&testcont=MANUAL DIFFERENTIAL COUNT RESULT&testcontcd=01&execdeptcd=H1`;

          axios.get(url).then(function (result) {
            const xml = result.data;
            const json = JSON.parse(xml2json(xml, {compact: true}));
            const resultFlag = json.root.ResultFlag.resultflag._text;
            if (resultFlag === 'Y') {
              showSuccessAlert(messages.IDS_MSG_SUCCESS);
            } else {
              showErrorAlert(json.root.ResultFlag.error2._text);
            }
          }).catch(function (err) {
            showErrorAlert(err.message);
          })
        } else {
          showErrorAlert(messages.IDS_ERROR_PLEASE_CONFIRM_YOUR_USER_ID);
        }
      })

    }).catch(function (err) {
      showErrorAlert(err.message);
    });
  } else {
    // lis 최종호출
    lisLastStep();
  }
}

const lisLastStep = () => {
  if (siteCd.value === '0019') {
    let data = 'H|\^&||||||||||P||' + props.selectItems.barcodeNo + '\n';
    let seq = 0;

    lisCodeWbcArr.value.forEach(function (lisCode: any) {
      if (lisCode.code !== '') {
        props.selectItems.wbcInfoAfter.forEach(function (wbcItem: any) {
          if (lisCode.IA_CD === wbcItem.id) {
            if (Number(wbcItem.percent) > 0 || Number(wbcItem.count)) {
              // count
              data += 'R|' + (++seq) + '|^^^^' + lisCode.code + '|' + wbcItem.count + '|||||||^' + userModuleDataGet.value.userId + '\n'
              // percent
              data += 'R|' + (++seq) + '|^^^^' + lisCode.code + '%|' + wbcItem.percent + '|%||||||^' + userModuleDataGet.value.userId + '\n'
            }

          }

        })
      }
    })
    data += 'L|1|N'
    lisFileUrlCreate(data);
  } else if (siteCd.value === '0006') { // 고대 안암
    const data = godae();
    lisFileUrlCreate(data);

  } else if (siteCd.value === '0011') {
    inhaDataSend();
  } else {
    otherDataSend();
  }
}

const otherDataSend = async () => {
  const url = lisFilePathSetArr.value;
  const fileCreateRes = await createDirectory(url);
  let msg: any;

  if (fileCreateRes) {
    const data = {
      sendingApp: 'PBIA',
      sendingFacility: 'PBIA',
      receivingApp: 'LIS',
      receivingFacility: 'LIS',
      dateTime: getDateTimeStr(),
      security: '',
      messageType: ['ADT', 'R02'],
      messageControlId: props.selectItems.barcodeNo,
      processingId: 'P',
      hl7VersionId: '2.5',
      selectedItem: { /* selectedItem 데이터 */},
      wbcInfo: props.selectItems.wbcInfoAfter,
      result: lisCodeWbcArr.value,
    };

    const res = await readH7Message(data);
    if (res) {
      if (!lisFilePathSetArr.value.includes("http")) { // file
        const data = {
          filepath: lisFilePathSetArr.value,
          msg: res,
        }
        try {
          const createH17Res: any = await createH17(data);
          showSuccessAlert(messages.IDS_MSG_SUCCESS);
        } catch (error: any) {
          showErrorAlert(error.response.data);
        }
      } else { // url
        sendLisMessage(res);
      }
    }
  }
}

const inhaDataSend = () => {
  let resultStr = '';
  const testCodeList = inhaTestCode.value.split(',');
  let tmpList: any = [];
  testCodeList.forEach(function (codes: any) {
    if (codes.length > 0) {
      var codeArray = codes.split('|')
      var code = codeArray[0]
      var value = codeArray[1]
      var unit = codeArray[2]
      var type = codeArray[3]
      var tmpStr = ''

      if (code === 'L0210') {
        value = value + '5'
      }

      if (code === 'H1151') {
        tmpStr += 'H9511' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1152') {
        tmpStr += 'H9512' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1153') {
        tmpStr += 'H9513' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1154') {
        tmpStr += 'H9514' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1155') {
        tmpStr += 'H9515' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1165') {
        tmpStr += 'H9510' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1162') {
        tmpStr += 'H9570' + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      } else if (code === 'H1101' || code === 'H1102' || code === 'H1103' ||
          code === 'H1104' || code === 'H1105' || code === 'H1106' ||
          code === 'H1121' || code === 'H1122' || code === 'H1123') {
        tmpStr += code + '|' + value + '|' //+ unit // + '\\' + type
        tmpList.push(tmpStr)
      }

    }
  })

  inhaTestCode.value = '';
  tmpList.forEach(function (item: any) {
    inhaTestCode.value += item + ','
  })
  resultStr += inhaTestCode.value;
  let rbcTmp = '';
  //wbc
  lisCodeWbcArr.value.forEach(function (lisCode: any, index: any) {
    props.selectItems.wbcInfoAfter.forEach(function (wbcItem: any) {
      if (lisCode.IA_CD === wbcItem.id) {
        if (lisCode.code === 'H9600' || lisCode.code === 'H9365' ||
            lisCode.code === 'H9366') {
          if (Number(wbcItem.count) > 0) {
            resultStr += lisCode.code + '|' + '1' + '|' + ','
          } else {
            resultStr += lisCode.code + '|' + ' ' + '|' + ','
          }
        } else {
          // GP, PA
          if (lisCode.IA_CD === '13' || lisCode.IA_CD === '14') {
            if (Number(wbcItem.count) > Number(lisCode.MIN_COUNT)) {
              resultStr += lisCode.code + '|' + wbcItem.percent + '|' + ','
            } else {
              resultStr += lisCode.code + '|' + ' ' + '|' + ','
            }
          } else {
            if (Number(wbcItem.percent) > 0) {
              resultStr += lisCode.code + '|' + wbcItem.percent + '|' + ','
            } else {
              resultStr += lisCode.code + '|' + ' ' + '|' + ','
            }
          }

        }
      }
    })
  })
  // RBC
  const specialCodes = ['H9531', 'H9535', 'H9594', 'H9571', 'H9574', 'H9595'];

  lisCodeRbcArr.value.forEach(function (lisCode: any) {
    if (lisCode.code !== '') {
      props.selectItems.rbcInfoAfter.forEach(function (rbcItem: any) {
        if (lisCode.categoryId === rbcItem.categoryId) {
          for (const rbcItemElement of rbcItem.classInfo) {
            if (lisCode.classId === rbcItemElement.classId) {
              const degree = Number(rbcItemElement.degree) === 0 ? ' ' : specialCodes.includes(lisCode.code) ? '0' : rbcItemElement.degree;
              rbcTmp += `${lisCode.code}|${degree}|,`;
              resultStr += `${lisCode.code}|${degree}|,`;
            }
          }

        }
      })

    }
  })

  const replacements: any = {
    'H9531': 'H9571',
    'H9532': 'H9572',
    'H9533': 'H9573',
    'H9535': 'H9574',
    'H9536': 'H9575',
    'H9537': 'H9576',
    'H9534': 'H9577',
    'H9538': 'H9578',
    'H9542': 'H9518',
    'H9544': 'H9520',
    'H9546': 'H9517',
    'H9548': 'H9519',
    'H9550': 'H9522',
    'H9552': 'H9521',
    'H9554': 'H9525',
    'H9556': 'H9524',
    'H9558': 'H9526',
    'H9560': 'H9523',
    'H9562': 'H9528',
    'H9564': 'H9530',
    'H9594': 'H9595'
  };

  let rbcTmp2: any = rbcTmp.replace(/H9531|H9532|H9533|H9535|H9536|H9537|H9534|H9538|H9542|H9544|H9546|H9548|H9550|H9552|H9554|H9556|H9558|H9560|H9562|H9564|H9594/g, match => replacements[match]);

  resultStr += rbcTmp;
  resultStr += rbcTmp2;


  var params = {
    url: lisFilePathSetArr.value,
    machine: 'ADUIMD',
    episode: props.selectItems.barcodeNo,
    result: resultStr
  }

  axios.post(params.url + '/api/MifMain/File', {
    machine: params.machine,
    episode: params.episode,
    result: params.result
  }).then(function (result) {
    const res = result.data[0];
    if (res.returnCode === '0') {
      showSuccessAlert(messages.IDS_MSG_SUCCESS);
    } else {
      showSuccessAlert('return code : ' + res.returnCode);
    }

  }).catch(function (err) {
    showSuccessAlert(err.message);
  })
}

const godae = (): string => {
  let data = 'H|\^&||||||||||P||' + props.selectItems.barcodeNo + '\n';
  let seq = 0;
  let kumcMergePercent = 0;
  let kumcBandPercent = 0;

  props.selectItems.wbcInfoAfter.forEach(function (wbcItem: any) {
    if (wbcItem.id === '02' || wbcItem.id === '03' ||
        wbcItem.id === '04' || wbcItem.id === '10') {
      kumcMergePercent += Number(wbcItem.percent)
    }

    if (wbcItem.id === '72') {
      kumcBandPercent = Number(wbcItem.percent)
    }
  })

  if (kumcMergePercent > 0 && kumcBandPercent < 6) {
    // seg
    const segItem = props.selectItems.wbcInfoAfter.filter(function (item: any) {
      return item.id === '71'
    })

    // band
    const bandItem = props.selectItems.wbcInfoAfter.filter(function (item: any) {
      return item.id === '72'
    })

    segItem[0].percent = (Number(segItem[0].percent) + Number(kumcBandPercent)) + ''
    bandItem[0].percent = '0'
  }
  lisCodeWbcArr.value.forEach(function (lisCode: any) {
    if (lisCode.code !== '') {
      props.selectItems.wbcInfoAfter.forEach(function (wbcItem: any) {
        if (lisCode.IA_CD === wbcItem.id) {
          // 5diff는 0이어도 데이터 올림
          if (wbcItem.id === '01' || wbcItem.id === '71' || wbcItem.id === '05' ||
              wbcItem.id === '07' || wbcItem.id === '08' || wbcItem.id === '09') {
            // count
            data += 'R|' + (++seq) + '|^^^^' + lisCode.code + '|' + wbcItem.count + '|||||||^' + userModuleDataGet.value.userId + '\n'

            // percent
            data += 'R|' + (++seq) + '|^^^^' + lisCode.code + '%|' + wbcItem.percent + '|%||||||^' + userModuleDataGet.value.userId + '\n'

          } else {
            if (Number(wbcItem.percent) > 0) {
              // count
              data += 'R|' + (++seq) + '|^^^^' + lisCode.code + '|' + wbcItem.count + '|||||||^' + userModuleDataGet.value.userId + '\n'

              // percent
              data += 'R|' + (++seq) + '|^^^^' + lisCode.code + '%|' + wbcItem.percent + '|%||||||^' + userModuleDataGet.value.userId + '\n'
            }
          }
        }
      })
    }
  })

  return data += 'L|1|N'
}

const lisFileUrlCreate = async (data: any) => {
  if (!lisFilePathSetArr.value.includes("http")) {
    const url = lisFilePathSetArr.value;
    const fileCreateRes = await createDirectory(url);
    if (fileCreateRes) {
      const parms = {
        path: lisFilePathSetArr.value,
        filename: `${lisFilePathSetArr.value}/${props.selectItems.barcodeNo}.lst2msg`,
        content: data,
      };
      const res = await createFile(parms);
      if (res) {
        const result: any = await detailRunningApi(String(props.selectItems.id));
        const updatedItem = {
          submitState: 'lis',
        };
        const updatedRuningInfo ={...result.data,...updatedItem }
        await resRunningItem(updatedRuningInfo, true);
        showSuccessAlert(messages.IDS_MSG_SUCCESS);
        if (!showAlert.value) {
          emits('nextPage')
        }
      } else {
        showErrorAlert('lis file err');
      }
    }
  } else {// url 로 셋팅한 경우
    sendLisMessage(data);
  }
}

const sendLisMessage = (data: any) => {
  const params = {
    url: lisFilePathSetArr.value,
    barcodeNo: props.selectItems.barcodeNo,
    userId: userModuleDataGet.value.userId,
    deviceBarcode: deviceSerialNm.value,
    resultMsg: data
  }
  axios.post(params.url, {
    barcodeNo: params.barcodeNo,
    userid: params.userId,
    deviceBarcode: deviceSerialNm.value,
    resultMsg: params.resultMsg
  }).then(function (result) {
    if (result.data.errorCode === 'E000') {
      showSuccessAlert(messages.IDS_MSG_SUCCESS);
    } else {
      showErrorAlert(result.data.errorMessage);
    }
  }).catch(function (err) {
    showErrorAlert(err.message);
  })
}

const getLisWbcRbcData = async () => {
  try {
    const wbcResult = await getLisCodeApi();
    const rbcResult = await getLisCodeRbcApi();
    if (wbcResult && wbcResult.data && rbcResult && rbcResult.data) {
      const wbcData = wbcResult.data;
      const rbcData = rbcResult.data;

      if (wbcData) {
        lisCodeWbcArr.value = wbcData;
      }
      if (rbcData) {
        lisCodeRbcArr.value = rbcData;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
const getLisPathData = async () => {
  try {
    const result = await getFilePathSetApi();

    if (result && result.data) {
      const data = result.data;
      lisFilePathSetArr.value = data[0].lisFilePath;
    }
  } catch (e) {
    console.error(e);
  }
};

const checkUserAuth = async (empNo: any) => {
  return new Promise((succ, fail) => {
    if (siteCd.value === '0002') {
      const url = `http://emr012.cmcnu.or.kr/cmcnu/.live?submit_id=TRLII00104&business_id=li&instcd=012&userid=${empNo}`;
      axios.get(url).then(function (result) {
        const xml = result.data
        const json = JSON.parse(xml2json(xml, {compact: true}));
        const userNm = json.root.getUsernm.usernm._text;
        if (userNm === null || userNm === '') {
          succ('fail')
        } else {
          succ('succ')
        }

      }).catch(function (err) {
        console.log('checkUserAuth :' + err.message)
        fail(new Error(err.message))
      })

    }
  })
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const onCommit = async () => {
  const localTime = moment().local();

  const result: any = await detailRunningApi(String(props.selectItems.id));
  const updatedItem = {
    submitState: 'Submit',
    submitOfDate: localTime.format(),
    submitUserId: userModuleDataGet.value.userId,
  };
  const updatedRuningInfo ={...result.data,...updatedItem }
  await resRunningItem(updatedRuningInfo);
}


const memoChange = async () => {

  const updatedItem = {
    wbcMemo: wbcMemo.value
  };
  const result: any = await detailRunningApi(String(props.selectItems.id));
  const updatedRuningInfo ={...result.data,...updatedItem }

  await resRunningItem(updatedRuningInfo);
  memoModal.value = false;
}

const memoOpen = () => {
  wbcMemo.value = wbcMemo.value !== '' ? wbcMemo.value : props.selectItems.wbcMemo;
  memoModal.value = !memoModal.value;
}

const memoCancel = () => {
  memoModal.value = false;
}

const getStringValue = (title: string): string => {
  if (title === 'Artifact(Smudge)' && siteCd.value === '0006') {
    return "Artifact";
  } else {
    return title;
  }
};


const resRunningItem = async (updatedRuningInfo: any, noAlert?: boolean) => {
  try {
    const response = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: [updatedRuningInfo]
    })
    if (response) {
      if (!noAlert) {
        showSuccessAlert('success');
      }
      const filteredItems = updatedRuningInfo;
      sessionStorage.setItem('selectItems', JSON.stringify(filteredItems));
      wbcMemo.value = filteredItems.wbcMemo;
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const sortWbcInfo = (wbcInfo: any, basicWbcArr: any) => {
  let newSortArr = JSON.parse(JSON.stringify(wbcInfo));

  newSortArr.sort((a: any, b: any) => {
    const nameA = basicWbcArr.findIndex((item: any) => item.abbreviation === a.abbreviation);
    const nameB = basicWbcArr.findIndex((item: any) => item.abbreviation === b.abbreviation);

    // 이름이 없는 경우는 배열 맨 뒤로 배치
    if (nameA === -1) return 1;
    if (nameB === -1) return -1;

    return nameA - nameB;
  });

  return newSortArr;
};

const getOrderClass = async () => {
  try {
    const result = await getOrderClassApi();
    if (result) {
      if (result?.data.length === 0) {
        orderClass.value = [];
      } else {
        orderClass.value = result.data.sort((a: any, b: any) => Number(a.orderIdx) - Number(b.orderIdx));
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const beforeChang = async () => {
  isBefore.value = true;
  emits('isBefore', true);
  const selectItemsData = sessionStorage.getItem("selectItems");
  selectItemsSessionStorageData.value = selectItemsData ? JSON.parse(selectItemsData) : null;
  await getOrderClass();
  const filteredItems: any = await detailRunningApi(String(selectItemsSessionStorageData.value.id));
  const wbcInfo = filteredItems.data.wbcInfo.wbcInfo[0];
  let wbcArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  const sortedWbcInfo = sortWbcInfo(wbcInfo, wbcArr);
  wbcInfoChangeVal.value = sortedWbcInfo.filter((item: any) => !titleArr.includes(item.title));
  nonRbcClassList.value = sortedWbcInfo.filter((item: any) => titleArr.includes(item.title));
  totalCountSet(wbcInfoChangeVal.value);
}

const afterChang = async (newItem: any) => {
  await getOrderClass();
  emits('isBefore', false);
  isBefore.value = false;
  const filteredItems: any =  await detailRunningApi(String(selectItemsSessionStorageData.value.id));
  const wbcInfo = selectItemsSessionStorageData.value.wbcInfoAfter.length !== 0 ? selectItemsSessionStorageData.value.wbcInfoAfter : filteredItems.data.wbcInfo.wbcInfo[0];
  const wbcInfoAfter = newItem.length === 0 ? wbcInfo : newItem;
  let wbcArr = orderClass.value.length !== 0 ? orderClass.value : window.PROJECT_TYPE === 'bm' ? basicBmClassList : basicWbcArr;
  const sortedWbcInfoAfter = sortWbcInfo(wbcInfoAfter, wbcArr);
  wbcInfoChangeVal.value = sortedWbcInfoAfter.filter((item: any) => !titleArr.includes(item.title));
  nonRbcClassList.value = sortedWbcInfoAfter.filter((item: any) => titleArr.includes(item.title));
  totalCountSet(wbcInfoChangeVal.value);
}
const shouldRenderCategory = (title: string) => {
  // 제외할 클래스들 정의
  const targetArray = getStringArrayBySiteCd(siteCd.value, selectItemsSessionStorageData.value?.testType);
  return !targetArray.includes(title);
};

const getStringArrayBySiteCd = (siteCd: string, testType: string): string[] => {
  if (!siteCd && siteCd === '') {
    siteCd = '0000';
    testType = '01';
  }
  const arraysBySiteCd: any = { // 0006 -> 고대
    '0006': {
      includesStr: ["AR", "NR", "GP", "PA", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
      includesStr2: ["NR", "AR", "MC", "MA", "SM", 'NE', 'GP', 'PA', 'OT'],
    },
  };

  // 지정된 siteCd에 대한 배열을 가져오거나, 기본 배열을 반환
  const arraysForSiteCd = arraysBySiteCd[siteCd] || {
    includesStr: ["AR", "NR", "GP", "PA", "MC", "SM", "MA", 'NE', 'GP', 'PA', 'OT'],
    includesStr2: ["NR", "AR", "MC", "MA", 'NE', "SM", 'GP', 'PA', 'OT'],
  };

  // testType에 따라 제외할 부분 정의
  return (testType === '01' || testType === '04') ? arraysForSiteCd.includesStr : arraysForSiteCd.includesStr2;
};

const totalCountSet = (wbcInfoChangeVal: any) => {
  totalCount.value = 0;
  wbcInfoChangeVal.forEach((item: any) => {
    if (projectBm.value) {
      if (item.title !== 'OT') {
        totalCount.value += Number(item.count);
      }
    } else {
      const targetArray = getStringArrayBySiteCd(siteCd.value, selectItemsSessionStorageData.value?.testType);


      const titleInArray = targetArray.includes(item.title);
      if (!titleInArray) {
        totalCount.value += Number(item.count);
      }
    }
  });
}

async function updateOriginalDb() {
  // wbcInfo.value를 깊은 복제(clone)하여 새로운 배열을 생성
  let clonedWbcInfo = JSON.parse(JSON.stringify(wbcInfoChangeVal.value));
  let totalCount = 0;
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      if (projectBm.value) {
        if (image.title !== 'OT') {
          totalCount += 1
        }
      } else {
        const targetArray = getStringArrayBySiteCd(siteCd.value, selectItemsSessionStorageData.value?.testType);
        if (!targetArray.includes(image.title)) {
          totalCount += 1;
        }
      }
    });
  });
  // 각 이미지 객체에서 width와 height 속성은 저장 안해도되는 부분이라서 디비에 저장 안함
  clonedWbcInfo.forEach((item: any) => {
    item.images.forEach((image: any) => {
      delete image.width;
      delete image.height;
      delete image.filter;
    });
    if (projectBm.value) {
      if (item.title !== 'OT') {
        const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1);  // 소수점 0인경우 정수 표현
        item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
      }
    } else {
      const targetArray = getStringArrayBySiteCd(siteCd.value, selectItemsSessionStorageData.value?.testType);
      if (!targetArray.includes(item.title)) {
        const percentage = ((Number(item.count) / Number(totalCount)) * 100).toFixed(1); // 소수점 0인경우 정수 표현
        item.percent = (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
      }
    }

  });

  // wbcInfoAfter 업데이트 및 sessionStorage에 저장
  selectItemsSessionStorageData.value.wbcInfoAfter = clonedWbcInfo;
  sessionStorage.setItem("selectItems", JSON.stringify(selectItemsSessionStorageData.value));
  sessionStorage.setItem("selectItemWbc", JSON.stringify(clonedWbcInfo));

  const sortArr = sortWbcInfo(orderClass.value, wbcInfoChangeVal.value);
  console.log("SORTARR", sortArr);
  sortArr.forEach((item: any, index: any) => {
    item.orderIdx = index;
  });

  // originalDb 업데이트
  const res: any = await detailRunningApi(String(selectItemsSessionStorageData.value.id));
  if (res) {
    res.data.wbcInfoAfter = clonedWbcInfo;
  }

  await putOrderClassApi(sortArr);
  //updateRunningApi 호출
  await updateRunningApiPost(clonedWbcInfo, [res.data]);

  await store.dispatch('commonModule/setCommonInfo', {classInfoSort: []});
}

async function updateRunningApiPost(wbcInfo: any, originalDb: any) {
  // 러닝 인포 디비에 다시 재저장
  try {
    const response = await updateRunningApi({userId: Number(userId.value), runingInfoDtoItems: originalDb})
    if (response) {

    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
  window.scrollTo({top: 0, behavior: 'smooth'});
};
const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};
</script>