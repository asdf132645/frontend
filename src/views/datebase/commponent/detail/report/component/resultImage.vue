<template>
  <div class="resultImage" ref="crcReport">
    <div class="resultCode">Code {{ nowCrcData.code }}</div>

    <div class="resultImgBody">
      <h1>RBC Morphology</h1>
      <div class="split-container">
        <ul class="split-left">
          <li v-for="(item, idx) in arrDataRbcLeft" :key="'rbc-left' + idx">
            <div class="rimgcrctitle"> {{ item?.crcTitle }}</div>
            <div> {{ item?.crcContent }}</div>
          </li>
        </ul>
        <ul class="split-right">
          <li v-for="(item, idx) in arrDataRbcRight" :key="'rbc-right' + idx">
            <div class="rimgcrctitle"> {{ item?.crcTitle }}</div>
            <div> {{ item?.crcContent }}</div>
          </li>
        </ul>
      </div>
    </div>

    <div class="resultImgBody">
      <h1>WBC Morphology</h1>
      <div class="split-container">
        <ul class="split-left">
          <li v-for="(item, idx) in arrDataWbcLeft" :key="'wbc-left' + idx">
            <div class="rimgcrctitle"> {{ item?.crcTitle }}</div>
            <div> {{ item?.crcContent }}</div>
          </li>
        </ul>
        <ul class="split-right">
          <li v-for="(item, idx) in arrDataWbcRight" :key="'wbc-right' + idx">
            <div class="rimgcrctitle"> {{ item?.crcTitle }}</div>
            <div> {{ item?.crcContent }}</div>
          </li>
        </ul>
      </div>
    </div>

    <div class="resultImgBody">
      <h1>PLT Morphology</h1>
      <div class="split-container">
        <ul class="split-left">
          <li v-for="(item, idx) in arrDataPltLeft" :key="'plt-left' + idx">
            <div class="rimgcrctitle"> {{ item?.crcTitle }}</div>
            <div> {{ item?.crcContent }}</div>
          </li>
        </ul>
        <ul class="split-right">
          <li v-for="(item, idx) in arrDataPltRight" :key="'plt-right' + idx">
            <div class="rimgcrctitle"> {{ item?.crcTitle }}</div>
            <div> {{ item?.crcContent }}</div>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <table class="resultImgTable">
        <tbody>
        <tr v-if="nowCrcData.crcComment.length !== 0">
          <td class="resultImgTableTitle">Comment</td>
          <td>{{ nowCrcData?.crcComment[0]?.remarkAllContent }}</td>
        </tr>
        <tr v-if="nowCrcData.crcRecommendation.length !== 0">
          <td class="resultImgTableTitle">Recommendation</td>
          <td>{{ nowCrcData?.crcRecommendation[0]?.remarkAllContent }}</td>
        </tr>
        <tr v-if="nowCrcData.crcRemark.length !== 0">
          <td class="resultImgTableTitle">Remark</td>
          <td>{{ nowCrcData?.crcRemark[0]?.remarkAllContent }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <ul class="wbcImgArea">
      <li v-for="(item) in selectWbcImgArr" :key="item.id">
        <div v-if="item?.count !== '0' && item?.count !== 0">
<!--          <p class="mt10">-->
<!--            {{ item?.title }} <span class="smallName">({{ item.item.name }})</span>-->
<!--          </p>-->
          <img :src="getImageUrl(item.image.fileName, item.item.id, item.item.title, '')"/>
        </div>
      </li>
    </ul>
  </div>
  <ToastNotification
      v-if="toastMessage"
      :message="toastMessage"
      :messageType="toastMessageType"
      :duration="1500"
      position="bottom-right"
  />
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, nextTick, onBeforeMount, onMounted, ref, watch} from "vue";
import html2canvas from "html2canvas";
import {cbcImgGetApi, ywmcSaveCommentPostSendApi} from "@/common/api/service/lisSend/lisSend";
import {getCbcCodeList} from "@/common/helpers/lisCbc/inhaCbcLis";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";
import {MESSAGES} from "@/common/defines/constants/constantMessageText";
import {lisSendYwmc, ywmcCbcDataLoad} from "@/common/helpers/lisCbc/ywmcCbcLis";
import {useStore} from "vuex";

const props = defineProps(['nowCrcData', 'recoList', 'commentList', 'captureAndConvertOk', 'barcodeNo', 'selectWbcImgArr', 'slotId']);
const arrDataWbc = ref<any>([]);
const arrDataRbc = ref<any>([]);
const arrDataPlt = ref<any>([]);
const crcReport = ref<HTMLElement | null>(null);
const emits = defineEmits();
const arrDataRbcLeft = computed(() => arrDataRbc.value.slice(0, 4));
const arrDataRbcRight = computed(() => arrDataRbc.value.slice(4));
const arrDataWbcLeft = computed(() => arrDataWbc.value.slice(0, 4));
const arrDataWbcRight = computed(() => arrDataWbc.value.slice(4));
const arrDataPltLeft = computed(() => arrDataPlt.value.slice(0, 4));
const arrDataPltRight = computed(() => arrDataPlt.value.slice(4));
const nowCrcDataVal = ref([]);
const toastMessage = ref('');
const toastMessageType = ref(MESSAGES.TOAST_MSG_SUCCESS);
const store = useStore();
const pbiaRootDir = computed(() => store.state.commonModule.iaRootPath);
const projectType = ref<any>('');
const apiBaseUrl = sessionStorage.getItem('viewerCheck') === 'viewer' ? window.MAIN_API_IP : window.APP_API_BASE_URL;


