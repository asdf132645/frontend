<template>
  <!--  {{ jsonIsBool }}-->
  <div v-show="jsonIsBool" class="createdRbc"> Creating a new RBC classification ...</div>
  <div>
    <div class="mt2">
      <h3 class="wbcClassInfoLeft">RBC Classification</h3>
      <ul class="leftWbcInfo rbcClass">
        <li style="position: relative">
          <font-awesome-icon :icon="['fas', 'comment-dots']" @click="memoOpen"/>
          <div v-if="memoModal" class="memoModal">
            <textarea v-model="memo"></textarea>
            <button @click="memoChange">ok</button>
            <button @click="memoCancel">cancel</button>
          </div>
        </li>
        <li @click="commitConfirmed" :class="{'submitted': selectItems?.submitState === 'Submit'}">
          <font-awesome-icon :icon="['fas', 'square-check']"/>
        </li>
      </ul>
    </div>
    <template v-for="(classList, outerIndex) in [rbcInfoBeforeVal]" :key="outerIndex">
      <template v-for="(category, innerIndex) in classList" :key="innerIndex">
        <div class="categories rbcClass">
          <ul class="categoryNm">
            <li v-if="innerIndex === 0" class="mb1 liTitle">Category</li>
            <li>
              <span>{{ getCategoryName(category) }}</span>
              <button class="degreeAllCheckBtn" v-if="getCategoryName(category) === 'Shape' && type !== 'report'"
                      @click="toggleAll(allCheckType, category)">
                {{ allCheckType ? 'All Check' : 'All Uncheck' }}
              </button>
            </li>
          </ul>
          <ul class="classNmRbc">
            <li v-if="innerIndex === 0" class="mb1 liTitle">Class</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li @click="handleLiClick(outerIndex, innerIndex, classIndex, classInfo, category)">
                <div
                    v-if="(category?.categoryNm === 'Shape' || category.categoryNm === 'Inclusion Body') && type !== 'report'">
                  <input type="checkbox" :value="`${outerIndex}-${innerIndex}-${classIndex}`"
                         v-show="!except"
                         v-model="checkedClassIndices">
                </div>
                <span>
                  {{ classInfo?.classNm === 'TearDropCell' ? 'TearDrop Cell' : classInfo?.classNm }}
                </span>
              </li>
              <li v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '05'">
                <div v-if="type !== 'report'">
                  <input type="checkbox"
                         v-show="!except"
                         value="9-9-2"
                         v-model="checkedClassIndices"
                         @change="updateClassInfoArr('Malaria', $event.target.checked, '05', '03')">
                </div>
                <span @click="clickChangeSens('Malaria', 'Others', '05', '03')">Malaria</span>
              </li>
            </template>
          </ul>
          <ul class="degree analysis">

            <li v-if="innerIndex === 0" class="mb1 liTitle">Degree</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li v-if="(classInfo.classId !== '01' || category.categoryId === '05') || (rbcInfoAfterVal[innerIndex].classInfo[classIndex].classId !== '01' || rbcInfoAfterVal[innerIndex].categoryId === '05')">
                <span v-if="classInfo.classId !== '01' || category.categoryId === '05'" class="rbcSapn">
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-up']"
                      v-for="degreeIndex in 4" :key="degreeIndex"
                      :class="{
                        'degreeActive': degreeIndex < Number(classInfo?.degree) + 2 || 0,
                        'degree0-img': degreeIndex >= Number(classInfo?.degree) + 1 || 0
                      }"
                  />
                </span>
                <span
                    v-if="rbcInfoAfterVal[innerIndex].classInfo[classIndex].classId !== '01' || rbcInfoAfterVal[innerIndex].categoryId === '05'"
                    class="rbcSapnDown">
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
              <li v-else>
                <span v-if="classInfo.degree === '0'" class="rbcSapn">
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-up']"
                  />
                </span>
                <span v-else class="rbcSapn">
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-up']"
                      class="degreeActive"
                  />
                </span>
                <span v-if="rbcInfoAfterVal[innerIndex].classInfo[classIndex]?.degree === '0'" class="rbcSapnDown">
                  <font-awesome-icon
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex].classInfo[classIndex],'0', true)"
                      :icon="['fac', 'half-circle-down']"
                  />
                </span>
                <span v-else class="rbcSapnDown">
                  <font-awesome-icon
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex].classInfo[classIndex], '1', true) "
                      :icon="['fac', 'half-circle-down']"
                      class="degreeActive"
                  />
                </span>
              </li>
              <li v-if="classIndex === category.classInfo.length - 1 && rbcInfoAfterVal[innerIndex].categoryId === '05'">
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
          <ul class="rbcPercent mr1">
            <li v-if="innerIndex === 0" class="mb1 liTitle">percent</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li>
                {{ percentageChange(classInfo?.originalDegree) }}
              </li>
              <li class="defaultText"
                  v-if="classIndex === category.classInfo.length - 1 && category?.categoryId === '05'">
                {{ malariaCount || 0 }}
              </li>
              <div v-if="classIndex === category.classInfo.length - 1">
                <div v-for="categoryId in ['01', '02', '05']" :key="categoryId" class="underline"
                     v-show="rbcInfoAfterVal[innerIndex].categoryId === categoryId">
                  100%
                </div>
              </div>
            </template>
          </ul>
          <ul class="rbcPercent">
            <li v-if="innerIndex === 0" class="mb1 liTitle">count</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li>
                {{ classInfo?.originalDegree }}
              </li>
              <li class="defaultText"
                  v-if="classIndex === category.classInfo.length - 1 && rbcInfoAfterVal[innerIndex].categoryId === '05'">
                {{ percentageChange(malariaCount) }}
              </li>
              <div v-if="classIndex === category.classInfo.length - 1">
                <div v-for="categoryId in ['01', '02']" :key="categoryId" class="underline"
                     v-show="rbcInfoAfterVal[innerIndex].categoryId === categoryId">
                  {{ sizeTotalTwo }}
                </div>
              </div>
              <div class="underline"
                   v-if="classIndex === category.classInfo.length - 1 && rbcInfoAfterVal[innerIndex].categoryId === '05'">
                {{ shapeBodyTotal }}

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
          <li>Others</li>
        </ul>
        <ul class="classNmRbc">
          <li>
            <div v-if="type !== 'report'">
              <input type="checkbox"
                     value="9-9-1"
                     v-show="!except"
                     v-model="checkedClassIndices"
                     @change="updateClassInfoArr('Platelet', $event.target.checked, '04', '01')">
            </div>
            <span @click="clickChangeSens('Platelet', 'Others', '04' ,'01')">Platelet</span>
          </li>
          <!--          <li>-->
          <!--            <div v-if="type !== 'report'">-->
          <!--              <input type="checkbox"-->
          <!--                     v-show="!except"-->
          <!--                     value="9-9-2"-->
          <!--                     v-model="checkedClassIndices"-->
          <!--                     @change="updateClassInfoArr('Malaria', $event.target.checked, '05', '03')">-->
          <!--            </div>-->
          <!--            <span @click="clickChangeSens('Malaria', 'Others', '05', '03')">Malaria</span>-->
          <!--          </li>-->
        </ul>
        <ul class="degree analysis">
          <li style="font-size: 0.8rem">{{ pltCount || 0 }} PLT / 1000 RBC</li>
          <!--          <li style="font-size: 0.8rem">{{ malariaCount || 0 }} / {{ maxRbcCount || 0 }} RBC</li>-->
        </ul>
        <ul class="rbcPercent"></ul>
        <ul class="rbcPercent"></ul>
      </div>
    </div>
    <div class="sensitivityDiv" v-if="type !== 'report'">
      <select v-model="selectedClass" @change="classChange">
        <option v-for="(item) in rightClickItem" :key="item.classNm">
          {{ item.classNm }}
        </option>
      </select>
      <SliderBar v-model="sliderValue" :min="0" :max="100" leftText="less" rightText="more"/>
      <button class="degreeBtn" type="button" @click="sensRbcReJsonSend">Ok</button>
    </div>
    <!--    <div v-if="type !== 'report'" class="beforeAfterBtn">-->
    <!--      <button @click="beforeChange" :class={isBeforeClicked:isBefore}>Before</button>-->
    <!--      <button @click="afterChange" :class={isBeforeClicked:!isBefore}>After</button>-->
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
const props = defineProps(['rbcInfo', 'selectItems', 'type', 'allCheckClear']);
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
const rbcDegreeStandard = ref<any>([]);
const sizeTotalTwo = ref(0);
const chromiaTotalTwo = ref(0);
const shapeBodyTotal = ref(0);
const rbcReDataCheck = computed(() => store.state.commonModule.rbcReDataCheck);
const rbcSendtimerId = ref<number | null>(null);

