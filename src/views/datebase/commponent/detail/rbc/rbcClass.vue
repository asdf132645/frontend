<template>
  <div class="classInfo-barcode-container" v-if="type !== 'report'">
    <img v-if="!barCodeImageShowError && siteCd !== HOSPITAL_SITE_CD_BY_NAME['고대구로병원']" @error="onImageError" :src="barcodeImg"/>
    <p v-else>Barcode Image is missing</p>
  </div>
  <div v-show="jsonIsBool" class="createdRbc"> Creating a new RBC classification ...</div>
  <div>
    <div class="mt10 flex-justify-between">
      <h3 class="wbcClassInfoLeft">RBC Classification</h3>
      <ul class="leftWbcInfo rbcClass">
        <li class="pos-relative" @click="commitConfirmed" :class="{'submitted': slideData.submitState === 'Submit'}">
          <font-awesome-icon
              :icon="['fas', 'square-check']"
              @mouseover="tooltipVisibleFunc('confirm', true)"
              @mouseout="tooltipVisibleFunc('confirm', false)"
          />
          <Tooltip :isVisible="tooltipVisible.confirm" className="mb08" position="top" :message="MSG.TOOLTIP.CONFIRM"/>
        </li>
      </ul>
    </div>
    <template v-for="(classList, outerIndex) in [rbcInfoBeforeVal]" :key="outerIndex">
      <template v-for="(category, innerIndex) in classList" :key="innerIndex">
        <div class="categories rbcClass">
          <ul class="categoryNm">
            <li v-if="innerIndex === 0" class="mt18 mb14 liTitle">Category</li>
            <li @click="toggleAll(allCheckType[category?.categoryId], category?.categoryId)"
                class="flex-column cursorPointer" style="padding-top: 6px">
              <span>{{ getCategoryName(category) }}</span>
              <span style="margin-left: 12px; margin-top: 2px;">
                <font-awesome-icon class="rbc-allCheck-eye-font rbc-check-eye-font" :icon="['fas', 'eye']"
                                   color="#29C7CA"
                                   v-show="type !== 'report' && !allCheckType[category?.categoryId] && category?.categoryId !== '05'"/>
                <font-awesome-icon class="rbc-allCheck-eye-font rbc-check-eye-font" :icon="['fas', 'eye-slash']"
                                   v-show="type !== 'report' && allCheckType[category?.categoryId] && category?.categoryId !== '05'"/>
              </span>
            </li>
          </ul>
          <ul class="classNmRbc">
            <li
                v-if="innerIndex === 0"
                class="mt18 mb14 liTitle flex-justify-start-align-center w-fit"
                style="top: -4px;"
            >
              <p style="padding-top: 2px;">Class</p>

            </li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${category?.categoryId}-${classInfo?.classId}`">
              <li @click="handleClick(category?.categoryId, classInfo?.classId, classInfo?.classNm, category?.categoryNm)"
                  class="flex-align-center cursorPointer">
                <span>{{ classInfo?.classNm === 'TearDropCell' ? 'TearDrop Cell' : classInfo?.classNm }}</span>
                <div
                    v-if="showCheckbox(category?.categoryId, classInfo?.classId, VISIBLE_RBC_OPTIONS) && type !== 'report'">
                  <font-awesome-icon :icon="['fas', 'eye']" class="rbc-check-eye-font" color="#29C7CA"
                                     v-show="!except && checkedClassIndices.includes(`${category?.categoryId}-${classInfo?.classId}`)"/>
                  <font-awesome-icon :icon="['fas', 'eye-slash']" class="rbc-check-eye-font"
                                     v-show="!except && !checkedClassIndices.includes(`${category?.categoryId}-${classInfo?.classId}`)"/>
                </div>
              </li>
              <li v-if="classIndex === category?.classInfo.length - 1 && category?.categoryId === '03'">
                <span>Others</span>
              </li>
              <li v-if="classIndex === category?.classInfo.length - 1 && category?.categoryId === '05'"
                  @click="handleClick('05', '03', classInfo?.classNm, category?.categoryNm)"
                  class="flex-align-center"
              >
                <span>Malaria</span>
                <div v-if="type !== 'report'">
                  <font-awesome-icon :icon="['fas', 'eye']" class="rbc-check-eye-font" color="#29C7CA"
                                     v-show="!except && checkedClassIndices.includes('05-03')"
                                     @change="updateClassInfoArr('Malaria', $event.target.checked, '05', '03')"/>
                  <font-awesome-icon :icon="['fas', 'eye-slash']" class="rbc-check-eye-font"
                                     v-show="!except && !checkedClassIndices.includes('05-03')"
                                     @change="updateClassInfoArr('Malaria', $event.target.checked, '05', '03')"/>
                </div>
              </li>
            </template>
          </ul>
          <ul class="degree analysis">
            <li v-if="innerIndex === 0" class="mt18 mb14 liTitle">
              <p>Degree</p>
              <p class="rbcDegree-span-wrapper">
                <span>0</span>
                <span>1+</span>
                <span>2+</span>
                <span>3+</span>
              </p>
            </li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${category.categoryId}-${classInfo.classId}`">
              <li v-if="(classInfo?.classId !== '01' || category?.categoryId === '05') || (rbcInfoAfterVal[innerIndex]?.classInfo[classIndex].classId !== '01' || rbcInfoAfterVal[innerIndex]?.categoryId === '05')">
                <span v-if="classInfo?.classId !== '01' || category?.categoryId === '05'" class="rbcSapn">
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-up']"
                      v-for="degreeIndex in 4" :key="degreeIndex"
                      class="cursorPointer"
                      :class="{
                        'degreeActive': degreeIndex < Number(classInfo?.degree) + 2 || 0,
                        'degree0-img': degreeIndex >= Number(classInfo?.degree) + 1 || 0
                      }"
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex]?.classInfo[classIndex], degreeIndex - 1, false)"
                  />
                </span>
                <span
                    v-if="rbcInfoAfterVal[innerIndex]?.classInfo[classIndex]?.classId !== '01' || rbcInfoAfterVal[innerIndex]?.categoryId === '05'"
                    class="rbcSapnDown"
                >
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-down']"
                      v-for="degreeIndex in 4" :key="degreeIndex + '-down'"
                      class="cursorPointer"
                      :class="{
                      'degreeActive': degreeIndex < Number(rbcInfoAfterVal[innerIndex]?.classInfo[classIndex]?.degree) + 2 || 0,
                      'degree0-img': degreeIndex >= Number(rbcInfoAfterVal[innerIndex]?.classInfo[classIndex]?.degree) + 1 || 0
                    }"
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex]?.classInfo[classIndex], degreeIndex - 1, false)"
                  />
                </span>

              </li>
              <li v-else>
                <span v-if="classInfo.degree === '0'" class="rbcSapn">
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-up']"
                      class="cursorPointer"
                  />
                </span>
                <span v-else class="rbcSapn">
                  <font-awesome-icon
                      :icon="['fac', 'half-circle-up']"
                      class="degreeActive cursorPointer"
                  />
                </span>
                <span v-if="rbcInfoAfterVal[innerIndex]?.classInfo[classIndex]?.degree === '0'" class="rbcSapnDown"
                >
                  <font-awesome-icon
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex]?.classInfo[classIndex],'0', true)"
                      :icon="['fac', 'half-circle-down']"
                  />
                </span>
                <span v-else class="rbcSapnDown">
                  <font-awesome-icon
                      @click="onClickDegree(rbcInfoAfterVal[innerIndex], rbcInfoAfterVal[innerIndex]?.classInfo[classIndex], '1', true) "
                      :icon="['fac', 'half-circle-down']"
                      class="degreeActive"
                  />
                </span>
              </li>
              <li v-if="classIndex === category?.classInfo.length - 1 && rbcInfoAfterVal[innerIndex]?.categoryId === '03'">
                -
              </li>
              <li v-if="classIndex === category?.classInfo.length - 1 && rbcInfoAfterVal[innerIndex]?.categoryId === '05'">
                -
              </li>
              <div v-if="classIndex === category?.classInfo.length - 1">
                <div v-for="categoryId in ['01', '02', '05']" :key="categoryId" class="underline"
                     v-show="rbcInfoAfterVal[innerIndex].categoryId === categoryId">
                  Total
                </div>
              </div>
            </template>

          </ul>
          <ul class="rbcPercent">
            <li v-if="innerIndex === 0" class="mt18 mb14 liTitle">Count</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li v-if="classInfo?.classNm !== 'Poikilocyte'">{{ Number(classInfo?.originalDegree) || 0 }}</li>
              <li v-else>-</li>
              <li class="defaultText"
                  v-if="classIndex === category?.classInfo.length - 1 && category?.categoryId === '03'">
                {{ Number(shapeOthersCount) || 0 }}
              </li>
              <li class="defaultText"
                  v-if="classIndex === category?.classInfo.length - 1 && category?.categoryId === '05'">
                {{ Number(malariaCount) || 0 }}
              </li>
              <div v-if="classIndex === category?.classInfo.length - 1">
                <div v-for="categoryId in ['01', '02']" :key="categoryId" class="underline"
                     v-show="rbcInfoAfterVal[innerIndex].categoryId === categoryId">
                  {{ Number(sizeChromiaTotal) || 0 }}
                </div>
              </div>
              <div class="underline"
                   v-if="classIndex === category?.classInfo.length - 1 && rbcInfoAfterVal[innerIndex]?.categoryId === '05'">
                {{ Number(shapeBodyTotal) || 0 }}
              </div>
            </template>
          </ul>
          <ul class="rbcPercent mr1">
            <li v-if="innerIndex === 0" class="mt18 mb14 liTitle">Percent</li>
            <template v-for="(classInfo, classIndex) in category?.classInfo"
                      :key="`${outerIndex}-${innerIndex}-${classIndex}`">
              <li v-if="classInfo?.classNm !== 'Poikilocyte'">
                {{ Number(classInfo?.percent) || 0 }}
              </li>
              <li v-else>-</li>
              <li class="defaultText"
                  v-if="classIndex === category?.classInfo.length - 1 && rbcInfoAfterVal[innerIndex]?.categoryId === '03'">
                {{ percentageChange(shapeOthersCount, RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID) || 0 }}
              </li>
              <li class="defaultText"
                  v-if="classIndex === category?.classInfo.length - 1 && rbcInfoAfterVal[innerIndex]?.categoryId === '05'">
                {{ percentageChange(malariaCount, RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) || 0 }}
              </li>
              <div v-if="classIndex === category?.classInfo.length - 1">
                <div v-for="categoryId in ['01', '02', '05']" :key="categoryId" class="underline"
                     v-show="rbcInfoAfterVal[innerIndex]?.categoryId === categoryId"
                >
                  100%
                </div>
              </div>
            </template>
          </ul>

        </div>
      </template>

    </template>
    <!--orders-->
    <div>
      <div class="categories rbcClass">
        <ul class="categoryNm">
          <li>Others</li>
        </ul>
        <ul class="classNmRbc">
          <li @click="handleClick('04', '01', 'Platelet', 'Others')" style="padding-top: 0;" class="flex-align-center">
            <span>Platelet</span>
            <div v-if="type !== 'report'">
              <font-awesome-icon :icon="['fas', 'eye']" class="rbc-check-eye-font" color="#29C7CA"
                                 v-show="!except && checkedClassIndices.includes('04-01')"
                                 @change="updateClassInfoArr('Platelet', $event.target.checked, '04', '01')"/>
              <font-awesome-icon :icon="['fas', 'eye-slash']" class="rbc-check-eye-font"
                                 v-show="!except && !checkedClassIndices.includes('04-01')"
                                 @change="updateClassInfoArr('Platelet', $event.target.checked, '04', '01')"/>
            </div>
          </li>
        </ul>
        <ul class="degree analysis">
          <li style="width: 130px;">{{ pltCount || 0 }} PLT / 1000 RBC</li>
        </ul>
        <ul class="rbcPercent"></ul>
        <ul class="rbcPercent"></ul>
      </div>
    </div>
    <!--  RBC 감도 조절 기능  -->
    <!--        <div class="sensitivityDiv" v-if="type !== 'report'">-->
    <!--          <select v-model="selectedClass" @change="classChange">-->
    <!--            <option v-for="(item) in rightClickItem" :key="item.classNm">-->
    <!--              {{ item.classNm }}-->
    <!--            </option>-->
    <!--          </select>-->
    <!--          <SliderBar v-model="sliderValue" :min="0" :max="100" leftText="less" rightText="more"/>-->
    <!--          <button class="degreeBtn" type="button" @click="sensRbcReJsonSend">Ok</button>-->
    <!--        </div>-->

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
import {ref, defineProps, watch, onMounted, computed, defineEmits, nextTick, onBeforeMount} from 'vue';
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {RbcInfo} from "@/store/modules/analysis/rbcClassification";
import Alert from "@/components/commonUi/Alert.vue";
import Confirm from "@/components/commonUi/Confirm.vue";
import {MESSAGES, MSG} from "@/common/defines/constants/constantMessageText";
import moment from "moment/moment";
import {tcpReq} from "@/common/defines/constants/tcpRequest/tcpReq";
import {readJsonFile} from "@/common/api/service/fileReader/fileReaderApi";
import {getRbcDegreeApi} from "@/common/api/service/setting/settingApi";
import EventBus from "@/eventBus/eventBus";
import {RBC_CODE_CLASS_ID, SHOWING_RBC_SHAPE_CLASS_IDS} from "@/common/defines/constants/dataBase";
import {
  VISIBLE_CHROMIA_OPTIONS, VISIBLE_INCLUSION_BODY_OPTIONS, VISIBLE_OTHERS_OPTIONS,
  VISIBLE_RBC_OPTIONS,
  VISIBLE_SHAPE_OPTIONS,
  VISIBLE_SIZE_OPTIONS, VisibleRbcType
} from "@/common/defines/constants/rbc";
import Tooltip from "@/components/commonUi/Tooltip.vue";
import {TooltipRbcClassType} from "@/common/type/tooltipType";
import { DIR_NAME } from "@/common/defines/constants/settings";
import { cbcUpdateMutation, gqlGenericUpdate, memoUpdateMutation, rbcUpdateMutation } from "@/gql/mutation/slideData";
import {scrollToTop} from "@/common/lib/utils/scroll";
import {HOSPITAL_SITE_CD_BY_NAME} from "@/common/defines/constants/siteCd";
import {getBarcodeDetailImageUrl} from "@/common/lib/utils/conversionDataUtils";


