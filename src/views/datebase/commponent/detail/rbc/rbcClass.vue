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
        <li @click="commitConfirmed">
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
          <ul class="classNm">
            <li v-if="innerIndex === 0" class="mb1 liTitle">Class</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
              <li>{{ classInfo?.classNm }}</li>
            </template>
          </ul>
          <ul class="degree">
            <li v-if="innerIndex === 0" class="mb1 liTitle">Degree</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
              <li  v-if="classInfo.classId !== '01' || category.categoryId === '05'">
                <font-awesome-icon
                    :icon="['fas', 'circle']"
                    v-for="degreeIndex in 4" :key="degreeIndex"
                    @click="onClickDegree(classInfo, degreeIndex-1)"
                    :class="{
                        'degreeActive': degreeIndex < Number(classInfo?.degree) + 2 || 0,
                        'degree0-img': degreeIndex >= Number(classInfo?.degree) + 1 || 0
                      }"
                />
              </li>
              <li v-else>
                <div  v-if="classInfo.degree === '0'">
                  <font-awesome-icon
                      @click="onClickDegreeNormal(category, classInfo)"
                      :icon="['fas', 'circle']"
                  />
                </div>
                <div v-else>
                  <font-awesome-icon
                      @click="onClickDegreeNormal(category, classInfo)"
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
            <ul class="classNm">
              <li>Platelets</li>
              <li>Malaria</li>
            </ul>
            <ul class="degree">
              <li style="font-size: 0.7rem">{{ pltCount || 0 }} PLT / 1000 RBC</li>
              <li style="font-size: 0.7rem">{{ malariaCount || 0 }} / {{ maxRbcCount || 0 }} RBC</li>
            </ul>
          </div>
    </div>
    <div v-if="type !== 'report'" class="beforeAfterBtn">
      <button @click="beforeChange">Before</button>
      <button @click="afterChange">After</button>
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
import {ref, defineProps, watch, onMounted, computed} from 'vue';
import {RbcInfo} from "@/store/modules/analysis/rbcClassification";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import Button from "@/components/commonUi/Button.vue";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {messages} from "@/common/defines/constFile/constant";

const getCategoryName = (category: RbcInfo) => category?.categoryNm;

const props = defineProps(['rbcInfo', 'selectItems', 'originalDb', 'type']);
const rbcInfoChangeVal = ref([]);
const pltCount = ref('');
const malariaCount = ref('');
const pltLabel = 'Platelets';
const malariaLabel = 'Malaria';
const memo = ref('');
const memoModal = ref(false);
const store = useStore();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const userConfirmed = ref(false);

const userModuleDataGet = computed(() => store.state.userModule);


onMounted(() => {
  console.log('props.selectItems',props.selectItems)
  pltCount.value = props.selectItems?.pltCount;
  malariaCount.value = props.selectItems?.malariaCount;
  memo.value = props.selectItems.rbcMemo;
  console.log(props.rbcInfo);
});

watch(() => props.rbcInfo, (newItem) => {
  console.log('newItem')
  rbcInfoChangeVal.value = newItem;
});

watch(() => props.selectItems, (newItem) => {
  console.log('watch-props.selectItems')
  pltCount.value = props.selectItems?.pltCount;
  malariaCount.value = props.selectItems?.malariaCount;
});

const beforeChange = () => {
  rbcInfoChangeVal.value = props.rbcInfo;
}

const afterChange = () => {
  const selectItemRbcAfter = sessionStorage.getItem('selectItemRbcAfter')
  console.log('selectItemRbcAfter', selectItemRbcAfter)
  rbcInfoChangeVal.value = JSON.parse(selectItemRbcAfter)
  console.log('afterchange', rbcInfoChangeVal.value)
}

const onClickDegree = (classInfo, degreeIndex) => {

  const selectItemRbcAfter = rbcInfoChangeVal.value.map(rbc => {
    return rbc.classInfo.map(item => {
      if (item.classNm === classInfo.classNm) {
        item.degree = String(degreeIndex);
      }
      return item;
    });
  });

  sessionStorage.setItem('selectItemRbcAfter', JSON.stringify(selectItemRbcAfter));

}

const onClickDegreeNormal = (category, classInfo) => {
  const selectItemRbcAfter = rbcInfoChangeVal.value.map(rbc => {
    if (category.categoryNm === rbc.categoryNm) {
      rbc.classInfo.forEach(item => {
        if (item.classNm === classInfo.classNm) {
          item.degree = item.degree === '0' ? '1' : '0';
        }
      });
    }
    return rbc;
  });
  
  sessionStorage.setItem('selectItemRbcAfter', JSON.stringify(selectItemRbcAfter));
}


const memoOpen = () => {
  memo.value = memo.value !== '' ? memo.value : props.selectItems.rbcMemo;
  memoModal.value = !memoModal.value;
}

const memoCancel = () => {
  memoModal.value = false;
}

const memoChange = async () => {
  const updatedRuningInfo = props.originalDb.map((item: any) => {
    if (item.id === props.selectItems.id) {
      // id가 일치하는 경우 해당 항목의 submit 값을 변경
      // updatedItem의 내용을 변경
      return {...item, rbcMemo: memo.value};
    }
    return item;
  });
  await resRunningItem(updatedRuningInfo);
  memoModal.value = false;
}

const resRunningItem = async (updatedRuningInfo: any) => {
  try {
    const response = await updateRunningApi({
      userId: Number(userModuleDataGet.value.id),
      runingInfoDtoItems: updatedRuningInfo
    })
    if (response) {
      showSuccessAlert('success');
      const filteredItems = updatedRuningInfo.filter((item: any) => item.id === props.selectItems.id);
      sessionStorage.setItem('selectItems', JSON.stringify(filteredItems[0]));
      sessionStorage.setItem('originalDbData', JSON.stringify(updatedRuningInfo));
      memo.value = filteredItems[0].rbcMemo;
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  const updatedRuningInfo = props.originalDb
      .filter((item: any) => item.id === props.selectItems.id)
      .map((item: any) => {
        const updatedItem = {...item, signedState: 'Submit', signedOfDate: new Date(), signedUserId: item.id};
        updatedItem.submit = 'Submit';
        return updatedItem;
      });

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