onMounted(() => {
  const {rbcInfo, rbcMemo} = props.selectItems;
  const {path} = router.currentRoute.value;
  memo.value = rbcMemo;
  pltCount.value = props.selectItems?.rbcInfo.pltCount;
  malariaCount.value = props.selectItems?.rbcInfo.malariaCount;
  memo.value = props.selectItems?.rbcMemo;
  maxRbcCount.value = props.selectItems?.rbcInfo.maxRbcCount;
  except.value = path === '/report';
  rightClickItem.value = [];
  rightClickItemSet();
});

watch(() => props.allCheckClear, (newItem) => {
  checkedClassIndices.value = [];
  classInfoArr.value = [];
}, {deep: true})

watch(() => props.selectItems, (newItem) => {
  pltCount.value = props.selectItems?.pltCount;
  malariaCount.value = props.selectItems?.malariaCount;
  memo.value = props.selectItems?.rbcMemo;
  afterChange(newItem);
  rightClickItemSet();
  allCheckType.value = true;
});

const rightClickItemSet = () => {
  rightClickItem.value = [];
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
  await rbcTotalAndReCount();
  await countReAdd();
  await getRbcDegreeData();
  await reDegree();
});

watch(() => resetRbcArr, async (newItem) => {
  if (newItem) {
    await store.dispatch('commonModule/setCommonInfo', {resetRbcArr: false});
  }
}, {deep: true})