const getCategoryName = (category: RbcInfo) => category?.categoryNm;
const checkedClassIndices = ref<string[]>([]);
const props = defineProps(['rbcInfo', 'type', 'allCheckClear', 'notCanvasClickVal']);
const rbcInfoAfterVal = ref<any>([]);
const rbcInfoBeforeVal = ref<any>([]);
const pltCount = ref(0);
const malariaCount = ref(0);
const sliderValue = ref(50);
const store = useStore();
const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');
const showConfirm = ref(false);
const confirmType = ref('');
const confirmMessage = ref('');
const userModuleDataGet = computed(() => store.state.userModule);
const siteCd = computed(() => store.state.commonModule.siteCd);
const isBefore = ref(false);
const classInfoArr = ref<any>([]);
const emits = defineEmits();
const maxRbcCount: any = ref('');
const router = useRouter();
const except = ref(false);
const rightClickItem: any = ref([]);
const selectedClass = ref('Macrocyte');
const allCheckType = ref<Record<string, boolean>>({
  '01': true,
  '02': true,
  '03': true,
  '05': true,
  '04': true,
})
const rbcInfoPathAfter = ref<any>([]);
const jsonIsBool = ref(false);
const rbcTotalVal = ref(0);
const iaRootPath = computed(() => store.state.commonModule.iaRootPath);
const rbcReData = computed(() => store.state.commonModule.rbcReData);
const resetRbcArr = computed(() => store.state.commonModule.resetRbcArr);
const rbcImagePageNumber = computed(() => store.state.commonModule.rbcImagePageNumber);
const slideData = computed(() => store.state.slideDataModule);

