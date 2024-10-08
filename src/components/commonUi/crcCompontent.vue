<template>
  <div class="crcDivTitle">
    {{ moTypeTextChange(moType) }}
  </div>
  <div>
    <ul>
      <li v-for="(row, rowIndex) in groupedData" :key="rowIndex" class="crcRow">
        <div v-for="(item, idx) in row" :key="idx" class="grid-item crcItemDiv">
          <p class="smallBox">
            <input
                type="text"
                v-model="item.crcTitle"
                v-if="editIndex === item.id"
            />
            <span v-else>{{ item.crcTitle }}</span>
          </p>
          <div>
            <select v-model="item.crcType" v-if="editIndex === item.id">
              <option value="select">select</option>
              <option value="text">text</option>
              <option value="percent">percent</option>
            </select>
            <div v-else>{{ item?.crcType }}</div>
          </div>
          <div>
            <input type="text" v-model="item.crcContent" v-if="editIndex === item.id">
            <div v-else>{{ item?.crcContent }}</div>
          </div>
          <div v-if="item.crcType === 'percent'" class="smallBox">
            <input
                type="text"
                v-model="item.crcPercentText"
                v-if="editIndex === item.id"
            />
            <span v-else>
              {{ item?.crcPercentText }}
            </span>
          </div>
          <div>
            <button type="button" @click="delCrcArr(rowIndex, item.id)">DEL</button>
          </div>
          <div>
            <button type="button" @click="editCrcArr(item.id)">EDIT</button>
            <button
                type="button"
                v-if="editIndex === item.id"
                @click="updateCrcArr(item.id)"
            >
              OK
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';

// Props
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  moType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['updateCrc', 'deleteCrc']);
const arrData = ref<any>([]);
// 로컬 상태
const editIndex = ref<number | null>(null);

// 8개씩 그룹화된 데이터를 계산하는 computed property
const groupedData = computed(() => {
  const rows: any[] = [];
  for (let i = 0; i < arrData.value.length; i += 8) {
    rows.push(arrData.value.slice(i, i + 8));
  }
  return rows;
});

onMounted(async () => {
  arrData.value = props.items?.filter((item) => item?.morphologyType === props.moType);
});
watch(props.items, (newArr) => {
  arrData.value = newArr?.filter((item) => item?.morphologyType === props.moType);
});

const editCrcArr = (id: number) => {
  editIndex.value = id;
};

const updateCrcArr = (id: number) => {
  const updatedItem = { ...arrData.value.find(item => item.id === id) };
  emit('updateCrc', { id, updatedItem });
  editIndex.value = null;
};

const delCrcArr = (idx: number, id: any) => {
  emit('deleteCrc', { index: idx, id });
};

const returnCrcTypeComponent = (type: string) => {
  switch (type) {
    case 'select':
      return `<select disabled><option>Select</option></select>`;
    case 'text':
      return `<input disabled type="text" placeholder="text"/>`;
    case 'percent':
      return `<input class="smallInput" disabled type="text" placeholder="percent" />`;
    default:
      return;
  }
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
</script>