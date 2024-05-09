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
              <li v-if="innerIndex === 0" class="mb1 liTitle">Category</li>
              <li>{{ getCategoryName(category) }}</li>
            </ul>
            <ul class="classNmRbc">
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
    <!--orders-->
    <div>
      <div class="categories">
        <ul class="categoryNm">
          <li>Others</li>
        </ul>
        <ul class="classNmRbc">
          <li>Platelets</li>
          <li>Malaria</li>
        </ul>
        <ul class="degree">
          <li style="font-size: 0.7rem">{{ pltCount || 0 }} PLT / 1000 RBC</li>
          <li style="font-size: 0.7rem">{{ malariaCount || 0 }} / {{ maxRbcCount || 0 }} RBC</li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {ref, onMounted, watch, computed, getCurrentInstance} from "vue";
import {useStore} from "vuex";
import {RbcInfo, basicRbcArr} from "@/store/modules/analysis/rbcClassification";
import {SlotInfo} from "@/store/modules/testPageCommon/ruuningInfo";
import {getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import {stringToDateTime} from "@/common/lib/utils/conversionDataUtils";

const store = useStore();
const runningInfoModule = computed(() => store.state.runningInfoModule);
const dspRbcClassList = ref<RbcInfo[][]>([]);
const malariaCount = ref('');
const maxRbcCount = ref('');
const pltCount = ref('');
const testType = ref<string>("01");
const bfSelectModeList = ref<any>([]);
const wholeSlideImgRef = ref(null);
const storedUser = sessionStorage.getItem('user');
const getStoredUser = JSON.parse(storedUser || '{}');
const userId = ref('');
const rbcDegreeStandard = ref<any>([]);
const commonDataGet = computed(() => store.state.commonModule);
const instance = getCurrentInstance();
const rbcArr = computed(() => store.state.commonModule.rbcArr);


watch([runningInfoModule.value], (newVal: any) => {
  if (newVal.length > 0) {
    const firstItem = newVal[0].runningInfo;
    if (firstItem) {
      if (firstItem.jobCmd === 'RUNNING_INFO') {
        const currentSlot = firstItem?.slotInfo;

        if (currentSlot && currentSlot?.stateCd === '03') {
          malariaCount.value = currentSlot.malariaCount;
          maxRbcCount.value = currentSlot.maxRbcCount;
          pltCount.value = currentSlot.pltCount;
        }
      }
    }
  }
});


onMounted(async () => {
  userId.value = getStoredUser.id;
  const initialRbcClassList = store.state.rbcClassificationModule;
  await getRbcDegreeData();
  await updateDataArray(initialRbcClassList,'');
});

instance?.appContext.config.globalProperties.$socket.on('chat', async (data) => {
  try {
    const textDecoder = new TextDecoder('utf-8');
    const stringData = textDecoder.decode(data);

    const parsedData = JSON.parse(stringData);
    if(parsedData.jobCmd === 'RUNNING_INFO'){
      await updateDataArray({rbcInfo: parsedData.slotInfo}, parsedData);
    }
  } catch (e) {
    // console.log(e)
  }
})

const lowPowerPath = ref([]);
const updateDataArray = async (newSlotInfo: any[], parsedData: any) => {
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
  const rbcInfo = (JSON.parse(JSON.stringify(rbcInfos)));

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

  rbcInfo.forEach((rbcCategory: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any) => {
      if(!rbcDegreeStandard.value){
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        if (
            degreeStandard.category_id === rbcCategory.categoryId &&
            degreeStandard.class_id === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.degree);
          let percent = 0;

          if (degreeStandard.category_id === '01') { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));

          } else if (degreeStandard.category_id === '02') { // chromia total
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
  // console.log(rbcInfo)
  dspRbcClassList.value[0] = rbcInfo;
  const str: any = parsedData?.iCasStat ?? '';
  const iCasStatArr: any = [...str];
  if(iCasStatArr.lastIndexOf("2") !== -1){
    rbcArr.value[iCasStatArr.lastIndexOf("2")] = {
      rbcInfo: rbcInfo,
      slotId: parsedData.slotInfo.slotId,
    };
  }
  // store.dispatch('dataBaseSetDataModule/setDataBaseSetData', {
  //   slotInfo: [
  //     {
  //       rbcInfo: rbcInfo,
  //     },
  //   ]
  // });
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
    const result = await getRbcDegreeApi(String(userId.value));
    const data = result.data;
    rbcDegreeStandard.value = data?.categories
  } catch (e) {
    // console.log(e);
  }
};

</script>
<style>
td, th {
  border: 1px solid #353942;
}
</style>