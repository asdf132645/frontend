<template>
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
        <li @click="commitConfirmed" :class="{'submitted': selectItems.submitState === 'Submit'}">
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
              <button class="degreeAllCheckBtn" v-show="getCategoryName(category) === 'Shape'"
                      @click="toggleAll(allCheckType, category)">
                {{ allCheckType ? 'All Check' : 'All Uncheck' }}
              </button>
            </li>
          </ul>
          <ul class="classNmRbc">
            <li v-if="innerIndex === 0" class="mb1 liTitle">Class</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li>
                <div v-show="category?.categoryNm === 'Shape' || category.categoryNm === 'Inclusion Body'">
                  <input type="checkbox" :value="`${outerIndex}-${innerIndex}-${classIndex}`"
                         v-show="!except"
                         v-model="checkedClassIndices"
                         @change="updateClassInfoArr(classInfo.classNm, $event.target.checked, category.categoryId, classInfo.classId)">
                </div>
                <span
                    @click="clickChangeSens(classInfo.classNm, category.categoryNm, category.categoryId, classInfo.classId)">{{
                    classInfo?.classNm
                  }}</span>
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
            <div>
              <input type="checkbox"
                     value="9-9-1"
                     v-show="!except"
                     v-model="checkedClassIndices"
                     @change="updateClassInfoArr('Giant Platelet', $event.target.checked, '04', '01')">
            </div>
            <span @click="clickChangeSens('Giant Platelet', 'Others', '04' ,'01')">Giant Platelet</span>
          </li>
          <li>
            <div>
              <input type="checkbox"
                     v-show="!except"
                     value="9-9-2"
                     v-model="checkedClassIndices"
                     @change="updateClassInfoArr('Malaria', $event.target.checked, '05', '03')">
            </div>
            <span @click="clickChangeSens('Malaria', 'Others', '05', '03')">Malaria</span>
          </li>
        </ul>
        <ul class="degree analysis">
          <li style="font-size: 0.8rem">{{ pltCount || 0 }} PLT / 1000 RBC</li>
          <li style="font-size: 0.8rem">{{ malariaCount || 0 }} / {{ maxRbcCount || 0 }} RBC</li>
        </ul>
      </div>
    </div>
    <div class="sensitivityDiv" v-if="type !== 'report'">
      <select v-model="selectedClass">
        <option v-for="(item) in rightClickItem" :key="item.classNm">
          {{ item.classNm }}
        </option>
      </select>
      <SliderBar v-model="sliderValue" :min="0" :max="100"/>
      <button class="degreeBtn" type="button" @click="sensSend">Ok</button>
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
import Button from "@/components/commonUi/Button.vue";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {messages} from "@/common/defines/constFile/constantMessageText";
import {useRouter} from "vue-router";
import moment from "moment/moment";
import SliderBar from "@/components/commonUi/SliderBar.vue";


const getCategoryName = (category: RbcInfo) => category?.categoryNm;
const checkedClassIndices = ref<any>([]);
const props = defineProps(['rbcInfo', 'selectItems', 'type', 'allCheckClear']);
const rbcInfoAfterVal = ref<any>([]);
const rbcInfoBeforeVal = ref<any>([]);
const pltCount = ref('');
const malariaCount = ref('');
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
const maxRbcCount = ref('');
const router = useRouter();
const except = ref(false);
const rightClickItem: any = ref([]);
const selectedClass = ref('Normal');
const allCheckType = ref(true);
const instance = getCurrentInstance();

onMounted(() => {
  const {rbcInfo, rbcMemo} = props.selectItems;
  const {path} = router.currentRoute.value;

  pltCount.value = rbcInfo?.pltCount;
  malariaCount.value = rbcInfo?.malariaCount;
  memo.value = rbcMemo;
  maxRbcCount.value = rbcInfo?.maxRbcCount;
  except.value = path === '/report';
  rightClickItem.value = [];

  const processItems = rbcInfo?.rbcClass || rbcInfo;

  if (processItems) {
    for (const argument of processItems) {
      if (['Shape', 'Inclusion Body'].includes(argument.categoryNm)) {
        argument.classInfo.forEach((classInfo: any) => {
          rightClickItem.value.push({...classInfo, categoryId: argument.categoryId});
        });
      }
    }
  }

  rightClickItem.value.unshift(
      {categoryId: '01', categoryNm: 'Size', classNm: 'Size'},
      {categoryId: '02', categoryNm: 'Chromia', classNm: 'Chromia'}
  );

  rightClickItem.value.push(
      {categoryId: '04', classId: '01', classNm: 'Giant Platelet'},
      {categoryId: '05', classId: '03', classNm: 'Malaria'}
  );
});


watch(() => props.rbcInfo, (newItem) => {
  afterChange();
});

watch(() => props.allCheckClear, (newItem) => {
  checkedClassIndices.value = [];
  classInfoArr.value = [];

}, {deep: true})

