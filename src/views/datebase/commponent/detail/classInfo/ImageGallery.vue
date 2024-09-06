<template>
  <div class="loaderBackground" v-if="loading">
    <div class="loader"></div>
    <p class="loadingText">Loading...</p>
  </div>
  <ul class="wbcInfoDbUl">
    <template v-for="(item) in wbcInfoArrChild" :key="item.id">
      <li @click="scrollToElement(item.id)" v-if="siteCd !== '0006' && item?.title !== 'SM'"
          @dragover.prevent="$emit('onDragOverCircle')" @drop="$emit('onDropCircle', item)">
        <div class="circle">
          <p>{{ item?.title }}</p>
          <p>{{ item?.count }}</p>
        </div>
      </li>
    </template>
  </ul>
  <ul class="cellImgBox" v-if="!classCompareShow">
    <li v-for="(item, itemIndex) in wbcInfoArrChild" :key="item.id" :ref="setRef(item.id)">
      <div v-if="item?.count !== '0' && item?.count !== 0">
        <p class="mt1">
          <input type="checkbox" @input="$emit('allCheckChange', $event, item.title)"
                 :checked="selectedTitle === item.title">
          {{ item?.title }}
          ({{ item?.count }})
        </p>
      </div>
      <ul :class="'wbcImgWrap ' + item?.title" @dragover.prevent="onDragOver" @drop="() => $emit('onDrop', itemIndex)"
          v-if="item?.count !== '0' && item?.count !== 0 && item.images">
        <template v-for="(image, imageIndex) in item.images" :key="image.uniqueKey">
          <li
              :class="{
              'border-changed': isBorderChanged(image),
              'selected-image': isSelected(image),
              'wbcImgWrapLi': true
            }"
              @click="() => $emit('selectImage', itemIndex, imageIndex, item)"
              @dblclick="() => $emit('openModal', image, item)"
              v-if="image.uniqueKey && !hiddenImages[`${item.id}-${image.fileName}`]"
              @contextmenu.prevent="(event) => $emit('handleRightClick', event, image, item)"
          >
            <div style="position: relative;">
              <div v-if="image" class="titleImg" v-show="replaceFileNamePrefix(image.fileName) !== item?.title">
                <div class="fileTitle" :style="{ fontSize: imageSize ? (parseInt(imageSize) / 6) + 'px' : '15px' }">
                  {{ replaceFileNamePrefix(image.fileName) }}
                  <font-awesome-icon
                      :icon="['fas', 'arrow-right']"/>
                  {{ image.title }}
                </div>
              </div>
              <img
                  v-if="image && image.fileName && !hiddenImages[`${item.id}-${image.fileName}`]"
                  :key="image.uniqueKey"
                  :src="getImageUrl(image.fileName, item.id, item.title, '')"
                  :width="imageSize"
                  :height="imageSize"
                  :style="{ filter: image.filter }"
                  @dragstart="() => $emit('onDragStart', itemIndex, imageIndex)"
                  draggable="true"
                  class="cellImg"
                  ref="cellRef"
                  @error="() => $emit('hideImage', item.id, image.fileName, item.title)"
                  @load="handleImageLoad(itemIndex)"
              />
              <div v-if="image && image.coordinates" class="center-point" :style="image.coordinates"></div>
            </div>
          </li>
        </template>
      </ul>
    </li>
  </ul>
  <!--  클래스 단일 비교 부분 -->
  <div v-else class="divCompare">
    <div class="divCompareChild">
