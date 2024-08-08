<template>
  <div>
    <div v-if="testType !== '01' && testType !== '04'">
      <h3 class="titleText">
        <span class="greenColor">Whole</span> Slide Image
      </h3>
      <div>
        <div v-for="(rowStart, rowIndex) in [0, 6, 12, 18, 24, 30]" :key="rowIndex" class="pl-2">
          <div class="row">
            <div v-for="(lowPower, colIndex) in lowPowerPath.slice(rowStart, rowStart + 6)" :key="colIndex"
                 class="col-2 p-1">
              <img :src="lowPower.path" :id="lowPower.seqNo" ref="wholeSlideImg" class="wholeSlideImg"
                   @click="onClickBfImg($event, lowPower)" style="width: 75px;"/>
            </div>
          </div>
        </div>

        <div v-if="testType === '03'" class="mt-3 row">
          <div class="col">
            <div style="color: #2798DC">Select Interest Area</div>
          </div>
          <div class="col">
            <div>{{ bfSelectModeList.length }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <h3 class="titleText">
        <span class="greenColor">RBC</span> <span class="greenColor">C</span>lassification
      </h3>
      <template v-for="(classList, outerIndex) in dspRbcClassList" :key="outerIndex">
        <template v-for="(category, innerIndex) in classList" :key="innerIndex">
          <div class="categories">
            <ul class="categoryNm">
              <li v-if="innerIndex === 0" class="mb1 liTitle" style="cursor: default;">Category</li>
              <li style="cursor: default;">{{ getCategoryName(category) }}</li>
            </ul>
            <ul class="classNmRbc">
              <li v-if="innerIndex === 0" class="mb1 liTitle" style="cursor: default;">Class</li>
              <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                <li style="cursor: default;">{{ classInfo?.classNm }}</li>

                <li v-if="classInfo.classNm === 'Basophilic Stippling'" style="cursor: default;">Malaria</li>
              </template>
            </ul>
            <ul class="degree analysis">
              <li v-if="innerIndex === 0" class="mb1 liTitle" style="cursor: default;">Degree</li>
              <template v-for="(classInfo, classIndex) in category?.classInfo" :key="classIndex">
                <li v-if="classInfo.classId !== '01' || category.categoryId === '05'" style="cursor: default;">
                  <font-awesome-icon
                      :icon="['fas', 'circle']"
                      v-for="degreeIndex in 4" :key="degreeIndex"
                      :class="{
                        'degreeActive': degreeIndex < Number(classInfo?.degree) + 2 || 0,
                        'degree0-img': degreeIndex >= Number(classInfo?.degree) + 1 || 0
                      }"
                      style="cursor: default;"
                  />
                </li>
                <li v-else style="cursor: default;">
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

                <li v-if="classInfo.classNm === 'Basophilic Stippling'" style="font-size: 0.7rem; cursor: default;">{{ malariaCount || 0 }} / {{ maxRbcCount || 0 }} RBC</li>
              </template>
            </ul>
          </div>
        </template>
      </template>
    </div>

    <!-- Others -->
    <div>
      <div class="categories">
        <ul class="categoryNm">
          <li style="cursor: default;">Others</li>
        </ul>
        <ul class="classNmRbc">
          <li style="cursor: default;">Platelets</li>
<!--          <li style="cursor: default;">Malaria</li>-->
        </ul>
        <ul class="degree analysis">
          <li style="font-size: 0.7rem; cursor: default;">{{ pltCount || 0 }} PLT / 1000 RBC</li>
<!--          <li style="font-size: 0.7rem; cursor: default;">{{ malariaCount || 0 }} / {{ maxRbcCount || 0 }} RBC</li>-->
        </ul>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {ref, onMounted, defineProps, watch, defineEmits} from "vue";
