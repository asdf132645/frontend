<template>
  <div>
    <div id="collapse-4">
      <!--      {{ rbcClassListArr }}-->
      <div class="mt2 rbcClassListArr" v-for="(category, index) in rbcClassListArr.value" :key="'rbc' + index">
        <div>
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
    <div class="mt-2">
      <button @click="onResetDegree">Reset</button>
      <button type="button" @click="createRbcDegreeData">Save</button>
    </div>
  </div>
</template>


<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {rbcClassList, defaultRbcDegree} from '@/common/defines/constFile/settings';
import {Category, ClassItem} from '@/common/api/service/setting/dto/rbcDegree';
import {createRbcDegreeApi, getRbcDegreeApi, putRbcDegreeApi} from "@/common/api/service/setting/settingApi";

const rbcClassListArr = reactive<any>({value: []}); // reactive로 변경

const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const saveHttpType = ref('post');


onMounted(async () => {
  userId.value = getStoredUser.id;
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
        category_id: category.categoryId,
        category_nm: category.categoryNm,
        class_id: classItem.classId,
        class_nm: classItem.classNm,
        degree1: classItem.degree1,
        degree2: classItem.degree2,
        degree3: classItem.degree3,
      });
    });
  });

  try {
    let result = {};
    if (saveHttpType.value === 'post') {
      result = await createRbcDegreeApi({categories: rbcDegreeList, userId: Number(userId.value),});
    } else {
      result = await putRbcDegreeApi(rbcDegreeList, userId.value);
    }

    if (result) {
      // showSuccessAlert('Save successful');
      alert('Save successful');
      saveHttpType.value = 'put';
    }
  } catch (e) {
    console.error(e);
  }
};

const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi(String(userId.value));
    saveHttpType.value = 'put';
    const data = result.data;
    processData(data?.categories);
    console.log(result);
  } catch (e) {
    console.log(e);
    saveHttpType.value = 'post';
    await combindDegree();
  }
};


const processData = (data: any): void => {
  console.log(data)
  const categoryMap = new Map();

  data.forEach((item: any) => {
    const categoryId = item.category_id;
    const classId = item.class_id;

    if (!categoryMap.has(categoryId)) {
      const newCategory = {
        categoryId: categoryId,
        categoryNm: item.category_nm,
        classInfo: [{
          classId: classId,
          classNm: item.class_nm,
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
          classNm: item.class_nm,
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


</script>