<!--      ssss-->
      <select v-model="firstClass" @change="classImgChange('first' , $event)">
        <option v-for="option in classList" :key="option.id" :value="option.name">{{ option?.name }}</option>
      </select>
      <ul class="cellImgBox">
        <li>
          <div>
            <p class="mt1">
              <input type="checkbox" @input="$emit('allCheckChange', $event, firstClassObj?.title)"
                     :checked="selectedTitle === firstClassObj?.title">
              <label>
                {{ firstClassObj?.title }}
                ({{ firstClassObj?.count }})
              </label>

            </p>
          </div>
          <ul :class="'wbcImgWrap ' + firstClassObj?.title" @dragover.prevent="onDragOver"
              @drop="() => $emit('onDrop', firstItemIndex)">
            <template v-for="(image, imageIndex) in firstClassObj.images" :key="image?.fileName">
              <li
                  :class="{
              'border-changed': isBorderChanged(image),
              'selected-image': isSelected(image),
              'wbcImgWrapLi': true
            }"
                  @click="() => $emit('selectImage', firstItemIndex, imageIndex, firstClassObj)"
                  @dblclick="() => $emit('openModal', image, firstClassObj)"
                  v-if="image && !hiddenImages[`${firstClassObj.id}-${image.fileName}`]"
                  @contextmenu.prevent="(event) => $emit('handleRightClick', event, image, firstClassObj)"
              >
                <div style="position: relative;">
                  <div v-if="image" class="titleImg"
                       v-show="replaceFileNamePrefix(image.fileName) !== firstClassObj?.title">
                    <div class="fileTitle"
                         :style="{ fontSize: imageSize ? (parseInt(imageSize) / 6) + 'px' : '15px' }">
                      {{ replaceFileNamePrefix(image.fileName) }}
                      <font-awesome-icon
                          :icon="['fas', 'arrow-right']"/>
                      {{ image.title }}
                    </div>
                  </div>
                  <img
                      v-if="image && image.fileName && !hiddenImages[`${firstClassObj.id}-${image.fileName}`]"
                      :src="getImageUrl(image.fileName, firstClassObj.id, firstClassObj.title, '')"
                      :width="imageSize"
                      :height="imageSize"
                      :style="{ filter: image.filter }"
                      @dragstart="() => $emit('onDragStart', firstItemIndex, imageIndex)"
                      draggable="true"
                      class="cellImg"
                      ref="cellRef"
                      @error="() => $emit('hideImage', firstClassObj.id, image.fileName, firstClassObj.title)"
                      @load="handleImageLoad(firstItemIndex)"
                  />
                  <div v-if="image && image.coordinates" class="center-point" :style="image.coordinates"></div>
                </div>
              </li>
            </template>
          </ul>
        </li>
      </ul>
    </div>
    <div class="divCompareChild">
      <select v-model="lastClass" @change="classImgChange('last', $event)">
        <option v-for="option in classList" :key="option.id" :value="option.name">{{ option?.name }}</option>
      </select>
      <ul class="cellImgBox">
        <li>
          <div>
            <p class="mt1">
              <input type="checkbox" @input="$emit('allCheckChange', $event, lastClassObj?.title)"
                     :checked="selectedTitle === lastClassObj?.title">
              {{ lastClassObj?.title }}
              ({{ lastClassObj?.count }})
            </p>
          </div>
          <ul :class="'wbcImgWrap ' + lastClassObj?.title" @dragover.prevent="onDragOver"
              @drop="() => $emit('onDrop', lastItemIndex)">
            <template v-for="(image, imageIndex) in lastClassObj.images" :key="image?.fileName">
              <li
                  :class="{
              'border-changed': isBorderChanged(image),
              'selected-image': isSelected(image),
              'wbcImgWrapLi': true
            }"
                  @click="() => $emit('selectImage', lastItemIndex, imageIndex, lastClassObj)"
                  @dblclick="() => $emit('openModal', image, lastClassObj)"
                  v-if="image && !hiddenImages[`${lastClassObj.id}-${image.fileName}`]"
                  @contextmenu.prevent="(event) => $emit('handleRightClick', event, image, lastClassObj)"
              >
                <div style="position: relative;">
                  <div v-if="image" class="titleImg"
                       v-show="replaceFileNamePrefix(image.fileName) !== lastClassObj?.title">
                    <div class="fileTitle"
                         :style="{ fontSize: imageSize ? (parseInt(imageSize) / 6) + 'px' : '15px' }">
                      {{ replaceFileNamePrefix(image.fileName) }}
                      <font-awesome-icon
                          :icon="['fas', 'arrow-right']"/>
                      {{ image.title }}
                    </div>
                  </div>
                  <img
                      v-if="image && image.fileName && !hiddenImages[`${lastClassObj.id}-${image.fileName}`]"
                      :src="getImageUrl(image.fileName, lastClassObj.id, lastClassObj.title, '')"
                       :width="imageSize"
                       :height="imageSize"
                       :style="{ filter: image.filter }"
                       @dragstart="() => $emit('onDragStart', lastItemIndex, imageIndex)"
                       draggable="true"
                       class="cellImg"
                       ref="cellRef"
                       @error="() => $emit('hideImage', lastClassObj.id, image.fileName, lastClassObj.title)"
                       @load="handleImageLoad(lastItemIndex)"
                  />
                  <div v-if="image && image.coordinates" class="center-point" :style="image.coordinates"></div>
                </div>
              </li>
            </template>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">

import {computed, ref, watch, defineExpose, toRefs, onMounted, nextTick} from 'vue';
import {useStore} from "vuex";
import {defaultBmClassList, defaultWbcClassList} from "@/store/modules/analysis/wbcclassification";
import {removeDuplicatesById} from "@/common/lib/utils/removeDuplicateIds";
import {debounce} from "lodash";

const refsArray = ref<any[]>([]);
const store = useStore();
const siteCd = computed(() => store.state.commonModule.siteCd);
const cellRef = ref<HTMLElement | null>(null);
const firstClass = ref('Neutrophil-Segmented');
const firstClassObj = ref<any>({});
const lastClass = ref('Neutrophil-Band');
const firstItemIndex = ref(0);
const lastItemIndex = ref(0);
const lastClassObj = ref<any>({});
const classList = ref<any>([]);
const previousFirstClass = ref('Neutrophil-Segmented');
const previousLastClass = ref('Neutrophil-Band');
const loading = ref(true);
const scrollToElement = (itemId: any) => {
  const targetElement = refsArray.value[itemId];
  if (targetElement) {
    targetElement.scrollIntoView({behavior: 'smooth'});
  }
};
defineExpose({
  scrollToElement,
});

interface Image {
  fileName: string;
  width?: string;
  height?: string;
  filter?: string;
  coordinates?: string;
  title?: string;
}

