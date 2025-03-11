<template>
  <font-awesome-icon
      :icon="isToggleOn ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']"
      class="base-toggle"
  />
</template>
<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps(['isToggleOn']);
</script>