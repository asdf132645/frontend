<template>
  <div>
    <input
        id="combo-box"
        type="text"
        v-model="searchQuery"
        @input="filterOptions"
        @blur="selectOption"
        @keydown.down="highlightNext"
        @keydown.up="highlightPrev"
        @keydown.enter="chooseHighlighted"
    />
    <ul v-if="showOptions" class="options-list">
      <li
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          :class="{ highlighted: index === highlightedIndex }"
          @mousedown="chooseOption(option)"
          ref="optionItems"
      >
        {{ option.text }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import {ref, computed, defineProps, defineEmits, nextTick} from 'vue';

const props = defineProps(['options'])
const emits = defineEmits(['update:selectedOption']);
const searchQuery = ref('');
const selectedOption = ref('');
const showOptions = ref(false);
const highlightedIndex = ref(-1);

const optionItems = ref([]);

const filteredOptions = computed(() => {
  if (searchQuery.value === '') return props.options;
  return props.options.filter(option => option.text.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const filterOptions = () => {
  showOptions.value = true;
  highlightedIndex.value = -1;
};

const selectOption = () => {
  if (!showOptions.value) {
    selectedOption.value = searchQuery.value;
  }
  emits('update:selectedOption', searchQuery.value);
  showOptions.value = false;
};

const highlightNext = async () => {
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++;
    await nextTick();
    scrollToHighlighted();
  }
};

const highlightPrev = async () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
    await nextTick();
    scrollToHighlighted();
  }
};

const chooseHighlighted = () => {
  if (highlightedIndex.value >= 0) {
    chooseOption(filteredOptions.value[highlightedIndex.value]);
  }
};

const chooseOption = (option) => {
  selectedOption.value = option.text;
  searchQuery.value = option.text;
  showOptions.value = false;
};

const scrollToHighlighted = () => {
  const highlightedItem = optionItems.value[highlightedIndex.value];
  if (highlightedItem) {
    highlightedItem.scrollIntoView({ block: 'nearest' });
  }
};

</script>

<!--
상위 컴포넌트에서 사용법
<ComboBox @update:selectedOption="handleSelectedOption" :options="AnalysisList" />

const handleSelectedOption = (option: string) => {
    // 바꾸고자 하는 v-model 값
    pbsCellAnalyzingCount.value = option;
}
-->