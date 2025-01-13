<!-- Alert.vue -->
<template>
  <div v-if="isVisible" class="alert" :class="typeClass">
    <p v-if="props.type === 'error' || props.type === 'coreError'">
      <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="bigFont" />
    </p>

    <template v-if="typeof message === 'object'">
      <div class="flex-center">
        <div class="errLogIco mb10">
          <font-awesome-icon :icon="['fas', 'circle-exclamation']" v-if="message.type === 'WARN'" class="warn"/>
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" v-if="message.type === 'CRIT'" class="crit"/>
          <font-awesome-icon :icon="['fas', 'circle-check']" v-if="message.type === 'NOTI'" class="noti"/>
        </div>
        <div :class="['errLogTitle', message.type ? message.type.toLowerCase() : '']">
          <span>[{{ message?.code }}] </span>
          <span> {{ message?.name }} </span>
        </div>
      </div>

      <div class="arrLogDesc" v-show="message?.desc !== ''">
        <span v-show="message?.soln !== ''">Description:</span> {{ message?.desc }}
      </div>
      <div class="arrLogDesc" v-show="message?.soln !== ''">
        Solution: {{ message?.soln }}
      </div>
    </template>
    <template v-else>
      <p class="mb10 alertMessage">{{ message }}</p>
    </template>
    <button class="alertButton" @click="hideAlert">Close</button>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps(['isVisible', 'type', 'message']);
const typeClass = computed(() => `alert-${props.type}`);
const emit = defineEmits(['update:hideAlert']);

const hideAlert = () => {
  emit('hide');
};

</script>