import {RbcInfo, basicRbcArr} from "@/store/modules/analysis/rbcClassification";
import {getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import EventBus from "@/eventBus/eventBus";
const props = defineProps(['bmIsBoolen','parsedData']);

const dspRbcClassList = ref<RbcInfo[][]>([]);
const malariaCount = ref('');
const maxRbcCount = ref('');
const pltCount = ref('');
const testType = ref<string>("01");
const bfSelectModeList = ref<any>([]);
const rbcDegreeStandard = ref<any>([]);
const emits = defineEmits();


onMounted(async () => {
  await getRbcDegreeData();
  await updateDataArray({rbcInfo: props.parsedData.slotInfo},'');
});

watch(
    () => props.parsedData, // 감시할 데이터
    (newVal, oldVal) => {
      // 데이터 변경 시 실행할 코드
      runningInfoGet(newVal);
    },
    { deep: true }
);

const runningInfoGet = async (data: any) => {
  const parsedData = data
  if(parsedData.jobCmd === 'RUNNING_INFO'){
    const currentSlot = data?.slotInfo;
    if (currentSlot && currentSlot?.stateCd === '03') {
      malariaCount.value = currentSlot.malariaCount;
      maxRbcCount.value = currentSlot.maxRbcCount;
      pltCount.value = currentSlot.pltCount;
    }
    await updateDataArray({rbcInfo: parsedData.slotInfo}, parsedData);
  }
}


const lowPowerPath = ref([]);
const updateDataArray = async (newSlotInfo: any, parsedData: any) => {
  const slotArray = JSON.parse(JSON.stringify(newSlotInfo));

  if (Array.isArray(slotArray.rbcInfo)) {
    testType.value = slotArray.rbcInfo[0].testType;
    if(!slotArray.rbcInfo[0]){
      return
    }
    const wbcInfoArray = [slotArray.rbcInfo[0].rbcInfo];
    const wbcInfoArr = wbcInfoArray[0].length > 0 ? wbcInfoArray : [basicRbcArr];

    //최종으로 슬라이드 정보를 업데이트
    calcRbcDegree(wbcInfoArr[0], parsedData)
    
    if (slotArray.rbcInfo[0].lowPowerPath) {
      lowPowerPath.value = slotArray.rbcInfo[0].lowPowerPath.sort(function (a: any, b: any) {
        return a.seqNo - b.seqNo;
      });
    } else {
      lowPowerPath.value = [];
    }


  } else {
    //최종으로 슬라이드 정보를 업데이트
    calcRbcDegree([basicRbcArr][0], parsedData);
  }


};

const calcRbcDegree = (rbcInfos: any, parsedData: any) => {
  let totalCount = 0;
  let sizeTotal = 0;
  let chromiaTotal = 0;
  const originalData = parsedData.length === 0 || !parsedData ?  (JSON.parse(JSON.stringify(rbcInfos))) : (JSON.parse(JSON.stringify(parsedData?.slotInfo?.rbcInfo)));
  const rbcInfo = parsedData.length === 0 || !parsedData ?  (JSON.parse(JSON.stringify(rbcInfos))) : (JSON.parse(JSON.stringify(parsedData?.slotInfo?.rbcInfo)));
  rbcInfo.forEach((rbcCategory: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any) => {
      // size total
      if (rbcCategory.categoryId === '01') {
        if (rbcClass.classId !== '04') {
          sizeTotal += Number(rbcClass.degree)
        }
      }

      // chromia total
      else if (rbcCategory.categoryId === '02') {
        if (rbcClass.classId !== '04') {
          chromiaTotal += Number(rbcClass.degree)
        }
      } else {
        totalCount += Number(rbcClass.degree)
      }
    });
  });

  rbcInfo.forEach((rbcCategory: any, idx1: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any, idx2: any) => {
      if(!rbcDegreeStandard.value){
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        rbcClass.originalDegree = originalData[idx1].classInfo[idx2].degree;
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.degree);
          let percent = 0;

          if (degreeStandard.categoryId === '01') { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));

          } else if (degreeStandard.categoryId === '02') { // chromia total
            percent = Number(((degreeCount / chromiaTotal) * 100).toFixed(2));
          } else { // shape, inclusion body total
            percent = Number(((degreeCount / totalCount) * 100).toFixed(2));
          }

          if (isNaN(percent)) {
            percent = 0;
          }

          const setDegree = (value: any) => (rbcClass.degree = value);

          // 0
          if (percent < Number(degreeStandard.degree1)) setDegree('0');
          // 1
          else if (percent < Number(degreeStandard.degree2)) setDegree('1');
          // 2
          else if (percent < Number(degreeStandard.degree3)) setDegree('2');
          // 3
          else setDegree('3');

        }
      });
    });
  });


  rbcInfo.forEach((rbcCategory: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any) => {
      // size
      if (rbcCategory.categoryId === '01') {
        if (rbcClass.classId === '01') rbcCategory.classInfo[0].degree = '1';
        if (['02', '03'].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // chromia
      if (rbcCategory.categoryId === '02') {
        if (rbcClass.classId === '01') rbcCategory.classInfo[0].degree = '1';
        if (['02', '03'].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // Poikilocytosis
      if (rbcCategory.categoryId === '03') {
        if (rbcClass.classId === '01') {
          // normal
          rbcCategory.classInfo[0].degree = '1'
          // poikilo
          rbcCategory.classInfo[1].degree = '0'
        }

        if (rbcClass.classId !== '01' && rbcClass.classId !== '02') {
          var poikiloDegree = Number(rbcCategory.classInfo[1].degree)

          if (Number(rbcClass.degree) > poikiloDegree) {
            rbcCategory.classInfo[0].degree = '0'
            rbcCategory.classInfo[1].degree = rbcClass.degree
          }
        }
      }
    });
  });
  dspRbcClassList.value[0] = rbcInfo;
  if (rbcInfo.length === 0) {
    dspRbcClassList.value[0] = basicRbcArr;
  }
  const str: any = parsedData?.iCasStat ?? '';
  const iCasStatArr: any = [...str];
  if(iCasStatArr.lastIndexOf("2") !== -1){
    const data = {
      rbc:{
        rbcInfo: rbcInfo,
        slotId: parsedData.slotInfo.slotId,
      },
      iCasStatArr: iCasStatArr.lastIndexOf("2")
    }
    emits('rbcUpdate',data);
  }
};


const getCategoryName = (category: RbcInfo) => category?.categoryNm;

const onClickBfImg = (event: any, lowPower: any) => {
  if (testType.value === '03') {
    // lowPower가 이미 bfSelectModeList에 있는지 확인
    const existingIndex = bfSelectModeList.value.findIndex((item: any) => item.seqNo === lowPower.seqNo);

    if (existingIndex !== -1) {
      // 만약 lowPower가 이미 bfSelectModeList에 있다면, 제거
      bfSelectModeList.value.splice(existingIndex, 1);
    } else {
      // lowPower가 bfSelectModeList에 없다면, 추가
      bfSelectModeList.value.push(lowPower);
    }
  }
}

const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi();
    const data = result.data;
    rbcDegreeStandard.value = data;
  } catch (e) {
    console.log(e);
  }
};

</script>
<style>
td, th {
  border: 1px solid #353942;
}
</style>