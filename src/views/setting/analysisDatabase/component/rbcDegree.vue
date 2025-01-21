<template>
  <div class="flex-column-center">
    <div style="width: 480px;" class="mt2 mb4" v-for="(category, index) in rbcClassListArr.value" :key="'rbc' + index">
      <div class="flex-column mt22">
        <h2 class="fs12 mb14">{{ category?.categoryNm }}</h2>
        <div v-for="(classItem, classIndex) in category.classInfo" :key="classIndex">
          <div class="flex-align-center-justify-between mb10">
            <template v-if="classItem.classNm !== 'Normal'">
              <div style="width: 240px;" class="flex-justify-between">
                <h3 class="fs10">{{ classItem.classNm }}</h3>
                <h3>[{{ classItem.degree1 }}, {{ classItem.degree2}}, {{ classItem.degree3 }}]</h3>
              </div>
              <div class='degreeInput mt1 mb1 flex-justify-between'>
                <input class="number-small" type="number" v-model="classItem.degree1"/>
                <input class="number-small" type="number" v-model="classItem.degree2"/>
                <input class="number-small" type="number" v-model="classItem.degree3"/>
              </div>
            </template>
          </div>

        </div>
      </div>
    </div>
    <div class="mt-2 degreeDiv" >
      <button class="saveBtn" @click="onResetDegree">Reset</button>
      <button class="saveBtn" type="button" @click="createRbcDegreeData">Save</button>
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
</template>


<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue';
import {rbcClassList, defaultRbcDegree, settingName} from '@/common/defines/constants/settings';
import {createRbcDegreeApi, getRbcDegreeApi, putRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {MESSAGES} from "@/common/defines/constants/constantMessageText";
import {scrollToTop} from "@/common/lib/utils/scroll";

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

onMounted(async () => {
  await getRbcDegreeData();
  await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.rbcDegree });
});

watch(() => rbcClassListArr.value, async (rbcClassListArrAfterSettingObj) => {
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(rbcClassListArrAfterSettingObj) });
  if (settingType.value !== settingName.rbcDegree) {
    await store.dispatch('commonModule/setCommonInfo', { settingType: settingName.rbcDegree });
  }
}, { deep: true });

watch(() => settingChangedChecker.value, () => {
  checkIsMovingWhenSettingNotSaved();
})

const checkIsMovingWhenSettingNotSaved = () => {
  showConfirm.value = true;
  confirmMessage.value = `${settingType.value} ${MESSAGES.settingNotSaved}`;
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
  const rbcDegreeList: any = [];

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
      showSuccessAlert(MESSAGES.settingSaveSuccess);
      scrollToTop();
      saveHttpType.value = 'put';
    }
  } catch (e) {
    showErrorAlert(MESSAGES.settingSaveFailure);
    console.error(e);
  } finally {
    await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
    await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
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

  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: JSON.stringify(rbcClassListArr.value) });
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: JSON.stringify(rbcClassListArr.value) });
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

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
};

const showErrorAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'error';
  alertMessage.value = message;
};

const hideAlert = () => {
  showAlert.value = false;
};

const hideConfirm = async () => {
  await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
  await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
  showConfirm.value = false;
  await router.push(enteringRouterPath.value);
}

const handleOkConfirm = async () => {
  await createRbcDegreeData();
  showConfirm.value = false;
}

</script>
