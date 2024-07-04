<template>
  <ul class="wbcInfoDbUl">
    <template v-for="(item) in wbcInfo" :key="item.id">
      <li @click="scrollToElement(item.id)" v-show="siteCd !== '0006' && item?.title !== 'SM'">
        <div class="circle" @dragover.prevent="$emit('onDragOverCircle')" @drop="$emit('onDropCircle', item)">
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
                <div class="fileTitle">{{ replaceFileNamePrefix(image.fileName) }}
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
</template>

<script setup lang="ts">

import {computed, nextTick, onMounted, ref, watch, defineExpose} from 'vue';
import {useStore} from "vuex";
const refsArray = ref<any[]>([]);
const store = useStore();
const siteCd = computed(() => store.state.commonModule.siteCd);
const cellRef = ref<HTMLElement | null>(null);
const scrollToElement = (itemId: any) => {
  console.log('?')
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

const props = defineProps<{
  wbcInfo: Item[];
  classCompareShow: boolean;
  selectedTitle: string;
  hiddenImages: { [key: string]: boolean };
  setRef: (el: any, id: string) => void;
  replaceFileNamePrefix: (fileName: string) => string;
  getImageUrl: (fileName: string, itemId: string, itemTitle: string, prefix: string) => string;
  onDragOver: () => void;
  isBorderChanged: (image: Image) => boolean;
  isSelected: (image: Image) => boolean;
}>();
const emits = defineEmits();


const hiddenImages = ref<{ [key: string]: boolean }>({ ...props.hiddenImages });

watch(props.hiddenImages, (newVal) => {
  hiddenImages.value = { ...newVal };
});
function onDragOverCircle() {
  // 드래그 동작을 위한 빈 함수, 이벤트 리스너가 있어야 드롭이 작동함 지우지 마세요.
}

const handleImageLoad = (itemIndex: any) => {
  emits('update:cellRef', cellRef);
}



const setRef = (itemId: any) => {
  return (el: any) => {
    if (el) {
      refsArray.value[itemId] = el;
    }
  };
};

</script>
