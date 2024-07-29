<template>
  <div>
    <div id="collapse-4">
      <!--      {{ rbcClassListArr }}-->
      <div class="mt2 rbcClassListArr" v-for="(category, index) in rbcClassListArr.value" :key="'rbc' + index">
        <div class="rbcDegreeCategoryNm">
          {{ category?.categoryNm }}
        </div>

        <div v-for="(classItem, classIndex) in category.classInfo" :key="classIndex">
          <div>
            {{ classItem.classNm }}
          </div>
          <div class="mb1">
            [ {{ `${classItem.degree1} , ${classItem.degree2} , ${classItem.degree3}` }} ]
          </div>
          <div>
            <div class='degreeInput mb1'>
              <input type="number" v-model="classItem.degree1"/>
              <input type="number" v-model="classItem.degree2"/>
              <input type="number" v-model="classItem.degree3"/>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div class="mt-2 degreeDiv" >
      <button class="saveBtn mb2" @click="onResetDegree">Reset</button>
      <button class="saveBtn mb2" type="button" @click="createRbcDegreeData">Save</button>
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
</template>


<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {rbcClassList, defaultRbcDegree} from '@/common/defines/constFile/settings';
import {Category, ClassItem} from '@/common/api/service/setting/dto/rbcDegree';
import {createRbcDegreeApi, getRbcDegreeApi, putRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import Alert from "@/components/commonUi/Alert.vue";

const rbcClassListArr = reactive<any>({value: []}); // reactive로 변경
const saveHttpType = ref('post');
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

onMounted(async () => {
  await getRbcDegreeData();
});

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
      // showSuccessAlert('Save successful');
      showSuccessAlert('Save successful');
      saveHttpType.value = 'put';
    }
  } catch (e) {
    showErrorAlert(e);
    console.error(e);
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
</script>