const rbcDegreeStandard = ref<any>([]);
const sizeChromiaTotal = ref(0);
const chromiaTotalTwo = ref(0);
const shapeBodyTotal = ref(0);
const rbcReDataCheck = computed(() => store.state.commonModule.rbcReDataCheck);
const rbcSendtimerId = ref<number | null>(null);
let timeoutId: any;
const projectType = ref(window.PROJECT_TYPE);
const shapeOthersCount = ref(0);
const tooltipVisible = ref({
  confirm: false,
})
const barCodeImageShowError = ref(false);
const barcodeImg = ref('');

onBeforeMount(() => {
  barCodeImageShowError.value = false;
})

onMounted(async () => {
  await nextTick();
  await store.dispatch('commonModule/setCommonInfo', { rbcImagePageNumber: 0 });
  const {path} = router.currentRoute.value;
  pltCount.value = slideData.value?.rbcInfo.pltCount;
  malariaCount.value = slideData.value?.rbcInfo.malariaCount;
  maxRbcCount.value = slideData.value?.rbcInfo.maxRbcCount;
  except.value = path === '/report';
  rightClickItem.value = [];
  rightClickItemSet();
  await rbcTotalAndReCount(rbcImagePageNumber.value);
  await afterChange(slideData.value);
  await countReAdd();
  setBarCodeImage(slideData.value);
});

