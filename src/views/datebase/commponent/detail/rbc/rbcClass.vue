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
              <li v-if="classInfo.classId !== '01' || category.categoryId === '05'">
                <font-awesome-icon
                    :icon="['fas', 'circle']"
                    v-for="degreeIndex in 4" :key="degreeIndex"
                    :class="{
                        'degreeActive': degreeIndex < Number(classInfo?.degree) + 2 || 0,
                        'degree0-img': degreeIndex >= Number(classInfo?.degree) + 1 || 0
                      }"
                />
              </li>
              <li v-else>
                <div v-if="classInfo.degree === '0'">
                  <font-awesome-icon
                      :icon="['fas', 'circle']"
                  />
                </div>
                <div v-else>
                  <font-awesome-icon
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
  </div>
  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />
</template>

<script setup lang="ts">
import {ref, defineProps, watch, onMounted, computed} from 'vue';
import {RbcInfo} from "@/store/modules/analysis/rbcClassification";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import Button from "@/components/commonUi/Button.vue";
import Alert from "@/components/commonUi/Alert.vue";
const getCategoryName = (category: RbcInfo) => category?.categoryNm;

const props = defineProps(['rbcInfo', 'selectItems', 'originalDb']);
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

const userModuleDataGet = computed(() => store.state.userModule);


onMounted(() => {
    pltCount.value = props.selectItems?.pltCount;
    malariaCount.value = props.selectItems?.malariaCount;
    memo.value = props.selectItems.rbcMemo;
});

watch(() => props.rbcInfo, (newItem) => {
    rbcInfoChangeVal.value = newItem;
    // console.log('rbcInfoChangeVal')
    // console.log(rbcInfoChangeVal.value)
});

watch(() => props.selectItems, (newItem) => {
  pltCount.value = props.selectItems?.pltCount;
  malariaCount.value = props.selectItems?.malariaCount;
});

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
