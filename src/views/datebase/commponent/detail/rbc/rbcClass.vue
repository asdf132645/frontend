<template>
  <div>
    <div class="mt2 mb2">
      <h3 class="wbcClassInfoLeft">RBC Classification</h3>
      <ul class="leftWbcInfo">
        <li style="position: relative">
          <font-awesome-icon :icon="['fas', 'comment-dots']" @click="memoOpen"/>
          <div v-if="memoModal" class="memoModal">
            <textarea v-model="memo"></textarea>
            <button @click="memoChange">ok</button>
            <button @click="memoCancel">cancel</button>
          </div>
        </li>
        <li @click="commitConfirmed" :class="{
    'submitted': selectItems.submitState === 'Submit',
  }">
          <font-awesome-icon :icon="['fas', 'square-check']"/>
        </li>
      </ul>
    </div>
    <template v-for="(classList, outerIndex) in [rbcInfoChangeVal]" :key="outerIndex">
      <template v-for="(category, innerIndex) in classList" :key="innerIndex">
        <div class="categories">
          <ul class="categoryNm">
            <li v-if="innerIndex === 0" class="mb1 liTitle">Category</li>
            <li>{{ getCategoryName(category) }}</li>
          </ul>
          <ul class="classNmRbc">
            <li v-if="innerIndex === 0" class="mb1 liTitle">Class</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li>
                <span>{{ classInfo?.classNm }}</span>
                <div v-show="category?.categoryNm === 'Shape' || category.categoryNm === 'Inclusion Body'">
                  <input type="checkbox" :value="`${outerIndex}-${innerIndex}-${classIndex}`"
                         v-show="!except"
                         v-model="checkedClassIndices"
                         @change="updateClassInfoArr(classInfo.classNm, $event.target.checked, category.categoryId, classInfo.classId)">
                </div>
              </li>
            </template>
          </ul>
          <ul class="degree analysis">
            <li v-if="innerIndex === 0" class="mb1 liTitle">Degree</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li v-if="classInfo.classId !== '01' || category.categoryId === '05'">
                <font-awesome-icon
                    :icon="['fas', 'circle']"
                    v-for="degreeIndex in 4" :key="degreeIndex"
                    @click="onClickDegree(category, classInfo, degreeIndex-1, false)"
                    :class="{
                        'degreeActive': degreeIndex < Number(classInfo?.degree) + 2 || 0,
                        'degree0-img': degreeIndex >= Number(classInfo?.degree) + 1 || 0
                      }"
                />
              </li>
              <li v-else>
                <div v-if="classInfo.degree === '0'">
                  <font-awesome-icon
                      @click="onClickDegree(category, classInfo, '0', true)"
                      :icon="['fas', 'circle']"
                  />
                </div>
                <div v-else>
                  <font-awesome-icon
                      @click="onClickDegree(category, classInfo, '1', true) "
                      :icon="['fas', 'circle']"
                      class="degreeActive"
                  />
                </div>
              </li>
            </template>
          </ul>
        </div>
      </template>

    </template>
    <!--orders-->
    <div>
      <div class="categories">
        <ul class="categoryNm">
          <li>Others</li>
        </ul>
        <ul class="classNmRbc">
          <li>
            <span>Platelets</span>
            <div>
              <input type="checkbox"
                     value="9-9-1"
                     v-show="!except"
                     v-model="checkedClassIndices"
                     @change="updateClassInfoArr('Giant Platelet', $event.target.checked, '04', '01')">
            </div>
          </li>
          <li>
            <span>Malaria</span>
            <div>
              <input type="checkbox"
                     v-show="!except"
                     value="9-9-2"
                     v-model="checkedClassIndices"
                     @change="updateClassInfoArr('Malaria', $event.target.checked, '05', '03')">
            </div>
          </li>
        </ul>
        <ul class="degree analysis">
          <li style="font-size: 0.7rem">{{ pltCount || 0 }} PLT / 1000 RBC</li>
          <li style="font-size: 0.7rem">{{ malariaCount || 0 }} / {{ maxRbcCount || 0 }} RBC</li>
        </ul>
      </div>
    </div>
    <div v-if="type !== 'report'" class="beforeAfterBtn">
      <button @click="beforeChange" :class={isBeforeClicked:isBefore}>Before</button>
      <button @click="afterChange" :class={isBeforeClicked:!isBefore}>After</button>
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
import {ref, defineProps, watch, onMounted, computed, defineEmits} from 'vue';
import {RbcInfo} from "@/store/modules/analysis/rbcClassification";
import {detailRunningApi, updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import Button from "@/components/commonUi/Button.vue";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {messages} from "@/common/defines/constFile/constantMessageText";
import {useRouter} from "vue-router";
import moment from "moment/moment";

const getCategoryName = (category: RbcInfo) => category?.categoryNm;
const checkedClassIndices = ref<any>([]);
const props = defineProps(['rbcInfo', 'selectItems','type', 'allCheckClear']);
const rbcInfoChangeVal = ref<any>([]);
const pltCount = ref('');
const malariaCount = ref('');
const memo = ref('');
const memoModal = ref(false);
const store = useStore();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const clonedRbcInfoStore = computed(() => store.state.commonModule.clonedRbcInfo);
const isBefore = ref(false);
const classInfoArr = ref<any>([]);
const emits = defineEmits();
const maxRbcCount = ref('');
const router = useRouter();
const except = ref(false);

onMounted(() => {
  if(router.currentRoute.value.path === '/report'){
    rbcInfoChangeVal.value = props.selectItems.rbcInfoAfter;
    console.log(props.selectItems.rbcInfoAfter)
  }

  pltCount.value = props.selectItems?.rbcInfo.pltCount;
  malariaCount.value = props.selectItems?.rbcInfo.malariaCount;
  memo.value = props.selectItems.rbcMemo;
  maxRbcCount.value = props.selectItems?.rbcInfo?.maxRbcCount;
  except.value = router.currentRoute.value.path === '/report';
});

watch(() => props.rbcInfo, (newItem) => {
  rbcInfoChangeVal.value = props.selectItems.rbcInfoAfter;
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

const beforeChange = () => {
  isBefore.value = true;
  emits('isBeforeUpdate', true);
  rbcInfoChangeVal.value = props.rbcInfo.rbcInfo.rbcClass ? props.rbcInfo.rbcInfo.rbcClass : props.rbcInfo.rbcInfo;
}

const afterChange = () => {
  isBefore.value = false;
  emits('isBeforeUpdate', false);
  if(props.rbcInfo.rbcInfoAfter){
    rbcInfoChangeVal.value = props.rbcInfo.rbcInfoAfter;

  }
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
  if (isBefore.value) {
    return;
  }

  const rbcInfoAfter = rbcInfoChangeVal.value.map((rbc: any) => {
    return rbc?.classInfo.map((item: any) => {
      if (item.classNm === classInfo.classNm && category.categoryNm === rbc?.categoryNm) {
        if (isNormal) {
          item.degree = String(Number(item.degree) === 0 ? 1 : 0);
        } else {
          item.degree = String(degreeIndex);
        }
      }
      return item;
    });
  });

  const updatedSelectItems: any = {
    ...props.selectItems,
    rbcInfoAfter: props.selectItems.rbcInfoAfter.map((rbcItem: any, index: any) => {
      return {
        ...rbcItem,
        classInfo: rbcInfoAfter[index]
      };
    })
  };

  const rbcAfter = props.selectItems.rbcInfoAfter.map((rbcItem: any, index: any) => {
    return {
      ...rbcItem,
      classInfo: rbcInfoAfter[index]
    };
  })
  sessionStorage.setItem('selectItemRbc', JSON.stringify(rbcAfter));
  sessionStorage.setItem('selectItems', JSON.stringify(updatedSelectItems));
  const result: any = await detailRunningApi(String(props.selectItems.id));
  const updatedItem = {
    rbcInfoAfter: rbcAfter,
  };
  const updatedRuningInfo ={...result.data,...updatedItem }
  await resRunningItem([updatedRuningInfo], false);

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
  const updatedRuningInfo ={...result.data,...updatedItem }
  await resRunningItem([updatedRuningInfo], true);
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
  const updatedRuningInfo ={...result.data,...updatedItem }
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
