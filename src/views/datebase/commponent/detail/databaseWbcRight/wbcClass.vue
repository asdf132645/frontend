<template>
  <img :src="getBarcodeImageUrl('barcode_image.jpg',pbiaRootPath, selectItems.slotId, barcodeImgDir.barcodeDirName)"/>
  <h3>WBC Classification</h3>
  {{ selectItems.id }}
  <div>
    <ul>
      <li>
        <font-awesome-icon :icon="['fas', 'comment-dots']"/>
      </li>
      <li @click="commitConfirmed">
        <font-awesome-icon :icon="['fas', 'square-check']"/>
      </li>
      <li>
        <font-awesome-icon :icon="['fas', 'upload']"/>
      </li>
    </ul>
    <p>
      <font-awesome-icon :icon="['fas', 'lock']"/>
      <!--        <font-awesome-icon :icon="['fas', 'lock-open']"/>-->
    </p>
  </div>
  <div v-for="(item, idx) in wbcInfo" :key="item.id" class="wbcClassDbDiv">
    <div v-if="idx === 0">
      <p>Class</p>
      <p>Count</p>
      <p>%</p>
    </div>
    <div class="circle">
      <p>{{ item?.name }}</p>
      <p>{{ item?.count }}</p>
      <p> {{ item?.percent }} </p>
    </div>
  </div>
  <template v-for="(nWbcItem, outerIndex) in selectItems?.wbcInfo?.nonRbcClassList" :key="outerIndex">
    <div class="categories">
      <ul class="categoryNm">
        <li class="mb1 liTitle" v-if="outerIndex === 0">non-WBC</li>
        <li>{{ getCategoryName(nWbcItem) }}</li>
      </ul>
      <ul class="classNm">
        <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
        <li>
          {{ nWbcItem?.count }}
          <span v-if="nWbcItem?.title === 'NR' || nWbcItem?.title === 'GP'"> /{{ selectItems?.wbcInfo?.maxWbcCount }} WBC</span>
        </li>
      </ul>
      <ul class="degree">
        <li class="mb1 liTitle" v-if="outerIndex === 0"></li>
        <li>-</li>
      </ul>
    </div>
  </template>
</template>

<script setup lang="ts">
import {computed, defineProps, ref, watch} from "vue";
import {getBarcodeImageUrl} from "@/common/lib/utils/conversionDataUtils";
import {barcodeImgDir} from "@/common/defines/constFile/settings";
import {WbcInfo} from "@/store/modules/analysis/wbcclassification";
import {updateRunningApi} from "@/common/api/service/runningInfo/runningInfoApi";
import {useStore} from "vuex";
import {messages} from "@/common/defines/constFile/constant";

const props = defineProps(['wbcInfo', 'selectItems', 'originalDb']);
const userModuleDataGet = computed(() => store.state.userModule);
const store = useStore();
const getCategoryName = (category: WbcInfo) => category?.name;
const pbiaRootPath = sessionStorage.getItem("pbiaRootPath");
const userId = ref('');

watch(userModuleDataGet.value, (newUserId, oldUserId) => {
  userId.value = newUserId.id;
});

const commitConfirmed = () => {
  const userConfirmed = confirm(messages.IDS_MSG_CONFIRM_SLIDE);

  if (userConfirmed) {
    onCommit()
  }else{

  }

}

const onCommit = async () => {
  const updatedRuningInfo = props.originalDb.map((item: any) => {
    if (item.id === props.selectItems.id) {
      // id가 일치하는 경우 해당 항목의 submit 값을 변경
      const updatedItem = {...item, signedState: 'Submit', signedOfDate: new Date(), signedUserId: item.id};
      // updatedItem의 내용을 변경
      updatedItem.submit = 'Submit'; // 예시로 필드를 추가하거나 변경
      return updatedItem;
    }
    return item;
  });

  console.log(updatedRuningInfo)

  try {
    const response = await updateRunningApi({userId: Number(userId.value), runingInfoDtoItems: updatedRuningInfo})
    if (response) {
      alert('--------')
    } else {
      console.error('백엔드가 디비에 저장 실패함');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


</script>