watch(() => props.allCheckClear, (newItem) => {
  checkedClassIndices.value = [];
  classInfoArr.value = [];
}, {deep: true})

watch(() => rbcImagePageNumber.value, async (newRbcPageNumber) => {
  await rbcTotalAndReCount(newRbcPageNumber);
  await countReAdd();
})

const rightClickItemSet = () => {
  rightClickItem.value = [];
  if (!slideData.value?.rbcInfo) {
    return;
  }
  const processItems = slideData.value?.rbcInfo.rbcClass || slideData.value?.rbcInfo;

  if (processItems) {
    for (const argument of processItems) {
      argument.classInfo.forEach((classInfo: any) => {
        if (classInfo.classNm !== 'Normal') {
          rightClickItem.value.push({...classInfo, categoryId: argument.categoryId});
        }
      });
    }
  }

  rightClickItem.value.push(
      {categoryId: '04', classId: '01', classNm: 'Platelet'},
      {categoryId: '05', classId: '03', classNm: 'Malaria'}
  );
}

watch(
    () => slideData.value.id,
    async (newVal, oldVal) => {
      await nextTick();
      await rbcTotalAndReCount(rbcImagePageNumber.value);
      await getRbcDegreeData();
      await reDegree(rbcInfoBeforeVal.value);
      pltCount.value = slideData.value?.pltCount;
      malariaCount.value = slideData.value?.malariaCount;
      rightClickItemSet();
      allCheckType.value = {
        '01': true,
        '02': true,
        '03': true,
        '04': true,
        '05': true,
      }
      await afterChange(slideData.value);
      await countReAdd();
      setBarCodeImage(slideData.value);
    },
    { deep: true}
);


watch(() => resetRbcArr, async (newItem) => {
  if (newItem) {
    await store.dispatch('commonModule/setCommonInfo', {resetRbcArr: false});
    await rbcTotalAndReCount(rbcImagePageNumber.value);
    await countReAdd();
  }
}, {deep: true})

watch(() => props.allCheckClear, () => {
  checkedClassIndices.value = [];
  classInfoArr.value = [];
  allCheckType.value = {
    '01': true,
    '02': true,
    '03': true,
    '04': true,
    '05': true,
  }
}, {deep: true})

watch(() => rbcReData, async (newItem) => {
  if (newItem) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      jsonIsBool.value = false;
      // await afterChange();
      await rbcTotalAndReCount(rbcImagePageNumber.value);
      await countReAdd();
      await getRbcDegreeData();
    }, 1000);
  }

}, {deep: true});

const showCheckbox = (categoryId: string, classId: string, availableClassIds: {
  categoryId: string;
  classId: string
}[]) => availableClassIds.find((item) => item.categoryId === categoryId && item.classId === classId);

const handleClick = (categoryId: string, classId: string, classNm: string, categoryNm: string) => {
  if (props.notCanvasClickVal) return;
  if (!showCheckbox(categoryId, classId, VISIBLE_RBC_OPTIONS)) return;

  toggleCheckbox(categoryId, classId, classNm);
  clickChangeSens(classNm, categoryNm, categoryId, classId);
}

const toggleCheckbox = (categoryId: string, classId: string, classNm: string) => {
  const checkValue = `${categoryId}-${classId}`;
  const isChecked = checkedClassIndices.value.includes(checkValue);

  // `RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID`를 유지하기 위한 필터링 로직 추가
  const othersCategoryItems = checkedClassIndices.value.filter((item) => item.startsWith(RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID));

  if (isChecked) {
    checkedClassIndices.value = checkedClassIndices.value.filter((item: any) => item !== checkValue);
  } else {
    if (categoryId === RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID) checkedClassIndices.value.push(checkValue);
    else {
      const checkedCategoryIdArr = checkedClassIndices.value.map((item) => item.split('-')[0]);

      // Shape 과 InclusionBody는 같은 Total이므로 조건 추가
      const isShapeOrInclusionBodyClicked = checkedCategoryIdArr.some((item) => item === '03' || item === '05') && (categoryId === '03' || categoryId === '05');

      if (!checkedCategoryIdArr.includes(categoryId) && !isShapeOrInclusionBodyClicked) {
        checkedClassIndices.value = [checkValue];
        if (othersCategoryItems.length > 0) {
          checkedClassIndices.value = [...checkedClassIndices.value, ...othersCategoryItems];
        }
      } else checkedClassIndices.value.push(checkValue);
    }
  }

  const optionsMap: Record<string, VisibleRbcType[]> = {
    '01': VISIBLE_SIZE_OPTIONS,
    '02': VISIBLE_CHROMIA_OPTIONS,
    '03': VISIBLE_SHAPE_OPTIONS,
    '04': VISIBLE_OTHERS_OPTIONS,
    '05': VISIBLE_INCLUSION_BODY_OPTIONS,
  };

  if (optionsMap[categoryId] && categoryId !== RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID) {
    const setCheckedClassIndices = new Set(checkedClassIndices.value);

    for (const categoryId of Object.keys(allCheckType.value)) {
      const availableOptions = categoryId === RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID || categoryId === RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID
          ? [...VISIBLE_SHAPE_OPTIONS, ...VISIBLE_INCLUSION_BODY_OPTIONS].map((item) => `${item.categoryId}-${item.classId}`)
          : optionsMap[categoryId].map((item) => `${item.categoryId}-${item.classId}`);
      const allChecked = availableOptions.every((item) => setCheckedClassIndices.has(item));
      if (allChecked) allCheckType.value[categoryId] = !allChecked;
      else allCheckType.value[categoryId] = true;
    }
  }

  updateClassInfoArr(classNm, !isChecked, categoryId, classId);
}

