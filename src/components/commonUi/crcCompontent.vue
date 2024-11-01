<template>
  <div class="crcDivTitle">
    {{ moTypeTextChange(moType) }}
  </div>
  <div :class="{ rbcCrcDiv: moType === 'RBC' }">
    <ul>
      <li v-for="(row, rowIndex) in groupedData" :key="rowIndex" class="crcRow">
        <div v-for="(item, idx) in row" :key="idx" class="grid-item crcItemDiv">
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
            <select v-model="item.crcType" v-if="editIndex === item.id">
              <option value="select">select</option>
              <option value="text">text</option>
              <option value="percent">percent</option>
            </select>
            <div v-else-if="pageName === 'set' && masterId === 'uimd'">{{ item?.crcType }}</div>
          </div>
          <div class="crcSel">
            <input type="text" v-model="item.crcContent" v-if="editIndex === item.id">
            <div v-else>
              <div v-if="item?.crcType === 'select'">
                <select v-if="pageName === 'report'" v-model="item.val" @change="changeSelect($event, item.id)">
                  <option v-for="(opItem, idx) in contentArr(item?.crcContent)" :key="idx" :value="opItem">{{
                      opItem
                    }}
                  </option>
                </select>
                <div v-else-if="masterId === 'uimd'">
                  <select @change="changeSelect($event, item.id)">
                    <option v-for="(opItem, idx) in contentArr(item?.crcContent)" :key="idx">{{ opItem }}</option>
                  </select>
                </div>
              </div>
              <div v-else-if="item?.crcType === 'text'">
                <input v-model="item.crcContent" :disabled="pageName !== 'report'" type="text"
                       placeholder="Enter text" v-if="pageName !== 'set'"/>
                <input v-model="item.crcContent" :disabled="pageName === 'set'"
                       v-else-if=" pageName ==='set' && masterId === 'uimd'"
                       type="text"
                       placeholder="Enter text"/>
              </div>
              <div v-else>
                <input class="smallInput" :disabled="pageName !== 'report'" v-model="item.crcContent" type="text"
                       placeholder="Enter percentage" v-if="pageName !== 'set'"/>
                <input class="smallInput" :disabled="pageName === 'set'"
                       v-else-if=" pageName ==='set' && masterId === 'uimd'"
                       v-model="item.crcContent" type="text"
                       placeholder="Enter percentage"/>
              </div>
            </div>
            <div v-if="pageName==='set'">
              <input class="smallInput" type="text"
                     placeholder="code" v-model="item.crcCode" @change="updateCrcArr(item.id)"/>
            </div>
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

          <div v-if="pageName === 'set' && masterId === 'uimd'">
            <button type="button" @click="editCrcArr(item.id)">EDIT</button>
            <button
                type="button"
                v-if="editIndex === item.id"
                @click="updateCrcArr(item.id)"
            >
              OK
            </button>
          </div>
          <div v-if="pageName === 'set' && masterId === 'uimd'">
            <button type="button" @click="delCrcArr(rowIndex, item.id)">DEL</button>
          </div>

        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';

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

const emit = defineEmits(['updateCrc', 'deleteCrc', 'updateSelect']);
const arrData = ref<any>([]);
// 로컬 상태
const editIndex = ref<number | null>(null);

// 8개씩 그룹화된 데이터를 계산하는 computed property
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
