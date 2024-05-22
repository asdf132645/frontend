<template>
  <div class="versionContainer">
    <ul>
      <li v-for="(item, index) in projectVersion" :key="index">
        <span>{{ item.key }}</span>
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";

const projectVersion = ref<{key: string, name: string}[]>()

onMounted(() => {
  projectVersion.value = [
    {key: 'AI Version', name: process.env.AI_VERSION as string},
    {key: 'Web Frontend Version', name: process.env.WEB_FRONTEND_VERSION as string},
    {key: 'Web Backend Version', name: process.env.WEB_BACKEND_VERSION as string},
    {key: 'PB Version', name: process.env.PB_VERSION as string}
  ];
})

</script>
