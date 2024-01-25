<template>
  <header class='header'>
    <!-- 메뉴 -->
    <div class='appHeaderLeft'>
      <div class="borderLine">
        UMID
      </div>
      <router-link to="/setting">
        <font-awesome-icon :icon="['fas', 'gear']"
                           style="font-size: 1.5em;"
        />
        <p>Setting</p>
      </router-link>
      <router-link to="/analysis">
        <font-awesome-icon :icon="['fas', 'chart-pie']"
                           style="font-size: 1.5em;"
        />
        <p>Analysis</p>
      </router-link>
      <router-link to="/dataBase">
        <font-awesome-icon :icon="['fas', 'server']"
                           style="font-size: 1.5em;"
        />
        <p>Data Base</p>
      </router-link>
    </div>
    <!--  좌측메뉴  -->
    <div class="leftMenu">
      <ul>
        <li class="alarm">alarm</li>
        <li class="oliCount">oliCount</li>
        <li class="oliCount">storage use</li>
        <li class="oliCount">out</li>
        <li class="oliCount">userInfo</li>
      </ul>
    </div>
    <div>
      <ul>
        <li>date: 2024-01-22</li>
        <li>User name</li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>
