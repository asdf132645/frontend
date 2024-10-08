<template>
  <div>
    {{ moTypeTextChange(moType) }}
  </div>
  <div class="grid-container">
    <div v-for="(item, idx) in arrData" :key="idx" class="grid-item">
      <p>
        <input
            type="text"
            v-model="item.crcTitle"
            :disabled="editIndex !== idx"
        />
      </p>
      <div v-if="idx === editIndex">
        <select v-model="item.crcType">
          <option value="select">select</option>
          <option value="text">text</option>
          <option value="percent">percent</option>
        </select>
      </div>
      <div v-else>
        <div v-html="returnCrcTypeComponent(item?.crcType)"></div>
      </div>
      <div v-if="item.crcType === 'percent'">
        <input
            type="text"
            v-model="item.crcPercentText"
            :disabled="editIndex !== idx"
        />
      </div>
      <div>
        <button type="button" @click="delCrcArr(idx, item.id)">del</button>
      </div>
      <div>
        <button type="button" @click="editCrcArr(idx)">edit</button>
        <button
            type="button"
            v-if="editIndex === idx"
            @click="updateCrcArr(idx)"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';

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
      return `<input disabled type="text" placeholder="percent" />`;
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