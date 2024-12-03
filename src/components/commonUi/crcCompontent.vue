<template>
  <div class="crcDivTitle">
    {{ moTypeTextChange(moType) }}
  </div>
  <div :class="{ rbcCrcDiv: moType === 'RBC' }">
    <ul :class="{ 'rbcCrcGrid': moType === 'RBC' }">
      <div v-for="(item, idx) in arrData" :key="idx" class="grid-item crcItemDiv">
        <p>
          <input
              class="smallBox"
              type="text"
              v-model="item.crcTitle"
              v-if="editIndex === item.id"
          />
          <span class="spanTitle" v-else>{{ item.crcTitle }}</span>
        </p>
        <div>
          <select v-model="item.crcType" v-if="editIndex === item.id" class="w120">
            <option value="select">select</option>
            <option value="text">text</option>
            <option value="percent">percent</option>
          </select>
          <div v-else-if="pageName === 'set' && isMasterId(masterId)">{{ item?.crcType }}</div>
        </div>
        <div class="crcSel">
          <input type="text" v-model="item.crcContent" v-if="editIndex === item.id">
          <template v-else>
            <template v-if="item?.crcType === 'select'">
              <select v-if="pageName === 'report'" v-model="item.val" @change="changeSelect($event, item.id)" class="w120">
                <option v-for="(opItem, idx) in contentArr(item?.crcContent)" :key="idx" :value="opItem">
                  {{ opItem }}
                </option>
              </select>
              <template v-else-if="isMasterId(masterId)">
                <select @change="changeSelect($event, item.id)" class="w108">
                  <option v-for="(opItem, idx) in contentArr(item?.crcContent)" :key="idx">{{ opItem }}</option>
                </select>
              </template>
              <input v-if="item.val === 'Etc'" @input="changeEtc($event, item)" type="text"
                     placeholder="Etc Text" class="etcTextInput"/>
            </template>
            <template v-else-if="item?.crcType === 'text'">
              <input v-model="item.crcContent" :disabled="pageName !== 'report'" type="text"
                     placeholder="Enter text" v-if="pageName !== 'set'"/>
              <input v-model="item.crcContent" :disabled="pageName === 'set'"
                     v-else-if=" pageName ==='set' && isMasterId(masterId)"
                     type="text"
                     placeholder="Enter text"/>
            </template>
            <template v-else>
              <input class="smallInput" :disabled="pageName !== 'report'" v-model="item.crcContent" type="text"
                     placeholder="Enter percentage" v-if="pageName !== 'set'"/>
              <input class="smallInput" :disabled="pageName === 'set'"
                     v-else-if=" pageName ==='set' && isMasterId(masterId)"
                     v-model="item.crcContent" type="text"
                     placeholder="Enter percentage"/>
            </template>
          </template>
          <template v-if="pageName==='set'">
            <input class="smallInput" type="text" :title="lisCodeMatchingInfo" placeholder="lisCodeMatching" v-model="item.crcCode" @change="updateCrcArr(item.id)"/>
            <input class="smallInput" type="text" placeholder="lisValMatching" :title="lisValMatchingInfo" v-model="item.crcCodeMatching" @change="updateCrcArr(item.id)"/>
          </template>
        </div>
        <div v-if="item.crcType === 'percent'" class="smallBox">
          <input
              type="text"
              v-model="item.crcPercentText"
              v-if="editIndex === item.id"
              class="crcPercentInput"
          />
          <span v-else class="crcPercentText">
              {{ item?.crcPercentText }}
            </span>
        </div>

        <div v-if="pageName === 'set' && isMasterId(masterId)">
          <button type="button" class="crcBtn" style="padding: 4px 0;" v-if="editIndex !== item.id" @click="editCrcArr(item.id)">EDIT</button>
          <button type="button" class="crcBtn" style="padding: 4px 0;" v-if="editIndex === item.id" @click="updateCrcArr(item.id)">OK</button>
          <button type="button" class="crcBtn" style="padding: 4px 0;" @click="delCrcArr(idx, item.id)">DEL</button>
        </div>
      </div>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {isMasterId} from "@/common/lib/utils/validators";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  moType: {
    type: String,
    required: true,
  },
  pageName: {
    type: String,
    required: true,
  },
  masterId: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  }
});

const emit = defineEmits(['updateCrc', 'deleteCrc', 'updateSelect', 'changeCrcData']);
const arrData = ref<any>([]);
const lisCodeMatchingInfo = ref('병원 lis code 매칭 시키는 부분 - 병원에서 사용하는 타이틀로 연동해서 LIS 전송하는 부분');
const lisValMatchingInfo = ref('병원 lis 받는 Value 매칭 시키는 부분 - 병원에서 Lis 받을 때 실제 보내야하는 값으로 치환시켜주는 부분 , 구분');

// 로컬 상태
const editIndex = ref<number | null>(null);

const groupedData = computed(() => {
  const rows: any[] = [];
  for (let i = 0; i < arrData.value.length; i += 4) {
    rows.push(arrData.value.slice(i, i + 4));
  }
  return rows;
});


onMounted(async () => {
  arrData.value = props.items?.filter((item) => item?.morphologyType === props.moType);
});

watch(props, (newArr) => {
  arrData.value = newArr?.items.filter((item) => item?.morphologyType === props.moType);
}, {deep: true});

const editCrcArr = (id: number) => {
  editIndex.value = id;
};

const changeEtc = (eve: any, item: any) => {
  const nes = JSON.parse(JSON.stringify(item));
  nes.val = eve.target.value;
  emit('changeCrcData', nes);
}

const updateCrcArr = (id: number) => {
  const updatedItem = {...arrData.value.find(item => item.id === id)};
  emit('updateCrc', {id, updatedItem});
  editIndex.value = null;
};

const delCrcArr = (idx: number, id: any) => {
  emit('deleteCrc', {index: idx, id});
};

const moTypeTextChange = (txt: string) => {
  switch (txt) {
    case 'RBC':
      return 'RBC Morphology';
    case 'WBC':
      return 'WBC Morphology';
    case 'PLT':
      return 'Platelet Morphology';
  }
};

const contentArr = (content: any) => {
  return content.split(',').map((item: any) => item.trim());
}

const changeSelect = (eve: Event, id: string | number) => {
  if (props.pageName === 'report') {
    emit('updateSelect', {val: eve.target?.value, id});
  }
}
</script>
