<template>
  <!--  {{ jsonIsBool }}-->
  <div v-show="jsonIsBool" class="createdRbc"> Creating a new RBC classification ...</div>
  <div>
    <div class="mt1 flexSpaceBetween">
      <h3 class="wbcClassInfoLeft">RBC Classification</h3>
      <ul class="leftWbcInfo rbcClass">
        <li style="position: relative">
          <font-awesome-icon :icon="['fas', 'comment-dots']" @click="memoOpen"/>
          <div v-if="memoModal" class="memoModal">
            <textarea v-model="memo"></textarea>
            <button class="memoModalBtn" @click="memoChange">OK</button>
            <button class="memoModalBtn" @click="memoCancel">CANCEL</button>
          </div>
        </li>
        <li @click="commitConfirmed" :class="{'submitted': submitState === 'Submit'}">
          <font-awesome-icon :icon="['fas', 'square-check']"/>
        </li>
      </ul>
    </div>
    <template v-for="(classList, outerIndex) in [rbcInfoBeforeVal]" :key="outerIndex">
      <template v-for="(category, innerIndex) in classList" :key="innerIndex">
        <div class="categories rbcClass">
          <ul class="categoryNm">
            <li v-if="innerIndex === 0" class="mb1 liTitle" :style="type === 'report' && 'cursor: default;'">Category</li>
            <li  :style="type === 'report' && 'cursor: default;'">
              <span :style="type === 'report' && 'cursor: default;'">{{ getCategoryName(category) }}</span>
              <button class="degreeAllCheckBtn" v-if="getCategoryName(category) === 'Shape' && type !== 'report'"
                      @click="toggleAll(allCheckType, category)">
                {{ allCheckType ? 'All Check' : 'All Uncheck' }}
              </button>
            </li>
          </ul>
          <ul class="classNmRbc">
            <li v-if="innerIndex === 0" class="mb1 liTitle" :style="type === 'report' && 'cursor: default;'">Class</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li @click="handleLiClick(outerIndex, innerIndex, classIndex, classInfo, category)" :style="type === 'report' && 'cursor: default;'">
                <div
                    v-if="(category?.categoryNm === 'Shape' || category.categoryNm === 'Inclusion Body') && type !== 'report' && classInfo?.classNm !== 'Poikilocyte'">
                  <input type="checkbox" :value="`${outerIndex}-${innerIndex}-${classIndex}`"
                         v-show="!except"
                         v-model="checkedClassIndices">
                </div>
                <span :style="type === 'report' && 'cursor: default;'">
                  {{ classInfo?.classNm === 'TearDropCell' ? 'TearDrop Cell' : classInfo?.classNm }}
                </span>
              </li>
              <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '03'" :style="type === 'report' && 'cursor: default;'">
                <span :style="type === 'report' && 'cursor: default;'">Others</span>
              </li>
              <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '05'"
                  @click="handleClick(0, 0, 2, { classNm: 'Malaria', classId: '03' }, { categoryId: '05' }, '9-9-2')"
                  :style="type === 'report' && 'cursor: default;'"
              >
                <div v-if="type !== 'report'">
                  <input type="checkbox"
                         v-show="!except"
                         value="9-9-2"
                         v-model="checkedClassIndices"
                         @change="updateClassInfoArr('Malaria', $event.target.checked, '05', '03')">
                </div>
                <span :style="type === 'report' && 'cursor: default;'">Malaria</span>
              </li>
            </template>
          </ul>
          <ul class="degree analysis">
            <li v-if="innerIndex === 0" class="mb1 liTitle" :style="type === 'report' && 'cursor: default;'">Degree</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li v-if="(classInfo.classId !== '01' || category.categoryId === '05') || (rbcInfoAfterVal[innerIndex].classInfo[classIndex].classId !== '01' || rbcInfoAfterVal[innerIndex].categoryId === '05')"
                  :style="type === 'report' && 'cursor: default;'"
              >
                <span v-if="classInfo.classId !== '01' || category.categoryId === '05'" class="rbcSapn"
                      :style="type === 'report' && 'cursor: default;'"
                >
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-up']"
                      v-for="degreeIndex in 4" :key="degreeIndex"
                      :class="{
                        'degreeActive': degreeIndex < Number(classInfo?.degree) + 2 || 0,
                        'degree0-img': degreeIndex >= Number(classInfo?.degree) + 1 || 0
                      }"
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex].classInfo[classIndex], degreeIndex - 1, false)"
                  />
                </span>
                <span
                    v-if="rbcInfoAfterVal[innerIndex].classInfo[classIndex].classId !== '01' || rbcInfoAfterVal[innerIndex].categoryId === '05'"
                    class="rbcSapnDown"
                    :style="type === 'report' && 'cursor: default;'"
                >
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-down']"
                      v-for="degreeIndex in 4" :key="degreeIndex + '-down'"
                      :class="{
                      'degreeActive': degreeIndex < Number(rbcInfoAfterVal[innerIndex].classInfo[classIndex]?.degree) + 2 || 0,
                      'degree0-img': degreeIndex >= Number(rbcInfoAfterVal[innerIndex].classInfo[classIndex]?.degree) + 1 || 0
                    }"
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex].classInfo[classIndex], degreeIndex - 1, false)"
                  />
                </span>

              </li>
              <li v-else
                  :style="type === 'report' && 'cursor: default;'"
              >
                <span v-if="classInfo.degree === '0'" class="rbcSapn" :style="type === 'report' && 'cursor: default;'">
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-up']"
                  />
                </span>
                <span v-else class="rbcSapn" :style="type === 'report' && 'cursor: default;'">
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-up']"
                      class="degreeActive"
                  />
                </span>
                <span v-if="rbcInfoAfterVal[innerIndex].classInfo[classIndex]?.degree === '0'" class="rbcSapnDown"
                      :style="type === 'report' && 'cursor: default;'"
                >
                  <font-awesome-icon
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex].classInfo[classIndex],'0', true)"
                      :icon="['fac', 'half-circle-down']"
                  />
                </span>
                <span v-else class="rbcSapnDown"
                      :style="type === 'report' && 'cursor: default;'"
                >
                  <font-awesome-icon
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex].classInfo[classIndex], '1', true) "
                      :icon="['fac', 'half-circle-down']"
                      class="degreeActive"
                  />
                </span>
              </li>
              <li v-if="classIndex === category.classInfo.length - 1 && rbcInfoAfterVal[innerIndex].categoryId === '03'"
                  :style="type === 'report' && 'cursor: default;'"
              >
                -
              </li>
              <li v-if="classIndex === category.classInfo.length - 1 && rbcInfoAfterVal[innerIndex].categoryId === '05'"
                  :style="type === 'report' && 'cursor: default;'"
              >
                -
              </li>
              <div v-if="classIndex === category.classInfo.length - 1">
                <div v-for="categoryId in ['01', '02', '05']" :key="categoryId" class="underline"
                     v-show="rbcInfoAfterVal[innerIndex].categoryId === categoryId">
                  Total
                </div>
              </div>
            </template>

          </ul>
          <ul class="rbcPercent">
            <li v-if="innerIndex === 0" class="mb1 liTitle" :style="type === 'report' && 'cursor: default;'">count</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li v-if="classInfo?.classNm !== 'Poikilocyte'" :style="type === 'report' && 'cursor: default;'">
                {{ Number(classInfo?.originalDegree) || 0 }}
              </li>
              <li v-else>-</li>
              <li class="defaultText"
                  v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '03'"
                  :style="type === 'report' && 'cursor: default;'"
              >
                {{ Number(countArtifact + countDoubleNormal) || 0 }}
              </li>
              <li class="defaultText"
                  v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '05'"
                  :style="type === 'report' && 'cursor: default;'"
              >
                {{ Number(malariaCount) || 0 }}
              </li>
              <div v-if="classIndex === category.classInfo.length - 1">
                <div v-for="categoryId in ['01', '02']" :key="categoryId" class="underline"
                     v-show="rbcInfoAfterVal[innerIndex].categoryId === categoryId"
                     :style="type === 'report' && 'cursor: default;'"
                >
                  {{ Number(sizeChromiaTotal) || 0 }}
                </div>
              </div>
              <div class="underline"
                   v-if="classIndex === category.classInfo.length - 1 && rbcInfoAfterVal[innerIndex].categoryId === '05'"
                   :style="type === 'report' && 'cursor: default;'"
              >
                {{ Number(shapeBodyTotal) || 0 }}
              </div>
            </template>
          </ul>
          <ul class="rbcPercent mr1">
            <li v-if="innerIndex === 0" class="mb1 liTitle" :style="type === 'report' && 'cursor: default;'">percent</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li v-if="classInfo?.classNm !== 'Poikilocyte'" :style="type === 'report' && 'cursor: default;'">
                {{ percentageChange(Number(classInfo?.originalDegree)) || 0 }}
              </li>
              <li v-else :style="type === 'report' && 'cursor: default;'">-</li>
              <li class="defaultText"
                  v-if="classIndex === category.classInfo.length - 1 && rbcInfoAfterVal[innerIndex].categoryId === '03'"
                  :style="type === 'report' && 'cursor: default;'"
              >
                {{ percentageChange(countArtifact + countDoubleNormal) || 0 }}
              </li>
              <li class="defaultText"
                  v-if="classIndex === category.classInfo.length - 1 && rbcInfoAfterVal[innerIndex].categoryId === '05'"
                  :style="type === 'report' && 'cursor: default;'"
              >
                {{ percentageChange(malariaCount) || 0 }}
              </li>
              <div v-if="classIndex === category.classInfo.length - 1">
                <div v-for="categoryId in ['01', '02', '05']" :key="categoryId" class="underline"
                     v-show="rbcInfoAfterVal[innerIndex].categoryId === categoryId"
                     :style="type === 'report' && 'cursor: default;'"
                >
                  100%
                </div>
              </div>
            </template>
          </ul>

        </div>
      </template>

    </template>
    <!--orders-->
    <div>
      <div class="categories rbcClass">
        <ul class="categoryNm">
          <li :style="type === 'report' && 'cursor: default;'">Others</li>
        </ul>
        <ul class="classNmRbc">
          <li @click="handleClick(0, 0, 1, { classNm: 'Platelet', classId: '01' }, { categoryId: '04' }, '9-9-1')"
              style="padding-top: 0;">
            <div v-if="type !== 'report'">
              <input type="checkbox"
                     value="9-9-1"
                     v-show="!except"
                     v-model="checkedClassIndices"
                     @change="updateClassInfoArr('Platelet', $event.target.checked, '04', '01')">
            </div>
            <span :style="type === 'report' && 'cursor: default;'">Platelet</span>
          </li>
        </ul>
        <ul class="degree analysis">
          <li :style="type === 'report' && 'cursor: default;'">{{ pltCount || 0 }} PLT / 1000 RBC</li>
        </ul>
        <ul class="rbcPercent"></ul>
        <ul class="rbcPercent"></ul>
      </div>
    </div>
    <!--  RBC 감도 조절 기능  -->
    <!--    <div class="sensitivityDiv" v-if="type !== 'report'">-->
    <!--      <select v-model="selectedClass" @change="classChange">-->
    <!--        <option v-for="(item) in rightClickItem" :key="item.classNm">-->
    <!--          {{ item.classNm }}-->
    <!--        </option>-->
    <!--      </select>-->
    <!--      <SliderBar v-model="sliderValue" :min="0" :max="100" leftText="less" rightText="more"/>-->
    <!--      <button class="degreeBtn" type="button" @click="sensRbcReJsonSend">Ok</button>-->
    <!--    </div>-->
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
import {ref, defineProps, watch, onMounted, computed, defineEmits, getCurrentInstance} from 'vue';
import {RbcInfo} from "@/store/modules/analysis/rbcClassification";
import {detailRunningApi, updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {messages} from "@/common/defines/constFile/constantMessageText";
import {useRouter} from "vue-router";
import moment from "moment/moment";
import SliderBar from "@/components/commonUi/SliderBar.vue";
import {tcpReq} from "@/common/tcpRequest/tcpReq";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import EventBus from "@/eventBus/eventBus";


const getCategoryName = (category: RbcInfo) => category?.categoryNm;
const checkedClassIndices = ref<any>([]);
const props = defineProps(['rbcInfo', 'selectItems', 'type', 'allCheckClear', 'isCommitChanged', 'notCanvasClickVal', 'currentRbcPageNumber']);
const rbcInfoAfterVal = ref<any>([]);
const rbcInfoBeforeVal = ref<any>([]);
const pltCount = ref(0);
const malariaCount = ref(0);
const memo = ref('');
const sliderValue = ref(50);
const memoModal = ref(false);
const store = useStore();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const isBefore = ref(false);
const classInfoArr = ref<any>([]);
const emits = defineEmits();
const maxRbcCount: any = ref('');
const router = useRouter();
const except = ref(false);
const rightClickItem: any = ref([]);
const selectedClass = ref('Macrocyte');
const allCheckType = ref(true);
const rbcInfoPathAfter = ref<any>([]);
const rbcTotalVal = ref(0);
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const jsonIsBool = ref(false);
const rbcReData = computed(() => store.state.commonModule.rbcReData);
const resetRbcArr = computed(() => store.state.commonModule.resetRbcArr);
const selectedSampleId = computed(() => store.state.commonModule.selectedSampleId);
const rbcDegreeStandard = ref<any>([]);
const sizeChromiaTotal = ref(0);
const chromiaTotalTwo = ref(0);
const bodyTotal = ref(0);
const shapeTotal = ref(0);
const shapeBodyTotal = ref(0);
const rbcReDataCheck = computed(() => store.state.commonModule.rbcReDataCheck);
const rbcSendtimerId = ref<number | null>(null);
let timeoutId: any;
const submitState = ref('');
const projectType = ref(window.PROJECT_TYPE);
const countArtifact = ref(0);
const countDoubleNormal = ref(0);
const rbcResponseOldArr = ref([]);
const rbcImagePageNumber = ref(0);

onMounted(async () => {
  rbcImagePageNumber.value = 0;
  const { path } = router.currentRoute.value;
  memo.value = props.selectItems?.rbcMemo;
  pltCount.value = props.selectItems?.rbcInfo.pltCount;
  malariaCount.value = props.selectItems?.rbcInfo.malariaCount;
  memo.value = props.selectItems?.rbcMemo;
  maxRbcCount.value = props.selectItems?.rbcInfo.maxRbcCount;
  submitState.value = props.selectItems?.submitState;
  except.value = path === '/report';
  rightClickItem.value = [];
  rightClickItemSet();
});

watch(() => props.isCommitChanged, () => {
  submitState.value = 'Submit';
})

watch(() => props.allCheckClear, (newItem) => {
  checkedClassIndices.value = [];
  classInfoArr.value = [];
}, {deep: true})

watch(() => props.currentRbcPageNumber, async (newRbcPageNumber) => {
  rbcImagePageNumber.value = newRbcPageNumber;
  await rbcTotalAndReCount(newRbcPageNumber)
})

watch(() => props.selectItems, async (newItem) => {
  pltCount.value = props.selectItems?.pltCount;
  malariaCount.value = props.selectItems?.malariaCount;
  memo.value = props.selectItems?.rbcMemo;
  submitState.value = props.selectItems?.submitState;
  await afterChange(newItem);
  rightClickItemSet();
  allCheckType.value = true;
});

const rightClickItemSet = () => {
  rightClickItem.value = [];
  if (!props.selectItems?.rbcInfo) {
    return;
  }
  const processItems = props.selectItems?.rbcInfo.rbcClass || props.selectItems?.rbcInfo;

  if (processItems) {
    for (const argument of processItems) {
      argument.classInfo.forEach((classInfo: any) => {
        if (classInfo.classNm !== 'Normal') {
          rightClickItem.value.push({...classInfo, categoryId: argument.categoryId});
        }
      });
    }
  }

  rightClickItem.value.push(
      {categoryId: '04', classId: '01', classNm: 'Platelet'},
      {categoryId: '05', classId: '03', classNm: 'Malaria'}
  );
}


watch(() => props.rbcInfo, async (newItem) => {
  await afterChange(newItem);
  await rbcTotalAndReCount(rbcImagePageNumber.value);
  await countReAdd();
  await getRbcDegreeData();
  await reDegree(rbcInfoBeforeVal.value);
  if(areDegreesIdentical(rbcInfoBeforeVal.value, rbcInfoAfterVal.value)){
    await reDegree(rbcInfoAfterVal.value);
  }
});

watch(() => resetRbcArr, async (newItem) => {
  if (newItem) {
    await store.dispatch('commonModule/setCommonInfo', {resetRbcArr: false});
    await rbcTotalAndReCount(rbcImagePageNumber.value);
    await countReAdd();
  }
}, {deep: true})

watch(() => props.allCheckClear, (newItem) => {
  checkedClassIndices.value = [];
  classInfoArr.value = [];
  allCheckType.value = true;
}, {deep: true})


watch(() => rbcReData, async (newItem) => {
  if (newItem) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      jsonIsBool.value = false;
      // await afterChange();
      await rbcTotalAndReCount(rbcImagePageNumber.value);
      await countReAdd();
      await getRbcDegreeData();
      await reDegree(rbcInfoBeforeVal.value);
      if(areDegreesIdentical(rbcInfoBeforeVal.value, rbcInfoAfterVal.value)){
        await reDegree(rbcInfoAfterVal.value);
      }
    }, 1000);
  }

}, {deep: true});

