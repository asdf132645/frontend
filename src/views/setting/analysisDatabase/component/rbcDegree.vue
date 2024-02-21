<template>
  <div>
    <div id="collapse-4">
      <div class="mt-2" v-for="(category, index) in rbcClassListArr.value" :key="'rbc' + index">
        <div>
          {{ category?.categoryNm }}
        </div>
        <div>
          <div v-for="(classItem, classIndex) in category.classInfo" :key="classIndex">
            <div>
              {{ classItem.classNm }}
            </div>
            <div>
              <input type="range" v-model="classItem.degree" :max="30" :step="0.5"
                     @input="onChangeSlider(category.categoryId, classItem)">
              <label>{{ classItem.degree }}</label>
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
import {rbcClassList} from '@/common/defines/constFile/settings';
import {CategoryDto, Category, ClassItem} from '@/common/api/service/setting/dto/rbcDegree';
import {createRbcDegree, getRbcDegree, putRbcDegree} from "@/common/api/service/setting/settingApi";

const rbcClassListArr = reactive<any>({value: []}); // reactive로 변경
const userId = ref('');
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const saveHttpType = ref('post');


onMounted(() => {
  // rbcClassListArr.value = rbcClassList;
  userId.value = getStoredUser.id;
  getRbcDegreeData();
});

const onChangeSlider = (categoryId: string, classItem: ClassItem) => {
  const categoryIndex = rbcClassListArr.value.findIndex((c: Category) => c.category_id === categoryId);

  if (categoryIndex !== -1) {
    const classIndex = rbcClassListArr.value[categoryIndex].classInfo.findIndex((ci: ClassItem) => ci.class_id === classItem.class_id);

    if (classIndex !== -1) {
      rbcClassListArr.value[categoryIndex].classInfo[classIndex].degree = classItem.degree;
    }
  }
};





const onResetDegree = () => {
  // Your reset logic here
  rbcClassListArr.value = rbcClassList.rbcClassList;
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
        degree: classItem.degree,
      });
    });
  });

  try {
    let result = {};
    if (saveHttpType.value === 'post') {
      result = await createRbcDegree({categories: rbcDegreeList, userId: Number(userId.value),});
    } else {
      result = await putRbcDegree(rbcDegreeList, userId.value);
    }

    if (result) {
      // showSuccessAlert('Save successful');
      alert('Save successful');
    }
  } catch (e) {
    console.error(e);
  }
};

const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegree(String(userId.value));
    if (result?.data?.categories.length === 0) {
      console.log(null);
      saveHttpType.value = 'post';
      rbcClassListArr.value = rbcClassList.rbcClassList;
      console.log(rbcClassListArr.value)
    } else {
      saveHttpType.value = 'put';
      const data = result.data;
      processData(data.categories);
    }
    console.log(result);
  } catch (e) {
    console.log(e);
  }
};


const processData = (data: any): void => {
  const categoryMap = new Map();

  // 들어오는 데이터를 반복하면서 categoryMap을 업데이트합니다.
  data.forEach((item: any) => {
    const categoryId = item.category_id;
    const classId = item.class_id;

    if (!categoryMap.has(categoryId)) {
      // 새로운 카테고리 추가
      const newCategory = {
        categoryId: categoryId,
        categoryNm: item.category_nm,
        classInfo: [{
          classId: classId,
          classNm: item.class_nm,
          degree: item.degree,
        }],
      };
      categoryMap.set(categoryId, newCategory);
    } else {
      // 기존 카테고리 업데이트
      const existingCategory = categoryMap.get(categoryId);
      const existingClassIndex = existingCategory.classInfo.findIndex((ci: any) => ci.classId === classId);

      if (existingClassIndex === -1) {
        // 기존 카테고리에 새로운 클래스 추가
        existingCategory.classInfo.push({
          classId: classId,
          classNm: item.class_nm,
          degree: item.degree,
        });
      } else {
        // 클래스가 이미 존재하는 경우 업데이트합니다.
        existingCategory.classInfo[existingClassIndex].degree = item.degree;
      }
    }
  });

  // 업데이트된 데이터로 rbcClassListArr를 업데이트합니다.
  rbcClassListArr.value = Array.from(categoryMap.values());
};


</script>