watch(() => props.allCheckClear, (newItem) => {
  checkedClassIndices.value = [];
  classInfoArr.value = [];

}, {deep: true})
let timeoutId: any;

watch(() => rbcReData, async (newItem) => {

  if (newItem) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      jsonIsBool.value = false;
      // await afterChange();
      await rbcTotalAndReCount();
      await countReAdd();
      await getRbcDegreeData();
      await reDegree();
    }, 1000);
  }

}, {deep: true});


watch(() => props.selectItems, (newItem) => {
  pltCount.value = props.selectItems?.pltCount;
  malariaCount.value = props.selectItems?.malariaCount;
});

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

const rbcTotalAndReCount = async () => {
  const path = props.selectItems?.img_drive_root_path !== '' && props.selectItems?.img_drive_root_path ? props.selectItems?.img_drive_root_path : iaRootPath.value;
  const url_new = `${path}/${props.selectItems.slotId}/03_RBC_Classification/${props.selectItems.slotId}_new.json`;
  const response_new = await readJsonFile({fullPath: url_new});
  const url_Old = `${path}/${props.selectItems.slotId}/03_RBC_Classification/${props.selectItems.slotId}.json`;
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
          let sss = {
            classNm: newRbcData.classNm,
            classId: newRbcData.classId,
            posX: String(newRbcData.posX),
            posY: String(newRbcData.posY),
            width: newRbcData.width,
            height: newRbcData.height,
            index: newRbcData.index,
          }
          rbcItem.classInfo.push(sss);
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
  let shapeBodyTotalVal = 0;
  let shapeBodyTotalVal2 = 0;
  rbcInfoPathAfter.value.forEach(el => {
    const lastIndex = el.classInfo.length > 0 ? el.classInfo[el.classInfo.length - 1].index.replace(/[^\d]/g, '') : '';

    switch (el.categoryId) {
      case '01':
        total = lastIndex;
        break;
      case '02':
        chromiaTotalval = lastIndex;
        break;
      case '03':
        shapeBodyTotalVal = lastIndex;
        break;
      case '05':
        shapeBodyTotalVal2 = lastIndex;
        break;
      default:
        // Handle unexpected categoryId if needed
        break;
    }
  });

  rbcTotalVal.value = Number(total) + 1;
  sizeTotalTwo.value = Number(total) + 1;
  chromiaTotalTwo.value = chromiaTotalval;
  shapeBodyTotal.value = Number(shapeBodyTotalVal) + Number(shapeBodyTotalVal2) + 2;
}
const percentageChange = (count: any): any => {
  const percentage = ((Number(count) / Number(rbcTotalVal.value)) * 100).toFixed(1);
  return (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage
}

const classChange = () => {
  const rbcData = JSON.parse(JSON.stringify(rbcInfoAfterVal.value));

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
}, { deep: true });



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

