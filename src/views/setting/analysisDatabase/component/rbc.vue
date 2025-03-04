<template>
  <div class="setting-rbcDegree-main-container">
    <div class="setting-rbcDegree-top-container">
      <h1 class="fs12">RBC Degree</h1>
      <div class="setting-rbcDegree-resetBtn">
        <Button @click="onResetDegree" :icon="['fas', 'rotate-right']" size="sm"></Button>
      </div>
    </div>

    <div class="setting-rbcDegree-main-title-container">
      <p>Category</p>
      <p>Class</p>
      <p>0</p>
      <p>1+</p>
      <p>2+</p>
      <p>3+</p>
    </div>
    <div>
      <div class="mt2 mb4" v-for="(category, index) in rbcClassListArr.value" :key="'rbc' + index">
        <div class="setting-rbcDegree-container">
          <h2 class="setting-rbcDegree-title">{{ category?.categoryNm }}</h2>
          <div class="setting-rbcDegreeClass-container">
            <template v-for="(classItem, classIndex) in category.classInfo" :key="classIndex">
              <div class="setting-rbcDegreeClass-wrapper" v-if="classItem.classNm !== 'Normal'">
                <h3 class="fs10">{{ classItem.classNm }}</h3>
                <div class='degreeInput mt1 mb1 flex-justify-between'>
                  <div class="flex-align-center">
                    <p>&lt;</p>
                    <input class="number-small" type="number" v-model="classItem.degree1"/>
                  </div>
                  <div class="flex-align-center">
                    <p>&lt;</p>
                    <input class="number-small" type="number" v-model="classItem.degree2"/>
                  </div>
                  <div class="flex-align-center">
                    <p>&lt;</p>
                    <input class="number-small" type="number" v-model="classItem.degree3"/>
                  </div>
                  <div class="flex-align-center">
                    <input class="number-small" type="number" v-model="classItem.degree3"/>
                    <p>&lt;</p>
                  </div>

                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-2 degreeDiv">
      <Button @click="createRbcDegreeData" class="saveBtn">Save</Button>
    </div>
  </div>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      type="setting"
      :message="confirmMessage"
      @hide="hideConfirm"
      @okConfirm="handleOkConfirm"
  />

  <Alert
      v-if="showAlert"
      :is-visible="showAlert"
      :type="alertType"
      :message="alertMessage"
      @hide="hideAlert"
      @update:hideAlert="hideAlert"
  />

  <ToastNotification
      v-if="toastInfo.message"
      :message="toastInfo.message"
      :messageType="toastInfo.messageType"
      :duration="1500"
  />
</template>


<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue';
import {rbcClassList, defaultRbcDegree, settingName} from '@/common/defines/constants/settings';
import {createRbcDegreeApi, getRbcDegreeApi, putRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import {scrollToTop} from "@/common/lib/utils/scroll";
import {RbcDegreeRequest} from "@/common/api/service/setting/dto/rbcDegree";
import Button from "@/components/commonUi/Button.vue";
import {useToast} from "@/common/lib/utils/toast";
import ToastNotification from "@/components/commonUi/ToastNotification.vue";

const store = useStore();
const router = useRouter();
const rbcClassListArr = reactive<any>({value: []}); // reactive로 변경
const saveHttpType = ref('post');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmMessage = ref('');
const enteringRouterPath = computed(() => store.state.commonModule.enteringRouterPath);
const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
const settingType = computed(() => store.state.commonModule.settingType);
const { toastInfo, showToast } = useToast();

onMounted(async () => {
  await getRbcDegreeData();
  await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.rbcDegree});
});

watch(() => rbcClassListArr.value, async (rbcClassListArrAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(rbcClassListArrAfterSettingObj)});
  if (settingType.value !== settingName.rbcDegree) {
    await store.dispatch('commonModule/setCommonInfo', {settingType: settingName.rbcDegree});
  }
}, {deep: true});

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.settingNotSaved;
}

const combindDegree = async () => {
  rbcClassListArr.value = rbcClassList.rbcClassList.map((category: any) => {
    return {
      ...category,
      classInfo: category.classInfo.map((classItem: any) => {
        const defaultDegree = defaultRbcDegree.find(
            (defaultItem) =>
                defaultItem.categoryId === category.categoryId &&
                defaultItem.classId === classItem.classId
        );

        return {
          ...classItem,
          degree1: defaultDegree?.degree1 || 0,
          degree2: defaultDegree?.degree2 || 0,
          degree3: defaultDegree?.degree3 || 0,
        };
      }),
    };
  });
}

const onResetDegree = () => {
  combindDegree();
};

const createRbcDegreeData = async () => {
  const rbcDegreeList: RbcDegreeRequest[] = [];

  rbcClassListArr.value.forEach((category: any) => {
    category.classInfo.forEach((classItem: any) => {
      rbcDegreeList.push({
        categoryId: category.categoryId,
        categoryNm: category.categoryNm,
        classId: classItem.classId,
        classNm: classItem.classNm,
        degree1: classItem.degree1,
        degree2: classItem.degree2,
        degree3: classItem.degree3,
      });
    });
  });

  try {
    let result = {};
    if (saveHttpType.value === 'post') {
      result = await createRbcDegreeApi(rbcDegreeList);
    } else {
      result = await putRbcDegreeApi(rbcDegreeList);
    }

    if (result) {
      showToast(MSG.TOAST.SAVE_SUCCESS, MESSAGES.TOAST_MSG_SUCCESS);
      scrollToTop();
      saveHttpType.value = 'put';
    }
  } catch (e) {
    showToast(MSG.TOAST.SAVE_FAIL, MESSAGES.TOAST_MSG_ERROR);
    console.error(e);
  } finally {
    await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
    await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  }
};

const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi();
    saveHttpType.value = 'put';
    const data = result.data;
    processData(data);
  } catch (e) {
    saveHttpType.value = 'post';
    await combindDegree();
  }

  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: JSON.stringify(rbcClassListArr.value)});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: JSON.stringify(rbcClassListArr.value)});
};


const processData = (data: any): void => {
  const categoryMap = new Map();

  data.forEach((item: any) => {
    const categoryId = item.categoryId;
    const classId = item.classId;

    if (!categoryMap.has(categoryId)) {
      const newCategory = {
        categoryId: categoryId,
        categoryNm: item.categoryNm,
        classInfo: [{
          classId: classId,
          classNm: item.classNm,
          degree1: item.degree1,
          degree2: item.degree2,
          degree3: item.degree3,
        }],
      };
      categoryMap.set(categoryId, newCategory);
    } else {
      const existingCategory = categoryMap.get(categoryId);
      const existingClassIndex = existingCategory.classInfo.findIndex((ci: any) => ci.classId === classId);

      if (existingClassIndex === -1) {
        existingCategory.classInfo.push({
          classId: classId,
          classNm: item.classNm,
          degree1: item.degree1,
          degree2: item.degree2,
          degree3: item.degree3,
        });
      } else {
        existingCategory.classInfo[existingClassIndex].degree = item.degree;
      }
    }
  });

  rbcClassListArr.value = Array.from(categoryMap.values());
};

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', {beforeSettingFormattedString: null});
  await store.dispatch('commonModule/setCommonInfo', {afterSettingFormattedString: null});
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  await createRbcDegreeData();
  showConfirm.value = false;
}

</script>