const handleClick = (outerIndex: number, innerIndex: number, classIndex: number, classInfo: any, category: any, value: string) => {
  const isChecked = checkedClassIndices.value.includes(value);

  if (isChecked) {
    checkedClassIndices.value = checkedClassIndices.value.filter((item: any) => item !== value);
  } else {
    checkedClassIndices.value.push(value);
  }

  updateClassInfoArr(classInfo.classNm, !isChecked, category.categoryId, classInfo.classId);
  clickChangeSens(classInfo.classNm, 'Others', category.categoryId, classInfo.classId);
};

function handleLiClick(outerIndex: number, innerIndex: any, classIndex: any, classInfo: any, category: any) {
  toggleCheckbox(outerIndex, innerIndex, classIndex, classInfo, category);
  clickChangeSens(classInfo.classNm, category.categoryNm, category.categoryId, classInfo.classId);
}

function toggleCheckbox(outerIndex: number, innerIndex: number, classIndex: number, classInfo: any, category: any) {
  const value = `${outerIndex}-${innerIndex}-${classIndex}`;
  const isChecked = checkedClassIndices.value.includes(value);

  if (isChecked) {
    checkedClassIndices.value = checkedClassIndices.value.filter((item: any) => item !== value);
  } else {
    checkedClassIndices.value.push(value);
  }

  updateClassInfoArr(classInfo.classNm, !isChecked, category.categoryId, classInfo.classId);
}