const afterChange = async (newItem?: any) => {
  isBefore.value = false;
  emits('isBeforeUpdate', false);
  let rbcData: any = {};
  if (newItem) {
    rbcData = newItem;
  } else {
    rbcData = props.selectItems;
  }

  rbcInfoBeforeVal.value = rbcData.rbcInfo?.rbcClass ? rbcData.rbcInfo.rbcClass : rbcData;
  if (rbcData?.rbcInfoAfter && typeof props.selectItems.rbcInfoAfter === 'object') {
    rbcInfoAfterVal.value = Object.entries(rbcData.rbcInfoAfter).length === 0 ? rbcInfoBeforeVal.value : rbcData.rbcInfoAfter;
  } else {
    // rbcInfoAfterVal.value = rbcData.rbcInfoAfter && rbcData.rbcInfoAfter.length === 1 ? rbcInfoBeforeVal.value : rbcData.rbcInfoAfter;
    rbcInfoAfterVal.value = rbcData.rbcInfoAfter && rbcData.rbcInfoAfter.length === 1 ? rbcInfoBeforeVal.value : rbcData;
  }

  await classChange();
}
const countReAdd = async () => {
  // rbcInfoBeforeVal.value와 rbcInfoPathAfter.value가 정의되어 있는지 확인
  if (!rbcInfoBeforeVal.value || !Array.isArray(rbcInfoBeforeVal.value)) {
    console.error('rbcInfoBeforeVal.value is not an array');
    return;
  }

  if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
    console.error('rbcInfoPathAfter.value is not an array');
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
  malariaCount.value = malariaTotal / Number(maxRbcCount.value);
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
  rbcInfoAfterVal.value = rbcInfoAfterData;
  // rbcInfoAfterVal 업데이트
  const rbcInfoAfter = rbcInfoAfterData

  const result: any = await detailRunningApi(String(props.selectItems?.id));
  const updatedItem = {
    rbcInfoAfter: rbcInfoAfter,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem};
  await resRunningItem(updatedRuningInfo, false);
  return;
}

const toggleAll = (check: boolean, category?: any) => {
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

  // Optionally removeDiv() can be called here if needed
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

  const result: any = await detailRunningApi(String(props.selectItems?.id));
  const updatedItem = {
    rbcInfoAfter: rbcInfoAfter,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem};
  await resRunningItem(updatedRuningInfo, false);
};

const memoOpen = () => {
  memo.value = memo.value !== '' ? memo.value : props.selectItems?.rbcMemo;
  memoModal.value = !memoModal.value;
}

const memoCancel = () => {
  memoModal.value = false;
}

const memoChange = async () => {
  const result: any = await detailRunningApi(String(props.selectItems?.id));
  const updatedItem = {
    rbcMemo: memo.value,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem}
  await resRunningItem(updatedRuningInfo, true);
  memoModal.value = false;
}

const resRunningItem = async (updatedRuningInfo: any, alertShow?: any) => {
  try {
    const response = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: [updatedRuningInfo]
    })
    if (response) {
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

  const result: any = await detailRunningApi(String(props.selectItems?.id));
  const updatedItem = {
    submitState: 'Submit',
    submitOfDate: localTime.format(),
    submitUserId: userModuleDataGet.value.name,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem}
  await resRunningItem(updatedRuningInfo);
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


const reDegree = async () => {
  let totalCount = rbcTotalVal.value;
  let sizeTotal = sizeTotalTwo.value;
  let chromiaTotal = chromiaTotalTwo.value;

  rbcInfoBeforeVal.value.forEach((rbcCategory: any, idx1: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any, idx2: any) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        // rbcClass.originalDegree = originalData[idx1].classInfo[idx2].degree;
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.degree);
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
  rbcInfoBeforeVal.value.forEach((rbcCategory: any, idx1: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any, idx2: any) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        // rbcClass.originalDegree = originalData[idx1].classInfo[idx2].degree;
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


  rbcInfoBeforeVal.value.forEach((rbcCategory: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any) => {
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
}

</script>