watch(() => props.selectItems, (newItem) => {
  pltCount.value = props.selectItems?.pltCount;
  malariaCount.value = props.selectItems?.malariaCount;
});

const sensSend = () => {
  rbcInfoAfterSensitivity(selectedClass.value);
  instance?.appContext.config.globalProperties.$socket.emit('message', {
    type: 'SEND_DATA',
    payload: {
      jobCmd: 'rbcReClassification',
      sensitivity: sliderValue.value,
      className: selectedClass.value,
    }
  });
}

const clickChangeSens = (classNm: string, categoryNm: string, categoryId: string, classId: any) => {
  const rbcData = JSON.parse(JSON.stringify(rbcInfoAfterVal.value));
  for (const el of rbcData) {
    if (categoryNm === 'Size' || categoryNm === 'Chromia') {
      if (el.categoryNm === categoryNm) {
        sliderValue.value = el?.sensitivity || 50;
      }
    } else {
      for (const item of el?.classInfo) {
        if (item.classNm === classNm && item.classId === classId) {
          sliderValue.value = item.sensitivity || 50;
        }
      }
    }
  }
  if (categoryNm === 'Size') {
    selectedClass.value = 'Size';
    return;
  } else if (categoryNm === 'Chromia') {
    selectedClass.value = 'Chromia';
    return;
  } else {
    selectedClass.value = classNm;
    return;
  }

}

const afterChange = () => {
  isBefore.value = false;
  emits('isBeforeUpdate', false);
  rbcInfoBeforeVal.value = props.selectItems.rbcInfo.rbcClass ? props.selectItems.rbcInfo.rbcClass : props.selectItems.rbcInfo;
  if (typeof props.selectItems.rbcInfoAfter === 'object') {
    rbcInfoAfterVal.value = Object.entries(props.selectItems.rbcInfoAfter).length === 0 ? rbcInfoBeforeVal.value : props.selectItems.rbcInfoAfter;
  } else {
    rbcInfoAfterVal.value = props.selectItems.rbcInfoAfter && props.selectItems.rbcInfoAfter.length === 1 ? rbcInfoBeforeVal.value : props.selectItems.rbcInfoAfter;
  }
}

const rbcInfoAfterSensitivity = async (selectedClassVal: string) => {
  let rbcInfoAfterData = JSON.parse(JSON.stringify(rbcInfoAfterVal.value));
  for (const item of rbcInfoAfterData) {
    if (item.categoryNm === selectedClassVal) {
      item.sensitivity = sliderValue.value;
      console.log(item);
    } else {
      const findClass = item?.classInfo?.findIndex((option: any) => option.classNm === selectedClassVal);
      if (findClass !== -1 && findClass !== undefined) {
        if (item?.classInfo) {
          item.classInfo[findClass].sensitivity = sliderValue.value;
          console.log(item.classInfo[findClass])
        }
      }
    }
  }
  rbcInfoAfterVal.value = rbcInfoAfterData;
  // rbcInfoAfterVal 업데이트
  const rbcInfoAfter = rbcInfoAfterData

  const updatedSelectItems = {
    ...props.selectItems,
    rbcInfoAfter: rbcInfoAfter
  };

  sessionStorage.setItem('selectItems', JSON.stringify(updatedSelectItems));

  const result: any = await detailRunningApi(String(props.selectItems.id));
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
  }
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


const onClickDegree = async (category: any, classInfo: any, degreeIndex: any, isNormal = false) => {
  if (props.type === 'report' || isBefore.value) {
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

  // updatedSelectItems와 rbcAfter 업데이트
  const updatedSelectItems = {
    ...props.selectItems,
    rbcInfoAfter: rbcInfoAfter
  };

  sessionStorage.setItem('selectItemRbc', JSON.stringify(rbcInfoAfter));
  sessionStorage.setItem('selectItems', JSON.stringify(updatedSelectItems));

  const result: any = await detailRunningApi(String(props.selectItems.id));
  const updatedItem = {
    rbcInfoAfter: rbcInfoAfter,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem};
  await resRunningItem(updatedRuningInfo, false);
};


const memoOpen = () => {
  memo.value = memo.value !== '' ? memo.value : props.selectItems.rbcMemo;
  memoModal.value = !memoModal.value;
}

const memoCancel = () => {
  memoModal.value = false;
}

const memoChange = async () => {
  const result: any = await detailRunningApi(String(props.selectItems.id));
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
      sessionStorage.setItem('selectItems', JSON.stringify(filteredItems));
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

  const result: any = await detailRunningApi(String(props.selectItems.id));
  const updatedItem = {
    submitState: 'Submit',
    submitOfDate: localTime.format(),
    submitUserId: userModuleDataGet.value.name,
  };
  const updatedRuningInfo = {...result.data, ...updatedItem}
  await resRunningItem(updatedRuningInfo);
}

</script>


<style scoped>

.table-container {
  display: flex;
  flex-direction: column;
}

.rbc-head,
.rbc-container {
  flex: 1;
  padding-right: 20px;
  text-align: left;
}

</style>