const rbcTotalAndReCount = async (pageNumber: any) => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const url_new = `${path}/${props.selectItems.slotId}/03_RBC_Classification/${props.selectItems.slotId}_new.json`;
  const response_new = await readJsonFile({fullPath: url_new});
  const url_Old = `${path}/${props.selectItems.slotId}/03_RBC_Classification/${props.selectItems.slotId}.json`;
  rbcResponseOldArr.value = await readJsonFile({fullPath: url_Old});
  if (response_new.data !== 'not file') { // 비포 , 애프터에 따른 json 파일 불러오는 부분
    const newJsonData = response_new?.data;
    console.log('rbcResponseOldArr.value', rbcResponseOldArr.value);
    for (const rbcItem of rbcResponseOldArr.value.data[pageNumber].rbcClassList) {
      for (const newRbcData of newJsonData) {
        // 기존 부분 삭제 // 여기서 index 찾아서 새로 생성된 json 부분을 추가해야함
        const foundElementIndex = rbcItem.classInfo.findIndex((el: any) =>
            el.index === newRbcData.index
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
    rbcInfoPathAfter.value = rbcResponseOldArr.value?.data[pageNumber].rbcClassList;
  } else {
    rbcInfoPathAfter.value = rbcResponseOldArr.value?.data[pageNumber].rbcClassList;
  }
  if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
    // console.error('rbcInfoPathAfter.value is not iterable');
    return;
  }
  let total = 0;
  let chromiaTotalval = 0;
  let shapeTotalVal = 0;
  let inclusionBody = 0;
  countArtifact.value = 0;
  countDoubleNormal.value = 0;
  rbcInfoPathAfter.value.forEach(el => {
    if (el.categoryId === '03') {
      for (const classItem of el.classInfo) {
        if (classItem.classNm === 'Artifact') {
          countArtifact.value += 1
        } else if (classItem.classNm === 'DoubleNormal') {
          countDoubleNormal.value += 1
        }
      }
    }
    switch (el.categoryId) {
      case '01':
        total = el.classInfo.length;
        break;
      case '02':
        chromiaTotalval = el.classInfo.length;
        break;
      case '03':
        shapeTotalVal = el.classInfo.length;
        break;
      case '05':
        inclusionBody = el.classInfo.length;
        break;
      default:
        break;
    }
  });

  rbcTotalVal.value = Number(total);
  sizeChromiaTotal.value = Number(total);
  chromiaTotalTwo.value = chromiaTotalval;
  bodyTotal.value = Number(inclusionBody);
  shapeTotal.value = Number(shapeTotalVal);
  shapeBodyTotal.value = Number(shapeTotalVal) + Number(inclusionBody);
}

const percentageChange = (count: any): any => {
  const percentage: any = ((Number(count) / Number(rbcTotalVal.value)) * 100).toFixed(1);
  if (isNaN(percentage)) {
    return '-';
  }
  return (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage
}

const classChange = async () => {
  const rbcData = JSON.parse(JSON.stringify(rbcInfoAfterVal.value));
  if (!Array.isArray(rbcData)) {
    return;
  }
  const category = rbcData.find((el: any) => el.categoryNm === selectedClass.value);
  if (category) {
    sliderValue.value = category.sensitivity || 50;
    return;
  }

  for (const el of rbcData) {
    const classInfoItem = el.classInfo.find((classInfo: any) => classInfo.classNm === selectedClass.value);
    if (classInfoItem) {
      sliderValue.value = classInfoItem.sensitivity || 50;
      return;
    }
  }
  sliderValue.value = 50;
};
const resetTimer = () => {
  if (rbcSendtimerId.value !== null) {
    clearTimeout(rbcSendtimerId.value);
  }
};


watch(rbcReDataCheck, (newVal) => {
  resetTimer();

  if (rbcSendtimerId.value !== null) {
    clearInterval(rbcSendtimerId.value);
  }

  rbcSendtimerId.value = window.setInterval(() => {
    if (newVal) {
      sensRbcReJsonSend();
    }
  }, 800);
}, {deep: true});


const sensRbcReJsonSend = async () => {
  jsonIsBool.value = true;
  await rbcInfoAfterSensitivity(selectedClass.value);

  await store.dispatch('commonModule/setCommonInfo', {rbcReData: false});
  const payload = {
    jobCmd: 'RBC_RE_CLASSIFICATION',
    sensitivity: Number(sliderValue.value),
    reqDttm: tcpReq().embedStatus.settings.reqDttm,
    reqUserId: userModuleDataGet.value.userId || '',
    className: selectedClass.value.replace(/\s/g, ''),
    slotId: props.selectItems?.slotId,
    anyWay: 'true',
  };
  EventBus.publish('childEmitSocketData', payload);
}

const clickChangeSens = (classNm: string, categoryNm: string, categoryId: string, classId: any) => {
  if (classNm === 'Normal') {
    return;
  }
  const rbcData = JSON.parse(JSON.stringify(rbcInfoAfterVal.value));
  for (const el of rbcData) {
    for (const item of el?.classInfo) {
      if (item.classNm === classNm && item.classId === classId) {
        sliderValue.value = item.sensitivity || 50;
      }
    }
  }
  selectedClass.value = classNm;
  return;

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


const afterChange = async (newItem?: any) => {

  if (props.selectItems?.submitState === "" || !props.selectItems?.submitState) {
    const result: any = await detailRunningApi(String(props.selectItems?.id));
    const updatedItem = {
      submitState: 'checkFirst',
    };

    const updatedRuningInfo = {...result.data, ...updatedItem}
    await resRunningItem(updatedRuningInfo, false);
  }

  isBefore.value = false;
  emits('isBeforeUpdate', false);
  let rbcData: any = {};
  if (newItem) {
    rbcData = newItem;
  } else {
    rbcData = props.selectItems;
  }


  rbcInfoBeforeVal.value = rbcData.rbcInfo?.rbcClass ? rbcData.rbcInfo.rbcClass : rbcData;
  rbcInfoAfterVal.value = props.selectItems?.rbcInfoAfter ? props.selectItems.rbcInfoAfter : rbcInfoBeforeVal.value;

  // rbcInfoAfterVal.value = areDegreesIdentical(rbcInfoBeforeVal.value, rbcInfoAfterVal.value) ? rbcInfoBeforeVal.value : rbcInfoAfterVal.value;


  // Report 화면에서 RBC Classification 동기화 문제로 추가
  if (props.type === 'report') {
    const result: any = await detailRunningApi(String(selectedSampleId.value));
    rbcInfoAfterVal.value = result.data.rbcInfoAfter;

    await store.dispatch('commonModule/setCommonInfo', {rbcInfoAfterData: result.data.rbcInfoAfter});
  }
  await classChange();
}
const countReAdd = async () => {
  // rbcInfoBeforeVal.value와 rbcInfoPathAfter.value가 정의되어 있는지 확인
  if (!rbcInfoBeforeVal.value || !Array.isArray(rbcInfoBeforeVal.value)) {
    return;
  }

  if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
    return;
  }


  for (const category of rbcInfoBeforeVal.value) {
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
  //

  pltCount.value = Math.floor((totalPLT / parseFloat(maxRbcCount.value)) * 1000);
  malariaCount.value = malariaTotal
};


const rbcInfoAfterSensitivity = async (selectedClassVal: string) => {
  let rbcInfoAfterData = JSON.parse(JSON.stringify(rbcInfoAfterVal.value));
  for (const item of rbcInfoAfterData) {
    if (item.categoryNm === selectedClassVal) {
      item.sensitivity = sliderValue.value;
    } else {
      const findClass = item?.classInfo?.findIndex((option: any) => option.classNm === selectedClassVal);
      if (findClass !== -1 && findClass !== undefined) {
        if (item?.classInfo) {
          item.classInfo[findClass].sensitivity = sliderValue.value;
        }
      }
    }
  }

  // rbcInfoAfterVal 업데이트
  rbcInfoAfterVal.value = rbcInfoAfterData;

  const result: any = await detailRunningApi(String(selectedSampleId.value));
  const updatedItem = {
    rbcInfoAfter: rbcInfoAfterData,
  };

  const updatedRuningInfo = {...result.data, ...updatedItem};
  await resRunningItem(updatedRuningInfo, false);
  return;
}

const toggleAll = (check: boolean, category?: any) => {
  if (props.notCanvasClickVal) {
    return;
  }
  let allCheckboxes: any = [];
  for (const item of rbcInfoBeforeVal.value) {
    if (item.categoryId === '03' || item.categoryId === '04' || item.categoryId === '05') {
      item.classInfo.forEach((classInfo: any, innerIndex: number) => {
        allCheckboxes.push({
          classNm: classInfo.classNm,
          categoryId: item.categoryId,
          classId: classInfo.classId
        });
      });
    }
    if (item.categoryId === '05') {
      allCheckboxes.push({
        classNm: 'Malaria',
        categoryId: '05',
        classId: '03'
      });
    }
  }
  allCheckboxes.push({
    classNm: 'Platelet',
    categoryId: '04',
    classId: '01'
  });
  if (check) {
    checkedClassIndices.value = ["0-2-0", "0-2-1", "0-2-2", "0-2-3", "0-2-4", "0-2-5", "0-2-6", "0-2-7", "0-2-8", "0-2-9", "0-2-10", "0-3-0", "0-3-1", "9-9-1", "9-9-2"];
  } else {
    checkedClassIndices.value = [];
  }

  allCheckboxes.forEach(checkbox => {
    updateClassInfoArr(checkbox.classNm, check, checkbox.categoryId, checkbox.classId);
  });
  allCheckType.value = !allCheckType.value;
}

const updateClassInfoArr = (classNm: string, isChecked: boolean, categoryId: string, classId: string) => {
  if (props.notCanvasClickVal) {
    return;
  }
  if (isChecked) {
    if (!classInfoArr.value.some((item: any) => item.classNm === classNm && item.classId === classId && item.categoryId === categoryId)) {
      classInfoArr.value.push({classNm: classNm, categoryId: categoryId, classId: classId});
    }
  } else {
    classInfoArr.value = classInfoArr.value.filter((item: any) => !(item.classNm === classNm && item.classId === classId && item.categoryId === categoryId));
  }

  emits('classInfoArrUpdate', classInfoArr.value);
};

watch(rbcReData, async (newItem, oldItem) => {
  if (newItem) {
    updataClassInfoaArr();
    return;
  }

}, {deep: true})
const updataClassInfoaArr = () => {
  emits('classInfoArrUpdateRe', classInfoArr.value);
}

const onClickDegree = async (category: any, classInfo: any, degreeIndex: any, isNormal = false) => {
  if (props.type === 'report') {
    return;
  }
  // rbcInfoAfterVal을 깊은 복사하여 수정
  const rbcInfoAfter = JSON.parse(JSON.stringify(rbcInfoAfterVal.value)).map((rbc: any) => {
    if (rbc.categoryNm === category.categoryNm) {
      rbc.classInfo = rbc.classInfo.map((item: any) => {
        if (item.classNm === classInfo.classNm) {
          if (isNormal) {
            item.degree = String(Number(item.degree) === 0 ? 1 : 0);
          } else {
            item.degree = String(degreeIndex);
          }
        }
        return item;
      });
    }
    return rbc;
  });

  // rbcInfoAfterVal 업데이트
  rbcInfoAfterVal.value = rbcInfoAfter;

  const result: any = await detailRunningApi(String(selectedSampleId.value));
  const updatedItem = {
    rbcInfoAfter: rbcInfoAfter,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem};
  await store.dispatch('commonModule/setCommonInfo', {rbcInfoAfterData: rbcInfoAfter});
  await resRunningItem(updatedRuningInfo, false, 'degree');


};

const memoOpen = () => {
  memoModal.value = !memoModal.value;
}

const memoCancel = () => {
  memoModal.value = false;
}

const memoChange = async () => {
  const result: any = await detailRunningApi(String(selectedSampleId.value));

  const enterAppliedRbcMemo = memo.value.replaceAll('\r\n', '<br>');
  const updatedItem = {
    rbcMemo: enterAppliedRbcMemo,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem}
  await resRunningItem(updatedRuningInfo, true);
  memoModal.value = false;
}

const resRunningItem = async (updatedRuningInfo: any, alertShow?: any, degree?: any) => {
  try {
            const day = sessionStorage.getItem('lastSearchParams') || localStorage.getItem('lastSearchParams') || '';
        const {startDate, endDate , page, searchText, nrCount, testType, wbcInfo, wbcTotal}  = JSON.parse(day);
    const dayQuery = startDate + endDate + page + searchText + nrCount + testType + wbcInfo + wbcTotal;
    const response: any = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: [updatedRuningInfo],
      dayQuery: dayQuery,
    })
    if (response) {
      if(degree === 'degree'){
        await rbcTotalAndReCount(rbcImagePageNumber.value);
        await countReAdd();
        await getRbcDegreeData();
        // await reDegree(rbcInfoBeforeVal.value);
        // await reDegree(rbcInfoAfterVal.value);
        // rightClickItemSet();
        // allCheckType.value = true;
      }
      if (alertShow) {
        showSuccessAlert('success');
      }
      const filteredItems = updatedRuningInfo;
      memo.value = filteredItems.rbcMemo;
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

const commitConfirmed = () => {
  if (submitState.value === 'Submit') {
    return;
  }
  showConfirm.value = true;
  confirmMessage.value = messages.IDS_MSG_CONFIRM_SLIDE;
}

const handleOkConfirm = () => {
  onCommit();
  showConfirm.value = false;
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const onCommit = async () => {

  const localTime = moment().local();

  const result: any = await detailRunningApi(String(selectedSampleId.value));
  const updatedItem = {
    submitState: 'Submit',
    submitOfDate: localTime.format(),
    submitUserId: userModuleDataGet.value.name,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem}
  await resRunningItem(updatedRuningInfo);

  emits('submitStateChanged', 'Submit');
}

const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi();
    const data = result.data;
    rbcDegreeStandard.value = data;
  } catch (e) {
    console.log(e);
  }
};

const reDegree = async (rbcInfoArray: any) => {
  if (projectType.value === 'bm') return;

  let totalCount = rbcTotalVal.value;
  let sizeTotal = sizeChromiaTotal.value;
  let chromiaTotal = chromiaTotalTwo.value;
  if(!Array.isArray(rbcInfoBeforeVal.value)){
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


</script>