interface Item {
  id: string;
  title: string;
  count: string | number;
  images: Image[];
}

type WbcInfo = Item[];


const props = defineProps<{
  wbcInfo: WbcInfo;
  updateWbcInfo: (newInfo: any) => void;
  classCompareShow: boolean;
  selectedTitle: string;
  hiddenImages: { [key: string]: boolean };
  setRef: (el: any, id: string) => void;
  replaceFileNamePrefix: (fileName: string) => string;
  onDragOver: () => void;
  isBorderChanged: (image: Image) => boolean;
  isSelected: (image: Image) => boolean;
  totalCount: string;
  wbcReset: boolean;
  slotId: any;
  iaRootPath: any;
  projectTypeReturn: any;
  projectType: any;
  apiBaseUrl: any;
  wbcInfoRefresh: any;
  imageSize: number;
}>();
const emits = defineEmits();
const wbcInfoArrChild = ref<any>([]);
const {wbcInfo, wbcReset} = toRefs(props);

const hiddenImages = ref<{ [key: string]: boolean }>({...props.hiddenImages});

watch(props.hiddenImages, (newVal) => {
  hiddenImages.value = {...newVal};
  loading.value = false;
});

const debouncedUpdate = debounce(async (newVal) => {
  const timestamp = Date.now();
  loading.value = false;
  wbcInfoArrChild.value = [];
  wbcInfoArrChild.value = removeDuplicatesById(newVal).map((item: any, index: number) => ({
    ...item,
    uniqueKey: `item_${index}_${timestamp}`,
    images: item.images.map((image: any, imgIndex: number) => ({
      ...image,
      uniqueKey: `image_${index}_${imgIndex}_${timestamp}`
    })) || []
  }));
  if (wbcInfoArrChild.value?.some((el: any) => el.title === 'NE')) {
    firstClass.value = previousFirstClass.value = 'Metamyelocyte';
    lastClass.value = previousLastClass.value = 'Myelocyte';
  }
  await classImgChange('first', null);
  await classImgChange('last', null);
}, 10); //디바운스 적용

watch(wbcInfo, debouncedUpdate, { deep: true });



watch(
    () => props.wbcReset,
    async (newVal) => {
      if (newVal) {
        if (props.wbcInfoRefresh) {
          return;
        }
        wbcInfoArrChild.value = [];
        await nextTick(); // DOM 업데이트 후 실행
        wbcInfoArrChild.value = props.wbcInfo.map((item, index) => ({
          ...item,
          uniqueKey: `item_${index}_${Date.now()}`,
          images: item.images.map((image, imgIndex) => ({
            ...image,
            uniqueKey: `image_${index}_${imgIndex}_${Date.now()}`
          })) || []
        }));

        await nextTick(); // 상태 업데이트 후 강제 렌더링
        classImgChange('first', null);
        classImgChange('last', null);
      }
    }
);

const handleImageLoad = (itemIndex: any) => {
  emits('update:cellRef', cellRef);
  classImgChange('first', null);
  classImgChange('last', null);
  classList.value = props.wbcInfo.filter((item: any) => siteCd.value !== '0006' && item?.title !== 'SM');

  if (itemIndex === props.wbcInfo.length - 1 || itemIndex < props.wbcInfo.length - 1) {
    loading.value = false;
  } else {
    loading.value = true;
  }

}

function getImageUrl(imageName: any, id: string, title: string, highImg: string, findAfterArr?: boolean): string {
  // 이미지 정보가 없다면 빈 문자열 반환
  if (!wbcInfo.value || wbcInfo.value.length === 0) {
    return "";
  }
  const slotId = props.slotId || '';
  const folderPath = `${props.iaRootPath}/${slotId}/${props.projectTypeReturn}/${id}_${title}`;
  let url = '';

  // 타임스탬프 추가

  if (highImg === 'getImageRealTime' || props.projectType === 'pb') {
    url = `${props.apiBaseUrl}/images/getImageRealTime?folder=${folderPath}&imageName=${imageName}`;
  } else {
    url = `${props.apiBaseUrl}/images?folder=${folderPath}&imageName=${imageName}`;
  }


  return url;
}

const setRef = (itemId: any) => {
  return (el: any) => {
    if (el) {
      refsArray.value[itemId] = el;
    }
  };
};

const classImgChange = async (type: string, event: any) => {
  const updateClassValue = (currentClass: any, previousClass: any, classObj: any, itemIndex: any) => {
    if (firstClass.value === lastClass.value) {
      currentClass.value = previousClass.value;
      return;
    } else {
      previousClass.value = event ? event.target.value : currentClass.value;
    }
    classObj.value = props.wbcInfo.find((option: any) => option?.name === currentClass.value);
    itemIndex.value = props.wbcInfo.findIndex((option: any) => option?.name === currentClass.value);
  };

  if (type === 'first') {
    updateClassValue(firstClass, previousFirstClass, firstClassObj, firstItemIndex);
  } else {
    updateClassValue(lastClass, previousLastClass, lastClassObj, lastItemIndex);
  }
  if (props.totalCount === '0') {
    loading.value = false
  }
};


</script>
