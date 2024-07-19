<template>
  <div class="loaderBackground" v-if="loading">
    <div class="loader"></div>
    <p class="loadingText">Loading...</p>
  </div>
  <ul class="wbcInfoDbUl">
    <template v-for="(item) in wbcInfo" :key="item.id">
      <li @click="scrollToElement(item.id)" v-show="siteCd !== '0006' && item?.title !== 'SM'" @dragover.prevent="$emit('onDragOverCircle')" @drop="$emit('onDropCircle', item)">
        <div class="circle" >
          <p>{{ item?.title }}</p>
          <p>{{ item?.count }}</p>
        </div>
      </li>
    </template>
  </ul>
  <ul class="cellImgBox" v-if="!classCompareShow">
    <li v-for="(item, itemIndex) in wbcInfo" :key="item.id" :ref="setRef(item.id)">
      <div v-show="item?.count !== '0' && item?.count !== 0">
        <p class="mt1">
          <input type="checkbox" @input="$emit('allCheckChange', $event, item.title)"
                 :checked="selectedTitle === item.title">
          {{ item?.title }}
          ({{ item?.count }})
        </p>
      </div>
      <ul :class="'wbcImgWrap ' + item?.title" @dragover.prevent="onDragOver" @drop="() => $emit('onDrop', itemIndex)"
          v-show="item?.count !== '0' && item?.count !== 0">
        <template v-for="(image, imageIndex) in item.images" :key="image?.fileName">
          <li
              :class="{
              'border-changed': isBorderChanged(image),
              'selected-image': isSelected(image),
              'wbcImgWrapLi': true
            }"
              @click="() => $emit('selectImage', itemIndex, imageIndex, item)"
              @dblclick="() => $emit('openModal', image, item)"
              v-show="image && !hiddenImages[`${item.id}-${image.fileName}`]"
              @contextmenu.prevent="(event) => $emit('handleRightClick', event, image, item)"
          >
            <div style="position: relative;">
              <div v-if="image" class="titleImg" v-show="replaceFileNamePrefix(image.fileName) !== item?.title">
                <div class="fileTitle" :style="{ fontSize: image.width ? (parseInt(image.width) / 6) + 'px' : '15px' }">{{ replaceFileNamePrefix(image.fileName) }}
                  <font-awesome-icon
                      :icon="['fas', 'arrow-right']"/>
                  {{ image.title }}
                </div>
              </div>
              <img v-if="image && image.fileName" :src="getImageUrl(image.fileName, item.id, item.title, '')"
                   :width="image.width ? image.width : '150px'"
                   :height="image.height ? image.height : '150px'"
                   :style="{ filter: image.filter }"
                   @dragstart="() => $emit('onDragStart', itemIndex, imageIndex)"
                   draggable="true"
                   class="cellImg"
                   ref="cellRef"
                   @error="() => $emit('hideImage', item.id, image.fileName, item.title)"
                   v-show="image && !hiddenImages[`${item.id}-${image.fileName}`]"
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
                  v-show="image && !hiddenImages[`${firstClassObj.id}-${image.fileName}`]"
                  @contextmenu.prevent="(event) => $emit('handleRightClick', event, image, firstClassObj)"
              >
                <div style="position: relative;">
                  <div v-if="image" class="titleImg"
                       v-show="replaceFileNamePrefix(image.fileName) !== firstClassObj?.title">
                    <div class="fileTitle" :style="{ fontSize: image.width ? (parseInt(image.width) / 6) + 'px' : '15px' }">{{ replaceFileNamePrefix(image.fileName) }}
                      <font-awesome-icon
                          :icon="['fas', 'arrow-right']"/>
                      {{ image.title }}
                    </div>
                  </div>
                  <img v-if="image && image.fileName"
                       :src="getImageUrl(image.fileName, firstClassObj.id, firstClassObj.title, '')"
                       :width="image.width ? image.width : '150px'"
                       :height="image.height ? image.height : '150px'"
                       :style="{ filter: image.filter }"
                       @dragstart="() => $emit('onDragStart', firstItemIndex, imageIndex)"
                       draggable="true"
                       class="cellImg"
                       ref="cellRef"
                       @error="() => $emit('hideImage', firstClassObj.id, image.fileName, firstClassObj.title)"
                       v-show="image && !hiddenImages[`${firstClassObj.id}-${image.fileName}`]"
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
                  v-show="image && !hiddenImages[`${lastClassObj.id}-${image.fileName}`]"
                  @contextmenu.prevent="(event) => $emit('handleRightClick', event, image, lastClassObj)"
              >
                <div style="position: relative;">
                  <div v-if="image" class="titleImg"
                       v-show="replaceFileNamePrefix(image.fileName) !== lastClassObj?.title">
                    <div class="fileTitle" :style="{ fontSize: image.width ? (parseInt(image.width) / 6) + 'px' : '15px' }">{{ replaceFileNamePrefix(image.fileName) }}
                      <font-awesome-icon
                          :icon="['fas', 'arrow-right']"/>
                      {{ image.title }}
                    </div>
                  </div>
                  <img v-if="image && image.fileName"
                       :src="getImageUrl(image.fileName, lastClassObj.id, lastClassObj.title, '')"
                       :width="image.width ? image.width : '150px'"
                       :height="image.height ? image.height : '150px'"
                       :style="{ filter: image.filter }"
                       @dragstart="() => $emit('onDragStart', lastItemIndex, imageIndex)"
                       draggable="true"
                       class="cellImg"
                       ref="cellRef"
                       @error="() => $emit('hideImage', lastClassObj.id, image.fileName, lastClassObj.title)"
                       v-show="image && !hiddenImages[`${lastClassObj.id}-${image.fileName}`]"
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
const totalImages = ref(0);
const loadedImages = ref(0);
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

interface WbcInfo {
  // wbcInfo 타입 정의
  [key: string]: any;
}


const props = defineProps<{
  wbcInfo: WbcInfo;
  updateWbcInfo: (newInfo: WbcInfo) => void;
  classCompareShow: boolean;
  selectedTitle: string;
  hiddenImages: { [key: string]: boolean };
  setRef: (el: any, id: string) => void;
  replaceFileNamePrefix: (fileName: string) => string;
  getImageUrl: (fileName: string, itemId: string, itemTitle: string, prefix: string) => string;
  onDragOver: () => void;
  isBorderChanged: (image: Image) => boolean;
  isSelected: (image: Image) => boolean;
  totalCount: string;
}>();
const emits = defineEmits();

const {wbcInfo} = toRefs(props);

const hiddenImages = ref<{ [key: string]: boolean }>({...props.hiddenImages});

watch(props.hiddenImages, (newVal) => {
  hiddenImages.value = {...newVal};
  // console.log(newVal)
  loading.value = false;
});

watch(
    wbcInfo,
    (newVal) => {
      classImgChange('first', null);
      classImgChange('last', null);
    },
    {deep: true}
);
const handleImageLoad = (itemIndex: any) => {
  emits('update:cellRef', cellRef);
  classImgChange('first', null);
  classImgChange('last', null);
  classList.value = props.wbcInfo.filter((item: any) => siteCd.value !== '0006' && item?.title !== 'SM');
  if (itemIndex >= props.wbcInfo.length - 1) {
    loading.value = true;
  }else{
    loading.value = false;
  }

}
const setRef = (itemId: any) => {
  return (el: any) => {
    if (el) {
      refsArray.value[itemId] = el;
    }
  };
};

const classImgChange = (type: string, event: any) => {
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
  if (props.totalCount === '0'){
    loading.value = false
  }
};


</script>