const rbcTotalAndReCount = async (pageNumber: any) => {
  const path = slideData.value?.img_drive_root_path !== '' && slideData.value?.img_drive_root_path ? slideData.value?.img_drive_root_path : iaRootPath.value;
  const url_new = `${path}/${slideData.value.slotId}/${DIR_NAME.RBC_CLASS}/${slideData.value.slotId}_new_${rbcImagePageNumber.value}.json`;
  const response_new = await readJsonFile({fullPath: url_new});
  const url_Old = `${path}/${slideData.value.slotId}/${DIR_NAME.RBC_CLASS}/${slideData.value.slotId}.json`;
  const response_old = await readJsonFile({fullPath: url_Old});
  if (response_new.data !== 'not file') { // 비포 , 애프터에 따른 json 파일 불러오는 부분
    const newJsonData = response_new?.data;
    for (const rbcItem of response_old.data[pageNumber].rbcClassList) {
      for (const newRbcData of newJsonData) {
        // 기존 부분 삭제 // 여기서 index 찾아서 새로 생성된 json 부분을 추가해야함
        const foundElementIndex = rbcItem.classInfo.findIndex((el: any) =>
            el.index === newRbcData.index
        );
        if (foundElementIndex !== -1) {
          rbcItem.classInfo.splice(foundElementIndex, 1);
        }
        if (rbcItem.categoryId === newRbcData.categoryId) {
          let newRbcDataObj = {
            classNm: newRbcData.classNm,
            classId: newRbcData.classId,
            posX: String(newRbcData.posX),
            posY: String(newRbcData.posY),
            width: newRbcData.width,
            height: newRbcData.height,
            index: newRbcData.index,
          }
          rbcItem.classInfo.push(newRbcDataObj);
        }
      }
    }
    rbcInfoPathAfter.value = response_old.data[pageNumber].rbcClassList;
  } else {
    if (response_old.data.length === 0 || !response_old?.data[pageNumber]) {
      rbcInfoPathAfter.value = [];
    } else {
      rbcInfoPathAfter.value = response_old?.data[pageNumber].rbcClassList;
    }
  }
  if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
    return;
  }
  let total = 0;
  let chromiaTotalval = 0;
  let shapeTotalVal = 0;
  let inclusionBody = 0;
  shapeOthersCount.value = 0;
  rbcInfoPathAfter.value.forEach(el => {
    switch (el.categoryId) {
      case RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID:
        total = el.classInfo.length;
        break;
      case RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID:
        chromiaTotalval = el.classInfo.length;
        break;
      case RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID:
        shapeTotalVal = el.classInfo.length;

        for (const classItem of el.classInfo) {
          if (!SHOWING_RBC_SHAPE_CLASS_IDS.includes(classItem.classId)) {
            shapeOthersCount.value += 1;
          }
        }
        break;
      case RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID:
        inclusionBody = el.classInfo.length;
        break;
      default:
        break;
    }
  });

  rbcTotalVal.value = Number(total);
  sizeChromiaTotal.value = Number(total);
  chromiaTotalTwo.value = chromiaTotalval;
  shapeBodyTotal.value = Number(shapeTotalVal) + Number(inclusionBody);
}

const percentageChange = (count: any, categoryId: string): any => {
  const percentage: any = ((Number(count) / calculateRbcTotalByCategoryId(categoryId)) * 100).toFixed(1);
  if (isNaN(percentage)) return '-';
  return (Number(percentage) === Math.floor(Number(percentage))) ? Math.floor(Number(percentage)).toString() : percentage;
}

const calculateRbcTotalByCategoryId = (categoryId: string) => {
  switch (categoryId) {
    case RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID:
      return Number(rbcTotalVal.value);
    case RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID:
      return Number(chromiaTotalTwo.value);
    case RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID:
    case RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID:
      return Number(shapeBodyTotal.value);
    default:
      return Number(rbcTotalVal.value);
  }
}

const classChange = async () => {
  const rbcData = JSON.parse(JSON.stringify(rbcInfoAfterVal.value));
  if (!Array.isArray(rbcData)) {
    return;
  }
  const category = rbcData.find((el: any) => el.categoryNm === selectedClass.value);
  if (category) {
    sliderValue.value = category.sensitivity || 50;
    return;
  }

  for (const el of rbcData) {
    const classInfoItem = el.classInfo.find((classInfo: any) => classInfo.classNm === selectedClass.value);
    if (classInfoItem) {
      sliderValue.value = classInfoItem.sensitivity || 50;
      return;
    }
  }
  sliderValue.value = 50;
};

const resetTimer = () => {
  if (rbcSendtimerId.value !== null) {
    clearTimeout(rbcSendtimerId.value);
  }
};


