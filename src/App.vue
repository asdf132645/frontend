<!-- App.vue -->
<template>
  <div>
    <AppHeader/>
    <main class='content'>
      <router-view/>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
}
</style>
