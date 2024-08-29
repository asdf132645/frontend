<template>
  <div>
    <div>
<!--      <div class="mt2 mb4" v-for="(category, index) in rbcClassListArr.value" :key="'rbc' + index">-->
<!--        <div style="display: flex; flex-direction: column">-->
<!--          <h2 class="fs12">{{ category?.categoryNm }}</h2>-->

<!--          <div v-for="(classItem, classIndex) in category.classInfo" :key="classIndex">-->

<!--            <div style="display: flex; align-items: center; justify-content: space-between;">-->
<!--              <template v-if="classItem.classNm !== 'Normal'">-->
<!--                <h3 class="fs10">{{ classItem.classNm }} [ {{ `${classItem.degree1} , ${classItem.degree2} , ${classItem.degree3}` }} ]</h3>-->
<!--                <div class="mt1">-->
<!--                  <div class='degreeInput mb1' style="display: flex;">-->
<!--                    <input type="number" v-model="classItem.degree1"/>-->
<!--                    <input type="number" v-model="classItem.degree2"/>-->
<!--                    <input type="number" v-model="classItem.degree3"/>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </template>-->
<!--            </div>-->

<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
      <div class="mt2 mb4 rbcClassListArr" v-for="(category, index) in rbcClassListArr.value" :key="'rbc' + index">
        <div class="mb1 fs12">
          {{ category?.categoryNm }}
        </div>

        <div v-for="(classItem, classIndex) in category.classInfo" :key="classIndex">
          <template v-if="classItem.classNm !== 'Normal'">
            <span>
              {{ classItem.classNm }}
            </span>
            <div class="mb1">
              [ {{ `${classItem.degree1} , ${classItem.degree2} , ${classItem.degree3}` }} ]
            </div>
            <div class="mt1">
              <div class='degreeInput mb1'>
                <input type="number" v-model="classItem.degree1"/>
                <input type="number" v-model="classItem.degree2"/>
                <input type="number" v-model="classItem.degree3"/>
              </div>
            </div>
          </template>
        </div>

      </div>
    </div>
    <div class="mt-2 degreeDiv" >
      <button class="saveBtn mb2" @click="onResetDegree">Reset</button>
      <button class="saveBtn mb2" type="button" @click="createRbcDegreeData">Save</button>
    </div>
  </div>

  <Confirm
      v-if="showConfirm"
      :is-visible="showConfirm"
      :message="confirmMessage"
      :confirmText="messages.SAVE"
      :closeText="messages.LEAVE"
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
import {computed, onMounted, reactive, ref, watch, watchEffect} from 'vue';
import {rbcClassList, defaultRbcDegree, settingName} from '@/common/defines/constFile/settings';
import {createRbcDegreeApi, getRbcDegreeApi, putRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {messages} from "@/common/defines/constFile/constantMessageText";

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
  confirmMessage.value = `${settingType.value} ${messages.settingNotSaved}`;
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
      showSuccessAlert(messages.settingSaveSuccess);
      saveHttpType.value = 'put';
    }
  } catch (e) {
    showErrorAlert(messages.settingSaveFailure);
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