watch(rbcReDataCheck, (newVal) => {
  resetTimer();

  if (rbcSendtimerId.value !== null) {
    clearInterval(rbcSendtimerId.value);
  }

  rbcSendtimerId.value = window.setInterval(() => {
    if (newVal) {
      sensRbcReJsonSend();
    }
  }, 800);
}, {deep: true});


const sensRbcReJsonSend = async () => {
  jsonIsBool.value = true;
  await rbcInfoAfterSensitivity(selectedClass.value);

  await store.dispatch('commonModule/setCommonInfo', {rbcReData: false});
  const payload = {
    jobCmd: 'RBC_RE_CLASSIFICATION',
    sensitivity: Number(sliderValue.value),
    reqDttm: tcpReq().embedStatus.settings.reqDttm,
    reqUserId: userModuleDataGet.value.userId || '',
    className: selectedClass.value.replace(/\s/g, ''),
    slotId: slideData.value?.slotId,
    anyWay: 'true',
  };
  EventBus.publish('childEmitSocketData', payload);
}

const clickChangeSens = (classNm: string, categoryNm: string, categoryId: string, classId: any) => {
  if (classNm === 'Normal') return;

  const rbcData = JSON.parse(JSON.stringify(rbcInfoAfterVal.value));
  for (const el of rbcData) {
    for (const item of el?.classInfo) {
      if (item.classNm === classNm && item.classId === classId) {
        sliderValue.value = item.sensitivity || 50;
      }
    }
  }
  selectedClass.value = classNm;
  return;

}

const afterChange = async (newItem?: any) => {
  isBefore.value = false;
  emits('isBeforeUpdate', false);
  rbcInfoBeforeVal.value = slideData.value?.rbcInfo.rbcClass;
  rbcInfoAfterVal.value = slideData.value?.rbcInfoAfter;
  await classChange();
}

const countReAdd = async () => {
  if (!rbcInfoBeforeVal.value || !Array.isArray(rbcInfoBeforeVal.value)) {
    return;
  }

  if (!rbcInfoPathAfter.value || !Array.isArray(rbcInfoPathAfter.value)) {
    return;
  }

  for (const category of rbcInfoBeforeVal.value) {
    for (const classItem of category.classInfo) {
      let count = 0;
      for (const afterCategory of rbcInfoPathAfter.value) {
        for (const afterClassItem of afterCategory.classInfo) {
          if (afterClassItem.classId === classItem.classId && afterCategory.categoryId === category.categoryId) {
            count++;
          }
        }
      }

      classItem.originalDegree = count;
      classItem.percent = percentageChange(count, category.categoryId);
    }
  }

  maxRbcCount.value = 0;
  let totalPLT = 0;
  let malariaTotal = 0;
  for (const el of rbcInfoPathAfter.value) {
    if (el.categoryId === RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID || el.categoryId === RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) {
      maxRbcCount.value += Number(el.classInfo.length);
    }
    if (el.categoryId === RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID) {
      for (const xel of el.classInfo) {
        if (xel.classId === RBC_CODE_CLASS_ID.OTHERS.PLATELET) {
          totalPLT += 1;
        }
      }
    } else if (el.categoryId === RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) {
      for (const xel of el.classInfo) {
        if (xel.classId === RBC_CODE_CLASS_ID.INCLUSION_BODY.MALARIA) {
          malariaTotal += 1;
        }
      }
    }
  }

  pltCount.value = Math.floor((totalPLT / parseFloat(maxRbcCount.value)) * 1000);
  malariaCount.value = malariaTotal;
};


const rbcInfoAfterSensitivity = async (selectedClassVal: string) => {
  let rbcInfoAfterData = JSON.parse(JSON.stringify(rbcInfoAfterVal.value));
  for (const item of rbcInfoAfterData) {
    if (item.categoryNm === selectedClassVal) {
      item.sensitivity = sliderValue.value;
    } else {
      const findClass = item?.classInfo?.findIndex((option: any) => option.classNm === selectedClassVal);
      if (findClass !== -1 && findClass !== undefined) {
        if (item?.classInfo) {
          item.classInfo[findClass].sensitivity = sliderValue.value;
        }
      }
    }
  }

  // rbcInfoAfterVal 업데이트
  rbcInfoAfterVal.value = rbcInfoAfterData;

  const updatedItem = {
    rbcInfoAfter: rbcInfoAfterData,
  };

  const updatedRuningInfo = {...slideData.value, ...updatedItem};

  // rbc info 업데이트
  await gqlGenericUpdate(rbcUpdateMutation, {
    id: updatedRuningInfo.id,
    rbcInfoAfter: updatedRuningInfo.rbcInfoAfter,
  });
  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);

  return;
}

