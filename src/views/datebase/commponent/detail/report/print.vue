<template>
  <div class="printSection">
    <button class="printCloseBtn" @click="closePrint">Close</button>
    <div ref="printContent">
      <div>
        <h3 class="printDetailTitle">Analysis Report from UIMD PB system</h3>
      </div>
      <div class="reportContent">
        <table>
          <colgroup>
            <col width="30%"/>
            <col width="70%"/>
          </colgroup>
          <tbody>
          <tr>
            <th>Slot ID</th>
            <td>{{ selectItems?.slotId }}</td>
          </tr>
          <tr>
            <th>Ordered date</th>
            <td>{{ selectItems?.orderDttm }}</td>
          </tr>
          <tr>
            <th>Signed by ID</th>
            <td>{{ selectItems?.signedUserId }}</td>
          </tr>
          <tr>
            <th>Signed date</th>
            <td>{{ selectItems?.signedOfDate }}</td>
          </tr>
          <tr>
            <th>Ordered Classification</th>
            <td>{{ getTestTypeText(selectItems?.testType) }}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>{{ selectItems?.patientName }}</td>
          </tr>
          <tr>
            <th>Birth</th>
            <td>{{ selectItems?.birthDay }}</td>
          </tr>
          <tr>
            <th>Gender</th>
            <td>{{ selectItems?.gender === '01' ? 'Male' : 'Female' }}</td>
          </tr>
          </tbody>
        </table>
        <div>
          <div v-if="['01', '04'].includes(selectItems?.testType)" class="reportContent">
            <h3 class="printDetailTitle">RBC classification result</h3>
            <table>
              <colgroup>
                <col width="30%"/>
                <col width="45%"/>
                <col width="*"/>
              </colgroup>
              <tbody>
              <tr>
                <th>CATEGORY_NM</th>
                <td>// rbc 개발 후 DEGREE 넣는 부분 CLASS_NM</td>
                <td>DEGREE</td>
              </tr>
              <tr>
                <th>Others</th>
                <th>Platelets</th>
                <th>{{ selectItems?.pltCount }} PLT / 1000 RBC</th>
              </tr>
              <tr>
                <th></th>
                <th>Malaria</th>
                <th>{{ selectItems.malariaCount }} / {{ selectItems.maxRbcCount }} RBC</th>
              </tr>
              <tr>
                <th></th>
                <th>Comment</th>
                <th>rbc 개발 완료 후 코멘트 넣는 부분</th>
              </tr>
              </tbody>
            </table>
          </div>
          <div class="reportContent">
            <h3 class="printDetailTitle">WBC classification result</h3>
            <table>
              <colgroup>
                <col width="30%"/>
                <col width="45%"/>
                <col width="*"/>
              </colgroup>
              <tbody>
              <tr v-for="item in filteredWbcInfo" :key="item.id">
                <th>{{ item?.name }}</th>
                <td>{{ item?.count }}</td>
                <td>{{ item?.percent }}</td>
              </tr>
              <tr>
                <th>Total count</th>
                <td>{{ selectItems?.wbcInfo?.totalCount }}</td>
                <td>100.00%</td>
              </tr>
              <tr v-for="item in filteredWbcInfo" :key="item.id">
                <th>{{ item?.name }}</th>
                <td colspan="2">
                  {{ item?.count }}
                  <span v-if="item.id === '12' || item.id === '13'">
                  / {{ selectItems?.wbcInfo?.maxWbcCount }} WBC
                </span>
                </td>
              </tr>
              <tr>
                <th>Comment</th>
                <td colspan="2">{{ selectItems?.memo }}</td>
              </tr>
              </tbody>
            </table>
            <ul class="cellImgBox print">
              <li v-for="(item) in wbcInfo" :key="item.id">
                <div>
                  <p class="mt1">{{ item?.title }} ({{ item?.count }})</p>
                </div>
                <ul :class="'wbcImgWrap ' + item?.title">
                  <li v-for="(image) in item.images" :key="image.fileName" style="display: inline-block">
                    <div style="position: relative">
                      <img :src="getImageUrl(image.fileName, item.id, item.title)"
                           :width="image.width ? image.width : '150px'"
                           :height="image.height ? image.height : '150px'"
                           :style="{ filter: image.filter }"
                           class="cellImg"
                           ref="cellRef"
                      />
                      <div class="center-point" :style="image.coordinates"></div>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, onMounted, ref} from "vue";
import {getTestTypeText} from "@/common/lib/utils/conversionDataUtils";
import {getImagePrintApi} from "@/common/api/service/setting/settingApi";
import {useStore} from "vuex";

const props = defineProps(['selectItems', 'printOnOff', 'selectItemWbc']);
const apiBaseUrl = process.env.APP_API_BASE_URL || 'http://192.168.0.131:3002';

const printContent = ref(null);
const wbcInfo = ref([]);
const wbcInfoImg = ref([]);
const pbiaRootPath = sessionStorage.getItem("pbiaRootPath");
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const store = useStore();
const imagePrintAndWbcArr = ref<string[]>([]);
const emit = defineEmits(['printClose']);

onMounted(async () => {
  wbcInfo.value = typeof props.selectItemWbc === 'object' ? props.selectItemWbc : JSON.parse(props.selectItemWbc);
  userId.value = getStoredUser.id || userModuleDataGet.value.userId;
  await getImagePrintData();
  await printPage();

});

const filteredWbcInfo = computed(() => {
  return wbcInfo.value.filter(item => {
    return (
        (item.id !== '12' && item.id !== '13' && item.id !== '14' && item.id !== '15' && item.id !== '16') &&
        item.count > 0
    );
  });
});

function getImageUrl(imageName: any, id: string, title: string): string {
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!wbcInfo.value || wbcInfo.value.length === 0) {
    return "";
  }
  const slotId = props.selectItems.slotId || "";
  const folderPath = `${pbiaRootPath}/${slotId}/01_WBC_Classification/${id}_${title}`;
  return `${apiBaseUrl}/images?folder=${folderPath}&imageName=${imageName}`;

}


const printPage = async () => {
  try {
    // 프린트할 컨텐츠를 가져옴
    const content = printContent.value;
    if (!content) {
      throw new Error("프린트할 내용을 찾을 수 없습니다.");
    }

    // HTML 컨텐츠를 PDF로 변환하는 요청을 보냄
    const response = await fetch(`${apiBaseUrl}/pdf/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({htmlContent: content.innerHTML})
    });

    if (!response.ok) {
      throw new Error('HTML을 PDF로 변환하는데 실패했습니다.');
    }

    // 받은 PDF 파일을 브라우저의 PDF 뷰어로 열기
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'width=800,height=500');
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error:', error);
  }
};


const getImagePrintData = async () => {
  try {
    const result = await getImagePrintApi(String(userId.value));

    if (result && result.data) {
      const data = result.data;

      if (!data || (data instanceof Array && data.length === 0)) {
        console.log(null);
      } else {
        imagePrintAndWbcArr.value = data
            .filter((item) => item.checked)
            .map((item) => item.value);
        console.log(imagePrintAndWbcArr.value);

        // 이미지 프린트 및 wbc 배열에 없는 아이디 제거
        wbcInfo.value = wbcInfo.value.filter((item) =>
            imagePrintAndWbcArr.value.includes(item.id)
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const closePrint = () => {
  emit('printClose');
}

</script>