watch(
    () => [arrDataRbc.value, arrDataWbc.value, arrDataPlt.value],
    async () => {
      if (arrDataRbc.value.length && arrDataWbc.value.length && arrDataPlt.value.length) {
        await nextTick();
        await captureAndConvert();
      }
    }
);

onMounted(async () => {
  await initializeData();
});
onBeforeMount(() => {
  projectType.value = window.PROJECT_TYPE;
})

// 데이터 초기화 함수 정의
const initializeData = async () => {
  arrDataRbc.value = props.nowCrcData?.crcContent?.rbc || [];
  arrDataWbc.value = props.nowCrcData?.crcContent?.wbc || [];
  arrDataPlt.value = props.nowCrcData?.crcContent?.plt || [];
  nowCrcDataVal.value = props.nowCrcData || [];
};


const captureAndConvert = async () => {
  if (crcReport.value) {
    const canvas = await html2canvas(crcReport.value, {
      useCORS: true, // CORS를 허용하도록 설정
      allowTaint: true // 외부 리소스 사용 허용
    });
    const dataUrl = canvas.toDataURL('image/png');

    // Base64 문자열을 Blob으로 변환
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Blob을 ISO-8859-1로 인코딩하고 16진수로 변환
    const hexString = arrayBufferToHex(ab);

    // 디버그용 확인
    // console.log("Hex String:", hexString);

    // 데이터베이스로 저장
    await saveToDatabase(hexString);
    emits('resetBool', true);
  }
};


const getImageDimensions = (hex) => {
  const blob = hexToBlob(hex);
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const size = blob.size; // Blob의 크기 (바이트 단위)
      URL.revokeObjectURL(url); // 메모리 해제
      resolve({width, height, size});
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url); // 메모리 해제
      reject(error);
    };
    img.src = url;
  });
};


const displayImageFromHex = (hexString: string) => {
  const blob = hexToBlob(hexString);
  const url = URL.createObjectURL(blob);

  // 이미지 요소 생성
  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Converted Image';
  img.style.maxWidth = '100%'; // 이미지 크기 조정

  // 이미지 요소를 DOM에 추가
  document.body.appendChild(img);
};

const hexToBlob = (hex: string): Blob => {
  const byteNumbers = [];
  for (let i = 0; i < hex.length; i += 2) {
    byteNumbers.push(parseInt(hex.substr(i, 2), 16));
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], {type: 'image/png'}); // 이미지 타입에 맞게 조정
};

// 어레이버퍼를 ISO-8859-1로 인코딩하고 16진수로 변환하는 함수
const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let hexString = '';

  for (let i = 0; i < bytes.length; i++) {
    // ISO-8859-1로 인코딩된 바이트를 16진수로 변환
    hexString += ('0' + bytes[i].toString(16)).slice(-2);
  }

  return hexString;
};

const saveToDatabase = async (hexString: string) => {
  // uimd 이미지 테스트 하는 함수 실제 사용 x 이미지 태그로 확인 하고 싶으면 이 함수 사용
  // displayImageFromHex(hexString);

  // db 저장 로직
  const req = `smp_no=${props.barcodeNo}`;
  const res = (await cbcImgGetApi(req))?.data;
  if (res) {
    // 이미지의 크기, 너비, 높이를 가져오는 비동기 함수 호출
    const {width, height, size}: any = await getImageDimensions(hexString);
    const {data, cbcDataVal} = await ywmcCbcDataLoad(props?.barcodeNo, await getCbcCodeList());
    const imgData = {
      size: size, // Blob의 크기
      image_rslt: hexString, // 실제 이미지 결과 데이터로 대체
      width: width, // 이미지 너비
      height: height, // 이미지 높이
      rslt_stus: 'F',
      exam_ymd_unit: res[0]?.exam_ymd_unit,
      slip: res[0]?.slip,
      wrk_no: res[0]?.wrk_no,
      exam_cd: res[0]?.exam_cd,
      spc: res[0]?.spc
    };
    const aa = await lisSendYwmc(imgData);
    if(aa === 'Update successful'){
      toastMessageType.value = MESSAGES.TOAST_MSG_SUCCESS;
      showToast('Success');
    }else{
      toastMessageType.value = MESSAGES.TOAST_MSG_ERROR;
      showToast('Lis fail');
    }
  }
};
const showToast = (message: string) => {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = ''; // 메시지를 숨기기 위해 빈 문자열로 초기화
  }, 1500); // 5초 후 토스트 메시지 사라짐
};
function getImageUrl(imageName: any, id: string, title: string, highImg: string, findAfterArr?: boolean): string {
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!props.selectWbcImgArr || props.selectWbcImgArr.length === 0) {
    return "";
  }
  const slotId = props.slotId || '';
  const folderPath = `${pbiaRootDir.value}/${slotId}/${projectTypeReturn(projectType.value)}/${id}_${title}`;
  let url = '';

  // 타임스탬프 추가

  if (highImg === 'getImageRealTime' || projectType.value === 'pb') {
    url = `${apiBaseUrl}/images/getImageRealTime?folder=${folderPath}&imageName=${imageName}`;
  } else {
    url = `${apiBaseUrl}/images?folder=${folderPath}&imageName=${imageName}`;
  }


  return url;
}

const projectTypeReturn = (type: string): any => {
  if (type === 'bm') {
    return '04_BM_Classification';
  } else if (type === 'pb') {
    return '01_WBC_Classification';
  }
}
</script>