const toggleAll = (allCheck: boolean, categoryId: string) => {
  if (props.notCanvasClickVal) return;

  const baseClassIds =
      categoryId === RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID || categoryId === RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID
          ? [...VISIBLE_SHAPE_OPTIONS, ...VISIBLE_INCLUSION_BODY_OPTIONS] // Shape 과 Inclusion Body는 total 값을 공유
          : VISIBLE_RBC_OPTIONS.filter((item) => item.categoryId === categoryId);

  const allClassIds = checkedClassIndices.value.some((item) => item.startsWith(RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID))
      ? [...baseClassIds, ...VISIBLE_OTHERS_OPTIONS]  // Others는 total 값에서 제외
      : baseClassIds;

  const allCheckboxes = rbcInfoBeforeVal.value.flatMap((item: any) => {
    const categoryCheckboxes = item.classInfo
        .filter((classInfo: any) => showCheckbox(item.categoryId, classInfo.classId, allClassIds))
        .map((classInfo: any) => ({
          classNm: classInfo.classNm,
          categoryId: item.categoryId,
          classId: classInfo.classId
        }));

    if (categoryId === item.categoryId && item.categoryId === RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) {
      categoryCheckboxes.push({classNm: 'Malaria', categoryId: '05', classId: '03'});
    }

    return categoryCheckboxes;
  });

  if (categoryId === RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID) allCheckboxes.push({
    classNm: 'Platelet',
    categoryId: '04',
    classId: '01'
  });

  const categoryClassIdStrArr = allClassIds.map((item) => `${item.categoryId}-${item.classId}`);
  if (allCheck) {
    const hasCategoryId = checkedClassIndices.value.some((item) => item.startsWith(categoryId));
    checkedClassIndices.value = hasCategoryId
        ? [...new Set([...checkedClassIndices.value, ...categoryClassIdStrArr])]
        : categoryClassIdStrArr;
  } else {
    checkedClassIndices.value = checkedClassIndices.value.filter((item) =>
        item.startsWith(RBC_CODE_CLASS_ID.OTHERS.CATEGORY_ID) || !categoryClassIdStrArr.includes(item)
    );
  }

  for (const checkbox of allCheckboxes) {
    updateClassInfoArr(checkbox.classNm, allCheck, checkbox.categoryId, checkbox.classId);
  }

  const validCategories = ['01', '02', '03', '04', '05'];
  for (const validCategoryId of validCategories) {
    allCheckType.value[validCategoryId] = true;
  }

  if (allCheck) {
    if (categoryId === RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID || categoryId === RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID) {
      allCheckType.value[RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID] = false;
      allCheckType.value[RBC_CODE_CLASS_ID.INCLUSION_BODY.CATEGORY_ID] = false;
    } else {
      allCheckType.value[categoryId] = false;
    }
  }
}

const updateClassInfoArr = (classNm: string, isChecked: boolean, categoryId: string, classId: string) => {
  if (props.notCanvasClickVal) return;

  const classItem = {classNm, categoryId, classId};
  if (isChecked) {
    classInfoArr.value.push(classItem)
    classInfoArr.value = classInfoArr.value.filter((item) => checkedClassIndices.value.includes(`${item.categoryId}-${item.classId}`));
  } else {
    classInfoArr.value = classInfoArr.value.filter((item: any) => !(item.classNm === classNm && item.classId === classId && item.categoryId === categoryId));
  }

  emits('classInfoArrUpdate', classInfoArr.value);
};

watch(rbcReData, async (newItem, oldItem) => {
  if (newItem) {
    updataClassInfoaArr();
    return;
  }

}, {deep: true})
const updataClassInfoaArr = () => {
  emits('classInfoArrUpdateRe', classInfoArr.value);
}

const onClickDegree = async (category: any, classInfo: any, degreeIndex: any, isNormal = false) => {
  if (props.type === 'report') {
    return;
  }
  // rbcInfoAfterVal을 깊은 복사하여 수정
  const rbcInfoAfter = JSON.parse(JSON.stringify(rbcInfoAfterVal.value)).map((rbc: any) => {
    if (rbc.categoryNm === category.categoryNm) {
      rbc.classInfo = rbc.classInfo.map((item: any) => {
        if (item.classNm === classInfo.classNm) {
          if (isNormal) {
            item.degree = String(Number(item.degree) === 0 ? 1 : 0);
          } else {
            item.degree = String(degreeIndex);
          }
        }
        return item;
      });
    }
    return rbc;
  });

  // rbcInfoAfterVal 업데이트
  rbcInfoAfterVal.value = rbcInfoAfter;

  const updatedItem = {
    rbcInfoAfter: rbcInfoAfter,
  };
  const updatedRuningInfo = {...slideData.value, ...updatedItem};
  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);

  const res = await gqlGenericUpdate(rbcUpdateMutation, {
    id: updatedRuningInfo.id,
    rbcInfoAfter: updatedRuningInfo.rbcInfoAfter,
  });

  if (res && res?.data?.updateRunningInfoGQL[0].length !== 0) {
    await rbcTotalAndReCount(rbcImagePageNumber.value);
    await countReAdd();
    await getRbcDegreeData();
  }

};

const showSuccessAlert = (message: string) => {
  showAlert.value = true;
  alertType.value = 'success';
  alertMessage.value = message;
  scrollToTop();
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
  if (slideData.value?.submitState === 'Submit') {
    return;
  }
  showConfirm.value = true;
  confirmMessage.value = MESSAGES.IDS_MSG_CONFIRM_SLIDE;
}

const handleOkConfirm = () => {
  onCommit();
  showConfirm.value = false;
}

const hideConfirm = () => {
  showConfirm.value = false;
}

const onCommit = async () => {
  const localTime = moment().local();
  const updatedItem = {
    submitState: 'Submit',
    submitOfDate: localTime.format(),
    submitUserId: userModuleDataGet.value.userId,
  };

  const updatedRuningInfo = {...slideData.value, ...updatedItem}
  await gqlGenericUpdate(cbcUpdateMutation, {
    id: updatedRuningInfo.id,
    submitState: updatedRuningInfo.submitState,
    submitOfDate: updatedRuningInfo.submitOfDate,
    submitUserId: updatedRuningInfo.submitUserId,
  });

  await store.dispatch('slideDataModule/updateSlideData', updatedRuningInfo);
  slideData.value.submitState = 'Submit';
  emits('submitStateChanged', 'Submit');
}

