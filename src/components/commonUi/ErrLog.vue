<template>
  <div class="errLogDiv">
    <!--    <p class="errLogClose">-->
    <!--      <font-awesome-icon :icon="['fas', 'circle-xmark']"/>-->
    <!--    </p>-->
    <div class="title">
      <span>Notifications <span class="errLogNum">{{ errArr.length }}</span></span>
      <span class="errLogClose" @click="closeNoti">
        <font-awesome-icon :icon="['fas', 'circle-xmark']"/>
      </span>
    </div>
    <ul>
      <li v-for="(item, idx) in errArr" :key="idx" :class="['errLogLi', item.type ? item.type.toLowerCase() : '']">
        <div>
          <div class="errLogIco">
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" v-if="item.type === 'WARN'"
                               class="warn"/>
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" v-if="item.type === 'CRIT'"
                               class="crit"/>
            <font-awesome-icon :icon="['fas', 'circle-check']" v-if="item.type === 'NOTI'"
                               class="noti"/>
          </div>
        </div>
        <div class="errLogBody">
          <div :class="['errLogTitle', item.type ? item.type.toLowerCase() : '']">
            <span>[ {{ item?.code }} ]</span>
            <span> {{ item?.name }} </span>
          </div>
          <div class="arrLogDesc">
            Description: {{ item?.desc }}
          </div>
          <div class="arrLogDesc">
            Solution: {{ item?.soln }}
          </div>
          <div class="errLogTimestamp">
            {{ item?.timestamp }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {defineProps} from "vue";

const emit = defineEmits(['closeErrLog', 'errMouseSet']);

const props = defineProps(['errArr', 'ErrLogOpen']);
document.body.addEventListener("click", handleBodyClick);

const closeNoti = () => {
  emit('closeErrLog');
  emit('errMouseSet');
}

function handleBodyClick(event: Event) {
  const target = event.target as HTMLElement;
  // 클릭한 요소 또는 그 부모 중에 .wbcImgWrap 클래스를 가지고 있지 않으면
  if (!target.closest('.iconHeaderMenu')) {
    emit('closeErrLog');
    emit('errMouseSet');
  }
}

</script>