const getRbcDegreeData = async () => {
  try {
    const result = await getRbcDegreeApi();
    const data = result.data;
    rbcDegreeStandard.value = data;
  } catch (e) {
    console.error(e);
  }
};

const reDegree = async (rbcInfoArray: any) => {
  if (projectType.value === 'bm') return;

  let totalCount = rbcTotalVal.value;
  let sizeTotal = sizeChromiaTotal.value;
  let chromiaTotal = chromiaTotalTwo.value;
  if (!Array.isArray(rbcInfoBeforeVal.value)) {
    return;
  }
  rbcInfoArray.forEach((rbcCategory: any) => {
    rbcCategory.classInfo.forEach((rbcClass: any) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.originalDegree);
          let percent = 0;

          if (degreeStandard.categoryId === RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID) { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));

          } else if (degreeStandard.categoryId === RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID) { // chromia total
            percent = Number(((degreeCount / chromiaTotal) * 100).toFixed(2));
          } else { // shape, inclusion body total
            percent = Number(((degreeCount / totalCount) * 100).toFixed(2));
          }
          if (isNaN(percent)) {
            percent = 0;
          }
          const setDegree = (value: any) => (rbcClass.degree = value);
          // 0
          if (percent < Number(degreeStandard.degree1)) {
            setDegree('0');
            return;
          }
          // 1
          else if (percent < Number(degreeStandard.degree2)) {
            setDegree('1');
            return;
          }
          // 2
          else if (percent < Number(degreeStandard.degree3)) {
            setDegree('2');
            return;
          }
          // 3
          else {
            setDegree('3');
            return;
          }
        }
      });
    });
  });

  rbcInfoArray.forEach((rbcCategory) => {
    rbcCategory.classInfo.forEach((rbcClass) => {
      if (!rbcDegreeStandard.value) {
        return;
      }
      rbcDegreeStandard.value.forEach((degreeStandard: any) => {
        if (
            degreeStandard.categoryId === rbcCategory.categoryId &&
            degreeStandard.classId === rbcClass.classId
        ) {
          const degreeCount = Number(rbcClass.originalDegree);
          let percent = 0;

          if (degreeStandard.categoryId === RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID) { // size total
            percent = Number(((degreeCount / sizeTotal) * 100).toFixed(2));
          } else if (degreeStandard.categoryId === RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID) { // chromia total
            percent = Number(((degreeCount / chromiaTotal) * 100).toFixed(2));
          } else { // shape, inclusion body total
            percent = Number(((degreeCount / totalCount) * 100).toFixed(2));
          }

          if (isNaN(percent)) percent = 0;

          const setDegree = (value: any) => (rbcClass.degree = value);

          if (percent < Number(degreeStandard.degree1)) setDegree('0');
          else if (percent < Number(degreeStandard.degree2)) setDegree('1');
          else if (percent < Number(degreeStandard.degree3)) setDegree('2');
          else setDegree('3');
        }
      });
    });
  });

  rbcInfoArray.forEach((rbcCategory) => {
    rbcCategory.classInfo.forEach((rbcClass) => {
      // size
      if (rbcCategory.categoryId === RBC_CODE_CLASS_ID.SIZE.CATEGORY_ID) {
        if (rbcClass.classId === RBC_CODE_CLASS_ID.SIZE.NORMAL) rbcCategory.classInfo[0].degree = '1';
        if ([RBC_CODE_CLASS_ID.SIZE.MACROCYTE, RBC_CODE_CLASS_ID.SIZE.MICROCTYE].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // chromia
      if (rbcCategory.categoryId === RBC_CODE_CLASS_ID.CHROMIA.CATEGORY_ID) {
        if (rbcClass.classId === RBC_CODE_CLASS_ID.CHROMIA.NORMAL) rbcCategory.classInfo[0].degree = '1';
        if ([RBC_CODE_CLASS_ID.CHROMIA.HYPERCHROMIC, RBC_CODE_CLASS_ID.CHROMIA.HYPOCHROMIC].includes(rbcClass.classId) && Number(rbcClass.degree) > 0)
          rbcCategory.classInfo[0].degree = '0';
      }

      // Poikilocytosis
      if (rbcCategory.categoryId === RBC_CODE_CLASS_ID.SHAPE.CATEGORY_ID) {
        if (rbcClass.classId === RBC_CODE_CLASS_ID.SHAPE.NORMAL) {
          // normal
          rbcCategory.classInfo[0].degree = '1'
          // poikilo
          rbcCategory.classInfo[1].degree = '0'
        }

        if (rbcClass.classId !== RBC_CODE_CLASS_ID.SHAPE.NORMAL && rbcClass.classId !== RBC_CODE_CLASS_ID.SHAPE.POLIKILOCYTOSIS) {
          var poikiloDegree = Number(rbcCategory.classInfo[1].degree)

          if (Number(rbcClass.degree) > poikiloDegree) {
            rbcCategory.classInfo[0].degree = '0'
            rbcCategory.classInfo[1].degree = rbcClass.degree
          }
        }
      }
    });
  });
};

const tooltipVisibleFunc = (type: keyof TooltipRbcClassType, visible: boolean) => {
  tooltipVisible.value[type] = visible;
}

const onImageError = () => {
  barCodeImageShowError.value = true;
}

const setBarCodeImage = (currentSelectItems: any) => {
  const path = currentSelectItems.img_drive_root_path !== '' && currentSelectItems.img_drive_root_path ? currentSelectItems.img_drive_root_path : iaRootPath.value;
  barcodeImg.value = getBarcodeDetailImageUrl('barcode_image.jpg', path, currentSelectItems.slotId, DIR_NAME.BARCODE);
  barCodeImageShowError.value = false;
}

</script>
